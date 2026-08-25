import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { apiError, apiSuccess, readBody, resolveOrganization, sha256, generateApiKey, DEFAULT_SANDBOX_SCOPES } from "../../shared/utils.ts";

// API key management. Dashboard-only operations (session auth).
// The full key is returned ONLY at create/rotate time; only the hash is persisted.
// Actions: create | list | rotate | revoke
export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const body = await readBody(req);
    const ctx = await resolveOrganization(base44, body);
    const action = body.action || "list";

    if (action === "create") {
      const environment = body.environment === "production" ? "production" : "sandbox";
      const name = body.name || (environment === "production" ? "Production key" : "Sandbox key");
      const scopes = body.scopes && Array.isArray(body.scopes) ? body.scopes : DEFAULT_SANDBOX_SCOPES;
      const { fullKey, prefix } = generateApiKey(environment);
      const keyHash = await sha256(fullKey);
      const record = await base44.asServiceRole.entities.APIKey.create({
        organization_id: ctx.organization_id,
        name,
        prefix,
        key_hash: keyHash,
        environment,
        scopes,
        status: "active",
        last_used: null,
        expires_at: null,
        rotated_at: null
      });
      // Full key shown only this once
      return apiSuccess({ api_key_id: record.id, name, environment, prefix, scopes, status: "active", full_key: fullKey, created_at: record.created_date }, 201);
    }

    if (action === "list") {
      const keys = await base44.asServiceRole.entities.APIKey.filter({ organization_id: ctx.organization_id }, "-created_date", 50);
      const masked = keys.map(k => ({
        id: k.id,
        name: k.name,
        prefix: k.prefix,
        environment: k.environment,
        scopes: k.scopes || [],
        status: k.status,
        created_at: k.created_date,
        last_used: k.last_used,
        rotated_at: k.rotated_at
      }));
      return apiSuccess({ api_keys: masked }, 200);
    }

    if (action === "rotate") {
      const { api_key_id } = body;
      if (!api_key_id) return apiError("VALIDATION_ERROR", "api_key_id is required.", 400);
      const keys = await base44.asServiceRole.entities.APIKey.filter({ id: api_key_id, organization_id: ctx.organization_id }, "-created_date", 1);
      if (keys.length === 0) return apiError("API_KEY_NOT_FOUND", "API key not found.", 404);
      const old = keys[0];
      // Revoke the old key
      await base44.asServiceRole.entities.APIKey.update(api_key_id, { status: "revoked", rotated_at: new Date().toISOString() });
      // Create a replacement with the same environment + scopes
      const { fullKey, prefix } = generateApiKey(old.environment || "sandbox");
      const keyHash = await sha256(fullKey);
      const record = await base44.asServiceRole.entities.APIKey.create({
        organization_id: ctx.organization_id,
        name: old.name,
        prefix,
        key_hash: keyHash,
        environment: old.environment || "sandbox",
        scopes: old.scopes || DEFAULT_SANDBOX_SCOPES,
        status: "active",
        last_used: null,
        expires_at: null,
        rotated_at: new Date().toISOString()
      });
      return apiSuccess({ api_key_id: record.id, name: record.name, environment: record.environment, prefix, scopes: record.scopes, status: "active", full_key: fullKey, created_at: record.created_date }, 201);
    }

    if (action === "revoke") {
      const { api_key_id } = body;
      if (!api_key_id) return apiError("VALIDATION_ERROR", "api_key_id is required.", 400);
      const keys = await base44.asServiceRole.entities.APIKey.filter({ id: api_key_id, organization_id: ctx.organization_id }, "-created_date", 1);
      if (keys.length === 0) return apiError("API_KEY_NOT_FOUND", "API key not found.", 404);
      await base44.asServiceRole.entities.APIKey.update(api_key_id, { status: "revoked" });
      return apiSuccess({ revoked: true, api_key_id }, 200);
    }

    return apiError("UNKNOWN_ACTION", `Action '${action}' is not supported. Use create|list|rotate|revoke.`, 400);
  } catch (e) {
    if (e.status) return apiError(e.code || "ERROR", e.message, e.status);
    return apiError("INTERNAL_ERROR", e.message, 500);
  }
}