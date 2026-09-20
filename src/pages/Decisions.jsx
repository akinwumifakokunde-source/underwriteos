import React, { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import Nav from "@/components/layout/Nav.jsx";
import { Loader2, AlertTriangle, Search, Brain, ShieldCheck, GitBranch } from "lucide-react";
import PullToRefresh from "@/components/PullToRefresh";
import ResponsiveTable from "@/components/shared/ResponsiveTable";

const DECISION_STYLES = {
  APPROVE: "bg-emerald-50 text-emerald-700 border-emerald-200",
  REVIEW: "bg-amber-50 text-amber-700 border-amber-200",
  DECLINE: "bg-rose-50 text-rose-700 border-rose-200",
};

const FILTERS = ["All", "Approve", "Review", "Decline"];

export default function Decisions() {
  const navigate = useNavigate();
  const [decisions, setDecisions] = useState([]);
  const [recommendations, setRecommendations] = useState({});
  const [apps, setApps] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [refreshing, setRefreshing] = useState(false);

  const load = async (silent = false) => {
    if (!silent) setLoading(true);
    setError(null);
    try {
      const me = await base44.auth.me();
      const oid = me.data?.organization_id || me.organization_id;
      const decs = await base44.entities.UnderwritingDecision.filter({ organization_id: oid }, "-created_date", 100);
      setDecisions(decs);
      // Batch-load related applications and recommendations (avoid N+1 fetches)
      const [appList, recList] = await Promise.all([
        base44.entities.Application.filter({ organization_id: oid }, "-created_date", 100),
        base44.entities.UnderwritingRecommendation.filter({ organization_id: oid }, "-created_date", 100),
      ]);
      setApps(Object.fromEntries(appList.map((a) => [a.id, a])));
      setRecommendations(Object.fromEntries(recList.map((r) => [r.id, r])));
    } catch (e) {
      setError(e?.message || "Failed to load decisions.");
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try { await load(true); } finally { setRefreshing(false); }
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    let result = decisions;
    if (filter !== "All") result = result.filter((d) => d.decision === filter.toUpperCase());
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((d) => {
        const app = apps[d.application_id];
        return (d.application_id || "").toLowerCase().includes(q) || (app?.application_number || "").toLowerCase().includes(q);
      });
    }
    return result;
  }, [decisions, filter, search, apps]);

  const fmtMoney = (n, c) => new Intl.NumberFormat("en-US", { style: "currency", currency: (c || "GBP").toUpperCase(), maximumFractionDigits: 0 }).format(n || 0);

  const columns = [
    { key: "application", header: "Application", mobileTitle: true, render: (d) => <div className="text-sm font-medium text-slate-900">{apps[d.application_id]?.application_number || d.application_id?.slice(-8)}</div> },
    { key: "loan", header: "Loan amount", render: (d) => <span className="text-sm text-slate-600">{apps[d.application_id] ? fmtMoney(apps[d.application_id].loan_amount, apps[d.application_id].loan_currency) : "—"}</span> },
    { key: "policy", header: "Policy", render: (d) => <span className="text-[11px] font-mono text-slate-500">{d.policy_id} v{d.policy_version}</span> },
    { key: "risk", header: "Risk score", render: (d) => d.risk_score != null ? <span className={`text-xs font-medium tabular-nums ${d.risk_score < 30 ? "text-emerald-600" : d.risk_score < 60 ? "text-amber-600" : "text-rose-600"}`}>{d.risk_score.toFixed(1)}</span> : "—" },
    { key: "airec", header: "AI rec", render: (d) => recommendations[d.recommendation_id] ? <span className={`text-[10px] font-medium border rounded px-1.5 py-0.5 ${DECISION_STYLES[recommendations[d.recommendation_id].recommendation] || ""}`}>{recommendations[d.recommendation_id].recommendation}</span> : null },
    { key: "final", header: "Final", render: (d) => <span className={`text-[10px] font-bold border rounded px-1.5 py-0.5 ${DECISION_STYLES[d.decision] || ""}`}>{d.decision}</span> },
    { key: "source", header: "Source", render: (d) => <span className="text-[11px] text-slate-500">{d.decision_source?.replace(/_/g, " ")}</span> },
    { key: "date", header: "Date", render: (d) => <span className="text-[11px] text-slate-400">{d.decision_timestamp ? new Date(d.decision_timestamp).toLocaleDateString() : d.created_date ? new Date(d.created_date).toLocaleDateString() : ""}</span> },
  ];

  return (
    <div className="min-h-screen bg-[#f7f8fa] text-slate-900">
      <Nav />
      <PullToRefresh onRefresh={handleRefresh} isRefreshing={refreshing}>
      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight">Decisions</h1>
          <p className="text-sm text-slate-500 mt-1">All underwriting decisions with AI recommendations and policy evaluations.</p>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <p className="text-sm text-rose-700">{error}</p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="flex items-center gap-1.5">
            {FILTERS.map((f) => (
              <button key={f} onClick={() => setFilter(f)} className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${filter === f ? "bg-[#0a0c12] text-white" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
                {f}
              </button>
            ))}
          </div>
          <div className="relative sm:ml-auto sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search decisions…" className="w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10" />
          </div>
        </div>

        {loading ? (
          <div className="rounded-xl border border-slate-200 bg-white p-10 flex items-center justify-center gap-3">
            <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />
            <span className="text-sm text-slate-500">Loading decisions…</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-12 text-center">
            <p className="text-sm text-slate-400">No decisions found.</p>
          </div>
        ) : (
          <ResponsiveTable
            columns={columns}
            data={filtered}
            rowKey={(d) => d.id}
            onRowClick={(d) => navigate(`/applications/${d.application_id}`)}
          />
        )}
      </div>
      </PullToRefresh>
    </div>
  );
}