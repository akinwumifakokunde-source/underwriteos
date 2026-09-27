import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { apiError, apiSuccess, readBody, resolveOrganization, requireScope } from "../../shared/utils.ts";

// Audit log explorer — read-only query surface over the AuditEvent trail.
// Supports filtering by event, actor, actor_type, application_id, free-text
// search over event/endpoint/actor, plus facet counts for the filter chips.
//
// list   — paginated, filtered audit events with facets
export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const body = await readBody(req);
    const ctx = await resolveOrganization(base44, body);
    const { organization_id } = ctx;
    const action = body.action || "list";
    requireScope(ctx, "audit:read");

    if (action === "list") {
      const limit = Math.min(Number(body.limit) || 100, 500);
      const filter: any = { organization_id };
      if (body.event) filter.event = body.event;
      if (body.actor) filter.actor = body.actor;
      if (body.actor_type) filter.actor_type = body.actor_type;
      if (body.application_id) filter.application_id = body.application_id;

      const events = await base44.asServiceRole.entities.AuditEvent.filter(filter, "-created_date", limit);

      // Free-text search across event / endpoint / actor (case-insensitive).
      let results = events;
      const q = (body.search || "").toString().trim().toLowerCase();
      if (q) {
        results = events.filter((e: any) =>
          String(e.event || "").toLowerCase().includes(q) ||
          String(e.endpoint || "").toLowerCase().includes(q) ||
          String(e.actor || "").toLowerCase().includes(q) ||
          String(e.application_id || "").toLowerCase().includes(q) ||
          JSON.stringify(e.details || {}).toLowerCase().includes(q)
        );
      }

      // Facets for the filter UI.
      const eventCounts: Record<string, number> = {};
      const actorTypeCounts: Record<string, number> = { user: 0, api_key: 0, system: 0 };
      const actorCounts: Record<string, number> = {};
      for (const e of events) {
        eventCounts[e.event] = (eventCounts[e.event] || 0) + 1;
        if (e.actor_type) actorTypeCounts[e.actor_type] = (actorTypeCounts[e.actor_type] || 0) + 1;
        if (e.actor) actorCounts[e.actor] = (actorCounts[e.actor] || 0) + 1;
      }

      return apiSuccess({
        events: results,
        total: results.length,
        facets: {
          events: Object.entries(eventCounts).map(([event, count]) => ({ event, count })).sort((a, b) => b.count - a.count),
          actor_types: Object.entries(actorTypeCounts).filter(([, c]) => c > 0).map(([actor_type, count]) => ({ actor_type, count })),
          actors: Object.entries(actorCounts).map(([actor, count]) => ({ actor, count })).sort((a, b) => b.count - a.count),
        },
      }, 200);
    }

    return apiError("UNKNOWN_ACTION", `Action '${action}' is not supported. Use list.`, 400);
  } catch (e) {
    if (e.status) return apiError(e.code || "ERROR", e.message, e.status);
    return apiError("INTERNAL_ERROR", e.message, 500);
  }
}