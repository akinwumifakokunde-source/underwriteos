import React from "react";
import { Sparkles, Save, Loader2, Globe } from "lucide-react";
import { JURISDICTIONS, getJurisdiction, getProducts, getPolicies, getCurrency } from "@/lib/jurisdictions";

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

export default function ApplicationFormSection({ borrower, app, form, setForm, extractedFields, onSave, saving }) {
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const jur = getJurisdiction(form?.market || "GB");

  const isExtracted = (fieldName) => extractedFields?.some((f) => {
    const map = { annual_income: "annual_income", employer_name: "employer_name", first_name: "employee_name", last_name: "employee_name" };
    return f.name === map[fieldName] || f.name === fieldName;
  });

  return (
    <div className="space-y-6">
      {/* Jurisdiction */}
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex items-center gap-2 mb-4">
          <Globe className="w-4 h-4 text-[#0d9488]" />
          <h3 className="text-sm font-semibold text-slate-900">Jurisdiction & product</h3>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <FormSelect label="Market" value={form.market} onChange={(v) => {
            const newJur = getJurisdiction(v);
            const newPolicy = getPolicies(v)[0]?.id || "consumer-v1";
            set("market", v);
            set("policy_id", newPolicy);
            set("loan_currency", newJur.currency);
            if (!newJur.products.find((p) => p.value === form.product_type)) {
              set("product_type", newJur.products[0]?.value || "personal_loan");
            }
          }} options={Object.values(JURISDICTIONS).map((j) => ({ value: j.code, label: j.name }))} />
          {jur.hasStates && (
            <FormField label="State" value={form.state} onChange={(v) => set("state", v)} placeholder="California" />
          )}
          <FormSelect label="Borrower type" value={form.borrower_type} onChange={(v) => set("borrower_type", v)} options={[
            { value: "salaried", label: "Salaried" },
            { value: "self_employed", label: "Self-employed" },
            { value: "business", label: "Business" },
          ]} />
          <FormSelect label="Loan product" value={form.product_type} onChange={(v) => set("product_type", v)} options={jur.products} />
          <FormSelect label="Underwriting policy" value={form.policy_id} onChange={(v) => set("policy_id", v)} options={jur.policies} />
          <div className="flex items-center gap-2 text-[12px] text-slate-400">
            <span>Currency:</span>
            <span className="font-mono font-medium text-slate-600">{jur.currency}</span>
            <span className="ml-auto">Regulatory: {jur.regulatoryProfile}</span>
          </div>
        </div>
      </div>

      {/* Borrower */}
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <h3 className="text-sm font-semibold text-slate-900 mb-4">Borrower</h3>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="First name" value={form.first_name} onChange={(v) => set("first_name", v)} placeholder="John" extracted={isExtracted("first_name")} />
          <FormField label="Last name" value={form.last_name} onChange={(v) => set("last_name", v)} placeholder="Smith" extracted={isExtracted("last_name")} />
          <FormField label="Email" value={form.email} onChange={(v) => set("email", v)} placeholder="john@example.com" type="email" />
          <FormField label="Phone" value={form.phone} onChange={(v) => set("phone", v)} placeholder="+44 7700 900000" />
          <FormSelect label="Employment status" value={form.employment_status} onChange={(v) => set("employment_status", v)} options={[
            { value: "employed", label: "Employed" },
            { value: "self_employed", label: "Self-employed" },
            { value: "unemployed", label: "Unemployed" },
            { value: "retired", label: "Retired" },
          ]} />
          <FormField label="Employer name" value={form.employer_name} onChange={(v) => set("employer_name", v)} placeholder="Acme Corp" extracted={isExtracted("employer_name")} />
          <FormField label={`Annual income (${jur.currency})`} value={form.annual_income} onChange={(v) => set("annual_income", v)} type="number" extracted={isExtracted("annual_income")} />
        </div>
      </div>

      {/* Loan */}
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <h3 className="text-sm font-semibold text-slate-900 mb-4">Loan details</h3>
        <div className="grid grid-cols-2 gap-3">
          <FormField label={`Requested amount (${jur.currency})`} value={form.loan_amount} onChange={(v) => set("loan_amount", v)} type="number" />
          <FormField label="Term (months)" value={form.loan_term_months} onChange={(v) => set("loan_term_months", v)} type="number" />
          <FormField label="Interest rate (%)" value={form.interest_rate} onChange={(v) => set("interest_rate", v)} type="number" placeholder="0" />
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
          {extractedFields?.length > 0
            ? `${extractedFields.length} fields auto-populated from documents`
            : "Upload documents to auto-populate fields"}
        </p>
        <button
          onClick={onSave}
          disabled={saving}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-white bg-slate-900 px-4 py-2 rounded-lg hover:bg-slate-800 disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? "Saving…" : "Save changes"}
        </button>
      </div>
    </div>
  );
}

function FormField({ label, value, onChange, placeholder, type = "text", extracted }) {
  return (
    <div>
      <label className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1">
        {label}
        {extracted && <Sparkles className="w-3 h-3 text-teal-500" />}
      </label>
      <input
        type={type}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 ${extracted ? "border-teal-200 bg-teal-50/30" : "border-slate-200"}`}
      />
    </div>
  );
}

function FormSelect({ label, value, onChange, options }) {
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