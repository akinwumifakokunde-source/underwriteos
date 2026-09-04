// Purchasing-power-adjusted monthly pricing for African markets.
// `amount` is the Stripe unit amount (price × 100 for two-decimal currencies;
// the raw price for zero-decimal currencies such as RWF, UGX, XAF, XOF).
// Credit allowances match the USD tiers/packs so grant logic is unchanged.

export const AFRICA_PRICING = {
  NG: {
    label: "Nigeria",
    currency: "NGN",
    symbol: "₦",
    tiers: [
      { plan_id: "plan_starter", name: "Starter", price: "25,000", credits: "20,000 credits / mo", amount: 2500000 },
      { plan_id: "plan_growth", name: "Growth", price: "95,000", credits: "100,000 credits / mo", amount: 9500000, highlight: true },
      { plan_id: "plan_scale", name: "Scale", price: "220,000", credits: "300,000 credits / mo", amount: 22000000 },
    ],
    packs: [
      { pack_id: "pack_starter", name: "Starter pack", credits: "10,000", price: "₦6,000", amount: 600000 },
      { pack_id: "pack_growth", name: "Growth pack", credits: "50,000", price: "₦22,000", amount: 2200000 },
      { pack_id: "pack_scale", name: "Scale pack", credits: "100,000", price: "₦38,000", amount: 3800000 },
    ],
  },
  GH: {
    label: "Ghana",
    currency: "GHS",
    symbol: "GH₵",
    tiers: [
      { plan_id: "plan_starter", name: "Starter", price: "250", credits: "20,000 credits / mo", amount: 25000 },
      { plan_id: "plan_growth", name: "Growth", price: "950", credits: "100,000 credits / mo", amount: 95000, highlight: true },
      { plan_id: "plan_scale", name: "Scale", price: "2,200", credits: "300,000 credits / mo", amount: 220000 },
    ],
    packs: [
      { pack_id: "pack_starter", name: "Starter pack", credits: "10,000", price: "GH₵60", amount: 6000 },
      { pack_id: "pack_growth", name: "Growth pack", credits: "50,000", price: "GH₵220", amount: 22000 },
      { pack_id: "pack_scale", name: "Scale pack", credits: "100,000", price: "GH₵380", amount: 38000 },
    ],
  },
  KE: {
    label: "Kenya",
    currency: "KES",
    symbol: "KSh",
    tiers: [
      { plan_id: "plan_starter", name: "Starter", price: "4,500", credits: "20,000 credits / mo", amount: 450000 },
      { plan_id: "plan_growth", name: "Growth", price: "17,000", credits: "100,000 credits / mo", amount: 1700000, highlight: true },
      { plan_id: "plan_scale", name: "Scale", price: "42,000", credits: "300,000 credits / mo", amount: 4200000 },
    ],
    packs: [
      { pack_id: "pack_starter", name: "Starter pack", credits: "10,000", price: "KSh 1,100", amount: 110000 },
      { pack_id: "pack_growth", name: "Growth pack", credits: "50,000", price: "KSh 4,000", amount: 400000 },
      { pack_id: "pack_scale", name: "Scale pack", credits: "100,000", price: "KSh 7,000", amount: 700000 },
    ],
  },
  ZA: {
    label: "South Africa",
    currency: "ZAR",
    symbol: "R",
    tiers: [
      { plan_id: "plan_starter", name: "Starter", price: "499", credits: "20,000 credits / mo", amount: 49900 },
      { plan_id: "plan_growth", name: "Growth", price: "1,899", credits: "100,000 credits / mo", amount: 189900, highlight: true },
      { plan_id: "plan_scale", name: "Scale", price: "4,499", credits: "300,000 credits / mo", amount: 449900 },
    ],
    packs: [
      { pack_id: "pack_starter", name: "Starter pack", credits: "10,000", price: "R 120", amount: 12000 },
      { pack_id: "pack_growth", name: "Growth pack", credits: "50,000", price: "R 450", amount: 45000 },
      { pack_id: "pack_scale", name: "Scale pack", credits: "100,000", price: "R 750", amount: 75000 },
    ],
  },
};

export const AFRICA_MARKET_ORDER = ["NG", "GH", "KE", "ZA"];

// Nigeria base prices (NGN) — the discounted "Nigeria rate" extended to other
// African markets that don't have a dedicated, tuned config of their own.
const NG_BASE = {
  tiers: [
    { plan_id: "plan_starter", name: "Starter", price: 25000, credits: "20,000 credits / mo" },
    { plan_id: "plan_growth", name: "Growth", price: 95000, credits: "100,000 credits / mo", highlight: true },
    { plan_id: "plan_scale", name: "Scale", price: 220000, credits: "300,000 credits / mo" },
  ],
  packs: [
    { pack_id: "pack_starter", name: "Starter pack", credits: "10,000", price: 6000 },
    { pack_id: "pack_growth", name: "Growth pack", credits: "50,000", price: 22000 },
    { pack_id: "pack_scale", name: "Scale pack", credits: "100,000", price: 38000 },
  ],
};

