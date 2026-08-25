import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { secrets } from "base44:runtime";
import { apiError, apiSuccess, readBody, resolveOrganization, audit, hmacSha256 } from "../../shared/utils.ts";

// Credits billing: buy credit packs via Stripe Checkout, auto top-up when low.
// Actions: balance | checkout | config_auto_topup | auto_topup_run | auto_topup_run_all | webhook
const STRIPE_API = "https://api.stripe.com/v1";
const STRIPE_VERSION = "2025-10-29.clover";

const PACKS = [
  { id: "pack_starter", name: "Starter — 10,000 credits", credits: 10000, amount: 2000 },
  { id: "pack_growth", name: "Growth — 50,000 credits", credits: 50000, amount: 7500 },
  { id: "pack_scale", name: "Scale — 100,000 credits", credits: 100000, amount: 12000 }
];

async function stripeRequest(path: string, params: Record<string, string | number> = {}, method = "POST") {
  const body = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null || v === "") continue;
    body.append(k, String(v));
  }
  const res = await fetch(`${STRIPE_API}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${secrets.get("STRIPE_SECRET_KEY")}`,
      "Stripe-Version": STRIPE_VERSION,
      "Content-Type": "application/x-www-form-urlencoded",
      "Idempotency-Key": crypto.randomUUID()
    },
    body: method === "POST" ? body : undefined
  });
  const json = await res.json();
  if (!res.ok) throw { status: 502, code: "STRIPE_ERROR", message: json?.error?.message || `Stripe request failed (${res.status})` };
  return json;
}

async function getCredit(base44: any, organization_id: string) {
  const rows = await base44.asServiceRole.entities.Credit.filter({ organization_id }, "-created_date", 1);
  return rows.length > 0 ? rows[0] : null;
}

async function ensureCredit(base44: any, organization_id: string, currency = "usd") {
  const existing = await getCredit(base44, organization_id);
  if (existing) return existing;
  return await base44.asServiceRole.entities.Credit.create({ organization_id, balance: 0, currency });
}

async function applyCredit(base44: any, organization_id: string, credits: number, type: string, amountCents: number, currency: string, stripeId: string, description: string) {
  const credit = await ensureCredit(base44, organization_id, currency);
  const newBalance = (credit.balance || 0) + credits;
  await base44.asServiceRole.entities.Credit.update(credit.id, { balance: newBalance });
  await base44.asServiceRole.entities.CreditTransaction.create({
    organization_id, type, credits, amount_cents: amountCents || 0, currency, stripe_id: stripeId, description
  });
}

async function verifyStripeEvent(rawBody: string, sig: string, secret: string): Promise<any | null> {
  const parts = sig.split(",").map((p) => p.trim());
  let ts: string | null = null, v1: string | null = null;
  for (const p of parts) {
    const [k, v] = p.split("=");
    if (k === "t") ts = v;
    if (k === "v1") v1 = v;
  }
  if (!ts || !v1) return null;
  const age = Math.floor(Date.now() / 1000) - Number(ts);
  if (age > 300) return null; // 5-minute tolerance
  const expected = await hmacSha256(secret, `${ts}.${rawBody}`);
  if (expected !== v1) return null;
  try { return JSON.parse(rawBody); } catch { return null; }
}

async function handleWebhook(base44: any, req: Request, sig: string): Promise<Response> {
  const secret = secrets.get("STRIPE_WEBHOOK_SECRET");
  if (!secret) return apiError("WEBHOOK_NOT_CONFIGURED", "STRIPE_WEBHOOK_SECRET is not set.", 500);
  const rawBody = await req.text();
  const event = await verifyStripeEvent(rawBody, sig, secret);
  if (!event) return apiError("INVALID_SIGNATURE", "Invalid Stripe signature.", 400);

  if (event.type === "checkout.session.completed") {
    const s = event.data?.object;
    const organization_id = s?.metadata?.organization_id;
    const credits = Number(s?.metadata?.credits || 0);
    if (organization_id && credits > 0) {
      await applyCredit(base44, organization_id, credits, "purchase", s.amount_total || 0, s.currency || "usd", s.id, "Credit purchase");
      if (s.customer) {
        const credit = await getCredit(base44, organization_id);
        if (credit) await base44.asServiceRole.entities.Credit.update(credit.id, { stripe_customer_id: s.customer });
      }
    }
  } else if (event.type === "payment_intent.succeeded") {
    const pi = event.data?.object;
    const organization_id = pi?.metadata?.organization_id;
    const credits = Number(pi?.metadata?.credits || 0);
    const type = pi?.metadata?.type;
    if (organization_id && credits > 0 && type === "auto_topup") {
      await applyCredit(base44, organization_id, credits, "topup", pi.amount_received || pi.amount || 0, pi.currency || "usd", pi.id, "Auto top-up");
    }
  }
  return apiSuccess({ received: true }, 200);
}

