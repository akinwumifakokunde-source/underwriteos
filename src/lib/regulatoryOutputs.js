import { jsPDF } from "jspdf";

// Regulatory outputs built from the evidence graph:
//  - adverse-action / decline notices (market-specific)
//  - FCRA-style reason codes mapped from risk signals + reasons
//  - evidence-backed audit export (JSON) for examiners / compliance

const MARKET_FRAMEWORKS = {
  US: {
    name: "US — Equal Credit Opportunity Act (Reg B) & FCRA §615",
    statute: "ECOA (15 U.S.C. §1691) / FCRA (15 U.S.C. §1681a)",
    craNote: "Our decision was based in whole or in part on information obtained from a consumer reporting agency.",
    rights: [
      "You have the right to obtain a free copy of your consumer report from the consumer reporting agency named below within 60 days of receiving this notice.",
      "You have the right to dispute the accuracy or completeness of any information contained in your consumer report with the consumer reporting agency.",
      "If you believe this application was evaluated in a discriminatory manner, you may contact the Consumer Financial Protection Bureau (CFPB) or the relevant federal regulator.",
    ],
  },
  GB: {
    name: "United Kingdom — FCA CONC 11 (Notice of Refusal)",
    statute: "FCA Handbook CONC 11 / Consumer Credit Act 1974",
    craNote: "Our decision was based in part on information supplied by a credit reference agency.",
    rights: [
      "You have the right to request the name and address of the credit reference agency we consulted so that you can obtain a copy of the information they hold about you.",
      "You may apply to the credit reference agency for a correction of any information you believe is inaccurate.",
      "If you remain dissatisfied, you may refer your complaint to the Financial Ombudsman Service.",
    ],
  },
  NG: {
    name: "Nigeria — CBN Consumer Protection Regulations",
    statute: "CBN Consumer Protection Framework / BOFIA 2020",
    craNote: "Our decision was informed by a credit bureau report obtained in accordance with the CBN Credit Bureau Regulations.",
    rights: [
      "You have the right to request access to your credit information held by the credit bureau named below.",
      "You may dispute any inaccurate information with the credit bureau and request correction.",
      "You may direct complaints to the Central Bank of Nigeria Consumer Protection Department.",
    ],
  },
  ZA: {
    name: "South Africa — National Credit Act 34 of 2005 (§62)",
    statute: "National Credit Act 34 of 2005",
    craNote: "Our decision was based in part on a credit bureau report obtained in accordance with the National Credit Act.",
    rights: [
      "You have the right to request the reasons for the refusal of your application.",
      "You have the right to obtain a copy of your credit report from the credit bureau named below.",
      "You may dispute inaccurate information with the credit bureau and lodge a complaint with the National Credit Regulator if unresolved.",
    ],
  },
  KE: {
    name: "Kenya — Consumer Protection Act & CRB Regulations",
    statute: "Consumer Protection Act 2012 / CRB Regulations 2020",
    craNote: "Our decision was informed by a credit reference bureau report.",
    rights: [
      "You have the right to obtain a copy of your credit report from the credit reference bureau named below.",
      "You may dispute any inaccurate information with the bureau and request correction.",
      "You may escalate unresolved disputes to the Central Bank of Kenya or the Office of the Data Protection Commissioner.",
    ],
  },
  GH: {
    name: "Ghana — Credit Reporting Act 726 (2006)",
    statute: "Credit Reporting Act 726 / Borrowers & Lenders Act 772",
    craNote: "Our decision was informed by a credit reference bureau report obtained under the Credit Reporting Act.",
    rights: [
      "You have the right to obtain a copy of your credit report from the credit reference bureau named below.",
      "You may dispute any inaccurate information with the bureau and request correction.",
      "You may escalate unresolved disputes to the Bank of Ghana.",
    ],
  },
};

