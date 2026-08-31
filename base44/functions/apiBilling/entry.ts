import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { apiError, apiSuccess, readBody, resolveOrganization, audit, hmacSha256, applySignupGrantIfNeeded } from "../../shared/utils.ts";
import { isAfricaMarket, getLocalTier, getLocalPack } from "../../shared/africaPricing.ts";

// Billing via Stripe: one-time credit packs + monthly subscriptions.
// Actions:
//   balance | checkout | record_purchase | charge_export
//   subscription_checkout | subscription_status | subscription_cancel
//   webhook (Stripe → apiBilling, verified via STRIPE_WEBHOOK_SECRET)

const PACKS = [
  { id: "pack_starter", name: "Starter — 10,000 credits", credits: 10000, amount: 2000 },
  { id: "pack_growth", name: "Growth — 50,000 credits", credits: 50000, amount: 7500 },
  { id: "pack_scale", name: "Scale — 100,000 credits", credits: 100000, amount: 12000 }
];

const PLANS = [
  { id: "plan_starter", name: "Starter", price_id: "price_1UAdDWPc6QrSt4INFg9iId3F", amount: 9900, credits: 20000, tagline: "For small lenders getting started" },
  { id: "plan_growth", name: "Growth", price_id: "price_1UAdDWPc6QrSt4INpHFMQmFX", amount: 39900, credits: 100000, tagline: "For growing lending teams", popular: true },
  { id: "plan_scale", name: "Scale", price_id: "price_1UAdDWPc6QrSt4INJ5vlQhlp", amount: 99900, credits: 300000, tagline: "For high-volume lenders" }
];

const APP_ORIGIN = "https://oldme.base44.app";

async function getCredit(base44: any, organization_id: string) {
  const rows = await base44.asServiceRole.entities.Credit.filter({ organization_id }, "-created_date", 1);
  return rows.length > 0 ? rows[0] : null;
}

