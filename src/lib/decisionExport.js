import { jsPDF } from "jspdf";

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

function fmt(n, dp = 0) {
  if (n == null || n === "" || isNaN(n)) return "—";
  return Number(n).toLocaleString(undefined, { maximumFractionDigits: dp });
}

function pct(n) {
  if (n == null || isNaN(n)) return "—";
  return `${Math.round(n * 100)}%`;
}

export function buildDecisionSummary(results, ids) {
  const { decision, recommendation, riskSignals = [], evidence = [], financialProfile, creditProfile } = results;
  return {
    application_id: ids?.application_id || "—",
    timestamp: new Date().toISOString(),
    decision: decision?.decision || "—",
    decision_source: decision?.decision_source || "—",
    recommendation: recommendation?.recommendation || "—",
    risk_score: decision?.risk_score ?? recommendation?.risk_score,
    probability_of_default: recommendation?.probability_of_default,
    confidence: recommendation?.confidence,
    human_review_required: recommendation?.human_review_required ? "Yes" : "No",
    reasons: decision?.reasons || recommendation?.reasons || [],
    risk_signals: riskSignals || [],
    credit_profile: creditProfile || null,
    financial_profile: financialProfile || null,
    evidence_count: (evidence || []).length,
  };
}

// CSV — flat master-record row (paste into Excel / Google Sheets)
export function downloadDecisionCsv(s) {
  const headers = [
    "Application ID", "Timestamp", "Decision", "Decision Source", "Recommendation",
    "Risk Score", "Probability of Default", "Confidence", "Human Review Required",
    "Credit Score", "Credit Band", "Credit Utilisation", "Defaults", "Active Accounts", "Credit Provider",
    "Monthly Income", "Monthly Net", "Debt-to-Income", "Disposable Income",
    "Risk Signal Count", "Evidence Count", "Reasons",
  ];
  const cp = s.credit_profile || {};
  const fp = s.financial_profile || {};
  const row = [
    s.application_id, s.timestamp, s.decision, s.decision_source, s.recommendation,
    fmt(s.risk_score, 2), fmt(s.probability_of_default, 2), pct(s.confidence), s.human_review_required,
    fmt(cp.credit_score), cp.score_band || "—", cp.credit_utilisation != null ? pct(cp.credit_utilisation) : "—", fmt(cp.defaults), fmt(cp.active_accounts), cp.provider || "—",
    fp.income?.monthly != null ? fmt(fp.income.monthly) : "—",
    fp.cashflow?.monthly_net != null ? fmt(fp.cashflow.monthly_net) : "—",
    fp.affordability?.debt_to_income != null ? fmt(fp.affordability.debt_to_income, 2) : "—",
    fp.cashflow?.disposable_income != null ? fmt(fp.cashflow.disposable_income) : "—",
    String(s.risk_signals.length || 0), String(s.evidence_count),
    (s.reasons || []).join(" | "),
  ];
  const esc = (v) => {
    const str = String(v ?? "");
    return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
  };
  const csv = [headers, row].map((r) => r.map(esc).join(",")).join("\n");
  triggerDownload(new Blob([csv], { type: "text/csv;charset=utf-8;" }), `underwriting-${s.application_id}.csv`);
}

// Word (.doc) via HTML — opens in Microsoft Word / Google Docs
export function downloadDecisionWord(s) {
  const cp = s.credit_profile || {};
  const fp = s.financial_profile || {};
  const row = (label, val) => `<tr><td style="padding:4px 14px 4px 0;color:#6b7280;font-size:11px">${label}</td><td style="padding:4px 0;font-size:11px;font-weight:600">${val ?? "—"}</td></tr>`;
  const signals = (s.risk_signals || [])
    .map((sig) => `<tr><td style="padding:3px 0;font-size:11px">${sig.signal}</td><td style="font-size:11px;text-align:right;font-family:monospace">${String(sig.value ?? "—")}</td><td style="font-size:11px;text-align:right">${(sig.flag || "neutral").toUpperCase()}</td></tr>`)
    .join("");
  const reasons = (s.reasons || []).map((r) => `<li style="font-size:11px;color:#374151">${r}</li>`).join("");
  const html = `<!DOCTYPE html><html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word"><head><meta charset="utf-8"><title>Underwriting Decision</title></head><body style="font-family:Calibri,Arial,sans-serif;color:#111827">
<h1 style="font-size:20px;margin:0">Underwriting Decision Summary</h1>
<p style="font-size:11px;color:#6b7280;margin:4px 0 16px">Application ${s.application_id} &middot; ${new Date(s.timestamp).toLocaleString()}</p>
<table style="border-collapse:collapse;margin-bottom:16px"><tr><td style="padding:4px 14px 4px 0;color:#6b7280;font-size:11px">Decision</td><td style="font-size:13px;font-weight:700">${s.decision}</td></tr>${row("Recommendation", s.recommendation)}${row("Risk score", fmt(s.risk_score, 2))}${row("Probability of default", fmt(s.probability_of_default, 2))}${row("Confidence", pct(s.confidence))}${row("Decided by", s.decision_source.replace(/_/g, " "))}${row("Human review", s.human_review_required)}</table>
${reasons ? `<p style="font-size:12px;font-weight:700;margin:12px 0 4px">Reasons</p><ul style="margin:0 0 16px;padding-left:18px">${reasons}</ul>` : ""}
${signals ? `<p style="font-size:12px;font-weight:700;margin:12px 0 4px">Risk signals</p><table style="border-collapse:collapse;width:100%;margin-bottom:16px"><tr><td style="font-size:10px;color:#6b7280;border-bottom:1px solid #e5e7eb;padding:3px 0">Signal</td><td style="font-size:10px;color:#6b7280;border-bottom:1px solid #e5e7eb;text-align:right">Value</td><td style="font-size:10px;color:#6b7280;border-bottom:1px solid #e5e7eb;text-align:right">Flag</td></tr>${signals}</table>` : ""}
<p style="font-size:12px;font-weight:700;margin:12px 0 4px">Credit profile</p><table style="border-collapse:collapse;margin-bottom:16px">${row("Score", fmt(cp.credit_score))}${row("Band", cp.score_band)}${row("Utilisation", cp.credit_utilisation != null ? pct(cp.credit_utilisation) : "—")}${row("Defaults", fmt(cp.defaults))}${row("Active accounts", fmt(cp.active_accounts))}${row("Provider", cp.provider)}</table>
<p style="font-size:12px;font-weight:700;margin:12px 0 4px">Financial profile</p><table style="border-collapse:collapse;margin-bottom:16px">${row("Monthly income", fp.income?.monthly != null ? "£" + fmt(fp.income.monthly) : "—")}${row("Monthly net", fp.cashflow?.monthly_net != null ? "£" + fmt(fp.cashflow.monthly_net) : "—")}${row("Debt-to-income", fp.affordability?.debt_to_income != null ? fmt(fp.affordability.debt_to_income, 2) : "—")}${row("Disposable income", fp.cashflow?.disposable_income != null ? "£" + fmt(fp.cashflow.disposable_income) : "—")}</table>
<p style="font-size:10px;color:#9ca3af;margin-top:24px">Generated by UnderwriteOS &middot; ${s.evidence_count} evidence records attached</p>
</body></html>`;
  triggerDownload(new Blob(["\ufeff", html], { type: "application/msword" }), `underwriting-${s.application_id}.doc`);
}

