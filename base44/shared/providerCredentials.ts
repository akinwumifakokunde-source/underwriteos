// Per-organization provider credential loading + shared OAuth/REST helpers.
// Used by the ingestion functions (apiCreditReport, apiBankStatement) to fetch
// the calling organization's own provider keys, and by apiProviders to test them.
//
// Every provider follows the same pattern: exchange client_credentials for an
// access token, then call a conventional REST endpoint. Providers without a
// configured endpoint path fall back to deterministic mock data so the sandbox
// works out of the box without live credentials.

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

// Credit bureau report endpoint paths (relative to base_url). Providers listed
// here perform a REAL bureau pull when org credentials are present.
export const PROVIDER_REPORT_PATHS: Record<string, string> = {
  experian: "/credit-report/v1/report",
  equifax: "/creditreport/v1/reports",
  transunion: "/v1/creditreport",
  crc: "/api/v1/credit-report",
  credit_registry: "/api/v1/credit-report",
  first_central: "/api/v1/credit-report",
  xds: "/api/v1/credit-report",
  crb_africa: "/api/v1/credit-report",
  iscore: "/api/v1/credit-report"
};

// Open banking accounts endpoint paths (relative to base_url). Providers listed
// here perform a REAL open banking pull when org credentials are present.
// Transactions are read from `{accountsPath}/{accountId}/transactions`.
export const PROVIDER_ACCOUNTS_PATHS: Record<string, string> = {
  truelayer: "/data/v1/accounts",
  yapily: "/accounts/v1/accounts",
  tink: "/api/v1/accounts",
  okra: "/api/v1/accounts",
  mono: "/v2/accounts",
  stitch: "/v1/accounts"
};

