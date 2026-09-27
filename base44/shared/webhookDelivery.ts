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
async function deliverOne(
  base44: any,
  webhook: any,
  event: string,
  payload: DecisionWebhookPayload
): Promise<{ ok: boolean; http_status?: number; error?: string }> {
  const body = JSON.stringify(payload);
  let signature = "";
  try {
    signature = await hmacSha256(webhook.secret, body);
  } catch {
    signature = "";
  }

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

    const ok = res.ok;
    const status = `${ok ? "ok" : "failed"}:${res.status}`;
    try {
      await base44.asServiceRole.entities.Webhook.update(webhook.id, { last_delivery_status: status });
    } catch {}
    return { ok, http_status: res.status };
  } catch (e: any) {
    const status = `failed:${e.name === "TimeoutError" ? "timeout" : "error"}`;
    try {
      await base44.asServiceRole.entities.Webhook.update(webhook.id, { last_delivery_status: status });
    } catch {}
    return { ok: false, error: e.message };
  }
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

      const result = await deliverOne(base44, hook, event, payload);
      results.push({ webhook_id: hook.id, event, ...result });
    }
  }

  return { delivered: results.filter((r) => r.ok).length, results };
}