// Additional African markets with their own currency. Amounts are derived from
// the Nigeria rate (NGN) converted at an approximate rate, rounded to clean
// numbers. `zero_decimal` = Stripe charges in whole units (no ×100).
const OTHER_AFRICA = {
  EG: { label: "Egypt", currency: "EGP", symbol: "E£", zero_decimal: false, rate: 0.032 },
  RW: { label: "Rwanda", currency: "RWF", symbol: "FRw", zero_decimal: true, rate: 0.8 },
  UG: { label: "Uganda", currency: "UGX", symbol: "USh", zero_decimal: true, rate: 2.2 },
  MA: { label: "Morocco", currency: "MAD", symbol: "DH", zero_decimal: false, rate: 0.0064 },
  CM: { label: "Cameroon", currency: "XAF", symbol: "FCFA", zero_decimal: true, rate: 0.4 },
  SN: { label: "Senegal", currency: "XOF", symbol: "CFA", zero_decimal: true, rate: 0.4 },
};

const AFRICAN_COUNTRIES = new Set([
  "DZ", "AO", "BJ", "BW", "BF", "BI", "CV", "CM", "CF", "TD", "KM", "CG", "CD", "CI", "DJ", "EG", "GQ", "ER", "SZ", "ET",
  "GA", "GM", "GH", "GN", "GW", "KE", "LS", "LR", "LY", "MG", "MW", "ML", "MR", "MU", "MA", "MZ", "NA", "NE", "NG", "RW",
  "ST", "SN", "SC", "SL", "SO", "ZA", "SS", "SD", "TZ", "TG", "TN", "UG", "EH", "ZM", "ZW",
]);

const COUNTRY_NAMES = {
  DZ: "Algeria", AO: "Angola", BJ: "Benin", BW: "Botswana", BF: "Burkina Faso", BI: "Burundi", CV: "Cape Verde",
  CM: "Cameroon", CF: "Central African Republic", TD: "Chad", KM: "Comoros", CG: "Congo", CD: "DR Congo",
  CI: "Côte d'Ivoire", DJ: "Djibouti", EG: "Egypt", GQ: "Equatorial Guinea", ER: "Eritrea", SZ: "Eswatini",
  ET: "Ethiopia", GA: "Gabon", GM: "Gambia", GH: "Ghana", GN: "Guinea", GW: "Guinea-Bissau", KE: "Kenya",
  LS: "Lesotho", LR: "Liberia", LY: "Libya", MG: "Madagascar", MW: "Malawi", ML: "Mali", MR: "Mauritania",
  MU: "Mauritius", MA: "Morocco", MZ: "Mozambique", NA: "Namibia", NE: "Niger", NG: "Nigeria", RW: "Rwanda",
  ST: "São Tomé & Príncipe", SN: "Senegal", SC: "Seychelles", SL: "Sierra Leone", SO: "Somalia", ZA: "South Africa",
  SS: "South Sudan", SD: "Sudan", TZ: "Tanzania", TG: "Togo", TN: "Tunisia", UG: "Uganda", EH: "Western Sahara",
  ZM: "Zambia", ZW: "Zimbabwe",
};

// Stripe zero-decimal currencies (amount = price, no ×100).
export const ZERO_DECIMAL_CURRENCIES = new Set([
  "BIF", "CLF", "DJF", "GNF", "JPY", "KMF", "KRW", "PYG", "RWF", "UGX", "VND", "VUV", "XAF", "XOF", "XPF",
]);

function round10(n) { return Math.round(n / 10) * 10; }

// Resolves the display pricing config for any African market code:
//  - dedicated tuned config (NG/GH/KE/ZA)
//  - other African market with its own currency (EG/RW/UG/MA/CM/SN)
//  - any other African country → Nigeria rate billed in NGN (fallback)
// Returns null for non-African codes (caller shows USD).
export function getPricingConfig(market) {
  if (AFRICA_PRICING[market]) return AFRICA_PRICING[market];

  const c = OTHER_AFRICA[market];
  if (c) {
    const fmt = (ngn) => round10(ngn * c.rate).toLocaleString("en-US");
    const amt = (ngn) => c.zero_decimal ? round10(ngn * c.rate) : round10(ngn * c.rate) * 100;
    return {
      label: c.label,
      currency: c.currency,
      symbol: c.symbol,
      tiers: NG_BASE.tiers.map((t) => ({ ...t, price: fmt(t.price), amount: amt(t.price) })),
      packs: NG_BASE.packs.map((p) => ({ ...p, price: `${c.symbol}${fmt(p.price)}`, amount: amt(p.price) })),
    };
  }

  // African country without a mapped currency → Nigeria rate in NGN.
  if (AFRICAN_COUNTRIES.has(market)) {
    return {
      label: COUNTRY_NAMES[market] || market,
      currency: "NGN",
      symbol: "₦",
      isFallback: true,
      tiers: NG_BASE.tiers.map((t) => ({ ...t, price: t.price.toLocaleString("en-US"), amount: t.price * 100 })),
      packs: NG_BASE.packs.map((p) => ({ ...p, price: `₦${p.price.toLocaleString("en-US")}`, amount: p.price * 100 })),
    };
  }

  return null;
}