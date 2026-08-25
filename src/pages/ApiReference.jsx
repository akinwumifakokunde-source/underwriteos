import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import Nav from "@/components/layout/Nav.jsx";
import { Search, ChevronDown, ChevronRight, Play } from "lucide-react";
import CodeBlock from "@/components/sandbox/CodeBlock.jsx";
import JsonView from "@/components/sandbox/JsonView.jsx";
import { API_BASE_URL, PRODUCTION_DEPLOYED, PRODUCTION_API_BASE_URL } from "@/lib/apiConfig";

const ENDPOINTS = [
  { group: "Authentication", items: [
    { method: "POST", path: "/api-keys", desc: "Create a sandbox API key", req: { name: "Production deploy key", scopes: ["applications:write", "decisions:read"] }, res: { key_id: "key_001", prefix: "uw_test_", status: "active" } },
  ]},
  { group: "Borrowers", items: [
    { method: "POST", path: "/borrowers", desc: "Create a borrower", req: { first_name: "Alex", last_name: "Morgan", email: "alex.morgan@example.com", employment_status: "employed", annual_income: 52000, income_currency: "GBP" }, res: { borrower_id: "brw_001", created_date: "2026-08-25T18:00:00Z" } },
    { method: "GET", path: "/borrowers/{id}", desc: "Retrieve a borrower", req: null, res: { borrower_id: "brw_001", first_name: "Alex", last_name: "Morgan", employment_status: "employed" } },
  ]},
  { group: "Applications", items: [
    { method: "POST", path: "/applications", desc: "Create a loan application", req: { borrower_id: "brw_001", loan_amount: 12000, loan_currency: "GBP", loan_term_months: 24, product_type: "personal_loan", policy_id: "consumer-v1" }, res: { application_id: "app_001", application_number: "APP-001", status: "draft", environment: "sandbox" } },
    { method: "GET", path: "/applications/{id}", desc: "Retrieve an application", req: null, res: { application_id: "app_001", status: "completed", decision: "REVIEW", risk_score: 0.42 } },
  ]},
  { group: "Data ingestion", items: [
    { method: "POST", path: "/applications/{id}/credit-report", desc: "Auto-pull a credit report from a bureau (Experian) or submit manually", req: { provider: "experian", mode: "auto", search_reference: "<borrower_id_or_reference>" }, res: { credit_report_id: "cr_001", provider: "experian", fetch_mode: "auto", credit_profile: { credit_score: 545, score_band: "poor", provider: "experian", credit_utilisation: 0.05 } } },
    { method: "POST", path: "/applications/{id}/bank-statement", desc: "Auto-pull transactions via Open Banking (TrueLayer) or submit manually", req: { provider: "truelayer", mode: "auto", consent_reference: "<open_banking_consent_token>" }, res: { bank_statement_id: "bs_001", open_banking_provider: "truelayer", fetch_mode: "auto", transaction_count: 12, financial_profile: { income: { monthly: 4108 }, affordability: { debt_to_income: 0.05 } } } },
  ]},
  { group: "Profiles", items: [
    { method: "GET", path: "/applications/{id}/financial-profile", desc: "Retrieve canonical financial profile", req: null, res: { income: { monthly: 4333 }, affordability: { debt_to_income: 0.16 }, financial_behaviour: { savings_pattern: "consistent_saver" } } },
    { method: "GET", path: "/applications/{id}/credit-profile", desc: "Retrieve normalized credit profile", req: null, res: { credit_score: 742, score_band: "excellent", provider: "mock", credit_utilisation: 0.28 } },
  ]},
  { group: "Risk intelligence", items: [
    { method: "GET", path: "/applications/{id}/risk", desc: "Retrieve risk signals", req: null, res: { signals: [{ signal: "credit_score", value: 742, flag: "positive", confidence: 0.95 }] } },
    { method: "GET", path: "/applications/{id}/evidence", desc: "Retrieve evidence graph", req: null, res: { evidence: [{ signal: "credit_score", source_type: "credit_report", calculation_method: "direct_extract", confidence: 0.95 }] } },
  ]},
  { group: "Underwriting", items: [
    { method: "POST", path: "/applications/{id}/analyze", desc: "Start risk analysis (async job)", req: null, res: { job_id: "job_001", status: "processing" } },
    { method: "POST", path: "/applications/{id}/underwrite", desc: "Run underwriting evaluation", req: { policy_id: "consumer-v1" }, res: { recommendation: "REVIEW", decision: "REVIEW", risk_score: 0.42, decision_source: "policy_engine" } },
  ]},
  { group: "Decisions", items: [
    { method: "GET", path: "/applications/{id}/recommendation", desc: "Retrieve AI recommendation", req: null, res: { recommendation: "REVIEW", confidence: 0.91, ai_memo: "Applicant demonstrates stable income…" } },
    { method: "GET", path: "/applications/{id}/decision", desc: "Retrieve final decision", req: null, res: { decision: "REVIEW", decision_source: "policy_engine", policy_id: "consumer-v1", policy_version: "1" } },
  ]},
  { group: "Results & providers", items: [
    { method: "GET", path: "/applications/{id}/summary", desc: "Full summary in one call (profiles, signals, evidence, recommendation, decision, audit)", req: null, res: { application_id: "app_001", application: { status: "completed", decision: "DECLINE", risk_score: 0.38 }, financial_profile: { income: { monthly: 4108 } }, credit_profile: { credit_score: 545, provider: "experian" }, risk_signals: [], evidence: [], recommendation: { recommendation: "APPROVE", confidence: 0.9 }, decision: { decision: "DECLINE", decision_source: "policy_engine" } } },
    { method: "GET", path: "/applications/{id}/policy", desc: "Retrieve the evaluated policy and rule outcomes", req: null, res: { application_id: "app_001", policy: null, policy_outcome: { policy_id: "consumer-v1", policy_version: "1", evaluated_rules: [{ rule_id: "CR-DEF", field: "defaults", operator: ">", threshold: 0, input: 1, result: "FAIL", decision: "DECLINE", reason: "Active defaults on credit file" }] } } },
    { method: "GET", path: "/providers", desc: "List available credit bureaus and Open Banking providers with setup examples", req: null, res: { credit_bureaus: [{ name: "experian", mode: "auto", requires: "search_reference" }], open_banking: [{ name: "truelayer", mode: "auto", requires: "consent_reference" }], setup: { credit_report: { endpoint: "/v1/applications/{application_id}/credit-report", example: { provider: "experian", mode: "auto", search_reference: "<borrower_id>" } } } } },
    { method: "GET", path: "/webhooks", desc: "List registered webhooks", req: null, res: { webhooks: [{ id: "wh_001", url: "https://example.com/hooks", events: ["underwriting.completed"], status: "active" }] } },
  ]},
  { group: "Jobs", items: [
    { method: "GET", path: "/jobs/{id}", desc: "Retrieve job status", req: null, res: { job_id: "job_001", status: "completed", type: "analyze" } },
  ]},
  { group: "Webhooks", items: [
    { method: "POST", path: "/webhooks", desc: "Register a webhook endpoint", req: { url: "https://example.com/hooks", events: ["underwriting.completed", "decision.created"] }, res: { webhook_id: "wh_001", status: "active" } },
  ]},
];

