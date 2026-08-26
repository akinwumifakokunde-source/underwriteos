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

// PDF — professional formatted summary via jsPDF
export function downloadDecisionPdf(s) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const left = 48;
  const right = pageW - 48;
  const contentW = right - left;
  let y = 0;

  const ink = [17, 24, 39];
  const muted = [107, 114, 128];
  const line = [229, 231, 235];
  const decisionColors = {
    APPROVE: [5, 150, 105],
    REVIEW: [217, 119, 6],
    DECLINE: [220, 38, 38],
  };
  const dc = decisionColors[s.decision] || muted;

  const addFooter = () => {
    doc.setFont("helvetica", "normal"); doc.setFontSize(8); doc.setTextColor(...muted);
    doc.text("UnderwriteOS  —  Underwriting Decision Summary", left, pageH - 28);
    doc.text(`Generated ${new Date(s.timestamp).toLocaleString()}`, right, pageH - 28, { align: "right" });
  };
  const ensure = (h) => {
    if (y + h > pageH - 56) { addFooter(); doc.addPage(); y = 56; }
  };

  // branded header band
  doc.setFillColor(17, 24, 39); doc.rect(0, 0, pageW, 40, "F");
  doc.setFillColor(13, 148, 136); doc.rect(0, 40, pageW, 3, "F");
  doc.setFont("helvetica", "bold"); doc.setFontSize(13); doc.setTextColor(255, 255, 255);
  doc.text("UnderwriteOS", left, 25);
  doc.setFont("helvetica", "normal"); doc.setFontSize(9); doc.setTextColor(180, 185, 192);
  doc.text("Underwriting Decision Summary", right, 25, { align: "right" });

  y = 70;
  doc.setFont("helvetica", "bold"); doc.setFontSize(18); doc.setTextColor(...ink);
  doc.text("Underwriting Decision Summary", left, y); y += 16;
  doc.setFont("helvetica", "normal"); doc.setFontSize(9); doc.setTextColor(...muted);
  doc.text(`Application ${s.application_id}     ${new Date(s.timestamp).toLocaleString()}`, left, y); y += 22;

  // decision badge + key metrics
  ensure(54);
  doc.setFillColor(dc[0], dc[1], dc[2]);
  doc.roundedRect(left, y, 128, 30, 4, 4, "F");
  doc.setFont("helvetica", "bold"); doc.setFontSize(13); doc.setTextColor(255, 255, 255);
  doc.text(s.decision, left + 64, y + 19, { align: "center" });
  doc.setFont("helvetica", "normal"); doc.setFontSize(9); doc.setTextColor(...muted);
  doc.text(`Decided by ${s.decision_source.replace(/_/g, " ")}`, left + 144, y + 12);
  doc.text(`Risk score ${fmt(s.risk_score, 2)}   ·   PD ${fmt(s.probability_of_default, 2)}   ·   Confidence ${pct(s.confidence)}`, left + 144, y + 24);
  y += 46;

  const section = (title) => {
    ensure(30);
    doc.setFont("helvetica", "bold"); doc.setFontSize(10); doc.setTextColor(...muted);
    doc.text(title.toUpperCase(), left, y); y += 6;
    doc.setDrawColor(...line); doc.setLineWidth(1); doc.line(left, y, right, y); y += 12;
  };
  const kvRow = (label, val, alt = false) => {
    ensure(18);
    if (alt) { doc.setFillColor(249, 250, 251); doc.rect(left, y - 11, contentW, 16, "F"); }
    doc.setFont("helvetica", "normal"); doc.setFontSize(10);
    doc.setTextColor(...muted); doc.text(label, left + 4, y);
    doc.setTextColor(...ink); doc.text(String(val ?? "—"), left + 210, y);
    y += 16;
  };

  section("Decision");
  kvRow("Recommendation", s.recommendation, true);
  kvRow("Risk score", fmt(s.risk_score, 2));
  kvRow("Probability of default", fmt(s.probability_of_default, 2), true);
  kvRow("Confidence", pct(s.confidence));
  kvRow("Decided by", s.decision_source.replace(/_/g, " "), true);
  kvRow("Human review required", s.human_review_required);
  y += 8;

  if (s.reasons && s.reasons.length) {
    section("Reasons");
    doc.setFont("helvetica", "normal"); doc.setFontSize(10); doc.setTextColor(55, 65, 81);
    s.reasons.forEach((r) => {
      doc.splitTextToSize(`-  ${r}`, contentW - 8).forEach((ln) => { ensure(15); doc.text(ln, left + 4, y); y += 13; });
    });
    y += 8;
  }

  if (s.risk_signals && s.risk_signals.length) {
    section("Risk signals");
    ensure(20);
    doc.setFillColor(243, 244, 246); doc.rect(left, y - 11, contentW, 16, "F");
    doc.setFont("helvetica", "bold"); doc.setFontSize(9); doc.setTextColor(...muted);
    doc.text("Signal", left + 4, y);
    doc.text("Value", left + 300, y);
    doc.text("Flag", right - 4, y, { align: "right" });
    y += 16;
    s.risk_signals.forEach((sig, i) => {
      ensure(16);
      if (i % 2 === 1) { doc.setFillColor(249, 250, 251); doc.rect(left, y - 11, contentW, 15, "F"); }
      doc.setFont("helvetica", "normal"); doc.setFontSize(10); doc.setTextColor(...ink);
      const sigLines = doc.splitTextToSize(String(sig.signal), 280);
      doc.text(sigLines[0], left + 4, y);
      doc.setTextColor(...muted); doc.text(String(sig.value ?? "—"), left + 300, y);
      doc.setTextColor(...ink); doc.text((sig.flag || "neutral").toUpperCase(), right - 4, y, { align: "right" });
      y += 15;
    });
    y += 8;
  }

  const cp = s.credit_profile || {};
  section("Credit profile");
  kvRow("Credit score", fmt(cp.credit_score), true);
  kvRow("Score band", cp.score_band);
  kvRow("Credit utilisation", cp.credit_utilisation != null ? pct(cp.credit_utilisation) : "—", true);
  kvRow("Defaults", fmt(cp.defaults));
  kvRow("Active accounts", fmt(cp.active_accounts), true);
  kvRow("Provider", cp.provider);
  y += 8;

  const fp = s.financial_profile || {};
  section("Financial profile");
  kvRow("Monthly income", fp.income?.monthly != null ? "GBP " + fmt(fp.income.monthly) : "—", true);
  kvRow("Monthly net cashflow", fp.cashflow?.monthly_net != null ? "GBP " + fmt(fp.cashflow.monthly_net) : "—");
  kvRow("Debt-to-income", fp.affordability?.debt_to_income != null ? fmt(fp.affordability.debt_to_income, 2) : "—", true);
  kvRow("Disposable income", fp.cashflow?.disposable_income != null ? "GBP " + fmt(fp.cashflow.disposable_income) : "—");
  y += 8;

  ensure(24);
  doc.setFont("helvetica", "normal"); doc.setFontSize(8); doc.setTextColor(...muted);
  doc.text(`${s.evidence_count} evidence records attached to this decision.`, left, y);

  addFooter();
  doc.save(`underwriting-${s.application_id}.pdf`);
}