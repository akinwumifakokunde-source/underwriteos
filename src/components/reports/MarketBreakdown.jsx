import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, Globe } from "lucide-react";

const MARKETS = [
  { code: "GB", name: "United Kingdom" },
  { code: "US", name: "United States" },
  { code: "NG", name: "Nigeria" },
  { code: "ZA", name: "South Africa" },
  { code: "KE", name: "Kenya" },
  { code: "GH", name: "Ghana" },
];

export default function MarketBreakdown() {
  const [rows, setRows] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await base44.functions.invoke("apiApplications", { action: "list", limit: 100 });
        if (!alive) return;
        const apps = res.data?.applications || [];
        const byMarket = {};
        apps.forEach((a) => {
          const m = a.market || "GB";
          if (!byMarket[m]) byMarket[m] = { total: 0, approved: 0, declined: 0, review: 0 };
          byMarket[m].total++;
          if (a.decision === "APPROVE") byMarket[m].approved++;
          else if (a.decision === "DECLINE") byMarket[m].declined++;
          else if (a.decision === "REVIEW" || a.human_review_required) byMarket[m].review++;
        });
        const built = MARKETS.map((mk) => {
          const d = byMarket[mk.code] || { total: 0, approved: 0, declined: 0, review: 0 };
          const rate = d.total > 0 ? Math.round((d.approved / d.total) * 100) : 0;
          return { ...mk, ...d, rate };
        }).filter((r) => r.total > 0);
        setRows(built);
      } catch (e) {
        if (!alive) return;
        setError(e?.response?.data?.error?.message || e.message || "Failed to load market breakdown.");
        setRows([]);
      }
    })();
    return () => { alive = false; };
  }, []);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex items-center gap-2 mb-4">
        <Globe className="w-4 h-4 text-teal-600" />
        <h3 className="text-sm font-semibold text-slate-900">Market breakdown</h3>
      </div>

      {rows === null ? (
        <div className="flex items-center justify-center gap-3 py-8">
          <Loader2 className="w-4 h-4 text-slate-400 animate-spin" />
          <span className="text-sm text-slate-500">Loading…</span>
        </div>
      ) : error ? (
        <p className="text-sm text-rose-600">{error}</p>
      ) : rows.length === 0 ? (
        <p className="text-sm text-slate-400 py-6 text-center">No applications yet.</p>
      ) : (
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left text-[11px] uppercase tracking-wider text-slate-400 font-semibold py-2.5">Market</th>
                <th className="text-right text-[11px] uppercase tracking-wider text-slate-400 font-semibold py-2.5">Apps</th>
                <th className="text-right text-[11px] uppercase tracking-wider text-slate-400 font-semibold py-2.5">Approved</th>
                <th className="text-right text-[11px] uppercase tracking-wider text-slate-400 font-semibold py-2.5">Declined</th>
                <th className="text-right text-[11px] uppercase tracking-wider text-slate-400 font-semibold py-2.5">Approval rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {rows.map((r) => (
                <tr key={r.code}>
                  <td className="py-2.5">
                    <span className="text-[11px] font-mono text-slate-400 mr-2">{r.code}</span>
                    <span className="text-slate-700">{r.name}</span>
                  </td>
                  <td className="py-2.5 text-right tabular-nums text-slate-900">{r.total}</td>
                  <td className="py-2.5 text-right tabular-nums text-emerald-600">{r.approved}</td>
                  <td className="py-2.5 text-right tabular-nums text-rose-600">{r.declined}</td>
                  <td className="py-2.5 text-right tabular-nums font-medium text-slate-900">{r.rate}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}