async function chargeAutoTopup(base44: any, credit: any, organization_id: string): Promise<{ topped_up: boolean; status?: string; credits?: number; error?: string }> {
  if (!credit.auto_topup_enabled || !credit.stripe_customer_id) return { topped_up: false, status: "not_configured" };
  if ((credit.balance || 0) > (credit.auto_topup_threshold || 0)) return { topped_up: false, status: "above_threshold" };
  const amount = credit.auto_topup_price_cents || 2000;
  const credits = credit.auto_topup_amount || 10000;
  try {
    const pi = await stripeRequest("/payment_intents", {
      amount, currency: credit.currency || "usd",
      customer: credit.stripe_customer_id,
      off_session: "true", confirm: "true",
      "payment_method_types[]": "card",
      "metadata[base44_app_id]": secrets.get("BASE44_APP_ID") || "",
      "metadata[organization_id]": organization_id,
      "metadata[credits]": String(credits),
      "metadata[type]": "auto_topup"
    });
    if (pi.status === "succeeded") {
      await applyCredit(base44, organization_id, credits, "topup", amount, credit.currency || "usd", pi.id, "Auto top-up");
      return { topped_up: true, credits };
    }
    return { topped_up: false, status: pi.status };
  } catch (e: any) {
    return { topped_up: false, error: e?.message || "charge failed" };
  }
}

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);

    // Stripe webhook (no auth — signature verified)
    const sig = req.headers.get("stripe-signature");
    if (sig) return await handleWebhook(base44, req, sig);

    const body = await readBody(req);

    // System trigger from scheduled workflow (no user session)
    if (body.action === "auto_topup_run_all") {
      const all = await base44.asServiceRole.entities.Credit.filter({ auto_topup_enabled: true }, "-created_date", 100);
      const results = [];
      for (const c of all) {
        const r = await chargeAutoTopup(base44, c, c.organization_id);
        results.push({ organization_id: c.organization_id, balance: c.balance, ...r });
      }
      return apiSuccess({ checked: all.length, results }, 200);
    }

    const ctx = await resolveOrganization(base44, body);
    const { organization_id, actor, actor_type } = ctx;
    const action = body.action || "balance";

    if (action === "balance") {
      const credit = await getCredit(base44, organization_id);
      const txns = await base44.asServiceRole.entities.CreditTransaction.filter({ organization_id }, "-created_date", 20);
      return apiSuccess({
        balance: credit?.balance || 0,
        currency: (credit?.currency || "usd").toUpperCase(),
        packs: PACKS,
        auto_topup: {
          enabled: !!credit?.auto_topup_enabled,
          threshold: credit?.auto_topup_threshold ?? 1000,
          amount: credit?.auto_topup_amount ?? 10000,
          price_cents: credit?.auto_topup_price_cents ?? 2000,
          configured: !!credit?.stripe_customer_id
        },
        transactions: txns.map((t: any) => ({ id: t.id, type: t.type, credits: t.credits, amount_cents: t.amount_cents, currency: t.currency, description: t.description, created_at: t.created_date }))
      }, 200);
    }

    if (action === "checkout") {
      const pack = PACKS.find((p) => p.id === body.pack_id) || PACKS[0];
      const origin = body.origin || "https://underwrite-os-flow.base44.app";
      const session = await stripeRequest("/checkout/sessions", {
        mode: "payment",
        customer_creation: "always",
        "line_items[0][quantity]": "1",
        "line_items[0][price_data][currency]": "usd",
        "line_items[0][price_data][unit_amount]": pack.amount,
        "line_items[0][price_data][product_data][name]": pack.name,
        success_url: `${origin}/billing?status=success`,
        cancel_url: `${origin}/billing?status=cancel`,
        "metadata[base44_app_id]": secrets.get("BASE44_APP_ID") || "",
        "metadata[organization_id]": organization_id,
        "metadata[credits]": String(pack.credits),
        "metadata[pack_id]": pack.id
      });
      await audit(base44, organization_id, "billing.checkout_created", { actor, actor_type, endpoint: "POST /v1/billing", details: { pack_id: pack.id, credits: pack.credits } });
      return apiSuccess({ url: session.url, session_id: session.id }, 200);
    }

    if (action === "config_auto_topup") {
      const credit = await ensureCredit(base44, organization_id);
      const update: any = {};
      if (body.enabled !== undefined) update.auto_topup_enabled = !!body.enabled;
      if (body.threshold !== undefined) update.auto_topup_threshold = Number(body.threshold);
      if (body.amount !== undefined) update.auto_topup_amount = Number(body.amount);
      if (body.price_cents !== undefined) update.auto_topup_price_cents = Number(body.price_cents);
      await base44.asServiceRole.entities.Credit.update(credit.id, update);
      await audit(base44, organization_id, "billing.auto_topup_configured", { actor, actor_type, endpoint: "POST /v1/billing", details: update });
      return apiSuccess({ updated: true }, 200);
    }

    if (action === "auto_topup_run") {
      const credit = await getCredit(base44, organization_id);
      if (!credit) return apiSuccess({ skipped: true, reason: "no credit account" });
      const result = await chargeAutoTopup(base44, credit, organization_id);
      return apiSuccess(result, 200);
    }

    return apiError("UNKNOWN_ACTION", `Action '${action}' is not supported. Use balance|checkout|config_auto_topup|auto_topup_run.`, 400);
  } catch (e) {
    if (e.status) return apiError(e.code || "ERROR", e.message, e.status);
    return apiError("INTERNAL_ERROR", e.message, 500);
  }
}