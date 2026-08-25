// Credit bureau provider abstraction.
// The underwriting engine consumes a normalized CreditProfile, never provider-specific formats.
// Providers fall back to deterministic MOCK data when no org credentials are configured,
// and make a REAL bureau call when credentials are passed in opts.credentials.
// Never hard-code provider-specific fields into the underwriting engine.
import { exchangeClientCredentials, PROVIDER_TOKEN_PATHS } from "./providerCredentials.ts";

export type CreditProviderName =
  | "experian" | "equifax" | "transunion" | "crc"
  | "credit_registry" | "first_central" | "xds" | "crb_africa" | "iscore"
  | "mock" | "other";

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
  experian: experianProvider(),
  equifax: mockProvider("equifax"),
  transunion: mockProvider("transunion"),
  crc: mockProvider("crc"),
  credit_registry: mockProvider("credit_registry"),
  first_central: mockProvider("first_central"),
  xds: mockProvider("xds"),
  crb_africa: mockProvider("crb_africa"),
  iscore: mockProvider("iscore"),
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

// Real Experian pull. Requires org credentials (client_id, client_secret, base_url).
// Throws a structured PROVIDER_* error on failure — never silently falls back to mock.
async function realExperianFetch(reference: string, opts: any = {}): Promise<any> {
  const { credentials, borrower, currency = "GBP" } = opts;
  const base = (credentials.base_url || "https://api-sandbox.experian.com").replace(/\/$/, "");
  const token = await exchangeClientCredentials(base, PROVIDER_TOKEN_PATHS.experian, credentials.client_id, credentials.client_secret);
  const res = await fetch(`${base}/credit-report/v1/report`, {
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
    throw { status: 502, code: "PROVIDER_FETCH_FAILED", message: `Experian report request failed (${res.status}). ${detail.slice(0, 200)}` };
  }
  const report: any = await res.json();
  return mapExperianReport(report, currency);
}

function mapExperianReport(report: any, currency: string): any {
  const score = report?.credit_score ?? report?.score ?? report?.creditScore ?? null;
  return {
    credit_score: score,
    active_accounts: report?.active_accounts ?? report?.activeAccounts ?? null,
    closed_accounts: report?.closed_accounts ?? report?.closedAccounts ?? null,
    delinquent_accounts: report?.delinquent_accounts ?? report?.delinquentAccounts ?? null,
    defaults: report?.defaults ?? null,
    outstanding_balance: report?.outstanding_balance ?? report?.outstandingBalance ?? null,
    credit_utilisation: report?.credit_utilisation ?? report?.creditUtilisation ?? null,
    recent_enquiries: report?.recent_enquiries ?? report?.recentEnquiries ?? null,
    repayment_history: report?.repayment_history ?? report?.repaymentHistory ?? null,
    currency
  };
}

function experianProvider(): CreditProvider {
  const mock = mockProvider("experian");
  return {
    name: "experian",
    normalize: mock.normalize,
    async fetch(reference: string, opts: any = {}) {
      if (opts.credentials) return realExperianFetch(reference, opts);
      return mock.fetch(reference, opts);
    }
  };
}

export function getProvider(name: string): CreditProvider {
  return PROVIDERS[name?.toLowerCase()] || PROVIDERS.other;
}

export function listProviders(): string[] {
  return Object.keys(PROVIDERS);
}