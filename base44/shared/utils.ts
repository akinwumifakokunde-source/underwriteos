// Shared utilities for UnderwriteOS API functions.

export function genId(prefix: string, len = 8): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "";
  const buf = new Uint8Array(len);
  crypto.getRandomValues(buf);
  for (let i = 0; i < len; i++) s += chars[buf[i] % chars.length];
  return `${prefix}-${s}`;
}

export function apiError(code: string, message: string, status = 400, details?: any): Response {
  return Response.json({ error: { code, message, ...(details ? { details } : {}) } }, { status });
}

export function apiSuccess(data: any, status = 200): Response {
  return Response.json(data, { status });
}

export async function readBody(req: Request): Promise<any> {
  try {
    const text = await req.text();
    if (!text) return {};
    return JSON.parse(text);
  } catch {
    return {};
  }
}

// Resolve the calling organization. Strategy:
//  1. If an API key is provided (Authorization: Bearer), look it up.
//  2. Otherwise use the authenticated user; auto-provision an org if missing.
export async function resolveOrganization(base44: any): Promise<{ organization_id: string; actor: string; actor_type: string }> {
  // Try API key first
  const authHeader = base44._req?.headers?.get?.("authorization") || "";
  if (authHeader.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    const keyHash = await sha256(token);
    const keys = await base44.asServiceRole.entities.APIKey.filter({ key_hash: keyHash, status: "active" }, "-created_date", 1);
    if (keys.length > 0) {
      return { organization_id: keys[0].organization_id, actor: keys[0].id, actor_type: "api_key" };
    }
  }

  // Fall back to authenticated user
  const user = await base44.auth.me();
  if (!user) throw { status: 401, code: "UNAUTHORIZED", message: "Valid API key or authenticated session required." };

  let organizationId = (user as any).organization_id;
  if (!organizationId) {
    // Auto-provision a sandbox organization for this user
    const slug = `org-${user.id.slice(-6)}`;
    const org = await base44.asServiceRole.entities.Organization.create({
      name: `${user.full_name || user.email || "My"} Organization`,
      slug,
      status: "active",
      plan: "sandbox",
      settings: { default_policy_id: "consumer-v1", default_currency: "GBP" }
    });
    organizationId = org.id;
    await base44.auth.updateMe({ organization_id: organizationId });
  }
  return { organization_id: organizationId, actor: user.id, actor_type: "user" };
}

export async function sha256(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, "0")).join("");
}

export async function audit(base44: any, organization_id: string, event: string, opts: { application_id?: string; actor?: string; actor_type?: string; endpoint?: string; details?: any } = {}): Promise<void> {
  try {
    await base44.asServiceRole.entities.AuditEvent.create({
      organization_id,
      application_id: opts.application_id,
      event,
      actor: opts.actor || "system",
      actor_type: opts.actor_type || "system",
      endpoint: opts.endpoint,
      details: opts.details || {}
    });
  } catch {
    // audit must never break the request
  }
}

// Idempotency: return an existing record created with the same key, if any.
export async function findIdempotent(base44: any, entity: string, organization_id: string, idempotency_key: string): Promise<any | null> {
  if (!idempotency_key) return null;
  const existing = await base44.asServiceRole.entities[entity].filter({ organization_id, idempotency_key }, "-created_date", 1);
  return existing.length > 0 ? existing[0] : null;
}