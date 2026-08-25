// Per-organization provider credential loading + shared OAuth helpers.
// Used by the ingestion functions (apiCreditReport, apiBankStatement) to fetch
// the calling organization's own provider keys, and by apiProviders to test them.

export interface ProviderCredentialRecord {
  id: string;
  provider: string;
  provider_type: string;
  environment: string;
  client_id: string;
  client_secret: string;
  base_url: string;
  status: string;
}

// Token endpoint paths per provider (relative to base_url).
export const PROVIDER_TOKEN_PATHS: Record<string, string> = {
  experian: "/oauth2/v1/token",
  equifax: "/oauth2/v1/token",
  transunion: "/oauth2/v1/token",
  crc: "/oauth/token",
  credit_registry: "/oauth/token",
  first_central: "/oauth/token",
  xds: "/oauth/token",
  crb_africa: "/oauth/token",
  iscore: "/oauth/token",
  truelayer: "/auth/connect/token",
  yapily: "/oauth2/token",
  plaid: "/link/token/create",
  tink: "/oauth/token",
  okra: "/auth/token",
  mono: "/auth/login",
  stitch: "/auth/token"
};

// Load the active credential for a provider in the given environment.
export async function getCredentials(
  base44: any,
  organization_id: string,
  provider: string,
  environment: string = "sandbox"
): Promise<ProviderCredentialRecord | null> {
  const creds = await base44.asServiceRole.entities.ProviderCredential.filter(
    { organization_id, provider: provider.toLowerCase(), status: "active" },
    "-created_date", 10
  );
  if (creds.length === 0) return null;
  // Prefer the credential matching the current environment; fall back to any.
  return creds.find((c: any) => c.environment === environment) || creds[0];
}

// Exchange client_credentials for an access token. Throws a structured error on failure.
export async function exchangeClientCredentials(
  base_url: string,
  tokenPath: string,
  client_id: string,
  client_secret: string
): Promise<string> {
  const base = (base_url || "").replace(/\/$/, "");
  if (!base) throw { status: 400, code: "PROVIDER_CONFIG_ERROR", message: "Provider base_url is not configured." };
  const res = await fetch(`${base}${tokenPath}`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "client_credentials", client_id, client_secret })
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw { status: 502, code: "PROVIDER_AUTH_FAILED", message: `Provider token request failed (${res.status}). ${detail.slice(0, 200)}` };
  }
  const json: any = await res.json();
  if (!json.access_token) throw { status: 502, code: "PROVIDER_AUTH_FAILED", message: "Provider did not return an access_token." };
  return json.access_token as string;
}