import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import Nav from "@/components/layout/Nav.jsx";
import { Loader2, AlertTriangle, ArrowLeft, Save, Copy, Check, ExternalLink } from "lucide-react";
import { JURISDICTIONS, getJurisdiction, getPolicies, getProducts, getKycConfig } from "@/lib/jurisdictions";
import { FIELD_SECTIONS, DEFAULT_FIELDS } from "@/lib/formFields";

export default function FormEditor() {
  const { formId } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(formId);

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  const [form, setForm] = useState({
    name: "",
    title: "",
    intro: "Complete the form below to start your application. Our team will review your details and be in touch.",
    accent_color: "#0d9488",
    logo_url: "",
    market: "GB",
    borrower_type: "salaried",
    product_type: "personal_loan",
    policy_id: "consumer-v1",
    thank_you_message: "Thank you. Your application has been received. We'll be in touch shortly.",
    fields: DEFAULT_FIELDS,
  });

  useEffect(() => {
    if (!isEdit) return;
    (async () => {
      try {
        const res = await base44.functions.invoke("apiForms", { action: "get", form_id: formId });
        const f = res.data?.form;
        if (f) {
          setForm({
            name: f.name || "",
            title: f.title || "",
            intro: f.intro || "",
            accent_color: f.accent_color || "#0d9488",
            logo_url: f.logo_url || "",
            market: f.market || "GB",
            borrower_type: f.borrower_type || "salaried",
            product_type: f.product_type || "personal_loan",
            policy_id: f.policy_id || "consumer-v1",
            thank_you_message: f.thank_you_message || "",
            fields: Array.isArray(f.fields) && f.fields.length ? f.fields : DEFAULT_FIELDS,
            slug: f.slug,
            status: f.status,
          });
        }
      } catch (e) {
        setError(e?.response?.data?.error?.message || e.message || "Failed to load form.");
      } finally {
        setLoading(false);
      }
    })();
  }, [formId, isEdit]);

  const set = (k, v) => setForm((prev) => ({ ...prev, [k]: v }));

  const onMarketChange = (market) => {
    const jur = getJurisdiction(market);
    const policies = getPolicies(market);
    setForm((prev) => ({
      ...prev,
      market,
      policy_id: policies[0]?.id || "consumer-v1",
      product_type: getProducts(market)[0]?.value || "personal_loan",
    }));
  };

  const toggleField = (key, prop) => {
    setForm((prev) => ({
      ...prev,
      fields: prev.fields.map((f) => (f.key === key ? { ...f, [prop]: !f[prop] } : f)),
    }));
  };

  const save = async () => {
    if (!form.name.trim()) { setError("Form name is required."); return; }
    setSaving(true);
    setError(null);
    try {
      const payload = {
        name: form.name.trim(),
        title: form.title.trim() || form.name.trim(),
        intro: form.intro,
        accent_color: form.accent_color,
        logo_url: form.logo_url || null,
        market: form.market,
        borrower_type: form.borrower_type,
        product_type: form.product_type,
        policy_id: form.policy_id,
        thank_you_message: form.thank_you_message,
        fields: form.fields,
      };
      if (isEdit) {
        await base44.functions.invoke("apiForms", { action: "update", form_id: formId, ...payload });
      } else {
        const res = await base44.functions.invoke("apiForms", { action: "create", ...payload });
        navigate(`/forms/${res.data?.form_id}/edit`, { replace: true });
      }
      navigate("/forms");
    } catch (e) {
      setError(e?.response?.data?.error?.message || e.message || "Failed to save form.");
    } finally {
      setSaving(false);
    }
  };

  const copyLink = () => {
    if (!form.slug) return;
    navigator.clipboard?.writeText(`${window.location.origin}/apply/${form.slug}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f8fa]">
        <Nav />
        <div className="max-w-3xl mx-auto px-5 sm:px-8 py-10 flex items-center justify-center gap-3">
          <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />
          <span className="text-sm text-slate-500">Loading form…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f8fa] text-slate-900">
      <Nav />
      <div className="max-w-3xl mx-auto px-5 sm:px-8 py-8">
        <Link to="/forms" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 mb-4">
          <ArrowLeft className="w-4 h-4" /> Forms
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight mb-6">{isEdit ? "Edit form" : "New form"}</h1>

        {error && (
          <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm text-rose-700 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" /> {error}
          </div>
        )}

        {isEdit && form.slug && (
          <div className="mb-5 rounded-xl border border-slate-200 bg-white p-4">
            <div className="text-xs font-medium uppercase tracking-wider text-slate-500 mb-2">Share link</div>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-xs font-mono text-slate-700 bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 truncate">
                {window.location.origin}/apply/{form.slug}
              </code>
              <button onClick={copyLink} className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-md border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors">
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "Copied" : "Copy"}
              </button>
              <a href={`${window.location.origin}/apply/${form.slug}`} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center w-8 h-8 rounded-md border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors">
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        )}

        <div className="space-y-5">
          <Section title="Details">
            <Field label="Form name (internal)">
              <input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Personal loan intake" className="ui-input" />
            </Field>
            <Field label="Public title">
              <input value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="Apply for a loan" className="ui-input" />
            </Field>
            <Field label="Intro text">
              <textarea value={form.intro} onChange={(e) => set("intro", e.target.value)} rows={2} className="ui-input resize-none" />
            </Field>
          </Section>

          <Section title="Branding">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Accent color">
                <div className="flex items-center gap-2">
                  <input type="color" value={form.accent_color} onChange={(e) => set("accent_color", e.target.value)} className="w-9 h-9 rounded border border-slate-200 cursor-pointer p-0.5" />
                  <input value={form.accent_color} onChange={(e) => set("accent_color", e.target.value)} className="ui-input font-mono text-xs" />
                </div>
              </Field>
              <Field label="Logo URL (optional)">
                <input value={form.logo_url} onChange={(e) => set("logo_url", e.target.value)} placeholder="https://…/logo.png" className="ui-input" />
              </Field>
            </div>
          </Section>

          <Section title="Application defaults">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Market">
                <select value={form.market} onChange={(e) => onMarketChange(e.target.value)} className="ui-input">
                  {Object.values(JURISDICTIONS).map((j) => <option key={j.code} value={j.code}>{j.name}</option>)}
                </select>
              </Field>
              <Field label="Borrower type">
                <select value={form.borrower_type} onChange={(e) => set("borrower_type", e.target.value)} className="ui-input">
                  <option value="salaried">Salaried</option>
                  <option value="self_employed">Self-employed</option>
                  <option value="business">Business</option>
                </select>
              </Field>
              <Field label="Product type">
                <select value={form.product_type} onChange={(e) => set("product_type", e.target.value)} className="ui-input">
                  {getProducts(form.market).map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
                </select>
              </Field>
              <Field label="Policy">
                <select value={form.policy_id} onChange={(e) => set("policy_id", e.target.value)} className="ui-input">
                  {getPolicies(form.market).map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
                </select>
              </Field>
            </div>
          </Section>

          <Section title="KYC / Identity verification">
            <p className="text-xs text-slate-500">National identifiers required to verify identity and pull credit reports in this market. All fields below are always collected from the borrower.</p>
            <div className="space-y-2">
              {getKycConfig(form.market).map((f) => (
                <div key={f.key} className="rounded-lg border border-slate-200 px-3 py-2.5 flex items-center justify-between">
                  <div>
                    <div className="text-sm text-slate-700">{f.label}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">{f.hint}</div>
                  </div>
                  <span className="text-[10px] font-medium uppercase tracking-wider text-white bg-slate-700 rounded px-2 py-0.5">Required</span>
                </div>
              ))}
            </div>
          </Section>

          <Section title="Fields to collect">
            <p className="text-xs text-slate-500 mb-3">Toggle which fields the borrower must fill. Enabled fields appear on the public form; required ones must be completed to submit.</p>
            <div className="space-y-3">
              {FIELD_SECTIONS.map((sec) => (
                <div key={sec.name} className="rounded-lg border border-slate-200 overflow-hidden">
                  <div className="bg-slate-50 px-3 py-1.5 text-[11px] font-medium uppercase tracking-wider text-slate-500">{sec.name}</div>
                  <div className="divide-y divide-slate-100">
                    {sec.fields.map((key) => {
                      const f = form.fields.find((x) => x.key === key);
                      if (!f) return null;
                      return (
                        <div key={key} className="flex items-center justify-between px-3 py-2">
                          <span className="text-sm text-slate-700">{f.label}</span>
                          <div className="flex items-center gap-4">
                            <label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer">
                              <input type="checkbox" checked={!!f.enabled} onChange={() => toggleField(key, "enabled")} className="w-3.5 h-3.5 rounded border-slate-300 text-teal-600 focus:ring-teal-500" />
                              Collect
                            </label>
                            <label className={`flex items-center gap-1.5 text-xs cursor-pointer ${f.enabled ? "text-slate-600" : "text-slate-300"}`}>
                              <input type="checkbox" checked={!!f.required} onChange={() => toggleField(key, "required")} disabled={!f.enabled} className="w-3.5 h-3.5 rounded border-slate-300 text-teal-600 focus:ring-teal-500" />
                              Required
                            </label>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </Section>

          <Section title="Thank-you message">
            <Field label="Shown after submission">
              <textarea value={form.thank_you_message} onChange={(e) => set("thank_you_message", e.target.value)} rows={2} className="ui-input resize-none" />
            </Field>
          </Section>

          <div className="flex items-center gap-2 pt-1">
            <button onClick={save} disabled={saving} className="inline-flex items-center gap-1.5 text-sm font-medium px-4 py-2.5 rounded-lg bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-60 transition-colors">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? "Saving…" : isEdit ? "Save changes" : "Create form"}
            </button>
            <Link to="/forms" className="text-sm text-slate-600 hover:text-slate-900 px-3 py-2.5">Cancel</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <h3 className="text-sm font-semibold text-slate-900 mb-3">{title}</h3>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-600 mb-1">{label}</label>
      {children}
    </div>
  );
}