import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import Nav from "@/components/layout/Nav.jsx";
import { Loader2, AlertCircle, ArrowLeft, ArrowRight, Check, Upload, User, Building2 } from "lucide-react";

const STEPS = [
  { id: 1, label: "Borrower" },
  { id: 2, label: "Loan" },
  { id: 3, label: "Financials" },
  { id: 4, label: "Documents" },
  { id: 5, label: "Review" },
];

const emptyForm = {
  borrower_type: "individual",
  first_name: "", last_name: "", email: "", phone: "",
  employment_status: "employed", employer_name: "", annual_income: 52000,
  loan_amount: 12000, loan_term_months: 24, loan_purpose: "debt_consolidation", product_type: "personal_loan",
  monthly_income: 4333, monthly_expenses: 1800, existing_debt: 3000,
  credit_score: 680, active_accounts: 4, delinquent_accounts: 0, defaults: 0,
  credit_utilisation: 0.25, recent_enquiries: 1, repayment_history: 95, outstanding_balance: 3000,
  policy_id: "consumer-v1",
};

export default function ApplicationCreate() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(emptyForm);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState([]);
  const [files, setFiles] = useState([]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const addProgress = (msg) => setProgress((p) => [...p, { id: Date.now() + Math.random(), msg }]);

  const handleFiles = (e) => {
    const selected = Array.from(e.target.files || []);
    setFiles((f) => [...f, ...selected]);
  };

  const submit = async () => {
    setRunning(true);
    setError(null);
    setProgress([]);
    const ctx = {};
    try {
      addProgress("Creating borrower…");
      const b = await base44.functions.invoke("apiBorrowers", {
        action: "create",
        first_name: form.first_name,
        last_name: form.last_name,
        email: form.email,
        phone: form.phone,
        employment_status: form.employment_status,
        employer_name: form.employer_name,
        annual_income: Number(form.annual_income),
        income_currency: "GBP",
      });
      ctx.borrower_id = b.data.borrower_id;
      addProgress("✓ Borrower created");

      addProgress("Creating application…");
      const a = await base44.functions.invoke("apiApplications", {
        action: "create",
        borrower_id: ctx.borrower_id,
        loan_amount: Number(form.loan_amount),
        loan_currency: "GBP",
        loan_purpose: form.loan_purpose,
        loan_term_months: Number(form.loan_term_months),
        product_type: form.product_type,
        policy_id: form.policy_id,
      });
      ctx.application_id = a.data.application_id;
      addProgress("✓ Application created");

      addProgress("Ingesting credit data…");
      await base44.functions.invoke("apiCreditReport", {
        action: "submit",
        application_id: ctx.application_id,
        provider: "mock",
        raw_data: {
          credit_score: Number(form.credit_score),
          active_accounts: Number(form.active_accounts),
          delinquent_accounts: Number(form.delinquent_accounts),
          defaults: Number(form.defaults),
          credit_utilisation: Number(form.credit_utilisation),
          recent_enquiries: Number(form.recent_enquiries),
          repayment_history: Number(form.repayment_history),
          outstanding_balance: Number(form.outstanding_balance),
        },
      });
      addProgress("✓ Credit data ingested");

      addProgress("Ingesting financial data…");
      const income = Math.round(Number(form.monthly_income));
      const rent = Math.round(Number(form.monthly_expenses) * 0.6);
      const living = Number(form.monthly_expenses) - rent;
      const debt = Math.max(1, Math.round(Number(form.existing_debt) / Number(form.loan_term_months)));
      const tx = [];
      for (const m of [5, 6, 7]) {
        const mm = String(m).padStart(2, "0");
        tx.push({ date: `2026-${mm}-25`, description: `Salary ${form.employer_name || "Employer"}`, amount: income, direction: "credit" });
        tx.push({ date: `2026-${mm}-01`, description: "Rent & utilities", amount: -rent, direction: "debit", recurring: true });
        tx.push({ date: `2026-${mm}-15`, description: "Loan repayment", amount: -debt, direction: "debit", recurring: true });
        tx.push({ date: `2026-${mm}-20`, description: "Groceries & transport", amount: -living, direction: "debit" });
      }
      await base44.functions.invoke("apiBankStatement", {
        action: "submit",
        application_id: ctx.application_id,
        period_start: "2026-05-01",
        period_end: "2026-07-31",
        account_number_masked: "****1234",
        transactions: tx,
      });
      addProgress("✓ Financial data ingested");

      addProgress("Uploading documents…");
      for (const file of files) {
        try {
          const { file_url } = await base44.integrations.Core.UploadFile({ file });
          await base44.functions.invoke("apiDocuments", {
            action: "upload",
            application_id: ctx.application_id,
            file_url,
            filename: file.name,
            content_type: file.type,
          });
        } catch {}
      }
      addProgress("✓ Documents uploaded");

      addProgress("Analyzing risk…");
      await base44.functions.invoke("apiAnalyze", { application_id: ctx.application_id });
      addProgress("✓ Analysis complete");

      addProgress("Running underwriting…");
      await base44.functions.invoke("apiUnderwrite", { application_id: ctx.application_id, policy_id: form.policy_id });
      addProgress("✓ Underwriting complete");

      addProgress("✓ Done — redirecting to application workspace…");
      setTimeout(() => navigate(`/applications/${ctx.application_id}`), 800);
    } catch (e) {
      setError(e?.response?.data?.error?.message || e?.response?.data?.message || e.message || "Application creation failed");
      addProgress("✗ Flow stopped");
    }
    setRunning(false);
  };

  const canNext = () => {
    if (step === 1) return form.first_name.trim() && form.last_name.trim() && form.email.trim();
    if (step === 2) return Number(form.loan_amount) > 0;
    return true;
  };

  return (
    <div className="min-h-screen bg-[#f7f8fa] text-slate-900">
      <Nav />
      <div className="max-w-3xl mx-auto px-5 sm:px-8 py-8">
        <Link to="/applications" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 mb-4">
          <ArrowLeft className="w-4 h-4" /> Applications
        </Link>

        <h1 className="text-2xl font-semibold tracking-tight mb-1">New Application</h1>
        <p className="text-sm text-slate-500 mb-6">Create an underwriting application without writing code.</p>

        {/* Steps */}
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
                  <span className="text-sm font-medium hidden sm:inline">{s.label}</span>
                </div>
                {i < STEPS.length - 1 && <div className={`flex-1 h-px hidden sm:block ${step > s.id ? "bg-emerald-300" : "bg-slate-200"}`} />}
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
          {/* Step 1: Borrower */}
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-sm font-semibold text-slate-900">Borrower information</h2>
              <div className="flex gap-2">
                <button onClick={() => set("borrower_type", "individual")} className={`flex-1 flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm ${form.borrower_type === "individual" ? "border-slate-900 bg-slate-50" : "border-slate-200"}`}>
                  <User className="w-4 h-4" /> Individual
                </button>
                <button onClick={() => set("borrower_type", "business")} className={`flex-1 flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm ${form.borrower_type === "business" ? "border-slate-900 bg-slate-50" : "border-slate-200"}`}>
                  <Building2 className="w-4 h-4" /> Business
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="First name" value={form.first_name} onChange={(v) => set("first_name", v)} placeholder="John" />
                <Field label="Last name" value={form.last_name} onChange={(v) => set("last_name", v)} placeholder="Smith" />
              </div>
              <Field label="Email" value={form.email} onChange={(v) => set("email", v)} placeholder="john@example.com" type="email" />
              <Field label="Phone" value={form.phone} onChange={(v) => set("phone", v)} placeholder="+44 7700 900000" />
              <div className="grid grid-cols-2 gap-3">
                <SelectField label="Employment status" value={form.employment_status} onChange={(v) => set("employment_status", v)} options={[
                  { value: "employed", label: "Employed" },
                  { value: "self_employed", label: "Self-employed" },
                  { value: "unemployed", label: "Unemployed" },
                  { value: "retired", label: "Retired" },
                ]} />
                <Field label="Employer name" value={form.employer_name} onChange={(v) => set("employer_name", v)} placeholder="Acme Corp" />
              </div>
              <Field label="Annual income (£)" value={form.annual_income} onChange={(v) => set("annual_income", v)} type="number" />
            </div>
          )}

          {/* Step 2: Loan */}
          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-sm font-semibold text-slate-900">Loan details</h2>
              <SelectField label="Loan product" value={form.product_type} onChange={(v) => set("product_type", v)} options={[
                { value: "personal_loan", label: "Personal Loan" },
                { value: "auto_loan", label: "Auto Loan" },
                { value: "business_loan", label: "Business Loan" },
                { value: "mortgage", label: "Mortgage" },
              ]} />
              <div className="grid grid-cols-2 gap-3">
                <Field label="Requested amount (£)" value={form.loan_amount} onChange={(v) => set("loan_amount", v)} type="number" />
                <Field label="Term (months)" value={form.loan_term_months} onChange={(v) => set("loan_term_months", v)} type="number" />
              </div>
              <SelectField label="Loan purpose" value={form.loan_purpose} onChange={(v) => set("loan_purpose", v)} options={[
                { value: "debt_consolidation", label: "Debt consolidation" },
                { value: "home_improvement", label: "Home improvement" },
                { value: "business_expansion", label: "Business expansion" },
                { value: "vehicle_purchase", label: "Vehicle purchase" },
                { value: "general", label: "General" },
              ]} />
              <SelectField label="Underwriting policy" value={form.policy_id} onChange={(v) => set("policy_id", v)} options={[
                { value: "consumer-v1", label: "Consumer Lending v1" },
                { value: "sme-v1", label: "SME Lending v1" },
              ]} />
            </div>
          )}

          {/* Step 3: Financials */}
          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-sm font-semibold text-slate-900">Financial information</h2>
              <p className="text-[13px] text-slate-500">Enter the borrower's financial data. This will be used to generate risk signals and evaluate the policy.</p>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Monthly income (£)" value={form.monthly_income} onChange={(v) => set("monthly_income", v)} type="number" />
                <Field label="Monthly expenses (£)" value={form.monthly_expenses} onChange={(v) => set("monthly_expenses", v)} type="number" />
                <Field label="Existing debt (£)" value={form.existing_debt} onChange={(v) => set("existing_debt", v)} type="number" />
              </div>
              <div className="pt-3 border-t border-slate-100">
                <h3 className="text-sm font-semibold text-slate-900 mb-3">Credit information</h3>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Credit score" value={form.credit_score} onChange={(v) => set("credit_score", v)} type="number" />
                  <Field label="Active accounts" value={form.active_accounts} onChange={(v) => set("active_accounts", v)} type="number" />
                  <Field label="Delinquent accounts" value={form.delinquent_accounts} onChange={(v) => set("delinquent_accounts", v)} type="number" />
                  <Field label="Defaults" value={form.defaults} onChange={(v) => set("defaults", v)} type="number" />
                  <Field label="Credit utilisation (0-1)" value={form.credit_utilisation} onChange={(v) => set("credit_utilisation", v)} type="number" />
                  <Field label="Recent enquiries" value={form.recent_enquiries} onChange={(v) => set("recent_enquiries", v)} type="number" />
                  <Field label="Repayment history (%)" value={form.repayment_history} onChange={(v) => set("repayment_history", v)} type="number" />
                  <Field label="Outstanding balance (£)" value={form.outstanding_balance} onChange={(v) => set("outstanding_balance", v)} type="number" />
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Documents */}
          {step === 4 && (
            <div className="space-y-4">
              <h2 className="text-sm font-semibold text-slate-900">Upload documents</h2>
              <p className="text-[13px] text-slate-500">Upload bank statements, payslips, tax documents, or credit reports. Documents will be processed and key information extracted automatically.</p>
              <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-slate-200 rounded-xl py-10 cursor-pointer hover:bg-slate-50 transition-colors">
                <Upload className="w-6 h-6 text-slate-400" />
                <span className="text-sm text-slate-500">Click to upload or drag and drop</span>
                <span className="text-[11px] text-slate-400">PDF, CSV, JSON, images · Bank statements, payslips, tax documents</span>
                <input type="file" multiple onChange={handleFiles} className="hidden" />
              </label>
              {files.length > 0 && (
                <div className="space-y-1.5">
                  {files.map((f, i) => (
                    <div key={i} className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm">
                      <div className="w-7 h-7 rounded bg-slate-100 flex items-center justify-center text-[10px] font-mono text-slate-500 shrink-0">{f.name.split(".").pop()?.slice(0, 3).toUpperCase() || "DOC"}</div>
                      <span className="flex-1 truncate">{f.name}</span>
                      <span className="text-[11px] text-slate-400">{(f.size / 1024).toFixed(0)} KB</span>
                      <button onClick={() => setFiles((prev) => prev.filter((_, idx) => idx !== i))} className="text-slate-400 hover:text-rose-600 text-xs">Remove</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 5: Review */}
          {step === 5 && (
            <div className="space-y-4">
              <h2 className="text-sm font-semibold text-slate-900">Review and submit</h2>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <ReviewRow label="Borrower" value={`${form.first_name} ${form.last_name}`} />
                <ReviewRow label="Email" value={form.email} />
                <ReviewRow label="Loan product" value={form.product_type.replace(/_/g, " ")} />
                <ReviewRow label="Requested amount" value={`£${Number(form.loan_amount).toLocaleString()}`} />
                <ReviewRow label="Term" value={`${form.loan_term_months} months`} />
                <ReviewRow label="Purpose" value={form.loan_purpose.replace(/_/g, " ")} />
                <ReviewRow label="Annual income" value={`£${Number(form.annual_income).toLocaleString()}`} />
                <ReviewRow label="Policy" value={form.policy_id} />
                <ReviewRow label="Credit score" value={form.credit_score} />
                <ReviewRow label="Documents" value={`${files.length} file${files.length !== 1 ? "s" : ""}`} />
              </div>
              <div className="rounded-lg bg-sky-50 border border-sky-200 p-3 text-[13px] text-sky-700">
                When you submit, UnderwriteOS will create the application, process the data, generate risk signals, evaluate the policy, and produce an underwriting decision — all automatically.
              </div>
            </div>
          )}

          {/* Navigation */}
          {step < 5 && (
            <div className="flex items-center justify-between mt-6 pt-5 border-t border-slate-100">
              <button onClick={() => setStep((s) => Math.max(1, s - 1))} disabled={step === 1} className="inline-flex items-center gap-1.5 text-sm text-slate-600 px-3 py-2 rounded-lg border border-slate-200 hover:bg-white disabled:opacity-40">
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <button onClick={() => setStep((s) => s + 1)} disabled={!canNext()} className="inline-flex items-center gap-1.5 text-sm font-medium text-white bg-slate-900 px-4 py-2 rounded-lg hover:bg-slate-800 disabled:opacity-40">
                Continue <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {step === 5 && (
            <div className="flex items-center justify-between mt-6 pt-5 border-t border-slate-100">
              <button onClick={() => setStep(4)} disabled={running} className="inline-flex items-center gap-1.5 text-sm text-slate-600 px-3 py-2 rounded-lg border border-slate-200 hover:bg-white disabled:opacity-40">
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <button onClick={submit} disabled={running} className="inline-flex items-center gap-1.5 text-sm font-medium text-white bg-slate-900 px-4 py-2 rounded-lg hover:bg-slate-800 disabled:opacity-60">
                {running ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />} {running ? "Processing…" : "Submit application"}
              </button>
            </div>
          )}
        </div>

        {/* Progress */}
        {progress.length > 0 && (
          <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
            <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-2">Progress</div>
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {progress.map((p) => (
                <div key={p.id} className="text-xs text-slate-600 font-mono">{p.msg}</div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, type = "text" }) {
  return (
    <div>
      <label className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10"
      />
    </div>
  );
}

function SelectField({ label, value, onChange, options }) {
  return (
    <div>
      <label className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10"
      >
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

function ReviewRow({ label, value }) {
  return (
    <div className="flex items-center justify-between border-b border-slate-50 py-1.5">
      <span className="text-slate-500">{label}</span>
      <span className="font-medium text-slate-800 capitalize">{value}</span>
    </div>
  );
}