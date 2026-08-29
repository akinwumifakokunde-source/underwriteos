// Detects the visitor's country via IP geolocation and maps it to an African
// market code when applicable. Returns null for non-African locations.
const AFRICA_CODE_MAP = { NG: "NG", GH: "GH", KE: "KE", ZA: "ZA" };

export async function detectAfricaMarket() {
  try {
    const res = await fetch("https://ipwho.is/");
    if (!res.ok) return null;
    const data = await res.json();
    if (!data || data.success === false) return null;
    const code = (data.country_code || "").toUpperCase();
    return AFRICA_CODE_MAP[code] || null;
  } catch {
    return null;
  }
}