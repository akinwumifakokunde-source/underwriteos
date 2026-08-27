import React from "react";
import { Sparkles, Save, Loader2, AlertCircle } from "lucide-react";

export const POLICY_REQUIRED_DOCS = {
  "consumer-v1": [
    { type: "bank_statement", label: "Bank statements", required: true },
    { type: "payslip", label: "Payslips", required: true },
    { type: "credit_report", label: "Credit report", required: true },
    { type: "proof_of_address", label: "Proof of address", required: false },
  ],
  "sme-v1": [
    { type: "bank_statement", label: "Bank statements", required: true },
    { type: "tax", label: "Tax returns", required: true },
    { type: "credit_report", label: "Credit report", required: true },
    { type: "financial_statement", label: "Financial statements", required: true },
  ],
};

export default function ApplicationFormSection({ borrower, app, form, setForm, extractedFields, onSave, saving, errors = {} }) {
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const isExtracted = (fieldName) => extractedFields?.some((f) => {
    const map = { annual_income: "annual_income", employer_name: "employer_name", first_name: "employee_name", last_name: "employee_name" };
    return f.name === map[fieldName] || f.name === fieldName;
  });

  const errorCount = Object.keys(errors).length;

  return (
    <div className="space-y-6">
      {errorCount > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-800">Borrower and loan details must be complete before analysis</p>
            <p className="text-[12px] text-amber-700 mt-0.5">{errorCount} required field{errorCount !== 1 ? "s" : ""} missing. UnderwriteOS will not run analysis until these are correct.</p>
          </div>
        </div>
      )}

      {/* Borrower */}
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <h3 className="text-sm font-semibold text-slate-900 mb-4">Borrower</h3>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="First name" required value={form.first_name} onChange={(v) => set("first_name", v)} placeholder="John" extracted={isExtracted("first_name")} error={errors.first_name} />
          <FormField label="Last name" required value={form.last_name} onChange={(v) => set("last_name", v)} placeholder="Smith" extracted={isExtracted("last_name")} error={errors.last_name} />
          <FormField label="Email" required value={form.email} onChange={(v) => set("email", v)} placeholder="john@example.com" type="email" error={errors.email} />
          <FormField label="Phone" value={form.phone} onChange={(v) => set("phone", v)} placeholder="+44 7700 900000" />
          <FormSelect label="Employment status" required value={form.employment_status} onChange={(v) => set("employment_status", v)} options={[
            { value: "employed", label: "Employed" },
            { value: "self_employed", label: "Self-employed" },
            { value: "unemployed", label: "Unemployed" },
            { value: "retired", label: "Retired" },
          ]} />
          <FormField label="Employer name" value={form.employer_name} onChange={(v) => set("employer_name", v)} placeholder="Acme Corp" extracted={isExtracted("employer_name")} />
          <FormField label="Annual income (£)" required value={form.annual_income} onChange={(v) => set("annual_income", v)} type="number" extracted={isExtracted("annual_income")} error={errors.annual_income} />
        </div>
      </div>

      {/* Loan */}
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <h3 className="text-sm font-semibold text-slate-900 mb-4">Loan details</h3>
        <div className="grid grid-cols-2 gap-3">
          <FormSelect label="Loan product" required value={form.product_type} onChange={(v) => set("product_type", v)} options={[
            { value: "personal_loan", label: "Personal Loan" },
            { value: "auto_loan", label: "Auto Loan" },
            { value: "business_loan", label: "Business Loan" },
            { value: "mortgage", label: "Mortgage" },
          ]} />
          <FormSelect label="Underwriting policy" required value={form.policy_id} onChange={(v) => set("policy_id", v)} options={[
            { value: "consumer-v1", label: "Consumer Lending v1" },
            { value: "sme-v1", label: "SME Lending v1" },
          ]} />
          <FormField label="Requested amount (£)" required value={form.loan_amount} onChange={(v) => set("loan_amount", v)} type="number" error={errors.loan_amount} />
          <FormField label="Term (months)" required value={form.loan_term_months} onChange={(v) => set("loan_term_months", v)} type="number" error={errors.loan_term_months} />
          <FormSelect label="Loan purpose" value={form.loan_purpose} onChange={(v) => set("loan_purpose", v)} options={[
            { value: "debt_consolidation", label: "Debt consolidation" },
            { value: "home_improvement", label: "Home improvement" },
            { value: "business_expansion", label: "Business expansion" },
            { value: "vehicle_purchase", label: "Vehicle purchase" },
            { value: "general", label: "General" },
          ]} />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-[12px] text-slate-400">
          {errorCount > 0
            ? `${errorCount} required field${errorCount !== 1 ? "s" : ""} missing — analysis blocked`
            : extractedFields?.length > 0
              ? `${extractedFields.length} fields auto-populated from documents`
              : "Upload documents to auto-populate fields"}
        </p>
        <button
          onClick={onSave}
          disabled={saving}
          className={`inline-flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-lg disabled:opacity-50 ${errorCount > 0 ? "text-white bg-amber-600 hover:bg-amber-700" : "text-white bg-slate-900 hover:bg-slate-800"}`}
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? "Saving…" : errorCount > 0 ? "Save to enable analysis" : "Save changes"}
        </button>
      </div>
    </div>
  );
}

function FormField({ label, value, onChange, placeholder, type = "text", extracted, required, error }) {
  return (
    <div>
      <label className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1">
        {label}{required && <span className="text-rose-500">*</span>}
        {extracted && <Sparkles className="w-3 h-3 text-teal-500" />}
      </label>
      <input
        type={type}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 ${error ? "border-rose-300 bg-rose-50/30 focus:ring-rose-200" : extracted ? "border-teal-200 bg-teal-50/30 focus:ring-slate-900/10" : "border-slate-200 focus:ring-slate-900/10"}`}
      />
      {error && <p className="text-[11px] text-rose-600 mt-1">{error}</p>}
    </div>
  );
}

function FormSelect({ label, value, onChange, options, required, error }) {
  return (
    <div>
      <label className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1">
        {label}{required && <span className="text-rose-500">*</span>}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`mt-1 w-full rounded-lg border px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 ${error ? "border-rose-300 bg-rose-50/30 focus:ring-rose-200" : "border-slate-200 focus:ring-slate-900/10"}`}
      >
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      {error && <p className="text-[11px] text-rose-600 mt-1">{error}</p>}
    </div>
  );
}