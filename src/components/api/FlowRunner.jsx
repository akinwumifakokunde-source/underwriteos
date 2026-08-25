import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Play, Loader2, CheckCircle2, Circle, RotateCcw, FileText, ShieldCheck, AlertTriangle } from "lucide-react";
import JsonBlock from "./JsonBlock.jsx";

const SAMPLE = {
  borrower: { first_name: "Jordan", last_name: "Okafor", email: "jordan.okafor@example.com", employment_status: "employed", employer_name: "Northwind Trading", annual_income: 58000, income_currency: "GBP" },
  application: { loan_amount: 15000, loan_currency: "GBP", loan_purpose: "debt_consolidation", loan_term_months: 36, interest_rate: 0.099, policy_id: "consumer-v1" },
  credit: { provider: "experian", raw_data: { credit_score: 672, active_accounts: 4, closed_accounts: 1, delinquent_accounts: 0, defaults: 0, outstanding_balance: 3200, credit_utilisation: 0.38, recent_enquiries: 2, repayment_history: 94 } },
  bank: {
    period_start: "2026-05-01", period_end: "2026-07-31", account_number_masked: "****1234",
    transactions: [
      { date: "2026-05-25", description: "Salary Northwind Trading", amount: 4833, direction: "credit" },
      { date: "2026-06-25", description: "Salary Northwind Trading", amount: 4833, direction: "credit" },
      { date: "2026-07-25", description: "Salary Northwind Trading", amount: 4833, direction: "credit" },
      { date: "2026-05-01", description: "Rent standing order", amount: -1450, direction: "debit", recurring: true },
      { date: "2026-06-01", description: "Rent standing order", amount: -1450, direction: "debit", recurring: true },
      { date: "2026-07-01", description: "Rent standing order", amount: -1450, direction: "debit", recurring: true },
      { date: "2026-05-15", description: "Loan repayment Halifax", amount: -310, direction: "debit", recurring: true },
      { date: "2026-06-15", description: "Loan repayment Halifax", amount: -310, direction: "debit", recurring: true },
      { date: "2026-07-15", description: "Loan repayment Halifax", amount: -310, direction: "debit", recurring: true },
      { date: "2026-05-10", description: "Tesco groceries", amount: -240 },
      { date: "2026-06-12", description: "Sainsbury groceries", amount: -198 },
      { date: "2026-07-09", description: "Tesco groceries", amount: -221 },
    ]
  }
};

const STEPS = [
  { id: "borrower", label: "Create borrower", endpoint: "POST /v1/borrowers" },
  { id: "application", label: "Create application", endpoint: "POST /v1/applications" },
  { id: "credit", label: "Submit credit report", endpoint: "POST /v1/applications/{id}/credit-report" },
  { id: "bank", label: "Submit bank statement", endpoint: "POST /v1/applications/{id}/bank-statement" },
  { id: "analyze", label: "Run analysis", endpoint: "POST /v1/applications/{id}/analyze" },
  { id: "underwrite", label: "Underwrite", endpoint: "POST /v1/applications/{id}/underwrite" },
];

const decisionStyle = {
  APPROVE: { ring: "ring-emerald-200", bg: "bg-emerald-50", text: "text-emerald-700", icon: ShieldCheck },
  REVIEW: { ring: "ring-amber-200", bg: "bg-amber-50", text: "text-amber-700", icon: AlertTriangle },
  DECLINE: { ring: "ring-rose-200", bg: "bg-rose-50", text: "text-rose-700", icon: AlertTriangle },
};

