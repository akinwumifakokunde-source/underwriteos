import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { apiError, apiSuccess, readBody, resolveOrganization, requireScope, audit } from "../../shared/utils.ts";

// Outcome tracking & model monitoring — closes the feedback loop.
//
// record  — POST the observed outcome of an underwritten loan. Snapshots the
//           predicted probability of default from the latest decision so the
//           monitoring loop can later compare predicted vs actual default.
// monitor — compute calibration: predicted-PD buckets vs actual default rate,
//           plus portfolio summary (counts by decision, approval rate, observed
//           default rate). This is what proves the model is calibrated.
// list    — list recorded outcomes for the org.
export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const body = await readBody(req);
    const ctx = await resolveOrganization(base44, body);
    const { organization_id, actor, actor_type } = ctx;
    const action = body.action || "monitor";

    if (action === "record") requireScope(ctx, "outcomes:write");
    if (action === "monitor" || action === "list") requireScope(ctx, "outcomes:read");

    if (action === "record") {
      const { application_id, status, days_past_due, observed_at, note } = body;
      if (!application_id) return apiError("VALIDATION_ERROR", "application_id is required.", 400);
      const valid = ["active", "repaid", "late", "defaulted"];
      if (!status || !valid.includes(status)) return apiError("VALIDATION_ERROR", `status must be one of ${valid.join(", ")}.`, 400);

      const apps = await base44.asServiceRole.entities.Application.filter({ id: application_id, organization_id }, "-created_date", 1);
      if (apps.length === 0) return apiError("APPLICATION_NOT_FOUND", `Application ${application_id} was not found.`, 404);
      const app = apps[0];

      // Snapshot predicted PD/risk from the latest decision (fallback to recommendation).
      const [decisions, recs] = await Promise.all([
        base44.asServiceRole.entities.UnderwritingDecision.filter({ application_id, organization_id }, "-created_date", 1),
        base44.asServiceRole.entities.UnderwritingRecommendation.filter({ application_id, organization_id }, "-created_date", 1),
      ]);
      const decision = decisions[0] || null;
      const recommendation = recs[0] || null;
      const predicted_pd = decision?.probability_of_default ?? recommendation?.probability_of_default ?? null;
      const predicted_risk_score = decision?.risk_score ?? recommendation?.risk_score ?? app.risk_score ?? null;
      const decision_value = decision?.decision ?? (app.decision && app.decision !== "null" ? app.decision : null);

      const dpd = Number(days_past_due) || 0;
      const bad = status === "defaulted" || (status === "late" && dpd >= 30);

      // One observed outcome per application — replace any existing.
      const existing = await base44.asServiceRole.entities.LoanOutcome.filter({ application_id, organization_id }, "-created_date", 1);
      if (existing.length > 0) await base44.asServiceRole.entities.LoanOutcome.delete(existing[0].id);

      const outcome = await base44.asServiceRole.entities.LoanOutcome.create({
        organization_id,
        application_id,
        borrower_id: app.borrower_id,
        status,
        bad,
        days_past_due: dpd,
        predicted_pd,
        predicted_risk_score,
        decision: decision_value,
        loan_amount: app.loan_amount,
        loan_currency: app.loan_currency,
        observed_at: observed_at || new Date().toISOString(),
        note: note || null,
      });

      await audit(base44, organization_id, "outcome.recorded", { application_id, actor, actor_type, endpoint: "POST /v1/outcomes", details: { status, bad, predicted_pd } });
      return apiSuccess({ outcome }, 201);
    }

    if (action === "list") {
      const outcomes = await base44.asServiceRole.entities.LoanOutcome.filter({ organization_id }, "-observed_at", 200);
      return apiSuccess({ outcomes }, 200);
    }

    if (action === "monitor") {
      const [outcomes, apps] = await Promise.all([
        base44.asServiceRole.entities.LoanOutcome.filter({ organization_id }, "-observed_at", 500),
        base44.asServiceRole.entities.Application.filter({ organization_id }, "-created_date", 500),
      ]);

      const BUCKETS = [
        { id: "0–10%", lo: 0, hi: 0.1 },
        { id: "10–20%", lo: 0.1, hi: 0.2 },
        { id: "20–30%", lo: 0.2, hi: 0.3 },
        { id: "30–40%", lo: 0.3, hi: 0.4 },
        { id: "40–50%", lo: 0.4, hi: 0.5 },
        { id: "50%+", lo: 0.5, hi: Infinity },
      ];
      const calibration = BUCKETS.map((b) => {
        const inBucket = outcomes.filter((o: any) => o.predicted_pd != null && o.predicted_pd >= b.lo && o.predicted_pd < b.hi);
        const total = inBucket.length;
        const bad = inBucket.filter((o: any) => o.bad).length;
        const avg_pd = total > 0 ? inBucket.reduce((s: number, o: any) => s + (o.predicted_pd || 0), 0) / total : 0;
        return { bucket: b.id, count: total, actual_default_rate: total > 0 ? bad / total : 0, avg_predicted_pd: avg_pd };
      });

      const observed = outcomes.length;
      const badCount = outcomes.filter((o: any) => o.bad).length;
      const decided = apps.filter((a: any) => a.decision && a.decision !== "null");
      const approved = apps.filter((a: any) => a.decision === "APPROVE");
      const summary = {
        applications: apps.length,
        decided: decided.length,
        approved: approved.length,
        approval_rate: decided.length > 0 ? approved.length / decided.length : 0,
        observed_outcomes: observed,
        observed_bad: badCount,
        observed_default_rate: observed > 0 ? badCount / observed : 0,
        // Mean predicted PD across observed outcomes vs actual default rate — a single calibration headline.
        mean_predicted_pd: observed > 0 ? outcomes.reduce((s: number, o: any) => s + (o.predicted_pd || 0), 0) / observed : 0,
      };

      return apiSuccess({ summary, calibration }, 200);
    }

    return apiError("UNKNOWN_ACTION", `Action '${action}' is not supported. Use record|monitor|list.`, 400);
  } catch (e) {
    if (e.status) return apiError(e.code || "ERROR", e.message, e.status);
    return apiError("INTERNAL_ERROR", e.message, 500);
  }
}