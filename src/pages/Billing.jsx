import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import Nav from "@/components/layout/Nav.jsx";
import { Wallet, Loader2, AlertTriangle, Zap, RefreshCw, CheckCircle2, CreditCard, ArrowUpCircle } from "lucide-react";

export default function Billing() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [checkoutBlocked, setCheckoutBlocked] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);
  const [auto, setAuto] = useState({ enabled: false, threshold: 1000, amount: 10000, price_cents: 2000 });

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await base44.functions.invoke("apiBilling", { action: "balance" });
      setData(res.data);
      setAuto({
        enabled: !!res.data?.auto_topup?.enabled,
        threshold: res.data?.auto_topup?.threshold ?? 1000,
        amount: res.data?.auto_topup?.amount ?? 10000,
        price_cents: res.data?.auto_topup?.price_cents ?? 2000
      });
    } catch (e) {
      setError(e?.response?.data?.error?.message || e.message || "Failed to load billing.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (window.self !== window.top) setCheckoutBlocked(true);
    const params = new URLSearchParams(window.location.search);
    if (params.get("status") === "success") {
      setSuccessMsg("Payment successful — your credits have been added.");
      window.history.replaceState({}, "", "/billing");
    }
    load();
  }, []);

  const buy = async (packId) => {
    if (checkoutBlocked) { alert("Checkout only works from the published app. Open this page outside the builder preview."); return; }
    setBusy(true);
    setError(null);
    try {
      const res = await base44.functions.invoke("apiBilling", { action: "checkout", pack_id: packId, origin: window.location.origin });
      if (res.data?.url) window.location.href = res.data.url;
    } catch (e) {
      setError(e?.response?.data?.error?.message || e.message || "Failed to start checkout.");
    } finally {
      setBusy(false);
    }
  };

  const saveAuto = async () => {
    setBusy(true);
    setError(null);
    try {
      await base44.functions.invoke("apiBilling", { action: "config_auto_topup", ...auto });
      await load();
    } catch (e) {
      setError(e?.response?.data?.error?.message || e.message || "Failed to save.");
    } finally {
      setBusy(false);
    }
  };

  const fmt = (cents, currency) => new Intl.NumberFormat("en-US", { style: "currency", currency: (currency || "usd").toUpperCase() }).format((cents || 0) / 100);

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-900">
      <Nav />
      <div className="max-w-4xl mx-auto px-5 sm:px-8 py-10">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight">Billing</h1>
          <p className="text-sm text-slate-500 mt-1">Buy API credits and manage auto top-up.</p>
        </div>

        {checkoutBlocked && (
          <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-sm text-amber-700">Checkout works only from the published app. Open this page outside the builder preview to purchase credits.</p>
          </div>
        )}
        {successMsg && (
          <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <p className="text-sm text-emerald-700">{successMsg}</p>
          </div>
        )}
        {error && (
          <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <p className="text-sm text-rose-700">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="rounded-xl border border-slate-200 bg-white p-10 flex items-center justify-center gap-3">
            <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />
            <span className="text-sm text-slate-500">Loading billing…</span>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-xl border border-slate-200 bg-white p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-slate-900 flex items-center justify-center"><Wallet className="w-5 h-5 text-white" /></div>
                <div>
                  <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Credit balance</div>
                  <div className="text-3xl font-semibold tabular-nums">{(data?.balance || 0).toLocaleString()} <span className="text-base font-normal text-slate-400">credits</span></div>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-1.5"><Zap className="w-4 h-4" /> Buy credits</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {(data?.packs || []).map((p) => (
                  <div key={p.id} className="rounded-lg border border-slate-200 p-4 flex flex-col">
                    <div className="text-lg font-semibold tabular-nums">{p.credits.toLocaleString()}</div>
                    <div className="text-xs text-slate-400 mb-3">credits</div>
                    <div className="text-sm font-medium text-slate-900 mb-3">{fmt(p.amount, "usd")}</div>
                    <button onClick={() => buy(p.id)} disabled={busy} className="mt-auto inline-flex items-center justify-center gap-1.5 text-sm font-medium text-white bg-slate-900 px-3 py-2 rounded-lg hover:bg-slate-800 disabled:opacity-50">
                      {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />} Buy
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <h3 className="text-sm font-semibold text-slate-900 mb-1 flex items-center gap-1.5"><ArrowUpCircle className="w-4 h-4" /> Auto top-up</h3>
              {data?.auto_topup?.configured ? (
                <>
                  <p className="text-xs text-slate-500 mb-4">Automatically buy credits when your balance drops below the threshold. Charges your saved card off-session.</p>
                  <div className="space-y-4">
                    <label className="flex items-center justify-between">
                      <span className="text-sm text-slate-700">Enable auto top-up</span>
                      <button onClick={() => setAuto((a) => ({ ...a, enabled: !a.enabled }))} className={`relative w-10 h-6 rounded-full transition-colors ${auto.enabled ? "bg-slate-900" : "bg-slate-200"}`}>
                        <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${auto.enabled ? "translate-x-4" : ""}`} />
                      </button>
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Threshold (credits)</label>
                        <input type="number" value={auto.threshold} onChange={(e) => setAuto((a) => ({ ...a, threshold: Number(e.target.value) }))}
                          className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10" />
                      </div>
                      <div>
                        <label className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Top-up amount (credits)</label>
                        <input type="number" value={auto.amount} onChange={(e) => setAuto((a) => ({ ...a, amount: Number(e.target.value) }))}
                          className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10" />
                      </div>
                      <div>
                        <label className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Charge</label>
                        <div className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm bg-slate-50">{fmt(auto.price_cents, "usd")}</div>
                      </div>
                    </div>
                    <button onClick={saveAuto} disabled={busy} className="inline-flex items-center gap-1.5 text-sm font-medium text-white bg-slate-900 px-4 py-2 rounded-lg hover:bg-slate-800 disabled:opacity-50">
                      {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />} Save auto top-up
                    </button>
                </div>
                </>
              ) : (
                <p className="text-xs text-slate-500">Buy a credit pack first to save a payment method, then auto top-up becomes available.</p>
              )}
            </div>

            <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
              <div className="p-5 border-b border-slate-100"><h3 className="text-sm font-semibold text-slate-900">Recent transactions</h3></div>
              {(data?.transactions || []).length === 0 ? (
                <div className="p-8 text-center text-sm text-slate-400">No transactions yet.</div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {data.transactions.map((t) => (
                    <div key={t.id} className="px-5 py-3 flex items-center justify-between">
                      <div>
                        <div className="text-sm text-slate-700">{t.description || t.type}</div>
                        <div className="text-[11px] text-slate-400">{t.created_at ? new Date(t.created_at).toLocaleString() : ""}{t.amount_cents ? ` · ${fmt(t.amount_cents, t.currency)}` : ""}</div>
                      </div>
                      <div className={`text-sm font-medium tabular-nums ${t.credits >= 0 ? "text-emerald-600" : "text-slate-500"}`}>{t.credits >= 0 ? "+" : ""}{t.credits.toLocaleString()}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}