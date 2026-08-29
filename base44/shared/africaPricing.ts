// Purchasing-power-adjusted local-currency pricing for African markets.
// `amount` is in the currency's smallest unit (kobo / pesewa / cent), i.e. price × 100.
// Credit allowances intentionally match the USD tiers/packs so the grant logic
// (record_purchase, invoice.paid) is unchanged regardless of billing currency.
//
// Kept in sync with src/lib/africaPricing.js (frontend display copy).

export interface LocalTier {
  plan_id: "plan_starter" | "plan_growth" | "plan_scale";
  name: string;
  amount: number;
  credits: number;
  highlight?: boolean;
}
export interface LocalPack {
  pack_id: "pack_starter" | "pack_growth" | "pack_scale";
  name: string;
  amount: number;
  credits: number;
}
export interface LocalPricing {
  label: string;
  currency: string; // lowercase ISO 4217 for Stripe
  symbol: string;
  tiers: LocalTier[];
  packs: LocalPack[];
}

export const AFRICA_PRICING: Record<string, LocalPricing> = {
  NG: {
    label: "Nigeria", currency: "ngn", symbol: "₦",
    tiers: [
      { plan_id: "plan_starter", name: "Starter", amount: 2500000, credits: 20000 },
      { plan_id: "plan_growth", name: "Growth", amount: 9500000, credits: 100000, highlight: true },
      { plan_id: "plan_scale", name: "Scale", amount: 22000000, credits: 300000 },
    ],
    packs: [
      { pack_id: "pack_starter", name: "Starter pack", amount: 600000, credits: 10000 },
      { pack_id: "pack_growth", name: "Growth pack", amount: 2200000, credits: 50000 },
      { pack_id: "pack_scale", name: "Scale pack", amount: 3800000, credits: 100000 },
    ],
  },
  GH: {
    label: "Ghana", currency: "ghs", symbol: "GH₵",
    tiers: [
      { plan_id: "plan_starter", name: "Starter", amount: 25000, credits: 20000 },
      { plan_id: "plan_growth", name: "Growth", amount: 95000, credits: 100000, highlight: true },
      { plan_id: "plan_scale", name: "Scale", amount: 220000, credits: 300000 },
    ],
    packs: [
      { pack_id: "pack_starter", name: "Starter pack", amount: 6000, credits: 10000 },
      { pack_id: "pack_growth", name: "Growth pack", amount: 22000, credits: 50000 },
      { pack_id: "pack_scale", name: "Scale pack", amount: 38000, credits: 100000 },
    ],
  },
  KE: {
    label: "Kenya", currency: "kes", symbol: "KSh",
    tiers: [
      { plan_id: "plan_starter", name: "Starter", amount: 450000, credits: 20000 },
      { plan_id: "plan_growth", name: "Growth", amount: 1700000, credits: 100000, highlight: true },
      { plan_id: "plan_scale", name: "Scale", amount: 4200000, credits: 300000 },
    ],
    packs: [
      { pack_id: "pack_starter", name: "Starter pack", amount: 110000, credits: 10000 },
      { pack_id: "pack_growth", name: "Growth pack", amount: 400000, credits: 50000 },
      { pack_id: "pack_scale", name: "Scale pack", amount: 700000, credits: 100000 },
    ],
  },
  ZA: {
    label: "South Africa", currency: "zar", symbol: "R",
    tiers: [
      { plan_id: "plan_starter", name: "Starter", amount: 49900, credits: 20000 },
      { plan_id: "plan_growth", name: "Growth", amount: 189900, credits: 100000, highlight: true },
      { plan_id: "plan_scale", name: "Scale", amount: 449900, credits: 300000 },
    ],
    packs: [
      { pack_id: "pack_starter", name: "Starter pack", amount: 12000, credits: 10000 },
      { pack_id: "pack_growth", name: "Growth pack", amount: 45000, credits: 50000 },
      { pack_id: "pack_scale", name: "Scale pack", amount: 75000, credits: 100000 },
    ],
  },
};

export function isAfricaMarket(market: string | undefined | null): boolean {
  return !!market && Object.prototype.hasOwnProperty.call(AFRICA_PRICING, String(market).toUpperCase());
}

export function getLocalTier(market: string, plan_id: string): (LocalTier & { currency: string }) | null {
  const m = AFRICA_PRICING[String(market).toUpperCase()];
  if (!m) return null;
  const t = m.tiers.find((x) => x.plan_id === plan_id);
  return t ? { ...t, currency: m.currency } : null;
}

export function getLocalPack(market: string, pack_id: string): (LocalPack & { currency: string }) | null {
  const m = AFRICA_PRICING[String(market).toUpperCase()];
  if (!m) return null;
  const p = m.packs.find((x) => x.pack_id === pack_id);
  return p ? { ...p, currency: m.currency } : null;
}