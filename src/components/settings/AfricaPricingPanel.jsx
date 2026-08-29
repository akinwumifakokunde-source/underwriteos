import React, { useEffect, useState } from "react";
import { CheckCircle2, MapPin, Loader2, CreditCard, Crown, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { AFRICA_PRICING } from "@/lib/africaPricing";
import { detectAfricaMarket } from "@/lib/geoPricing";

// Africa-market pricing panel with working Stripe checkout at local-currency rates.
// Auto-detects the visitor's location; only renders for supported African markets.
export default function AfricaPricingPanel({ onPurchased }) {
  const [market, setMarket] = useState(null);
  const [detecting, setDetecting] = useState(true);
  const [busyPack, setBusyPack] = useState(null);
  const [busyPlan, setBusyPlan] = useState(null);
  const [error, setError] = useState(null);
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    if (window.self !== window.top) setBlocked(true);
    let mounted = true;
    detectAfricaMarket()
      .then((code) => mounted && setMarket(code))
      .finally(() => mounted && setDetecting(false));
    return () => { mounted = false; };
  }, []);

  const buy = async (packId) => {
    if (blocked) { alert("Checkout only works from the published app. Open this page outside the builder preview."); return; }
    setBusyPack(packId);
    setError(null);
    try {
      const res = await base44.functions.invoke("apiBilling", { action: "checkout", pack_id: packId, market });
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
    if (blocked) { alert("Checkout only works from the published app. Open this page outside the builder preview."); return; }
    setBusyPlan(planId);
    setError(null);
    try {
      const res = await base44.functions.invoke("apiBilling", { action: "subscription_checkout", plan_id: planId, market });
      if (res.data?.url) window.location.href = res.data.url;
    } catch (e) {
      setError(e?.response?.data?.error?.message || e.message || "Failed to start subscription.");
    } finally {
      setBusyPlan(null);
    }
  };

  if (detecting) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-5 flex items-center gap-2.5">
        <Loader2 className="w-4 h-4 animate-spin text-[#0d9488]" />
        <span className="text-sm text-slate-500">Detecting your location for local pricing…</span>
      </div>
    );
  }

  if (!market) return null;

  const cfg = AFRICA_PRICING[market];

  return (
    <div className="rounded-xl border border-[#0d9488]/30 bg-[#0d9488]/[0.03] p-5">
      <div className="flex items-center gap-2 mb-1">
        <MapPin className="w-4 h-4 text-[#0d9488]" />
        <h3 className="text-sm font-semibold text-slate-900">Pricing for your location · {cfg.label}</h3>
      </div>
      <p className="text-xs text-slate-500 mb-4 leading-relaxed">
        We've detected you're in {cfg.label}. Subscription and credit packs are billed in {cfg.currency} at
        purchasing-power-adjusted rates.
      </p>

      {blocked && (
        <div className="mb-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-700">Checkout works only from the published app. Open this page outside the builder preview to purchase.</p>
        </div>
      )}
      {error && (
        <div className="mb-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <p className="text-xs text-rose-700">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        {cfg.tiers.map((t) => (
          <div
            key={t.plan_id}
            className={`rounded-lg border p-3 flex flex-col ${t.highlight ? "border-[#0d9488] bg-white" : "border-slate-200 bg-white"}`}
          >
            <div className="text-xs font-medium text-slate-700">{t.name}</div>
            <div className="mt-1.5 flex items-baseline gap-0.5">
              <span className="text-sm font-semibold text-slate-900">{cfg.symbol}</span>
              <span className="text-xl font-semibold tracking-tight text-slate-900">{t.price}</span>
              <span className="text-[11px] text-slate-400">/mo</span>
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5 mb-3">{t.credits}</div>
            <button
              onClick={() => subscribe(t.plan_id)}
              disabled={busyPlan === t.plan_id}
              className="mt-auto inline-flex items-center justify-center gap-1.5 text-xs font-medium text-white bg-slate-900 px-3 py-2 rounded-lg hover:bg-slate-800 disabled:opacity-50"
            >
              {busyPlan === t.plan_id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Crown className="w-3.5 h-3.5" />} Subscribe
            </button>
          </div>
        ))}
      </div>

      <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        {cfg.packs.map((p) => (
          <div key={p.pack_id} className="rounded-lg border border-slate-200 bg-white p-2.5 flex flex-col">
            <div className="text-[11px] font-medium text-slate-600">{p.name}</div>
            <div className="text-[11px] text-slate-400">{p.credits} credits</div>
            <div className="text-xs font-medium text-slate-900 mt-0.5 mb-2">{p.price}</div>
            <button
              onClick={() => buy(p.pack_id)}
              disabled={busyPack === p.pack_id}
              className="mt-auto inline-flex items-center justify-center gap-1.5 text-xs font-medium text-white bg-slate-900 px-3 py-1.5 rounded-lg hover:bg-slate-800 disabled:opacity-50"
            >
              {busyPack === p.pack_id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CreditCard className="w-3.5 h-3.5" />} Buy
            </button>
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-start gap-2">
        <CheckCircle2 className="w-3.5 h-3.5 text-[#0d9488] shrink-0 mt-0.5" />
        <p className="text-[11px] text-slate-600 leading-relaxed">
          {cfg.label} rates apply automatically based on your location. Need volume or micro-lender rates?{" "}
          <Link to="/contact" className="text-[#0d9488] font-medium hover:underline">Contact us</Link>.
        </p>
      </div>
    </div>
  );
}