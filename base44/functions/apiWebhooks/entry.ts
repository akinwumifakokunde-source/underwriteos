import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { apiError, apiSuccess, readBody, resolveOrganization, requireScope, audit, genId, sha256 } from "../../shared/utils.ts";

// Outbound webhook management. The secret is returned in full only at create time.
// Actions: list | create | update | delete | test
export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const body = await readBody(req);
    const ctx = await resolveOrganization(base44, body);
    const { organization_id, actor, actor_type } = ctx;
    const action = body.action || "list";

    if (action === "list") {
      requireScope(ctx, "webhooks:read");
      const hooks = await base44.asServiceRole.entities.Webhook.filter({ organization_id }, "-created_date", 50);
      return apiSuccess({ webhooks: hooks.map((h: any) => ({
        id: h.id, url: h.url, events: h.events, status: h.status,
        last_delivery_status: h.last_delivery_status, created_at: h.created_date,
        secret_masked: h.secret ? `••••${String(h.secret).slice(-4)}` : null
      })) }, 200);
    }

    if (action === "create") {
      requireScope(ctx, "webhooks:write");
      const { url, events } = body;
      if (!url || !Array.isArray(events) || events.length === 0) return apiError("VALIDATION_ERROR", "url and events are required.", 400);
      const secret = "whsec_" + genId("k", 28).slice(2);
      const hook = await base44.asServiceRole.entities.Webhook.create({ organization_id, url, events, secret, status: "active" });
      await audit(base44, organization_id, "webhook.created", { actor, actor_type, endpoint: "POST /v1/webhooks", details: { webhook_id: hook.id, url } });
      return apiSuccess({ webhook: { id: hook.id, url, events, status: "active", secret } }, 201);
    }

    if (action === "update") {
      requireScope(ctx, "webhooks:write");
      const { id, url, events, status } = body;
      if (!id) return apiError("VALIDATION_ERROR", "id is required.", 400);
      const hooks = await base44.asServiceRole.entities.Webhook.filter({ id, organization_id }, "-created_date", 1);
      if (hooks.length === 0) return apiError("NOT_FOUND", "Webhook not found.", 404);
      const update: any = {};
      if (url) update.url = url;
      if (Array.isArray(events)) update.events = events;
      if (status) update.status = status;
      await base44.asServiceRole.entities.Webhook.update(id, update);
      return apiSuccess({ updated: true, id }, 200);
    }

    if (action === "delete") {
      requireScope(ctx, "webhooks:write");
      const { id } = body;
      if (!id) return apiError("VALIDATION_ERROR", "id is required.", 400);
      const hooks = await base44.asServiceRole.entities.Webhook.filter({ id, organization_id }, "-created_date", 1);
      if (hooks.length === 0) return apiError("NOT_FOUND", "Webhook not found.", 404);
      await base44.asServiceRole.entities.Webhook.delete(id);
      await audit(base44, organization_id, "webhook.deleted", { actor, actor_type, endpoint: "POST /v1/webhooks", details: { id } });
      return apiSuccess({ deleted: true, id }, 200);
    }

    if (action === "test") {
      requireScope(ctx, "webhooks:write");
      const { id } = body;
      if (!id) return apiError("VALIDATION_ERROR", "id is required.", 400);
      const hooks = await base44.asServiceRole.entities.Webhook.filter({ id, organization_id }, "-created_date", 1);
      if (hooks.length === 0) return apiError("NOT_FOUND", "Webhook not found.", 404);
      const hook = hooks[0];
      const payload = JSON.stringify({ event: "webhook.test", created_at: new Date().toISOString(), data: { webhook_id: hook.id } });
      const sig = await sha256(hook.secret + payload);
      let result: any = { status: "failed" };
      try {
        const res = await fetch(hook.url, { method: "POST", headers: { "Content-Type": "application/json", "X-CreditDecide-Signature": sig }, body: payload });
        result = { status: res.ok ? "ok" : "failed", http_status: res.status };
        await base44.asServiceRole.entities.Webhook.update(id, { last_delivery_status: `${res.ok ? "ok" : "failed"}:${res.status}` });
      } catch (e: any) {
        result = { status: "failed", error: e.message };
        await base44.asServiceRole.entities.Webhook.update(id, { last_delivery_status: "failed:error" });
      }
      return apiSuccess({ test: result }, 200);
    }

    return apiError("UNKNOWN_ACTION", `Action '${action}' is not supported. Use list|create|update|delete|test.`, 400);
  } catch (e) {
    if (e.status) return apiError(e.code || "ERROR", e.message, e.status);
    return apiError("INTERNAL_ERROR", e.message, 500);
  }
}