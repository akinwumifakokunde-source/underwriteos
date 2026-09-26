import React, { useEffect, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import Hero from "@/components/home/Hero.jsx";
import HomeNav from "@/components/home/HomeNav.jsx";
import BorrowerExperience from "@/components/home/BorrowerExperience.jsx";
import LenderSimulator from "@/components/try/LenderSimulator.jsx";
import {
  Loader2, AlertTriangle, CheckCircle2, ShieldCheck, Upload, FileCheck2,
  ArrowRight, ArrowLeft, Sparkles, FileText, Wallet, Briefcase, ClipboardList, Send,
} from "lucide-react";

const STEPS = [
  { key: "contact", label: "Contact", icon: Sparkles },
  { key: "financing", label: "Financing", icon: Wallet },
  { key: "employment", label: "Employment & income", icon: Briefcase },
  { key: "details", label: "Loan details", icon: ClipboardList },
  { key: "documents", label: "Documents", icon: FileText },
  { key: "submit", label: "Submit", icon: Send },
];

const SAMPLE = {
  first_name: "Maria", last_name: "Delgado", email: "maria@example.com", phone: "(510) 555-0139",
  loan_amount: "25000", loan_purpose: "Debt consolidation", loan_term_months: "36",
  employment_status: "employed", employer_name: "Casa Verde Catering", annual_income: "68000",
  product_type: "personal_loan", market: "US", borrower_type: "salaried",
};

const DOC_REQS = [
  { type: "bank_statement", label: "Bank statement", detail: "Last 3 months of your main account" },
  { type: "payslip", label: "Latest payslip", detail: "Most recent pay slip or income proof" },
  { type: "identity", label: "Proof of identity", detail: "Passport, driver's licence or national ID" },
  { type: "proof_of_address", label: "Proof of address", detail: "Utility bill or bank letter (last 3 months)" },
];

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

function Field({ label, required, children, hint }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-900 dark:text-slate-100 mb-1.5">
        {label}{required && <span className="text-rose-500 ml-0.5">*</span>}
      </label>
      {children}
      {hint && <p className="mt-1 text-[11px] text-slate-400 leading-relaxed">{hint}</p>}
    </div>
  );
}

const inputCls = "w-full text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2.5 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-500/20 transition";

