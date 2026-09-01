import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import Nav from "@/components/layout/Nav.jsx";
import { Search, ChevronDown, ChevronRight, Play } from "lucide-react";
import CodeBlock from "@/components/sandbox/CodeBlock.jsx";
import JsonView from "@/components/sandbox/JsonView.jsx";
import { API_BASE_URL, PRODUCTION_DEPLOYED, PRODUCTION_API_BASE_URL } from "@/lib/apiConfig";

const ENDPOINTS = [
  { group: "Authentication", items: [
    { method: "POST", path: "/api-keys", desc: "Create an API key (sandbox uw_test_ or production uw_live_). Keys are environment-scoped and never cross over.", req: { name: "Production deploy key", environment: "production", scopes: ["applications:write", "decisions:read"] }, res: { key_id: "key_001", prefix: "uw_live_", environment: "production", status: "active" } },
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
    { method: "POST", path: "/applications/{id}/credit-report", desc: "Auto-pull a credit report from any connected bureau, or submit manually. Uses your stored credentials for a live pull; falls back to synthetic data when none are configured.", req: { provider: "experian", mode: "auto", search_reference: "<borrower_id_or_reference>" }, res: { credit_report_id: "cr_001", provider: "experian", fetch_mode: "auto", data_source: "live", credit_profile: { credit_score: 545, score_band: "poor", provider: "experian", credit_utilisation: 0.05 } } },
    { method: "POST", path: "/applications/{id}/bank-statement", desc: "Auto-pull transactions via any connected Open Banking provider, or submit manually. Uses your stored credentials for a live pull; falls back to synthetic data when none are configured.", req: { provider: "truelayer", mode: "auto", consent_reference: "<open_banking_consent_token>" }, res: { bank_statement_id: "bs_001", open_banking_provider: "truelayer", fetch_mode: "auto", data_source: "live", transaction_count: 12, financial_profile: { income: { monthly: 4108 }, affordability: { debt_to_income: 0.05 } } } },
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
    { method: "POST", path: "/providers", desc: "Manage provider credentials per environment (action: list | save | delete | test). Credentials are environment-scoped — sandbox keys use sandbox credentials, live keys use production credentials.", req: { action: "save", provider: "experian", provider_type: "credit_bureau", env: "production", client_id: "your_client_id", client_secret: "your_client_secret", base_url: "https://api.experian.com" }, res: { credential: { id: "cred_001", provider: "experian", provider_type: "credit_bureau", environment: "production", status: "active" } } },
    { method: "GET", path: "/webhooks", desc: "List registered webhooks", req: null, res: { webhooks: [{ id: "wh_001", url: "https://example.com/hooks", events: ["underwriting.completed"], status: "active" }] } },
  ]},
  { group: "Jobs", items: [
    { method: "GET", path: "/jobs/{id}", desc: "Retrieve job status", req: null, res: { job_id: "job_001", status: "completed", type: "analyze" } },
  ]},
  { group: "Webhooks", items: [
    { method: "POST", path: "/webhooks", desc: "Register a webhook endpoint", req: { url: "https://example.com/hooks", events: ["underwriting.completed", "decision.created"] }, res: { webhook_id: "wh_001", status: "active" } },
  ]},
  { group: "Forms", items: [
    { method: "POST", path: "/forms", desc: "Create a white-label borrower application form. Generates a unique public slug for the share link /apply/:slug.", req: { action: "create", _api_key: "uw_live_...", name: "UK Personal Loan Form", title: "Apply with Acme Lending", market: "GB", borrower_type: "salaried", product_type: "personal_loan", policy_id: "consumer-v1", fields: [{ key: "first_name", label: "First name", enabled: true, required: true }], document_requirements: [{ type: "bank_statement", label: "Bank statement", required: true, enabled: true }] }, res: { form_id: "frm_abc123", slug: "frmabc123", status: "active", submissions_count: 0 } },
    { method: "POST", path: "/forms/list", desc: "List all application forms for the organization.", req: { action: "list", _api_key: "uw_live_..." }, res: { forms: [{ id: "frm_abc123", name: "UK Personal Loan Form", slug: "frmabc123", status: "active", submissions_count: 12 }] } },
    { method: "POST", path: "/forms/get", desc: "Retrieve a single form by id.", req: { action: "get", form_id: "frm_abc123", _api_key: "uw_live_..." }, res: { form: { id: "frm_abc123", name: "UK Personal Loan Form", status: "active", fields: [], document_requirements: [] } } },
    { method: "POST", path: "/forms/update", desc: "Update form fields, styling, market, or status (active | paused | archived).", req: { action: "update", form_id: "frm_abc123", status: "paused", _api_key: "uw_live_..." }, res: { form: { id: "frm_abc123", status: "paused" } } },
    { method: "POST", path: "/forms/delete", desc: "Delete a form.", req: { action: "delete", form_id: "frm_abc123", _api_key: "uw_live_..." }, res: { deleted: true } },
    { method: "POST", path: "/forms/submissions", desc: "List submissions for a form, with borrower details joined.", req: { action: "submissions", form_id: "frm_abc123", _api_key: "uw_live_..." }, res: { form: { id: "frm_abc123" }, submissions: [{ application_id: "app_001", application_number: "APP-001", status: "data_collection", decision: "null", loan_amount: 12000, borrower: { first_name: "Alex", last_name: "Morgan" } }] } },
    { method: "POST", path: "/forms/public/{slug}", desc: "Public: fetch a form's white-label config by slug. No auth — org resolved from the slug.", req: { action: "public_get", slug: "frmabc123" }, res: { form: { slug: "frmabc123", title: "Apply with Acme Lending", market: "GB", kyc: [{ key: "national_insurance_number", label: "National Insurance Number (NI)" }], fields: [], document_requirements: [] } } },
    { method: "POST", path: "/forms/public/{slug}/submit", desc: "Public: submit a borrower application. Creates a Borrower + Application (data_collection) + uploaded Documents. No auth required.", req: { action: "public_submit", slug: "frmabc123", values: { first_name: "Alex", last_name: "Morgan", email: "alex@example.com", national_insurance_number: "QQ123456C", loan_amount: 12000, loan_term_months: 24, documents: [{ type: "bank_statement", file_url: "https://...", file_name: "statement.pdf" }] } }, res: { application_id: "app_001", application_number: "APP-001", thank_you_message: "Thank you. Your application has been received." } },
  ]},
  { group: "Outcomes & monitoring", items: [
    { method: "POST", path: "/outcomes", desc: "Record the observed outcome of an underwritten loan (active | repaid | late | defaulted). Snapshots predicted PD from the latest decision for calibration.", req: { action: "record", application_id: "app_001", status: "repaid", days_past_due: 0, _api_key: "uw_live_..." }, res: { outcome: { application_id: "app_001", status: "repaid", bad: false, days_past_due: 0, predicted_pd: 0.12, decision: "APPROVE" } } },
    { method: "POST", path: "/outcomes/list", desc: "List recorded loan outcomes for the organization.", req: { action: "list", _api_key: "uw_live_..." }, res: { outcomes: [{ application_id: "app_001", status: "repaid", bad: false, predicted_pd: 0.12 }] } },
    { method: "POST", path: "/outcomes/monitor", desc: "Compute model calibration: predicted-PD buckets vs actual default rate, plus portfolio summary (approval rate, observed default rate).", req: { action: "monitor", _api_key: "uw_live_..." }, res: { summary: { applications: 120, decided: 98, approved: 71, approval_rate: 0.72, observed_outcomes: 45, observed_default_rate: 0.09, mean_predicted_pd: 0.11 }, calibration: [{ bucket: "0–10%", count: 20, actual_default_rate: 0.05, avg_predicted_pd: 0.07 }] } },
  ]},
  { group: "Credit portability", items: [
    { method: "POST", path: "/portable/attest", desc: "Produce an attested portable credit bundle from an application's normalized CreditProfile, with a SHA-256 attestation hash. Read-only.", req: { action: "attest", application_id: "app_001", _api_key: "uw_live_..." }, res: { portable_reference: "app_001", origin: { application_id: "app_001", provider: "experian", environment: "production" }, credit_profile: { credit_score: 742, score_band: "excellent", provider: "experian" }, attestation_hash: "a3f0c1…e1", attested_at: "2026-09-01T12:00:00Z", signals_count: 6, evidence_count: 6 } },
    { method: "POST", path: "/portable/import", desc: "Import an attested credit profile from an origin application into a target application in a new region. Creates an attested CreditReport + CreditProfile on the target with full provenance.", req: { action: "import", application_id: "app_002", portable_reference: "app_001", _api_key: "uw_live_..." }, res: { credit_report_id: "cr_002", credit_profile: { credit_score: 742, provider: "experian" }, portable: true, origin_application_id: "app_001", origin_provider: "experian", attestation_hash: "a3f0c1…e1" } },
  ]},
  { group: "Billing & credits", items: [
    { method: "POST", path: "/billing", desc: "Get credit balance, active subscription, available packs/plans, and recent transactions. New orgs receive a 1,000-credit trial grant on signup.", req: { action: "balance", _api_key: "uw_live_..." }, res: { balance: 18500, currency: "USD", subscription_status: "active", subscription_plan_id: "plan_growth", subscription: { status: "active", plan_id: "plan_growth", current_period_end: "2026-10-01T00:00:00Z" }, packs: [{ id: "pack_starter", credits: 10000, amount: 2000 }], plans: [{ id: "plan_growth", name: "Growth", amount: 39900, credits: 100000 }], transactions: [{ type: "purchase", credits: 10000, description: "Credit purchase — Starter" }] } },
    { method: "POST", path: "/billing/checkout", desc: "Create a Stripe Checkout session for a one-time credit pack. Supports local-currency pricing for African markets.", req: { action: "checkout", pack_id: "pack_growth", market: "NG", _api_key: "uw_live_..." }, res: { url: "https://checkout.stripe.com/c/cs_live_...", pack_id: "pack_growth" } },
    { method: "POST", path: "/billing/record_purchase", desc: "Record a completed checkout session and credit the pack's credits. Idempotent on the checkout session id.", req: { action: "record_purchase", pack_id: "pack_growth", transaction_ref: "cs_live_...", _api_key: "uw_live_..." }, res: { credited: true, credits: 50000, balance: 68500 } },
    { method: "POST", path: "/billing/subscription_checkout", desc: "Create a Stripe Checkout session for a monthly subscription plan. Supports local-currency recurring pricing for African markets.", req: { action: "subscription_checkout", plan_id: "plan_growth", market: "NG", _api_key: "uw_live_..." }, res: { url: "https://checkout.stripe.com/c/cs_live_sub_...", plan_id: "plan_growth" } },
    { method: "POST", path: "/billing/subscription_status", desc: "Retrieve the active subscription's status, plan, and current period end.", req: { action: "subscription_status", _api_key: "uw_live_..." }, res: { status: "active", plan_id: "plan_growth", plan_name: "Growth", current_period_end: "2026-10-01T00:00:00Z", cancel_at_period_end: false } },
    { method: "POST", path: "/billing/subscription_cancel", desc: "Cancel the active subscription at period end.", req: { action: "subscription_cancel", _api_key: "uw_live_..." }, res: { cancelled: true, status: "active", cancel_at_period_end: true } },
    { method: "POST", path: "/billing/charge_export", desc: "Charge 5 credits for a decision report export (PDF / CSV / Word).", req: { action: "charge_export", application_id: "app_001", format: "pdf", _api_key: "uw_live_..." }, res: { charged: 5, balance: 18495 } },
  ]},
  { group: "Usage & audit", items: [
    { method: "POST", path: "/usage/overview", desc: "30-day activity overview: daily event counts, top endpoints, top events.", req: { action: "overview", _api_key: "uw_live_..." }, res: { total: 320, daily: [{ date: "2026-09-01", count: 12 }], by_endpoint: [{ endpoint: "POST /v1/applications", count: 45 }], by_event: [{ event: "application.created", count: 45 }] } },
    { method: "POST", path: "/usage/logs", desc: "Recent audit event log (most recent first).", req: { action: "logs", limit: 50, _api_key: "uw_live_..." }, res: { logs: [{ id: "evt_001", event: "application.created", endpoint: "POST /v1/applications", actor: "uw_live_…", actor_type: "api_key", created_at: "2026-09-01T12:00:00Z" }] } },
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
                        <code className="text-sm font-mono text-slate-700 whitespace-nowrap shrink-0">{e.path}</code>
                        <span className="text-xs text-slate-400 hidden sm:block flex-1 min-w-0 truncate text-right">{e.desc}</span>
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