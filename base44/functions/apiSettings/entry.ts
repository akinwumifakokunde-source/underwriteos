import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { apiError, apiSuccess, readBody, resolveOrganization, audit } from "../../shared/utils.ts";

// Organization settings. Dashboard-only (session auth).
// Actions: get | update
export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const body = await readBody(req);
    const ctx = await resolveOrganization(base44, body);
    const { organization_id, actor, actor_type } = ctx;
    const action = body.action || "get";

    if (action === "get") {
      const orgs = await base44.asServiceRole.entities.Organization.filter({ id: organization_id }, "-created_date", 1);
      if (orgs.length === 0) return apiError("NOT_FOUND", "Organization not found.", 404);
      const o = orgs[0];
      return apiSuccess({ organization: { id: o.id, name: o.name, slug: o.slug, plan: o.plan, status: o.status, settings: o.settings, created_at: o.created_date } }, 200);
    }

    if (action === "update") {
      const orgs = await base44.asServiceRole.entities.Organization.filter({ id: organization_id }, "-created_date", 1);
      if (orgs.length === 0) return apiError("NOT_FOUND", "Organization not found.", 404);
      const o = orgs[0];
      const settings = { ...(o.settings || {}), ...(body.settings || {}) };
      const update: any = { settings };
      if (body.name) update.name = body.name;
      await base44.asServiceRole.entities.Organization.update(organization_id, update);
      await audit(base44, organization_id, "organization.settings_updated", { actor, actor_type, endpoint: "POST /v1/settings" });
      return apiSuccess({ updated: true }, 200);
    }

    return apiError("UNKNOWN_ACTION", `Action '${action}' is not supported. Use get|update.`, 400);
  } catch (e) {
    if (e.status) return apiError(e.code || "ERROR", e.message, e.status);
    return apiError("INTERNAL_ERROR", e.message, 500);
  }
}