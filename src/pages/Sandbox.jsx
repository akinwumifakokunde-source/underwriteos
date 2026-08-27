import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Play, RotateCcw, Loader2, Code2, Info, ShieldCheck } from "lucide-react";
import Nav from "@/components/layout/Nav.jsx";
import BorrowerConfig from "@/components/sandbox/BorrowerConfig.jsx";
import ScenarioSelector, { SCENARIOS } from "@/components/sandbox/ScenarioSelector.jsx";
import SandboxFlow from "@/components/sandbox/SandboxFlow.jsx";
import StepPanel from "@/components/sandbox/StepPanel.jsx";
import ResultTabs from "@/components/sandbox/ResultTabs.jsx";


const STEPS = [
  { id: "borrower", label: "Create borrower", method: "POST", path: "/borrowers", fn: "apiBorrowers", status: 201 },
  { id: "application", label: "Create application", method: "POST", path: "/applications", fn: "apiApplications", status: 201 },
  { id: "credit", label: "Submit credit data", method: "POST", path: "/applications/{id}/credit-report", fn: "apiCreditReport", status: 201 },
  { id: "bank", label: "Submit financial data", method: "POST", path: "/applications/{id}/bank-statement", fn: "apiBankStatement", status: 201 },
  { id: "analyze", label: "Analyze", method: "POST", path: "/applications/{id}/analyze", fn: "apiAnalyze", status: 202 },
  { id: "underwrite", label: "Underwrite", method: "POST", path: "/applications/{id}/underwrite", fn: "apiUnderwrite", status: 200 },
];

function buildTransactions(cfg) {
  const monthlyIncome = Math.round(cfg.annual_income / 12);
  const debtMonthly = Math.max(1, Math.round(cfg.existing_debt / cfg.loan_term_months));
  const rent = Math.round(cfg.monthly_expenses * 0.65);
  const living = cfg.monthly_expenses - rent;
  const tx = [];
  for (const m of [5, 6, 7]) {
    const mm = String(m).padStart(2, "0");
    tx.push({ date: `2026-${mm}-25`, description: `Salary ${cfg.employer_name}`, amount: monthlyIncome, direction: "credit" });
    tx.push({ date: `2026-${mm}-01`, description: "Rent & utilities", amount: -rent, direction: "debit", recurring: true });
    tx.push({ date: `2026-${mm}-15`, description: "Loan repayment", amount: -debtMonthly, direction: "debit", recurring: true });
    tx.push({ date: `2026-${mm}-20`, description: "Groceries & transport", amount: -living, direction: "debit" });
  }
  return tx;
}

function buildCreditData(cfg) {
  return {
    credit_score: cfg.credit_score,
    active_accounts: cfg.active_accounts,
    delinquent_accounts: cfg.delinquent_accounts,
    defaults: cfg.defaults,
    credit_utilisation: cfg.credit_utilisation,
    recent_enquiries: cfg.recent_enquiries,
    repayment_history: cfg.repayment_history,
    outstanding_balance: Math.round(cfg.existing_debt),
  };
}

function buildPayload(stepId, cfg, ctx) {
  if (stepId === "borrower")
    return { action: "create", first_name: cfg.first_name, last_name: cfg.last_name, email: cfg.email, employment_status: cfg.employment_status, employer_name: cfg.employer_name, annual_income: cfg.annual_income, income_currency: "GBP" };
  if (stepId === "application")
    return { action: "create", borrower_id: ctx.borrower_id, loan_amount: cfg.loan_amount, loan_currency: "GBP", loan_purpose: "debt_consolidation", loan_term_months: cfg.loan_term_months, interest_rate: 0.099, policy_id: "consumer-v1" };
  if (stepId === "credit") return { action: "submit", application_id: ctx.application_id, provider: "mock", raw_data: buildCreditData(cfg) };
  if (stepId === "bank")
    return { action: "submit", application_id: ctx.application_id, period_start: "2026-05-01", period_end: "2026-07-31", account_number_masked: "****1234", transactions: buildTransactions(cfg) };
  if (stepId === "analyze") return { application_id: ctx.application_id };
  if (stepId === "underwrite") return { application_id: ctx.application_id, policy_id: "consumer-v1" };
  return {};
}

const freshSteps = () => STEPS.map((s) => ({ ...s, state: { status: "not_started" } }));
const genReqId = () => "req_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

