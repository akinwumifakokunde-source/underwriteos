// Detects the visitor's country via IP geolocation and maps it to an African
// market when applicable. Returns null for non-African locations (USD pricing).
//
// For the 4 dedicated markets (NG, GH, KE, ZA) we return their tuned code.
// For any other African country we return the ISO-2 code itself, so the
// pricing layer can resolve local-currency (or NGN-fallback) rates.
const DEDICATED_MARKETS = { NG: "NG", GH: "GH", KE: "KE", ZA: "ZA" };

// All 54 African ISO 3166-1 alpha-2 country codes.
const AFRICAN_COUNTRIES = new Set([
  "DZ", "AO", "BJ", "BW", "BF", "BI", "CV", "CM", "CF", "TD", "KM", "CG", "CD", "CI", "DJ", "EG", "GQ", "ER", "SZ", "ET",
  "GA", "GM", "GH", "GN", "GW", "KE", "LS", "LR", "LY", "MG", "MW", "ML", "MR", "MU", "MA", "MZ", "NA", "NE", "NG", "RW",
  "ST", "SN", "SC", "SL", "SO", "ZA", "SS", "SD", "TZ", "TG", "TN", "UG", "EH", "ZM", "ZW",
]);

export async function detectAfricaMarket() {
  try {
    const res = await fetch("https://ipwho.is/");
    if (!res.ok) return null;
    const data = await res.json();
    if (!data || data.success === false) return null;
    const code = (data.country_code || "").toUpperCase();
    if (!code) return null;
    if (DEDICATED_MARKETS[code]) return DEDICATED_MARKETS[code];
    if (AFRICAN_COUNTRIES.has(code)) return code;
    return null;
  } catch {
    return null;
  }
}