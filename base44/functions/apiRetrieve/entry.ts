import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { apiError, apiSuccess, readBody, resolveOrganization, requireScope } from "../../shared/utils.ts";

// Retrieval endpoints. All responses use stable, versioned schemas and never
// expose internal database implementation details beyond the public model.
// Supported actions: financial-profile, credit-profile, risk, evidence,
// recommendation, decision, audit, job.
export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const body = await readBody(req);
    const ctx = await resolveOrganization(base44);
    const { organization_id } = ctx;
    const action = body.action;
    const scopeFor = (a: string) => {
      if (a === "financial-profile" || a === "credit-profile") return "profiles:read";
      if (a === "risk" || a === "evidence") return "risk:read";
      if (a === "recommendation" || a === "decision") return "decisions:read";
      if (a === "audit") return "audit:read";
      return "applications:read";
    };
    requireScope(ctx, scopeFor(action));

    const requireAppId = () => {
      const { application_id } = body;
      if (!application_id) return null;
      return application_id;
    };

    if (action === "financial-profile") {
      const application_id = requireAppId();
      if (!application_id) return apiError("VALIDATION_ERROR", "application_id is required.", 400);
      const profiles = await base44.asServiceRole.entities.FinancialProfile.filter({ application_id, organization_id }, "-created_date", 1);
      if (profiles.length === 0) return apiError("PROFILE_NOT_FOUND", `No financial profile found for application ${application_id}.`, 404);
      return apiSuccess({ application_id, financial_profile: profiles[0] }, 200);
    }

    if (action === "credit-profile") {
      const application_id = requireAppId();
      if (!application_id) return apiError("VALIDATION_ERROR", "application_id is required.", 400);
      const profiles = await base44.asServiceRole.entities.CreditProfile.filter({ application_id, organization_id }, "-created_date", 1);
      if (profiles.length === 0) return apiError("PROFILE_NOT_FOUND", `No credit profile found for application ${application_id}.`, 404);
      return apiSuccess({ application_id, credit_profile: profiles[0] }, 200);
    }

    if (action === "risk") {
      const application_id = requireAppId();
      if (!application_id) return apiError("VALIDATION_ERROR", "application_id is required.", 400);
      const signals = await base44.asServiceRole.entities.RiskSignal.filter({ application_id, organization_id }, "-created_date", 200);
      return apiSuccess({ application_id, signals }, 200);
    }

    if (action === "evidence") {
      const application_id = requireAppId();
      if (!application_id) return apiError("VALIDATION_ERROR", "application_id is required.", 400);
      const evidence = await base44.asServiceRole.entities.Evidence.filter({ application_id, organization_id }, "-created_date", 200);
      return apiSuccess({ application_id, evidence }, 200);
    }

    if (action === "recommendation") {
      const application_id = requireAppId();
      if (!application_id) return apiError("VALIDATION_ERROR", "application_id is required.", 400);
      const recs = await base44.asServiceRole.entities.UnderwritingRecommendation.filter({ application_id, organization_id }, "-created_date", 1);
      if (recs.length === 0) return apiError("RECOMMENDATION_NOT_FOUND", `No recommendation found for application ${application_id}.`, 404);
      return apiSuccess({ application_id, recommendation: recs[0] }, 200);
    }

    if (action === "decision") {
      const application_id = requireAppId();
      if (!application_id) return apiError("VALIDATION_ERROR", "application_id is required.", 400);
      const decisions = await base44.asServiceRole.entities.UnderwritingDecision.filter({ application_id, organization_id }, "-created_date", 1);
      if (decisions.length === 0) return apiError("DECISION_NOT_FOUND", `No decision found for application ${application_id}.`, 404);
      return apiSuccess({ application_id, decision: decisions[0] }, 200);
    }

    if (action === "audit") {
      const application_id = requireAppId();
      if (!application_id) return apiError("VALIDATION_ERROR", "application_id is required.", 400);
      const events = await base44.asServiceRole.entities.AuditEvent.filter({ application_id, organization_id }, "-created_date", 200);
      return apiSuccess({ application_id, audit_events: events }, 200);
    }

    if (action === "job") {
      const { job_id } = body;
      if (!job_id) return apiError("VALIDATION_ERROR", "job_id is required.", 400);
      const jobs = await base44.asServiceRole.entities.Job.filter({ id: job_id, organization_id }, "-created_date", 1);
      if (jobs.length === 0) return apiError("JOB_NOT_FOUND", `Job ${job_id} was not found.`, 404);
      const j = jobs[0];
      return apiSuccess({ job_id: j.id, status: j.status, type: j.type, result: j.result, error: j.error }, 200);
    }

    return apiError("UNKNOWN_ACTION", `Action '${action}' is not supported. Use financial-profile|credit-profile|risk|evidence|recommendation|decision|audit|job.`, 400);
  } catch (e) {
    if (e.status) return apiError(e.code || "ERROR", e.message, e.status);
    return apiError("INTERNAL_ERROR", e.message, 500);
  }
}