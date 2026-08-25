import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import Nav from "@/components/layout/Nav.jsx";
import { Wallet, Loader2, AlertTriangle, Zap, CheckCircle2, CreditCard } from "lucide-react";

export default function Billing() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busyPack, setBusyPack] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [crediting, setCrediting] = useState(false);
  const [checkoutBlocked, setCheckoutBlocked] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await base44.functions.invoke("apiBilling", { action: "balance" });
      setData(res.data);
    } catch (e) {
      setError(e?.response?.data?.error?.message || e.message || "Failed to load billing.");
    } finally {
      setLoading(false);
    }
  };

  const recordPurchase = async (packId, ref) => {
    setCrediting(true);
    setError(null);
    try {
      const res = await base44.functions.invoke("apiBilling", { action: "record_purchase", pack_id: packId, transaction_ref: ref || "" });
      if (res.data?.credited) {
        setSuccessMsg(`Payment received — ${res.data.credits.toLocaleString()} credits added to your account.`);
      }
      await load();
    } catch (e) {
      setError(e?.response?.data?.error?.message || e.message || "Failed to record purchase.");
    } finally {
      setCrediting(false);
    }
  };

  useEffect(() => {
    if (window.self !== window.top) setCheckoutBlocked(true);
    const params = new URLSearchParams(window.location.search);
    const status = params.get("status");
    const packId = params.get("pack");
    const tx = params.get("tx");
    if (status === "success") {
      const target = packId || localStorage.getItem("uw_pending_pack");
      if (target) {
        if (!packId) localStorage.removeItem("uw_pending_pack");
        window.history.replaceState({}, "", "/billing");
        recordPurchase(target, tx || "");
      } else {
        window.history.replaceState({}, "", "/billing");
      }
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const buy = async (packId) => {
    if (checkoutBlocked) {
      alert("Checkout only works from the published app. Open this page outside the builder preview.");
      return;
    }
    setBusyPack(packId);
    setError(null);
    try {
      const res = await base44.functions.invoke("apiBilling", { action: "checkout", pack_id: packId });
      if (res.data?.url) {
        localStorage.setItem("uw_pending_pack", packId);
        window.location.href = res.data.url;
      }
    } catch (e) {
      setError(e?.response?.data?.error?.message || e.message || "Failed to start checkout.");
    } finally {
      setBusyPack(null);
    }
  };

  const fmt = (cents, currency) => new Intl.NumberFormat("en-US", { style: "currency", currency: (currency || "usd").toUpperCase() }).format((cents || 0) / 100);

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-900">
      <Nav />
      <div className="max-w-4xl mx-auto px-5 sm:px-8 py-10">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight">Billing</h1>
          <p className="text-sm text-slate-500 mt-1">Buy API credits. Payments are processed by Wix Payments.</p>
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
        {crediting && (
          <div className="mb-4 rounded-xl border border-slate-200 bg-white p-4 flex items-center gap-3">
            <Loader2 className="w-4 h-4 text-slate-500 animate-spin" />
            <span className="text-sm text-slate-600">Applying your credits…</span>
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
              <h3 className="text-sm font-semibold text-slate-900 mb-1 flex items-center gap-1.5"><Zap className="w-4 h-4" /> Buy credits</h3>
              <p className="text-xs text-slate-500 mb-4">Each pack checks out through a Wix payment link. Credits are added to your account when you return after payment.</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {(data?.packs || []).map((p) => (
                  <div key={p.id} className="rounded-lg border border-slate-200 p-4 flex flex-col">
                    <div className="text-lg font-semibold tabular-nums">{p.credits.toLocaleString()}</div>
                    <div className="text-xs text-slate-400 mb-3">credits</div>
                    <div className="text-sm font-medium text-slate-900 mb-3">{fmt(p.amount, "usd")}</div>
                    <button onClick={() => buy(p.id)} disabled={busyPack === p.id} className="mt-auto inline-flex items-center justify-center gap-1.5 text-sm font-medium text-white bg-slate-900 px-3 py-2 rounded-lg hover:bg-slate-800 disabled:opacity-50">
                      {busyPack === p.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />} Buy
                    </button>
                  </div>
                ))}
              </div>
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