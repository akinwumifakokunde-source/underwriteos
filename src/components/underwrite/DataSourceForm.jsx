import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { withApiKey } from "@/lib/apiKey";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Link2, KeyRound, Info } from "lucide-react";

const BUREAUS = ["experian", "equifax", "transunion", "crc", "credit_registry", "first_central", "xds", "crb_africa", "iscore"];
const BANKS = ["truelayer", "yapily", "plaid", "tink", "okra", "mono", "stitch"];

const inputCls = "h-9 text-sm";
const selectCls = "h-9 w-full rounded-md border border-slate-200 bg-white px-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10";

function Field({ label, children, hint }) {
  return (
    <div>
      <Label className="text-[12px] text-slate-600">{label}</Label>
      <div className="mt-1">{children}</div>
      {hint && <p className="mt-1 text-[11px] text-slate-400">{hint}</p>}
    </div>
  );
}

export default function DataSourceForm({ form, set }) {
  const [creds, setCreds] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const r = await base44.functions.invoke("apiProviders", withApiKey({ action: "list" }));
        setCreds(r.data?.credentials || []);
      } catch {
        setCreds([]);
      }
    })();
  }, []);

  const activeBureaus = (creds || []).filter((c) => c.provider_type === "credit_bureau" && c.status === "active");
  const activeBanks = (creds || []).filter((c) => c.provider_type === "open_banking" && c.status === "active");
  const hasLive = activeBureaus.length > 0 || activeBanks.length > 0;
  const loading = creds === null;

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-sm font-semibold text-slate-900 mb-1">Financial data source</h3>
        <p className="text-[12px] text-slate-500">Choose how CreditDecide gathers the applicant's credit and bank data.</p>
      </div>

      {/* mode toggle */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => set("dataMode", "auto")}
          className={`text-left rounded-xl border p-4 transition-colors ${form.dataMode === "auto" ? "border-slate-900 bg-slate-50 ring-1 ring-slate-900" : "border-slate-200 hover:bg-slate-50"}`}
        >
          <div className="flex items-center gap-2">
            <Link2 className="w-4 h-4 text-slate-500" />
            <span className="text-sm font-semibold text-slate-900">Auto-pull from providers</span>
          </div>
          <p className="mt-1.5 text-[12px] text-slate-500">Fetch live credit and bank data from your connected bureau / open-banking providers.</p>
        </button>
        <button
          type="button"
          onClick={() => set("dataMode", "manual")}
          className={`text-left rounded-xl border p-4 transition-colors ${form.dataMode === "manual" ? "border-slate-900 bg-slate-50 ring-1 ring-slate-900" : "border-slate-200 hover:bg-slate-50"}`}
        >
          <div className="flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-slate-500" />
            <span className="text-sm font-semibold text-slate-900">Enter manually</span>
          </div>
          <p className="mt-1.5 text-[12px] text-slate-500">Type in the applicant's credit profile and monthly cash flow figures.</p>
        </button>
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-[12px] text-slate-400">
          <Loader2 className="w-3.5 h-3.5 animate-spin" /> Loading your configured providers…
        </div>
      )}

      {!loading && !hasLive && (
        <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[12px] text-amber-800">
          <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          <span>No live provider credentials configured. Auto-pull will use synthetic data. <Link to="/providers" className="font-medium underline">Connect a provider</Link> to fetch real data.</span>
        </div>
      )}

      {form.dataMode === "auto" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Credit bureau" hint={activeBureaus.length ? `${activeBureaus.length} live credential(s) connected` : "No live credential — mock data"}>
            <select className={selectCls} value={form.creditProvider} onChange={(e) => set("creditProvider", e.target.value)}>
              {BUREAUS.map((b) => <option key={b} value={b}>{b}</option>)}
            </select>
          </Field>
          <Field label="Open banking provider" hint={activeBanks.length ? `${activeBanks.length} live credential(s) connected` : "No live credential — mock data"}>
            <select className={selectCls} value={form.bankProvider} onChange={(e) => set("bankProvider", e.target.value)}>
              {BANKS.map((b) => <option key={b} value={b}>{b}</option>)}
            </select>
          </Field>
        </div>
      ) : (
        <div className="space-y-5">
          <div>
            <h4 className="text-[13px] font-semibold text-slate-800 mb-2">Credit profile</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Field label="Credit score"><Input className={inputCls} type="number" value={form.credit_score} onChange={(e) => set("credit_score", e.target.value)} /></Field>
              <Field label="Active accounts"><Input className={inputCls} type="number" value={form.active_accounts} onChange={(e) => set("active_accounts", e.target.value)} /></Field>
              <Field label="Delinquent"><Input className={inputCls} type="number" value={form.delinquent_accounts} onChange={(e) => set("delinquent_accounts", e.target.value)} /></Field>
              <Field label="Defaults"><Input className={inputCls} type="number" value={form.defaults} onChange={(e) => set("defaults", e.target.value)} /></Field>
              <Field label="Utilisation (0-1)"><Input className={inputCls} type="number" step="0.01" value={form.credit_utilisation} onChange={(e) => set("credit_utilisation", e.target.value)} /></Field>
              <Field label="Recent enquiries"><Input className={inputCls} type="number" value={form.recent_enquiries} onChange={(e) => set("recent_enquiries", e.target.value)} /></Field>
              <Field label="Repayment history (0-100)"><Input className={inputCls} type="number" value={form.repayment_history} onChange={(e) => set("repayment_history", e.target.value)} /></Field>
              <Field label="Outstanding balance"><Input className={inputCls} type="number" value={form.outstanding_balance} onChange={(e) => set("outstanding_balance", e.target.value)} /></Field>
            </div>
          </div>
          <div>
            <h4 className="text-[13px] font-semibold text-slate-800 mb-2">Monthly cash flow (GBP)</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Field label="Monthly income"><Input className={inputCls} type="number" value={form.monthly_income} onChange={(e) => set("monthly_income", e.target.value)} /></Field>
              <Field label="Monthly expenses"><Input className={inputCls} type="number" value={form.monthly_expenses} onChange={(e) => set("monthly_expenses", e.target.value)} /></Field>
              <Field label="Existing debt"><Input className={inputCls} type="number" value={form.existing_debt} onChange={(e) => set("existing_debt", e.target.value)} /></Field>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}