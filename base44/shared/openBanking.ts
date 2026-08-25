// Open banking provider abstraction.
// Turns a consent reference into normalized transactions without manual upload.
// Providers fall back to deterministic MOCK data when no org credentials are
// configured, and make a REAL Open Banking call when credentials are passed in
// opts.credentials. Real providers (TrueLayer, Yapily, Plaid, Tink) plug in
// behind the same interface.
import { exchangeClientCredentials, PROVIDER_TOKEN_PATHS } from "./providerCredentials.ts";

export type OpenBankingProviderName =
  | "truelayer" | "yapily" | "plaid" | "tink" | "mock" | "other";

export interface OpenBankingAccount {
  account_number_masked: string;
  currency: string;
  period_start: string;
  period_end: string;
}

export interface OpenBankingResult {
  account: OpenBankingAccount;
  transactions: any[]; // provider-format transactions, fed into normalizeTransactions
}

export interface OpenBankingProvider {
  name: OpenBankingProviderName;
  // Fetch transactions for a consent/requisition reference. Mock generates
  // deterministic synthetic data so the sandbox works without a live bank link.
  fetch(consentReference: string, opts?: { currency?: string; borrower?: any }): Promise<OpenBankingResult>;
}

const PROVIDERS: Record<string, OpenBankingProvider> = {
  truelayer: truelayerProvider(),
  yapily: mockProvider("yapily"),
  plaid: mockProvider("plaid"),
  tink: mockProvider("tink"),
  mock: mockProvider("mock"),
  other: mockProvider("other")
};

function mockProvider(name: OpenBankingProviderName): OpenBankingProvider {
  return {
    name,
    async fetch(consentReference: string, opts: any = {}): Promise<OpenBankingResult> {
      const currency = opts.currency || "GBP";
      const borrower = opts.borrowor || {};
      const h = hash(consentReference || name);
      const monthlyIncome = borrower?.annual_income
        ? Math.round(borrower.annual_income / 12)
        : 3200 + (h % 1800);
      const employer = borrower?.employer_name || "Acme Corp Ltd";
      const rent = 900 + (h % 600);
      const living = 400 + (h % 400);
      const debt = 150 + (h % 350);

      const today = new Date();
      const transactions: any[] = [];
      for (let m = 2; m >= 0; m--) {
        const d = new Date(today.getFullYear(), today.getMonth() - m, 1);
        const mm = String(d.getMonth() + 1).padStart(2, "0");
        const yyyy = d.getFullYear();
        transactions.push({ date: `${yyyy}-${mm}-25`, description: `Salary ${employer}`, amount: monthlyIncome, direction: "credit" });
        transactions.push({ date: `${yyyy}-${mm}-01`, description: "Rent & utilities", amount: -rent, direction: "debit", recurring: true });
        transactions.push({ date: `${yyyy}-${mm}-15`, description: "Loan repayment", amount: -debt, direction: "debit", recurring: true });
        transactions.push({ date: `${yyyy}-${mm}-20`, description: "Groceries & transport", amount: -living, direction: "debit" });
      }
      const dates = transactions.map(t => t.date).sort();
      return {
        account: {
          account_number_masked: `****${1000 + (h % 8999)}`,
          currency,
          period_start: dates[0],
          period_end: dates[dates.length - 1]
        },
        transactions
      };
    }
  };
}

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

// Real TrueLayer pull. Requires org credentials (client_id, client_secret, base_url).
// consentReference is used as the user access token when it looks like one; otherwise
// a client_credentials token is exchanged. Throws a structured error on failure.
async function realTruelayerFetch(consentReference: string, opts: any = {}): Promise<OpenBankingResult> {
  const { credentials, currency = "GBP" } = opts;
  const base = (credentials.base_url || "https://api.truelayer-sandbox.com").replace(/\/$/, "");
  let accessToken = consentReference;
  if (!accessToken || accessToken.length < 40) {
    accessToken = await exchangeClientCredentials(base, PROVIDER_TOKEN_PATHS.truelayer, credentials.client_id, credentials.client_secret);
  }
  const accountsRes = await fetch(`${base}/data/v1/accounts`, { headers: { Authorization: `Bearer ${accessToken}` } });
  if (!accountsRes.ok) {
    const detail = await accountsRes.text().catch(() => "");
    throw { status: 502, code: "PROVIDER_FETCH_FAILED", message: `TrueLayer accounts request failed (${accountsRes.status}). ${detail.slice(0, 200)}` };
  }
  const accountsJson: any = await accountsRes.json();
  const account = accountsJson?.results?.[0];
  if (!account) throw { status: 404, code: "NO_ACCOUNTS", message: "No bank accounts found for this consent." };
  const txRes = await fetch(`${base}/data/v1/accounts/${account.account_id}/transactions`, { headers: { Authorization: `Bearer ${accessToken}` } });
  if (!txRes.ok) {
    const detail = await txRes.text().catch(() => "");
    throw { status: 502, code: "PROVIDER_FETCH_FAILED", message: `TrueLayer transactions request failed (${txRes.status}). ${detail.slice(0, 200)}` };
  }
  const txJson: any = await txRes.json();
  return mapTruelayerResult(account, txJson?.results || [], currency);
}

function mapTruelayerResult(account: any, transactions: any[], currency: string): OpenBankingResult {
  const mapped = (transactions || []).map((t: any) => ({
    date: (t.transaction_timestamp || t.timestamp || t.date || "").slice(0, 10),
    description: t.description || t.merchant_name || t.name || "Transaction",
    amount: t.amount != null ? Number(t.amount) : 0,
    direction: (t.amount != null && Number(t.amount) >= 0) ? "credit" : "debit",
    recurring: false
  }));
  const dates = mapped.map((t: any) => t.date).filter(Boolean).sort();
  return {
    account: {
      account_number_masked: account.account_number?.mask?.number || account.account_number?.last_digits || "****",
      currency: account.currency || currency,
      period_start: dates[0] || "",
      period_end: dates[dates.length - 1] || ""
    },
    transactions: mapped
  };
}

function truelayerProvider(): OpenBankingProvider {
  const mock = mockProvider("truelayer");
  return {
    name: "truelayer",
    async fetch(consentReference: string, opts: any = {}) {
      if (opts.credentials) return realTruelayerFetch(consentReference, opts);
      return mock.fetch(consentReference, opts);
    }
  };
}

export function getOpenBankingProvider(name: string): OpenBankingProvider {
  return PROVIDERS[name?.toLowerCase()] || PROVIDERS.other;
}

export function listOpenBankingProviders(): string[] {
  return Object.keys(PROVIDERS);
}