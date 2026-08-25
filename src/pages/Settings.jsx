import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import Nav from "@/components/layout/Nav.jsx";
import { Settings as SettingsIcon, Loader2, AlertTriangle, Save, CheckCircle2 } from "lucide-react";

export default function Settings() {
  const [org, setOrg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(false);
  const [name, setName] = useState("");
  const [defaultPolicy, setDefaultPolicy] = useState("consumer-v1");
  const [currency, setCurrency] = useState("GBP");

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await base44.functions.invoke("apiSettings", { action: "get" });
      const o = res.data?.organization;
      setOrg(o);
      setName(o?.name || "");
      setDefaultPolicy(o?.settings?.default_policy_id || "consumer-v1");
      setCurrency(o?.settings?.default_currency || "GBP");
    } catch (e) {
      setError(e?.response?.data?.error?.message || e.message || "Failed to load settings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      await base44.functions.invoke("apiSettings", { action: "update", name, settings: { default_policy_id: defaultPolicy, default_currency: currency } });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      await load();
    } catch (e) {
      setError(e?.response?.data?.error?.message || e.message || "Failed to save.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-900">
      <Nav />
      <div className="max-w-2xl mx-auto px-5 sm:px-8 py-10">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
          <p className="text-sm text-slate-500 mt-1">Manage your organization profile and defaults.</p>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <p className="text-sm text-rose-700">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="rounded-xl border border-slate-200 bg-white p-10 flex items-center justify-center gap-3">
            <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />
            <span className="text-sm text-slate-500">Loading settings…</span>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-1.5"><SettingsIcon className="w-4 h-4" /> Organization</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Slug</div>
                  <code className="font-mono text-slate-700">{org?.slug}</code>
                </div>
                <div>
                  <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Plan</div>
                  <span className="text-slate-700">{org?.plan}</span>
                </div>
                <div>
                  <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Status</div>
                  <span className="text-slate-700">{org?.status}</span>
                </div>
                <div>
                  <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Created</div>
                  <span className="text-slate-700">{org?.created_at ? new Date(org.created_at).toLocaleDateString() : "—"}</span>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <h3 className="text-sm font-semibold text-slate-900 mb-3">General</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Organization name</label>
                  <input value={name} onChange={(e) => setName(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10" />
                </div>
                <div>
                  <label className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Default policy</label>
                  <input value={defaultPolicy} onChange={(e) => setDefaultPolicy(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-slate-900/10" />
                </div>
                <div>
                  <label className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Default currency</label>
                  <select value={currency} onChange={(e) => setCurrency(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10">
                    {["GBP", "USD", "EUR"].map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <button onClick={save} disabled={saving} className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-white bg-slate-900 px-4 py-2 rounded-lg hover:bg-slate-800 disabled:opacity-50">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />} {saved ? "Saved" : "Save changes"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}