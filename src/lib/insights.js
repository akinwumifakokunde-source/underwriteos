// Insights — CreditDecide's editorial section.
// Public, crawlable articles that connect the brand to the concepts we want
// to build search authority around: AI underwriting, credit decisioning,
// document intelligence, explainable AI, risk assessment, and lending policy.
//
// Articles are authored as structured records with markdown bodies, rendered
// with react-markdown on the public site. Add new articles by appending to
// this array — the listing, detail, sitemap, and feature cross-links pick
// them up automatically.

export const AUTHOR = {
  name: "CreditDecide",
  role: "Engineering & Risk Team",
  bio: "CreditDecide's engineering and risk team builds the AI-native underwriting operating system used by lenders worldwide. These articles draw on the platform's real architecture — canonical financial profiles, structured risk signals, evidence lineage, and a versioned policy engine.",
};

export const INSIGHTS = [
  {
    slug: "what-is-ai-native-underwriting",
    title: "What Is AI-Native Underwriting? A Guide for Modern Lenders",
    excerpt:
      "AI-native underwriting isn't a chatbot bolted onto a legacy system. It's a platform built from the data model up to ingest, normalize, assess, and decide — with every signal traceable to its source.",
    category: "Foundations",
    publishedAt: "2026-08-28",
    readingTime: 6,
    relatedFeatures: ["ai-underwriting", "credit-decisioning", "risk-assessment"],
    content: `## From AI-assisted to AI-native

Most "AI underwriting" tools on the market are AI-*assisted*: a traditional decision engine does the work, and a machine-learning model sits beside it to produce a score or a summary. The core pipeline — intake, data extraction, policy evaluation, decision — is unchanged.

**AI-native underwriting** is different. The platform is designed from the data model up so that AI is part of every stage: documents are classified and extracted by AI, raw credit and bank data is normalized into canonical profiles, risk signals are generated as structured records, and a policy engine evaluates them to produce a recommendation. The AI isn't a sidecar — it's the engine.

## The five-stage pipeline

A native underwriting platform moves an application through five stages:

1. **Intake** — borrowers apply through white-label forms or the API creates an application.
2. **Data collection** — live credit bureau and open banking data is connected, or documents are uploaded.
3. **Normalization** — raw, provider-specific data is transformed into canonical financial and credit profiles.
4. **Assessment** — structured risk signals are generated across five dimensions, and the policy is evaluated.
5. **Decision** — an advisory recommendation is produced, and the lender makes the final call.

The key insight is that each stage produces *structured, queryable records* — not free text. A risk signal is a row in a database with a category, value, confidence, severity, and a link to its evidence. That structure is what makes the decision explainable and auditable.

## Why "native" matters for lenders

A native platform gives lenders three things an assisted tool cannot:

- **Consistency.** The same policy is applied to every application, every time. There's no underwriter-to-underwriter variance.
- **Explainability by construction.** Because every signal carries its source, a decision can be traced from the policy rule that fired to the exact field in the credit report. You don't reconstruct the audit trail after the fact — it's built into the data model.
- **Speed without loss of control.** Decisions arrive in minutes, but the lender always makes the final call. The AI recommends; it never silently overrides policy.

## What to look for

When evaluating an AI underwriting platform, ask whether the AI is native or assisted. If the vendor's AI produces a score but can't show you the source field behind each signal, it's assisted. If every signal links through an evidence graph to its origin, it's native — and that's the foundation that makes decisions fast, consistent, and defensible.`,
  },
  {
    slug: "credit-decisioning",
    title: "Credit Decisioning: How Modern Lenders Automate Loan Decisions",
    excerpt:
      "Credit decisioning is the process of turning borrower data and policy rules into a lending decision. Here's how a modern, no-code decisioning platform does it end to end.",
    category: "Foundations",
    publishedAt: "2026-08-28",
    readingTime: 5,
    relatedFeatures: ["credit-decisioning", "lending-policies", "explainable-decisions"],
    content: `## What credit decisioning actually is

Credit decisioning is the process of evaluating a borrower's application against a lender's credit policy and producing a decision. It sounds simple, but in practice it's where most lending operations spend their time: gathering documents, normalizing data, checking rules, and explaining outcomes.

A modern decisioning platform automates the entire path — from application intake through to an exportable, auditable decision — without the lender writing code.

## The three outcomes

Every decision falls into one of three outcomes:

- **APPROVE** — the application met your policy thresholds.
- **REVIEW** — the AI flagged signals that warrant a human underwriter's attention.
- **DECLINE** — the application failed a mandatory policy rule.

The distinction between REVIEW and the other two is critical. REVIEW is the human-in-the-loop checkpoint: the AI surfaces the application because something needs a judgment call, but it doesn't auto-decline. That keeps the lender in control of edge cases while automating the clear-cut majority.

## How a decision is assembled

A modern decisioning engine assembles the decision from structured components:

1. **Policy rules** — each rule has a field, an operator, a threshold, and an outcome. "Debt-to-income ≤ 45% → PASS" is a rule.
2. **Risk signals** — each signal is a structured record with a value, confidence, and source. The policy rules evaluate these signals.
3. **The recommendation** — the AI weighs the signals and policy results into an advisory recommendation with a probability of default and confidence score.
4. **The final decision** — the lender (or an automated workflow) makes the call. If it differs from the recommendation, an override reason is required.

## Decisions you can export and audit

The output isn't just a yes/no. Every decision carries the policy outcome, the risk score, the probability of default, the confidence, and the reasons behind it. That payload can be exported as PDF, CSV, or Word — for audit trails, adverse-action notices, and portfolio reporting.

This is what separates a decisioning *platform* from a decisioning *model*. A model gives you a score. A platform gives you a decision plus the full, explainable chain of reasoning that produced it — and the tools to act on it.`,
  },
  {
    slug: "ai-underwriting-vs-traditional",
    title: "AI Underwriting vs. Traditional Underwriting: What's Changing?",
    excerpt:
      "Traditional underwriting is manual, inconsistent, and slow to audit. AI underwriting isn't replacing the underwriter — it's giving them a structured, traceable foundation to work from.",
    category: "Foundations",
    publishedAt: "2026-08-29",
    readingTime: 6,
    relatedFeatures: ["ai-underwriting", "document-intelligence"],
    content: `## The traditional model

Traditional underwriting is a human process. An underwriter receives an application, gathers documents, reads bank statements and credit reports, mentally normalizes the data, checks it against the lender's policy, and makes a decision. It works — but it has three structural problems:

- **It's slow.** A single application can take days, mostly spent waiting for documents and manually extracting data.
- **It's inconsistent.** Two underwriters looking at the same file can reach different conclusions. There's no single source of truth for how a rule was applied.
- **It's hard to audit.** When a regulator asks why a decision was made, someone has to reconstruct the reasoning from notes and memory.

## What AI underwriting changes

AI underwriting doesn't remove the underwriter — it removes the manual, unstructured work that surrounds the decision. The platform handles intake, extraction, normalization, and policy evaluation, then presents the underwriter with a structured recommendation and the evidence behind it.

The underwriter's role shifts from *data gathering* to *judgment* — reviewing the flagged signals, deciding on edge cases, and overriding the recommendation when their experience says otherwise.

## Where each approach sits

| Dimension | Traditional | AI-native |
| --- | --- | --- |
| Speed | Days | Minutes |
| Consistency | Underwriter-dependent | Policy-driven, every time |
| Audit trail | Reconstructed | Built into the data model |
| Data extraction | Manual | Automated with confidence scores |
| Final decision | Underwriter | Underwriter (or automated workflow) |

## What stays the same

The lender still owns the policy. The lender still makes the final decision. The AI provides a recommendation, never a silent override. What changes is the foundation the decision sits on: structured, traceable, and consistent across every application.

That's the real shift. Traditional underwriting builds the audit trail after the fact. AI-native underwriting builds it into the decision itself.`,
  },
  {
    slug: "document-ai-credit-underwriting",
    title: "How Document AI Is Transforming Credit Underwriting",
    excerpt:
      "Bank statements, payslips, and credit reports arrive in dozens of formats. Document AI classifies, extracts, and links every field to its source — turning unstructured paperwork into underwriting-ready data.",
    category: "Technology",
    publishedAt: "2026-08-29",
    readingTime: 6,
    relatedFeatures: ["document-intelligence", "ai-underwriting"],
    content: `## The document problem

Underwriting runs on documents: bank statements, payslips, credit reports, identity proofs, employment letters, tax filings, and financial statements. Each arrives in a different format, from a different provider, with a different layout. For a human underwriter, reading them is the job. For a lending platform, turning them into structured data is the hardest problem.

Document AI is the layer that solves it.

## Classification first

Before you can extract anything, you have to know what you're looking at. A document intelligence engine classifies each upload by type — bank statement, payslip, credit report, identity, employment, tax, financial statement — and routes it to the right extraction pipeline. No manual sorting, no misrouted files.

## Extraction with confidence

The extraction engine pulls structured fields from each document: the monthly income on a payslip, the closing balance on a bank statement, the credit score on a report. But extraction is never perfect, so every value carries a **confidence score**. A high-confidence extraction flows straight into the financial profile. A low-confidence one is flagged for review.

This matters because underwriting decisions are only as good as the data behind them. A confidence score lets the platform separate "we're sure this is £4,200/month" from "this looks like £4,200 but we're not certain" — and treat them differently.

## Provenance from document to decision

The most important property of document AI in underwriting isn't speed — it's **provenance**. Every extracted field is linked to the document, the page, and the field it came from. When a risk signal fires later in the pipeline, you can trace it back through the evidence graph to the exact value in the original document.

That traceability is what makes document AI transformative rather than just convenient. It turns a stack of paperwork into a set of structured, source-linked data points — and that's the raw material a modern underwriting engine needs.

## From documents to decisions

Once documents are classified, extracted, and linked, the data flows into the canonical financial and credit profiles that drive the rest of the pipeline. The documents don't just get read — they get *understood*, in a form the policy engine can evaluate and the auditor can verify.`,
  },
  {
    slug: "explainable-ai-in-lending",
    title: "Explainable AI in Lending: Making Credit Decisions Auditable",
    excerpt:
      "A black-box score isn't enough in regulated lending. Explainable AI means every decision traces from the policy rule that fired to the exact source field — by construction, not by reconstruction.",
    category: "Compliance",
    publishedAt: "2026-08-30",
    readingTime: 6,
    relatedFeatures: ["explainable-decisions", "credit-decisioning"],
    content: `## Why explainability isn't optional

In consumer lending, you can't just decline someone and move on. Regulators require you to explain why — through adverse-action notices, reason codes, and audit trails. A model that outputs a score with no reasoning isn't just unhelpful; in many jurisdictions, it's non-compliant.

Explainable AI in lending means a decision is accompanied by the full chain of reasoning that produced it: which policy rules fired, which risk signals drove them, and which source data supported each signal.

## The evidence graph

The mechanism that makes this possible is the **evidence graph**. Every risk signal is connected to an evidence record that captures:

- the source type (credit report, bank statement, document, borrower declaration, or derived),
- the provider that produced it,
- the source record ID,
- the specific field,
- and the calculation method.

The graph lets you walk from any decision back to its raw inputs. "Why was this application declined?" → "The DTI rule failed" → "DTI was 48.2%" → "derived from monthly debt servicing of £1,930 and monthly income of £4,000" → "income from payslip, page 1, field 'monthly_net_pay'."

## Explainable to every audience

The same evidence serves three audiences:

- **For borrowers:** generate adverse-action notices and reason codes directly from the evidence. The borrower gets a clear, specific reason, not a generic decline.
- **For auditors:** export the full decision trail as PDF, CSV, or Word. The audit is already assembled — no one reconstructs it from memory.
- **For your team:** the AI memo narrates the reasoning with evidence references inline, so an underwriter reviewing a REVIEW case can see exactly what drove the recommendation.

## Auditable by construction

The key principle is that explainability is **built into the data model**, not bolted on at the end. Because every signal carries its source from the moment it's created, decisions are auditable by construction. You don't audit a decision by reconstructing what happened — you audit it by reading the records that were created as it happened.

That's the difference between a model that happens to be interpretable and a platform that's auditable by design. In regulated lending, only the latter is sufficient.`,
  },
  {
    slug: "building-a-modern-credit-decision-engine",
    title: "Building a Modern Credit Decision Engine",
    excerpt:
      "A decision engine is more than a scoring model. It's a versioned policy, a structured signal layer, and an evidence graph — assembled so every decision is fast, consistent, and auditable.",
    category: "Engineering",
    publishedAt: "2026-08-30",
    readingTime: 7,
    relatedFeatures: ["ai-underwriting", "lending-policies", "risk-assessment"],
    content: `## Beyond the scoring model

When people hear "credit decision engine," they often think of a scoring model: inputs in, score out. But a modern decision engine is a system, not a model. It has to apply policy consistently, explain its reasoning, and leave an audit trail — all while handling data from multiple providers across multiple markets.

## The four layers

A production-grade decision engine is built in four layers:

### 1. The normalization layer

Raw data arrives in provider-specific shapes. Experian, Equifax, TransUnion, CRC, and open banking providers all structure their data differently. The normalization layer transforms all of it into **canonical profiles** — a single financial profile and a single credit profile — regardless of source. Downstream layers never see the raw provider format.

### 2. The signal layer

On top of the canonical profiles, the engine generates **structured risk signals**. Each signal is a record with a category (credit, affordability, fraud, data quality, policy), a value, a confidence, a severity, a direction, and a human-readable explanation. Signals are the common currency the rest of the engine works in.

### 3. The policy layer

The policy is a set of versioned rules — field, operator, threshold, outcome. "Credit score ≥ 650 → PASS." "DTI ≤ 45% → PASS." The policy layer evaluates the signals against the rules and produces a per-rule result. Policies are versioned and never silently overwritten, so you always know which policy was in effect for a given decision.

### 4. The decision layer

The decision layer combines the policy results and the signal weights into a recommendation — APPROVE, REVIEW, or DECLINE — with a probability of default and a confidence score. The lender then makes the final call, with an override reason required if they disagree.

## Why layering matters

The separation matters because each layer can evolve independently. You can add a new credit bureau provider without touching the policy. You can tune a policy rule without retraining the signal layer. You can change the decision logic without rewriting the normalization.

It also means every decision is reproducible: given the same canonical profiles, the same signals, and the same policy version, the engine produces the same result. That reproducibility is the foundation of consistency and auditability.

## The result

A modern decision engine isn't a black box that outputs a score. It's a layered, versioned, traceable system that turns raw data into a defensible decision — fast enough to use in production, structured enough to audit, and flexible enough to adapt as your lending strategy evolves.`,
  },
  {
    slug: "automated-underwriting-intake-to-decision",
    title: "Automated Underwriting: From Application Intake to Final Decision",
    excerpt:
      "Walk through the full automated underwriting flow — from a borrower hitting a white-label form to an exportable, explainable decision — and see where each stage adds structure.",
    category: "Foundations",
    publishedAt: "2026-08-31",
    readingTime: 6,
    relatedFeatures: ["ai-underwriting", "document-intelligence", "credit-decisioning"],
    content: `## The full flow

Automated underwriting isn't a single step — it's a sequence, and each stage in the sequence adds structure that the next stage depends on. Here's the flow from a borrower's first click to a final, exportable decision.

## 1. Intake

The borrower starts at a white-label application form — a public link like \`/apply/your-form-slug\` — branded with the lender's logo, accent color, and market-specific KYC fields. The form collects the borrower's details and the documents the lender requires for that market.

On submission, the form creates two records: a **Borrower** (the person) and an **Application** (the loan request, in \`data_collection\` status). From this point, everything is a structured record.

## 2. Data collection

The platform connects live data sources — a credit bureau pull and an open banking connection — or accepts uploaded documents. Each source creates its own record: a CreditReport, a BankStatement, or a set of Documents. The application moves to \`analyzing\`.

## 3. Normalization

Raw provider data is normalized into canonical profiles: a **FinancialProfile** (income, expenses, assets, liabilities, cashflow, affordability) and a **CreditProfile** (score, utilisation, accounts, defaults, enquiries). These profiles are provider-independent — the rest of the pipeline never cares whether the data came from Experian or TransUnion.

## 4. Document intelligence

Uploaded documents are classified, their fields are extracted with confidence scores, and each extracted value is linked to its source. The extracted data feeds into the canonical profiles.

## 5. Risk signals

The engine generates structured **risk signals** across five dimensions — credit, affordability, fraud, data quality, and policy. Each signal carries a value, a confidence, a severity, and a link to its evidence. The application moves to \`underwriting\`.

## 6. Policy evaluation

The configured, versioned policy is evaluated against the signals. Each rule produces a PASS or FAIL. The policy outcome is recorded alongside the signals.

## 7. Recommendation

The AI underwriter weighs the signals and policy results into an advisory recommendation — APPROVE, REVIEW, or DECLINE — with a probability of default, a confidence score, and an evidence-referenced memo.

## 8. Final decision

The lender (or an automated workflow) makes the final call. If it differs from the recommendation, an override reason is required. The application moves to \`completed\`, and the decision — with its full reasoning — can be exported as PDF, CSV, or Word.

## Why the structure matters

Every stage produces records, not free text. That's what makes the flow automatable *and* auditable at the same time. You can run thousands of applications through it, and for each one, walk from the final decision back to the borrower's first form submission — through every signal, every policy rule, and every source field.`,
  },
  {
    slug: "credit-risk-assessment-key-signals",
    title: "Credit Risk Assessment: The Key Signals Lenders Should Monitor",
    excerpt:
      "Modern risk assessment isn't one score — it's structured signals across five dimensions. Here are the signals that matter, and why each one needs to trace back to its source.",
    category: "Risk",
    publishedAt: "2026-08-31",
    readingTime: 6,
    relatedFeatures: ["risk-assessment", "explainable-decisions"],
    content: `## Beyond the single score

For decades, credit risk assessment meant one number: the credit score. It's useful, but it's also opaque. A score tells you *that* a borrower is risky; it rarely tells you *why* in a way you can act on or audit.

Modern risk assessment replaces the single score with a set of **structured risk signals** — each one a record with a category, a value, a confidence, a severity, and a human-readable explanation. The score still exists, but it's an output of the signals, not a substitute for them.

## The five dimensions

A complete risk assessment covers five dimensions:

### 1. Credit risk

The borrower's credit history: score, utilisation, active and delinquent accounts, defaults, recent enquiries, and repayment history. These signals come from the credit bureau report, normalized into a canonical credit profile.

### 2. Affordability

Can the borrower actually repay? Affordability signals cover debt-to-income ratio, repayment capacity, disposable income, and the relationship between income and the requested loan. These come from the financial profile, derived from bank statements and income documents.

### 3. Fraud risk

Are the inputs consistent? Fraud signals flag mismatches — an income on a payslip that doesn't match the bank deposits, an address that doesn't match the credit report, patterns that look synthetic. Fraud is often a *cross-source* signal: it emerges when you compare data from different sources.

### 4. Data quality

Is the data good enough to decide on? Data quality signals measure completeness, confidence, and consistency. If a document extracted with low confidence, or a required field is missing, that's a data quality signal — and it often routes the application to REVIEW rather than forcing a decision on bad data.

### 5. Policy risk

How does the application score against the lender's configured rules? Policy signals capture the outcome of each rule — PASS or FAIL — and which threshold was crossed. This is where the lender's own strategy meets the borrower's data.

## Why each signal needs a source

Every signal must trace back to its source. "Affordability: DTI 48.2%" is useful; "Affordability: DTI 48.2%, derived from monthly debt servicing of £1,930 and monthly income of £4,000, income from payslip page 1" is auditable.

That traceability is what lets a lender explain a decline to a borrower, defend a decision to a regulator, and tune a policy with confidence. When you can see *why* a signal fired, you can decide whether the threshold is right — and that's how a risk assessment system gets better over time.

## From signals to a decision

The signals roll up into an overall risk score and a probability of default, which the AI underwriter combines with the policy outcome to produce a recommendation. But the signals themselves are always available for review — because in modern lending, the assessment isn't done until it's explainable.`,
  },
];

