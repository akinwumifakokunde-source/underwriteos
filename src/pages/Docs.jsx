import React from "react";
import Nav from "@/components/layout/Nav.jsx";
import CodeBlock from "@/components/sandbox/CodeBlock.jsx";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const STEPS = [
  {
    n: 1,
    title: "Create a sandbox API key",
    body: "Authenticate every request with a sandbox key. Sandbox keys only access synthetic test data.",
    req: { method: "POST", path: "/api-keys", body: { name: "sandbox", scopes: ["applications:write", "decisions:read"] } },
  },
  {
    n: 2,
    title: "Create a borrower",
    body: "Create the borrower record that the application will be attached to.",
    req: { method: "POST", path: "/borrowers", body: { first_name: "Alex", last_name: "Morgan", email: "alex.morgan@example.com", employment_status: "employed", annual_income: 52000, income_currency: "GBP" } },
  },
  {
    n: 3,
    title: "Create an application",
    body: "Create a loan application linked to the borrower. Use an idempotency key to safely retry.",
    req: { method: "POST", path: "/applications", body: { borrower_id: "brw_001", loan_amount: 12000, loan_currency: "GBP", loan_term_months: 24, policy_id: "consumer-v1" }, headers: { "Idempotency-Key": "demo-request-001" } },
  },
  {
    n: 4,
    title: "Submit financial data",
    body: "Submit a credit report and bank statement. UnderwriteOS normalizes them into canonical profiles.",
    req: { method: "POST", path: "/applications/{id}/bank-statement", body: { period_start: "2026-05-01", period_end: "2026-07-31", transactions: [{ date: "2026-05-25", description: "Salary", amount: 4333, direction: "credit" }] } },
  },
  {
    n: 5,
    title: "Run underwriting",
    body: "Analyze risk signals, evaluate policy, and generate the decision in one call.",
    req: { method: "POST", path: "/applications/{id}/underwrite", body: { policy_id: "consumer-v1" } },
  },
  {
    n: 6,
    title: "Retrieve the recommendation & decision",
    body: "Fetch the AI recommendation, final decision, risk signals, and evidence graph.",
    req: { method: "GET", path: "/applications/{id}/decision", body: null },
  },
];

export default function Docs() {
  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-900">
      <Nav />
      <div className="border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-6">
          <h1 className="text-2xl font-semibold tracking-tight">5-minute Quickstart</h1>
          <p className="text-sm text-slate-500 mt-1">Run your first underwriting decision with synthetic data. No real customer information required.</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-5 sm:px-8 py-8 space-y-8">
        {STEPS.map((s) => (
          <div key={s.n} className="grid grid-cols-1 sm:grid-cols-12 gap-5">
            <div className="sm:col-span-5">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="w-7 h-7 rounded-full bg-slate-900 text-white text-xs font-semibold flex items-center justify-center">{s.n}</span>
                <h2 className="text-base font-semibold text-slate-900">{s.title}</h2>
              </div>
              <p className="text-sm text-slate-500 leading-relaxed">{s.body}</p>
            </div>
            <div className="sm:col-span-7">
              <CodeBlock request={s.req} />
            </div>
          </div>
        ))}

        <div className="rounded-xl border border-slate-900 bg-slate-900 text-white p-6 flex items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-semibold">Ready to try it live?</h3>
            <p className="text-sm text-slate-300 mt-1">Run the full pipeline in the sandbox — no code required.</p>
          </div>
          <Link to="/sandbox" className="inline-flex items-center gap-1.5 text-sm font-medium bg-white text-slate-900 px-4 py-2 rounded-lg hover:bg-slate-100">
            Open Sandbox <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}