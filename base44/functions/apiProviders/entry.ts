import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { apiError, apiSuccess, readBody, resolveOrganization, requireScope, audit } from "../../shared/utils.ts";
import { PROVIDER_TOKEN_PATHS, exchangeClientCredentials } from "../../shared/providerCredentials.ts";

// Provider credential management. Each organization stores its own bureau /
// open-banking keys here during setup; ingestion functions read them to make
// real outbound calls. The client_secret is never returned in full.
//
// Actions: list | save | delete | test
export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const body = await readBody(req);
    const ctx = await resolveOrganization(base44, body);
    const { organization_id, actor, actor_type, environment } = ctx;
    const action = body.action || "list";

    if (action === "list") {
      requireScope(ctx, "providers:read");
      const creds = await base44.asServiceRole.entities.ProviderCredential.filter({ organization_id }, "-created_date", 100);
      const masked = creds.map((c: any) => ({
        id: c.id,
        provider: c.provider,
        provider_type: c.provider_type,
        environment: c.environment,
        base_url: c.base_url,
        status: c.status,
        client_id: c.client_id,
        client_secret_masked: c.client_secret ? `••••${String(c.client_secret).slice(-4)}` : null,
        last_tested: c.last_tested,
        last_test_status: c.last_test_status,
        last_test_error: c.last_test_error,
        created_date: c.created_date
      }));
      return apiSuccess({ credentials: masked }, 200);
    }

    if (action === "save") {
      requireScope(ctx, "providers:write");
      const { provider, provider_type, env, client_id, client_secret, base_url, status } = body;
      if (!provider || !provider_type || !client_id || !client_secret) {
        return apiError("VALIDATION_ERROR", "provider, provider_type, client_id and client_secret are required.", 400);
      }
      const targetEnv = env || environment;
      const existing = await base44.asServiceRole.entities.ProviderCredential.filter(
        { organization_id, provider: provider.toLowerCase(), environment: targetEnv }, "-created_date", 1
      );
      const payload: any = {
        organization_id,
        provider: provider.toLowerCase(),
        provider_type,
        environment: targetEnv,
        client_id,
        client_secret,
        base_url: base_url || null,
        status: status || "active",
        last_test_status: "untested",
        last_test_error: null
      };
      let saved: any;
      if (existing.length > 0) {
        saved = await base44.asServiceRole.entities.ProviderCredential.update(existing[0].id, payload);
      } else {
        saved = await base44.asServiceRole.entities.ProviderCredential.create(payload);
      }
      await audit(base44, organization_id, "provider_credential.saved", { actor, actor_type, endpoint: "POST /v1/providers", details: { provider: saved.provider, provider_type, environment: targetEnv } });
      return apiSuccess({ credential: { id: saved.id, provider: saved.provider, provider_type: saved.provider_type, environment: saved.environment, status: saved.status } }, 201);
    }

    if (action === "delete") {
      requireScope(ctx, "providers:write");
      const { id } = body;
      if (!id) return apiError("VALIDATION_ERROR", "id is required.", 400);
      const creds = await base44.asServiceRole.entities.ProviderCredential.filter({ id, organization_id }, "-created_date", 1);
      if (creds.length === 0) return apiError("NOT_FOUND", "Credential not found.", 404);
      await base44.asServiceRole.entities.ProviderCredential.delete(id);
      await audit(base44, organization_id, "provider_credential.deleted", { actor, actor_type, endpoint: "POST /v1/providers", details: { id, provider: creds[0].provider } });
      return apiSuccess({ deleted: true, id }, 200);
    }

    if (action === "test") {
      requireScope(ctx, "providers:write");
      const { provider, env } = body;
      const targetEnv = env || environment;
      const creds = await base44.asServiceRole.entities.ProviderCredential.filter(
        { organization_id, provider: (provider || "").toLowerCase(), environment: targetEnv, status: "active" }, "-created_date", 1
      );
      if (creds.length === 0) return apiError("NOT_FOUND", "No active credential found for this provider.", 404);
      const c = creds[0];
      const tokenPath = PROVIDER_TOKEN_PATHS[c.provider];
      if (!tokenPath) return apiError("PROVIDER_CONFIG_ERROR", `No token endpoint configured for provider '${c.provider}'.`, 400);
      try {
        await exchangeClientCredentials(c.base_url, tokenPath, c.client_id, c.client_secret);
        await base44.asServiceRole.entities.ProviderCredential.update(c.id, {
          last_tested: new Date().toISOString(),
          last_test_status: "ok",
          last_test_error: null
        });
        return apiSuccess({ provider: c.provider, environment: c.environment, status: "ok" }, 200);
      } catch (e: any) {
        await base44.asServiceRole.entities.ProviderCredential.update(c.id, {
          last_tested: new Date().toISOString(),
          last_test_status: "failed",
          last_test_error: e?.message || "Unknown error"
        });
        return apiSuccess({ provider: c.provider, environment: c.environment, status: "failed", error: e?.message || "Unknown error" }, 200);
      }
    }

    return apiError("UNKNOWN_ACTION", `Action '${action}' is not supported. Use list|save|delete|test.`, 400);
  } catch (e) {
    if (e.status) return apiError(e.code || "ERROR", e.message, e.status);
    return apiError("INTERNAL_ERROR", e.message, 500);
  }
}