// PDF — formatted summary via jsPDF
export function downloadDecisionPdf(s) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const left = 40;
  const right = pageW - 40;
  let y = 50;

  const ensure = (h) => {
    if (y + h > pageH - 40) { doc.addPage(); y = 50; }
  };
  const heading = (text) => { ensure(26); doc.setFont("helvetica", "bold"); doc.setFontSize(12); doc.setTextColor(17, 24, 39); doc.text(text, left, y); y += 16; };
  const kv = (label, val) => {
    ensure(16);
    doc.setFont("helvetica", "normal"); doc.setFontSize(10);
    doc.setTextColor(107, 114, 128); doc.text(label, left, y);
    doc.setTextColor(17, 24, 39); doc.text(String(val ?? "—"), left + 170, y);
    y += 14;
  };

  doc.setFont("helvetica", "bold"); doc.setFontSize(18); doc.setTextColor(17, 24, 39);
  doc.text("Underwriting Decision Summary", left, y); y += 22;
  doc.setFont("helvetica", "normal"); doc.setFontSize(9); doc.setTextColor(107, 114, 128);
  doc.text(`Application ${s.application_id}   ${new Date(s.timestamp).toLocaleString()}`, left, y); y += 24;

  heading("Decision");
  kv("Decision", s.decision);
  kv("Recommendation", s.recommendation);
  kv("Risk score", fmt(s.risk_score, 2));
  kv("Probability of default", fmt(s.probability_of_default, 2));
  kv("Confidence", pct(s.confidence));
  kv("Decided by", s.decision_source.replace(/_/g, " "));
  kv("Human review", s.human_review_required);
  y += 6;

  if (s.reasons && s.reasons.length) {
    heading("Reasons");
    doc.setFont("helvetica", "normal"); doc.setFontSize(10); doc.setTextColor(55, 65, 81);
    s.reasons.forEach((r) => {
      doc.splitTextToSize(`- ${r}`, right - left).forEach((ln) => { ensure(14); doc.text(ln, left, y); y += 13; });
    });
    y += 6;
  }

  if (s.risk_signals && s.risk_signals.length) {
    heading("Risk signals");
    s.risk_signals.forEach((sig) => {
      ensure(16);
      doc.setFont("helvetica", "normal"); doc.setFontSize(10); doc.setTextColor(17, 24, 39);
      doc.text(String(sig.signal), left, y);
      doc.setTextColor(107, 114, 128);
      doc.text(String(sig.value ?? "—"), left + 270, y);
      doc.text((sig.flag || "neutral").toUpperCase(), right, y, { align: "right" });
      y += 14;
    });
    y += 6;
  }

  const cp = s.credit_profile || {};
  heading("Credit profile");
  kv("Score", fmt(cp.credit_score));
  kv("Band", cp.score_band);
  kv("Utilisation", cp.credit_utilisation != null ? pct(cp.credit_utilisation) : "—");
  kv("Defaults", fmt(cp.defaults));
  kv("Active accounts", fmt(cp.active_accounts));
  kv("Provider", cp.provider);
  y += 6;

  const fp = s.financial_profile || {};
  heading("Financial profile");
  kv("Monthly income", fp.income?.monthly != null ? "GBP " + fmt(fp.income.monthly) : "—");
  kv("Monthly net", fp.cashflow?.monthly_net != null ? "GBP " + fmt(fp.cashflow.monthly_net) : "—");
  kv("Debt-to-income", fp.affordability?.debt_to_income != null ? fmt(fp.affordability.debt_to_income, 2) : "—");
  kv("Disposable income", fp.cashflow?.disposable_income != null ? "GBP " + fmt(fp.cashflow.disposable_income) : "—");

  ensure(24);
  y += 10;
  doc.setFont("helvetica", "normal"); doc.setFontSize(8); doc.setTextColor(156, 163, 175);
  doc.text(`Generated by UnderwriteOS  -  ${s.evidence_count} evidence records`, left, y);

  doc.save(`underwriting-${s.application_id}.pdf`);
}