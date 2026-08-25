import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { genId, apiError, apiSuccess, readBody, resolveOrganization, audit } from "../../shared/utils.ts";
import { normalizeTransactions, buildFinancialProfile } from "../../shared/normalization.ts";

// POST /v1/applications/{id}/bank-statement — ingests raw bank statement data,
// normalizes transactions, and builds the canonical FinancialProfile.
export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const body = await readBody(req);
    const { organization_id, actor, actor_type } = await resolveOrganization(base44);
    const action = body.action || "submit";

    if (action === "submit") {
      const { application_id, transactions, period_start, period_end, account_number_masked, raw_data } = body;
      if (!application_id) return apiError("VALIDATION_ERROR", "application_id is required.", 400);
      const apps = await base44.asServiceRole.entities.Application.filter({ id: application_id, organization_id }, "-created_date", 1);
      if (apps.length === 0) return apiError("APPLICATION_NOT_FOUND", `Application ${application_id} was not found.`, 404);
      const app = apps[0];

      const source = transactions || raw_data?.transactions || raw_data || [];
      const normalizedTx = normalizeTransactions(source, app.loan_currency);

      const statement = await base44.asServiceRole.entities.BankStatement.create({
        organization_id,
        application_id,
        statement_reference: genId("BST"),
        account_number_masked: account_number_masked || null,
        period_start: period_start || null,
        period_end: period_end || null,
        raw_data: raw_data || { transactions: source },
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

      // Load borrower for employment context in the canonical profile
      const borrowers = await base44.asServiceRole.entities.Borrower.filter({ id: app.borrower_id, organization_id }, "-created_date", 1);
      const borrower = borrowers[0] || null;

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
      await audit(base44, organization_id, "bank_statement.ingested", { application_id, actor, actor_type, endpoint: "POST /v1/applications/{id}/bank-statement", details: { transaction_count: txRecords.length } });

      return apiSuccess({ bank_statement_id: statement.id, financial_profile: profile, transaction_count: txRecords.length }, 201);
    }

    return apiError("UNKNOWN_ACTION", `Action '${action}' is not supported.`, 400);
  } catch (e) {
    if (e.status) return apiError(e.code || "ERROR", e.message, e.status);
    return apiError("INTERNAL_ERROR", e.message, 500);
  }
}