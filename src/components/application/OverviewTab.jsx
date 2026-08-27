import React from "react";
import { AlertCircle } from "lucide-react";
import NeedsAttentionPanel from "./NeedsAttentionPanel";
import ApplicationFormSection from "./ApplicationFormSection";

export default function OverviewTab({ borrower, app, fp, cp, decision, recommendation, riskSignals, documents, fmtMoney, form, setForm, allExtracted, onSave, saving, onNavigate, formErrors, formValid }) {
  const dti = fp?.affordability?.debt_to_income;
  const riskLevel = decision?.risk_score != null ? (decision.risk_score < 0.3 ? "LOW" : decision.risk_score < 0.6 ? "MEDIUM" : "HIGH") : "—";

  return (
    <div className="space-y-5">
      <NeedsAttentionPanel
        documents={documents}
        policyId={app?.policy_id || "consumer-v1"}
        decision={decision}
        onNavigate={onNavigate}
      />

      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <h3 className="text-sm font-semibold text-slate-900 mb-3">Credit picture</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard label="Borrower" value={borrower ? `${borrower.first_name} ${borrower.last_name}` : "—"} hint={borrower ? null : "Enter borrower details"} />
          <StatCard label="Loan" value={fmtMoney(app?.loan_amount, app?.loan_currency)} />
          <StatCard label="Income" value={borrower?.annual_income ? fmtMoney(borrower.annual_income, borrower.income_currency) : fp?.income?.annual ? fmtMoney(fp.income.annual) : "—"} hint={!borrower?.annual_income && !fp?.income?.annual ? "Upload a payslip" : null} />
          <StatCard label="DTI" value={dti != null ? `${(dti * 100).toFixed(1)}%` : "—"} hint={dti == null ? "Upload a bank statement" : null} />
          <StatCard label="Credit score" value={cp?.credit_score ?? "—"} hint={cp?.credit_score == null ? "Upload a credit report" : null} />
          <StatCard label="Risk" value={riskLevel} hint={riskLevel === "—" ? "Awaiting analysis" : null} />
          <StatCard label="AI recommendation" value={recommendation?.recommendation || "—"} highlight={recommendation?.recommendation === "APPROVE" ? "emerald" : recommendation?.recommendation === "DECLINE" ? "rose" : "amber"} hint={!recommendation ? "Awaiting analysis" : null} />
          <StatCard label="Final decision" value={decision?.decision || "—"} highlight={decision?.decision === "APPROVE" ? "emerald" : decision?.decision === "DECLINE" ? "rose" : "amber"} hint={!decision ? "Awaiting policy evaluation" : null} />
        </div>
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

      {!formValid && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-800">Borrower and loan details required before analysis</p>
            <p className="text-[12px] text-amber-700 mt-0.5">Complete the required fields below and save. UnderwriteOS will not run analysis until the details are correct.</p>
          </div>
        </div>
      )}

      {form && (
        <ApplicationFormSection
          borrower={borrower} app={app} form={form} setForm={setForm}
          extractedFields={allExtracted} onSave={onSave} saving={saving}
          errors={formErrors}
        />
      )}
    </div>
  );
}

function StatCard({ label, value, highlight, hint }) {
  const cls = highlight === "emerald" ? "text-emerald-700" : highlight === "rose" ? "text-rose-700" : highlight === "amber" ? "text-amber-700" : "text-slate-900";
  const unavailable = value === "—" || value == null;
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">{label}</div>
      <div className={`text-base font-semibold mt-1 ${unavailable ? "text-slate-300" : cls}`}>{value}</div>
      {unavailable && hint && <div className="text-[11px] text-slate-400 mt-0.5">{hint}</div>}
    </div>
  );
}