// Standard adverse-action reason codes. Each maps a keyword set (matched
// against risk signal names / reasons) to a code + plain-language description.
const REASON_CODES = [
  { code: "C01", desc: "Delinquent past or present credit obligations", kw: ["delinquen", "late payment", "missed payment", "arrears", "repayment history"] },
  { code: "C02", desc: "Proportion of revolving balances to credit limits too high", kw: ["utilisation", "utilization", "credit util", "balance to limit"] },
  { code: "C03", desc: "Too many recent credit inquiries", kw: ["enquir", "inquiry", "inquiries", "searches"] },
  { code: "C04", desc: "Insufficient length of credit history", kw: ["length of history", "short history", "thin file", "new file", "limited history"] },
  { code: "C05", desc: "Number of accounts with delinquency", kw: ["delinquent account", "delinquent_accounts"] },
  { code: "C06", desc: "Serious delinquency, default or public record on file", kw: ["default", "judgement", "judgment", "bankruptc", "ccj", "public record", "garnish", "lien"] },
  { code: "A01", desc: "Debt-to-income ratio exceeds policy threshold", kw: ["debt-to-income", "debt to income", "dti", "affordability", "over-indebted"] },
  { code: "A02", desc: "Insufficient disposable income", kw: ["disposable income", "disposable_income", "repayment capacity", "repayment_capacity"] },
  { code: "A03", desc: "Insufficient or unstable income", kw: ["income stability", "income_stability", "unstable income", "low income", "insufficient income", "income source"] },
  { code: "V01", desc: "Unstable or insufficient cash flow", kw: ["cashflow", "cash flow", "monthly net", "average balance", "negative balance"] },
  { code: "V02", desc: "Vatile or irregular expense pattern", kw: ["expense volatility", "expense_volatility", "spending pattern"] },
  { code: "F01", desc: "Insufficient verified income documentation", kw: ["missing document", "document quality", "incomplete", "unverified", "extraction confidence", "illegible"] },
  { code: "F02", desc: "Information provided could not be verified", kw: ["mismatch", "reconciliation", "inconsisten", "could not verify", "unverified", "fraud", "discrepancy"] },
  { code: "F03", desc: "Application incomplete or missing required documentation", kw: ["missing", "not provided", "not uploaded", "outstanding", "pending document"] },
];

const CATEGORY_FALLBACK = {
  credit: "C01",
  affordability: "A01",
  cashflow: "V01",
  fraud: "F02",
};

function matchCode(text) {
  const t = String(text || "").toLowerCase();
  for (const c of REASON_CODES) {
    if (c.kw.some((k) => t.includes(k))) return c;
  }
  return null;
}

// Build the ordered, de-duplicated reason-code list for a decision.
export function buildReasonCodes({ decision, recommendation, riskSignals }) {
  const out = [];
  const seen = new Set();
  const add = (code) => {
    if (code && !seen.has(code.code)) { seen.add(code.code); out.push(code); }
  };

  // 1. Negative / critical risk signals first (strongest evidence).
  const negative = (riskSignals || [])
    .filter((s) => ["negative", "critical"].includes(s.flag) || s.direction === "negative")
    .sort((a, b) => ({ critical: 3, negative: 2, neutral: 1, positive: 0 }[b.flag] || 0) - ({ critical: 3, negative: 2, neutral: 1, positive: 0 }[a.flag] || 0));
  negative.forEach((s) => {
    add(matchCode(s.signal) || matchCode(s.explanation));
  });

  // 2. Decision / recommendation reasons.
  const reasons = [...(decision?.reasons || []), ...(recommendation?.risk_factors || [])];
  reasons.forEach((r) => add(matchCode(r)));

  // 3. Category fallback for any unmatched negative signals.
  negative.forEach((s) => {
    if (!out.some((c) => c.code === (CATEGORY_FALLBACK[s.category] || "F02"))) {
      const fb = REASON_CODES.find((c) => c.code === (CATEGORY_FALLBACK[s.category] || "F02"));
      if (fb) add(fb);
    }
  });

  // 4. Always ensure at least one reason for an adverse decision.
  if (out.length === 0) add(REASON_CODES.find((c) => c.code === "F03"));
  return out.slice(0, 4); // FCRA: up to 4 key factors
}

// Identify the credit bureau used, from evidence / credit profile.
export function detectCreditBureau({ evidence, creditProfile }) {
  const ev = (evidence || []).find((e) => e.source_type === "credit_report" || /credit/i.test(e.signal || ""));
  if (ev?.source_provider) return ev.source_provider;
  if (creditProfile?.provider) return creditProfile.provider;
  return null;
}

