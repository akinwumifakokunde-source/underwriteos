import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { apiError, apiSuccess, readBody, resolveOrganization, sha256, generateApiKey, DEFAULT_SANDBOX_SCOPES } from "../../shared/utils.ts";

// Developer onboarding. Called from the dashboard (session auth) after signup.
// Ensures the organization exists and a sandbox API key is provisioned.
// The full key is returned ONLY when a new key is generated; otherwise masked.
// Actions: provision | status
export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const body = await readBody(req);
    const ctx = await resolveOrganization(base44, body);
    const action = body.action || "provision";

    if (action === "provision") {
      const orgs = await base44.asServiceRole.entities.Organization.filter({ id: ctx.organization_id }, "-created_date", 1);
      const organization = orgs[0] || null;

      // Check for an existing active sandbox key
      const existing = await base44.asServiceRole.entities.APIKey.filter({ organization_id: ctx.organization_id, environment: "sandbox", status: "active" }, "-created_date", 1);
      if (existing.length > 0) {
        return apiSuccess({
          organization,
          environment: "sandbox",
          api_key: {
            id: existing[0].id,
            name: existing[0].name,
            prefix: existing[0].prefix,
            environment: "sandbox",
            scopes: existing[0].scopes || [],
            status: "active",
            created_at: existing[0].created_date,
            full_key: null,
            already_exists: true
          },
          checklist: { account: true, organization: true, sandbox: true, api_key: true }
        }, 200);
      }

      // Generate a new sandbox key
      const { fullKey, prefix } = generateApiKey("sandbox");
      const keyHash = await sha256(fullKey);
      const record = await base44.asServiceRole.entities.APIKey.create({
        organization_id: ctx.organization_id,
        name: "Sandbox key",
        prefix,
        key_hash: keyHash,
        environment: "sandbox",
        scopes: DEFAULT_SANDBOX_SCOPES,
        status: "active",
        last_used: null,
        expires_at: null,
        rotated_at: null
      });

      return apiSuccess({
        organization,
        environment: "sandbox",
        api_key: {
          id: record.id,
          name: "Sandbox key",
          prefix,
          environment: "sandbox",
          scopes: DEFAULT_SANDBOX_SCOPES,
          status: "active",
          created_at: record.created_date,
          full_key: fullKey,
          already_exists: false
        },
        checklist: { account: true, organization: true, sandbox: true, api_key: true }
      }, 201);
    }

    if (action === "status") {
      const orgs = await base44.asServiceRole.entities.Organization.filter({ id: ctx.organization_id }, "-created_date", 1);
      const keys = await base44.asServiceRole.entities.APIKey.filter({ organization_id: ctx.organization_id }, "-created_date", 50);
      const masked = keys.map(k => ({
        id: k.id, name: k.name, prefix: k.prefix, environment: k.environment,
        scopes: k.scopes || [], status: k.status, created_at: k.created_date,
        last_used: k.last_used, rotated_at: k.rotated_at
      }));
      return apiSuccess({
        organization: orgs[0] || null,
        environment: "sandbox",
        api_keys: masked,
        checklist: { account: true, organization: true, sandbox: true, api_key: masked.some(k => k.status === "active") }
      }, 200);
    }

    return apiError("UNKNOWN_ACTION", `Action '${action}' is not supported. Use provision|status.`, 400);
  } catch (e) {
    if (e.status) return apiError(e.code || "ERROR", e.message, e.status);
    return apiError("INTERNAL_ERROR", e.message, 500);
  }
}