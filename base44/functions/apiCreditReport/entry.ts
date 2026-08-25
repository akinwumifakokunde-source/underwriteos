import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { genId, apiError, apiSuccess, readBody, resolveOrganization, audit } from "../../shared/utils.ts";
import { getProvider, scoreBand } from "../../shared/creditProviders.ts";

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const body = await readBody(req);
    const { organization_id, actor, actor_type } = await resolveOrganization(base44);
    const action = body.action || "submit";

    if (action === "submit") {
      const { application_id, provider, raw_data } = body;
      if (!application_id) return apiError("VALIDATION_ERROR", "application_id is required.", 400);
      const apps = await base44.asServiceRole.entities.Application.filter({ id: application_id, organization_id }, "-created_date", 1);
      if (apps.length === 0) return apiError("APPLICATION_NOT_FOUND", `Application ${application_id} was not found.`, 404);
      const app = apps[0];

      const providerName = (provider || "mock").toLowerCase();
      const creditProvider = getProvider(providerName);
      const normalized = creditProvider.normalize(raw_data || {}, app.loan_currency);
      if (!normalized.score_band) normalized.score_band = scoreBand(normalized.credit_score);

      const report = await base44.asServiceRole.entities.CreditReport.create({
        organization_id,
        application_id,
        provider: providerName,
        report_reference: genId("CRR"),
        raw_data: raw_data || {},
        status: "normalized"
      });

      const profile = await base44.asServiceRole.entities.CreditProfile.create({
        organization_id,
        application_id,
        credit_report_id: report.id,
        provider: providerName,
        credit_score: normalized.credit_score,
        score_band: normalized.score_band,
        active_accounts: normalized.active_accounts,
        delinquent_accounts: normalized.delinquent_accounts,
        defaults: normalized.defaults,
        outstanding_balance: normalized.outstanding_balance,
        credit_utilisation: normalized.credit_utilisation,
        credit_enquiries: normalized.credit_enquiries,
        repayment_history_score: normalized.repayment_history_score,
        currency: normalized.currency
      });

      await base44.asServiceRole.entities.Application.update(app.id, { status: "data_collection" });
      await audit(base44, organization_id, "credit_report.ingested", { application_id, actor, actor_type, endpoint: "POST /v1/applications/{id}/credit-report", details: { provider: providerName, credit_score: normalized.credit_score } });

      return apiSuccess({ credit_report_id: report.id, credit_profile: profile, provider: providerName }, 201);
    }

    return apiError("UNKNOWN_ACTION", `Action '${action}' is not supported.`, 400);
  } catch (e) {
    if (e.status) return apiError(e.code || "ERROR", e.message, e.status);
    return apiError("INTERNAL_ERROR", e.message, 500);
  }
}