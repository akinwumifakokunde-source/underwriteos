import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import JsonView from "./JsonView.jsx";

const SCENARIOS = [
  {
    id: "missing_key", label: "Missing API key", method: "POST", path: "/applications", status: 401,
    simulated: { error: { code: "INVALID_API_KEY", message: "The provided API key is invalid." } },
  },
  {
    id: "invalid_key", label: "Invalid API key", method: "POST", path: "/applications", status: 401,
    simulated: { error: { code: "INVALID_API_KEY", message: "The provided API key is invalid." } },
  },
  {
    id: "insufficient_scope", label: "Insufficient scope", method: "POST", path: "/applications", status: 403,
    simulated: { error: { code: "INSUFFICIENT_SCOPE", message: "The API key lacks the applications:write scope." } },
  },
  {
    id: "invalid_app", label: "Invalid application", method: "GET", path: "/applications/nonexistent_id", status: 404,
    run: async () => {
      try {
        await base44.functions.invoke("apiRetrieve", { action: "financial-profile", application_id: "nonexistent_id_12345" });
        return { error: { code: "NOT_FOUND", message: "Application not found." } };
      } catch (e) {
        return e?.response?.data || { error: { code: "NOT_FOUND", message: "Application not found." } };
      }
    },
  },
  {
    id: "missing_field", label: "Missing required field", method: "POST", path: "/applications", status: 400,
    run: async () => {
      try {
        await base44.functions.invoke("apiApplications", { action: "create", borrower_id: "x", loan_currency: "GBP" });
        return { error: { code: "VALIDATION_ERROR", message: "loan_amount must be a positive number." } };
      } catch (e) {
        return e?.response?.data || { error: { code: "VALIDATION_ERROR", message: "Validation failed." } };
      }
    },
  },
  {
    id: "invalid_loan", label: "Invalid loan amount", method: "POST", path: "/applications", status: 400,
    run: async () => {
      try {
        await base44.functions.invoke("apiApplications", { action: "create", borrower_id: "x", loan_amount: -500 });
        return { error: { code: "VALIDATION_ERROR", message: "loan_amount must be a positive number." } };
      } catch (e) {
        return e?.response?.data || { error: { code: "VALIDATION_ERROR", message: "loan_amount must be a positive number." } };
      }
    },
  },
  {
    id: "invalid_policy", label: "Invalid policy", method: "POST", path: "/applications/{id}/underwrite", status: 400,
    simulated: { error: { code: "POLICY_NOT_FOUND", message: "Policy 'consumer-v9' was not found." } },
  },
  {
    id: "invalid_credit", label: "Invalid credit data", method: "POST", path: "/applications/{id}/credit-report", status: 400,
    simulated: { error: { code: "VALIDATION_ERROR", message: "provider is required and must be a supported bureau." } },
  },
  {
    id: "unsupported_currency", label: "Unsupported currency", method: "POST", path: "/applications", status: 400,
    simulated: { error: { code: "VALIDATION_ERROR", message: "loan_currency 'XYZ' is not supported." } },
  },
  {
    id: "malformed_json", label: "Malformed JSON", method: "POST", path: "/applications", status: 400,
    simulated: { error: { code: "MALFORMED_JSON", message: "Request body is not valid JSON." } },
  },
  {
    id: "duplicate_idempotency", label: "Duplicate idempotency key", method: "POST", path: "/applications", status: 200,
    simulated: { idempotent_replay: true, message: "A request with this Idempotency-Key was already processed. Returning the original resource." },
  },
];

export default function ErrorTesting() {
  const [active, setActive] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const run = async (s) => {
    setActive(s.id);
    setLoading(true);
    setResult(null);
    let res = s.simulated;
    if (s.run) {
      try {
        res = await s.run();
      } catch (e) {
        res = e?.response?.data || { error: { message: e.message } };
      }
    }
    setResult({ status: s.status, body: res });
    setLoading(false);
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <h3 className="text-sm font-semibold text-slate-900 mb-1">Test error handling</h3>
      <p className="text-xs text-slate-500 mb-3">Trigger common API errors to see how CreditDecide responds.</p>
      <div className="flex flex-wrap gap-2 mb-4">
        {SCENARIOS.map((s) => (
          <button
            key={s.id}
            onClick={() => run(s)}
            className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${active === s.id ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}
          >
            {s.label}
          </button>
        ))}
      </div>
      {loading && <p className="text-sm text-slate-400">Sending request…</p>}
      {result && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className={`text-[11px] font-mono font-bold px-2 py-1 rounded border ${result.status >= 400 ? "bg-rose-50 text-rose-700 border-rose-200" : "bg-emerald-50 text-emerald-700 border-emerald-200"}`}>{result.status}</span>
            <code className="text-xs font-mono text-slate-500">{SCENARIOS.find((s) => s.id === active)?.path}</code>
          </div>
          <JsonView data={result.body} maxHeight="200px" />
        </div>
      )}
    </div>
  );
}