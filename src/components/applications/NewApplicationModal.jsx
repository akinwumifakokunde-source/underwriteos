import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { getJurisdiction } from "@/lib/jurisdictions";
import { Loader2, AlertTriangle, X, Play, UserPlus, Inbox } from "lucide-react";

const MARKETS = [
  { value: "GB", label: "United Kingdom" },
  { value: "US", label: "United States" },
  { value: "NG", label: "Nigeria" },
  { value: "ZA", label: "South Africa" },
  { value: "KE", label: "Kenya" },
  { value: "GH", label: "Ghana" },
  { value: "OT", label: "Other" },
];

const PRODUCTS = [
  { value: "personal_loan", label: "Personal loan" },
  { value: "instalment", label: "Instalment plan" },
  { value: "pos", label: "Point-of-sale finance" },
  { value: "auto_loan", label: "Auto loan" },
];

const EMPLOYMENT = [
  { value: "employed", label: "Employed (salaried)" },
  { value: "self_employed", label: "Self-employed" },
  { value: "business", label: "Business owner" },
];

const inputCls = "w-full text-sm rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-900/10 transition";

function Field({ label, required, children }) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-600 mb-1">{label}{required && <span className="text-rose-500 ml-0.5">*</span>}</label>
      {children}
    </div>
  );
}