export function getInsight(slug) {
  return INSIGHTS.find((i) => i.slug === slug);
}

export function insightsForFeature(featureSlug) {
  return INSIGHTS.filter((i) => i.relatedFeatures.includes(featureSlug));
}

// Display names + flag for each supported market, used for geo badges on cards.
export const MARKET_NAMES = {
  GB: { name: "United Kingdom", short: "UK", flag: "🇬🇧" },
  US: { name: "United States", short: "US", flag: "🇺🇸" },
  NG: { name: "Nigeria", short: "Nigeria", flag: "🇳🇬" },
  ZA: { name: "South Africa", short: "South Africa", flag: "🇿🇦" },
  KE: { name: "Kenya", short: "Kenya", flag: "🇰🇪" },
  GH: { name: "Ghana", short: "Ghana", flag: "🇬🇭" },
  GLOBAL: { name: "Global", short: "Global", flag: "🌍" },
};

// Normalizes a record (static module article OR entity record) into one shape
// the Insights pages render against, so the two sources can be merged cleanly.
export function normalizeInsight(a, isEntity) {
  return {
    slug: a.slug,
    title: a.title,
    excerpt: a.excerpt,
    content: a.content,
    category: a.category,
    market: isEntity ? a.market : "GLOBAL",
    marketName: isEntity ? a.market_name : null,
    authorName: isEntity ? a.author_name : AUTHOR.name,
    authorRole: isEntity ? a.author_role : AUTHOR.role,
    publishedAt: isEntity ? a.published_at : a.publishedAt,
    readingTime: isEntity ? a.reading_time : a.readingTime,
    relatedFeatures: isEntity ? a.related_features : a.relatedFeatures,
    seoKeywords: isEntity ? a.seo_keywords : null,
    isEntity,
  };
}