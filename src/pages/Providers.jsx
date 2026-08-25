import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { withApiKey } from "@/lib/apiKey";
import Nav from "@/components/layout/Nav.jsx";
import { KeyRound, Building2, Loader2, CheckCircle2, AlertTriangle, Trash2, FlaskConical, ShieldCheck, ArrowRight } from "lucide-react";

const PROVIDER_DEFS = [
  {
    provider: "experian",
    provider_type: "credit_bureau",
    label: "Experian",
    kind: "Credit bureau",
    defaultBaseUrl: "https://api-sandbox.experian.com",
    help: "Enter your Experian sandbox API credentials. Used to auto-pull credit reports.",
  },
  {
    provider: "truelayer",
    provider_type: "open_banking",
    label: "TrueLayer",
    kind: "Open banking",
    defaultBaseUrl: "https://api.truelayer-sandbox.com",
    help: "Enter your TrueLayer sandbox client credentials. Used to auto-pull bank transactions.",
  },
];

export default function Providers() {
  const [loading, setLoading] = useState(true);
  const [creds, setCreds] = useState([]);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(null); // provider being saved
  const [testing, setTesting] = useState(null); // provider being tested
  const [forms, setForms] = useState(() => Object.fromEntries(PROVIDER_DEFS.map((p) => [p.provider, { client_id: "", client_secret: "", base_url: p.defaultBaseUrl }])));
  const [testResult, setTestResult] = useState({});

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await base44.functions.invoke("apiProviders", withApiKey({ action: "list" }));
      setCreds(res.data?.credentials || []);
      // Pre-fill forms with existing client_id / base_url where present.
      const next = { ...forms };
      for (const c of res.data?.credentials || []) {
        if (next[c.provider]) next[c.provider] = { ...next[c.provider], client_id: c.client_id || "", base_url: c.base_url || next[c.provider].base_url };
      }
      setForms(next);
    } catch (e) {
      setError(e?.response?.data?.error?.message || e.message || "Failed to load credentials.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  const existingFor = (provider) => creds.find((c) => c.provider === provider);

  const save = async (def) => {
    setSaving(def.provider);
    setError(null);
    try {
      const form = forms[def.provider];
      await base44.functions.invoke("apiProviders", withApiKey({
        action: "save",
        provider: def.provider,
        provider_type: def.provider_type,
        client_id: form.client_id,
        client_secret: form.client_secret,
        base_url: form.base_url
      }));
      await load();
    } catch (e) {
      setError(e?.response?.data?.error?.message || e.message || "Save failed.");
    } finally {
      setSaving(null);
    }
  };

  const remove = async (id) => {
    if (!confirm("Remove these credentials?")) return;
    try {
      await base44.functions.invoke("apiProviders", withApiKey({ action: "delete", id }));
      await load();
    } catch (e) {
      setError(e?.response?.data?.error?.message || e.message || "Delete failed.");
    }
  };

  const test = async (def) => {
    setTesting(def.provider);
    setTestResult((t) => ({ ...t, [def.provider]: null }));
    try {
      const res = await base44.functions.invoke("apiProviders", withApiKey({ action: "test", provider: def.provider }));
      setTestResult((t) => ({ ...t, [def.provider]: res.data }));
      await load();
    } catch (e) {
      setTestResult((t) => ({ ...t, [def.provider]: { status: "failed", error: e?.response?.data?.error?.message || e.message } }));
    } finally {
      setTesting(null);
    }
  };

  const setField = (provider, field, value) => setForms((f) => ({ ...f, [provider]: { ...f[provider], [field]: value } }));

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-900">
      <Nav />
      <div className="max-w-3xl mx-auto px-5 sm:px-8 py-10">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-slate-500 mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Provider setup
          </div>
          <h1 className="text-3xl font-semibold tracking-tight">Connect your data providers</h1>
          <p className="mt-2 text-slate-500">
            Bring your own Experian and TrueLayer credentials. They are stored to your organization and used for live
            data pulls. Until you add them, the sandbox uses deterministic mock data so you can explore the full flow.
          </p>
        </div>

        {error && (
          <div className="mb-5 rounded-xl border border-rose-200 bg-rose-50 p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <p className="text-sm text-rose-700">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="rounded-xl border border-slate-200 bg-white p-10 flex items-center justify-center gap-3">
            <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />
            <span className="text-sm text-slate-500">Loading provider settings…</span>
          </div>
        ) : (
          <div className="space-y-5">
            {PROVIDER_DEFS.map((def) => {
              const ex = existingFor(def.provider);
              const form = forms[def.provider];
              const result = testResult[def.provider];
              return (
                <div key={def.provider} className="rounded-xl border border-slate-200 bg-white p-5">
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
                    {ex ? (
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-full px-2.5 py-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Connected · {ex.environment}
                      </span>
                    ) : (
                      <span className="text-[11px] font-medium text-slate-400 bg-slate-50 border border-slate-100 rounded-full px-2.5 py-1">Not connected</span>
                    )}
                  </div>

                  <p className="text-xs text-slate-500 mb-4">{def.help}</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Client ID</label>
                      <input
                        value={form.client_id}
                        onChange={(e) => setField(def.provider, "client_id", e.target.value)}
                        placeholder="your-client-id"
                        className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Client secret</label>
                      <input
                        type="password"
                        value={form.client_secret}
                        onChange={(e) => setField(def.provider, "client_secret", e.target.value)}
                        placeholder={ex ? `••••${ex.client_secret_masked?.slice(-4) || ""}` : "your-client-secret"}
                        className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Base URL</label>
                      <input
                        value={form.base_url}
                        onChange={(e) => setField(def.provider, "base_url", e.target.value)}
                        placeholder={def.defaultBaseUrl}
                        className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
                      />
                    </div>
                  </div>

                  {ex?.last_test_status && ex.last_test_status !== "untested" && (
                    <div className={`mt-3 text-xs flex items-center gap-1.5 ${ex.last_test_status === "ok" ? "text-emerald-700" : "text-rose-700"}`}>
                      {ex.last_test_status === "ok" ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                      Last test: {ex.last_test_status === "ok" ? "connected" : `failed${ex.last_test_error ? ` — ${ex.last_test_error}` : ""}`}
                    </div>
                  )}
                  {result && (
                    <div className={`mt-3 text-xs flex items-center gap-1.5 ${result.status === "ok" ? "text-emerald-700" : "text-rose-700"}`}>
                      {result.status === "ok" ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                      {result.status === "ok" ? "Connection successful." : `Failed — ${result.error || "unknown error"}`}
                    </div>
                  )}

                  <div className="mt-4 flex items-center gap-2">
                    <button onClick={() => save(def)} disabled={saving === def.provider || !form.client_id || !form.client_secret}
                      className="inline-flex items-center gap-1.5 text-sm font-medium text-white bg-slate-900 px-3.5 py-2 rounded-lg hover:bg-slate-800 disabled:opacity-50">
                      {saving === def.provider ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />} Save credentials
                    </button>
                    {ex && (
                      <>
                        <button onClick={() => test(def)} disabled={testing === def.provider}
                          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-700 bg-white border border-slate-200 px-3.5 py-2 rounded-lg hover:bg-slate-50 disabled:opacity-50">
                          {testing === def.provider ? <Loader2 className="w-4 h-4 animate-spin" /> : <FlaskConical className="w-4 h-4" />} Test connection
                        </button>
                        <button onClick={() => remove(ex.id)}
                          className="inline-flex items-center gap-1.5 text-sm font-medium text-rose-600 bg-white border border-rose-100 px-3.5 py-2 rounded-lg hover:bg-rose-50">
                          <Trash2 className="w-4 h-4" /> Remove
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}

            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <h3 className="text-sm font-semibold text-slate-900 mb-3">Next steps</h3>
              <div className="space-y-2">
                <Link to="/sandbox" className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3 hover:bg-slate-50">
                  <span className="text-sm font-medium text-slate-900">Run the sandbox flow with live data</span>
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                </Link>
                <Link to="/playground" className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3 hover:bg-slate-50">
                  <span className="text-sm font-medium text-slate-900">Try the credit-report / bank-statement endpoints</span>
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}