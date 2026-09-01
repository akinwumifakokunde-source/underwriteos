export const FEATURES = [
  {
    slug: "ai-underwriting",
    title: "AI Underwriting",
    tagline: "An AI-native underwriting engine",
    h1: "AI underwriting for modern lenders",
    intro:
      "CreditDecide's AI underwriting engine reads borrower documents, normalizes financial and credit data, evaluates your lending policy, and produces a recommendation with a probability of default and confidence score — in minutes, not days.",
    sections: [
      {
        heading: "What AI underwriting means in CreditDecide",
        body: "AI underwriting is the use of machine learning and structured data analysis to assess a borrower's creditworthiness. CreditDecide applies AI to extract data from uploaded documents, normalize it into canonical financial and credit profiles, generate structured risk signals, and recommend an APPROVE, REVIEW, or DECLINE outcome — all traceable to source evidence.",
      },
      {
        heading: "How the AI underwriter works",
        body: "The AI underwriter combines normalized financial profiles, credit profiles, and structured risk signals with your configured lending policy. It evaluates each policy rule, scores the application across five risk dimensions, and returns a recommendation alongside a human-readable memo that references the exact evidence behind every signal.",
      },
      {
        heading: "Why lenders choose AI underwriting",
        body: "Manual underwriting is slow, inconsistent, and hard to audit. CreditDecide's AI underwriter applies your policy consistently across every application, flags cases that need human review, and explains every decision with full evidence lineage — so you can underwrite faster without sacrificing control or compliance.",
      },
    ],
    benefits: [
      "Decisions in minutes, not days",
      "Consistent policy application every time",
      "Probability of default and confidence scores",
      "Human-readable evidence-referenced memos",
    ],
    related: ["credit-decisioning", "risk-assessment", "explainable-decisions"],
  },
  {
    slug: "credit-decisioning",
    title: "Credit Decisioning",
    tagline: "Explainable APPROVE / REVIEW / DECLINE",
    h1: "Credit decisioning with explainable outcomes",
    intro:
      "CreditDecide turns borrower data and policy rules into clear credit decisions. Every application ends with an APPROVE, REVIEW, or DECLINE outcome — each backed by the policy rules that fired and the evidence that supported them.",
    sections: [
      {
        heading: "What credit decisioning is",
        body: "Credit decisioning is the process of evaluating a borrower's application against a lender's credit policy and producing a lending decision. CreditDecide automates this end-to-end: from application intake and data collection, through AI analysis and policy evaluation, to a final, explainable decision.",
      },
      {
        heading: "APPROVE, REVIEW, or DECLINE",
        body: "Every decision falls into one of three outcomes. APPROVE means the application met your policy thresholds. REVIEW means the AI flagged signals that warrant a human underwriter's attention. DECLINE means the application failed mandatory policy rules. The final decision always rests with your lender — the AI provides a recommendation, never a silent override.",
      },
      {
        heading: "Decisions you can export and audit",
        body: "Every decision carries the policy outcome, risk score, probability of default, confidence, and the reasons behind it. Export decisions as PDF, CSV, or Word for audit trails, adverse-action notices, and portfolio reporting.",
      },
    ],
    benefits: [
      "Three clear outcomes: APPROVE, REVIEW, DECLINE",
      "Policy rules and reasons attached to every decision",
      "Export as PDF, CSV, and Word",
      "Full audit trail for regulators",
    ],
    related: ["ai-underwriting", "lending-policies", "explainable-decisions"],
  },
  {
    slug: "document-intelligence",
    title: "Document Intelligence",
    tagline: "Classify, extract, and verify borrower documents",
    h1: "Document intelligence for underwriting",
    intro:
      "CreditDecide automatically classifies uploaded borrower documents — bank statements, payslips, credit reports, identity, and financial statements — extracts the fields that matter, and links every extracted value back to its source for full provenance.",
    sections: [
      {
        heading: "Automated document classification",
        body: "When a borrower uploads a document, CreditDecide identifies its type — bank statement, payslip, credit report, identity proof, employment letter, tax document, or financial statement — and routes it to the right extraction pipeline. No manual sorting required.",
      },
      {
        heading: "AI extraction with confidence scores",
        body: "The extraction engine pulls structured fields from each document, assigns a confidence score to every value, and flags inconsistencies or quality issues for review. Extracted data flows directly into the canonical financial and credit profiles used for underwriting.",
      },
      {
        heading: "Provenance from document to decision",
        body: "Every extracted field is linked to the document, page, and field it came from. When a risk signal fires, you can trace it back through the evidence graph to the exact value in the original document — making audits and adverse-action explanations straightforward.",
      },
    ],
    benefits: [
      "Automatic document type classification",
      "Confidence-scored field extraction",
      "Quality issue and inconsistency detection",
      "Full provenance from document to decision",
    ],
    related: ["ai-underwriting", "risk-assessment", "explainable-decisions"],
  },
  {
    slug: "risk-assessment",
    title: "Risk Assessment",
    tagline: "Five dimensions of borrower risk",
    h1: "Structured risk assessment across five dimensions",
    intro:
      "CreditDecide evaluates every application across five risk dimensions — credit, affordability, fraud, data quality, and policy — producing structured risk signals that each carry a severity, direction, and human-readable explanation.",
    sections: [
      {
        heading: "Five risk dimensions",
        body: "Credit risk covers credit history, utilisation, and repayment behaviour. Affordability covers debt-to-income, repayment capacity, and disposable income. Fraud risk flags inconsistencies and suspicious patterns. Data quality measures the completeness and reliability of submitted information. Policy risk captures how the application scores against your configured rules.",
      },
      {
        heading: "Structured, explainable risk signals",
        body: "Each risk signal is a structured record with a category, value, confidence, source, severity (LOW to CRITICAL), and direction (positive, neutral, negative). Signals are never opaque — every one includes a human-readable explanation of what it represents and why it matters.",
      },
      {
        heading: "From signals to a risk score",
        body: "Risk signals roll up into an overall risk score and probability of default for the application. The AI underwriter weighs the signals, applies your policy, and produces a recommendation — with the underlying signals always available for review.",
      },
    ],
    benefits: [
      "Five dimensions: credit, affordability, fraud, data quality, policy",
      "Severity and direction on every signal",
      "Probability of default and confidence",
      "Human-readable explanations throughout",
    ],
    related: ["ai-underwriting", "document-intelligence", "explainable-decisions"],
  },
  {
    slug: "lending-policies",
    title: "Lending Policies",
    tagline: "A visual, no-code policy builder",
    h1: "Build lending policies visually, no code required",
    intro:
      "CreditDecide's visual policy builder lets your lending team define underwriting rules with field, operator, threshold, and outcome — APPROVE, REVIEW, or DECLINE — without writing a single line of code. Policies are versioned and never silently overwrite the active version.",
    sections: [
      {
        heading: "Visual rule builder",
        body: "Create rules by choosing a field (e.g. debt-to-income ratio), an operator (less than, greater than, between), a threshold, and the decision outcome if the rule fires. Reorder rules by priority, simulate against sample applications, and activate when ready.",
      },
      {
        heading: "Versioned, never-overwrite policies",
        body: "Every policy change creates a new version. The active policy is never overwritten, so you can roll back, compare versions, and maintain a complete history of what was in effect when each decision was made — essential for audits and regulatory reviews.",
      },
      {
        heading: "Policy simulation",
        body: "Test a draft policy against real or synthetic applications before activating it. See which rules fire, what decisions result, and how outcomes shift — so you can tune thresholds with confidence before going live.",
      },
    ],
    benefits: [
      "No-code visual rule builder",
      "APPROVE / REVIEW / DECLINE outcomes per rule",
      "Versioned policies with full history",
      "Simulation before activation",
    ],
    related: ["credit-decisioning", "ai-underwriting", "risk-assessment"],
  },
  {
    slug: "explainable-decisions",
    title: "Explainable Decisions",
    tagline: "Every signal traces to its source",
    h1: "Explainable AI decisions with full evidence lineage",
    intro:
      "CreditDecide never gives you a black-box answer. Every risk signal links through an evidence graph to the exact source record and field that produced it — so you can explain to a borrower, an auditor, or a regulator exactly why a decision was made.",
    sections: [
      {
        heading: "The evidence graph",
        body: "Every risk signal is connected to an Evidence record that captures the source type (credit report, bank statement, document, borrower declaration, or derived), the source provider, the source record ID, the field, and the calculation method. The graph lets you walk from any decision back to its raw inputs.",
      },
      {
        heading: "Explainable to every audience",
        body: "For borrowers: generate adverse-action notices and reason codes from the same evidence. For auditors: export the full decision trail as PDF, CSV, or Word. For your team: review the AI memo that narrates the reasoning with evidence references inline.",
      },
      {
        heading: "Trust through traceability",
        body: "Explainability isn't a feature bolted on at the end — it's built into the data model. Because every signal carries its source, decisions are auditable by construction, not by reconstruction.",
      },
    ],
    benefits: [
      "Evidence graph from signal to source field",
      "Adverse-action notices and reason codes",
      "Export decisions as PDF, CSV, and Word",
      "Auditable by construction",
    ],
    related: ["ai-underwriting", "risk-assessment", "credit-decisioning"],
  },
];

export function getFeature(slug) {
  return FEATURES.find((f) => f.slug === slug);
}