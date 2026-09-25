import React, { useState } from "react";
import { FileText, Check, AlertTriangle, ShieldCheck, Loader2, ChevronDown, ChevronUp, Quote, Gavel, Sparkles } from "lucide-react";

// Map evidence records to numbered citation chips [1], [2]…
function useCitations(evidence) {
  const list = (evidence || []).filter((e) => e.signal);
  const bySignal = {};
  list.forEach((e, i) => { if (e.signal && bySignal[e.signal] == null) bySignal[e.signal] = i + 1; });
  const chipFor = (signalName) => (signalName && bySignal[signalName] ? bySignal[signalName] : null);
  return { list, chipFor };
}

function badgeFor(level) {
  if (level === "GOOD") return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30";
  if (level === "REGULAR") return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/30";
  return "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/30";
}

function dtiLevel(v) {
  if (v == null) return null;
  if (v < 0.36) return { level: "GOOD", pts: 35, legend: "Poor ≥ 50% · Regular 36–50% · Good < 36%" };
  if (v < 0.5) return { level: "REGULAR", pts: 20, legend: "Poor ≥ 50% · Regular 36–50% · Good < 36%" };
  return { level: "POOR", pts: 5, legend: "Poor ≥ 50% · Regular 36–50% · Good < 36%" };
}
function scoreLevel(v) {
  if (v == null) return null;
  if (v >= 680) return { level: "GOOD", pts: 25, legend: "Poor < 560 · Regular 560–679 · Good ≥ 680" };
  if (v >= 560) return { level: "REGULAR", pts: 15, legend: "Poor < 560 · Regular 560–679 · Good ≥ 680" };
  return { level: "POOR", pts: 5, legend: "Poor < 560 · Regular 560–679 · Good ≥ 680" };
}
function repayLevel(v) {
  if (v == null) return null;
  if (v >= 90) return { level: "GOOD", pts: 15, legend: "Poor < 80% · Regular 80–89% · Good ≥ 90%" };
  if (v >= 80) return { level: "REGULAR", pts: 10, legend: "Poor < 80% · Regular 80–89% · Good ≥ 90%" };
  return { level: "POOR", pts: 5, legend: "Poor < 80% · Regular 80–89% · Good ≥ 90%" };
}
function utilLevel(v) {
  if (v == null) return null;
  if (v < 0.3) return { level: "GOOD", pts: 15, legend: "Poor ≥ 50% · Regular 30–50% · Good < 30%" };
  if (v < 0.5) return { level: "REGULAR", pts: 10, legend: "Poor ≥ 50% · Regular 30–50% · Good < 30%" };
  return { level: "POOR", pts: 5, legend: "Poor ≥ 50% · Regular 30–50% · Good < 30%" };
}
function evidenceLevel(count) {
  const pct = Math.min(1, (count || 0) / 8);
  if (pct >= 1) return { level: "GOOD", pts: 10, legend: "Complete ≥ 8 records · Partial < 8", value: "100%" };
  if (pct >= 0.5) return { level: "REGULAR", pts: 6, legend: "Complete ≥ 8 records · Partial < 8", value: `${Math.round(pct * 100)}%` };
  return { level: "POOR", pts: 3, legend: "Complete ≥ 8 records · Partial < 8", value: `${Math.round(pct * 100)}%` };
}

function Section({ index, title, status, children, defaultOpen }) {
  const [open, setOpen] = useState(defaultOpen ?? true);
  const statusCls = {
    DONE: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30",
    WRITING: "text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-500/10 border-sky-200 dark:border-sky-500/30",
    QUEUED: "text-slate-400 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700",
  }[status] || "text-slate-400 bg-slate-50 border-slate-200";
  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
      <button onClick={() => setOpen((v) => !v)} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors">
        <span className="text-[11px] font-mono text-slate-400 w-5">{index}</span>
        <span className="text-sm font-semibold text-slate-900 dark:text-slate-50 flex-1 text-left">{title}</span>
        <span className={`text-[10px] font-medium border rounded-full px-2 py-0.5 ${statusCls}`}>{status}</span>
        {open ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
      </button>
      {open && <div className="px-4 pb-4 pt-1">{children}</div>}
    </div>
  );
}