export default function BorrowerApply() {
  const { slug } = useParams();
  const deepBorrower = new URLSearchParams(window.location.search).get("mode") === "borrower";
  const [mode, setMode] = useState(deepBorrower ? "borrower" : "landing");
  const [step, setStep] = useState(0);
  const [values, setValues] = useState(deepBorrower ? SAMPLE : {});
  const [documents, setDocuments] = useState([]);
  const [uploading, setUploading] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(null);
  const [error, setError] = useState(null);
  const formRef = useRef(null);

  useEffect(() => {
    if (mode === "borrower" && formRef.current) {
      formRef.current.scrollIntoView({ block: "start" });
    }
  }, [mode]);

  const set = (k, v) => setValues((prev) => ({ ...prev, [k]: v }));

  const loadSample = () => { setValues(SAMPLE); setError(null); };

  const startLender = () => setMode("lender");
  const startBorrower = () => {
    setValues(SAMPLE);
    setDocuments([]);
    setStep(0);
    setSubmitted(null);
    setError(null);
    setMode("borrower");
  };

  const onFileChange = async (type, file) => {
    if (!file) return;
    setUploading((u) => ({ ...u, [type]: true }));
    setError(null);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setDocuments((prev) => [...prev.filter((d) => d.type !== type), { type, file_url, file_name: file.name }]);
    } catch (e) {
      setError(e?.response?.data?.error?.message || e.message || `Failed to upload ${file.name}.`);
    } finally {
      setUploading((u) => ({ ...u, [type]: false }));
    }
  };

  const canAdvance = () => {
    if (step === 0) return values.first_name && values.last_name && values.email;
    if (step === 1) return values.loan_amount && values.loan_term_months;
    if (step === 2) return values.employment_status && values.annual_income;
    if (step === 3) return values.product_type && values.market;
    return true;
  };

  const submit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      if (slug) {
        const res = await base44.functions.invoke("apiForms", { action: "public_submit", slug, values: { ...values, documents } });
        setSubmitted(res.data || { application_number: "—", thank_you_message: "Your application has been received." });
      } else {
        // Demo mode (no published form) — simulate a reference
        await new Promise((r) => setTimeout(r, 700));
        setSubmitted({ application_number: `DEMO-${Math.random().toString(36).slice(2, 8).toUpperCase()}`, thank_you_message: "Thanks — your demo application is ready. A lender will review your file and be in touch." });
      }
    } catch (e) {
      setError(e?.response?.data?.error?.message || e.message || "Submission failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (mode === "landing") {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
        <HomeNav />
        <Hero onStart={startLender} />
        <BorrowerExperience onStart={startBorrower} />
      </div>
    );
  }

  if (mode === "lender") {
    return <LenderSimulator onBack={() => setMode("landing")} />;
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center px-5">
        <div className="max-w-md w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 text-center shadow-sm">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center mx-auto mb-4 shadow-md">
            <CheckCircle2 className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-50">Application received</h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{submitted.thank_you_message}</p>
          {submitted.application_number && (
            <p className="mt-4 text-xs text-slate-400">Reference: <span className="font-mono text-slate-600 dark:text-slate-300">{submitted.application_number}</span></p>
          )}
          <div className="mt-6 flex flex-col gap-2">
            <button onClick={() => { setSubmitted(null); setMode("landing"); }} className="text-sm font-medium text-teal-700 dark:text-teal-400 hover:underline">Try another flow</button>
            <Link to="/" className="text-sm font-medium text-slate-400 hover:underline">Back to home</Link>
            {!slug && <p className="text-[11px] text-slate-400">Demo mode — no data was saved. Publish a form to collect real applications.</p>}
          </div>
        </div>
      </div>
    );
  }

  const current = STEPS[step];
  const StepIcon = current.icon;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Top bar */}
      <div className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur">
        <div className="max-w-5xl mx-auto px-5 sm:px-8 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-50">
            <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center text-white text-xs font-bold">C</span>
            CreditDecide
          </Link>
          <button onClick={() => setMode("landing")} className="inline-flex items-center gap-1.5 text-[12px] font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-50 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to overview
          </button>
        </div>
      </div>

      <Hero />
      <BorrowerExperience />

      <div ref={formRef} className="max-w-5xl mx-auto px-5 sm:px-8 py-8 sm:py-12">
        <div className="grid md:grid-cols-[220px_1fr] gap-8">
          {/* Stepper */}
          <aside className="md:sticky md:top-8 self-start">
            <p className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Application</p>
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-50 mt-0.5">Your financing request</p>
            <p className="text-[11px] text-slate-400 mt-0.5 mb-4">Step {step + 1} of {STEPS.length}</p>
            <ol className="space-y-1">
              {STEPS.map((s, i) => {
                const Icon = s.icon;
                const active = i === step;
                const done = i < step;
                return (
                  <li key={s.key}>
                    <button
                      onClick={() => i <= step && setStep(i)}
                      disabled={i > step}
                      className={`w-full flex items-center gap-2.5 text-left px-2 py-2 rounded-lg transition-colors ${active ? "bg-teal-50 dark:bg-teal-500/10" : "hover:bg-slate-100 dark:hover:bg-slate-800"} ${i > step ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-semibold shrink-0 ${active ? "bg-gradient-to-br from-teal-400 to-emerald-500 text-white" : done ? "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400" : "bg-slate-100 dark:bg-slate-800 text-slate-400"}`}>
                        {done ? <CheckCircle2 className="w-3.5 h-3.5" /> : i + 1}
                      </span>
                      <span className={`text-[13px] font-medium ${active ? "text-slate-900 dark:text-slate-50" : "text-slate-500 dark:text-slate-400"}`}>{s.label}</span>
                    </button>
                  </li>
                );
              })}
            </ol>
          </aside>

          {/* Form card */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm">
            <div className="flex items-center gap-2.5 mb-1">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center shadow-sm">
                <StepIcon className="w-4 h-4 text-white" />
              </div>
              <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-50">{stepHeadlines[step].title}</h1>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">{stepHeadlines[step].sub}</p>

            {step === 0 && (
              <div className="rounded-lg border border-teal-200 dark:border-teal-500/30 bg-teal-50/50 dark:bg-teal-500/5 px-4 py-3 mb-5 flex items-center justify-between gap-3">
                <span className="text-[13px] text-slate-600 dark:text-slate-300">Start blank, or load this demo's sample application.</span>
                <button onClick={loadSample} className="shrink-0 text-sm font-medium text-white bg-gradient-to-br from-teal-500 to-emerald-600 px-3.5 py-2 rounded-lg hover:shadow-md transition-all">Use sample application</button>
              </div>
            )}

            {error && (
              <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm text-rose-700 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" /> {error}
              </div>
            )}

            <div className="space-y-4">
              {step === 0 && (
                <>
                  <Field label="Full name" required>
                    <div className="grid grid-cols-2 gap-3">
                      <input className={inputCls} placeholder="First name" value={values.first_name || ""} onChange={(e) => set("first_name", e.target.value)} />
                      <input className={inputCls} placeholder="Last name" value={values.last_name || ""} onChange={(e) => set("last_name", e.target.value)} />
                    </div>
                  </Field>
                  <Field label="Email address" required>
                    <input type="email" className={inputCls} placeholder="maria@example.com" value={values.email || ""} onChange={(e) => set("email", e.target.value)} />
                  </Field>
                  <Field label="Phone number">
                    <input className={inputCls} placeholder="(510) 555-0139" value={values.phone || ""} onChange={(e) => set("phone", e.target.value)} />
                  </Field>
                </>
              )}

              {step === 1 && (
                <>
                  <Field label="How much do you want to borrow?" required>
                    <input type="number" className={inputCls} placeholder="25,000" value={values.loan_amount || ""} onChange={(e) => set("loan_amount", e.target.value)} />
                  </Field>
                  <Field label="What's the loan for?">
                    <input className={inputCls} placeholder="Debt consolidation" value={values.loan_purpose || ""} onChange={(e) => set("loan_purpose", e.target.value)} />
                  </Field>
                  <Field label="Preferred term (months)" required>
                    <input type="number" className={inputCls} placeholder="36" value={values.loan_term_months || ""} onChange={(e) => set("loan_term_months", e.target.value)} />
                  </Field>
                </>
              )}

              {step === 2 && (
                <>
                  <Field label="Employment status" required>
                    <select className={inputCls} value={values.employment_status || ""} onChange={(e) => set("employment_status", e.target.value)}>
                      <option value="">Select…</option>
                      {EMPLOYMENT.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </Field>
                  <Field label="Employer name">
                    <input className={inputCls} placeholder="Employer" value={values.employer_name || ""} onChange={(e) => set("employer_name", e.target.value)} />
                  </Field>
                  <Field label="Annual income" required hint="Gross annual income in your local currency">
                    <input type="number" className={inputCls} placeholder="68,000" value={values.annual_income || ""} onChange={(e) => set("annual_income", e.target.value)} />
                  </Field>
                </>
              )}

              {step === 3 && (
                <>
                  <Field label="Loan product" required>
                    <select className={inputCls} value={values.product_type || ""} onChange={(e) => set("product_type", e.target.value)}>
                      <option value="">Select…</option>
                      {PRODUCTS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </Field>
                  <Field label="Country / market" required>
                    <select className={inputCls} value={values.market || ""} onChange={(e) => set("market", e.target.value)}>
                      <option value="">Select…</option>
                      {MARKETS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </Field>
                  <Field label="Borrower type">
                    <select className={inputCls} value={values.borrower_type || "salaried"} onChange={(e) => set("borrower_type", e.target.value)}>
                      <option value="salaried">Salaried</option>
                      <option value="self_employed">Self-employed</option>
                      <option value="business">Business</option>
                    </select>
                  </Field>
                </>
              )}

              {step === 4 && (
                <div className="space-y-3">
                  {DOC_REQS.map((d) => {
                    const uploaded = documents.find((x) => x.type === d.type);
                    const isUploading = uploading[d.type];
                    return (
                      <div key={d.type} className="rounded-lg border border-slate-200 dark:border-slate-800 px-4 py-3">
                        <div className="text-sm font-medium text-slate-900 dark:text-slate-50">{d.label}</div>
                        <p className="text-[11px] text-slate-400 mb-2">{d.detail}</p>
                        <label className={`flex items-center gap-2 rounded-md border border-dashed px-3 py-2.5 cursor-pointer transition-colors ${uploaded ? "border-emerald-300 dark:border-emerald-500/40 bg-emerald-50/50 dark:bg-emerald-500/5" : "border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700"}`}>
                          {isUploading ? <Loader2 className="w-4 h-4 text-slate-400 animate-spin" /> : uploaded ? <FileCheck2 className="w-4 h-4 text-emerald-600" /> : <Upload className="w-4 h-4 text-slate-400" />}
                          <span className="text-xs text-slate-600 dark:text-slate-300 truncate">{isUploading ? "Uploading…" : uploaded ? uploaded.file_name : "Choose a file to upload"}</span>
                          <input type="file" onChange={(e) => onFileChange(d.type, e.target.files?.[0])} className="hidden" accept=".pdf,.png,.jpg,.jpeg,.csv,.json" />
                        </label>
                      </div>
                    );
                  })}
                </div>
              )}

              {step === 5 && (
                <div className="space-y-3">
                  <p className="text-sm text-slate-600 dark:text-slate-300">Review your details before submitting. You can go back to any step.</p>
                  <div className="rounded-lg border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800">
                    {[
                      ["Name", `${values.first_name || ""} ${values.last_name || ""}`.trim() || "—"],
                      ["Email", values.email || "—"],
                      ["Loan amount", values.loan_amount ? `${Number(values.loan_amount).toLocaleString()}` : "—"],
                      ["Term", values.loan_term_months ? `${values.loan_term_months} months` : "—"],
                      ["Purpose", values.loan_purpose || "—"],
                      ["Employment", EMPLOYMENT.find((e) => e.value === values.employment_status)?.label || "—"],
                      ["Annual income", values.annual_income ? Number(values.annual_income).toLocaleString() : "—"],
                      ["Product", PRODUCTS.find((p) => p.value === values.product_type)?.label || "—"],
                      ["Country", MARKETS.find((m) => m.value === values.market)?.label || "—"],
                      ["Documents", `${documents.length} uploaded`],
                    ].map(([k, v]) => (
                      <div key={k} className="flex items-center justify-between px-4 py-2.5 text-[13px]">
                        <span className="text-slate-500 dark:text-slate-400">{k}</span>
                        <span className="font-medium text-slate-900 dark:text-slate-50 text-right">{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Nav buttons */}
            <div className="mt-6 flex items-center justify-between gap-3">
              {step > 0 ? (
                <button onClick={() => setStep((s) => s - 1)} className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 dark:text-slate-300 px-3 py-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
              ) : <span />}
              {step < STEPS.length - 1 ? (
                <button onClick={() => canAdvance() && setStep((s) => s + 1)} disabled={!canAdvance()} className="inline-flex items-center gap-1.5 text-sm font-medium text-white bg-gradient-to-br from-teal-500 to-emerald-600 px-5 py-2.5 rounded-lg hover:shadow-md disabled:opacity-50 transition-all">
                  Next <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button onClick={submit} disabled={submitting} className="inline-flex items-center gap-1.5 text-sm font-medium text-white bg-gradient-to-br from-teal-500 to-emerald-600 px-5 py-2.5 rounded-lg hover:shadow-md disabled:opacity-70 transition-all">
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} Submit application
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-center gap-1.5 text-xs text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Secured by CreditDecide · {slug ? "Your data is sent to the lender" : "Demo mode"}</span>
        </div>
      </div>
    </div>
  );
}

const stepHeadlines = [
  { title: "Let's start with you", sub: "We'll use this to keep you updated about your application." },
  { title: "Your financing request", sub: "Tell us how much you need and what it's for." },
  { title: "Employment & income", sub: "We use this to assess affordability." },
  { title: "Loan details", sub: "Pick your product and where you're applying from." },
  { title: "Documents", sub: "Upload what we need to verify your application." },
  { title: "Review & submit", sub: "Make sure everything looks right before you send." },
];