// Load the active credential for a provider in the EXACT environment of the
// calling API key. Sandbox calls use sandbox credentials; production calls use
// production credentials. No cross-environment fallback — environments stay
// isolated.
export async function getCredentials(
  base44: any,
  organization_id: string,
  provider: string,
  environment: string = "sandbox"
): Promise<ProviderCredentialRecord | null> {
  const creds = await base44.asServiceRole.entities.ProviderCredential.filter(
    { organization_id, provider: provider.toLowerCase(), environment, status: "active" },
    "-created_date", 10
  );
  return creds.length > 0 ? creds[0] : null;
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

function providerError(status: number, code: string, message: string) {
  return { status, code, message };
}

// Generic real credit bureau pull. Used by every bureau provider that has a
// configured report path. Throws a structured PROVIDER_* error on failure —
// never silently falls back to mock.
export async function realCreditFetch(provider: string, reference: string, opts: any = {}): Promise<any> {
  const { credentials, borrower, currency = "GBP" } = opts;
  const base = (credentials.base_url || "").replace(/\/$/, "");
  const reportPath = PROVIDER_REPORT_PATHS[provider];
  const tokenPath = PROVIDER_TOKEN_PATHS[provider];
  if (!base) throw providerError(400, "PROVIDER_CONFIG_ERROR", `Provider base_url is not configured for '${provider}'.`);
  if (!reportPath) throw providerError(400, "PROVIDER_CONFIG_ERROR", `No report endpoint configured for provider '${provider}'.`);
  if (!tokenPath) throw providerError(400, "PROVIDER_CONFIG_ERROR", `No token endpoint configured for provider '${provider}'.`);

  const token = await exchangeClientCredentials(base, tokenPath, credentials.client_id, credentials.client_secret);
  const res = await fetch(`${base}${reportPath}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      reference,
      borrower: {
        first_name: borrower?.first_name,
        last_name: borrower?.last_name,
        date_of_birth: borrower?.date_of_birth,
        address: borrower?.address
      }
    })
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw providerError(502, "PROVIDER_FETCH_FAILED", `${provider} report request failed (${res.status}). ${detail.slice(0, 200)}`);
  }
  const report: any = await res.json();
  return mapCreditReport(report, currency);
}

// Generic credit report normalizer. Handles common provider field-name variants.
export function mapCreditReport(report: any, currency: string): any {
  const score = report?.credit_score ?? report?.score ?? report?.creditScore ?? report?.creditBureauScore ?? null;
  return {
    credit_score: score,
    active_accounts: report?.active_accounts ?? report?.activeAccounts ?? report?.open_accounts ?? null,
    closed_accounts: report?.closed_accounts ?? report?.closedAccounts ?? null,
    delinquent_accounts: report?.delinquent_accounts ?? report?.delinquentAccounts ?? report?.delinquent ?? null,
    defaults: report?.defaults ?? report?.defaultAccounts ?? null,
    outstanding_balance: report?.outstanding_balance ?? report?.outstandingBalance ?? report?.total_outstanding ?? null,
    credit_utilisation: report?.credit_utilisation ?? report?.creditUtilisation ?? report?.utilization ?? null,
    recent_enquiries: report?.recent_enquiries ?? report?.recentEnquiries ?? report?.enquiries ?? null,
    repayment_history: report?.repayment_history ?? report?.repaymentHistory ?? report?.payment_history ?? null,
    currency
  };
}

// Generic real open banking pull. Used by every open banking provider that has
// a configured accounts path. Throws a structured error on failure.
export async function realOpenBankingFetch(provider: string, consentReference: string, opts: any = {}): Promise<any> {
  const { credentials, currency = "GBP" } = opts;
  const base = (credentials.base_url || "").replace(/\/$/, "");
  const accountsPath = PROVIDER_ACCOUNTS_PATHS[provider];
  const tokenPath = PROVIDER_TOKEN_PATHS[provider];
  if (!base) throw providerError(400, "PROVIDER_CONFIG_ERROR", `Provider base_url is not configured for '${provider}'.`);
  if (!accountsPath) throw providerError(400, "PROVIDER_CONFIG_ERROR", `No accounts endpoint configured for provider '${provider}'.`);
  if (!tokenPath) throw providerError(400, "PROVIDER_CONFIG_ERROR", `No token endpoint configured for provider '${provider}'.`);

  // consentReference is used as the user access token when it looks like one;
  // otherwise a client_credentials token is exchanged.
  let accessToken = consentReference;
  if (!accessToken || accessToken.length < 40) {
    accessToken = await exchangeClientCredentials(base, tokenPath, credentials.client_id, credentials.client_secret);
  }

  const accountsRes = await fetch(`${base}${accountsPath}`, { headers: { Authorization: `Bearer ${accessToken}` } });
  if (!accountsRes.ok) {
    const detail = await accountsRes.text().catch(() => "");
    throw providerError(502, "PROVIDER_FETCH_FAILED", `${provider} accounts request failed (${accountsRes.status}). ${detail.slice(0, 200)}`);
  }
  const accountsJson: any = await accountsRes.json();
  const accountList = accountsJson?.results || accountsJson?.accounts || accountsJson?.data || (Array.isArray(accountsJson) ? accountsJson : []);
  const account = accountList[0];
  if (!account) throw providerError(404, "NO_ACCOUNTS", `No bank accounts found for this ${provider} consent.`);
  const accountId = account.account_id || account.id || account.accountId || account.account_reference;
  if (!accountId) throw providerError(502, "PROVIDER_FETCH_FAILED", `${provider} returned an account with no id.`);

  const txRes = await fetch(`${base}${accountsPath}/${accountId}/transactions`, { headers: { Authorization: `Bearer ${accessToken}` } });
  if (!txRes.ok) {
    const detail = await txRes.text().catch(() => "");
    throw providerError(502, "PROVIDER_FETCH_FAILED", `${provider} transactions request failed (${txRes.status}). ${detail.slice(0, 200)}`);
  }
  const txJson: any = await txRes.json();
  const transactions = txJson?.results || txJson?.transactions || txJson?.data || (Array.isArray(txJson) ? txJson : []);
  return mapOpenBankingResult(account, transactions, currency);
}

// Generic open banking normalizer. Handles common provider field-name variants.
export function mapOpenBankingResult(account: any, transactions: any[], currency: string): any {
  const mapped = (transactions || []).map((t: any) => {
    const amt = t.amount != null ? Number(t.amount) : 0;
    const direction = t.direction || (amt >= 0 ? "credit" : "debit");
    return {
      date: (t.date || t.transaction_date || t.transaction_timestamp || t.timestamp || t.booking_date || "").slice(0, 10),
      description: t.description || t.merchant_name || t.name || t.narrative || "Transaction",
      amount: Math.abs(amt) * (direction === "credit" ? 1 : -1),
      direction,
      recurring: false
    };
  }).filter((t: any) => t.date);
  const dates = mapped.map((t: any) => t.date).sort();
  return {
    account: {
      account_number_masked:
        account.account_number?.mask?.number ||
        account.account_number?.last_digits ||
        account.masked_account_number ||
        account.iban?.slice?.(-4) ||
        "****",
      currency: account.currency || currency,
      period_start: dates[0] || "",
      period_end: dates[dates.length - 1] || ""
    },
    transactions: mapped
  };
}