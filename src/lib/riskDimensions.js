import { getDocumentRequirements } from "./jurisdictions";

export function computeRiskDimensions({ fp, cp, riskSignals, documents, decision }) {
  // CREDIT RISK — "Will the borrower repay?"
  let creditRisk = { level: "Pending", detail: "No credit data" };
  if (cp?.credit_score != null) {
    if (cp.credit_score >= 700) creditRisk = { level: "LOW", detail: `Score ${cp.credit_score}` };
    else if (cp.credit_score >= 600) creditRisk = { level: "MEDIUM", detail: `Score ${cp.credit_score}` };
    else creditRisk = { level: "HIGH", detail: `Score ${cp.credit_score}` };
  }
  if (cp?.defaults > 0) creditRisk = { level: "HIGH", detail: `${cp.defaults} active default(s)` };

  // AFFORDABILITY — "Can they sustainably afford repayments?"
  let affordability = { level: "Pending", detail: "Not calculated" };
  if (fp?.affordability?.debt_to_income != null) {
    const dti = fp.affordability.debt_to_income;
    if (dti <= 0.3) affordability = { level: "PASS", detail: `DTI ${(dti * 100).toFixed(1)}%` };
    else if (dti <= 0.45) affordability = { level: "REVIEW", detail: `DTI ${(dti * 100).toFixed(1)}%` };
    else affordability = { level: "FAIL", detail: `DTI ${(dti * 100).toFixed(1)}%` };
  }

  // FRAUD / IDENTITY RISK
  let fraudRisk = { level: "Pending", detail: "Not assessed" };
  const fraudSignals = (riskSignals || []).filter((s) => s.category === "fraud");
  if (fraudSignals.some((s) => s.flag === "critical")) fraudRisk = { level: "HIGH", detail: "Critical fraud signal" };
  else if (fraudSignals.some((s) => s.flag === "negative")) fraudRisk = { level: "REVIEW", detail: "Fraud signal detected" };
  else if (documents.length > 0) fraudRisk = { level: "LOW", detail: "No fraud signals" };

  // DATA QUALITY
  let dataQuality = { level: "Pending", detail: "No documents" };
  if (documents.length > 0) {
    const verified = documents.filter((d) => d.status === "verified").length;
    const ratio = verified / documents.length;
    if (ratio >= 0.8) dataQuality = { level: "HIGH", detail: `${verified}/${documents.length} verified` };
    else if (ratio >= 0.5) dataQuality = { level: "MEDIUM", detail: `${verified}/${documents.length} verified` };
    else dataQuality = { level: "LOW", detail: `${verified}/${documents.length} verified` };
  }

  // POLICY ELIGIBILITY
  let policyEligibility = { level: "Pending", detail: "Not evaluated" };
  if (decision?.decision && decision.decision !== "null") {
    if (decision.decision === "APPROVE") policyEligibility = { level: "PASS", detail: "Policy approved" };
    else if (decision.decision === "REVIEW") policyEligibility = { level: "REVIEW", detail: "Policy review" };
    else policyEligibility = { level: "FAIL", detail: "Policy declined" };
  }

  return { creditRisk, affordability, fraudRisk, dataQuality, policyEligibility };
}

export function computeReadiness({ documents, policyId, fp, cp, decision, borrowerType, market, autoIngested }) {
  const required = getDocumentRequirements(market, policyId, borrowerType);
  const requiredDocs = required.filter((r) => r.required);
  const docsMet = requiredDocs.filter((r) =>
    documents.some((d) => d.document_type === r.type && (d.status === "verified" || d.status === "processed"))
  ).length;
  const docsTotal = requiredDocs.length;

  // When data was auto-ingested via data sources (sample application / open banking),
  // document requirements are fulfilled without manual uploads.
  const docsComplete = autoIngested || docsMet >= docsTotal;

  const checks = [
    {
      label: "Documents",
      status: docsComplete ? "complete" : docsMet > 0 ? "partial" : "missing",
      detail: autoIngested ? "Via data source" : `${docsMet}/${docsTotal}`,
    },
    {
      label: "Identity",
      status: autoIngested || documents.some((d) => d.document_type === "identity" && d.status === "verified") ? "complete" : "pending",
      detail: autoIngested ? "Verified" : (documents.some((d) => d.document_type === "identity") ? "Uploaded" : "Not provided"),
    },
    {
      label: "Income",
      status: fp?.income?.monthly != null ? "complete" : "pending",
      detail: fp?.income?.monthly != null ? "Verified" : "Not verified",
    },
    {
      label: "Affordability",
      status: fp?.affordability?.debt_to_income != null ? "complete" : "pending",
      detail: fp?.affordability?.debt_to_income != null ? "Calculated" : "Pending",
    },
    {
      label: "Credit",
      status: cp?.credit_score != null ? "complete" : "missing",
      detail: cp?.credit_score != null ? "Present" : "Missing",
    },
    {
      label: "Policy",
      status: decision ? "complete" : "pending",
      detail: decision ? "Evaluated" : "Pending",
    },
  ];

  const completeCount = checks.filter((c) => c.status === "complete").length;
  const readiness = Math.round((completeCount / checks.length) * 100);
  const decisionReady = completeCount === checks.length;
  const blockingItems = checks.filter((c) => c.status === "missing").map((c) => c.label);

  return { checks, readiness, decisionReady, docsMet, docsTotal, blockingItems };
}

export const DIMENSION_STYLES = {
  PASS: { cls: "text-emerald-700 bg-emerald-50 border-emerald-200", dot: "bg-emerald-500" },
  LOW: { cls: "text-emerald-700 bg-emerald-50 border-emerald-200", dot: "bg-emerald-500" },
  MEDIUM: { cls: "text-amber-700 bg-amber-50 border-amber-200", dot: "bg-amber-500" },
  REVIEW: { cls: "text-amber-700 bg-amber-50 border-amber-200", dot: "bg-amber-500" },
  HIGH: { cls: "text-rose-700 bg-rose-50 border-rose-200", dot: "bg-rose-500" },
  FAIL: { cls: "text-rose-700 bg-rose-50 border-rose-200", dot: "bg-rose-500" },
  Pending: { cls: "text-slate-500 bg-slate-50 border-slate-200", dot: "bg-slate-300" },
};

export const READINESS_STYLES = {
  complete: { icon: "✓", cls: "text-emerald-600" },
  partial: { icon: "◐", cls: "text-amber-600" },
  pending: { icon: "○", cls: "text-slate-300" },
  missing: { icon: "✕", cls: "text-rose-500" },
};