export default function FlowRunner() {
  const [state, setState] = useState({});
  const [running, setRunning] = useState(false);
  const [activeStep, setActiveStep] = useState(null);
  const [ids, setIds] = useState({});

  const call = async (name, payload) => {
    const res = await base44.functions.invoke(name, payload);
    return res.data;
  };

  const runStep = async (stepId, ctx) => {
    setActiveStep(stepId);
    setState((s) => ({ ...s, [stepId]: { status: "running" } }));
    try {
      let res;
      if (stepId === "borrower") {
        res = await call("apiBorrowers", { action: "create", ...SAMPLE.borrower });
        ctx.borrower_id = res.borrower_id;
      } else if (stepId === "application") {
        res = await call("apiApplications", { action: "create", borrower_id: ctx.borrower_id, ...SAMPLE.application });
        ctx.application_id = res.application_id;
      } else if (stepId === "credit") {
        res = await call("apiCreditReport", { action: "submit", application_id: ctx.application_id, ...SAMPLE.credit });
      } else if (stepId === "bank") {
        res = await call("apiBankStatement", { action: "submit", application_id: ctx.application_id, ...SAMPLE.bank });
      } else if (stepId === "analyze") {
        res = await call("apiAnalyze", { application_id: ctx.application_id });
      } else if (stepId === "underwrite") {
        res = await call("apiUnderwrite", { application_id: ctx.application_id, policy_id: "consumer-v1" });
      }
      setIds({ borrower_id: ctx.borrower_id, application_id: ctx.application_id });
      setState((s) => ({ ...s, [stepId]: { status: "done", response: res } }));
      return res;
    } catch (e) {
      setState((s) => ({ ...s, [stepId]: { status: "error", response: e?.response?.data || { error: e.message } } }));
      throw e;
    }
  };

  const runAll = async () => {
    setRunning(true);
    setState({});
    setIds({});
    const ctx = {};
    try {
      for (const step of STEPS) {
        await runStep(step.id, ctx);
      }
    } catch {
      // stop on error
    }
    setActiveStep(null);
    setRunning(false);
  };

  const reset = () => { setState({}); setIds({}); setActiveStep(null); };

  const response = state.underwrite?.response;
  const decision = response?.decision;
  const recommendation = response?.recommendation;
  const ds = decision ? decisionStyle[decision.decision] : null;

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Interactive flow</h2>
          <p className="text-sm text-slate-500">Run the full underwriting pipeline with sample data, or step through each API call.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={reset} disabled={running} className="inline-flex items-center gap-1.5 text-sm text-slate-600 px-3 py-2 rounded-lg hover:bg-slate-100 disabled:opacity-40">
            <RotateCcw className="w-3.5 h-3.5" /> Reset
          </button>
          <button onClick={runAll} disabled={running} className="inline-flex items-center gap-1.5 text-sm font-medium text-white bg-slate-900 px-4 py-2 rounded-lg hover:bg-slate-800 disabled:opacity-60 transition-colors">
            {running ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            {running ? "Running…" : "Run full flow"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        <div className="lg:col-span-2 space-y-2">
          {STEPS.map((step, i) => {
            const st = state[step.id];
            const isActive = activeStep === step.id;
            return (
              <div key={step.id} className={`rounded-xl border p-3.5 transition-all ${isActive ? "border-slate-900 shadow-sm" : st?.status === "done" ? "border-slate-200 bg-white" : st?.status === "error" ? "border-rose-200 bg-rose-50/40" : "border-slate-200"}`}>
                <div className="flex items-center gap-3">
                  <div className="shrink-0">
                    {st?.status === "done" ? <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                     : st?.status === "running" ? <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />
                     : st?.status === "error" ? <AlertTriangle className="w-5 h-5 text-rose-500" />
                     : <Circle className="w-5 h-5 text-slate-300" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-slate-400">{String(i + 1).padStart(2, "0")}</span>
                      <span className="text-sm font-medium text-slate-800">{step.label}</span>
                    </div>
                    <code className="text-[11px] font-mono text-slate-400 truncate block">{step.endpoint}</code>
                  </div>
                </div>
                {st?.response && (
                  <div className="mt-2.5">
                    <JsonBlock data={st.response} maxHeight="160px" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="lg:col-span-3">
          {decision && ds ? (
            <DecisionCard decision={decision} recommendation={recommendation} ds={ds} />
          ) : (
            <div className="h-full rounded-xl border border-dashed border-slate-200 bg-slate-50/50 flex flex-col items-center justify-center text-center p-10 min-h-[300px]">
              <FileText className="w-8 h-8 text-slate-300 mb-3" />
              <p className="text-sm text-slate-400 max-w-xs">Run the flow to generate a structured underwriting decision, risk signals, and an AI underwriting memo.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DecisionCard({ decision, recommendation, ds }) {
  const Icon = ds.icon;
  return (
    <div className="space-y-4">
      <div className={`rounded-xl ring-1 ${ds.ring} ${ds.bg} p-5`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <Icon className={`w-6 h-6 ${ds.text}`} />
            <div>
              <div className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">Final decision</div>
              <div className={`text-2xl font-bold ${ds.text}`}>{decision.decision}</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">Decision source</div>
            <div className="text-sm font-mono text-slate-700">{decision.decision_source}</div>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Metric label="Risk score" value={decision.risk_score?.toFixed(2)} />
          <Metric label="Prob. of default" value={decision.probability_of_default?.toFixed(3)} />
          <Metric label="Confidence" value={decision.confidence?.toFixed(2)} />
          <Metric label="Human review" value={decision.human_review_required ? "Yes" : "No"} />
        </div>
        {recommendation && (
          <div className="mt-3 flex items-center gap-2 text-[11px] text-slate-500">
            <span className="uppercase tracking-wider font-semibold">AI recommendation</span>
            <span className="font-mono font-semibold text-slate-700">{recommendation.recommendation}</span>
            <span className="text-slate-300">·</span>
            <span>policy {decision.policy_id || "consumer-v1"} v{decision.policy_version || "1"}</span>
            {decision.override_reason && <span className="text-amber-600">· override: {decision.override_reason}</span>}
          </div>
        )}
      </div>

      {recommendation?.ai_summary && (
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-1.5">AI underwriting memo</div>
          <p className="text-sm text-slate-700 leading-relaxed">{recommendation.ai_summary}</p>
          {recommendation.ai_memo && <p className="text-sm text-slate-500 leading-relaxed mt-2">{recommendation.ai_memo}</p>}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <SignalList title="Positive signals" items={recommendation?.positive_signals} tone="emerald" />
        <SignalList title="Risk factors" items={recommendation?.risk_factors} tone="rose" />
      </div>

      {decision.reasons?.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-2">Reasons</div>
          <ul className="space-y-1.5">
            {decision.reasons.map((r, i) => (
              <li key={i} className="text-sm text-slate-600 flex gap-2"><span className="text-slate-300">•</span>{r}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div className="bg-white/70 rounded-lg px-3 py-2">
      <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">{label}</div>
      <div className="text-lg font-semibold text-slate-800 font-mono">{value}</div>
    </div>
  );
}

function SignalList({ title, items, tone }) {
  const dot = tone === "emerald" ? "bg-emerald-400" : "bg-rose-400";
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-2">{title}</div>
      {items?.length ? (
        <ul className="space-y-1.5">
          {items.map((s, i) => (
            <li key={i} className="text-sm text-slate-600 flex gap-2 items-start">
              <span className={`w-1.5 h-1.5 rounded-full ${dot} mt-1.5 shrink-0`} />{s}
            </li>
          ))}
        </ul>
      ) : <p className="text-sm text-slate-400">None</p>}
    </div>
  );
}