const methodColor = { POST: "text-emerald-700 bg-emerald-50 border-emerald-200", GET: "text-sky-700 bg-sky-50 border-sky-200" };

export default function ApiReference() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [open, setOpen] = useState({});

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return ENDPOINTS.map((g) => ({
      ...g,
      items: g.items.filter((e) => (filter === "ALL" || e.method === filter) && (!q || e.path.toLowerCase().includes(q) || e.desc.toLowerCase().includes(q) || g.group.toLowerCase().includes(q))),
    })).filter((g) => g.items.length > 0);
  }, [query, filter]);

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-900">
      <Nav />
      <div className="border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-6">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">API Reference</h1>
              <p className="text-sm text-slate-500 mt-1">Versioned REST endpoints. Paths are relative to the base URL.</p>
            </div>
            <div className="flex flex-col gap-1 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-slate-400">Sandbox API</span>
                <code className="font-mono text-slate-700 bg-slate-100 rounded px-2 py-1">{API_BASE_URL}</code>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-400">Production API</span>
                {PRODUCTION_DEPLOYED ? (
                  <code className="font-mono text-slate-700 bg-slate-100 rounded px-2 py-1">{PRODUCTION_API_BASE_URL}</code>
                ) : (
                  <span className="text-[10px] font-medium text-amber-600 bg-amber-50 border border-amber-100 rounded-full px-2 py-0.5">Coming soon</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 xl:col-span-3">
          <div className="sticky top-20 space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search endpoints…"
                className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
              />
            </div>
            <div className="flex gap-1.5">
              {["ALL", "GET", "POST"].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${filter === f ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 text-slate-600 hover:bg-white"}`}
                >
                  {f}
                </button>
              ))}
            </div>
            <div className="space-y-3">
              {filtered.map((g) => (
                <div key={g.group}>
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">{g.group}</div>
                  <div className="space-y-0.5">
                    {g.items.map((e) => (
                      <a key={e.path + e.method} href={`#${e.path.replace(/[{}\/]/g, "-")}`} className="flex items-center gap-2 rounded px-1.5 py-1 hover:bg-white">
                        <span className={`text-[9px] font-bold w-9 text-center rounded border ${methodColor[e.method]}`}>{e.method}</span>
                        <code className="text-[11px] font-mono text-slate-600 truncate">{e.path}</code>
                      </a>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-8 xl:col-span-9 space-y-6">
          {filtered.map((g) => (
            <div key={g.group}>
              <h2 className="text-sm font-semibold text-slate-900 mb-2">{g.group}</h2>
              <div className="space-y-2">
                {g.items.map((e) => {
                  const key = e.path + e.method;
                  const isOpen = open[key];
                  return (
                    <div key={key} id={e.path.replace(/[{}\/]/g, "-")} className="rounded-xl border border-slate-200 bg-white overflow-hidden">
                      <button onClick={() => setOpen((o) => ({ ...o, [key]: !o[key] }))} className="w-full flex items-center gap-3 px-4 py-3 text-left">
                        {isOpen ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                        <span className={`text-[10px] font-bold w-12 text-center rounded border py-0.5 ${methodColor[e.method]}`}>{e.method}</span>
                        <code className="text-sm font-mono text-slate-700 flex-1 break-all">{e.path}</code>
                        <span className="text-xs text-slate-400 hidden sm:block">{e.desc}</span>
                      </button>
                      {isOpen && (
                        <div className="px-4 pb-4 space-y-4">
                          <p className="text-sm text-slate-600">{e.desc}</p>
                          <div className="flex justify-end">
                            <Link
                              to={`/playground?endpoint=${encodeURIComponent(e.path)}&method=${e.method}`}
                              className="inline-flex items-center gap-1.5 text-xs font-medium text-white bg-slate-900 px-3 py-1.5 rounded-lg hover:bg-slate-800"
                            >
                              <Play className="w-3 h-3" /> Try it
                            </Link>
                          </div>
                          <div>
                            <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-2">Example request</div>
                            <CodeBlock request={{ method: e.method, path: e.path, body: e.req, headers: { "Idempotency-Key": "demo-request-001" } }} />
                          </div>
                          <div>
                            <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-2">Example response</div>
                            <JsonView data={e.res} maxHeight="240px" />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
          <div className="rounded-xl border border-slate-200 bg-white p-4 text-[11px] text-slate-400">
            All endpoints require <code className="font-mono text-slate-500">Authorization: Bearer &lt;api_key&gt;</code>. Use an <code className="font-mono text-slate-500">Idempotency-Key</code> header on POST requests to safely retry without creating duplicates. Every response includes a <code className="font-mono text-slate-500">request_id</code>.
          </div>
        </div>
      </div>
    </div>
  );
}