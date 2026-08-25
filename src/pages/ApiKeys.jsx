import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { getApiKey, setApiKey } from "@/lib/apiKey";
import Nav from "@/components/layout/Nav.jsx";
import CopyButton from "@/components/sandbox/CopyButton.jsx";
import { KeyRound, Plus, Loader2, AlertTriangle, RotateCcw, Trash2, CheckCircle2 } from "lucide-react";

export default function ApiKeys() {
  const [keys, setKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [newKey, setNewKey] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [keyName, setKeyName] = useState("");
  const activeStoredKey = getApiKey();

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await base44.functions.invoke("apiKeys", { action: "list" });
      setKeys(res.data?.api_keys || []);
    } catch (e) {
      setError(e?.response?.data?.error?.message || e.message || "Failed to load keys.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const createKey = async () => {
    setBusy(true);
    setError(null);
    setNewKey(null);
    try {
      const res = await base44.functions.invoke("apiKeys", { action: "create", environment: "sandbox", name: keyName || "Sandbox key" });
      setNewKey(res.data);
      setApiKey(res.data.full_key);
      setKeyName("");
      setShowCreate(false);
      await load();
    } catch (e) {
      setError(e?.response?.data?.error?.message || e.message || "Failed to create key.");
    } finally {
      setBusy(false);
    }
  };

  const rotateKey = async (id) => {
    if (!confirm("Rotate this key? The old key will stop working immediately and a new one will be generated.")) return;
    setBusy(true);
    setError(null);
    try {
      const res = await base44.functions.invoke("apiKeys", { action: "rotate", api_key_id: id });
      setNewKey(res.data);
      setApiKey(res.data.full_key);
      await load();
    } catch (e) {
      setError(e?.response?.data?.error?.message || e.message || "Failed to rotate key.");
    } finally {
      setBusy(false);
    }
  };

  const revokeKey = async (id) => {
    if (!confirm("Revoke this key? This cannot be undone.")) return;
    setBusy(true);
    setError(null);
    try {
      await base44.functions.invoke("apiKeys", { action: "revoke", api_key_id: id });
      if (activeStoredKey && keys.find((k) => k.id === id)?.prefix === activeStoredKey.slice(0, 8)) {
        setApiKey("");
      }
      await load();
    } catch (e) {
      setError(e?.response?.data?.error?.message || e.message || "Failed to revoke key.");
    } finally {
      setBusy(false);
    }
  };

  const useKey = (fullKey) => {
    setApiKey(fullKey);
  };

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-900">
      <Nav />
      <div className="max-w-4xl mx-auto px-5 sm:px-8 py-10">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">API Keys</h1>
            <p className="text-sm text-slate-500 mt-1">Create, rotate, and revoke sandbox API keys for your organization.</p>
          </div>
          <button onClick={() => setShowCreate((s) => !s)} className="inline-flex items-center gap-1.5 text-sm font-medium text-white bg-slate-900 px-4 py-2 rounded-lg hover:bg-slate-800">
            <Plus className="w-4 h-4" /> New key
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <p className="text-sm text-rose-700">{error}</p>
          </div>
        )}

        {newKey && (
          <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-5">
            <div className="flex items-start gap-2 mb-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-900">Your new API key</p>
                <p className="text-xs text-amber-700">Copy it now — it won't be shown again. It's been saved as your active key.</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <code className="flex-1 font-mono text-sm text-slate-900 bg-white border border-slate-200 rounded px-3 py-2 break-all">{newKey.full_key}</code>
              <CopyButton text={newKey.full_key} />
            </div>
            <button onClick={() => setNewKey(null)} className="mt-3 text-xs font-medium text-amber-700 hover:underline">Dismiss</button>
          </div>
        )}

        {showCreate && (
          <div className="mb-4 rounded-xl border border-slate-200 bg-white p-5">
            <h3 className="text-sm font-semibold text-slate-900 mb-3">Create sandbox key</h3>
            <div className="flex gap-2">
              <input
                value={keyName}
                onChange={(e) => setKeyName(e.target.value)}
                placeholder="Key name (e.g. CI tests)"
                className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10"
              />
              <button onClick={createKey} disabled={busy} className="inline-flex items-center gap-1.5 text-sm font-medium text-white bg-slate-900 px-4 py-2 rounded-lg hover:bg-slate-800 disabled:opacity-60">
                {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Create
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="rounded-xl border border-slate-200 bg-white p-10 flex items-center justify-center gap-3">
            <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />
            <span className="text-sm text-slate-500">Loading keys…</span>
          </div>
        ) : keys.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 bg-white p-10 text-center">
            <KeyRound className="w-8 h-8 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-medium text-slate-600">No API keys yet.</p>
            <p className="text-xs text-slate-400 mt-1">Create your first sandbox key to start calling the API.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {keys.map((k) => {
              const isActiveStored = activeStoredKey && activeStoredKey.startsWith(k.prefix);
              return (
                <div key={k.id} className="rounded-xl border border-slate-200 bg-white p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-slate-900">{k.name}</span>
                        <span className={`text-[10px] font-mono rounded px-1.5 py-0.5 ${k.status === "active" ? "text-emerald-600 bg-emerald-50 border border-emerald-100" : "text-slate-400 bg-slate-50 border border-slate-100"}`}>{k.status}</span>
                        <span className="text-[10px] font-mono text-slate-500 bg-slate-100 rounded px-1.5 py-0.5">{k.environment}</span>
                        {isActiveStored && k.status === "active" && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-600">
                            <CheckCircle2 className="w-3 h-3" /> Active in playground
                          </span>
                        )}
                      </div>
                      <code className="text-xs font-mono text-slate-500">{k.prefix}••••••••</code>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {(k.scopes || []).map((s) => (
                          <span key={s} className="text-[10px] font-mono text-slate-500 bg-slate-50 border border-slate-100 rounded px-1.5 py-0.5">{s}</span>
                        ))}
                      </div>
                      <div className="mt-2 text-[11px] text-slate-400">
                        Created {k.created_at ? new Date(k.created_at).toLocaleDateString() : "—"}
                        {k.last_used && ` · Last used ${new Date(k.last_used).toLocaleDateString()}`}
                      </div>
                    </div>
                    {k.status === "active" && (
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button onClick={() => rotateKey(k.id)} disabled={busy} title="Rotate" className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40">
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => revokeKey(k.id)} disabled={busy} title="Revoke" className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-rose-200 text-rose-500 hover:bg-rose-50 disabled:opacity-40">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-6 rounded-xl border border-slate-200 bg-white p-4 text-[11px] text-slate-400 leading-relaxed">
          <p>API keys are hashed at rest (SHA-256). The full key is only returned at creation or rotation time — store it securely.</p>
          <p className="mt-1">Sandbox keys are isolated from production data. Use <code className="font-mono">uw_test_</code> keys for the sandbox environment.</p>
        </div>
      </div>
    </div>
  );
}