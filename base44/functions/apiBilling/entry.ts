import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { apiError, apiSuccess, readBody, resolveOrganization, audit } from "../../shared/utils.ts";

// Credits billing via Wix Payments (Base44 Payments).
// Checkout happens on a Wix-managed payment link per pack. Credits are applied on
// the billing success page using the logged-in user's session — the platform's
// Wix Payments pattern (the Wix checkout is not org-aware, so the session maps
// the purchase to the organization). Manual top-ups only — no auto top-up.
// Actions: balance | checkout | record_purchase

const PACKS = [
  { id: "pack_starter", name: "Starter — 10,000 credits", credits: 10000, amount: 2000, wix_url: "" },
  { id: "pack_growth", name: "Growth — 50,000 credits", credits: 50000, amount: 7500, wix_url: "" },
  { id: "pack_scale", name: "Scale — 100,000 credits", credits: 100000, amount: 12000, wix_url: "" }
];

async function getCredit(base44: any, organization_id: string) {
  const rows = await base44.asServiceRole.entities.Credit.filter({ organization_id }, "-created_date", 1);
  return rows.length > 0 ? rows[0] : null;
}

async function ensureCredit(base44: any, organization_id: string, currency = "usd") {
  const existing = await getCredit(base44, organization_id);
  if (existing) return existing;
  return await base44.asServiceRole.entities.Credit.create({ organization_id, balance: 0, currency });
}

// `stripe_id` column is repurposed as the provider transaction reference (Wix order id).
async function applyCredit(base44: any, organization_id: string, credits: number, type: string, amountCents: number, currency: string, ref: string, description: string) {
  const credit = await ensureCredit(base44, organization_id, currency);
  const newBalance = (credit.balance || 0) + credits;
  await base44.asServiceRole.entities.Credit.update(credit.id, { balance: newBalance });
  await base44.asServiceRole.entities.CreditTransaction.create({
    organization_id, type, credits, amount_cents: amountCents || 0, currency, stripe_id: ref, description
  });
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
      if (!pack.wix_url) {
        return apiError("WIX_LINK_NOT_CONFIGURED", "No Wix payment link configured for this pack. Create a payment link in your Wix dashboard and add its URL to PACKS in the apiBilling function.", 500);
      }
      await audit(base44, organization_id, "billing.checkout_started", { actor, actor_type, endpoint: "POST /v1/billing", details: { pack_id: pack.id, credits: pack.credits } });
      return apiSuccess({ url: pack.wix_url, pack_id: pack.id }, 200);
    }

    if (action === "record_purchase") {
      const pack = PACKS.find((p) => p.id === body.pack_id);
      if (!pack) return apiError("UNKNOWN_PACK", "Unknown credit pack.", 400);
      const ref = (body.transaction_ref || "").trim();
      // Dedup by provider transaction reference when available.
      if (ref) {
        const existing = await base44.asServiceRole.entities.CreditTransaction.filter({ organization_id, stripe_id: ref }, "-created_date", 1);
        if (existing.length > 0) {
          const credit = await getCredit(base44, organization_id);
          return apiSuccess({ credited: false, reason: "duplicate", balance: credit?.balance || 0 }, 200);
        }
      }
      const txRef = ref || `wix_${pack.id}_${Date.now()}`;
      await applyCredit(base44, organization_id, pack.credits, "purchase", pack.amount, "usd", txRef, `Credit purchase — ${pack.name}`);
      await audit(base44, organization_id, "billing.purchase_credited", { actor, actor_type, endpoint: "POST /v1/billing", details: { pack_id: pack.id, credits: pack.credits, ref: txRef } });
      const credit = await getCredit(base44, organization_id);
      return apiSuccess({ credited: true, credits: pack.credits, balance: credit?.balance || 0 }, 200);
    }

    return apiError("UNKNOWN_ACTION", `Action '${action}' is not supported. Use balance|checkout|record_purchase.`, 400);
  } catch (e: any) {
    if (e.status) return apiError(e.code || "ERROR", e.message, e.status);
    return apiError("INTERNAL_ERROR", e.message, 500);
  }
}