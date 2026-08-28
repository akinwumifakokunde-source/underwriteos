import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Wallet, Loader2, AlertTriangle, Zap, CheckCircle2, CreditCard, Crown, X, Sparkles, RefreshCw } from "lucide-react";

export default function BillingSection() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busyPack, setBusyPack] = useState(null);
  const [busyPlan, setBusyPlan] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [crediting, setCrediting] = useState(false);
  const [cancelling, setCancelling] = useState(false);
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
    if (status === "sub_success") {
      const planId = params.get("plan");
      window.history.replaceState({}, "", "/settings");
      setSuccessMsg(planId ? `Subscription activated — your ${planId.replace("plan_", "")} plan is now live.` : "Subscription activated.");
      load();
    } else if (status === "sub_cancelled") {
      window.history.replaceState({}, "", "/settings");
    } else if (status === "success") {
      const packId = params.get("pack");
      const tx = params.get("tx");
      const target = packId || localStorage.getItem("uw_pending_pack");
      if (target) {
        if (!packId) localStorage.removeItem("uw_pending_pack");
        window.history.replaceState({}, "", "/settings");
        recordPurchase(target, tx || "");
      } else {
        window.history.replaceState({}, "", "/settings");
      }
    } else {
      load();
    }
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

  const subscribe = async (planId) => {
    if (checkoutBlocked) {
      alert("Checkout only works from the published app. Open this page outside the builder preview.");
      return;
    }
    setBusyPlan(planId);
    setError(null);
    try {
      const res = await base44.functions.invoke("apiBilling", { action: "subscription_checkout", plan_id: planId });
      if (res.data?.url) window.location.href = res.data.url;
    } catch (e) {
      setError(e?.response?.data?.error?.message || e.message || "Failed to start subscription.");
    } finally {
      setBusyPlan(null);
    }
  };

  const cancelSubscription = async () => {
    if (!confirm("Cancel your subscription? It will remain active until the end of the current billing period.")) return;
    setCancelling(true);
    setError(null);
    try {
      await base44.functions.invoke("apiBilling", { action: "subscription_cancel" });
      setSuccessMsg("Subscription cancelled — it remains active until the end of the current period.");
      await load();
    } catch (e) {
      setError(e?.response?.data?.error?.message || e.message || "Failed to cancel subscription.");
    } finally {
      setCancelling(false);
    }
  };

  const fmt = (cents, currency) => new Intl.NumberFormat("en-US", { style: "currency", currency: (currency || "usd").toUpperCase() }).format((cents || 0) / 100);

  if (loading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-10 flex items-center justify-center gap-3">
        <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />
        <span className="text-sm text-slate-500">Loading billing…</span>
      </div>
    );
  }

  const subStatus = data?.subscription_status || "none";
  const subPlanId = data?.subscription_plan_id;
  const subPeriodEnd = data?.subscription_current_period_end;
  const hasActiveSub = ["active", "trialing"].includes(subStatus);

  return (
    <div className="space-y-4">
      {checkoutBlocked && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-sm text-amber-700">Checkout works only from the published app. Open this page outside the builder preview to purchase.</p>
        </div>
      )}
      {successMsg && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <p className="text-sm text-emerald-700">{successMsg}</p>
        </div>
      )}
      {crediting && (
        <div className="rounded-xl border border-slate-200 bg-white p-4 flex items-center gap-3">
          <Loader2 className="w-4 h-4 text-slate-500 animate-spin" />
          <span className="text-sm text-slate-600">Applying your credits…</span>
        </div>
      )}
      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <p className="text-sm text-rose-700">{error}</p>
        </div>
      )}

      {/* Balance + current subscription */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-slate-900 flex items-center justify-center"><Wallet className="w-5 h-5 text-white" /></div>
            <div>
              <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Credit balance</div>
              <div className="text-3xl font-semibold tabular-nums">{(data?.balance || 0).toLocaleString()} <span className="text-base font-normal text-slate-400">credits</span></div>
            </div>
          </div>
          {(data?.balance || 0) > 0 && !hasActiveSub && (data?.transactions || []).length <= 1 && (
            <p className="mt-3 text-xs text-[#0d9488] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> 1,000 free signup credits included — no card required.
            </p>
          )}
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${hasActiveSub ? "bg-[#0d9488]" : "bg-slate-200"}`}><Crown className={`w-5 h-5 ${hasActiveSub ? "text-white" : "text-slate-500"}`} /></div>
            <div className="flex-1">
              <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Subscription</div>
              {hasActiveSub ? (
                <div>
                  <div className="text-lg font-semibold capitalize">{subPlanId?.replace("plan_", "") || "Active"} <span className="text-xs font-normal text-slate-400">· {subStatus}</span></div>
                  {subPeriodEnd && <div className="text-[11px] text-slate-400">Renews {new Date(subPeriodEnd).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })}</div>}
                </div>
              ) : (
                <div className="text-lg font-semibold text-slate-500">No active plan</div>
              )}
            </div>
          </div>
          {hasActiveSub && (
            <button onClick={cancelSubscription} disabled={cancelling} className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-rose-600 hover:text-rose-700 disabled:opacity-50">
              {cancelling ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <X className="w-3.5 h-3.5" />} Cancel subscription
            </button>
          )}
        </div>
      </div>

      {/* Subscription plans */}
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <h3 className="text-sm font-semibold text-slate-900 mb-1 flex items-center gap-1.5"><Sparkles className="w-4 h-4 text-[#0d9488]" /> Subscription plans</h3>
        <p className="text-xs text-slate-500 mb-4">Monthly plans include a credit allowance that refreshes each billing cycle. Subscribe to unlock continuous underwriting capacity.</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {(data?.plans || []).map((p) => {
            const isCurrent = subPlanId === p.id && hasActiveSub;
            return (
              <div key={p.id} className={`rounded-lg border p-4 flex flex-col relative ${isCurrent ? "border-[#0d9488] bg-[#0d9488]/5" : "border-slate-200"} ${p.popular && !isCurrent ? "ring-1 ring-[#0d9488]/30" : ""}`}>
                {p.popular && !isCurrent && <div className="absolute -top-2 left-4 text-[9px] font-bold uppercase tracking-wider text-white bg-[#0d9488] rounded px-1.5 py-0.5">Popular</div>}
                <div className="text-base font-semibold">{p.name}</div>
                <div className="text-[11px] text-slate-400 mb-2">{p.tagline}</div>
                <div className="text-lg font-semibold tabular-nums">{fmt(p.amount, "usd")}<span className="text-xs font-normal text-slate-400">/mo</span></div>
                <div className="text-xs text-slate-500 mt-1 mb-3">{p.credits.toLocaleString()} credits/mo</div>
                {isCurrent ? (
                  <div className="mt-auto inline-flex items-center justify-center gap-1.5 text-sm font-medium text-[#0d9488] px-3 py-2 rounded-lg bg-[#0d9488]/10">
                    <CheckCircle2 className="w-4 h-4" /> Current plan
                  </div>
                ) : (
                  <button onClick={() => subscribe(p.id)} disabled={busyPlan === p.id} className="mt-auto inline-flex items-center justify-center gap-1.5 text-sm font-medium text-white bg-slate-900 px-3 py-2 rounded-lg hover:bg-slate-800 disabled:opacity-50">
                    {busyPlan === p.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Crown className="w-4 h-4" />} {hasActiveSub ? "Switch plan" : "Subscribe"}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Top-up packs */}
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <h3 className="text-sm font-semibold text-slate-900 mb-1 flex items-center gap-1.5"><Zap className="w-4 h-4" /> Top up credits</h3>
        <p className="text-xs text-slate-500 mb-4">One-time credit packs. Useful when you need extra capacity beyond your subscription allowance.</p>
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

      {/* Transactions */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-900">Recent transactions</h3>
          <button onClick={load} className="text-slate-400 hover:text-slate-600"><RefreshCw className="w-4 h-4" /></button>
        </div>
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
  );
}