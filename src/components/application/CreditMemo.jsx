import React from "react";
import { FileText } from "lucide-react";

export default function CreditMemo({ recommendation, borrower, app, fp, cp, evidence, fmtMoney }) {
  if (!recommendation) return null;

  const evBySignal = {};
  (evidence || []).forEach((e) => { if (e.signal) evBySignal[e.signal] = e; });

  const sourceRef = (signalName) => {
    const ev = evBySignal[signalName];
    if (!ev) return null;
    return `${ev.source_type?.replace(/_/g, " ") || "derived"}${ev.source_location ? ` · ${ev.source_location}` : ""}`;
  };

  const sections = [
    {
      title: "Borrower overview",
      rows: [
        { label: "Name", value: borrower ? `${borrower.first_name} ${borrower.last_name}` : "—" },
        { label: "Employment", value: borrower?.employment_status?.replace(/_/g, " ") || "—", source: sourceRef("Employment") },
        { label: "Employer", value: borrower?.employer_name || "—", source: sourceRef("Employer") },
      ],
    },
    {
      title: "Loan request",
      rows: [
        { label: "Amount", value: fmtMoney(app?.loan_amount, app?.loan_currency) },
        { label: "Term", value: app?.loan_term_months ? `${app.loan_term_months} months` : "—" },
        { label: "Purpose", value: app?.loan_purpose?.replace(/_/g, " ") || "—" },
        { label: "Product", value: app?.product_type?.replace(/_/g, " ") || "—" },
      ],
    },
    {
      title: "Financial profile",
      rows: [
        { label: "Annual income", value: fp?.income?.annual ? fmtMoney(fp.income.annual) : "—", source: sourceRef("Annual income") },
        { label: "Monthly income", value: fp?.income?.monthly ? fmtMoney(fp.income.monthly) : "—", source: sourceRef("Monthly income") },
        { label: "Monthly expenses", value: fp?.expenses?.monthly ? fmtMoney(fp.expenses.monthly) : "—", source: sourceRef("Monthly expenses") },
        { label: "Monthly debt", value: fp?.debt?.monthly_payments ? fmtMoney(fp.debt.monthly_payments) : "—", source: sourceRef("Monthly debt") },
        { label: "Disposable income", value: fp?.cashflow?.disposable_income ? fmtMoney(fp.cashflow.disposable_income) : "—", source: sourceRef("Disposable income") },
      ],
    },
    {
      title: "Credit profile",
      rows: [
        { label: "Credit score", value: cp?.credit_score ?? "—", source: sourceRef("Credit score") },
        { label: "Credit utilisation", value: cp?.credit_utilisation != null ? `${Math.round(cp.credit_utilisation * 100)}%` : "—", source: sourceRef("Credit utilisation") },
        { label: "Repayment history", value: cp?.repayment_history != null ? `${cp.repayment_history}%` : "—", source: sourceRef("Repayment history") },
        { label: "Defaults", value: cp?.defaults ?? "—", source: sourceRef("Defaults") },
        { label: "Recent enquiries", value: cp?.recent_enquiries ?? "—", source: sourceRef("Recent enquiries") },
      ],
    },
    {
      title: "Affordability",
      rows: [
        { label: "Debt-to-income", value: fp?.affordability?.debt_to_income != null ? `${(fp.affordability.debt_to_income * 100).toFixed(1)}%` : "—", source: sourceRef("Debt-to-income") },
        { label: "Repayment capacity", value: fp?.affordability?.repayment_capacity != null ? `${(fp.affordability.repayment_capacity * 100).toFixed(1)}%` : "—" },
      ],
    },
  ];

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex items-center gap-2 mb-4">
        <FileText className="w-4 h-4 text-slate-500" />
        <h3 className="text-sm font-semibold text-slate-900">Credit memo</h3>
        <span className="text-[10px] text-slate-400 font-normal ml-auto">Decision-ready summary with source references</span>
      </div>
      <div className="space-y-4">
        {sections.map((s, i) => (
          <div key={i}>
            <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-1.5">{s.title}</div>
            <div className="space-y-0.5">
              {s.rows.map((r, j) => (
                <div key={j} className="flex items-baseline gap-2 text-[13px] py-0.5">
                  <span className="text-slate-500 w-36 shrink-0">{r.label}</span>
                  <span className="font-mono font-medium text-slate-900">{r.value}</span>
                  {r.source && <span className="text-[11px] text-slate-400 ml-auto">Source: {r.source}</span>}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Key concerns & positive factors */}
      <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {recommendation.risk_factors?.length > 0 && (
          <div>
            <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-1.5">Key concerns</div>
            <ul className="space-y-1">
              {recommendation.risk_factors.map((r, i) => <li key={i} className="text-[13px] text-slate-600 flex gap-2"><span className="text-amber-500 shrink-0">⚠</span>{r}</li>)}
            </ul>
          </div>
        )}
        {recommendation.positive_signals?.length > 0 && (
          <div>
            <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-1.5">Positive factors</div>
            <ul className="space-y-1">
              {recommendation.positive_signals.map((p, i) => <li key={i} className="text-[13px] text-slate-600 flex gap-2"><span className="text-emerald-500 shrink-0">✓</span>{p}</li>)}
            </ul>
          </div>
        )}
      </div>

      {/* AI recommendation & rationale */}
      <div className="mt-4 pt-4 border-t border-slate-100">
        <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-1.5">AI recommendation & rationale</div>
        <p className="text-[13px] text-slate-600 leading-relaxed">{recommendation.ai_memo || recommendation.ai_summary || "—"}</p>
      </div>
    </div>
  );
}