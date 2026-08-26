import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const EMPLOYMENT = ["employed", "self_employed", "unemployed", "retired", "other"];
const PRODUCTS = ["personal_loan", "auto_loan", "business_loan"];

function Field({ label, children, hint }) {
  return (
    <div>
      <Label className="text-[12px] text-slate-600">{label}</Label>
      <div className="mt-1">{children}</div>
      {hint && <p className="mt-1 text-[11px] text-slate-400">{hint}</p>}
    </div>
  );
}

const inputCls = "h-9 text-sm";
const selectCls =
  "h-9 w-full rounded-md border border-slate-200 bg-white px-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10";

export default function BorrowerLoanForm({ form, set }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-slate-900 mb-3">Borrower details</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="First name">
            <Input className={inputCls} value={form.first_name} onChange={(e) => set("first_name", e.target.value)} placeholder="Alex" />
          </Field>
          <Field label="Last name">
            <Input className={inputCls} value={form.last_name} onChange={(e) => set("last_name", e.target.value)} placeholder="Morgan" />
          </Field>
          <Field label="Email">
            <Input className={inputCls} type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="alex@example.com" />
          </Field>
          <Field label="Employment status">
            <select className={selectCls} value={form.employment_status} onChange={(e) => set("employment_status", e.target.value)}>
              {EMPLOYMENT.map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
            </select>
          </Field>
          <Field label="Employer name">
            <Input className={inputCls} value={form.employer_name} onChange={(e) => set("employer_name", e.target.value)} placeholder="Helix Digital Ltd" />
          </Field>
          <Field label="Annual income (GBP)">
            <Input className={inputCls} type="number" value={form.annual_income} onChange={(e) => set("annual_income", e.target.value)} />
          </Field>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-slate-900 mb-3">Loan details</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Loan amount (GBP)">
            <Input className={inputCls} type="number" value={form.loan_amount} onChange={(e) => set("loan_amount", e.target.value)} />
          </Field>
          <Field label="Term (months)">
            <Input className={inputCls} type="number" value={form.loan_term_months} onChange={(e) => set("loan_term_months", e.target.value)} />
          </Field>
          <Field label="Loan purpose">
            <Input className={inputCls} value={form.loan_purpose} onChange={(e) => set("loan_purpose", e.target.value)} placeholder="debt_consolidation" />
          </Field>
          <Field label="Product type">
            <select className={selectCls} value={form.product_type} onChange={(e) => set("product_type", e.target.value)}>
              {PRODUCTS.map((p) => <option key={p} value={p}>{p.replace("_", " ")}</option>)}
            </select>
          </Field>
        </div>
      </div>
    </div>
  );
}