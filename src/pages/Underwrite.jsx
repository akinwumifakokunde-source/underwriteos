import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { withApiKey, hasApiKey } from "@/lib/apiKey";
import { Loader2, Check, ArrowRight, ArrowLeft, KeyRound, AlertCircle } from "lucide-react";
import Nav from "@/components/layout/Nav.jsx";
import BorrowerLoanForm from "@/components/underwrite/BorrowerLoanForm.jsx";
import DataSourceForm from "@/components/underwrite/DataSourceForm.jsx";
import UnderwriteResults from "@/components/underwrite/UnderwriteResults.jsx";

const STEPS = [
  { id: 1, label: "Borrower & loan" },
  { id: 2, label: "Financial data" },
  { id: 3, label: "Decision" },
];

const emptyForm = {
  first_name: "", last_name: "", email: "", employment_status: "employed", employer_name: "", annual_income: 52000,
  loan_amount: 12000, loan_term_months: 24, loan_purpose: "debt_consolidation", product_type: "personal_loan",
  dataMode: "manual",
  creditProvider: "experian", bankProvider: "truelayer",
  credit_score: 680, active_accounts: 4, delinquent_accounts: 0, defaults: 0,
  credit_utilisation: 0.25, recent_enquiries: 1, repayment_history: 95, outstanding_balance: 3000,
  monthly_income: 4333, monthly_expenses: 1800, existing_debt: 3000,
};

function buildManualTransactions(f) {
  const income = Math.round(Number(f.monthly_income));
  const rent = Math.round(Number(f.monthly_expenses) * 0.6);
  const living = Number(f.monthly_expenses) - rent;
  const debt = Math.max(1, Math.round(Number(f.existing_debt) / Number(f.loan_term_months)));
  const tx = [];
  for (const m of [5, 6, 7]) {
    const mm = String(m).padStart(2, "0");
    tx.push({ date: `2026-${mm}-25`, description: `Salary ${f.employer_name || "Employer"}`, amount: income, direction: "credit" });
    tx.push({ date: `2026-${mm}-01`, description: "Rent & utilities", amount: -rent, direction: "debit", recurring: true });
    tx.push({ date: `2026-${mm}-15`, description: "Loan repayment", amount: -debt, direction: "debit", recurring: true });
    tx.push({ date: `2026-${mm}-20`, description: "Groceries & transport", amount: -living, direction: "debit" });
  }
  return tx;
}

