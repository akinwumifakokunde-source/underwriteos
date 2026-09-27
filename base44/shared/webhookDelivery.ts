// Webhook delivery with HMAC-SHA256 signing. Fires signed payloads to all
// active webhook endpoints subscribed to decision events for the organization.
//
// Signature scheme (industry-standard, Stripe/GitHub-compatible):
//   Header: X-CreditDecide-Signature: sha256=<hex hmac>
//   HMAC:   HMAC-SHA256(secret, raw_payload_body)
//
// The recipient verifies by recomputing the HMAC over the raw request body
// using their webhook secret (returned in full only at webhook creation time).

export interface DecisionWebhookPayload {
  event: string;
  created_at: string;
  data: {
    application_id: string;
    application_number: string | null;
    decision_id: string;
    decision: "APPROVE" | "REVIEW" | "DECLINE";
    decision_source: string;
    risk_score: number;
    probability_of_default: number;
    confidence: number;
    policy_id: string;
    policy_version: string;
    interest_rate: number | null;
    human_review_required: boolean;
    reasons: string[];
    adverse_action_codes: any[];
    borrower_id: string | null;
    loan_amount: number | null;
    loan_currency: string | null;
    loan_term_months: number | null;
    market: string;
  };
}

// Exponential backoff schedule (seconds): 1m, 5m, 30m between attempts.
// Max 4 attempts total (1 initial + 3 retries). After attempt 4, give up.
const BACKOFF_SECONDS = [60, 300, 1800];
const MAX_ATTEMPTS = 4;

// A failure is retryable if the endpoint was unreachable (network/timeout) or
// returned a 5xx (server error). 4xx errors are NOT retried — the endpoint is
// rejecting the payload, and retrying the same payload won't help.
function isRetryable(httpStatus: number | null, errorMsg: string | null): boolean {
  if (httpStatus === null) return true; // network error / timeout
  return httpStatus >= 500 && httpStatus < 600;
}

// Compute the next retry timestamp for a given attempt number, or null if
// the delivery has exhausted retries.
function computeNextRetry(attempt: number): string | null {
  const idx = attempt - 1; // attempt 1 → BACKOFF_SECONDS[0]
  if (idx >= BACKOFF_SECONDS.length) return null; // exhausted
  return new Date(Date.now() + BACKOFF_SECONDS[idx] * 1000).toISOString();
}

// Compute HMAC-SHA256 hex digest using the Web Crypto API.
async function hmacSha256(secret: string, payload: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// Deliver a signed decision webhook to a single endpoint.
// Returns { ok, http_status, error } and updates last_delivery_status.
// Persists a WebhookDelivery audit record for every attempt.
async function deliverOne(
  base44: any,
  webhook: any,
  event: string,
  payload: DecisionWebhookPayload,
  ctx: { organization_id: string; application_id: string; decision_id: string }
): Promise<{ ok: boolean; http_status?: number; error?: string }> {
  const body = JSON.stringify(payload);
  let signature = "";
  try {
    signature = await hmacSha256(webhook.secret, body);
  } catch {
    signature = "";
  }

  const start = Date.now();
  let httpStatus: number | null = null;
  let ok = false;
  let errorMsg: string | null = null;

  try {
    const res = await fetch(webhook.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CreditDecide-Signature": `sha256=${signature}`,
        "X-CreditDecide-Event": event,
      },
      body,
      // 10s timeout — don't block the underwriting flow on slow endpoints
      signal: AbortSignal.timeout(10000),
    });

    httpStatus = res.status;
    ok = res.ok;
  } catch (e: any) {
    errorMsg = e.name === "TimeoutError" ? "Request timed out" : e.message;
  }

  const latencyMs = Date.now() - start;
  const statusLabel = ok ? `ok:${httpStatus}` : `failed:${errorMsg ? (errorMsg.includes("timed out") ? "timeout" : "error") : httpStatus}`;

  // Update the webhook's last_delivery_status
  try {
    await base44.asServiceRole.entities.Webhook.update(webhook.id, { last_delivery_status: statusLabel });
  } catch {}

  // Persist a WebhookDelivery audit record
  const retryable = !ok && isRetryable(httpStatus, errorMsg);
  const nextRetry = retryable ? computeNextRetry(1) : null;
  try {
    await base44.asServiceRole.entities.WebhookDelivery.create({
      organization_id: ctx.organization_id,
      webhook_id: webhook.id,
      event,
      application_id: ctx.application_id,
      decision_id: ctx.decision_id,
      url: webhook.url,
      payload,
      http_status: httpStatus,
      status: ok ? "delivered" : "failed",
      error: errorMsg,
      latency_ms: latencyMs,
      attempt: 1,
      signature: `sha256=${signature}`,
      next_retry_at: nextRetry,
    });
  } catch {}

  return { ok, http_status: httpStatus ?? undefined, error: errorMsg ?? undefined };
}

