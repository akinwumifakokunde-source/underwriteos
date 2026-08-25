import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { apiError, apiSuccess, readBody, resolveOrganization, audit } from "../../shared/utils.ts";

// Organization member management. Dashboard-only (session auth).
// Actions: list | invite | update_role | remove
export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const body = await readBody(req);
    const ctx = await resolveOrganization(base44, body);
    const { organization_id, actor, actor_type } = ctx;
    const action = body.action || "list";

    if (action === "list") {
      const users = await base44.asServiceRole.entities.User.filter({ organization_id }, "created_date", 100);
      const members = users.map((u: any) => ({ id: u.id, full_name: u.full_name, email: u.email, role: u.role, created_at: u.created_date }));
      return apiSuccess({ members }, 200);
    }

    if (action === "invite") {
      const { email, role } = body;
      if (!email) return apiError("VALIDATION_ERROR", "email is required.", 400);
      const inviteRole = role === "admin" ? "admin" : "user";
      try {
        await base44.users.inviteUser(email, inviteRole);
      } catch (e: any) {
        return apiError("INVITE_FAILED", e?.message || "Failed to send invite.", 500);
      }
      await audit(base44, organization_id, "member.invited", { actor, actor_type, endpoint: "POST /v1/members", details: { email, role: inviteRole } });
      return apiSuccess({ invited: true, email, role: inviteRole }, 201);
    }

    if (action === "update_role") {
      const { user_id, role } = body;
      if (!user_id) return apiError("VALIDATION_ERROR", "user_id is required.", 400);
      const inviteRole = role === "admin" ? "admin" : "user";
      await base44.asServiceRole.entities.User.update(user_id, { role: inviteRole });
      await audit(base44, organization_id, "member.role_updated", { actor, actor_type, endpoint: "POST /v1/members", details: { user_id, role: inviteRole } });
      return apiSuccess({ updated: true, user_id, role: inviteRole }, 200);
    }

    if (action === "remove") {
      const { user_id } = body;
      if (!user_id) return apiError("VALIDATION_ERROR", "user_id is required.", 400);
      if (user_id === actor) return apiError("VALIDATION_ERROR", "You cannot remove yourself.", 400);
      await base44.asServiceRole.entities.User.update(user_id, { organization_id: "" });
      await audit(base44, organization_id, "member.removed", { actor, actor_type, endpoint: "POST /v1/members", details: { user_id } });
      return apiSuccess({ removed: true, user_id }, 200);
    }

    return apiError("UNKNOWN_ACTION", `Action '${action}' is not supported. Use list|invite|update_role|remove.`, 400);
  } catch (e) {
    if (e.status) return apiError(e.code || "ERROR", e.message, e.status);
    return apiError("INTERNAL_ERROR", e.message, 500);
  }
}