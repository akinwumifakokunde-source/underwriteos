// Purchasing-power-adjusted local-currency pricing for African markets.
// `amount` is in the currency's smallest unit (kobo / pesewa / cent) for
// two-decimal currencies, i.e. price × 100; for Stripe zero-decimal currencies
// (RWF, UGX, XAF, XOF) `amount` is the raw price with no multiplier.
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

// Nigeria base prices (NGN, major unit) — the discounted "Nigeria rate"
// extended to other African markets without a dedicated tuned config.
const NG_PRICES = {
  tiers: { plan_starter: 25000, plan_growth: 95000, plan_scale: 220000 } as Record<string, number>,
  packs: { pack_starter: 6000, pack_growth: 22000, pack_scale: 38000 } as Record<string, number>,
};
const TIER_CREDITS: Record<string, number> = { plan_starter: 20000, plan_growth: 100000, plan_scale: 300000 };
const TIER_NAMES: Record<string, string> = { plan_starter: "Starter", plan_growth: "Growth", plan_scale: "Scale" };
const PACK_CREDITS: Record<string, number> = { pack_starter: 10000, pack_growth: 50000, pack_scale: 100000 };
const PACK_NAMES: Record<string, string> = { pack_starter: "Starter pack", pack_growth: "Growth pack", pack_scale: "Scale pack" };

// Additional African markets with their own currency. Amounts are derived from
// the Nigeria NGN rate at an approximate rate. `zero_decimal` = Stripe charges
// in whole units (amount = price, no ×100).
const OTHER_AFRICA: Record<string, { label: string; currency: string; zero_decimal: boolean; rate: number }> = {
  EG: { label: "Egypt", currency: "egp", zero_decimal: false, rate: 0.032 },
  RW: { label: "Rwanda", currency: "rwf", zero_decimal: true, rate: 0.8 },
  UG: { label: "Uganda", currency: "ugx", zero_decimal: true, rate: 2.2 },
  MA: { label: "Morocco", currency: "mad", zero_decimal: false, rate: 0.0064 },
  CM: { label: "Cameroon", currency: "xaf", zero_decimal: true, rate: 0.4 },
  SN: { label: "Senegal", currency: "xof", zero_decimal: true, rate: 0.4 },
};

// All 54 African ISO 3166-1 alpha-2 country codes.
const AFRICAN_COUNTRIES = new Set([
  "DZ", "AO", "BJ", "BW", "BF", "BI", "CV", "CM", "CF", "TD", "KM", "CG", "CD", "CI", "DJ", "EG", "GQ", "ER", "SZ", "ET",
  "GA", "GM", "GH", "GN", "GW", "KE", "LS", "LR", "LY", "MG", "MW", "ML", "MR", "MU", "MA", "MZ", "NA", "NE", "NG", "RW",
  "ST", "SN", "SC", "SL", "SO", "ZA", "SS", "SD", "TZ", "TG", "TN", "UG", "EH", "ZM", "ZW",
]);

function round10(n: number): number { return Math.round(n / 10) * 10; }

// True for any African country code — dedicated markets, other-Africa mapped
// markets, and any other African country (which falls back to the NGN rate).
export function isAfricaMarket(market: string | undefined | null): boolean {
  const m = String(market || "").toUpperCase();
  return !!AFRICA_PRICING[m] || !!OTHER_AFRICA[m] || AFRICAN_COUNTRIES.has(m);
}

function otherAmount(market: string, ngnPrice: number): { amount: number; currency: string } | null {
  const m = String(market).toUpperCase();
  const other = OTHER_AFRICA[m];
  if (other) {
    const local = round10(ngnPrice * other.rate);
    return { amount: other.zero_decimal ? local : local * 100, currency: other.currency };
  }
  // African country without a mapped currency → Nigeria rate in NGN.
  if (AFRICAN_COUNTRIES.has(m)) {
    return { amount: round10(ngnPrice) * 100, currency: "ngn" };
  }
  return null;
}

export function getLocalTier(market: string, plan_id: string): (LocalTier & { currency: string }) | null {
  const m = String(market).toUpperCase();
  const dedicated = AFRICA_PRICING[m];
  if (dedicated) {
    const t = dedicated.tiers.find((x) => x.plan_id === plan_id);
    return t ? { ...t, currency: dedicated.currency } : null;
  }
  const ngn = NG_PRICES.tiers[plan_id];
  if (ngn == null) return null;
  const res = otherAmount(m, ngn);
  if (!res) return null;
  return { plan_id: plan_id as LocalTier["plan_id"], name: TIER_NAMES[plan_id] || plan_id, amount: res.amount, credits: TIER_CREDITS[plan_id] || 0, currency: res.currency };
}

export function getLocalPack(market: string, pack_id: string): (LocalPack & { currency: string }) | null {
  const m = String(market).toUpperCase();
  const dedicated = AFRICA_PRICING[m];
  if (dedicated) {
    const p = dedicated.packs.find((x) => x.pack_id === pack_id);
    return p ? { ...p, currency: dedicated.currency } : null;
  }
  const ngn = NG_PRICES.packs[pack_id];
  if (ngn == null) return null;
  const res = otherAmount(m, ngn);
  if (!res) return null;
  return { pack_id: pack_id as LocalPack["pack_id"], name: PACK_NAMES[pack_id] || pack_id, amount: res.amount, credits: PACK_CREDITS[pack_id] || 0, currency: res.currency };
}