import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { apiError, apiSuccess, readBody, resolveOrganization } from "../../shared/utils.ts";

// Developer dashboard. Answers the five core questions:
//   1. Is my API working?      -> api_status
//   2. What API key am I using? -> active_keys (masked)
//   3. How many requests?       -> requests.total / last_30_days
//   4. What runs completed?     -> applications (completed/failed + recent)
//   5. What decisions returned? -> decisions (counts + recent)
// Dashboard-only (session auth). Action: overview
export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const body = await readBody(req);
    const ctx = await resolveOrganization(base44, body);
    const { organization_id } = ctx;
    const action = body.action || "overview";

    if (action !== "overview") return apiError("UNKNOWN_ACTION", `Action '${action}' is not supported. Use overview.`, 400);

    const [events, keys, apps, decisions] = await Promise.all([
      base44.asServiceRole.entities.AuditEvent.filter({ organization_id }, "-created_date", 500),
      base44.asServiceRole.entities.APIKey.filter({ organization_id, status: "active" }, "-created_date", 10),
      base44.asServiceRole.entities.Application.filter({ organization_id }, "-created_date", 50),
      base44.asServiceRole.entities.UnderwritingDecision.filter({ organization_id }, "-created_date", 50)
    ]);

    // Requests over last 30 days
    const days: Record<string, number> = {};
    for (const e of events) {
      const day = (e.created_date || "").slice(0, 10);
      if (day) days[day] = (days[day] || 0) + 1;
    }
    const daily: { date: string; count: number }[] = [];
    const now = new Date();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 86400000);
      const key = d.toISOString().slice(0, 10);
      daily.push({ date: key, count: days[key] || 0 });
    }
    const last30 = daily.reduce((a, b) => a + b.count, 0);

    // Application status breakdown
    const appStatus = { draft: 0, data_collection: 0, analyzing: 0, underwriting: 0, completed: 0, failed: 0 };
    for (const a of apps) {
      const st = (a.status || "draft") as keyof typeof appStatus;
      if (st in appStatus) appStatus[st]++;
    }

    // Decision breakdown
    const decisionCounts = { APPROVE: 0, REVIEW: 0, DECLINE: 0 };
    for (const d of decisions) {
      const dec = d.decision as keyof typeof decisionCounts;
      if (dec in decisionCounts) decisionCounts[dec]++;
    }
    const todayStr = new Date().toISOString().slice(0, 10);
    const decided_today = decisions.filter((d: any) => (d.decision_timestamp || d.created_date || "").slice(0, 10) === todayStr).length;

    const active_keys = keys.map((k: any) => ({
      id: k.id, name: k.name, prefix: k.prefix, environment: k.environment,
      status: k.status, last_used: k.last_used, created_at: k.created_date
    }));

    const recent_applications = apps.slice(0, 6).map((a: any) => ({
      id: a.id, application_number: a.application_number, status: a.status,
      decision: a.decision, risk_score: a.risk_score, loan_amount: a.loan_amount,
      loan_currency: a.loan_currency, created_at: a.created_date
    }));

    const recent_decisions = decisions.slice(0, 6).map((d: any) => ({
      id: d.id, application_id: d.application_id, decision: d.decision,
      decision_source: d.decision_source, risk_score: d.risk_score,
      policy_id: d.policy_id, policy_version: d.policy_version,
      decision_timestamp: d.decision_timestamp, created_at: d.created_date
    }));

    return apiSuccess({
      api_status: "operational",
      environment: ctx.environment,
      active_keys,
      requests: { total: events.length, last_30_days: last30, daily },
      applications: { total: apps.length, ...appStatus, recent: recent_applications },
      decisions: { total: decisions.length, ...decisionCounts, decided_today, recent: recent_decisions }
    }, 200);
  } catch (e) {
    if (e.status) return apiError(e.code || "ERROR", e.message, e.status);
    return apiError("INTERNAL_ERROR", e.message, 500);
  }
}