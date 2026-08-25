import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { genId, apiError, apiSuccess, readBody, resolveOrganization, requireScope, audit } from "../../shared/utils.ts";
import { normalizeTransactions, buildFinancialProfile } from "../../shared/normalization.ts";
import { getOpenBankingProvider } from "../../shared/openBanking.ts";

// POST /v1/applications/{id}/bank-statement — ingests raw bank statement data,
// normalizes transactions, and builds the canonical FinancialProfile.
export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const body = await readBody(req);
    const ctx = await resolveOrganization(base44, body);
    const { organization_id, actor, actor_type } = ctx;
    const action = body.action || "submit";
    if (action === "submit") requireScope(ctx, "applications:write");

    if (action === "submit") {
      const { application_id, transactions, period_start, period_end, account_number_masked, raw_data, mode, provider, consent_reference } = body;
      if (!application_id) return apiError("VALIDATION_ERROR", "application_id is required.", 400);
      const apps = await base44.asServiceRole.entities.Application.filter({ id: application_id, organization_id }, "-created_date", 1);
      if (apps.length === 0) return apiError("APPLICATION_NOT_FOUND", `Application ${application_id} was not found.`, 404);
      const app = apps[0];

      const borrowers = await base44.asServiceRole.entities.Borrower.filter({ id: app.borrower_id, organization_id }, "-created_date", 1);
      const borrower = borrowers[0] || null;

      // Open banking: when no transactions/raw_data are supplied (or mode ===
      // "auto"), the statement is fetched automatically from the connected bank
      // via the open banking provider instead of being manually uploaded.
      const manualSource = transactions || raw_data?.transactions || (Array.isArray(raw_data) ? raw_data : null);
      const autoFetch = mode === "auto" || (!manualSource && !raw_data);

      let source = manualSource;
      let accountMasked = account_number_masked;
      let pStart = period_start;
      let pEnd = period_end;
      let fetchMode = "manual";
      let obProviderName: string | null = null;
      let fetchReference: string | null = null;

      if (autoFetch) {
        const obProvider = getOpenBankingProvider((provider || "truelayer").toLowerCase());
        obProviderName = obProvider.name;
        fetchReference = consent_reference || app.id;
        const result = await obProvider.fetch(fetchReference, { currency: app.loan_currency, borrower });
        source = result.transactions;
        accountMasked = accountMasked || result.account.account_number_masked;
        pStart = pStart || result.account.period_start;
        pEnd = pEnd || result.account.period_end;
        fetchMode = "auto";
      }

      const normalizedTx = normalizeTransactions(source, app.loan_currency);

      const storedRaw = raw_data || { transactions: source, ...(fetchMode === "auto" ? { _source: "open_banking", provider: obProviderName, reference: fetchReference } : {}) };

      const statement = await base44.asServiceRole.entities.BankStatement.create({
        organization_id,
        application_id,
        statement_reference: genId("BST"),
        account_number_masked: accountMasked || null,
        period_start: pStart || null,
        period_end: pEnd || null,
        raw_data: storedRaw,
        status: "normalized",
        currency: app.loan_currency
      });

      // Persist normalized transactions (bounded to 500)
      const txRecords = normalizedTx.slice(0, 500).map(t => ({
        organization_id,
        application_id,
        bank_statement_id: statement.id,
        date: t.date,
        description: t.description,
        amount: t.amount,
        currency: t.currency,
        direction: t.amount >= 0 ? "credit" : "debit",
        category: t.category,
        recurring: t.recurring
      }));
      if (txRecords.length > 0) await base44.asServiceRole.entities.Transaction.bulkCreate(txRecords);

      const financial = buildFinancialProfile(normalizedTx, app.loan_amount, app.loan_currency, borrower);

      // Replace any existing financial profile for this application
      const existing = await base44.asServiceRole.entities.FinancialProfile.filter({ application_id, organization_id }, "-created_date", 1);
      if (existing.length > 0) await base44.asServiceRole.entities.FinancialProfile.delete(existing[0].id);

      const profile = await base44.asServiceRole.entities.FinancialProfile.create({
        organization_id,
        application_id,
        ...financial
      });

      await base44.asServiceRole.entities.Application.update(app.id, { status: "data_collection" });
      await audit(base44, organization_id, "bank_statement.ingested", { application_id, actor, actor_type, endpoint: "POST /v1/applications/{id}/bank-statement", details: { transaction_count: txRecords.length, fetch_mode: fetchMode, ...(obProviderName ? { open_banking_provider: obProviderName } : {}) } });

      return apiSuccess({ bank_statement_id: statement.id, financial_profile: profile, transaction_count: txRecords.length, fetch_mode: fetchMode, ...(obProviderName ? { open_banking_provider: obProviderName } : {}) }, 201);
    }

    return apiError("UNKNOWN_ACTION", `Action '${action}' is not supported.`, 400);
  } catch (e) {
    if (e.status) return apiError(e.code || "ERROR", e.message, e.status);
    return apiError("INTERNAL_ERROR", e.message, 500);
  }
}