export default function NewApplicationModal({ open, onClose, apps, borrowers }) {
  const navigate = useNavigate();
  const [tab, setTab] = useState("pending");
  const [runningId, setRunningId] = useState(null);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({
    market: "GB", product_type: "personal_loan", borrower_type: "salaried",
    loan_term_months: 12, employment_status: "employed",
  });
  const [creating, setCreating] = useState(false);

  const pending = useMemo(
    () => apps.filter((a) => (a.status === "draft" || a.status === "data_collection") && (!a.decision || a.decision === "null")),
    [apps]
  );

  const fmtMoney = (n, c) => new Intl.NumberFormat("en-US", { style: "currency", currency: (c || "GBP").toUpperCase(), maximumFractionDigits: 0 }).format(n || 0);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  // Readiness gate: documents must be received, classified and extracted
  // (or a financial/credit profile must already exist from a data-source pull)
  // before the end-to-end underwriting pipeline is allowed to run. Incomplete
  // applications open on the Documents tab so the underwriter can see pending
  // files and chase the borrower for follow-up.
  const runUnderwriting = async (a) => {
    setRunningId(a.id);
    setError(null);
    try {
      const [docRes, sumRes] = await Promise.all([
        base44.functions.invoke("apiDocuments", { action: "list", application_id: a.id }),
        base44.functions.invoke("apiRetrieve", { action: "summary", application_id: a.id }),
      ]);
      const docs = docRes.data?.documents || [];
      const s = sumRes.data || {};
      const hasDocs = docs.length > 0;
      const allProcessed = hasDocs && docs.every((d) => ["processed", "verified"].includes(d.status));
      const allExtracted = hasDocs && docs.every((d) => d.extracted_data?.fields?.length > 0);
      const hasProfiles = !!(s.financial_profile || s.credit_profile);
      const ready = (hasDocs && allProcessed && allExtracted) || hasProfiles;

      if (!ready) {
        onClose();
        navigate(`/applications/${a.id}?tab=Documents`);
        return;
      }

      await base44.functions.invoke("apiAnalyze", { application_id: a.id });
      await base44.functions.invoke("apiUnderwrite", { application_id: a.id, policy_id: a.policy_id || "consumer-v1" });
      onClose();
      navigate(`/applications/${a.id}`);
    } catch (e) {
      setError(e?.response?.data?.error?.message || e.message || "Underwriting failed.");
      setRunningId(null);
    }
  };

  const createNew = async (e) => {
    e.preventDefault();
    if (!form.first_name || !form.last_name || !form.loan_amount) {
      setError("First name, last name and loan amount are required.");
      return;
    }
    setCreating(true);
    setError(null);
    try {
      const jur = getJurisdiction(form.market);
      const b = await base44.functions.invoke("apiBorrowers", {
        action: "create",
        first_name: form.first_name, last_name: form.last_name,
        email: form.email || null, phone: form.phone || null,
        employment_status: form.employment_status || "employed",
        employer_name: form.employer_name || null,
        annual_income: form.annual_income ? Number(form.annual_income) : null,
        income_currency: jur.currency,
      });
      const a = await base44.functions.invoke("apiApplications", {
        action: "create",
        borrower_id: b.data.borrower_id,
        loan_amount: Number(form.loan_amount),
        loan_currency: jur.currency,
        loan_purpose: form.loan_purpose || "general",
        loan_term_months: Number(form.loan_term_months) || 12,
        product_type: form.product_type || "personal_loan",
        policy_id: form.policy_id || jur.policies[0]?.id || "consumer-v1",
        market: form.market,
        borrower_type: form.borrower_type || "salaried",
      });
      onClose();
      navigate(`/applications/${a.data.application_id}`);
    } catch (e) {
      setError(e?.response?.data?.error?.message || e.message || "Failed to create application.");
      setCreating(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-6 overflow-y-auto">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl mt-8 mb-8 rounded-2xl border border-slate-200 bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-semibold text-slate-900">New application</h2>
            <p className="text-[12px] text-slate-500 mt-0.5">Pick a pending application to underwrite, or create a new borrower.</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors flex items-center justify-center">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 px-6 pt-4">
          <button
            onClick={() => { setTab("pending"); setError(null); }}
            className={`inline-flex items-center gap-1.5 text-[13px] font-medium px-3 py-1.5 rounded-lg transition-colors ${tab === "pending" ? "bg-[#0a0c12] text-white" : "text-slate-600 hover:bg-slate-100"}`}
          >
            <Play className="w-3.5 h-3.5" /> Pending ({pending.length})
          </button>
          <button
            onClick={() => { setTab("new"); setError(null); }}
            className={`inline-flex items-center gap-1.5 text-[13px] font-medium px-3 py-1.5 rounded-lg transition-colors ${tab === "new" ? "bg-[#0a0c12] text-white" : "text-slate-600 hover:bg-slate-100"}`}
          >
            <UserPlus className="w-3.5 h-3.5" /> New borrower
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm text-rose-700 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" /> {error}
          </div>
        )}

        {/* Pending list */}
        {tab === "pending" && (
          <div className="px-6 py-4">
            {pending.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-10 text-center">
                <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center mx-auto mb-3">
                  <Inbox className="w-5 h-5 text-slate-400" />
                </div>
                <h3 className="text-sm font-medium text-slate-900">No pending applications</h3>
                <p className="mt-1 text-[13px] text-slate-500 max-w-sm mx-auto">
                  All applications have been underwritten. Switch to "New borrower" to create one manually.
                </p>
              </div>
            ) : (
              <div className="rounded-xl border border-slate-200 divide-y divide-slate-100 max-h-[50vh] overflow-y-auto">
                {pending.map((a) => {
                  const b = borrowers[a.borrower_id];
                  return (
                    <div key={a.id} className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-slate-50 transition-colors">
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-slate-900 truncate">
                          {b ? `${b.first_name} ${b.last_name}` : "Unknown borrower"}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">{a.application_number || a.id.slice(-8)}</div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-sm font-medium text-slate-700 tabular-nums">{fmtMoney(a.loan_amount, a.loan_currency)}</div>
                        <div className="text-[11px] text-slate-400">{a.market}</div>
                      </div>
                      <button
                        onClick={() => runUnderwriting(a)}
                        disabled={runningId === a.id}
                        className="inline-flex items-center gap-1.5 text-[12px] font-medium text-white bg-[#0a0c12] px-3 py-2 rounded-md hover:bg-[#1c1f26] disabled:opacity-60 transition-colors shrink-0"
                      >
                        {runningId === a.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                        Run underwriting
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* New borrower form */}
        {tab === "new" && (
          <form onSubmit={createNew} className="px-6 py-4 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Field label="First name" required>
                <input className={inputCls} value={form.first_name || ""} onChange={(e) => set("first_name", e.target.value)} placeholder="Maria" />
              </Field>
              <Field label="Last name" required>
                <input className={inputCls} value={form.last_name || ""} onChange={(e) => set("last_name", e.target.value)} placeholder="Smith" />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Email">
                <input type="email" className={inputCls} value={form.email || ""} onChange={(e) => set("email", e.target.value)} placeholder="maria@example.com" />
              </Field>
              <Field label="Phone">
                <input className={inputCls} value={form.phone || ""} onChange={(e) => set("phone", e.target.value)} placeholder="(510) 555-0139" />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Employment status">
                <select className={inputCls} value={form.employment_status || "employed"} onChange={(e) => set("employment_status", e.target.value)}>
                  {EMPLOYMENT.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </Field>
              <Field label="Annual income">
                <input type="number" className={inputCls} value={form.annual_income || ""} onChange={(e) => set("annual_income", e.target.value)} placeholder="52000" />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Loan amount" required>
                <input type="number" className={inputCls} value={form.loan_amount || ""} onChange={(e) => set("loan_amount", e.target.value)} placeholder="12000" />
              </Field>
              <Field label="Term (months)">
                <input type="number" className={inputCls} value={form.loan_term_months || 12} onChange={(e) => set("loan_term_months", e.target.value)} placeholder="24" />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Country / market">
                <select className={inputCls} value={form.market || "GB"} onChange={(e) => set("market", e.target.value)}>
                  {MARKETS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </Field>
              <Field label="Product">
                <select className={inputCls} value={form.product_type || "personal_loan"} onChange={(e) => set("product_type", e.target.value)}>
                  {PRODUCTS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </Field>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button type="button" onClick={onClose} className="text-sm font-medium text-slate-600 px-4 py-2.5 rounded-lg hover:bg-slate-100 transition-colors">
                Cancel
              </button>
              <button type="submit" disabled={creating} className="inline-flex items-center gap-1.5 text-sm font-medium text-white bg-[#0a0c12] px-4 py-2.5 rounded-lg hover:bg-[#1c1f26] disabled:opacity-70 transition-colors">
                {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                Create & open
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}