// Retry a single failed delivery. Creates a NEW WebhookDelivery record for the
// retry attempt (preserving the per-attempt audit trail), and clears the
// original record's next_retry_at so it isn't retried again.
// Returns { ok, http_status, error, exhausted }.
export async function retryDelivery(
  base44: any,
  original: any,
  webhook: any
): Promise<{ ok: boolean; http_status?: number; error?: string; exhausted: boolean }> {
  const payload = original.payload;
  const body = JSON.stringify(payload);
  let signature = "";
  try {
    signature = await hmacSha256(webhook.secret, body);
  } catch {
    signature = "";
  }

  const start = Date.now();
  let httpStatus: number | null = null;
  let ok = false;
  let errorMsg: string | null = null;

  try {
    const res = await fetch(webhook.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CreditDecide-Signature": `sha256=${signature}`,
        "X-CreditDecide-Event": original.event,
      },
      body,
      signal: AbortSignal.timeout(10000),
    });
    httpStatus = res.status;
    ok = res.ok;
  } catch (e: any) {
    errorMsg = e.name === "TimeoutError" ? "Request timed out" : e.message;
  }

  const latencyMs = Date.now() - start;
  const attempt = (original.attempt || 1) + 1;
  const retryable = !ok && isRetryable(httpStatus, errorMsg);
  const exhausted = attempt >= MAX_ATTEMPTS;
  const nextRetry = retryable && !exhausted ? computeNextRetry(attempt) : null;

  // Create a new WebhookDelivery record for this retry attempt
  try {
    await base44.asServiceRole.entities.WebhookDelivery.create({
      organization_id: original.organization_id,
      webhook_id: original.webhook_id,
      event: original.event,
      application_id: original.application_id,
      decision_id: original.decision_id,
      url: original.url,
      payload,
      http_status: httpStatus,
      status: ok ? "delivered" : "failed",
      error: errorMsg,
      latency_ms: latencyMs,
      attempt,
      signature: `sha256=${signature}`,
      next_retry_at: nextRetry,
    });
  } catch {}

  // Update the webhook's last_delivery_status
  const statusLabel = ok ? `ok:${httpStatus}` : `failed:${errorMsg ? "error" : httpStatus}`;
  try {
    await base44.asServiceRole.entities.Webhook.update(webhook.id, { last_delivery_status: statusLabel });
  } catch {}

  // Clear the original record's next_retry_at — the new record takes over
  try {
    await base44.asServiceRole.entities.WebhookDelivery.update(original.id, { next_retry_at: null });
  } catch {}

  return { ok, http_status: httpStatus ?? undefined, error: errorMsg ?? undefined, exhausted };
}

