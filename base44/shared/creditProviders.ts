// Credit bureau provider abstraction.
// The underwriting engine consumes a normalized CreditProfile, never provider-specific formats.
// Providers below are MOCK implementations — no external bureau is connected.

export interface CreditProvider {
  name: string;
  // Normalize a provider-specific raw payload into a standard CreditProfile.
  normalize(raw: any, currency?: string): NormalizedCreditProfile;
}

export interface NormalizedCreditProfile {
  credit_score: number;
  score_band: string;
  active_accounts: number;
  delinquent_accounts: number;
  defaults: number;
  outstanding_balance: number;
  credit_utilisation: number; // 0..1
  credit_enquiries: number;
  repayment_history_score: number; // 0..100
  currency: string;
}

const PROVIDERS: Record<string, CreditProvider> = {
  experian: mockProvider("experian"),
  equifax: mockProvider("equifax"),
  transunion: mockProvider("transunion"),
  crc: mockProvider("crc"),
  credit_registry: mockProvider("credit_registry"),
  first_central: mockProvider("first_central"),
  mock: mockProvider("mock")
};

function mockProvider(name: string): CreditProvider {
  return {
    name,
    normalize(raw: any, currency = "GBP"): NormalizedCreditProfile {
      // If the client passed already-normalized fields, prefer them.
      if (raw && (raw.credit_score !== undefined || raw.creditScore !== undefined)) {
        return coerceProfile(raw, currency);
      }
      // Otherwise derive a deterministic mock profile from raw seed data.
      const seed = raw?.borrower_id || raw?.seed || JSON.stringify(raw).slice(0, 32) || name;
      const h = hash(seed);
      return {
        credit_score: 500 + (h % 300), // 500..799
        score_band: "",
        active_accounts: 2 + (h % 6),
        delinquent_accounts: h % 3,
        defaults: h % 2,
        outstanding_balance: 800 + (h % 9000),
        credit_utilisation: ((h % 70) / 100),
        credit_enquiries: h % 5,
        repayment_history_score: 60 + (h % 40),
        currency
      };
    }
  };
}

function coerceProfile(raw: any, currency: string): NormalizedCreditProfile {
  const score = raw.credit_score ?? raw.creditScore ?? 650;
  return {
    credit_score: score,
    score_band: scoreBand(score),
    active_accounts: raw.active_accounts ?? raw.activeAccounts ?? 3,
    delinquent_accounts: raw.delinquent_accounts ?? raw.delinquentAccounts ?? 0,
    defaults: raw.defaults ?? 0,
    outstanding_balance: raw.outstanding_balance ?? raw.outstandingBalance ?? 0,
    credit_utilisation: raw.credit_utilisation ?? raw.creditUtilisation ?? 0.3,
    credit_enquiries: raw.credit_enquiries ?? raw.creditEnquiries ?? 1,
    repayment_history_score: raw.repayment_history_score ?? raw.repaymentHistoryScore ?? 90,
    currency: raw.currency ?? currency
  };
}

export function scoreBand(score: number): string {
  if (score >= 750) return "excellent";
  if (score >= 650) return "good";
  if (score >= 550) return "fair";
  return "poor";
}

export function getProvider(name: string): CreditProvider {
  return PROVIDERS[name?.toLowerCase()] || PROVIDERS.mock;
}

export function listProviders(): string[] {
  return Object.keys(PROVIDERS);
}

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}