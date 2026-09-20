import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import Nav from "@/components/layout/Nav.jsx";
import { Loader2, AlertTriangle, Search, ShieldAlert } from "lucide-react";
import ResponsiveTable from "@/components/shared/ResponsiveTable";

const FLAG_STYLES = {
  positive: "text-emerald-700 bg-emerald-50 border-emerald-200",
  neutral: "text-slate-600 bg-slate-50 border-slate-200",
  negative: "text-amber-700 bg-amber-50 border-amber-200",
  critical: "text-rose-700 bg-rose-50 border-rose-200",
};

const CATEGORY_STYLES = {
  credit: "bg-sky-50 text-sky-700 border-sky-200",
  cashflow: "bg-violet-50 text-violet-700 border-violet-200",
  affordability: "bg-amber-50 text-amber-700 border-amber-200",
  fraud: "bg-rose-50 text-rose-700 border-rose-200",
};

const FILTERS = ["All", "Credit", "Cashflow", "Affordability", "Fraud", "Critical"];

export default function RiskSignals() {
  const [signals, setSignals] = useState([]);
  const [apps, setApps] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const me = await base44.auth.me();
      const oid = me.data?.organization_id || me.organization_id;
      const sigs = await base44.entities.RiskSignal.filter({ organization_id: oid }, "-created_date", 200);
      setSignals(sigs);
      const appIds = [...new Set(sigs.map((s) => s.application_id).filter(Boolean))];
      const appMap = {};
      await Promise.all(appIds.map(async (id) => {
        try { const a = await base44.entities.Application.filter({ id, organization_id: oid }, "-created_date", 1); if (a[0]) appMap[id] = a[0]; } catch {}
      }));
      setApps(appMap);
    } catch (e) {
      setError(e?.message || "Failed to load risk signals.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    let result = signals;
    if (filter === "Critical") result = result.filter((s) => s.flag === "critical");
    else if (filter !== "All") result = result.filter((s) => s.category === filter.toLowerCase());
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((s) => s.signal?.toLowerCase().includes(q) || s.explanation?.toLowerCase().includes(q));
    }
    return result;
  }, [signals, filter, search]);

  const columns = [
    {
      key: "signal", header: "Signal", mobileTitle: true,
      render: (s) => (
        <>
          <div className="text-sm font-medium text-slate-900">{s.signal}</div>
          {s.explanation && <div className="text-[11px] text-slate-400">{s.explanation}</div>}
        </>
      ),
    },
    { key: "category", header: "Category", render: (s) => <span className={`text-[10px] font-medium border rounded px-1.5 py-0.5 ${CATEGORY_STYLES[s.category] || CATEGORY_STYLES.neutral}`}>{s.category}</span> },
    { key: "value", header: "Value", render: (s) => <span className="text-sm font-mono text-slate-700">{String(s.value ?? "—")}</span> },
    { key: "flag", header: "Flag", render: (s) => <span className={`text-[10px] font-bold border rounded px-1.5 py-0.5 ${FLAG_STYLES[s.flag] || FLAG_STYLES.neutral}`}>{(s.flag || "neutral").toUpperCase()}</span> },
    { key: "source", header: "Source", render: (s) => <span className="text-[11px] text-slate-500">{s.source?.replace(/_/g, " ")}</span> },
    { key: "application", header: "Application", render: (s) => apps[s.application_id] ? <Link to={`/applications/${s.application_id}`} className="text-sm text-[#0d9488] hover:underline">{apps[s.application_id].application_number || s.application_id?.slice(-8)}</Link> : null },
  ];

  return (
    <div className="min-h-screen bg-[#f7f8fa] text-slate-900">
      <Nav />
      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight">Risk Signals</h1>
          <p className="text-sm text-slate-500 mt-1">Structured risk signals across all applications.</p>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <p className="text-sm text-rose-700">{error}</p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="flex items-center gap-1.5 flex-wrap">
            {FILTERS.map((f) => (
              <button key={f} onClick={() => setFilter(f)} className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${filter === f ? "bg-[#0a0c12] text-white" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
                {f}
              </button>
            ))}
          </div>
          <div className="relative sm:ml-auto sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search signals…" className="w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10" />
          </div>
        </div>

        {loading ? (
          <div className="rounded-xl border border-slate-200 bg-white p-10 flex items-center justify-center gap-3">
            <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />
            <span className="text-sm text-slate-500">Loading risk signals…</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-12 text-center">
            <ShieldAlert className="w-8 h-8 text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-400">No risk signals found. Run analysis on an application to generate signals.</p>
          </div>
        ) : (
          <ResponsiveTable
            columns={columns}
            data={filtered}
            rowKey={(s) => s.id}
          />
        )}
      </div>
    </div>
  );
}