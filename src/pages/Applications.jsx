import React, { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import Nav from "@/components/layout/Nav.jsx";
import { Loader2, AlertTriangle, Plus, Search, Filter } from "lucide-react";
import { AppStatusBadge, DecisionBadge } from "@/components/application/StatusBadge";

const FILTERS = ["All", "New", "Analyzing", "Review", "Approved", "Declined"];

export default function Applications() {
  const navigate = useNavigate();
  const [apps, setApps] = useState([]);
  const [borrowers, setBorrowers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await base44.functions.invoke("apiApplications", { action: "list", limit: 100 });
      const list = res.data?.applications || [];
      setApps(list);
      // Load borrowers for each app
      const borrowerIds = [...new Set(list.map((a) => a.borrower_id).filter(Boolean))];
      const borrowerMap = {};
      await Promise.all(borrowerIds.map(async (id) => {
        try {
          const b = await base44.functions.invoke("apiBorrowers", { action: "get", borrower_id: id });
          if (b.data?.borrower) borrowerMap[id] = b.data.borrower;
        } catch {}
      }));
      setBorrowers(borrowerMap);
    } catch (e) {
      setError(e?.response?.data?.error?.message || e.message || "Failed to load applications.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    let result = apps;
    if (filter !== "All") {
      const filterMap = {
        "New": "draft",
        "Analyzing": "analyzing",
        "Review": "underwriting",
        "Approved": "APPROVE",
        "Declined": "DECLINE",
      };
      const target = filterMap[filter];
      result = result.filter((a) => a.status === target || a.decision === target);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((a) => {
        const b = borrowers[a.borrower_id];
        const name = b ? `${b.first_name} ${b.last_name}`.toLowerCase() : "";
        return (a.application_number || "").toLowerCase().includes(q) || name.includes(q);
      });
    }
    return result;
  }, [apps, filter, search, borrowers]);

  const fmtMoney = (n, c) => new Intl.NumberFormat("en-US", { style: "currency", currency: (c || "GBP").toUpperCase(), maximumFractionDigits: 0 }).format(n || 0);

  return (
    <div className="min-h-screen bg-[#f7f8fa] text-slate-900">
      <Nav />
      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Applications</h1>
            <p className="text-sm text-slate-500 mt-1">Manage and review all underwriting applications.</p>
          </div>
          <Link
            to="/applications/new"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-white bg-[#0a0c12] px-4 py-2.5 rounded-lg hover:bg-[#1c1f26] transition-colors"
          >
            <Plus className="w-4 h-4" /> New Application
          </Link>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <p className="text-sm text-rose-700">{error}</p>
          </div>
        )}

        {/* Filters + Search */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="flex items-center gap-1.5 flex-wrap">
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${filter === f ? "bg-[#0a0c12] text-white" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"}`}
              >
                {f}
              </button>
            ))}
          </div>
          <div className="relative sm:ml-auto sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search applications…"
              className="w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10"
            />
          </div>
        </div>

        {loading ? (
          <div className="rounded-xl border border-slate-200 bg-white p-10 flex items-center justify-center gap-3">
            <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />
            <span className="text-sm text-slate-500">Loading applications…</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-12 text-center">
            <p className="text-sm text-slate-400 mb-3">No applications found.</p>
            <Link to="/applications/new" className="inline-flex items-center gap-1.5 text-sm font-medium text-[#0d9488]">
              <Plus className="w-4 h-4" /> Create your first application
            </Link>
          </div>
        ) : (
          <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="text-left text-[11px] uppercase tracking-wider text-slate-400 font-semibold px-5 py-3">Applicant</th>
                  <th className="text-left text-[11px] uppercase tracking-wider text-slate-400 font-semibold px-5 py-3">Loan</th>
                  <th className="text-left text-[11px] uppercase tracking-wider text-slate-400 font-semibold px-5 py-3">Amount</th>
                  <th className="text-left text-[11px] uppercase tracking-wider text-slate-400 font-semibold px-5 py-3">Risk</th>
                  <th className="text-left text-[11px] uppercase tracking-wider text-slate-400 font-semibold px-5 py-3">Policy</th>
                  <th className="text-left text-[11px] uppercase tracking-wider text-slate-400 font-semibold px-5 py-3">Status</th>
                  <th className="text-left text-[11px] uppercase tracking-wider text-slate-400 font-semibold px-5 py-3">Updated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((a) => {
                  const b = borrowers[a.borrower_id];
                  return (
                    <tr key={a.id} className="hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => navigate(`/applications/${a.id}`)}>
                      <td className="px-5 py-3">
                        <div className="text-sm font-medium text-slate-900">{b ? `${b.first_name} ${b.last_name}` : "—"}</div>
                        <div className="text-[11px] text-slate-400">{a.application_number || a.id.slice(-8)}</div>
                      </td>
                      <td className="px-5 py-3 text-sm text-slate-600 capitalize">{(a.product_type || "personal_loan").replace(/_/g, " ")}</td>
                      <td className="px-5 py-3 text-sm font-medium text-slate-900">{fmtMoney(a.loan_amount, a.loan_currency)}</td>
                      <td className="px-5 py-3">
                        {a.risk_score != null ? (
                          <span className={`text-xs font-medium tabular-nums ${a.risk_score < 30 ? "text-emerald-600" : a.risk_score < 60 ? "text-amber-600" : "text-rose-600"}`}>
                            {a.risk_score.toFixed(1)}
                          </span>
                        ) : "—"}
                      </td>
                      <td className="px-5 py-3 text-[11px] font-mono text-slate-500">{a.policy_id || "—"}</td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-1.5">
                          <AppStatusBadge status={a.status} />
                          <DecisionBadge decision={a.decision} />
                        </div>
                      </td>
                      <td className="px-5 py-3 text-[11px] text-slate-400">{a.updated_date ? new Date(a.updated_date).toLocaleDateString() : a.created_date ? new Date(a.created_date).toLocaleDateString() : ""}</td>
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