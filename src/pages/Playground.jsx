import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Send, Loader2 } from "lucide-react";
import Nav from "@/components/layout/Nav.jsx";
import CodeBlock from "@/components/sandbox/CodeBlock.jsx";
import JsonView from "@/components/sandbox/JsonView.jsx";
import { API_BASE_URL, PRODUCTION_DEPLOYED, PRODUCTION_API_BASE_URL } from "@/lib/apiConfig";
import { withApiKey, hasApiKey } from "@/lib/apiKey";
import { KeyRound } from "lucide-react";

const ENDPOINTS = [
  { method: "POST", path: "/borrowers", fn: "apiBorrowers", label: "Create borrower", body: { action: "create", first_name: "Alex", last_name: "Morgan", email: "alex.morgan@example.com", employment_status: "employed", employer_name: "Helix Digital Ltd", annual_income: 52000, income_currency: "GBP" } },
  { method: "POST", path: "/applications", fn: "apiApplications", label: "Create application", body: { action: "create", borrower_id: "<borrower_id>", loan_amount: 12000, loan_currency: "GBP", loan_purpose: "debt_consolidation", loan_term_months: 24, interest_rate: 0.099, policy_id: "consumer-v1" } },
  { method: "POST", path: "/applications/{id}/credit-report", fn: "apiCreditReport", label: "Submit credit data", body: { action: "submit", application_id: "<application_id>", provider: "mock", raw_data: { credit_score: 742, active_accounts: 6, credit_utilisation: 0.28, recent_enquiries: 2, repayment_history: 96, defaults: 0 } } },
  { method: "POST", path: "/applications/{id}/bank-statement", fn: "apiBankStatement", label: "Submit financial data", body: { action: "submit", application_id: "<application_id>", period_start: "2026-05-01", period_end: "2026-07-31", account_number_masked: "****1234", transactions: [{ date: "2026-05-25", description: "Salary", amount: 4333, direction: "credit" }] } },
  { method: "POST", path: "/applications/{id}/analyze", fn: "apiAnalyze", label: "Analyze", body: { application_id: "<application_id>" } },
  { method: "POST", path: "/applications/{id}/underwrite", fn: "apiUnderwrite", label: "Underwrite", body: { application_id: "<application_id>", policy_id: "consumer-v1" } },
  { method: "GET", path: "/applications/{id}/financial-profile", fn: "apiRetrieve", label: "Financial profile", body: { action: "financial-profile", application_id: "<application_id>" } },
  { method: "GET", path: "/applications/{id}/credit-profile", fn: "apiRetrieve", label: "Credit profile", body: { action: "credit-profile", application_id: "<application_id>" } },
  { method: "GET", path: "/applications/{id}/risk", fn: "apiRetrieve", label: "Risk signals", body: { action: "risk", application_id: "<application_id>" } },
  { method: "GET", path: "/applications/{id}/evidence", fn: "apiRetrieve", label: "Evidence", body: { action: "evidence", application_id: "<application_id>" } },
  { method: "GET", path: "/applications/{id}/recommendation", fn: "apiRetrieve", label: "Recommendation", body: { action: "recommendation", application_id: "<application_id>" } },
  { method: "GET", path: "/applications/{id}/decision", fn: "apiRetrieve", label: "Decision", body: { action: "decision", application_id: "<application_id>" } },
  { method: "GET", path: "/applications/{id}/audit", fn: "apiRetrieve", label: "Audit trail", body: { action: "audit", application_id: "<application_id>" } },
  { method: "GET", path: "/jobs/{id}", fn: "apiRetrieve", label: "Job status", body: { action: "job", job_id: "<job_id>" } },
];

const methodColor = { POST: "text-emerald-700 bg-emerald-50 border-emerald-200", GET: "text-sky-700 bg-sky-50 border-sky-200" };

