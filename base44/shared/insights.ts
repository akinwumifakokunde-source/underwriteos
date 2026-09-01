// Shared configuration for the Insights auto-generation pipeline.
// Used by the apiInsights backend function (invoked by the Daily Insights workflow)
// to rotate across the six supported markets and generate SEO/GEO-optimized articles.

export const AUTHOR = {
  name: "CreditDecide",
  role: "Engineering & Risk Team",
  bio: "CreditDecide's engineering and risk team builds the AI-native underwriting operating system used by lenders across six markets. These articles draw on the platform's real architecture — canonical financial profiles, structured risk signals, evidence lineage, and a versioned policy engine.",
};

// The six supported lending markets. The generator rotates through these.
export const MARKETS = [
  {
    code: "GB",
    short: "the UK",
    geo: "the United Kingdom",
    bureaus: "Experian, Equifax, and TransUnion",
    regulator: "the Financial Conduct Authority (FCA)",
    currency: "GBP (British pound)",
    openBanking: "Open Banking standard (TrueLayer, Yapily)",
  },
  {
    code: "US",
    short: "the US",
    geo: "the United States",
    bureaus: "Experian, Equifax, and TransUnion",
    regulator: "the CFPB and state-level regulators",
    currency: "USD (US dollar)",
    openBanking: "plaid-based open banking and data aggregation",
  },
  {
    code: "NG",
    short: "Nigeria",
    geo: "Nigeria",
    bureaus: "CRC Credit Bureau, FirstCentral, and CreditRegistry",
    regulator: "the Central Bank of Nigeria (CBN)",
    currency: "NGN (naira)",
    openBanking: "Open Banking Nigeria framework",
  },
  {
    code: "ZA",
    short: "South Africa",
    geo: "South Africa",
    bureaus: "TransUnion, Experian, XDS, and Compuscan",
    regulator: "the National Credit Regulator (NCR)",
    currency: "ZAR (rand)",
    openBanking: "limited open banking with growing data aggregation",
  },
  {
    code: "KE",
    short: "Kenya",
    geo: "Kenya",
    bureaus: "CRB Africa, Metropol, and TransUnion Kenya",
    regulator: "the Central Bank of Kenya (CBK)",
    currency: "KES (Kenyan shilling)",
    openBanking: "Kenya Open Banking and mobile-money-linked data",
  },
  {
    code: "GH",
    short: "Ghana",
    geo: "Ghana",
    bureaus: "Ghana Credit Bureau (XDS, Hudson & Allen)",
    regulator: "the Bank of Ghana (BoG)",
    currency: "GHS (cedi)",
    openBanking: "an emerging open banking ecosystem",
  },
];

// Topic templates rotated against the markets. {country} is replaced with the market short name.
export const TOPICS = [
  { title: "AI Underwriting in {country}", category: "Markets", seoTerms: "AI underwriting, automated underwriting, machine learning credit decisions" },
  { title: "Credit Decisioning in {country}", category: "Markets", seoTerms: "credit decisioning, loan decision automation, credit decision engine" },
  { title: "Digital Lending in {country}", category: "Markets", seoTerms: "digital lending, online lending, lending technology" },
  { title: "Credit Infrastructure for Lenders in {country}", category: "Technology", seoTerms: "credit infrastructure, lending infrastructure, credit data APIs" },
  { title: "Compliant AI Underwriting Systems in {country}", category: "Compliance", seoTerms: "compliant underwriting, regulatory compliance, responsible lending" },
  { title: "Open Banking and Credit Risk Assessment in {country}", category: "Technology", seoTerms: "open banking, bank statement analysis, affordability assessment" },
  { title: "Automated Loan Decisions for Lenders in {country}", category: "Foundations", seoTerms: "automated loan decisions, loan origination automation, decisioning" },
  { title: "Credit Bureau Integration and Data Sources in {country}", category: "Technology", seoTerms: "credit bureau integration, credit data, data sources" },
  { title: "Explainable Credit Decisions for Borrowers in {country}", category: "Compliance", seoTerms: "explainable credit decisions, adverse action, reason codes" },
  { title: "Document Intelligence for Loan Underwriting in {country}", category: "Technology", seoTerms: "document intelligence, document AI, bank statement extraction" },
  { title: "Affordability Assessment and Debt-to-Income in {country}", category: "Risk", seoTerms: "affordability assessment, debt-to-income, repayment capacity" },
  { title: "No-Code Underwriting for Modern Lenders in {country}", category: "Foundations", seoTerms: "no-code underwriting, visual policy builder, lending automation" },
];