export default function Underwrite() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(emptyForm);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState([]);
  const [results, setResults] = useState(null);
  const [ids, setIds] = useState({});

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const addProgress = (msg) => setProgress((p) => [...p, { id: Date.now() + Math.random(), msg }]);

  const runUnderwriting = async () => {
    setRunning(true);
    setError(null);
    setResults(null);
    setProgress([]);
    setIds({});
    const ctx = {};
    try {
      addProgress("Creating borrower…");
      const b = await base44.functions.invoke("apiBorrowers", withApiKey({
        action: "create", first_name: form.first_name, last_name: form.last_name, email: form.email,
        employment_status: form.employment_status, employer_name: form.employer_name,
        annual_income: Number(form.annual_income), income_currency: "GBP",
      }));
      ctx.borrower_id = b.data.borrower_id;
      addProgress("✓ Borrower created");

      addProgress("Creating application…");
      const a = await base44.functions.invoke("apiApplications", withApiKey({
        action: "create", borrower_id: ctx.borrower_id, loan_amount: Number(form.loan_amount), loan_currency: "GBP",
        loan_purpose: form.loan_purpose, loan_term_months: Number(form.loan_term_months),
        product_type: form.product_type, policy_id: "consumer-v1",
      }));
      ctx.application_id = a.data.application_id;
      setIds({ borrower_id: ctx.borrower_id, application_id: ctx.application_id });
      addProgress("✓ Application created");

      addProgress("Ingesting credit data…");
      const creditPayload = form.dataMode === "auto"
        ? { action: "submit", application_id: ctx.application_id, provider: form.creditProvider, mode: "auto", search_reference: ctx.borrower_id }
        : { action: "submit", application_id: ctx.application_id, provider: "mock", raw_data: {
            credit_score: Number(form.credit_score), active_accounts: Number(form.active_accounts),
            delinquent_accounts: Number(form.delinquent_accounts), defaults: Number(form.defaults),
            credit_utilisation: Number(form.credit_utilisation), recent_enquiries: Number(form.recent_enquiries),
            repayment_history: Number(form.repayment_history), outstanding_balance: Number(form.outstanding_balance),
          } };
      await base44.functions.invoke("apiCreditReport", withApiKey(creditPayload));
      addProgress("✓ Credit data ingested");

      addProgress("Ingesting financial data…");
      const bankPayload = form.dataMode === "auto"
        ? { action: "submit", application_id: ctx.application_id, provider: form.bankProvider, mode: "auto", consent_reference: ctx.borrower_id }
        : { action: "submit", application_id: ctx.application_id, period_start: "2026-05-01", period_end: "2026-07-31", account_number_masked: "****1234", transactions: buildManualTransactions(form) };
      await base44.functions.invoke("apiBankStatement", withApiKey(bankPayload));
      addProgress("✓ Financial data ingested");

      addProgress("Analyzing risk…");
      await base44.functions.invoke("apiAnalyze", withApiKey({ application_id: ctx.application_id }));
      addProgress("✓ Analysis complete");

      addProgress("Running underwriting…");
      await base44.functions.invoke("apiUnderwrite", withApiKey({ application_id: ctx.application_id, policy_id: "consumer-v1" }));
      addProgress("✓ Underwriting complete");

      addProgress("Loading results…");
      const get = async (action) => {
        try {
          const r = await base44.functions.invoke("apiRetrieve", withApiKey({ action, application_id: ctx.application_id }));
          return r.data;
        } catch {
          return null;
        }
      };
      const [fp, cp, rec, dec, risk, ev] = await Promise.all([
        get("financial-profile"), get("credit-profile"), get("recommendation"),
        get("decision"), get("risk"), get("evidence"),
      ]);
      setResults({
        financialProfile: fp?.financial_profile,
        creditProfile: cp?.credit_profile,
        recommendation: rec?.recommendation,
        decision: dec?.decision,
        riskSignals: risk?.signals || [],
        evidence: ev?.evidence || [],
      });
      addProgress("✓ Done");
      setStep(3);
    } catch (e) {
      setError(e?.response?.data?.error?.message || e?.response?.data?.message || e.message || "Underwriting failed");
      addProgress("✗ Flow stopped");
    }
    setRunning(false);
  };

  const reset = () => {
    setResults(null);
    setError(null);
    setProgress([]);
    setIds({});
    setStep(1);
  };

  const canNext1 = form.first_name.trim() && form.last_name.trim() && form.email.trim() && Number(form.loan_amount) > 0;

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-900">
      <Nav />
      <div className="border-b border-slate-200 bg-white">
        <div className="max-w-5xl mx-auto px-5 sm:px-8 py-6">
          <h1 className="text-2xl font-semibold tracking-tight">Underwrite</h1>
          <p className="text-sm text-slate-500 mt-1">Run a full underwriting decision without writing any code. Enter the borrower's details, choose a data source, and get a decision.</p>
          {!hasApiKey() && (
            <div className="mt-3 flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
              <KeyRound className="w-4 h-4 shrink-0" />
              <span>No sandbox API key found.</span>
              <a href="/onboarding" className="font-medium underline">Run onboarding</a>
              <span className="text-amber-500">to provision one.</span>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-5 sm:px-8 py-6">
        <div className="flex items-center gap-2 mb-6">
          {STEPS.map((s, i) => {
            const active = step === s.id;
            const done = step > s.id;
            return (
              <React.Fragment key={s.id}>
                <div className={`flex items-center gap-2 ${active || done ? "text-slate-900" : "text-slate-400"}`}>
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${active ? "bg-slate-900 text-white" : done ? "bg-emerald-100 text-emerald-700 border border-emerald-200" : "bg-white border border-slate-200 text-slate-400"}`}>
                    {done ? <Check className="w-3.5 h-3.5" /> : s.id}
                  </span>
                  <span className="text-sm font-medium">{s.label}</span>
                </div>
                {i < STEPS.length - 1 && <div className={`flex-1 h-px ${step > s.id ? "bg-emerald-300" : "bg-slate-200"}`} />}
              </React.Fragment>
            );
          })}
        </div>

        {error && (
          <div className="mb-4 flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm text-rose-800">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
          {step === 1 && <BorrowerLoanForm form={form} set={set} />}
          {step === 2 && <DataSourceForm form={form} set={set} />}

          {step !== 3 && (
            <div className="flex items-center justify-between mt-6 pt-5 border-t border-slate-100">
              <button onClick={() => setStep((s) => Math.max(1, s - 1))} disabled={step === 1 || running} className="inline-flex items-center gap-1.5 text-sm text-slate-600 px-3 py-2 rounded-lg border border-slate-200 hover:bg-white disabled:opacity-40">
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              {step < 2 ? (
                <button onClick={() => setStep(2)} disabled={!canNext1} className="inline-flex items-center gap-1.5 text-sm font-medium text-white bg-slate-900 px-4 py-2 rounded-lg hover:bg-slate-800 disabled:opacity-40">
                  Continue <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button onClick={runUnderwriting} disabled={running || !canNext1} className="inline-flex items-center gap-1.5 text-sm font-medium text-white bg-slate-900 px-4 py-2 rounded-lg hover:bg-slate-800 disabled:opacity-60">
                  {running ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />} Run underwriting
                </button>
              )}
            </div>
          )}
        </div>

        {progress.length > 0 && step !== 3 && (
          <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
            <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-2">Progress</div>
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {progress.map((p) => (
                <div key={p.id} className="text-xs text-slate-600 font-mono">{p.msg}</div>
              ))}
            </div>
          </div>
        )}

        {step === 3 && results && (
          <UnderwriteResults results={results} ids={ids} onReset={reset} />
        )}
      </div>
    </div>
  );
}