export default function Playground() {
  const [params] = useSearchParams();
  const initialPath = params.get("endpoint") || "/borrowers";
  const initialMethod = params.get("method") || "POST";
  const [sel, setSel] = useState(() => ENDPOINTS.find((e) => e.path === initialPath && e.method === initialMethod) || ENDPOINTS[0]);
  const [bodyText, setBodyText] = useState(JSON.stringify(sel.body, null, 2));
  const [resp, setResp] = useState(null);
  const [status, setStatus] = useState(null);
  const [duration, setDuration] = useState(null);
  const [loading, setLoading] = useState(false);
  const [parseError, setParseError] = useState(null);

  useEffect(() => {
    setBodyText(JSON.stringify(sel.body, null, 2));
    setResp(null);
    setStatus(null);
    setDuration(null);
    setParseError(null);
  }, [sel]);

  const send = async () => {
    setLoading(true);
    setParseError(null);
    setResp(null);
    let payload;
    try {
      payload = JSON.parse(bodyText);
    } catch (e) {
      setParseError("Malformed JSON: " + e.message);
      setLoading(false);
      return;
    }
    const start = performance.now();
    try {
      const res = await base44.functions.invoke(sel.fn, withApiKey(payload));
      setResp(res.data);
      setStatus(res.status || 200);
      setDuration(Math.round(performance.now() - start));
    } catch (e) {
      setResp(e?.response?.data || { error: { message: e.message } });
      setStatus(e?.response?.status || 500);
      setDuration(Math.round(performance.now() - start));
    }
    setLoading(false);
  };

  let parsedBody = null;
  try {
    parsedBody = JSON.parse(bodyText);
  } catch {}
  const request = { method: sel.method, path: sel.path, body: parsedBody, headers: { "Idempotency-Key": "demo-request-001" } };

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-900">
      <Nav />
      <div className="border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-6">
          <h1 className="text-2xl font-semibold tracking-tight">API Playground</h1>
          <p className="text-sm text-slate-500 mt-1">Send real requests to the sandbox backend. Edit the body and execute.</p>
          {!hasApiKey() && (
            <div className="mt-3 flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
              <KeyRound className="w-4 h-4 shrink-0" />
              <span>No sandbox API key found.</span>
              <a href="/onboarding" className="font-medium underline">Run onboarding</a>
              <span className="text-amber-500">to provision one, or requests will fall back to your dashboard session.</span>
            </div>
          )}
          <div className="mt-2 flex flex-wrap gap-4 text-xs">
            <span className="flex items-center gap-1.5"><span className="text-slate-400">Sandbox API</span><code className="font-mono text-slate-700 bg-slate-100 rounded px-2 py-1">{API_BASE_URL}</code></span>
            <span className="flex items-center gap-1.5"><span className="text-slate-400">Production</span>{PRODUCTION_DEPLOYED ? <code className="font-mono text-slate-700 bg-slate-100 rounded px-2 py-1">{PRODUCTION_API_BASE_URL}</code> : <span className="text-[10px] font-medium text-amber-600 bg-amber-50 border border-amber-100 rounded-full px-2 py-0.5">Coming soon</span>}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-6 grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-4 space-y-3">
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-2">Endpoint</div>
            <div className="space-y-1 max-h-80 overflow-y-auto">
              {ENDPOINTS.map((e) => {
                const active = e.path === sel.path && e.method === sel.method;
                return (
                  <button key={e.path + e.method} onClick={() => setSel(e)} className={`w-full flex items-center gap-2 rounded-lg px-2 py-1.5 text-left transition-colors ${active ? "bg-slate-900 text-white" : "hover:bg-slate-50"}`}>
                    <span className={`text-[9px] font-bold w-10 text-center rounded border py-0.5 ${active ? "border-white/30 text-white" : methodColor[e.method]}`}>{e.method}</span>
                    <code className="text-[11px] font-mono flex-1 truncate">{e.path}</code>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="lg:col-span-8 space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-bold w-14 text-center rounded border py-0.5 ${methodColor[sel.method]}`}>{sel.method}</span>
                <code className="text-sm font-mono text-slate-700 break-all">{sel.path}</code>
              </div>
              <button onClick={send} disabled={loading} className="inline-flex items-center gap-1.5 text-sm font-medium text-white bg-slate-900 px-4 py-2 rounded-lg hover:bg-slate-800 disabled:opacity-60">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} Send request
              </button>
            </div>

            <div className="mb-2">
              <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-2">Request body (JSON)</div>
              <textarea
                value={bodyText}
                onChange={(e) => setBodyText(e.target.value)}
                spellCheck={false}
                className="w-full h-56 rounded-xl border border-slate-800 bg-slate-900 text-[12px] font-mono text-slate-200 p-3.5 focus:outline-none focus:ring-2 focus:ring-slate-900/20 resize-y"
              />
              {parseError && <p className="mt-1 text-xs text-rose-600">{parseError}</p>}
            </div>

            <div>
              <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-2">Generated code</div>
              <CodeBlock request={request} />
            </div>
          </div>

          {(status || resp) && (
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <div className="flex items-center gap-3 mb-3 flex-wrap">
                <span className={`text-[11px] font-mono font-bold px-2 py-1 rounded border ${status >= 400 ? "bg-rose-50 text-rose-700 border-rose-200" : "bg-emerald-50 text-emerald-700 border-emerald-200"}`}>{status} {statusLabel(status)}</span>
                {duration != null && <span className="text-[11px] font-mono text-slate-400">{duration} ms</span>}
                {resp?.request_id && <span className="text-[11px] font-mono text-slate-400">{resp.request_id}</span>}
              </div>
              <JsonView data={resp} maxHeight="400px" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function statusLabel(c) {
  const labels = { 200: "OK", 201: "Created", 202: "Accepted", 400: "Bad Request", 401: "Unauthorized", 403: "Forbidden", 404: "Not Found", 500: "Server Error" };
  return labels[c] || "";
}