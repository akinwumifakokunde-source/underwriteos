// Credit bureau provider abstraction.
// The underwriting engine consumes a normalized CreditProfile, never provider-specific formats.
// All providers below are MOCK/test implementations — no external bureau is connected.
// Never hard-code provider-specific fields into the underwriting engine.

export type CreditProviderName =
  | "experian" | "equifax" | "transunion" | "crc"
  | "credit_registry" | "first_central" | "mock" | "other";

export interface CreditProvider {
  name: CreditProviderName;
  // Normalize a provider-specific raw payload into a standard CreditProfile.
  // Every field is nullable — providers do not all supply every field.
  normalize(raw: any, currency?: string): NormalizedCreditProfile;
  // Automated bureau pull: fetch a credit report by reference (no manual upload).
  // Mock providers generate deterministic synthetic data; real providers call the bureau API.
  fetch(reference: string, opts?: { currency?: string; borrower?: any }): Promise<any>;
}

export interface NormalizedCreditProfile {
  credit_score: number | null;
  score_band: string | null;
  active_accounts: number | null;
  closed_accounts: number | null;
  delinquent_accounts: number | null;
  defaults: number | null;
  outstanding_balance: number | null;
  credit_utilisation: number | null; // 0..1
  recent_enquiries: number | null;
  repayment_history: number | null; // 0..100
  currency: string;
}

const PROVIDERS: Record<string, CreditProvider> = {
  experian: mockProvider("experian"),
  equifax: mockProvider("equifax"),
  transunion: mockProvider("transunion"),
  crc: mockProvider("crc"),
  credit_registry: mockProvider("credit_registry"),
  first_central: mockProvider("first_central"),
  mock: mockProvider("mock"),
  other: mockProvider("other")
};

function hash(s: string | any): number {
  const str = String(s ?? "");
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return h;
}

function mockProvider(name: CreditProviderName): CreditProvider {
  return {
    name,
    normalize(raw: any, currency = "GBP"): NormalizedCreditProfile {
      // If the client passed already-normalized fields, prefer them (nullable-aware).
      if (raw && (raw.credit_score !== undefined || raw.creditScore !== undefined ||
                  raw.active_accounts !== undefined || raw.recent_enquiries !== undefined)) {
        return coerceProfile(raw, currency);
      }
      // Otherwise derive a deterministic mock profile from raw seed data.
      const seed = raw?.borrower_id || raw?.seed || JSON.stringify(raw).slice(0, 32) || name;
      const h = hash(seed);
      return {
        credit_score: 500 + (h % 300), // 500..799
        score_band: "",
        active_accounts: 2 + (h % 6),
        closed_accounts: h % 4,
        delinquent_accounts: h % 3,
        defaults: h % 2,
        outstanding_balance: 800 + (h % 9000),
        credit_utilisation: ((h % 70) / 100),
        recent_enquiries: h % 5,
        repayment_history: 60 + (h % 40),
        currency
      };
    },
    async fetch(reference: string, opts: any = {}): Promise<any> {
      const currency = opts.currency || "GBP";
      const seed = reference || opts.borrower?.borrower_reference || name;
      const h = hash(seed);
      return {
        credit_score: 500 + (h % 300),
        active_accounts: 2 + (h % 6),
        closed_accounts: h % 4,
        delinquent_accounts: h % 3,
        defaults: h % 2,
        outstanding_balance: 800 + (h % 9000),
        credit_utilisation: ((h % 70) / 100),
        recent_enquiries: h % 5,
        repayment_history: 60 + (h % 40),
        currency
      };
    }
  };
}

function coerceProfile(raw: any, currency: string): NormalizedCreditProfile {
  const score = raw.credit_score ?? raw.creditScore ?? null;
  return {
    credit_score: score,
    score_band: score != null ? scoreBand(score) : null,
    active_accounts: raw.active_accounts ?? raw.activeAccounts ?? null,
    closed_accounts: raw.closed_accounts ?? raw.closedAccounts ?? null,
    delinquent_accounts: raw.delinquent_accounts ?? raw.delinquentAccounts ?? null,
    defaults: raw.defaults ?? null,
    outstanding_balance: raw.outstanding_balance ?? raw.outstandingBalance ?? null,
    credit_utilisation: raw.credit_utilisation ?? raw.creditUtilisation ?? null,
    recent_enquiries: raw.recent_enquiries ?? raw.recentEnquiries ?? raw.credit_enquiries ?? raw.creditEnquiries ?? null,
    repayment_history: raw.repayment_history ?? raw.repaymentHistory ?? raw.repayment_history_score ?? raw.repaymentHistoryScore ?? null,
    currency: raw.currency ?? currency
  };
}

export function scoreBand(score: number | null): string | null {
  if (score == null) return null;
  if (score >= 750) return "excellent";
  if (score >= 650) return "good";
  if (score >= 550) return "fair";
  return "poor";
}

export function getProvider(name: string): CreditProvider {
  return PROVIDERS[name?.toLowerCase()] || PROVIDERS.other;
}

export function listProviders(): string[] {
  return Object.keys(PROVIDERS);
}