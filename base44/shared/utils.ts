// Free credit grant for new signups — one-time, per new organization.
export const SIGNUP_CREDIT_GRANT = 1000;

// Shared utilities for UnderwriteOS API functions.
// Two authentication mechanisms, never mixed:
//   A. API key  — Authorization: Bearer uw_test_... / uw_live_...  (validated via hash, no Base44 session needed)
//   B. Dashboard — Base44 user session (base44.functions.invoke from the UI)

export interface AuthContext {
  organization_id: string;
  actor: string;
  actor_type: "user" | "api_key" | "system";
  environment: "sandbox" | "production";
  scopes: string[];
  api_key_id?: string;
}

export function genId(prefix: string, len = 8): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "";
  const buf = new Uint8Array(len);
  crypto.getRandomValues(buf);
  for (let i = 0; i < len; i++) s += chars[buf[i] % chars.length];
  return `${prefix}-${s}`;
}

export function genRequestId(): string {
  return "req_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export function apiError(code: string, message: string, status = 400, details?: any): Response {
  return Response.json({ error: { code, message, ...(details ? { details } : {}) }, request_id: genRequestId() }, { status });
}

export function apiSuccess(data: any, status = 200): Response {
  return Response.json({ ...data, request_id: genRequestId() }, { status });
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

// Generate a new UnderwriteOS API key. The full key is returned to the caller
// only at creation/rotation time; only the hash is persisted.
export function generateApiKey(environment: "sandbox" | "production"): { fullKey: string; prefix: string } {
  const prefix = environment === "production" ? "uw_live_" : "uw_test_";
  const buf = new Uint8Array(24);
  crypto.getRandomValues(buf);
  const secret = Array.from(buf).map(b => b.toString(16).padStart(2, "0")).join("");
  return { fullKey: prefix + secret, prefix };
}

// Resolve the calling organization + environment + scopes.
// API keys (uw_test_/uw_live_) are validated by hash and NEVER fall back to a
// Base44 session. Dashboard requests use the Base44 user session.
//
// The key is read from body._api_key (SDK invocations) or the Authorization
// header (external HTTP callers), in that order.
export async function resolveOrganization(base44: any, body: any = {}): Promise<AuthContext> {
  const bodyKey = (body._api_key || body.api_key || "").trim();
  const authHeader = base44._req?.headers?.get?.("authorization") || "";
  const headerToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : "";

  // An explicit empty string means "I am an API client with no key" -> 401 MISSING_API_KEY
  if (bodyKey === "" && body._api_key !== undefined) {
    throw { status: 401, code: "MISSING_API_KEY", message: "Authentication is required. Provide an UnderwriteOS API key." };
  }

  const token = bodyKey || headerToken;
  if (token && (token.startsWith("uw_test_") || token.startsWith("uw_live_"))) {
    const envFromToken: "sandbox" | "production" = token.startsWith("uw_live_") ? "production" : "sandbox";
    const keyHash = await sha256(token);
    const keys = await base44.asServiceRole.entities.APIKey.filter({ key_hash: keyHash, status: "active" }, "-created_date", 1);
    if (keys.length === 0) {
      throw { status: 401, code: "INVALID_API_KEY", message: "The provided UnderwriteOS API key is invalid or inactive." };
    }
    const key = keys[0];
    const keyEnv = (key.environment as "sandbox" | "production") || envFromToken;
    if (keyEnv !== envFromToken) {
      throw { status: 401, code: "INVALID_API_KEY", message: "The provided API key is not valid for this environment." };
    }
    try { await base44.asServiceRole.entities.APIKey.update(key.id, { last_used: new Date().toISOString() }); } catch {}
    return {
      organization_id: key.organization_id,
      actor: key.id,
      actor_type: "api_key",
      environment: keyEnv,
      scopes: key.scopes || [],
      api_key_id: key.id
    };
  }

  // Non-uw_ token present but not recognized
  if (token && !token.startsWith("uw_test_") && !token.startsWith("uw_live_")) {
    throw { status: 401, code: "INVALID_API_KEY", message: "The provided UnderwriteOS API key is invalid or inactive." };
  }

  // Dashboard: authenticated Base44 user
  let user: any;
  try {
    user = await base44.auth.me();
  } catch {
    throw { status: 401, code: "MISSING_API_KEY", message: "Authentication is required. Provide an UnderwriteOS API key." };
  }
  if (!user) throw { status: 401, code: "MISSING_API_KEY", message: "Authentication is required. Provide an UnderwriteOS API key." };

  let organizationId = user.organization_id;
  if (!organizationId) {
    const slug = `org-${user.id.slice(-6)}`;
    const org = await base44.asServiceRole.entities.Organization.create({
      name: user.organization_name || `${user.full_name || user.email || "My"} Organization`,
      slug,
      status: "active",
      plan: "sandbox",
      settings: { default_policy_id: "consumer-v1", default_currency: "GBP" }
    });
    organizationId = org.id;
    await base44.auth.updateMe({ organization_id: organizationId });
    // Free signup credit grant — one-time, per new organization.
    try {
      await base44.asServiceRole.entities.Credit.create({
        organization_id: organizationId, balance: SIGNUP_CREDIT_GRANT, currency: "usd", subscription_status: "none"
      });
      await base44.asServiceRole.entities.CreditTransaction.create({
        organization_id: organizationId, type: "topup", credits: SIGNUP_CREDIT_GRANT, amount_cents: 0, currency: "usd",
        description: "Free signup credits — welcome to GoUnderwriteOS"
      });
    } catch {
      // signup grant must never block org creation
    }
  }
  return {
    organization_id: organizationId,
    actor: user.id,
    actor_type: "user",
    environment: "sandbox",
    scopes: ["*"]
  };
}

// Idempotent free signup credit grant. Applied once per organization: the
// first time the org has ANY credit activity (a CreditTransaction record),
// the grant is considered done and never repeats. This retroactively covers
// organizations created before the signup grant was wired into org creation.
export async function applySignupGrantIfNeeded(base44: any, organization_id: string): Promise<boolean> {
  try {
    const txns = await base44.asServiceRole.entities.CreditTransaction.filter({ organization_id }, "-created_date", 1);
    if (txns.length > 0) return false;
    const credits = await base44.asServiceRole.entities.Credit.filter({ organization_id }, "-created_date", 1);
    let credit = credits[0] || null;
    if (!credit) {
      credit = await base44.asServiceRole.entities.Credit.create({
        organization_id, balance: SIGNUP_CREDIT_GRANT, currency: "usd", subscription_status: "none"
      });
    } else {
      await base44.asServiceRole.entities.Credit.update(credit.id, { balance: (credit.balance || 0) + SIGNUP_CREDIT_GRANT });
    }
    await base44.asServiceRole.entities.CreditTransaction.create({
      organization_id, type: "topup", credits: SIGNUP_CREDIT_GRANT, amount_cents: 0, currency: "usd",
      description: "Free signup credits — welcome to GoUnderwriteOS"
    });
    return true;
  } catch {
    return false;
  }
}

// Scope enforcement. Dashboard (actor_type === "user") bypasses scope checks.
export function requireScope(ctx: AuthContext, scope: string): void {
  if (ctx.actor_type === "user") return;
  if (ctx.scopes.includes("*") || ctx.scopes.includes(scope)) return;
  throw { status: 403, code: "INSUFFICIENT_SCOPE", message: "This API key does not have permission to perform this operation." };
}

export async function sha256(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, "0")).join("");
}

