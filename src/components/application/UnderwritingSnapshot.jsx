import React from "react";
import { computeRiskDimensions, DIMENSION_STYLES } from "@/lib/riskDimensions";

function computePayment(principal, termMonths, annualRatePct) {
  if (!principal || !termMonths) return 0;
  if (!annualRatePct) return principal / termMonths;
  const r = annualRatePct / 12 / 100;
  return (principal * r * Math.pow(1 + r, termMonths)) / (Math.pow(1 + r, termMonths) - 1);
}

export default function UnderwritingSnapshot({ borrower, app, fp, cp, decision, recommendation, documents, fmtMoney }) {
  const dims = computeRiskDimensions({ fp, cp, documents: documents || [], decision });
  const currency = app?.loan_currency || "GBP";
  const payment = computePayment(app?.loan_amount, app?.loan_term_months, app?.interest_rate);
  const disposableAfter = (fp?.cashflow?.disposable_income || 0) - payment;
  const dti = fp?.affordability?.debt_to_income;

  const metrics = [
    { label: "Borrower", value: borrower ? `${borrower.first_name} ${borrower.last_name}` : null, empty: "Not provided" },
    { label: "Loan", value: app?.loan_amount ? fmtMoney(app.loan_amount, currency) : null, empty: "Not specified" },
    { label: "Verified income", value: fp?.income?.monthly ? fmtMoney(fp.income.monthly, currency) : null, empty: "Awaiting bank data" },
    { label: "Proposed payment", value: payment > 0 ? fmtMoney(payment, currency) : null, empty: "Awaiting terms" },
    { label: "Disposable income", value: fp?.cashflow?.disposable_income != null ? fmtMoney(disposableAfter, currency) : null, empty: "Awaiting bank data" },
    { label: "DTI", value: dti != null ? `${(dti * 100).toFixed(1)}%` : null, empty: "Awaiting bank data" },
    { label: "Credit score", value: cp?.credit_score != null ? cp.credit_score : null, empty: "Awaiting credit report" },
  ];

  const dimensions = [
    { label: "Credit risk", ...dims.creditRisk },
    { label: "Affordability", ...dims.affordability },
    { label: "Fraud / identity", ...dims.fraudRisk },
    { label: "Data quality", ...dims.dataQuality },
    { label: "Policy", ...dims.policyEligibility },
  ];

  const outcomes = [
    { label: "AI recommendation", value: recommendation?.recommendation || "Pending" },
    { label: "Policy outcome", value: decision?.decision && decision.decision !== "null" ? decision.decision : "Pending" },
    { label: "Final decision", value: decision?.decision && decision.decision !== "null" ? decision.decision : "Pending" },
  ];

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <h3 className="text-sm font-semibold text-slate-900 mb-3">Underwriting snapshot</h3>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 mb-4">
        {metrics.map((m, i) => (
          <div key={i} className="rounded-lg border border-slate-100 bg-slate-50/50 p-3">
            <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">{m.label}</div>
            {m.value != null ? (
              <div className="text-sm font-semibold mt-0.5 text-slate-900">{m.value}</div>
            ) : (
              <div className="text-[11px] mt-0.5 text-slate-400 italic">{m.empty}</div>
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-4">
        {dimensions.map((d, i) => {
          const style = DIMENSION_STYLES[d.level] || DIMENSION_STYLES.Pending;
          return (
            <div key={i} className={`rounded-lg border p-3 ${style.cls}`}>
              <div className="text-[10px] uppercase tracking-wider opacity-70 font-semibold">{d.label}</div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                <span className="text-sm font-semibold">{d.level}</span>
              </div>
              <div className="text-[10px] opacity-70 mt-0.5">{d.detail}</div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-3 gap-3">
        {outcomes.map((o, i) => {
          const isPending = o.value === "Pending";
          const cls = isPending ? "text-slate-400" : o.value === "APPROVE" ? "text-emerald-700" : o.value === "DECLINE" ? "text-rose-700" : "text-amber-700";
          return (
            <div key={i} className="rounded-lg border border-slate-100 p-3 text-center">
              <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">{o.label}</div>
              <div className={`text-base font-bold mt-0.5 ${cls}`}>{o.value}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}