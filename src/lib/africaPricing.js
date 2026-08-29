// Purchasing-power-adjusted monthly pricing for African markets.
// Rates are set well below the USD list price to make the platform
// affordable for lenders operating in local currencies.
// `amount` is the Stripe unit amount (price × 100, smallest currency unit).
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