export async function hmacSha256(key: string, message: string): Promise<string> {
  const enc = new TextEncoder();
  const cryptoKey = await crypto.subtle.importKey("raw", enc.encode(key), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", cryptoKey, enc.encode(message));
  return Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, "0")).join("");
}

export async function audit(base44: any, organization_id: string, event: string, opts: { application_id?: string; actor?: string; actor_type?: string; endpoint?: string; details?: any; credits?: number } = {}): Promise<void> {
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
  // Billable usage: decrement the org's credit balance for API-key calls.
  // `credits` in opts selects the per-transaction cost from the pricing model
  // (default 0 — reads and non-billable events are free).
  if (opts.actor_type === "api_key" && opts.credits && opts.credits > 0) {
    try {
      const credits = await base44.asServiceRole.entities.Credit.filter({ organization_id }, "-created_date", 1);
      if (credits.length > 0) {
        const c = credits[0];
        const cost = opts.credits;
        const newBalance = Math.max(0, (c.balance || 0) - cost);
        if (newBalance !== c.balance) await base44.asServiceRole.entities.Credit.update(c.id, { balance: newBalance });
        await base44.asServiceRole.entities.CreditTransaction.create({
          organization_id, type: "usage", credits: -cost, amount_cents: 0,
          currency: c.currency || "usd", description: `${event} — ${opts.endpoint || "api"}`
        });
      }
    } catch {
      // billing decrement must never break the request
    }
  }
}

// Idempotency: return an existing record created with the same key, if any.
export async function findIdempotent(base44: any, entity: string, organization_id: string, idempotency_key: string): Promise<any | null> {
  if (!idempotency_key) return null;
  const existing = await base44.asServiceRole.entities[entity].filter({ organization_id, idempotency_key }, "-created_date", 1);
  return existing.length > 0 ? existing[0] : null;
}

// Default sandbox scopes granted to a new API key.
export const DEFAULT_SANDBOX_SCOPES = [
  "applications:read", "applications:write",
  "borrowers:read", "borrowers:write",
  "profiles:read", "risk:read", "decisions:read",
  "webhooks:read", "webhooks:write", "audit:read",
  "outcomes:read", "outcomes:write"
];