export const FEATURE_SLUGS = [
  "ai-underwriting",
  "credit-decisioning",
  "document-intelligence",
  "risk-assessment",
  "lending-policies",
  "explainable-decisions",
];

export function slugify(s) {
  return String(s)
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

export function buildPrompt(market, topic) {
  const country = market.geo;
  const topicTitle = topic.title.replace("{country}", market.short);
  return `You are a senior content writer for CreditDecide (creditdecide.com), an AI-native, no-code underwriting operating system for lenders and fintechs. Write a substantive, original, expert-level article for the company's public Insights blog.

TARGET MARKET: ${country} (code: ${market.code})
ARTICLE TOPIC: ${topicTitle}

SEO REQUIREMENTS:
- Primary target keyword: "${topicTitle}". Use it naturally in the title, the opening paragraph, and at least two ## section headings.
- Include semantic keyword variations: ${topic.seoTerms}.
- Write a clear, honest, click-worthy title (max 70 characters) that contains the target keyword and the country.
- The excerpt is a 1-2 sentence meta description (max 160 characters) that contains the target keyword.

GEO REQUIREMENTS:
- The article is geo-targeted at ${country}. Name ${country} explicitly throughout (aim for 4-6 mentions).
- Reference ${country}-specific lending context where accurate:
  - Credit bureaus active in this market: ${market.bureaus}.
  - Primary regulator: ${market.regulator}.
  - Currency: ${market.currency}.
  - Open banking / data connectivity: ${market.openBanking}.
- Mention realistic market considerations for lenders operating in ${country} (regulatory expectations, data availability, borrower segments).

CONTENT REQUIREMENTS:
- Audience: B2B lenders, fintechs, and credit teams in ${country}. Tone: authoritative, technical, practical — never generic AI marketing fluff or empty buzzwords.
- Length: 600-900 words.
- Structure as markdown: a short intro paragraph, 3-5 ## (H2) sections, and where useful ### (H3) subheadings, bullet lists, and one small comparison table if it adds clarity.
- Ground the article in real underwriting concepts: canonical financial and credit profiles, structured risk signals across five dimensions (credit, affordability, fraud, data quality, policy), evidence lineage to source fields, a versioned no-code policy engine, document intelligence with confidence scores, and explainable APPROVE / REVIEW / DECLINE decisions.
- CreditDecide's actual capabilities (do not invent others): white-label borrower application forms with market-specific KYC; live credit bureau and open banking data sources (or document upload); AI document classification and extraction; normalization into canonical profiles; structured risk signals with an evidence graph; a visual no-code policy builder with versioned, never-overwrite policies; an AI underwriter that produces advisory recommendations with probability of default and confidence; final lender decisions with override reasons; decision exports as PDF, CSV, and Word; sandbox and production environment isolation; support for six markets (UK, US, Nigeria, South Africa, Kenya, Ghana).
- End with a short ## section titled "What this means for lenders in ${market.short}" with 2-3 practical takeaways.

Return ONLY a JSON object with these fields:
- title: string (includes the target keyword and country, max 70 chars)
- excerpt: string (1-2 sentence summary, max 160 chars, includes the target keyword)
- content: string (the full article body in markdown — do NOT repeat the title; start directly with the intro paragraph)
- category: string (exactly one of: "Foundations", "Technology", "Compliance", "Risk", "Markets")
- seo_keywords: array of 5-8 keyword strings (include the target keyword and the country name)
- reading_time: integer (estimated minutes to read)
- related_features: array of 1-3 strings from this exact list: ["ai-underwriting", "credit-decisioning", "document-intelligence", "risk-assessment", "lending-policies", "explainable-decisions"]`;
}