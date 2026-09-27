// Shared configuration for the Insights auto-generation pipeline.
// Used by the apiInsights backend function (invoked by the Daily Insights workflow)
// to generate one article per weekday, rotating across five content pillars:
//   A (Mon) AI Underwriting · B (Tue) Credit Decisioning · C (Wed) Document Intelligence
//   D (Thu) Lending Operations · E (Fri) AI + Responsible Lending (flagship)
// Friday's pillar positions CreditDecide as the infrastructure layer for responsible
// AI underwriting, anchored to the FCA's 2026 AI agenda where relevant.

export const AUTHOR = {
  name: "CreditDecide",
  role: "Engineering & Risk Team",
  bio: "CreditDecide's engineering and risk team builds the AI-native underwriting operating system used by consumer lenders worldwide. These articles draw on the platform's real architecture — canonical financial profiles, structured risk signals, evidence lineage, and a versioned policy engine.",
};

// Five content pillars, one per weekday. Each pillar carries its own category,
// a feature hint for cross-linking, and an ordered list of article topics.
export const PILLARS = {
  A: {
    label: "AI Underwriting",
    category: "Technology",
    weekday: 1, // Monday
    featureHint: "ai-underwriting",
    topics: [
      { title: "What Is AI-Native Underwriting?", seoTerms: "ai-native underwriting, automated underwriting, machine learning credit decisions, consumer lending", relatedFeatures: ["ai-underwriting"] },
      { title: "AI Underwriting vs Traditional Underwriting", seoTerms: "ai vs traditional underwriting, manual underwriting, underwriting automation, credit risk", relatedFeatures: ["ai-underwriting"] },
      { title: "How AI Underwriting Works, Step by Step", seoTerms: "how ai underwriting works, underwriting pipeline, ai credit decisioning, loan underwriting", relatedFeatures: ["ai-underwriting", "credit-decisioning"] },
      { title: "The 5 Risk Dimensions Every AI Underwriter Should Score", seoTerms: "risk dimensions, credit risk, affordability, fraud detection, data quality, policy risk", relatedFeatures: ["risk-assessment", "ai-underwriting"] },
      { title: "From Probability of Default to Decision: Reading an AI Risk Score", seoTerms: "probability of default, risk score, ai credit decision, credit risk modelling", relatedFeatures: ["ai-underwriting", "risk-assessment"] },
      { title: "What Confidence Means in an AI Recommendation", seoTerms: "ai confidence score, underwriting recommendation, model confidence, credit decisioning", relatedFeatures: ["ai-underwriting", "explainable-decisions"] },
    ],
  },
  B: {
    label: "Credit Decisioning",
    category: "Foundations",
    weekday: 2, // Tuesday
    featureHint: "credit-decisioning",
    topics: [
      { title: "What Is a Credit Decision Engine?", seoTerms: "credit decision engine, decisioning system, credit policy engine, automated decisioning", relatedFeatures: ["credit-decisioning", "lending-policies"] },
      { title: "APPROVE vs REVIEW vs DECLINE: When to Use Each", seoTerms: "approve review decline, credit decision outcomes, underwriting decision, consumer credit", relatedFeatures: ["credit-decisioning"] },
      { title: "How to Build Explainable Credit Decisions", seoTerms: "explainable credit decisions, decision explainability, ai underwriting, adverse action", relatedFeatures: ["explainable-decisions", "credit-decisioning"] },
      { title: "Adverse-Action Notices and Reason Codes, Explained", seoTerms: "adverse action notice, reason codes, credit decline, regulator compliance, lending", relatedFeatures: ["explainable-decisions", "credit-decisioning"] },
      { title: "Why Every Credit Decision Needs an Evidence Graph", seoTerms: "evidence graph, decision lineage, explainable underwriting, credit decision audit", relatedFeatures: ["explainable-decisions", "credit-decisioning"] },
      { title: "Policy vs AI: Who Actually Makes the Decision?", seoTerms: "policy vs ai, human in the loop, underwriting decision, lender override, credit policy", relatedFeatures: ["credit-decisioning", "lending-policies"] },
    ],
  },
  C: {
    label: "Document Intelligence",
    category: "Technology",
    weekday: 3, // Wednesday
    featureHint: "document-intelligence",
    topics: [
      { title: "How to Extract Income From Bank Statements", seoTerms: "bank statement extraction, income extraction, open banking, affordability, underwriting", relatedFeatures: ["document-intelligence", "risk-assessment"] },
      { title: "Why Document AI Fails in Credit Underwriting", seoTerms: "document ai, credit underwriting, document extraction failure, ocr underwriting", relatedFeatures: ["document-intelligence"] },
      { title: "Building an Evidence Graph for Lending", seoTerms: "evidence graph, lending provenance, document lineage, explainable underwriting", relatedFeatures: ["explainable-decisions", "document-intelligence"] },
      { title: "Document Classification: Bank Statement vs Payslip vs Credit Report", seoTerms: "document classification, bank statement, payslip, credit report, underwriting automation", relatedFeatures: ["document-intelligence"] },
      { title: "Confidence Scores in Extraction: What's Good Enough?", seoTerms: "extraction confidence score, document ai accuracy, underwriting data quality, credit decisioning", relatedFeatures: ["document-intelligence", "risk-assessment"] },
      { title: "From Upload to Underwriting: The Provenance Trail", seoTerms: "document provenance, underwriting pipeline, evidence lineage, audit trail, lending", relatedFeatures: ["document-intelligence", "explainable-decisions"] },
    ],
  },
  D: {
    label: "Lending Operations",
    category: "Markets",
    weekday: 4, // Thursday
    featureHint: "intelligent-los",
    topics: [
      { title: "Why Loan Applications Get Stuck", seoTerms: "loan application stuck, underwriting delays, information request, lending operations", relatedFeatures: ["intelligent-los", "borrower-portal"] },
      { title: "How to Reduce Manual Underwriting", seoTerms: "reduce manual underwriting, underwriting automation, lending efficiency, consumer credit", relatedFeatures: ["ai-underwriting", "intelligent-los"] },
      { title: "Building a Modern LOS", seoTerms: "modern los, loan origination system, lending platform, underwriting software", relatedFeatures: ["intelligent-los"] },
      { title: "The Information-Request Loop: Why It Drags and How to Fix It", seoTerms: "information request, borrower portal, underwriting loop, lending operations", relatedFeatures: ["borrower-portal", "ai-credit-officer"] },
      { title: "One Pipeline, Every Product: Unifying Personal, Instalment and POS", seoTerms: "lending pipeline, personal loans, instalment, point of sale, loan origination", relatedFeatures: ["intelligent-los"] },
      { title: "Scaling Lending Across Markets Without Re-Platforming", seoTerms: "lending across markets, multi-market lending, global underwriting, lending platform", relatedFeatures: ["intelligent-los", "ai-underwriting"] },
    ],
  },
  E: {
    label: "AI + Responsible Lending",
    category: "Compliance",
    weekday: 5, // Friday (flagship)
    featureHint: "explainable-decisions",
    topics: [
      { title: "Can AI Make Credit Decisions?", seoTerms: "ai credit decisions, automated decisioning, responsible ai lending, credit underwriting", relatedFeatures: ["ai-underwriting", "explainable-decisions"] },
      { title: "How Should AI Be Used in Credit Underwriting?", seoTerms: "ai in credit underwriting, responsible ai, human oversight, lending governance", relatedFeatures: ["ai-underwriting", "explainable-decisions"] },
      { title: "Why Human Oversight Matters in AI Lending", seoTerms: "human oversight, ai lending, human in the loop, responsible underwriting", relatedFeatures: ["explainable-decisions", "credit-decisioning"] },
      { title: "The FCA's 2026 AI Agenda: What It Means for Lenders", seoTerms: "fca ai 2026, ai regulation, retail financial services, credit scoring, ai decisioning", relatedFeatures: ["explainable-decisions", "ai-underwriting"], regulatorHook: true },
      { title: "Explainability as Infrastructure: Beyond Trust the Model", seoTerms: "explainability infrastructure, explainable ai, credit decisioning, model transparency", relatedFeatures: ["explainable-decisions"] },
      { title: "Bias, Fairness and Auditability in AI Credit Scoring", seoTerms: "ai bias, fairness, auditability, credit scoring, responsible lending", relatedFeatures: ["explainable-decisions", "risk-assessment"] },
      { title: "Responsible AI Underwriting: A Compliance-First Architecture", seoTerms: "responsible ai underwriting, compliance architecture, ai governance, lending compliance", relatedFeatures: ["explainable-decisions", "ai-underwriting"] },
      { title: "From Black Box to Evidence Graph: Governing AI Decisions", seoTerms: "ai governance, evidence graph, black box ai, credit decision audit, responsible ai", relatedFeatures: ["explainable-decisions", "credit-decisioning"] },
    ],
  },
};

