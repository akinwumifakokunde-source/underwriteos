import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import Nav from "@/components/layout/Nav.jsx";
import { Loader2, AlertTriangle, Search, Brain, ShieldCheck, GitBranch } from "lucide-react";

const DECISION_STYLES = {
  APPROVE: "bg-emerald-50 text-emerald-700 border-emerald-200",
  REVIEW: "bg-amber-50 text-amber-700 border-amber-200",
  DECLINE: "bg-rose-50 text-rose-700 border-rose-200",
};

const FILTERS = ["All", "Approve", "Review", "Decline"];

export default function Decisions() {
  const [decisions, setDecisions] = useState([]);
  const [recommendations, setRecommendations] = useState({});
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
      const decs = await base44.entities.UnderwritingDecision.filter({ organization_id: oid }, "-created_date", 100);
      setDecisions(decs);
      // Load related applications and recommendations
      const appIds = [...new Set(decs.map((d) => d.application_id).filter(Boolean))];
      const recIds = [...new Set(decs.map((d) => d.recommendation_id).filter(Boolean))];
      const appMap = {};
      const recMap = {};
      await Promise.all([
        ...appIds.map(async (id) => {
          try { const a = await base44.entities.Application.filter({ id, organization_id: oid }, "-created_date", 1); if (a[0]) appMap[id] = a[0]; } catch {}
        }),
        ...recIds.map(async (id) => {
          try { const r = await base44.entities.UnderwritingRecommendation.filter({ id, organization_id: oid }, "-created_date", 1); if (r[0]) recMap[id] = r[0]; } catch {}
        }),
      ]);
      setApps(appMap);
      setRecommendations(recMap);
    } catch (e) {
      setError(e?.message || "Failed to load decisions.");
    } finally {
      setLoading(false);
    }
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

  return (
    <div className="min-h-screen bg-[#f7f8fa] text-slate-900">
      <Nav />
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
          <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="text-left text-[11px] uppercase tracking-wider text-slate-400 font-semibold px-5 py-3">Application</th>
                  <th className="text-left text-[11px] uppercase tracking-wider text-slate-400 font-semibold px-5 py-3">Loan amount</th>
                  <th className="text-left text-[11px] uppercase tracking-wider text-slate-400 font-semibold px-5 py-3">Policy</th>
                  <th className="text-left text-[11px] uppercase tracking-wider text-slate-400 font-semibold px-5 py-3">Risk score</th>
                  <th className="text-left text-[11px] uppercase tracking-wider text-slate-400 font-semibold px-5 py-3">AI rec</th>
                  <th className="text-left text-[11px] uppercase tracking-wider text-slate-400 font-semibold px-5 py-3">Policy</th>
                  <th className="text-left text-[11px] uppercase tracking-wider text-slate-400 font-semibold px-5 py-3">Final</th>
                  <th className="text-left text-[11px] uppercase tracking-wider text-slate-400 font-semibold px-5 py-3">Source</th>
                  <th className="text-left text-[11px] uppercase tracking-wider text-slate-400 font-semibold px-5 py-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((d) => {
                  const app = apps[d.application_id];
                  const rec = recommendations[d.recommendation_id];
                  return (
                    <tr key={d.id} className="hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => window.location.href = `/applications/${d.application_id}`}>
                      <td className="px-5 py-3">
                        <div className="text-sm font-medium text-slate-900">{app?.application_number || d.application_id?.slice(-8)}</div>
                      </td>
                      <td className="px-5 py-3 text-sm text-slate-600">{app ? fmtMoney(app.loan_amount, app.loan_currency) : "—"}</td>
                      <td className="px-5 py-3 text-[11px] font-mono text-slate-500">{d.policy_id} v{d.policy_version}</td>
                      <td className="px-5 py-3">
                        {d.risk_score != null ? <span className={`text-xs font-medium tabular-nums ${d.risk_score < 30 ? "text-emerald-600" : d.risk_score < 60 ? "text-amber-600" : "text-rose-600"}`}>{d.risk_score.toFixed(1)}</span> : "—"}
                      </td>
                      <td className="px-5 py-3">
                        {rec && <span className={`text-[10px] font-medium border rounded px-1.5 py-0.5 ${DECISION_STYLES[rec.recommendation] || ""}`}>{rec.recommendation}</span>}
                      </td>
                      <td className="px-5 py-3">
                        <span className={`text-[10px] font-medium border rounded px-1.5 py-0.5 ${DECISION_STYLES[d.decision] || ""}`}>{d.decision}</span>
                      </td>
                      <td className="px-5 py-3">
                        <span className={`text-[10px] font-bold border rounded px-1.5 py-0.5 ${DECISION_STYLES[d.decision] || ""}`}>{d.decision}</span>
                      </td>
                      <td className="px-5 py-3 text-[11px] text-slate-500">{d.decision_source?.replace(/_/g, " ")}</td>
                      <td className="px-5 py-3 text-[11px] text-slate-400">{d.decision_timestamp ? new Date(d.decision_timestamp).toLocaleDateString() : d.created_date ? new Date(d.created_date).toLocaleDateString() : ""}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}