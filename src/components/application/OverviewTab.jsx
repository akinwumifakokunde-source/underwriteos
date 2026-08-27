import React from "react";
import NeedsAttentionPanel from "./NeedsAttentionPanel";
import ApplicationFormSection from "./ApplicationFormSection";

export default function OverviewTab({ borrower, app, fp, cp, decision, recommendation, riskSignals, documents, fmtMoney, form, setForm, allExtracted, onSave, saving }) {
  const dti = fp?.affordability?.debt_to_income;
  const riskLevel = decision?.risk_score != null ? (decision.risk_score < 0.3 ? "LOW" : decision.risk_score < 0.6 ? "MEDIUM" : "HIGH") : "—";

  return (
    <div className="space-y-5">
      <NeedsAttentionPanel
        documents={documents}
        policyId={app?.policy_id || "consumer-v1"}
        decision={decision}
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Borrower" value={borrower ? `${borrower.first_name} ${borrower.last_name}` : "—"} />
        <StatCard label="Loan" value={fmtMoney(app?.loan_amount, app?.loan_currency)} />
        <StatCard label="Income" value={borrower?.annual_income ? fmtMoney(borrower.annual_income, borrower.income_currency) : fp?.income?.annual ? fmtMoney(fp.income.annual) : "—"} />
        <StatCard label="DTI" value={dti != null ? `${(dti * 100).toFixed(1)}%` : "—"} />
        <StatCard label="Credit score" value={cp?.credit_score ?? "—"} />
        <StatCard label="Risk" value={riskLevel} />
        <StatCard label="AI recommendation" value={recommendation?.recommendation || "—"} highlight={recommendation?.recommendation === "APPROVE" ? "emerald" : recommendation?.recommendation === "DECLINE" ? "rose" : "amber"} />
        <StatCard label="Final decision" value={decision?.decision || "—"} highlight={decision?.decision === "APPROVE" ? "emerald" : decision?.decision === "DECLINE" ? "rose" : "amber"} />
      </div>

      {decision?.reasons?.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h3 className="text-sm font-semibold text-slate-900 mb-2">Why this decision?</h3>
          <ul className="space-y-1.5">
            {decision.reasons.slice(0, 3).map((r, i) => (
              <li key={i} className="text-sm text-slate-600 flex gap-2"><span className="text-slate-300 mt-0.5">•</span>{r}</li>
            ))}
          </ul>
        </div>
      )}

      {form && (
        <ApplicationFormSection
          borrower={borrower} app={app} form={form} setForm={setForm}
          extractedFields={allExtracted} onSave={onSave} saving={saving}
        />
      )}
    </div>
  );
}

function StatCard({ label, value, highlight }) {
  const cls = highlight === "emerald" ? "text-emerald-700" : highlight === "rose" ? "text-rose-700" : highlight === "amber" ? "text-amber-700" : "text-slate-900";
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">{label}</div>
      <div className={`text-base font-semibold mt-1 ${cls}`}>{value}</div>
    </div>
  );
}