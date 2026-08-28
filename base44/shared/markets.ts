// Six-market configuration shared across the ingestion + underwriting pipeline.
// Single source of truth for per-market currency, default credit bureau, default
// open banking provider, default policy id and regulatory profile label.
// Mirrors the frontend jurisdictions config so backend defaults stay consistent
// with what lenders see in the workspace.

export interface MarketConfig {
  code: string;
  name: string;
  currency: string;
  regulatoryProfile: string;
  defaultPolicyId: string;
  defaultCreditBureau: string;
  defaultOpenBankingProvider: string;
}

export const MARKETS: Record<string, MarketConfig> = {
  GB: { code: "GB", name: "United Kingdom", currency: "GBP", regulatoryProfile: "UK Consumer Credit", defaultPolicyId: "consumer-v1", defaultCreditBureau: "experian", defaultOpenBankingProvider: "truelayer" },
  US: { code: "US", name: "United States", currency: "USD", regulatoryProfile: "US Consumer Lending", defaultPolicyId: "us-consumer-v2", defaultCreditBureau: "experian", defaultOpenBankingProvider: "plaid" },
  NG: { code: "NG", name: "Nigeria", currency: "NGN", regulatoryProfile: "Nigeria Consumer Lending", defaultPolicyId: "ng-consumer-v1", defaultCreditBureau: "crc", defaultOpenBankingProvider: "okra" },
  ZA: { code: "ZA", name: "South Africa", currency: "ZAR", regulatoryProfile: "South Africa Consumer Credit", defaultPolicyId: "za-consumer-v1", defaultCreditBureau: "xds", defaultOpenBankingProvider: "stitch" },
  KE: { code: "KE", name: "Kenya", currency: "KES", regulatoryProfile: "Kenya Consumer Lending", defaultPolicyId: "ke-consumer-v1", defaultCreditBureau: "crb_africa", defaultOpenBankingProvider: "okra" },
  GH: { code: "GH", name: "Ghana", currency: "GHS", regulatoryProfile: "Ghana Consumer Lending", defaultPolicyId: "gh-consumer-v1", defaultCreditBureau: "xds", defaultOpenBankingProvider: "mono" }
};

export const SUPPORTED_MARKETS = Object.keys(MARKETS);

export function getMarket(code: string | undefined | null): MarketConfig {
  return (code && MARKETS[code.toUpperCase()]) || MARKETS.GB;
}

export function getCurrency(code?: string | null): string {
  return getMarket(code).currency;
}

export function getDefaultPolicyId(code?: string | null): string {
  return getMarket(code).defaultPolicyId;
}

export function getDefaultCreditBureau(code?: string | null): string {
  return getMarket(code).defaultCreditBureau;
}

export function getDefaultOpenBankingProvider(code?: string | null): string {
  return getMarket(code).defaultOpenBankingProvider;
}

export function getRegulatoryProfile(code?: string | null): string {
  return getMarket(code).regulatoryProfile;
}