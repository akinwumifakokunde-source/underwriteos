import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Loader2, AlertTriangle, CheckCircle2, ShieldCheck } from "lucide-react";
import { FIELD_SECTIONS, FIELD_META } from "@/lib/formFields";

export default function Apply() {
  const { slug } = useParams();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [values, setValues] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await base44.functions.invoke("apiForms", { action: "public_get", slug });
        setForm(res.data?.form);
      } catch (e) {
        setError(e?.response?.data?.error?.message || e.message || "This form is not available.");
      } finally {
        setLoading(false);
      }
    })();
  }, [slug]);

  const set = (k, v) => setValues((prev) => ({ ...prev, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await base44.functions.invoke("apiForms", { action: "public_submit", slug, values });
      setSubmitted(res.data);
    } catch (e) {
      setError(e?.response?.data?.error?.message || e.message || "Submission failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
      </div>
    );
  }

  if (error && !form) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-5">
        <div className="max-w-md w-full rounded-xl border border-slate-200 bg-white p-8 text-center">
          <div className="w-11 h-11 rounded-lg bg-rose-50 flex items-center justify-center mx-auto mb-3">
            <AlertTriangle className="w-5 h-5 text-rose-600" />
          </div>
          <h1 className="text-lg font-semibold text-slate-900">Form unavailable</h1>
          <p className="mt-1.5 text-sm text-slate-500">{error}</p>
        </div>
      </div>
    );
  }

  const accent = form.accent_color || "#0d9488";
  const enabledFields = form.fields || [];

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-5" style={{ borderTop: `3px solid ${accent}` }}>
        <div className="max-w-md w-full rounded-xl border border-slate-200 bg-white p-8 text-center">
          <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: `${accent}1a` }}>
            <CheckCircle2 className="w-6 h-6" style={{ color: accent }} />
          </div>
          <h1 className="text-xl font-semibold text-slate-900">Application received</h1>
          <p className="mt-2 text-sm text-slate-600 leading-relaxed">{submitted.thank_you_message || form.thank_you_message}</p>
          {submitted.application_number && (
            <p className="mt-4 text-xs text-slate-400">Reference: <span className="font-mono text-slate-600">{submitted.application_number}</span></p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50" style={{ borderTop: `3px solid ${accent}` }}>
      <div className="max-w-xl mx-auto px-5 py-10 sm:py-14">
        {/* Header */}
        <div className="mb-7">
          {form.logo_url && (
            <img src={form.logo_url} alt="" className="h-9 w-auto mb-4 object-contain" />
          )}
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{form.title}</h1>
          {form.intro && <p className="mt-2 text-sm text-slate-600 leading-relaxed">{form.intro}</p>}
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm text-rose-700 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" /> {error}
          </div>
        )}

        <form onSubmit={submit} className="space-y-6">
          {FIELD_SECTIONS.map((sec) => {
            const sectionFields = sec.fields
              .map((key) => enabledFields.find((f) => f.key === key))
              .filter(Boolean);
            if (sectionFields.length === 0) return null;
            return (
              <div key={sec.name}>
                <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">{sec.name}</h2>
                <div className="rounded-xl border border-slate-200 bg-white divide-y divide-slate-100">
                  {sectionFields.map((f) => {
                    const meta = FIELD_META[f.key] || { type: "text" };
                    return (
                      <div key={f.key} className="px-4 py-3">
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          {meta.label}
                          {f.required && <span className="text-rose-500 ml-0.5">*</span>}
                        </label>
                        {meta.type === "select" ? (
                          <select
                            value={values[f.key] || ""}
                            onChange={(e) => set(f.key, e.target.value)}
                            required={f.required}
                            className="w-full text-sm rounded-md border border-slate-200 px-3 py-2 text-slate-900 focus:outline-none focus:border-slate-400"
                          >
                            <option value="">Select…</option>
                            {meta.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                          </select>
                        ) : (
                          <input
                            type={meta.type}
                            value={values[f.key] || ""}
                            onChange={(e) => set(f.key, e.target.value)}
                            required={f.required}
                            placeholder={meta.placeholder}
                            className="w-full text-sm rounded-md border border-slate-200 px-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-400"
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          <button
            type="submit"
            disabled={submitting}
            className="w-full text-sm font-medium px-4 py-3 rounded-lg text-white disabled:opacity-70 transition-opacity"
            style={{ backgroundColor: accent }}
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Submit application"}
          </button>
        </form>

        <div className="mt-6 flex items-center justify-center gap-1.5 text-xs text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Secured by UnderwriteOS</span>
        </div>
      </div>
    </div>
  );
}