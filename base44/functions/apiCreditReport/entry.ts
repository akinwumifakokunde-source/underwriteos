import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { genId, apiError, apiSuccess, readBody, resolveOrganization, requireScope, audit } from "../../shared/utils.ts";
import { getProvider, scoreBand } from "../../shared/creditProviders.ts";
import { getCredentials } from "../../shared/providerCredentials.ts";

// POST /v1/applications/{id}/credit-report — ingests raw credit bureau data,
// normalizes it through the provider abstraction into a CreditProfile.
export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const body = await readBody(req);
    const ctx = await resolveOrganization(base44, body);
    const { organization_id, actor, actor_type } = ctx;
    const action = body.action || "submit";
    if (action === "submit") requireScope(ctx, "applications:write");

    if (action === "submit") {
      const { application_id, provider, raw_data, mode, search_reference } = body;
      if (!application_id) return apiError("VALIDATION_ERROR", "application_id is required.", 400);
      const apps = await base44.asServiceRole.entities.Application.filter({ id: application_id, organization_id }, "-created_date", 1);
      if (apps.length === 0) return apiError("APPLICATION_NOT_FOUND", `Application ${application_id} was not found.`, 404);
      const app = apps[0];

      // Open banking / automated bureau pull: when no raw_data is supplied (or
      // mode === "auto"), the report is fetched automatically from the bureau
      // instead of being manually uploaded by the caller.
      const autoFetch = mode === "auto" || !raw_data;
      const providerName = (provider || (autoFetch ? "experian" : "other")).toLowerCase();
      const creditProvider = getProvider(providerName);

      let reportData = raw_data;
      let fetchMode = "manual";
      let dataSource = "manual";
      let fetchReference: string | null = null;
      if (autoFetch) {
        const borrowers = await base44.asServiceRole.entities.Borrower.filter({ id: app.borrower_id, organization_id }, "-created_date", 1);
        const borrower = borrowers[0] || null;
        fetchReference = search_reference || app.id;
        const credentials = await getCredentials(base44, organization_id, providerName, ctx.environment);
        reportData = await creditProvider.fetch(fetchReference, { currency: app.loan_currency, borrower, credentials });
        fetchMode = "auto";
        dataSource = credentials ? "live" : "mock";
      }

      const normalized = creditProvider.normalize(reportData || {}, app.loan_currency);
      if (!normalized.score_band && normalized.credit_score != null) normalized.score_band = scoreBand(normalized.credit_score);

      const report = await base44.asServiceRole.entities.CreditReport.create({
        organization_id,
        application_id,
        provider: providerName,
        report_reference: genId("CRR"),
        raw_data: reportData || {},
        status: "normalized"
      });

      // Replace any existing credit profile for this application
      const existing = await base44.asServiceRole.entities.CreditProfile.filter({ application_id, organization_id }, "-created_date", 1);
      if (existing.length > 0) await base44.asServiceRole.entities.CreditProfile.delete(existing[0].id);

      const profile = await base44.asServiceRole.entities.CreditProfile.create({
        organization_id,
        application_id,
        credit_report_id: report.id,
        provider: providerName,
        credit_score: normalized.credit_score,
        score_band: normalized.score_band,
        active_accounts: normalized.active_accounts,
        closed_accounts: normalized.closed_accounts,
        delinquent_accounts: normalized.delinquent_accounts,
        defaults: normalized.defaults,
        outstanding_balance: normalized.outstanding_balance,
        credit_utilisation: normalized.credit_utilisation,
        recent_enquiries: normalized.recent_enquiries,
        repayment_history: normalized.repayment_history,
        currency: normalized.currency
      });

      await base44.asServiceRole.entities.Application.update(app.id, { status: "data_collection" });
      await audit(base44, organization_id, "credit_report.ingested", { application_id, actor, actor_type, endpoint: "POST /v1/applications/{id}/credit-report", details: { provider: providerName, credit_score: normalized.credit_score, fetch_mode: fetchMode, data_source: dataSource, ...(fetchReference ? { reference: fetchReference } : {}) } });

      return apiSuccess({ credit_report_id: report.id, credit_profile: profile, provider: providerName, fetch_mode: fetchMode, data_source: dataSource }, 201);
    }

    return apiError("UNKNOWN_ACTION", `Action '${action}' is not supported.`, 400);
  } catch (e) {
    if (e.status) return apiError(e.code || "ERROR", e.message, e.status);
    return apiError("INTERNAL_ERROR", e.message, 500);
  }
}