// Build the adverse-action letter as structured lines.
export function buildAdverseActionLetter({
  decision, recommendation, borrower, app, riskSignals, evidence, creditProfile,
  market = "GB", lenderName = "the Lender",
}) {
  const fw = MARKET_FRAMEWORKS[market] || MARKET_FRAMEWORKS.GB;
  const isDecline = decision?.decision === "DECLINE";
  const isReview = decision?.decision === "REVIEW";
  const action = isDecline ? "declined" : isReview ? "approved with conditions requiring further information" : "approved";
  const reasonCodes = buildReasonCodes({ decision, recommendation, riskSignals });
  const bureau = detectCreditBureau({ evidence, creditProfile });
  const borrowerName = borrower ? `${borrower.first_name || ""} ${borrower.last_name || ""}`.trim() : "Applicant";
  const amount = app?.loan_amount ? `${app.loan_currency || ""} ${Number(app.loan_amount).toLocaleString()}` : "";
  const product = (app?.product_type || "credit").replace(/_/g, " ");
  const today = new Date().toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" });

  const lines = [];
  lines.push({ kind: "h", text: "Notice of Adverse Action" });
  lines.push({ kind: "m", text: `${lenderName}` });
  lines.push({ kind: "m", text: `Date: ${today}` });
  lines.push({ kind: "sp" });
  lines.push({ kind: "m", text: `Dear ${borrowerName},` });
  lines.push({ kind: "sp" });
  lines.push({ kind: "p", text: `Thank you for your recent application to ${lenderName} for ${product}${amount ? ` in the amount of ${amount}` : ""}. After careful consideration of the information available to us, we regret to inform you that your application has been ${action}.` });
  lines.push({ kind: "sp" });
  if (bureau) {
    lines.push({ kind: "p", text: fw.craNote });
    lines.push({ kind: "p", text: `Consumer reporting agency consulted: ${bureau}.` });
    lines.push({ kind: "sp" });
  }
  lines.push({ kind: "p", text: "The key factors that adversely affected our decision were:" });
  reasonCodes.forEach((c) => {
    lines.push({ kind: "li", text: `${c.code} — ${c.desc}` });
  });
  lines.push({ kind: "sp" });
  lines.push({ kind: "p", text: "Your rights:" });
  fw.rights.forEach((r) => lines.push({ kind: "li", text: r }));
  lines.push({ kind: "sp" });
  lines.push({ kind: "p", text: `If you have any questions about this notice or wish to request additional information, please contact ${lenderName}.` });
  lines.push({ kind: "sp" });
  lines.push({ kind: "m", text: `Regulatory basis: ${fw.statute}` });
  lines.push({ kind: "m", text: `This notice is generated automatically by UnderwriteOS and is retained in the decision audit trail.` });

  return { framework: fw.name, statute: fw.statute, action, reasonCodes, bureau, lines };
}

function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

// Adverse-action notice as a formatted PDF.
export function downloadAdverseActionPdf(letter, applicationId) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const left = 56;
  const right = pageW - 56;
  const contentW = right - left;
  const ink = [17, 24, 39];
  const muted = [107, 114, 128];
  let y = 0;

  const ensure = (h) => {
    if (y + h > pageH - 50) { doc.addPage(); y = 56; }
  };

  // branded header
  doc.setFillColor(17, 24, 39); doc.rect(0, 0, pageW, 40, "F");
  doc.setFillColor(13, 148, 136); doc.rect(0, 40, pageW, 3, "F");
  doc.setFont("helvetica", "bold"); doc.setFontSize(13); doc.setTextColor(255, 255, 255);
  doc.text("UnderwriteOS", left, 25);
  doc.setFont("helvetica", "normal"); doc.setFontSize(9); doc.setTextColor(180, 185, 192);
  doc.text("Regulatory Notice — Evidence-Backed", right, 25, { align: "right" });

  y = 64;
  doc.setFont("helvetica", "italic"); doc.setFontSize(8); doc.setTextColor(...muted);
  doc.text(letter.framework, left, y); y += 18;

  letter.lines.forEach((ln) => {
    if (ln.kind === "h") {
      ensure(28);
      doc.setFont("helvetica", "bold"); doc.setFontSize(16); doc.setTextColor(...ink);
      doc.text(ln.text, left, y); y += 20;
    } else if (ln.kind === "sp") {
      y += 8;
    } else if (ln.kind === "li") {
      ensure(16);
      doc.setFont("helvetica", "normal"); doc.setFontSize(10); doc.setTextColor(55, 65, 81);
      doc.splitTextToSize(`•  ${ln.text}`, contentW - 14).forEach((s) => { ensure(14); doc.text(s, left + 14, y); y += 13; });
    } else if (ln.kind === "m") {
      ensure(14);
      doc.setFont("helvetica", "normal"); doc.setFontSize(9); doc.setTextColor(...muted);
      doc.splitTextToSize(ln.text, contentW).forEach((s) => { ensure(12); doc.text(s, left, y); y += 12; });
    } else {
      ensure(16);
      doc.setFont("helvetica", "normal"); doc.setFontSize(10); doc.setTextColor(55, 65, 81);
      doc.splitTextToSize(ln.text, contentW).forEach((s) => { ensure(14); doc.text(s, left, y); y += 13; });
    }
  });

  // footer
  doc.setFont("helvetica", "normal"); doc.setFontSize(8); doc.setTextColor(...muted);
  doc.text(`Application ${applicationId}  ·  Generated ${new Date().toLocaleString()}`, left, pageH - 28);
  doc.save(`adverse-action-${applicationId}.pdf`);
}