export const PILLAR_KEYS = ["A", "B", "C", "D", "E"];

export const FEATURE_SLUGS = [
  "ai-underwriting",
  "credit-decisioning",
  "document-intelligence",
  "risk-assessment",
  "lending-policies",
  "explainable-decisions",
  "borrower-portal",
  "ai-credit-officer",
  "intelligent-los",
  "ai-loan-application",
  "connect-ai",
];

// Map a JS getDay() value (0=Sun..6=Sat) to a pillar key. Mon-Fri map to A-E;
// weekend calls fall back to A so manual runs still produce something useful.
export function pillarForDay(day) {
  const map = { 1: "A", 2: "B", 3: "C", 4: "D", 5: "E" };
  return map[day] || "A";
}

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

export function buildPrompt(topic, pillarKey) {
  const pillar = PILLARS[pillarKey];
  const isResponsible = pillarKey === "E";
  const regulatorHook = topic.regulatorHook;

  const positioning = isResponsible
    ? `POSITIONING REQUIREMENTS (CRITICAL — responsible AI flagship):
- Position CreditDecide as the INFRASTRUCTURE LAYER for responsible AI underwriting — not simply another LLM product. The article must argue that responsible AI is a data-model problem solved by architecture (evidence graph by construction, human-in-the-loop, policy never silently overridden, full audit trail, regulator-compliant adverse-action notices, closed-loop model monitoring), not a feature bolted onto a black box.
- This article is part of the "AI + Responsible Lending" pillar. The central question is how AI SHOULD be used in credit underwriting — with human oversight, explainability, and auditability as first-class requirements.
${regulatorHook ? "- This article MAY reference the UK FCA's 2026 work on AI in retail financial services (including AI's growing role in credit scoring and AI-driven financial decisioning) as a concrete regulatory anchor. Use it as the hook, then draw the universal lesson for consumer lenders everywhere. You may name the FCA; do not name other country-specific regulators." : "- Speak about regulators and regulation in universal terms (e.g. 'your regulator', 'supervisory authorities'). Do NOT name any specific country's regulator."}
- Frame the FCA's concerns as the industry's concerns: explainability, fairness, human oversight, and auditability are now table stakes for any AI-driven credit decision. CreditDecide meets them by construction.`
    : `POSITIONING REQUIREMENTS (CRITICAL):
- This article is BORDERLESS. Do NOT name or target any specific country, regulator, currency, or region. Write for consumer lenders everywhere — personal loans, instalment, and point-of-sale lenders operating in any market worldwide.
- Do NOT reference country-specific bureaus, regulators, or jurisdictions. Speak about credit bureaus, open banking, and regulation in universal terms (e.g. "credit bureaus", "open banking providers", "your regulator").
- The article must SELL CreditDecide. Frame every concept around our product: how our features solve the problem, the innovation behind them, and the strategic advantage they give lenders. This is product-led thought leadership, not neutral journalism.
- Emphasize our innovation and strategy: evidence-native underwriting, no-code policy building, AI-assisted risk analysis, closed-loop model monitoring, and being live in hours not quarters — for any market, worldwide.`;

  return `You are a senior content writer for CreditDecide (creditdecide.com), an AI-native, no-code underwriting operating system for consumer lenders worldwide. Write a substantive, original, expert-level article for the company's public Insights blog.

ARTICLE TOPIC: ${topic.title}
CONTENT PILLAR: ${pillar.label} (${pillar.category})

SEO REQUIREMENTS:
- Primary target keyword: "${topic.title}". Use it naturally in the title, the opening paragraph, and at least two ## section headings.
- Include semantic keyword variations: ${topic.seoTerms}.
- Write a clear, honest, click-worthy title (max 70 characters) that contains the target keyword.
- The excerpt is a 1-2 sentence meta description (max 160 characters) that contains the target keyword.

${positioning}

CONTENT REQUIREMENTS:
- Audience: B2B consumer lenders, fintechs, and credit teams worldwide. Tone: authoritative, technical, practical, and persuasive — never generic AI marketing fluff or empty buzzwords.
- Length: 700-1000 words.
- Structure as markdown: a short intro paragraph, 3-5 ## (H2) sections, and where useful ### (H3) subheadings, bullet lists, and one small comparison table if it adds clarity.
- CRITICAL FORMATTING: Use real newline characters to separate every paragraph, heading, table row, and list item. Never place two markdown blocks on the same line — each ## heading, ### subheading, table row, and numbered item must start on its own line, with a blank line between paragraphs.
- Ground the article in real underwriting concepts: canonical financial and credit profiles, structured risk signals across five dimensions (credit, affordability, fraud, data quality, policy), evidence lineage to source fields, a versioned no-code policy engine, document intelligence with confidence scores, and explainable APPROVE / REVIEW / DECLINE decisions.
- CreditDecide's actual capabilities (do not invent others): white-label borrower application forms with configurable KYC; live credit bureau and open banking data sources (or document upload); AI document classification and extraction; normalization into canonical profiles; structured risk signals with an evidence graph; a visual no-code policy builder with versioned, never-overwrite policies; an AI underwriter that produces advisory recommendations with probability of default and confidence; final lender decisions with override reasons; decision exports as PDF, CSV, and Word; sandbox and production environment isolation; a borrower portal with 24/7 AI assistant and human handoff; an AI credit officer that runs the information-request loop; support for any market worldwide.
- End with a short ## section titled "What this means for consumer lenders" with 2-3 practical takeaways that reinforce the strategic value of CreditDecide.

Return ONLY a JSON object with these fields:
- title: string (includes the target keyword, max 70 chars)
- excerpt: string (1-2 sentence summary, max 160 chars, includes the target keyword)
- content: string (the full article body in markdown — do NOT repeat the title; start directly with the intro paragraph)
- category: string (exactly one of: "Foundations", "Technology", "Compliance", "Risk", "Markets")
- seo_keywords: array of 5-8 keyword strings (include the target keyword)
- reading_time: integer (estimated minutes to read)
- related_features: array of 1-3 strings from this exact list: ["ai-underwriting", "credit-decisioning", "document-intelligence", "risk-assessment", "lending-policies", "explainable-decisions", "borrower-portal", "ai-credit-officer", "intelligent-los", "ai-loan-application", "connect-ai"]`;
}