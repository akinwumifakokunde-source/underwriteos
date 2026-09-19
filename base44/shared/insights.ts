// Shared configuration for the Insights auto-generation pipeline.
// Used by the apiInsights backend function (invoked by the Daily Insights workflow)
// to generate borderless, consumer-lending-focused articles that sell CreditDecide's
// features, innovation, and strategy — no country-specific constraints.

export const AUTHOR = {
  name: "CreditDecide",
  role: "Engineering & Risk Team",
  bio: "CreditDecide's engineering and risk team builds the AI-native underwriting operating system used by consumer lenders worldwide. These articles draw on the platform's real architecture — canonical financial profiles, structured risk signals, evidence lineage, and a versioned policy engine.",
};

// Borderless topic rotation. No country placeholders — every article is written for
// consumer lenders everywhere and focuses on our features, innovation, and strategy.
export const TOPICS = [
  { title: "No-Code Underwriting for Consumer Lenders", category: "Foundations", seoTerms: "no-code underwriting, visual policy builder, lending automation, consumer credit" },
  { title: "AI Underwriting for Personal Loans", category: "Technology", seoTerms: "AI underwriting, automated underwriting, machine learning credit decisions, personal loans" },
  { title: "Evidence-Backed Credit Decisions", category: "Technology", seoTerms: "evidence-backed decisions, decision lineage, explainable underwriting, credit decisioning" },
  { title: "Affordability Assessment for Consumer Credit", category: "Risk", seoTerms: "affordability assessment, debt-to-income, repayment capacity, consumer credit risk" },
  { title: "Explainable AI Underwriting", category: "Compliance", seoTerms: "explainable AI, responsible lending, adverse action, reason codes, compliant underwriting" },
  { title: "Document Intelligence for Loan Underwriting", category: "Technology", seoTerms: "document intelligence, document AI, bank statement extraction, loan underwriting automation" },
  { title: "Open Banking and Affordability", category: "Technology", seoTerms: "open banking, bank statement analysis, affordability assessment, cashflow underwriting" },
  { title: "Closed-Loop Model Monitoring for Lenders", category: "Risk", seoTerms: "model monitoring, probability of default, calibration, outcome tracking, credit risk" },
  { title: "White-Label Borrower Application Forms", category: "Foundations", seoTerms: "white-label forms, borrower onboarding, KYC, loan application, digital lending" },
  { title: "Batch Underwriting for Consumer Loan Portfolios", category: "Technology", seoTerms: "batch underwriting, portfolio underwriting, CSV underwriting, consumer loan portfolio" },
  { title: "Policy Versioning for Consumer Lenders", category: "Compliance", seoTerms: "policy versioning, policy engine, lending compliance, audit trail, consumer lending" },
  { title: "The Future of Consumer Credit Decisioning", category: "Markets", seoTerms: "consumer credit decisioning, lending innovation, underwriting strategy, fintech infrastructure" },
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

// Ensures generated markdown has real line breaks between blocks so it renders
// correctly (some LLMs collapse newlines in JSON string fields). Used by the
// apiInsights generator before storing; mirrored in src/lib/markdown.js for
// the public renderer.
export function normalizeMarkdown(content) {
  if (!content) return "";
  let s = String(content).trim();
  s = s.replace(/([^\n])\s*(#{2,3}\s)/g, "$1\n\n$2");
  s = s.replace(/([^\n])\s+(\d+\.\s)/g, "$1\n\n$2");
  s = s.replace(/ \| \| /g, " |\n| ");
  s = s.replace(/([.!?])\s+(\|)/g, "$1\n\n$2");
  return s.trim();
}

export function buildPrompt(topic) {
  const topicTitle = topic.title;
  return `You are a senior content writer for CreditDecide (creditdecide.com), an AI-native, no-code underwriting operating system for consumer lenders worldwide. Write a substantive, original, expert-level article for the company's public Insights blog.

ARTICLE TOPIC: ${topicTitle}

SEO REQUIREMENTS:
- Primary target keyword: "${topicTitle}". Use it naturally in the title, the opening paragraph, and at least two ## section headings.
- Include semantic keyword variations: ${topic.seoTerms}.
- Write a clear, honest, click-worthy title (max 70 characters) that contains the target keyword.
- The excerpt is a 1-2 sentence meta description (max 160 characters) that contains the target keyword.

POSITIONING REQUIREMENTS (CRITICAL):
- This article is BORDERLESS. Do NOT name or target any specific country, regulator, currency, or region. Write for consumer lenders everywhere — personal loans, instalment, and point-of-sale lenders operating in any market worldwide.
- Do NOT reference country-specific bureaus, regulators, or jurisdictions. Speak about credit bureaus, open banking, and regulation in universal terms (e.g. "credit bureaus", "open banking providers", "your regulator").
- The article must SELL CreditDecide. Frame every concept around our product: how our features solve the problem, the innovation behind them, and the strategic advantage they give lenders. This is product-led thought leadership, not neutral journalism.
- Emphasize our innovation and strategy: evidence-native underwriting, no-code policy building, AI-assisted risk analysis, closed-loop model monitoring, and being live in hours not quarters — for any market, worldwide.

CONTENT REQUIREMENTS:
- Audience: B2B consumer lenders, fintechs, and credit teams worldwide. Tone: authoritative, technical, practical, and persuasive — never generic AI marketing fluff or empty buzzwords.
- Length: 600-900 words.
- Structure as markdown: a short intro paragraph, 3-5 ## (H2) sections, and where useful ### (H3) subheadings, bullet lists, and one small comparison table if it adds clarity.
- CRITICAL FORMATTING: Use real newline characters to separate every paragraph, heading, table row, and list item. Never place two markdown blocks on the same line — each ## heading, ### subheading, table row, and numbered item must start on its own line, with a blank line between paragraphs.
- Ground the article in real underwriting concepts: canonical financial and credit profiles, structured risk signals across five dimensions (credit, affordability, fraud, data quality, policy), evidence lineage to source fields, a versioned no-code policy engine, document intelligence with confidence scores, and explainable APPROVE / REVIEW / DECLINE decisions.
- CreditDecide's actual capabilities (do not invent others): white-label borrower application forms with configurable KYC; live credit bureau and open banking data sources (or document upload); AI document classification and extraction; normalization into canonical profiles; structured risk signals with an evidence graph; a visual no-code policy builder with versioned, never-overwrite policies; an AI underwriter that produces advisory recommendations with probability of default and confidence; final lender decisions with override reasons; decision exports as PDF, CSV, and Word; sandbox and production environment isolation; support for any market worldwide.
- End with a short ## section titled "What this means for consumer lenders" with 2-3 practical takeaways that reinforce the strategic value of CreditDecide.

Return ONLY a JSON object with these fields:
- title: string (includes the target keyword, max 70 chars)
- excerpt: string (1-2 sentence summary, max 160 chars, includes the target keyword)
- content: string (the full article body in markdown — do NOT repeat the title; start directly with the intro paragraph)
- category: string (exactly one of: "Foundations", "Technology", "Compliance", "Risk", "Markets")
- seo_keywords: array of 5-8 keyword strings (include the target keyword)
- reading_time: integer (estimated minutes to read)
- related_features: array of 1-3 strings from this exact list: ["ai-underwriting", "credit-decisioning", "document-intelligence", "risk-assessment", "lending-policies", "explainable-decisions"]`;
}