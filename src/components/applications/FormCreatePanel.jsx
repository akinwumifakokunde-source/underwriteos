import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { JURISDICTIONS, getPolicies, getProducts, getDocumentRequirements } from "@/lib/jurisdictions";
import { DEFAULT_FIELDS } from "@/lib/formFields";
import { Loader2, AlertTriangle, FileText, Copy, Check, ExternalLink, Pencil, ArrowRight } from "lucide-react";

const inputCls = "w-full text-sm rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-900/10 transition";

function Field({ label, children, hint }) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-600 mb-1">{label}</label>
      {children}
      {hint && <p className="mt-1 text-[11px] text-slate-400 leading-relaxed">{hint}</p>}
    </div>
  );
}

// Quick white-label form creation. Submissions to the generated share link
// create Borrower + Application records in data_collection (pending) status,
// which surface on the Applications page ready for underwriting.
export default function FormCreatePanel({ onClose }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    title: "",
    market: "GB",
    borrower_type: "salaried",
    product_type: "personal_loan",
    policy_id: getPolicies("GB")[0]?.id || "consumer-v1",
  });
  const [creating, setCreating] = useState(false);
  const [created, setCreated] = useState(null); // { form_id, slug }
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const onMarketChange = (market) => {
    const policies = getPolicies(market);
    const policy_id = policies[0]?.id || "consumer-v1";
    setForm((p) => ({
      ...p,
      market,
      policy_id,
      product_type: getProducts(market)[0]?.value || "personal_loan",
    }));
  };

  const create = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { setError("Form name is required."); return; }
    setCreating(true);
    setError(null);
    try {
      const docReqs = getDocumentRequirements(form.market, form.policy_id, form.borrower_type).map((d) => ({
        type: d.type, label: d.label, detail: d.detail, required: !!d.required, enabled: true,
      }));
      const res = await base44.functions.invoke("apiForms", {
        action: "create",
        name: form.name.trim(),
        title: form.title.trim() || form.name.trim(),
        intro: "Complete the form below to start your application. Our team will review your details and be in touch.",
        accent_color: "#0d9488",
        market: form.market,
        borrower_type: form.borrower_type,
        product_type: form.product_type,
        policy_id: form.policy_id,
        fields: DEFAULT_FIELDS,
        document_requirements: docReqs,
        thank_you_message: "Thank you. Your application has been received. We'll be in touch shortly.",
      });
      setCreated({ form_id: res.data?.form_id, slug: res.data?.form?.slug });
    } catch (e) {
      setError(e?.response?.data?.error?.message || e.message || "Failed to create form.");
    } finally {
      setCreating(false);
    }
  };

  const copyLink = () => {
    if (!created?.slug) return;
    navigator.clipboard?.writeText(`${window.location.origin}/apply/${created.slug}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (created) {
    return (
      <div className="px-6 py-5">
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-center">
          <div className="w-11 h-11 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-3">
            <Check className="w-5 h-5 text-emerald-600" />
          </div>
          <h3 className="text-sm font-semibold text-slate-900">Form created</h3>
          <p className="mt-1 text-[13px] text-slate-600 max-w-sm mx-auto">
            Share this link with borrowers. Each submission creates a pending application that appears here ready for underwriting.
          </p>
        </div>
        <div className="mt-4 rounded-lg border border-slate-200 bg-white p-3">
          <div className="text-[10px] font-medium uppercase tracking-wider text-slate-400 mb-1.5">Share link</div>
          <div className="flex items-center gap-2">
            <code className="flex-1 text-xs font-mono text-slate-700 bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 truncate">
              {window.location.origin}/apply/{created.slug}
            </code>
            <button onClick={copyLink} className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-md border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors">
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Copied" : "Copy"}
            </button>
            <a href={`${window.location.origin}/apply/${created.slug}`} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center w-8 h-8 rounded-md border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors">
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between gap-2">
          <button onClick={() => navigate(`/forms/${created.form_id}/edit`)} className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-700 px-3 py-2.5 rounded-lg hover:bg-slate-100 transition-colors">
            <Pencil className="w-4 h-4" /> Customize fields
          </button>
          <button onClick={onClose} className="inline-flex items-center gap-1.5 text-sm font-medium text-white bg-[#0a0c12] px-4 py-2.5 rounded-lg hover:bg-[#1c1f26] transition-colors">
            Done <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={create} className="px-6 py-4 space-y-4">
      <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 flex items-start gap-2">
        <FileText className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
        <p className="text-[12px] text-slate-600 leading-relaxed">
          Create a white-label intake form. Borrowers submit via the share link and each submission becomes a <span className="font-medium text-slate-800">pending application</span> on this page.
        </p>
      </div>
      <Field label="Form name" required>
        <input className={inputCls} value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Personal loan intake" autoFocus />
      </Field>
      <Field label="Public title" hint="Shown to borrowers at the top of the form">
        <input className={inputCls} value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="Apply for a loan" />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Market">
          <select className={inputCls} value={form.market} onChange={(e) => onMarketChange(e.target.value)}>
            {Object.values(JURISDICTIONS).map((j) => <option key={j.code} value={j.code}>{j.name}</option>)}
          </select>
        </Field>
        <Field label="Borrower type">
          <select className={inputCls} value={form.borrower_type} onChange={(e) => set("borrower_type", e.target.value)}>
            <option value="salaried">Salaried</option>
            <option value="self_employed">Self-employed</option>
            <option value="business">Business</option>
          </select>
        </Field>
        <Field label="Product">
          <select className={inputCls} value={form.product_type} onChange={(e) => set("product_type", e.target.value)}>
            {getProducts(form.market).map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
          </select>
        </Field>
        <Field label="Policy">
          <select className={inputCls} value={form.policy_id} onChange={(e) => set("policy_id", e.target.value)}>
            {getPolicies(form.market).map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
          </select>
        </Field>
      </div>
      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm text-rose-700 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" /> {error}
        </div>
      )}
      <div className="flex items-center justify-end gap-2 pt-1">
        <button type="button" onClick={onClose} className="text-sm font-medium text-slate-600 px-4 py-2.5 rounded-lg hover:bg-slate-100 transition-colors">Cancel</button>
        <button type="submit" disabled={creating} className="inline-flex items-center gap-1.5 text-sm font-medium text-white bg-[#0a0c12] px-4 py-2.5 rounded-lg hover:bg-[#1c1f26] disabled:opacity-70 transition-colors">
          {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
          Create form
        </button>
      </div>
    </form>
  );
}