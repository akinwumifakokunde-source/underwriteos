import React from "react";
import { KeyRound, Loader2, CheckCircle2, AlertTriangle, Trash2, FlaskConical, ShieldCheck } from "lucide-react";

export default function ProviderCard({ def, form, existing, result, saving, testing, onField, onSave, onTest, onRemove }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
            <KeyRound className="w-4 h-4 text-slate-600" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900">{def.label}</h3>
            <div className="text-[11px] text-slate-400">{def.kind}</div>
          </div>
        </div>
        {existing ? (
          <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-full px-2.5 py-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Connected
          </span>
        ) : (
          <span className="text-[11px] font-medium text-slate-500 bg-slate-100 rounded-full px-2.5 py-1">Not connected</span>
        )}
      </div>

      <p className="text-xs text-slate-500 mb-4">{def.help}</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Client ID</label>
          <input
            value={form.client_id}
            onChange={(e) => onField(def.provider, "client_id", e.target.value)}
            placeholder="your-client-id"
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
          />
        </div>
        <div>
          <label className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Client secret</label>
          <input
            type="password"
            value={form.client_secret}
            onChange={(e) => onField(def.provider, "client_secret", e.target.value)}
            placeholder={existing ? `••••${existing.client_secret_masked?.slice(-4) || ""}` : "your-client-secret"}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Base URL</label>
          <input
            value={form.base_url}
            onChange={(e) => onField(def.provider, "base_url", e.target.value)}
            placeholder={def.defaultBaseUrl}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
          />
        </div>
      </div>

      {existing?.last_test_status && existing.last_test_status !== "untested" && (
        <div className={`mt-3 text-xs flex items-center gap-1.5 ${existing.last_test_status === "ok" ? "text-emerald-700" : "text-rose-700"}`}>
          {existing.last_test_status === "ok" ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
          Last test: {existing.last_test_status === "ok" ? "connected" : `failed${existing.last_test_error ? ` — ${existing.last_test_error}` : ""}`}
        </div>
      )}
      {result && (
        <div className={`mt-3 text-xs flex items-center gap-1.5 ${result.status === "ok" ? "text-emerald-700" : "text-rose-700"}`}>
          {result.status === "ok" ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
          {result.status === "ok" ? "Connection successful." : `Failed — ${result.error || "unknown error"}`}
        </div>
      )}

      <div className="mt-4 flex items-center gap-2">
        <button
          onClick={() => onSave(def)}
          disabled={saving === def.provider || !form.client_id || !form.client_secret}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-white bg-slate-900 px-3.5 py-2 rounded-lg hover:bg-slate-800 disabled:opacity-50"
        >
          {saving === def.provider ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />} Save credentials
        </button>
        {existing && (
          <>
            <button
              onClick={() => onTest(def)}
              disabled={testing === def.provider}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-700 bg-white border border-slate-200 px-3.5 py-2 rounded-lg hover:bg-slate-50 disabled:opacity-50"
            >
              {testing === def.provider ? <Loader2 className="w-4 h-4 animate-spin" /> : <FlaskConical className="w-4 h-4" />} Test
            </button>
            <button
              onClick={() => onRemove(existing.id)}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-rose-600 bg-white border border-rose-100 px-3.5 py-2 rounded-lg hover:bg-rose-50"
            >
              <Trash2 className="w-4 h-4" /> Remove
            </button>
          </>
        )}
      </div>
    </div>
  );
}