// Reason codes as CSV.
export function downloadReasonCodesCsv(reasonCodes, applicationId) {
  const headers = ["Code", "Description"];
  const rows = reasonCodes.map((c) => [c.code, c.desc]);
  const esc = (v) => { const s = String(v ?? ""); return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
  const csv = [headers, ...rows].map((r) => r.map(esc).join(",")).join("\n");
  triggerDownload(new Blob([csv], { type: "text/csv;charset=utf-8;" }), `reason-codes-${applicationId}.csv`);
}

// Full evidence-backed audit export (JSON) — every signal traced to its source.
export function downloadAuditExportJson({ decision, recommendation, riskSignals, evidence, app, borrower, creditProfile, financialProfile, market, reasonCodes, bureau }) {
  const payload = {
    export_type: "underwriting_decision_audit",
    schema_version: "1.0",
    generated_at: new Date().toISOString(),
    application: {
      id: app?.id || null,
      application_number: app?.application_number || null,
      market,
      borrower_type: app?.borrower_type || null,
      product_type: app?.product_type || null,
      loan_amount: app?.loan_amount ?? null,
      loan_currency: app?.loan_currency || null,
      loan_term_months: app?.loan_term_months ?? null,
      policy_id: app?.policy_id || null,
      policy_version: app?.policy_version || null,
    },
    borrower: borrower
      ? {
          reference: borrower.borrower_reference || null,
          first_name: borrower.first_name || null,
          last_name: borrower.last_name || null,
          employment_status: borrower.employment_status || null,
          employer_name: borrower.employer_name || null,
          annual_income: borrower.annual_income ?? null,
          income_currency: borrower.income_currency || null,
        }
      : null,
    decision: decision
      ? {
          decision: decision.decision,
          decision_source: decision.decision_source || null,
          decided_by: decision.decided_by || null,
          decision_timestamp: decision.decision_timestamp || null,
          risk_score: decision.risk_score ?? null,
          probability_of_default: decision.probability_of_default ?? null,
          confidence: decision.confidence ?? null,
          human_review_required: decision.human_review_required ?? null,
          override_reason: decision.override_reason || null,
          policy_outcome: decision.policy_outcome || null,
          reasons: decision.reasons || [],
        }
      : null,
    recommendation: recommendation
      ? {
          recommendation: recommendation.recommendation,
          risk_score: recommendation.risk_score ?? null,
          probability_of_default: recommendation.probability_of_default ?? null,
          confidence: recommendation.confidence ?? null,
          positive_signals: recommendation.positive_signals || [],
          risk_factors: recommendation.risk_factors || [],
          human_review_required: recommendation.human_review_required ?? null,
          generated_at: recommendation.generated_at || null,
        }
      : null,
    reason_codes: reasonCodes || [],
    credit_bureau_consulted: bureau || null,
    credit_profile: creditProfile || null,
    financial_profile: financialProfile || null,
    risk_signals: (riskSignals || []).map((s) => ({
      id: s.id || null,
      category: s.category || null,
      signal: s.signal || null,
      value: s.value ?? null,
      value_type: s.value_type || null,
      currency: s.currency || null,
      flag: s.flag || null,
      severity: s.severity || null,
      direction: s.direction || null,
      confidence: s.confidence ?? null,
      source: s.source || null,
      source_reference: s.source_reference || null,
      explanation: s.explanation || null,
      evidence_id: s.evidence_id || null,
    })),
    evidence_graph: (evidence || []).map((e) => ({
      id: e.id || null,
      signal: e.signal || null,
      value: e.value ?? null,
      value_type: e.value_type || null,
      currency: e.currency || null,
      source_type: e.source_type || null,
      source_provider: e.source_provider || null,
      source_id: e.source_id || null,
      document_id: e.document_id || null,
      source_location: e.source_location || null,
      field: e.field || null,
      calculation_method: e.calculation_method || null,
      confidence: e.confidence ?? null,
    })),
    integrity: {
      risk_signal_count: (riskSignals || []).length,
      evidence_count: (evidence || []).length,
      every_signal_traced: (riskSignals || []).every((s) => s.evidence_id || (evidence || []).some((e) => e.signal === s.signal)),
    },
  };
  triggerDownload(new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" }), `audit-${app?.id || "export"}.json`);
}