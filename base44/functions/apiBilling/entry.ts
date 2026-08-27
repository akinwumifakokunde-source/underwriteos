import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { apiError, apiSuccess, readBody, resolveOrganization, audit } from "../../shared/utils.ts";

// Credits billing via Stripe Checkout (one-time payments).
// `checkout` creates a Stripe Checkout Session for the selected pack and returns
// its URL. After payment, the user is redirected back to /billing with the session
// id, and `record_purchase` verifies the session with Stripe before crediting.
// Actions: balance | checkout | record_purchase

const PACKS = [
  { id: "pack_starter", name: "Starter — 10,000 credits", credits: 10000, amount: 2000 },
  { id: "pack_growth", name: "Growth — 50,000 credits", credits: 50000, amount: 7500 },
  { id: "pack_scale", name: "Scale — 100,000 credits", credits: 100000, amount: 12000 }
];

const APP_ORIGIN = "https://oldme.base44.app";

async function getCredit(base44: any, organization_id: string) {
  const rows = await base44.asServiceRole.entities.Credit.filter({ organization_id }, "-created_date", 1);
  return rows.length > 0 ? rows[0] : null;
}

async function ensureCredit(base44: any, organization_id: string, currency = "usd") {
  const existing = await getCredit(base44, organization_id);
  if (existing) return existing;
  return await base44.asServiceRole.entities.Credit.create({ organization_id, balance: 0, currency });
}

async function applyCredit(base44: any, organization_id: string, credits: number, type: string, amountCents: number, currency: string, ref: string, description: string) {
  const credit = await ensureCredit(base44, organization_id, currency);
  const newBalance = (credit.balance || 0) + credits;
  await base44.asServiceRole.entities.Credit.update(credit.id, { balance: newBalance });
  await base44.asServiceRole.entities.CreditTransaction.create({
    organization_id, type, credits, amount_cents: amountCents || 0, currency, stripe_id: ref, description
  });
}

async function stripeRequest(path: string, init: RequestInit = {}): Promise<any> {
  const res = await fetch(`https://api.stripe.com/v1${path}`, {
    ...init,
    headers: {
      "Authorization": `Bearer ${Deno.env.get("STRIPE_SECRET_KEY")}`,
      "Stripe-Version": "2025-10-29.clover",
      ...(init.headers || {})
    }
  });
  const json = await res.json();
  if (!res.ok) throw { status: 502, code: "STRIPE_ERROR", message: json?.error?.message || "Stripe request failed" };
  return json;
}

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const body = await readBody(req);
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
        transactions: txns.map((t: any) => ({ id: t.id, type: t.type, credits: t.credits, amount_cents: t.amount_cents, currency: t.currency, description: t.description, created_at: t.created_date }))
      }, 200);
    }

    if (action === "checkout") {
      const pack = PACKS.find((p) => p.id === body.pack_id);
      if (!pack) return apiError("UNKNOWN_PACK", "Unknown credit pack.", 400);
      const origin = req.headers.get("origin") || APP_ORIGIN;
      const params = new URLSearchParams();
      params.append("mode", "payment");
      params.append("success_url", `${origin}/billing?status=success&pack=${pack.id}&tx={CHECKOUT_SESSION_ID}`);
      params.append("cancel_url", `${origin}/billing?status=cancelled`);
      params.append("line_items[0][quantity]", "1");
      params.append("line_items[0][price_data][currency]", "usd");
      params.append("line_items[0][price_data][unit_amount]", String(pack.amount));
      params.append("line_items[0][price_data][product_data][name]", pack.name);
      params.append("metadata[base44_app_id]", Deno.env.get("BASE44_APP_ID") || "");
      params.append("metadata[pack_id]", pack.id);
      params.append("metadata[organization_id]", organization_id);
      const session = await stripeRequest("/checkout/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded", "Idempotency-Key": `billing_${pack.id}_${organization_id}_${Date.now()}` },
        body: params.toString()
      });
      await audit(base44, organization_id, "billing.checkout_started", { actor, actor_type, endpoint: "POST /v1/billing", details: { pack_id: pack.id, credits: pack.credits, session: session.id } });
      return apiSuccess({ url: session.url, pack_id: pack.id }, 200);
    }

    if (action === "record_purchase") {
      const pack = PACKS.find((p) => p.id === body.pack_id);
      if (!pack) return apiError("UNKNOWN_PACK", "Unknown credit pack.", 400);
      const sessionId = (body.transaction_ref || "").trim();
      if (!sessionId) return apiError("MISSING_REF", "No checkout session reference provided.", 400);

      // Dedup by Stripe session id.
      const existing = await base44.asServiceRole.entities.CreditTransaction.filter({ organization_id, stripe_id: sessionId }, "-created_date", 1);
      if (existing.length > 0) {
        const credit = await getCredit(base44, organization_id);
        return apiSuccess({ credited: false, reason: "duplicate", balance: credit?.balance || 0 }, 200);
      }

      // Verify with Stripe that the session was paid.
      const session = await stripeRequest(`/checkout/sessions/${encodeURIComponent(sessionId)}`);
      if (session.payment_status !== "paid") {
        return apiError("PAYMENT_NOT_COMPLETED", "Checkout session is not marked as paid.", 402);
      }

      await applyCredit(base44, organization_id, pack.credits, "purchase", pack.amount, "usd", sessionId, `Credit purchase — ${pack.name}`);
      await audit(base44, organization_id, "billing.purchase_credited", { actor, actor_type, endpoint: "POST /v1/billing", details: { pack_id: pack.id, credits: pack.credits, ref: sessionId } });
      const credit = await getCredit(base44, organization_id);
      return apiSuccess({ credited: true, credits: pack.credits, balance: credit?.balance || 0 }, 200);
    }

    if (action === "charge_export") {
      const { application_id, format } = body;
      const cost = 5;
      const credit = await ensureCredit(base44, organization_id, "usd");
      const newBalance = Math.max(0, (credit.balance || 0) - cost);
      if (newBalance !== credit.balance) await base44.asServiceRole.entities.Credit.update(credit.id, { balance: newBalance });
      await base44.asServiceRole.entities.CreditTransaction.create({
        organization_id, type: "usage", credits: -cost, amount_cents: 0, currency: credit.currency || "usd",
        description: `Report export (${format || "pdf"})${application_id ? ` — application ${application_id}` : ""}`
      });
      await audit(base44, organization_id, "report.exported", { application_id, actor, actor_type, endpoint: "POST /v1/billing", credits: cost, details: { format, cost } });
      return apiSuccess({ charged: cost, balance: newBalance }, 200);
    }

    return apiError("UNKNOWN_ACTION", `Action '${action}' is not supported. Use balance|checkout|record_purchase|charge_export.`, 400);
  } catch (e: any) {
    if (e.status) return apiError(e.code || "ERROR", e.message, e.status);
    return apiError("INTERNAL_ERROR", e.message, 500);
  }
}