function CitationChip({ n, onClick }) {
  if (!n) return null;
  return (
    <button onClick={onClick} className="inline-flex items-center justify-center min-w-[20px] h-5 px-1 text-[10px] font-semibold rounded-md bg-teal-50 dark:bg-teal-500/10 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-500/30 hover:bg-teal-100 dark:hover:bg-teal-500/20 transition-colors align-middle">
      [{n}]
    </button>
  );
}

export default function CreditMemoTab({ recommendation, decision, evidence, riskSignals, fp, cp, app, borrower, documents, fmtMoney, onOverride, overriding, analyzing }) {
  const { list, chipFor } = useCitations(evidence);
  const [overrideMode, setOverrideMode] = useState(false);
  const [overrideDecision, setOverrideDecision] = useState("");
  const [overrideReason, setOverrideReason] = useState("");

  const has = (v) => v != null && v !== "" && !(Array.isArray(v) && v.length === 0);

  // Scorecard metrics
  const metrics = [
    { name: "DEBT-TO-INCOME", value: fp?.affordability?.debt_to_income != null ? `${(fp.affordability.debt_to_income * 100).toFixed(1)}%` : "—", ...dtiLevel(fp?.affordability?.debt_to_income), max: 35 },
    { name: "CREDIT SCORE", value: cp?.credit_score ?? "—", ...scoreLevel(cp?.credit_score), max: 25 },
    { name: "REPAYMENT HISTORY", value: cp?.repayment_history != null ? `${cp.repayment_history}%` : "—", ...repayLevel(cp?.repayment_history), max: 15 },
    { name: "CREDIT UTILISATION", value: cp?.credit_utilisation != null ? `${Math.round(cp.credit_utilisation * 100)}%` : "—", ...utilLevel(cp?.credit_utilisation), max: 15 },
    { name: "EVIDENCE COMPLETE", value: evidenceLevel(list.length)?.value || "—", ...evidenceLevel(list.length), max: 10 },
  ];
  const totalScore = metrics.reduce((s, m) => s + (m.pts || 0), 0);

  // Sections status
  const sectionsStatus = [
    { title: "Borrower overview", status: has(borrower) ? "DONE" : "QUEUED" },
    { title: "Loan request", status: has(app?.loan_amount) ? "DONE" : "QUEUED" },
    { title: "Financial spreading", status: has(fp?.income) ? "DONE" : analyzing ? "WRITING" : "QUEUED" },
    { title: "Affordability & DTI", status: has(fp?.affordability?.debt_to_income) ? "DONE" : analyzing ? "WRITING" : "QUEUED" },
    { title: "Risk factors & mitigants", status: has(riskSignals) ? "DONE" : analyzing ? "WRITING" : "QUEUED" },
    { title: "Recommendation", status: has(recommendation) ? "DONE" : analyzing ? "WRITING" : "QUEUED" },
  ];
  const doneCount = sectionsStatus.filter((s) => s.status === "DONE").length;

  const scrollToEvidence = (n) => {
    const el = document.getElementById(`memo-citation-${n}`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const submitOverride = () => {
    if (!overrideDecision || !overrideReason.trim()) return;
    onOverride(overrideDecision, overrideReason);
    setOverrideMode(false);
    setOverrideDecision("");
    setOverrideReason("");
  };

  return (
    <div className="space-y-4">
      {/* Progress header */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
        <div className="flex items-center gap-2 mb-1">
          <FileText className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50">Credit memo</h3>
          <span className="text-[10px] text-slate-400 ml-auto">Every claim cited to its source</span>
        </div>
        <p className="text-[13px] text-slate-500 dark:text-slate-400">
          {analyzing ? "Verifying with the documents…" : "Every claim is checked against the evidence already in the file."}
        </p>
        <div className="mt-3 flex items-center gap-3">
          <div className="flex-1 h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-teal-400 to-emerald-500 transition-all duration-500" style={{ width: `${(doneCount / sectionsStatus.length) * 100}%` }} />
          </div>
          <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">{doneCount} of {sectionsStatus.length} sections</span>
        </div>
        <div className="mt-4 grid sm:grid-cols-2 gap-x-6 gap-y-1.5">
          {sectionsStatus.map((s) => (
            <div key={s.title} className="flex items-center gap-2 text-[12px]">
              <span className={`w-1.5 h-1.5 rounded-full ${s.status === "DONE" ? "bg-emerald-500" : s.status === "WRITING" ? "bg-sky-500 animate-pulse" : "bg-slate-300 dark:bg-slate-600"}`} />
              <span className="text-slate-600 dark:text-slate-300 flex-1">{s.title}</span>
              <span className={`text-[10px] font-medium ${s.status === "DONE" ? "text-emerald-600 dark:text-emerald-400" : s.status === "WRITING" ? "text-sky-600 dark:text-sky-400" : "text-slate-400"}`}>{s.status}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Strengths & Weaknesses with citations */}
      <Section index="3" title="Strengths, weaknesses & mitigants" status={has(riskSignals) ? "DONE" : analyzing ? "WRITING" : "QUEUED"}>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="rounded-lg border border-emerald-200 dark:border-emerald-500/30 bg-emerald-50/40 dark:bg-emerald-500/5 p-4">
            <div className="text-[11px] font-mono uppercase tracking-wider text-emerald-700 dark:text-emerald-400 mb-2.5">Strengths</div>
            <ul className="space-y-2">
              {(recommendation?.positive_signals || []).length > 0 ? recommendation.positive_signals.map((p, i) => {
                const chip = chipFor(p);
                return (
                  <li key={i} className="text-[13px] text-slate-700 dark:text-slate-200 leading-relaxed flex gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                    <span className="flex-1">{p}</span>
                    {chip && <CitationChip n={chip} onClick={() => scrollToEvidence(chip)} />}
                  </li>
                );
              }) : <li className="text-[12px] text-slate-400">No positive signals recorded yet.</li>}
            </ul>
          </div>
          <div className="rounded-lg border border-amber-200 dark:border-amber-500/30 bg-amber-50/40 dark:bg-amber-500/5 p-4">
            <div className="text-[11px] font-mono uppercase tracking-wider text-amber-700 dark:text-amber-400 mb-2.5">Weaknesses & mitigants</div>
            <ul className="space-y-2">
              {(recommendation?.risk_factors || []).length > 0 ? recommendation.risk_factors.map((r, i) => {
                const chip = chipFor(r);
                return (
                  <li key={i} className="text-[13px] text-slate-700 dark:text-slate-200 leading-relaxed flex gap-2">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                    <span className="flex-1">{r}</span>
                    {chip && <CitationChip n={chip} onClick={() => scrollToEvidence(chip)} />}
                  </li>
                );
              }) : <li className="text-[12px] text-slate-400">No risk factors recorded yet.</li>}
            </ul>
          </div>
        </div>
        <p className="mt-3 text-[11px] text-slate-400 flex items-center gap-1.5">
          <Quote className="w-3 h-3" /> Click any numbered citation to jump to its source evidence below.
        </p>
      </Section>

      {/* Scorecard */}
      <Section index="9" title="Scorecard & recommendation" status={has(recommendation) ? "DONE" : analyzing ? "WRITING" : "QUEUED"}>
        {/* Recommendation banner */}
        <div className="rounded-lg border border-teal-200 dark:border-teal-500/30 bg-gradient-to-br from-teal-50 to-emerald-50 dark:from-teal-500/10 dark:to-emerald-500/10 p-4 mb-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center shrink-0 shadow-sm">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1">
              <div className="text-[11px] font-mono uppercase tracking-wider text-teal-700 dark:text-teal-300">Recommended disposition</div>
              <p className="text-[13px] text-slate-700 dark:text-slate-200 mt-0.5 leading-relaxed">
                {recommendation?.ai_memo || recommendation?.ai_summary || (analyzing ? "Drafting recommendation from available evidence…" : "Awaiting analysis.")}
              </p>
              <div className="mt-2 flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1 text-[10px] font-medium text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 rounded-full px-2 py-0.5">
                  <ShieldCheck className="w-3 h-3" /> Lender review
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">Scores <span className="font-semibold text-slate-900 dark:text-slate-50">{totalScore}</span> of 100 against the {app?.policy_id?.replace(/-/g, " ") || "consumer"} scorecard.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Scorecard table */}
        <div className="rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
          {metrics.map((m, i) => (
            <div key={i} className={`flex items-center gap-3 px-4 py-3 ${i > 0 ? "border-t border-slate-100 dark:border-slate-800" : ""}`}>
              <div className="flex-1 min-w-0">
                <div className="text-[12px] font-semibold text-slate-900 dark:text-slate-50">{m.name}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">{m.legend}</div>
              </div>
              <div className="text-sm font-mono font-semibold text-slate-900 dark:text-slate-50 w-16 text-right shrink-0">{m.value}</div>
              {m.level && <span className={`text-[10px] font-medium border rounded-full px-2 py-0.5 w-16 text-center ${badgeFor(m.level)}`}>{m.level}</span>}
              <div className="text-[12px] font-mono text-slate-500 dark:text-slate-400 w-16 text-right shrink-0">{m.pts ?? "—"} / {m.max} pts</div>
            </div>
          ))}
          <div className="flex items-center justify-between px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700">
            <span className="text-[12px] font-semibold text-slate-500 dark:text-slate-400">TOTAL SCORE</span>
            <span className="text-lg font-bold bg-gradient-to-r from-teal-500 to-emerald-500 bg-clip-text text-transparent">{totalScore} / 100</span>
          </div>
        </div>

        {/* Decision buttons */}
        {!overrideMode ? (
          <div className="mt-4 flex flex-wrap gap-2">
            <button onClick={() => { setOverrideMode(true); setOverrideDecision("APPROVE"); }} className="inline-flex items-center gap-1.5 text-sm font-medium text-white bg-gradient-to-br from-emerald-500 to-teal-600 px-4 py-2 rounded-lg hover:shadow-md transition-all">
              <Check className="w-4 h-4" /> Approve
            </button>
            <button onClick={() => { setOverrideMode(true); setOverrideDecision("DECLINE"); }} className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
              <AlertTriangle className="w-4 h-4" /> Decline
            </button>
            <button onClick={() => { setOverrideMode(true); setOverrideDecision("REVIEW"); }} className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
              <Gavel className="w-4 h-4" /> Escalate
            </button>
            <span className="text-[11px] text-slate-400 self-center ml-1">AI recommends · your underwriter decides</span>
          </div>
        ) : (
          <div className="mt-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 p-4">
            <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-2">Override — {overrideDecision}</div>
            <textarea value={overrideReason} onChange={(e) => setOverrideReason(e.target.value)} rows={2} placeholder="Reason required — recorded in the audit trail…" className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20" />
            <div className="mt-2 flex gap-2">
              <button onClick={submitOverride} disabled={!overrideReason.trim() || overriding} className="inline-flex items-center gap-1.5 text-sm font-medium text-white bg-slate-900 dark:bg-white dark:text-slate-900 px-3.5 py-2 rounded-lg disabled:opacity-50">
                {overriding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />} Submit
              </button>
              <button onClick={() => { setOverrideMode(false); setOverrideDecision(""); setOverrideReason(""); }} className="text-sm text-slate-600 dark:text-slate-300 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">Cancel</button>
            </div>
          </div>
        )}
      </Section>

      {/* Evidence legend (citation targets) */}
      {list.length > 0 && (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50 mb-3 flex items-center gap-2">
            <Quote className="w-4 h-4 text-teal-600 dark:text-teal-400" /> Evidence index
          </h3>
          <div className="space-y-1.5">
            {list.map((e, i) => (
              <div key={i} id={`memo-citation-${i + 1}`} className="flex items-start gap-2.5 text-[12px] py-1.5 scroll-mt-32">
                <span className="inline-flex items-center justify-center min-w-[22px] h-5 px-1 text-[10px] font-semibold rounded-md bg-teal-50 dark:bg-teal-500/10 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-500/30 shrink-0">[{i + 1}]</span>
                <span className="text-slate-700 dark:text-slate-200 font-medium flex-1">{e.signal}</span>
                <span className="font-mono text-slate-500 dark:text-slate-400">{String(e.value)}</span>
                <span className="text-slate-400 text-right max-w-[40%]">{e.source_type?.replace(/_/g, " ")}{e.source_location ? ` · ${e.source_location}` : ""}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}