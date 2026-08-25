import React from "react";

export default function CreditProfileCard({ profile }) {
  if (!profile) return null;
  const c = profile;
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-slate-900">Credit profile</h3>
        <span className="text-[10px] font-medium text-slate-500 bg-slate-100 rounded-full px-2 py-0.5">Sandbox Credit Provider</span>
      </div>
      <div className="grid grid-cols-2 gap-x-4">
        <Row label="Credit score" value={c.credit_score ?? "—"} />
        <Row label="Score band" value={c.score_band ?? "—"} />
        <Row label="Active accounts" value={c.active_accounts ?? "—"} />
        <Row label="Delinquencies" value={c.delinquent_accounts ?? "—"} />
        <Row label="Defaults" value={c.defaults ?? "—"} />
        <Row label="Credit utilisation" value={c.credit_utilisation != null ? `${(c.credit_utilisation * 100).toFixed(0)}%` : "—"} />
        <Row label="Recent enquiries" value={c.recent_enquiries ?? "—"} />
        <Row label="Repayment history" value={c.repayment_history != null ? `${c.repayment_history}/100` : "—"} />
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between border-b border-slate-50 py-1.5">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="text-sm font-mono font-medium text-slate-800">{value}</span>
    </div>
  );
}