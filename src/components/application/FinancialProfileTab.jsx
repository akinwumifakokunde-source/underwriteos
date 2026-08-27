import React from "react";
import { FileText } from "lucide-react";

export default function FinancialProfileTab({ fp, cp, evidence, fmtMoney, onViewEvidence }) {
  const evBySignal = {};
  (evidence || []).forEach((e) => { if (e.signal) evBySignal[e.signal] = e; });

  const metrics = [
    { label: "Annual income", value: fp?.income?.annual, money: true, signal: "Annual income" },
    { label: "Monthly income", value: fp?.income?.monthly, money: true, signal: "Monthly income" },
    { label: "Monthly expenses", value: fp?.expenses?.monthly, money: true, signal: "Monthly expenses" },
    { label: "Monthly debt payments", value: fp?.debt?.monthly_payments, money: true, signal: "Monthly debt" },
    { label: "Debt-to-income", value: fp?.affordability?.debt_to_income != null ? `${(fp.affordability.debt_to_income * 100).toFixed(1)}%` : null, signal: "Debt-to-income" },
    { label: "Monthly net cash flow", value: fp?.cashflow?.monthly_net, money: true, signal: "Monthly net" },
    { label: "Disposable income", value: fp?.cashflow?.disposable_income, money: true, signal: "Disposable income" },
    { label: "Average balance", value: fp?.cashflow?.average_balance, money: true, signal: "Average balance" },
    { label: "Credit score", value: cp?.credit_score, signal: "Credit score" },
    { label: "Credit utilisation", value: cp?.credit_utilisation != null ? `${Math.round(cp.credit_utilisation * 100)}%` : null, signal: "Credit utilisation" },
    { label: "Repayment history", value: cp?.repayment_history != null ? `${cp.repayment_history}%` : null, signal: "Repayment history" },
    { label: "Defaults", value: cp?.defaults, signal: "Defaults" },
    { label: "Delinquent accounts", value: cp?.delinquent_accounts, signal: "Delinquent accounts" },
    { label: "Recent enquiries", value: cp?.recent_enquiries, signal: "Recent enquiries" },
    { label: "Outstanding balance", value: cp?.outstanding_balance, money: true, signal: "Outstanding balance" },
  ];

  if (!fp && !cp) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-8 text-center">
        <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
        <p className="text-sm text-slate-400">Waiting for borrower information.</p>
        <p className="text-[12px] text-slate-400 mt-1">Upload documents and UnderwriteOS will build the financial profile automatically.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <h3 className="text-sm font-semibold text-slate-900 mb-4">Financial profile</h3>
      <div className="space-y-1">
        {metrics.map((m, i) => (
          <FinancialMetric key={i} {...m} evidence={evBySignal[m.signal]} fmtMoney={fmtMoney} onViewEvidence={onViewEvidence} />
        ))}
      </div>
    </div>
  );
}

function FinancialMetric({ label, value, money, evidence, fmtMoney, onViewEvidence }) {
  const display = value == null ? "—" : money ? fmtMoney(value) : value;
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-slate-50 last:border-0">
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-slate-800">{label}</div>
        {evidence ? (
          <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5 flex-wrap">
            <span>Source: {evidence.source_type?.replace(/_/g, " ")}{evidence.source_location ? ` · ${evidence.source_location}` : ""}</span>
            {evidence.confidence != null && <span className="text-teal-600">{Math.round(evidence.confidence * 100)}% confidence</span>}
          </div>
        ) : (
          <div className="text-[11px] text-slate-300 mt-0.5">Derived</div>
        )}
      </div>
      <div className="text-sm font-mono font-semibold text-slate-900 shrink-0">{display}</div>
      {evidence && (
        <button onClick={() => onViewEvidence(evidence)} className="text-[11px] font-medium text-teal-600 hover:text-teal-700 shrink-0">View evidence</button>
      )}
    </div>
  );
}