async function ensureCredit(base44: any, organization_id: string, currency = "usd") {
  const existing = await getCredit(base44, organization_id);
  if (existing) return existing;
  return await base44.asServiceRole.entities.Credit.create({ organization_id, balance: 0, currency, subscription_status: "none" });
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

async function syncSubscription(base44: any, organization_id: string, subscriptionId: string) {
  const sub = await stripeRequest(`/subscriptions/${encodeURIComponent(subscriptionId)}`);
  // Local-currency subscriptions use inline price_data, so the line item's price id
  // won't match a saved PLANS entry — fall back to the plan_id we stamped on metadata.
  const plan = PLANS.find((p) => p.price_id === sub.items?.data?.[0]?.price?.id)
    || PLANS.find((p) => p.id === sub?.metadata?.plan_id);
  const credit = await ensureCredit(base44, organization_id, "usd");
  await base44.asServiceRole.entities.Credit.update(credit.id, {
    stripe_subscription_id: sub.id,
    stripe_customer_id: sub.customer,
    subscription_plan_id: plan?.id || sub?.metadata?.plan_id || credit.subscription_plan_id,
    subscription_status: sub.status,
    subscription_current_period_end: sub.current_period_end ? new Date(sub.current_period_end * 1000).toISOString() : null
  });
  return { sub, plan };
}

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);

    // --- Stripe webhook path (no body action; verified by signature) ---
    const sig = req.headers.get("stripe-signature");
    if (sig) {
      const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
      if (!webhookSecret) return apiError("NO_WEBHOOK_SECRET", "Webhook secret not configured.", 500);
      const rawBody = await req.text();
      const event = await verifyWebhook(rawBody, sig, webhookSecret);
      if (!event) return apiError("INVALID_SIGNATURE", "Webhook signature verification failed.", 400);

      const sub = event.data?.object;
      const organizationId = sub?.metadata?.organization_id || sub?.metadata?.base44_app_id_org || "";
      if (organizationId) {
        if (event.type === "invoice.paid" && sub?.billing_reason === "subscription_cycle") {
          const plan = PLANS.find((p) => p.id === sub?.metadata?.plan_id);
          if (plan) {
            await applyCredit(base44, organizationId, plan.credits, "topup", 0, "usd", sub.id, `Subscription credits — ${plan.name} (monthly)`);
            await audit(base44, organizationId, "billing.subscription_credits", { actor: "system", actor_type: "system", endpoint: "webhook", details: { plan: plan.id, credits: plan.credits, invoice: sub.id } });
          }
        } else if (event.type === "customer.subscription.deleted" || event.type === "customer.subscription.updated" || event.type === "customer.subscription.created") {
          if (sub?.id) {
            try { await syncSubscription(base44, organizationId, sub.id); } catch {}
            await audit(base44, organizationId, `billing.subscription_${event.type}`, { actor: "system", actor_type: "system", endpoint: "webhook", details: { subscription: sub.id, status: sub.status } });
          }
        } else if (event.type === "checkout.session.completed" && sub?.mode === "subscription") {
          if (sub?.subscription) {
            try { await syncSubscription(base44, organizationId, sub.subscription); } catch {}
            await audit(base44, organizationId, "billing.subscription_started", { actor: "system", actor_type: "system", endpoint: "webhook", details: { subscription: sub.subscription } });
          }
        }
      }
      return apiSuccess({ received: true }, 200);
    }

    const body = await readBody(req);
    const ctx = await resolveOrganization(base44, body);
    const { organization_id, actor, actor_type } = ctx;
    const action = body.action || "balance";

    if (action === "balance") {
      await applySignupGrantIfNeeded(base44, organization_id);
      const credit = await getCredit(base44, organization_id);
      const txns = await base44.asServiceRole.entities.CreditTransaction.filter({ organization_id }, "-created_date", 20);
      let subscription = null;
      if (credit?.stripe_subscription_id) {
        try {
          const sub = await stripeRequest(`/subscriptions/${encodeURIComponent(credit.stripe_subscription_id)}`);
          subscription = {
            id: sub.id,
            status: sub.status,
            plan_id: PLANS.find((p) => p.price_id === sub.items?.data?.[0]?.price?.id)?.id || sub?.metadata?.plan_id,
            current_period_end: sub.current_period_end ? new Date(sub.current_period_end * 1000).toISOString() : null,
            cancel_at_period_end: sub.cancel_at_period_end
          };
        } catch {}
      }
      return apiSuccess({
        balance: credit?.balance || 0,
        currency: (credit?.currency || "usd").toUpperCase(),
        subscription_status: credit?.subscription_status || "none",
        subscription_plan_id: credit?.subscription_plan_id || null,
        subscription_current_period_end: credit?.subscription_current_period_end || null,
        subscription,
        packs: PACKS,
        plans: PLANS.map((p) => ({ id: p.id, name: p.name, amount: p.amount, credits: p.credits, tagline: p.tagline, popular: !!p.popular })),
        transactions: txns.map((t: any) => ({ id: t.id, type: t.type, credits: t.credits, amount_cents: t.amount_cents, currency: t.currency, description: t.description, created_at: t.created_date }))
      }, 200);
    }

    if (action === "checkout") {
      const pack = PACKS.find((p) => p.id === body.pack_id);
      if (!pack) return apiError("UNKNOWN_PACK", "Unknown credit pack.", 400);
      const market = (body.market || "").toUpperCase();
      const local = isAfricaMarket(market) ? getLocalPack(market, pack.id) : null;
      const currency = local ? local.currency : "usd";
      const unitAmount = local ? local.amount : pack.amount;
      const origin = req.headers.get("origin") || APP_ORIGIN;
      const credit = await ensureCredit(base44, organization_id, "usd");
      const params = new URLSearchParams();
      params.append("mode", "payment");
      params.append("success_url", `${origin}/billing?status=success&pack=${pack.id}&tx={CHECKOUT_SESSION_ID}`);
      params.append("cancel_url", `${origin}/billing?status=cancelled`);
      params.append("line_items[0][quantity]", "1");
      params.append("line_items[0][price_data][currency]", currency);
      params.append("line_items[0][price_data][unit_amount]", String(unitAmount));
      params.append("line_items[0][price_data][product_data][name]", pack.name);
      if (credit.stripe_customer_id) params.append("customer", credit.stripe_customer_id);
      params.append("metadata[base44_app_id]", Deno.env.get("BASE44_APP_ID") || "");
      params.append("metadata[pack_id]", pack.id);
      params.append("metadata[organization_id]", organization_id);
      if (market) params.append("metadata[market]", market);
      const session = await stripeRequest("/checkout/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded", "Idempotency-Key": `billing_${pack.id}_${organization_id}_${Date.now()}` },
        body: params.toString()
      });
      await audit(base44, organization_id, "billing.checkout_started", { actor, actor_type, endpoint: "POST /v1/billing", details: { pack_id: pack.id, credits: pack.credits, currency, session: session.id } });
      return apiSuccess({ url: session.url, pack_id: pack.id }, 200);
    }

    if (action === "record_purchase") {
      const pack = PACKS.find((p) => p.id === body.pack_id);
      if (!pack) return apiError("UNKNOWN_PACK", "Unknown credit pack.", 400);
      const sessionId = (body.transaction_ref || "").trim();
      if (!sessionId) return apiError("MISSING_REF", "No checkout session reference provided.", 400);
      const existing = await base44.asServiceRole.entities.CreditTransaction.filter({ organization_id, stripe_id: sessionId }, "-created_date", 1);
      if (existing.length > 0) {
        const credit = await getCredit(base44, organization_id);
        return apiSuccess({ credited: false, reason: "duplicate", balance: credit?.balance || 0 }, 200);
      }
      const session = await stripeRequest(`/checkout/sessions/${encodeURIComponent(sessionId)}`);
      if (session.payment_status !== "paid") {
        return apiError("PAYMENT_NOT_COMPLETED", "Checkout session is not marked as paid.", 402);
      }
      // Persist stripe customer id for future off-session charges
      if (session.customer) {
        const credit = await ensureCredit(base44, organization_id, "usd");
        if (!credit.stripe_customer_id) await base44.asServiceRole.entities.Credit.update(credit.id, { stripe_customer_id: session.customer });
      }
      // Record the actual amount/currency the customer paid (USD or local market currency).
      const paidCurrency = (session.currency || "usd").toLowerCase();
      const paidAmount = typeof session.amount_total === "number" ? session.amount_total : pack.amount;
      await applyCredit(base44, organization_id, pack.credits, "purchase", paidAmount, paidCurrency, sessionId, `Credit purchase — ${pack.name}`);
      await audit(base44, organization_id, "billing.purchase_credited", { actor, actor_type, endpoint: "POST /v1/billing", details: { pack_id: pack.id, credits: pack.credits, currency: paidCurrency, amount: paidAmount, ref: sessionId } });
      const credit = await getCredit(base44, organization_id);
      return apiSuccess({ credited: true, credits: pack.credits, balance: credit?.balance || 0 }, 200);
    }

    if (action === "subscription_checkout") {
      const plan = PLANS.find((p) => p.id === body.plan_id);
      if (!plan) return apiError("UNKNOWN_PLAN", "Unknown subscription plan.", 400);
      const market = (body.market || "").toUpperCase();
      const local = isAfricaMarket(market) ? getLocalTier(market, plan.id) : null;
      const origin = req.headers.get("origin") || APP_ORIGIN;
      const credit = await ensureCredit(base44, organization_id, "usd");
      const params = new URLSearchParams();
      params.append("mode", "subscription");
      params.append("success_url", `${origin}/settings?status=sub_success&plan=${plan.id}&session_id={CHECKOUT_SESSION_ID}`);
      params.append("cancel_url", `${origin}/settings?status=sub_cancelled`);
      params.append("line_items[0][quantity]", "1");
      if (local) {
        // Local-currency subscription: inline recurring price_data (no saved Stripe Price needed).
        params.append("line_items[0][price_data][currency]", local.currency);
        params.append("line_items[0][price_data][unit_amount]", String(local.amount));
        params.append("line_items[0][price_data][recurring][interval]", "month");
        params.append("line_items[0][price_data][product_data][name]", `CreditDecide ${plan.name}`);
      } else {
        params.append("line_items[0][price]", plan.price_id);
      }
      if (credit.stripe_customer_id) params.append("customer", credit.stripe_customer_id);
      params.append("metadata[base44_app_id]", Deno.env.get("BASE44_APP_ID") || "");
      params.append("metadata[plan_id]", plan.id);
      params.append("metadata[organization_id]", organization_id);
      if (market) params.append("metadata[market]", market);
      params.append("subscription_data[metadata][base44_app_id]", Deno.env.get("BASE44_APP_ID") || "");
      params.append("subscription_data[metadata][plan_id]", plan.id);
      params.append("subscription_data[metadata][organization_id]", organization_id);
      if (market) params.append("subscription_data[metadata][market]", market);
      const session = await stripeRequest("/checkout/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded", "Idempotency-Key": `sub_${plan.id}_${organization_id}_${Date.now()}` },
        body: params.toString()
      });
      await audit(base44, organization_id, "billing.subscription_checkout_started", { actor, actor_type, endpoint: "POST /v1/billing", details: { plan_id: plan.id, currency: local ? local.currency : "usd", session: session.id } });
      return apiSuccess({ url: session.url, plan_id: plan.id }, 200);
    }

    if (action === "subscription_status") {
      const credit = await getCredit(base44, organization_id);
      if (!credit?.stripe_subscription_id) return apiSuccess({ status: "none" }, 200);
      const sub = await stripeRequest(`/subscriptions/${encodeURIComponent(credit.stripe_subscription_id)}`);
      const plan = PLANS.find((p) => p.price_id === sub.items?.data?.[0]?.price?.id);
      return apiSuccess({
        status: sub.status,
        plan_id: plan?.id,
        plan_name: plan?.name,
        current_period_end: sub.current_period_end ? new Date(sub.current_period_end * 1000).toISOString() : null,
        cancel_at_period_end: sub.cancel_at_period_end
      }, 200);
    }

    if (action === "subscription_cancel") {
      const credit = await getCredit(base44, organization_id);
      if (!credit?.stripe_subscription_id) return apiError("NO_SUBSCRIPTION", "No active subscription to cancel.", 400);
      const sub = await stripeRequest(`/subscriptions/${encodeURIComponent(credit.stripe_subscription_id)}`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: "cancel_at_period_end=true"
      });
      await base44.asServiceRole.entities.Credit.update(credit.id, { subscription_status: sub.status });
      await audit(base44, organization_id, "billing.subscription_cancelled", { actor, actor_type, endpoint: "POST /v1/billing", details: { subscription: sub.id } });
      return apiSuccess({ cancelled: true, status: sub.status, cancel_at_period_end: sub.cancel_at_period_end }, 200);
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

    return apiError("UNKNOWN_ACTION", `Action '${action}' is not supported.`, 400);
  } catch (e: any) {
    if (e.status) return apiError(e.code || "ERROR", e.message, e.status);
    return apiError("INTERNAL_ERROR", e.message, 500);
  }
}

// Stripe webhook signature verification (t=...,v1=...)
async function verifyWebhook(rawBody: string, sig: string, secret: string): Promise<any> {
  try {
    const parts = sig.split(",").map((s) => s.trim());
    let t = "", v1 = "";
    for (const p of parts) {
      const [k, v] = p.split("=");
      if (k === "t") t = v;
      if (k === "v1") v1 = v;
    }
    if (!t || !v1) return null;
    const signedPayload = `${t}.${rawBody}`;
    const expected = await hmacSha256(secret, signedPayload);
    if (expected !== v1) return null;
    return JSON.parse(rawBody);
  } catch {
    return null;
  }
}