// Find all failed deliveries due for retry (next_retry_at <= now) and retry them.
// Called by the scheduled workflow. Returns { retried, delivered, exhausted }.
export async function retryFailedDeliveries(base44: any): Promise<{ retried: number; delivered: number; exhausted: number }> {
  const now = new Date().toISOString();
  // Find deliveries with next_retry_at set and due
  const due = await base44.asServiceRole.entities.WebhookDelivery.filter(
    { status: "failed", next_retry_at: { $lte: now } },
    "-created_date",
    100
  );

  if (due.length === 0) return { retried: 0, delivered: 0, exhausted: 0 };

  // Group by webhook_id to batch-load webhook secrets
  const webhookIds = [...new Set(due.map((d: any) => d.webhook_id))];
  const webhooks = await base44.asServiceRole.entities.Webhook.filter(
    { id: { $in: webhookIds } },
    "-created_date",
    50
  );
  const webhookMap: Record<string, any> = {};
  for (const w of webhooks) webhookMap[w.id] = w;

  let delivered = 0;
  let exhausted = 0;

  for (const delivery of due) {
    const webhook = webhookMap[delivery.webhook_id];
    if (!webhook || webhook.status !== "active") {
      // Webhook deleted or disabled — clear retry to stop the cycle
      try {
        await base44.asServiceRole.entities.WebhookDelivery.update(delivery.id, { next_retry_at: null });
      } catch {}
      continue;
    }

    const result = await retryDelivery(base44, delivery, webhook);
    if (result.ok) delivered++;
    if (result.exhausted && !result.ok) exhausted++;
  }

  return { retried: due.length, delivered, exhausted };
}

// Fire decision webhooks to all active endpoints subscribed to the relevant
// event(s). Called from apiUnderwrite after the decision record is created.
// Events fired:
//   - decision.created       (always, for any decision)
//   - decision.approved      (when decision === APPROVE)
//   - decision.declined      (when decision === DECLINE)
//   - decision.review        (when decision === REVIEW)
export async function deliverDecisionWebhooks(
  base44: any,
  organization_id: string,
  decision: any,
  application: any,
  interestRate: number | null
): Promise<{ delivered: number; results: any[] }> {
  // Load all active webhooks for this org
  const hooks = await base44.asServiceRole.entities.Webhook.filter(
    { organization_id, status: "active" },
    "-created_date",
    50
  );

  if (hooks.length === 0) return { delivered: 0, results: [] };

  const events = ["decision.created"];
  if (decision.decision === "APPROVE") events.push("decision.approved");
  else if (decision.decision === "DECLINE") events.push("decision.declined");
  else if (decision.decision === "REVIEW") events.push("decision.review");

  const now = new Date().toISOString();
  const results: any[] = [];

  for (const hook of hooks) {
    // Check if this webhook subscribes to any of the fired events
    const subscribed = (hook.events || []).some((e: string) => events.includes(e));
    if (!subscribed) continue;

    for (const event of events) {
      // Only fire events this webhook is subscribed to
      if (!(hook.events || []).includes(event)) continue;

      const payload: DecisionWebhookPayload = {
        event,
        created_at: now,
        data: {
          application_id: application.id,
          application_number: application.application_number || null,
          decision_id: decision.id,
          decision: decision.decision,
          decision_source: decision.decision_source,
          risk_score: decision.risk_score,
          probability_of_default: decision.probability_of_default,
          confidence: decision.confidence,
          policy_id: decision.policy_id,
          policy_version: decision.policy_version,
          interest_rate: interestRate,
          human_review_required: decision.human_review_required,
          reasons: decision.reasons || [],
          adverse_action_codes: decision.adverse_action_codes || [],
          borrower_id: application.borrower_id || null,
          loan_amount: application.loan_amount ?? null,
          loan_currency: application.loan_currency || null,
          loan_term_months: application.loan_term_months ?? null,
          market: application.market || "GB",
        },
      };

      const result = await deliverOne(base44, hook, event, payload, { organization_id, application_id: application.id, decision_id: decision.id });
      results.push({ webhook_id: hook.id, event, ...result });
    }
  }

  return { delivered: results.filter((r) => r.ok).length, results };
}