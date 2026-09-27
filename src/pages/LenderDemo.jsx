import React, { useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import HomeNav from "@/components/home/HomeNav.jsx";
import SiteFooter from "@/components/home/SiteFooter.jsx";
import {
  ArrowRight, Loader2, CheckCircle2, ShieldCheck, Sparkles, FileText,
  TrendingUp, AlertTriangle, XCircle, Lock, ChevronRight,
} from "lucide-react";

const PROFILES = [
  { key: "amara-uk", name: "Amara Okafor", market: "United Kingdom", flag: "🇬🇧", product: "Personal loan", amount: "£12,000", hint: "Strong credit, stable income" },
  { key: "marcus-us", name: "Marcus Bell", market: "United States", flag: "🇺🇸", product: "Auto loan", amount: "$18,000", hint: "Fair credit, high utilisation" },
  { key: "tunde-ng", name: "Tunde Bello", market: "Nigeria", flag: "🇳🇬", product: "Personal loan", amount: "₦500,000", hint: "Poor credit, defaults on file" },
  { key: "sarah-za", name: "Sarah van Wyk", market: "South Africa", flag: "🇿🇦", product: "Personal loan", amount: "R80,000", hint: "Self-employed, good credit" },
];

const STEPS = [
  { key: "post", label: "Posting application", icon: FileText },
  { key: "analyze", label: "Analyzing data & risk signals", icon: Sparkles },
  { key: "underwrite", label: "Running policy + AI underwrite", icon: ShieldCheck },
];

export default function LenderDemo() {
  const [selected, setSelected] = useState(PROFILES[0].key);
  const [phase, setPhase] = useState("idle"); // idle | running | done | error
  const [stepIdx, setStepIdx] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const run = async () => {
    if (phase === "running") return;
    setPhase("running");
    setStepIdx(0);
    setResult(null);
    setError(null);
    // Animate the pipeline steps while the single backend call runs.
    const stepTimer = setInterval(() => setStepIdx((i) => Math.min(i + 1, STEPS.length - 1)), 1400);
    try {
      const res = await base44.functions.invoke("apiDemoUnderwrite", { profile: selected });
      clearInterval(stepTimer);
      setStepIdx(STEPS.length);
      setResult(res.data);
      setPhase("done");
    } catch (e) {
      clearInterval(stepTimer);
      const msg = e?.response?.data?.error?.message || e.message || "Something went wrong running the sample.";
      setError(msg);
      setPhase("error");
    }
  };

  const reset = () => {
    setPhase("idle");
    setResult(null);
    setError(null);
    setStepIdx(0);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <HomeNav />

      {/* Hero + selector */}
      <section className="relative overflow-hidden" style={{ backgroundColor: "#0d1a12" }}>
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: "radial-gradient(85% 70% at 62% 38%, #1c382a 0%, #0f2219 55%, #0d1a12 100%)" }}
        />
        <div className="relative max-w-5xl mx-auto px-5 sm:px-8 pt-16 sm:pt-20 pb-16">
          <div className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 mb-6 bg-white/5 border border-white/10">
            <span className="w-4 h-4 rounded-sm bg-[#008e8b] flex items-center justify-center text-white text-[10px] font-bold">C</span>
            <span className="text-[12px] font-medium text-emerald-100/80">Live underwriting sample · no sign-up</span>
          </div>
          <h1 className="max-w-2xl text-4xl sm:text-5xl font-semibold tracking-tight leading-[1.05] text-white">
            Run a real underwriting decision on a sample borrower.
          </h1>
          <p className="mt-5 max-w-xl text-base sm:text-lg text-[#a0b2a9] leading-relaxed">
            Pick a sample borrower, hit run, and watch CreditDecide post the application,
            analyze the data, and deliver an explainable decision with a full credit memo —
            exactly as a lender sees it.
          </p>

          {/* Profile selector */}
          <div className="mt-9">
            <div className="text-[12px] font-medium uppercase tracking-wider text-emerald-100/60 mb-3">
              Select a sample borrower
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              {PROFILES.map((p) => {
                const active = selected === p.key;
                return (
                  <button
                    key={p.key}
                    onClick={() => setSelected(p.key)}
                    disabled={phase === "running"}
                    className={`text-left rounded-2xl p-4 border transition-all ${
                      active
                        ? "bg-white/10 border-emerald-400/60 ring-1 ring-emerald-400/40"
                        : "bg-white/[0.03] border-white/10 hover:bg-white/[0.06]"
                    } ${phase === "running" ? "opacity-60 cursor-not-allowed" : ""}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="text-xl">{p.flag}</span>
                        <div>
                          <div className="text-sm font-semibold text-white">{p.name}</div>
                          <div className="text-[11px] text-emerald-100/60">{p.market} · {p.product}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold text-white tabular-nums">{p.amount}</div>
                        <div className="text-[10px] text-emerald-100/50">{p.hint}</div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <button
                onClick={run}
                disabled={phase === "running"}
                className="group inline-flex items-center justify-center gap-2 text-sm font-medium text-black bg-white pl-5 pr-4 py-3 rounded-full hover:bg-emerald-50 transition-all shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {phase === "running" ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Underwriting…</>
                ) : (
                  <>Run underwriting <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" /></>
                )}
              </button>
              {phase === "done" && (
                <button
                  onClick={reset}
                  className="text-sm font-medium text-white/80 hover:text-white px-4 py-3 transition-colors"
                >
                  Run another sample
                </button>
              )}
              <div className="hidden sm:flex items-center gap-1.5 text-[12px] text-white/40 ml-auto">
                <Lock className="w-3.5 h-3.5" /> Sandbox data · no real borrower
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pipeline + result */}
      <section className="flex-1 bg-[#f7f8fa]">
        <div className="max-w-5xl mx-auto px-5 sm:px-8 py-12">
          {phase === "idle" && (
            <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center mb-4">
                <ShieldCheck className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">Ready when you are</h3>
              <p className="mt-2 text-sm text-slate-500 max-w-md mx-auto">
                Choose a sample borrower above and hit <span className="font-medium text-slate-700">Run underwriting</span> to see the full decision flow.
              </p>
            </div>
          )}

          {phase === "running" && (
            <div className="rounded-2xl border border-slate-200 bg-white p-8">
              <div className="flex items-center gap-2 mb-6">
                <Loader2 className="w-4 h-4 text-emerald-600 animate-spin" />
                <span className="text-sm font-medium text-slate-700">Running the underwriting pipeline…</span>
              </div>
              <div className="space-y-3">
                {STEPS.map((s, i) => {
                  const state = i < stepIdx ? "done" : i === stepIdx ? "active" : "pending";
                  return (
                    <div key={s.key} className="flex items-center gap-3">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[12px] ${
                        state === "done" ? "bg-emerald-100 text-emerald-700"
                        : state === "active" ? "bg-slate-900 text-white"
                        : "bg-slate-100 text-slate-400"
                      }`}>
                        {state === "done" ? <CheckCircle2 className="w-4 h-4" />
                        : state === "active" ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        : <s.icon className="w-3.5 h-3.5" />}
                      </div>
                      <span className={`text-sm ${state === "pending" ? "text-slate-400" : "text-slate-700 font-medium"}`}>
                        {s.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {phase === "error" && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-8 text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center mb-4">
                <XCircle className="w-6 h-6 text-rose-600" />
              </div>
              <h3 className="text-lg font-semibold text-rose-900">Couldn't run the sample</h3>
              <p className="mt-2 text-sm text-rose-700 max-w-md mx-auto">{error}</p>
              <button onClick={run} className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-white bg-rose-600 px-4 py-2.5 rounded-lg hover:bg-rose-700 transition-colors">
                Try again
              </button>
            </div>
          )}

          {phase === "done" && result && <ResultPanel result={result} />}
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

function ResultPanel({ result }) {
  const decision = result.decision;
  const tone = decision === "APPROVE"
    ? { ring: "ring-emerald-200", bg: "bg-emerald-50", text: "text-emerald-700", icon: CheckCircle2, label: "Approve" }
    : decision === "REVIEW"
    ? { ring: "ring-amber-200", bg: "bg-amber-50", text: "text-amber-700", icon: AlertTriangle, label: "Review" }
    : { ring: "ring-rose-200", bg: "bg-rose-50", text: "text-rose-700", icon: XCircle, label: "Decline" };
  const Icon = tone.icon;
  const fmtMoney = (n, c) => new Intl.NumberFormat("en-US", { style: "currency", currency: (c || "GBP").toUpperCase(), maximumFractionDigits: 0 }).format(n || 0);
  const pct = (n) => n == null ? "—" : `${(n * 100).toFixed(1)}%`;

  return (
    <div className="space-y-5">
      {/* Posted confirmation */}
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-3.5 flex items-center gap-3">
        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
        <div className="text-sm text-emerald-900">
          <span className="font-semibold">Posted successfully</span> — application{" "}
          <span className="font-mono text-emerald-800">{result.application_number}</span> for{" "}
          <span className="font-medium">{result.borrower_name}</span> ({fmtMoney(result.loan_amount, result.loan_currency)}, {result.loan_term_months}m)
        </div>
      </div>

      {/* Decision hero */}
      <div className={`rounded-2xl border ${tone.ring.replace("ring-", "border-")} ${tone.bg} p-6 sm:p-8`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-2xl bg-white ${tone.text} flex items-center justify-center shadow-sm`}>
              <Icon className="w-7 h-7" />
            </div>
            <div>
              <div className="text-[12px] font-medium uppercase tracking-wider text-slate-500">Final decision</div>
              <div className={`text-3xl font-semibold ${tone.text}`}>{tone.label}</div>
              <div className="text-[12px] text-slate-500 mt-0.5">
                AI recommendation: <span className="font-medium text-slate-700">{result.recommendation_value || "—"}</span>
                {result.human_review_required ? " · human review flagged" : ""}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 sm:gap-6">
            <Metric label="Risk score" value={result.risk_score != null ? result.risk_score.toFixed(2) : "—"} />
            <Metric label="Prob. of default" value={pct(result.probability_of_default)} />
            <Metric label="Confidence" value={pct(result.confidence)} />
          </div>
        </div>
      </div>

      {/* Policy + rate */}
      <div className="grid sm:grid-cols-3 gap-4">
        <InfoCard label="Policy applied" value={result.policy_id} mono />
        <InfoCard label="Interest rate" value={result.interest_rate != null ? `${result.interest_rate.toFixed(2)}%` : "—"} />
        <InfoCard label="Risk signals generated" value={String(result.signal_count ?? 0)} />
      </div>

      {/* Reasons */}
      {result.reasons?.length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h4 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-slate-400" /> Decision reasons
          </h4>
          <ul className="space-y-2">
            {result.reasons.map((r, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-slate-600">
                <ChevronRight className="w-4 h-4 mt-0.5 text-slate-300 shrink-0" />
                <span>{r}</span>
              </li>
            ))}
          </ul>
          {result.adverse_action_codes?.length > 0 && (
            <div className="mt-4 pt-4 border-t border-slate-100">
              <div className="text-[11px] font-medium uppercase tracking-wider text-slate-400 mb-2">Adverse-action codes</div>
              <div className="flex flex-wrap gap-2">
                {result.adverse_action_codes.map((c, i) => (
                  <span key={i} className="text-[11px] font-mono px-2 py-1 rounded bg-rose-50 text-rose-700 border border-rose-100">
                    {c.code} · {c.label}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* AI memo */}
      {result.ai_memo && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h4 className="text-sm font-semibold text-slate-900 mb-2 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-500" /> AI credit memo
          </h4>
          {result.ai_summary && (
            <p className="text-sm text-slate-600 leading-relaxed mb-3">{result.ai_summary}</p>
          )}
          <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{result.ai_memo}</p>
        </div>
      )}

      {/* CTAs */}
      <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-emerald-50 to-white p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="text-base font-semibold text-slate-900">Want this for your lending team?</h4>
          <p className="text-sm text-slate-500 mt-1">Bring your own policies, data sources, and borrowers — CreditDecide runs the same flow on live data.</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Link to="/demo" className="text-sm font-medium text-slate-700 bg-white border border-slate-200 px-4 py-2.5 rounded-lg hover:bg-slate-50 transition-colors">
            Book a demo
          </Link>
          <Link to="/applications" className="text-sm font-medium text-white bg-[#0a0c12] px-4 py-2.5 rounded-lg hover:bg-[#1c1f26] transition-colors">
            Open workspace
          </Link>
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div>
      <div className="text-[11px] font-medium uppercase tracking-wider text-slate-400">{label}</div>
      <div className="text-xl font-semibold text-slate-900 tabular-nums">{value}</div>
    </div>
  );
}

function InfoCard({ label, value, mono }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="text-[11px] font-medium uppercase tracking-wider text-slate-400 mb-1">{label}</div>
      <div className={`text-sm font-semibold text-slate-900 ${mono ? "font-mono" : ""}`}>{value}</div>
    </div>
  );
}