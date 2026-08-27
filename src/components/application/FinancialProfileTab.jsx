import React from "react";
import { FileText, TrendingUp, TrendingDown, Minus } from "lucide-react";

const METRIC_SOURCES = {
  "Annual income": "payslip or bank statement",
  "Monthly income": "bank statement",
  "Monthly expenses": "bank statement",
  "Monthly debt payments": "bank statement",
  "Debt-to-income": "bank statement",
  "Monthly net cash flow": "bank statement",
  "Disposable income": "bank statement",
  "Average balance": "bank statement",
  "Credit score": "credit report",
  "Credit utilisation": "credit report",
  "Repayment history": "credit report",
  "Defaults": "credit report",
  "Delinquent accounts": "credit report",
  "Recent enquiries": "credit report",
  "Outstanding balance": "credit report",
};

export default function FinancialProfileTab({ fp, cp, evidence, riskSignals, fmtMoney, onViewEvidence }) {
  const evBySignal = {};
  (evidence || []).forEach((e) => { if (e.signal) evBySignal[e.signal] = e; });
  const signalBySignal = {};
  (riskSignals || []).forEach((s) => { if (s.signal) signalBySignal[s.signal] = s; });

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
        <p className="text-sm text-slate-500 font-medium">Financial profile not available yet</p>
        <p className="text-[12px] text-slate-400 mt-1">Upload bank statements and a credit report. UnderwriteOS will build the financial profile automatically as documents are processed.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <h3 className="text-sm font-semibold text-slate-900 mb-1">Financial profile</h3>
      <p className="text-[12px] text-slate-400 mb-4">Every metric shows its value, status, source and confidence.</p>
      <div className="space-y-1">
        {metrics.map((m, i) => (
          <FinancialMetric key={i} {...m} evidence={evBySignal[m.signal]} signal={signalBySignal[m.signal]} fmtMoney={fmtMoney} onViewEvidence={onViewEvidence} />
        ))}
      </div>
    </div>
  );
}

function FinancialMetric({ label, value, money, evidence, signal, fmtMoney, onViewEvidence }) {
  const display = value == null ? "—" : money ? fmtMoney(value) : value;
  const isAvailable = value != null;
  const sourceDoc = METRIC_SOURCES[label];

  let status = null;
  if (signal && isAvailable) {
    if (signal.flag === "negative" || signal.flag === "critical") status = { text: signal.explanation || "Above policy threshold", icon: TrendingDown, cls: "text-amber-600" };
    else if (signal.flag === "positive") status = { text: signal.explanation || "Within policy", icon: TrendingUp, cls: "text-emerald-600" };
    else status = { text: "Neutral", icon: Minus, cls: "text-slate-400" };
  }

  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-slate-50 last:border-0">
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-slate-800">{label}</div>
        {isAvailable ? (
          <div className="flex items-center gap-2 text-[11px] mt-0.5 flex-wrap">
            {status && (
              <span className={`flex items-center gap-1 ${status.cls}`}>
                <status.icon className="w-3 h-3" /> {status.text}
              </span>
            )}
            {evidence ? (
              <span className="text-slate-400">Source: {evidence.source_type?.replace(/_/g, " ")}{evidence.source_location ? ` · ${evidence.source_location}` : ""}</span>
            ) : (
              <span className="text-slate-300">Derived</span>
            )}
            {evidence?.confidence != null && <span className="text-teal-600">{Math.round(evidence.confidence * 100)}% confidence</span>}
            {evidence && <button onClick={() => onViewEvidence(evidence)} className="text-teal-600 hover:text-teal-700 font-medium">View evidence</button>}
          </div>
        ) : (
          <div className="text-[11px] text-slate-400 mt-0.5">
            Not available yet — upload a {sourceDoc || "document"} to calculate this.
          </div>
        )}
      </div>
      <div className={`text-sm font-mono font-semibold shrink-0 ${isAvailable ? "text-slate-900" : "text-slate-300"}`}>{display}</div>
    </div>
  );
}