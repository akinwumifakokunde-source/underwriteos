// Purchasing-power-adjusted monthly pricing for African markets.
// Rates are set well below the USD list price to make the platform
// affordable for lenders operating in local currencies.
export const AFRICA_PRICING = {
  NG: {
    label: "Nigeria",
    currency: "NGN",
    symbol: "₦",
    tiers: [
      { name: "Starter", price: "25,000", credits: "20,000 credits / mo" },
      { name: "Growth", price: "95,000", credits: "100,000 credits / mo", highlight: true },
      { name: "Scale", price: "220,000", credits: "300,000 credits / mo" },
    ],
    packs: [
      { name: "Starter pack", credits: "10,000", price: "₦6,000" },
      { name: "Growth pack", credits: "50,000", price: "₦22,000" },
      { name: "Scale pack", credits: "100,000", price: "₦38,000" },
    ],
  },
  GH: {
    label: "Ghana",
    currency: "GHS",
    symbol: "GH₵",
    tiers: [
      { name: "Starter", price: "250", credits: "20,000 credits / mo" },
      { name: "Growth", price: "950", credits: "100,000 credits / mo", highlight: true },
      { name: "Scale", price: "2,200", credits: "300,000 credits / mo" },
    ],
    packs: [
      { name: "Starter pack", credits: "10,000", price: "GH₵60" },
      { name: "Growth pack", credits: "50,000", price: "GH₵220" },
      { name: "Scale pack", credits: "100,000", price: "GH₵380" },
    ],
  },
  KE: {
    label: "Kenya",
    currency: "KES",
    symbol: "KSh",
    tiers: [
      { name: "Starter", price: "4,500", credits: "20,000 credits / mo" },
      { name: "Growth", price: "17,000", credits: "100,000 credits / mo", highlight: true },
      { name: "Scale", price: "42,000", credits: "300,000 credits / mo" },
    ],
    packs: [
      { name: "Starter pack", credits: "10,000", price: "KSh 1,100" },
      { name: "Growth pack", credits: "50,000", price: "KSh 4,000" },
      { name: "Scale pack", credits: "100,000", price: "KSh 7,000" },
    ],
  },
  ZA: {
    label: "South Africa",
    currency: "ZAR",
    symbol: "R",
    tiers: [
      { name: "Starter", price: "499", credits: "20,000 credits / mo" },
      { name: "Growth", price: "1,899", credits: "100,000 credits / mo", highlight: true },
      { name: "Scale", price: "4,499", credits: "300,000 credits / mo" },
    ],
    packs: [
      { name: "Starter pack", credits: "10,000", price: "R 120" },
      { name: "Growth pack", credits: "50,000", price: "R 450" },
      { name: "Scale pack", credits: "100,000", price: "R 750" },
    ],
  },
};

export const AFRICA_MARKET_ORDER = ["NG", "GH", "KE", "ZA"];