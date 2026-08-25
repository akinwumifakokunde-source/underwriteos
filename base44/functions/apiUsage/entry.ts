import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { apiError, apiSuccess, readBody, resolveOrganization, requireScope } from "../../shared/utils.ts";

// Usage analytics + activity log, derived from AuditEvent records.
// Actions: overview | logs
export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const body = await readBody(req);
    const ctx = await resolveOrganization(base44, body);
    const { organization_id } = ctx;
    const action = body.action || "overview";

    if (action === "overview") {
      requireScope(ctx, "audit:read");
      const events = await base44.asServiceRole.entities.AuditEvent.filter({ organization_id }, "-created_date", 500);
      const days: Record<string, number> = {};
      const byEndpoint: Record<string, number> = {};
      const byEvent: Record<string, number> = {};
      for (const e of events) {
        const day = (e.created_date || "").slice(0, 10);
        if (day) days[day] = (days[day] || 0) + 1;
        if (e.endpoint) byEndpoint[e.endpoint] = (byEndpoint[e.endpoint] || 0) + 1;
        if (e.event) byEvent[e.event] = (byEvent[e.event] || 0) + 1;
      }
      const daily: { date: string; count: number }[] = [];
      const now = new Date();
      for (let i = 29; i >= 0; i--) {
        const d = new Date(now.getTime() - i * 86400000);
        const key = d.toISOString().slice(0, 10);
        daily.push({ date: key, count: days[key] || 0 });
      }
      const by_endpoint = Object.entries(byEndpoint).map(([endpoint, count]) => ({ endpoint, count })).sort((a, b) => b.count - a.count).slice(0, 8);
      const by_event = Object.entries(byEvent).map(([event, count]) => ({ event, count })).sort((a, b) => b.count - a.count).slice(0, 8);
      return apiSuccess({ total: events.length, daily, by_endpoint, by_event }, 200);
    }

    if (action === "logs") {
      requireScope(ctx, "audit:read");
      const limit = Math.min(Number(body.limit) || 50, 200);
      const events = await base44.asServiceRole.entities.AuditEvent.filter({ organization_id }, "-created_date", limit);
      const logs = events.map((e: any) => ({
        id: e.id, event: e.event, endpoint: e.endpoint, actor: e.actor, actor_type: e.actor_type,
        application_id: e.application_id, details: e.details, created_at: e.created_date
      }));
      return apiSuccess({ logs }, 200);
    }

    return apiError("UNKNOWN_ACTION", `Action '${action}' is not supported. Use overview|logs.`, 400);
  } catch (e) {
    if (e.status) return apiError(e.code || "ERROR", e.message, e.status);
    return apiError("INTERNAL_ERROR", e.message, 500);
  }
}