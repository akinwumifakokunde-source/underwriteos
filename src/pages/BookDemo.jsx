import React, { useState } from "react";
import HomeNav from "@/components/home/HomeNav.jsx";
import SiteFooter from "@/components/home/SiteFooter.jsx";
import { base44 } from "@/api/base44Client";
import { Loader2, CheckCircle2, AlertTriangle } from "lucide-react";

const FOREST = "#0B3D21";
const VOLUMES = ["< $1M / month", "$1M – $5M / month", "$5M – $25M / month", "$25M+ / month"];

const inputCls = "w-full text-sm rounded-lg border border-[#d1d1d1] bg-white px-3.5 py-2.5 text-[#111] placeholder-[#a0a0a0] focus:outline-none focus:border-[#0B3D21] focus:ring-2 focus:ring-[#0B3D21]/15 transition";

export default function BookDemo() {
  const [form, setForm] = useState({ name: "", email: "", company: "", volume: "", use_case: "", referrer: "" });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState(null);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const message = [
        `Company: ${form.company}`,
        `Estimated loan volume: ${form.volume}`,
        `Use case: ${form.use_case}`,
        form.referrer ? `How they heard about us: ${form.referrer}` : "",
      ].filter(Boolean).join("\n");
      await base44.functions.invoke("apiContact", { name: form.name, email: form.email, message });
      setDone(true);
    } catch (err) {
      setError(err?.response?.data?.error?.message || err.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-[#111] dark:text-slate-50">
      <HomeNav />

      {/* Soft gradient light */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute bottom-[-10rem] left-[-8rem] w-[40rem] h-[40rem] rounded-full bg-[#0B3D21]/5 blur-[120px]" />
      </div>

      <div className="relative max-w-5xl mx-auto px-5 sm:px-8 py-16 sm:py-24">
        {done ? (
          <div className="max-w-md mx-auto text-center">
            <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: "#E8F5E9" }}>
              <CheckCircle2 className="w-7 h-7" style={{ color: FOREST }} />
            </div>
            <h1 className="text-2xl font-semibold text-black dark:text-slate-50">Thanks — we'll be in touch.</h1>
            <p className="mt-2 text-sm text-[#666] dark:text-slate-400 leading-relaxed">
              Tell us what you're trying to ship and we'll come back with pricing, sample outputs on a document you send,
              and a working session if it makes sense.
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-12 lg:gap-20">
            {/* Left column */}
            <div>
              <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-black dark:text-slate-50">Talk to our team.</h1>
              <p className="mt-4 text-[15px] text-[#666] dark:text-slate-400 leading-relaxed">
                Tell us what you're trying to ship and we'll come back with a structured response — pricing, sample outputs
                on a document you send, and a working session if it makes sense.
              </p>

              <hr className="my-8 border-[#eceef1] dark:border-slate-800" />
            </div>

            {/* Right column — form */}
            <div className="rounded-2xl border border-[#eceef1] dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm">
              <form onSubmit={submit} className="space-y-4">
                {error && (
                  <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm text-rose-700 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" /> {error}
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-[#111] dark:text-slate-100 mb-1.5">Name <span className="text-rose-500">*</span></label>
                  <input className={inputCls} required value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Jane Doe" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#111] dark:text-slate-100 mb-1.5">Work email <span className="text-rose-500">*</span></label>
                  <input type="email" className={inputCls} required value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="jane@lender.com" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#111] dark:text-slate-100 mb-1.5">Company <span className="text-rose-500">*</span></label>
                  <input className={inputCls} required value={form.company} onChange={(e) => set("company", e.target.value)} placeholder="Acme Lending" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#111] dark:text-slate-100 mb-1.5">Estimated loan volume (USD) <span className="text-rose-500">*</span></label>
                  <select className={inputCls} required value={form.volume} onChange={(e) => set("volume", e.target.value)}>
                    <option value="">Select…</option>
                    {VOLUMES.map((v) => <option key={v} value={v}>{v}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#111] dark:text-slate-100 mb-1.5">Tell us about your use case and document types <span className="text-rose-500">*</span></label>
                  <textarea rows={4} className={inputCls} required value={form.use_case} onChange={(e) => set("use_case", e.target.value)} placeholder="We originate personal loans in the UK and want to automate income verification…" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#111] dark:text-slate-100 mb-1.5">How did you hear about us?</label>
                  <input className={inputCls} value={form.referrer} onChange={(e) => set("referrer", e.target.value)} placeholder="LinkedIn, a colleague, etc." />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full inline-flex items-center justify-center gap-2.5 text-sm font-medium text-white bg-black dark:bg-white dark:text-slate-900 px-5 py-3 rounded-full hover:bg-[#1a1a1a] dark:hover:bg-slate-100 disabled:opacity-70 transition-all mt-2"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <span className="w-2 h-2 rounded-full bg-[#2E7D32]" />}
                  Submit
                </button>
              </form>
            </div>
          </div>
        )}
      </div>

      <SiteFooter />
    </div>
  );
}