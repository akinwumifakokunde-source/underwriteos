// Open banking provider abstraction.
// Turns a consent reference into normalized transactions without manual upload.
// All providers below are MOCK/test implementations — no live bank connection.
// Real providers (TrueLayer, Yapily, Plaid, Tink) can be plugged in behind the
// same interface by replacing fetch() with a live API call keyed on a secret.

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
  truelayer: mockProvider("truelayer"),
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

export function getOpenBankingProvider(name: string): OpenBankingProvider {
  return PROVIDERS[name?.toLowerCase()] || PROVIDERS.other;
}

export function listOpenBankingProviders(): string[] {
  return Object.keys(PROVIDERS);
}