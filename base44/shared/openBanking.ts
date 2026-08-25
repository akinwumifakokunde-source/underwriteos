// Open banking provider abstraction.
// Turns a consent reference into normalized transactions without manual upload.
// Providers fall back to deterministic MOCK data when no org credentials are
// configured, and make a REAL Open Banking call when credentials are passed in
// opts.credentials.
import { PROVIDER_TOKEN_PATHS, PROVIDER_ACCOUNTS_PATHS, realOpenBankingFetch } from "./providerCredentials.ts";

export type OpenBankingProviderName =
  | "truelayer" | "yapily" | "plaid" | "tink" | "okra" | "mono" | "stitch"
  | "mock" | "other";

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
  fetch(consentReference: string, opts?: { currency?: string; borrower?: any; credentials?: any }): Promise<OpenBankingResult>;
}

const PROVIDERS: Record<string, OpenBankingProvider> = {
  truelayer: genericOpenBankingProvider("truelayer"),
  yapily: genericOpenBankingProvider("yapily"),
  plaid: genericOpenBankingProvider("plaid"),
  tink: genericOpenBankingProvider("tink"),
  okra: genericOpenBankingProvider("okra"),
  mono: genericOpenBankingProvider("mono"),
  stitch: genericOpenBankingProvider("stitch"),
  mock: mockProvider("mock"),
  other: mockProvider("other")
};

function mockProvider(name: OpenBankingProviderName): OpenBankingProvider {
  return {
    name,
    async fetch(consentReference: string, opts: any = {}): Promise<OpenBankingResult> {
      const currency = opts.currency || "GBP";
      const borrower = opts.borrower || {};
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

// Generic provider: real open banking pull when credentials are present and an
// accounts endpoint is configured for this provider; deterministic mock otherwise.
// (Plaid uses a link-flow auth model, not client_credentials, so it has no
// accounts path configured and stays on mock until a link flow is wired.)
function genericOpenBankingProvider(name: OpenBankingProviderName): OpenBankingProvider {
  const mock = mockProvider(name);
  return {
    name,
    async fetch(consentReference: string, opts: any = {}) {
      if (opts.credentials && PROVIDER_ACCOUNTS_PATHS[name]) {
        return realOpenBankingFetch(name, consentReference, opts);
      }
      return mock.fetch(consentReference, opts);
    }
  };
}

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

// Whether a real (live) open banking pull is supported for this provider when credentials exist.
export function isRealOpenBankingProvider(name: string): boolean {
  return !!PROVIDER_ACCOUNTS_PATHS[name?.toLowerCase()];
}

export function getOpenBankingProvider(name: string): OpenBankingProvider {
  return PROVIDERS[name?.toLowerCase()] || PROVIDERS.other;
}

export function listOpenBankingProviders(): string[] {
  return Object.keys(PROVIDERS);
}

export { PROVIDER_TOKEN_PATHS, PROVIDER_ACCOUNTS_PATHS };