export default function Sandbox() {
  const navigate = useNavigate();
  const [authed, setAuthed] = useState(null);
  const [scenario, setScenario] = useState("borderline");
  const [config, setConfig] = useState(SCENARIOS.borderline.config);
  const [steps, setSteps] = useState(freshSteps);
  const [selected, setSelected] = useState("borrower");
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const ok = await base44.auth.isAuthenticated();
        if (!ok) navigate("/register", { replace: true });
        else setAuthed(true);
      } catch {
        navigate("/register", { replace: true });
      }
    })();
  }, [navigate]);
  const [results, setResults] = useState(null);
  const [webhook, setWebhook] = useState(null);
  const [ids, setIds] = useState({});
  const [requestId, setRequestId] = useState(null);
  const [totalMs, setTotalMs] = useState(null);

  const selectScenario = (id) => {
    setScenario(id);
    setConfig(SCENARIOS[id].config);
  };

  const updateStep = (id, patch) =>
    setSteps((prev) => prev.map((s) => (s.id === id ? { ...s, state: { ...s.state, ...patch } } : s)));
  const addProgress = (msg) => setProgress((p) => [...p, { id: Date.now() + Math.random(), msg }]);

  const runStep = async (step, ctx) => {
    updateStep(step.id, { status: "running" });
    const start = performance.now();
    const payload = buildPayload(step.id, config, ctx);
    updateStep(step.id, { request: { body: payload, headers: { "Idempotency-Key": `demo-${step.id}-${Date.now()}` } } });
    try {
      const res = await base44.functions.invoke(step.fn, payload);
      const dur = Math.round(performance.now() - start);
      const data = res.data;
      const status = res.status || step.status;
      updateStep(step.id, { status: "completed", response: data, statusCode: status, durationMs: dur });
      if (step.id === "borrower") ctx.borrower_id = data.borrower_id;
      if (step.id === "application") ctx.application_id = data.application_id;
      setIds({ borrower_id: ctx.borrower_id, application_id: ctx.application_id });
      return data;
    } catch (e) {
      const dur = Math.round(performance.now() - start);
      updateStep(step.id, {
        status: "failed",
        response: e?.response?.data || { error: { message: e.message } },
        statusCode: e?.response?.status || 500,
        durationMs: dur,
      });
      throw e;
    }
  };

  const fetchResults = async (ctx) => {
    const get = async (action) => {
      try {
        const r = await base44.functions.invoke("apiRetrieve", { action, application_id: ctx.application_id });
        return r.data;
      } catch {
        return null;
      }
    };
    const [fp, cp, rec, dec, ev, risk, aud] = await Promise.all([
      get("financial-profile"), get("credit-profile"), get("recommendation"),
      get("decision"), get("evidence"), get("risk"), get("audit"),
    ]);
    const data = {
      financialProfile: fp?.financial_profile,
      creditProfile: cp?.credit_profile,
      recommendation: rec?.recommendation,
      decision: dec?.decision,
      evidence: ev?.evidence || [],
      riskSignals: risk?.signals || [],
      audit: aud?.audit_events || [],
    };
    setResults(data);
    return data;
  };

  const runAll = async () => {
    setRunning(true);
    setResults(null);
    setWebhook(null);
    setProgress([]);
    setSteps(freshSteps());
    setIds({});
    setRequestId(null);
    setTotalMs(null);
    const reqId = genReqId();
    setRequestId(reqId);
    const startTotal = performance.now();
    const ctx = {};
    try {
      for (const step of STEPS) {
        addProgress(`${step.label}…`);
        await runStep(step, ctx);
        addProgress(`✓ ${step.label} complete`);
      }
      addProgress("Fetching profiles & evidence…");
      const data = await fetchResults(ctx);
      addProgress("✓ Underwriting complete");
      setWebhook({
        event_id: "evt_" + Date.now().toString(36),
        event_type: "underwriting.completed",
        application_id: ctx.application_id,
        environment: "sandbox",
        timestamp: new Date().toISOString(),
        delivery_status: "delivered",
        payload: {
          decision: data?.decision?.decision,
          recommendation: data?.recommendation?.recommendation,
          risk_score: data?.decision?.risk_score,
        },
      });
    } catch {
      addProgress("✗ Flow stopped");
    }
    setTotalMs(Math.round(performance.now() - startTotal));
    setRunning(false);
  };

  const reset = () => {
    setSteps(freshSteps());
    setResults(null);
    setWebhook(null);
    setProgress([]);
    setIds({});
    setRequestId(null);
    setTotalMs(null);
    setSelected("borrower");
  };

  const completed = steps.every((s) => s.state.status === "completed");
  const selectedStep = steps.find((s) => s.id === selected);
  const analyzeStep = steps.find((s) => s.id === "analyze");
  const jobId = analyzeStep?.state?.response?.job_id;
  const diagnostics = {
    requestId,
    applicationId: ids.application_id,
    jobId,
    totalMs,
    apiCalls: STEPS.length,
    status: completed ? "Completed" : running ? "Running" : "—",
  };

  if (authed === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50/50">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-900">
      <Nav />

      <div className="border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-6">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">UnderwriteOS Sandbox</h1>
              <p className="text-sm text-slate-500 mt-1">Test the complete underwriting pipeline with synthetic borrower data.</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-400">Environment</span>
                <span className="font-mono font-medium text-emerald-600 bg-emerald-50 border border-emerald-100 rounded px-2 py-1">SANDBOX</span>
              </div>
              <div className="flex gap-2 ml-auto">
                <button onClick={reset} disabled={running} className="inline-flex items-center gap-1.5 text-sm text-slate-600 px-3 py-2 rounded-lg border border-slate-200 hover:bg-white disabled:opacity-40">
                  <RotateCcw className="w-3.5 h-3.5" /> Reset
                </button>
                <button onClick={runAll} disabled={running} className="inline-flex items-center gap-1.5 text-sm font-medium text-white bg-slate-900 px-4 py-2 rounded-lg hover:bg-slate-800 disabled:opacity-60">
                  {running ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />} Run full underwriting
                </button>
              </div>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-[11px] text-slate-400">
            <Info className="w-3 h-3" /> Sandbox data is synthetic and does not affect production underwriting.
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-6 grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-5 space-y-4">
          <ScenarioSelector selected={scenario} onSelect={selectScenario} />
          <BorrowerConfig config={config} onChange={setConfig} disabled={running} />
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-slate-900">Underwriting flow</h3>
              <span className="text-[11px] text-slate-400">6 API calls</span>
            </div>
            <SandboxFlow steps={steps} selected={selected} onSelect={setSelected} ctxId={ids.application_id} />
          </div>
          {progress.length > 0 && (
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-2">Live progress</div>
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {progress.map((p) => (
                  <div key={p.id} className="text-xs text-slate-600 font-mono">{p.msg}</div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-7 space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-slate-900">API request / response</h3>
              <span className="inline-flex items-center gap-1.5 text-[11px] text-slate-500">
                <Code2 className="w-3.5 h-3.5" /> cURL · Python · JavaScript
              </span>
            </div>
            <StepPanel step={selectedStep} ctxId={ids.application_id} />
          </div>

          {running && !completed && (
            <div className="rounded-xl border border-slate-200 bg-white p-5 flex items-center gap-3">
              <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />
              <span className="text-sm text-slate-500">Processing… this may take a few seconds.</span>
            </div>
          )}

          {!completed && !running && progress.length === 0 && (
            <div className="rounded-xl border border-dashed border-slate-200 bg-white p-10 flex flex-col items-center text-center">
              <ShieldCheck className="w-8 h-8 text-slate-300 mb-3" />
              <p className="text-sm font-medium text-slate-600">No underwriting run yet.</p>
              <p className="text-xs text-slate-400 mt-1 max-w-xs">Run the sandbox with synthetic borrower data to see the complete API response.</p>
              <button onClick={runAll} className="mt-4 text-sm font-medium text-white bg-slate-900 px-4 py-2 rounded-lg hover:bg-slate-800">Run sandbox</button>
            </div>
          )}
        </div>
      </div>

      {completed && results && (
        <div className="max-w-7xl mx-auto px-5 sm:px-8 pb-6">
          <ResultTabs
            results={results}
            steps={steps}
            selectedStep={selectedStep}
            selected={selected}
            onSelectStep={setSelected}
            ctxId={ids.application_id}
            diagnostics={diagnostics}
            webhook={webhook}
          />
        </div>
      )}

      <div className="max-w-7xl mx-auto px-5 sm:px-8 pb-10 space-y-6">
        <div className="rounded-xl border border-slate-200 bg-white p-4 text-[11px] text-slate-400 leading-relaxed">
          <p>Sandbox uses synthetic data. Do not upload real customer financial or credit information.</p>
          <p className="mt-1">UnderwriteOS provides underwriting intelligence and workflow infrastructure. Final lending decisions remain subject to the lender's policies and applicable requirements.</p>
        </div>
      </div>
    </div>
  );
}