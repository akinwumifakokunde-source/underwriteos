import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import Nav from "@/components/layout/Nav.jsx";
import MobilePageHeader from "@/components/layout/MobilePageHeader.jsx";
import { Webhook as WebhookIcon, Loader2, AlertTriangle, Plus, Trash2, FlaskConical, Check, Copy, History, ChevronDown, RefreshCw } from "lucide-react";

const EVENT_OPTIONS = [
  "decision.created", "decision.approved", "decision.declined", "decision.review",
  "application.created", "application.completed",
  "credit_report.ingested", "bank_statement.ingested", "recommendation.generated"
];

export default function Webhooks() {
  const [hooks, setHooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [url, setUrl] = useState("");
  const [events, setEvents] = useState(["decision.created", "decision.declined", "decision.review"]);
  const [newSecret, setNewSecret] = useState(null);
  const [copied, setCopied] = useState(false);
  const [testResult, setTestResult] = useState({});
  const [deliveries, setDeliveries] = useState({});
  const [expandedHook, setExpandedHook] = useState(null);
  const [loadingDeliveries, setLoadingDeliveries] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await base44.functions.invoke("apiWebhooks", { action: "list" });
      setHooks(res.data?.webhooks || []);
    } catch (e) {
      setError(e?.response?.data?.error?.message || e.message || "Failed to load webhooks.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const create = async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await base44.functions.invoke("apiWebhooks", { action: "create", url, events });
      setNewSecret(res.data?.webhook?.secret);
      setUrl("");
      await load();
    } catch (e) {
      setError(e?.response?.data?.error?.message || e.message || "Failed to create webhook.");
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id) => {
    if (!confirm("Delete this webhook?")) return;
    setBusy(true);
    try {
      await base44.functions.invoke("apiWebhooks", { action: "delete", id });
      await load();
    } catch (e) {
      setError(e?.response?.data?.error?.message || e.message || "Failed to delete.");
    } finally {
      setBusy(false);
    }
  };

  const test = async (id) => {
    setBusy(true);
    setTestResult((t) => ({ ...t, [id]: null }));
    try {
      const res = await base44.functions.invoke("apiWebhooks", { action: "test", id });
      setTestResult((t) => ({ ...t, [id]: res.data?.test }));
      await load();
    } catch (e) {
      setTestResult((t) => ({ ...t, [id]: { status: "failed", error: e?.message } }));
    } finally {
      setBusy(false);
    }
  };

  const rotate = async (id) => {
    if (!confirm("Rotate the signing secret? The old secret will stop working immediately. The new secret is shown only once.")) return;
    setBusy(true);
    setError(null);
    try {
      const res = await base44.functions.invoke("apiWebhooks", { action: "rotate", id });
      setNewSecret(res.data?.webhook?.secret);
      await load();
    } catch (e) {
      setError(e?.response?.data?.error?.message || e.message || "Failed to rotate secret.");
    } finally {
      setBusy(false);
    }
  };

  const toggleEvent = (ev) => setEvents((s) => s.includes(ev) ? s.filter((x) => x !== ev) : [...s, ev]);

  const loadDeliveries = async (webhookId) => {
    if (expandedHook === webhookId) { setExpandedHook(null); return; }
    setExpandedHook(webhookId);
    setLoadingDeliveries(true);
    try {
      const res = await base44.functions.invoke("apiWebhooks", { action: "deliveries", webhook_id: webhookId, limit: 20 });
      setDeliveries((d) => ({ ...d, [webhookId]: res.data?.deliveries || [] }));
    } catch (e) {
      setDeliveries((d) => ({ ...d, [webhookId]: [] }));
    } finally {
      setLoadingDeliveries(false);
    }
  };

  const copySecret = async (text) => {
    try { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch {}
  };

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-900">
      <Nav />
      <MobilePageHeader title="Webhooks" backTo="/settings" />
      <div className="max-w-3xl mx-auto px-5 sm:px-8 py-10">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight">Webhooks</h1>
          <p className="text-sm text-slate-500 mt-1">Receive event notifications at your endpoint. The signing secret is shown only once.</p>
        </div>

        <div className="mb-5 rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-semibold text-slate-700 mb-1.5">Verifying signatures</p>
          <p className="text-xs text-slate-500 leading-relaxed">
            Each delivery includes an <code className="font-mono text-slate-700">X-CreditDecide-Signature</code> header
            in the format <code className="font-mono text-slate-700">sha256=&lt;hex&gt;</code>, computed as
            HMAC-SHA256 over the raw request body using your webhook secret. Verify by recomputing the HMAC
            and comparing — never trust an unsigned payload.
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <p className="text-sm text-rose-700">{error}</p>
          </div>
        )}

        {newSecret && (
          <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-5">
            <p className="text-sm font-medium text-amber-900 mb-1">Save your webhook secret</p>
            <p className="text-xs text-amber-700 mb-3">Copy it now — it won't be shown again. Use it to verify the <code className="font-mono">X-CreditDecide-Signature</code> header.</p>
            <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-white px-3 py-2">
              <code className="flex-1 font-mono text-sm text-slate-800 break-all">{newSecret}</code>
              <button onClick={() => copySecret(newSecret)} className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-md border shrink-0 ${copied ? "text-emerald-600 border-emerald-200 bg-emerald-50" : "text-slate-600 border-slate-200 bg-white hover:bg-slate-100"}`}>
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />} {copied ? "Copied" : "Copy"}
              </button>
            </div>
            <button onClick={() => setNewSecret(null)} className="mt-3 text-xs font-medium text-amber-700 hover:underline">Dismiss</button>
          </div>
        )}

        <div className="mb-5 rounded-xl border border-slate-200 bg-white p-5">
          <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-1.5"><Plus className="w-4 h-4" /> Add endpoint</h3>
          <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://your-app.com/api/webhooks/underwriteos"
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-slate-900/10" />
          <div className="mt-3">
            <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-2">Events to subscribe</div>
            <div className="flex flex-wrap gap-2">
              {EVENT_OPTIONS.map((ev) => (
                <button key={ev} onClick={() => toggleEvent(ev)} className={`text-[11px] font-mono px-2.5 py-1 rounded-md border transition-colors ${events.includes(ev) ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"}`}>
                  {ev}
                </button>
              ))}
            </div>
          </div>
          <button onClick={create} disabled={busy || !url || events.length === 0} className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-white bg-slate-900 px-4 py-2 rounded-lg hover:bg-slate-800 disabled:opacity-50">
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Create webhook
          </button>
        </div>

        {loading ? (
          <div className="rounded-xl border border-slate-200 bg-white p-10 flex items-center justify-center gap-3">
            <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />
            <span className="text-sm text-slate-500">Loading webhooks…</span>
          </div>
        ) : hooks.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 bg-white p-10 text-center">
            <WebhookIcon className="w-8 h-8 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-medium text-slate-600">No webhooks yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {hooks.map((h) => (
              <div key={h.id} className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] font-mono rounded px-1.5 py-0.5 ${h.status === "active" ? "text-emerald-600 bg-emerald-50 border border-emerald-100" : "text-slate-400 bg-slate-50 border border-slate-100"}`}>{h.status}</span>
                      <span className="text-[10px] font-mono text-slate-400">secret {h.secret_masked}</span>
                    </div>
                    <code className="text-xs font-mono text-slate-700 break-all">{h.url}</code>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {(h.events || []).map((ev) => (
                        <span key={ev} className="text-[10px] font-mono text-slate-500 bg-slate-50 border border-slate-100 rounded px-1.5 py-0.5">{ev}</span>
                      ))}
                    </div>
                    {h.last_delivery_status && (
                      <div className="mt-2 text-[11px] text-slate-400">Last delivery: <span className={h.last_delivery_status.startsWith("ok") ? "text-emerald-600" : "text-rose-600"}>{h.last_delivery_status}</span></div>
                    )}
                    {testResult[h.id] && (
                      <div className={`mt-1 text-[11px] ${testResult[h.id].status === "ok" ? "text-emerald-600" : "text-rose-600"}`}>
                        Test: {testResult[h.id].status === "ok" ? `ok (HTTP ${testResult[h.id].http_status})` : `failed${testResult[h.id].error ? ` — ${testResult[h.id].error}` : ""}`}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button onClick={() => loadDeliveries(h.id)} disabled={busy} title="Delivery log"
                      className={`inline-flex items-center justify-center w-8 h-8 rounded-lg border ${expandedHook === h.id ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 text-slate-500 hover:bg-slate-50"} disabled:opacity-40`}>
                      <History className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => rotate(h.id)} disabled={busy} title="Rotate signing secret"
                      className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-amber-200 text-amber-600 hover:bg-amber-50 disabled:opacity-40">
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => test(h.id)} disabled={busy} title="Send test"
                      className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40">
                      <FlaskConical className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => remove(h.id)} disabled={busy} title="Delete"
                      className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-rose-200 text-rose-500 hover:bg-rose-50 disabled:opacity-40">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {expandedHook === h.id && (
                  <div className="mt-3 pt-3 border-t border-slate-100">
                    <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-2 flex items-center gap-1">
                      <ChevronDown className="w-3 h-3" /> Delivery log
                    </div>
                    {loadingDeliveries ? (
                      <div className="flex items-center gap-2 py-3">
                        <Loader2 className="w-4 h-4 text-slate-400 animate-spin" />
                        <span className="text-xs text-slate-500">Loading deliveries…</span>
                      </div>
                    ) : (deliveries[h.id] || []).length === 0 ? (
                      <p className="text-xs text-slate-400 py-3">No deliveries yet.</p>
                    ) : (
                      <div className="space-y-1.5 max-h-64 overflow-y-auto">
                        {(deliveries[h.id] || []).map((d) => (
                          <div key={d.id} className="flex items-center gap-2 rounded-lg bg-slate-50 border border-slate-100 px-2.5 py-1.5">
                            <span className={`text-[10px] font-mono rounded px-1.5 py-0.5 shrink-0 ${d.status === "delivered" ? "text-emerald-600 bg-emerald-50 border border-emerald-100" : "text-rose-600 bg-rose-50 border border-rose-100"}`}>
                              {d.status}
                            </span>
                            <span className="text-[10px] font-mono text-slate-500 shrink-0">{d.event}</span>
                            <span className="text-[10px] text-slate-400 shrink-0">{d.http_status ? `HTTP ${d.http_status}` : d.error || "error"}</span>
                            <span className="text-[10px] text-slate-400 shrink-0">{d.latency_ms}ms</span>
                            <span className="text-[10px] text-slate-300 ml-auto truncate">{new Date(d.created_at).toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}