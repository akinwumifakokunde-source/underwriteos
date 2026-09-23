import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import Nav from "@/components/layout/Nav.jsx";
import PullToRefresh from "@/components/PullToRefresh";
import ResponsiveTable from "@/components/shared/ResponsiveTable";
import EmptyState from "@/components/shared/EmptyState";
import ErrorState from "@/components/shared/ErrorState";
import { Loader2, Search, Download, Wallet, AlertTriangle, XCircle, CheckCircle2 } from "lucide-react";

// Link IV of the credit supply chain — everything after disbursement.
// This is where portfolio P&L is actually decided. We surface the post-
// disbursement book from the same LoanOutcome records that feed calibration,
// so collections and model monitoring share one source of truth.

const FILTERS = ["All", "Performing", "At-risk", "Defaulted", "Repaid"];

const STATUS_BADGE = {
  repaid: "bg-[#e6f7f3] text-[#0d9488] border-[#0d9488]/20",
  active: "bg-blue-50 text-blue-700 border-blue-200",
  late: "bg-amber-50 text-amber-700 border-amber-200",
  defaulted: "bg-red-50 text-red-700 border-red-200",
};

function fmtMoney(n, c) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: (c || "GBP").toUpperCase(),
    maximumFractionDigits: 0,
  }).format(n || 0);
}

function pct(n) {
  if (n == null || Number.isNaN(n)) return "—";
  return `${(n * 100).toFixed(1)}%`;
}

export default function Collections() {
  const navigate = useNavigate();
  const [outcomes, setOutcomes] = useState([]);
  const [borrowers, setBorrowers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [refreshing, setRefreshing] = useState(false);

  const load = async (silent = false) => {
    if (!silent) setLoading(true);
    setError(null);
    try {
      const res = await base44.functions.invoke("apiOutcomes", { action: "list" });
      const list = res.data?.outcomes || [];
      setOutcomes(list);
      const borrowerIds = [...new Set(list.map((o) => o.borrower_id).filter(Boolean))];
      const map = {};
      if (borrowerIds.length > 0) {
        try {
          const bRes = await base44.functions.invoke("apiBorrowers", { action: "batch", borrower_ids: borrowerIds });
          (bRes.data?.borrowers || []).forEach((b) => { map[b.id] = b; });
        } catch {}
      }
      setBorrowers(map);
    } catch (e) {
      setError(e?.response?.data?.error?.message || e.message || "Failed to load collections data.");
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try { await load(true); } finally { setRefreshing(false); }
  };

  useEffect(() => { load(); }, []);

  const stats = useMemo(() => {
    const performing = outcomes.filter((o) => o.status === "active").length;
    const atRisk = outcomes.filter((o) => o.status === "late").length;
    const defaulted = outcomes.filter((o) => o.status === "defaulted").length;
    const repaid = outcomes.filter((o) => o.status === "repaid").length;
    const exposureAtRisk = outcomes
      .filter((o) => o.status === "late" || o.status === "defaulted")
      .reduce((s, o) => s + (o.loan_amount || 0), 0);
    const currency = outcomes[0]?.loan_currency || "GBP";
    return { performing, atRisk, defaulted, repaid, exposureAtRisk, currency, total: outcomes.length };
  }, [outcomes]);

  const filtered = useMemo(() => {
    let result = outcomes;
    if (filter !== "All") {
      const map = { Performing: "active", "At-risk": "late", Defaulted: "defaulted", Repaid: "repaid" };
      result = result.filter((o) => o.status === map[filter]);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((o) => {
        const b = borrowers[o.borrower_id];
        const name = b ? `${b.first_name} ${b.last_name}`.toLowerCase() : "";
        return (o.application_id || "").toLowerCase().includes(q) || name.includes(q);
      });
    }
    return result;
  }, [outcomes, filter, search, borrowers]);

  const exportCsv = () => {
    const headers = ["Application", "Borrower", "Status", "Days past due", "Predicted PD", "Decision", "Loan amount", "Currency", "Observed"];
    const rows = filtered.map((o) => {
      const b = borrowers[o.borrower_id];
      return [
        o.application_id || "",
        b ? `${b.first_name} ${b.last_name}` : "",
        o.status || "",
        o.days_past_due ?? 0,
        o.predicted_pd ?? "",
        o.decision || "",
        o.loan_amount ?? "",
        o.loan_currency || "",
        o.observed_at || "",
      ];
    });
    const csv = [headers, ...rows].map((r) => r.map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `collections-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const STAT_CARDS = [
    { label: "Performing", value: stats.performing, icon: Wallet, tint: "text-blue-600" },
    { label: "At-risk (late)", value: stats.atRisk, icon: AlertTriangle, tint: "text-amber-600" },
    { label: "Defaulted", value: stats.defaulted, icon: XCircle, tint: "text-red-600" },
    { label: "Repaid", value: stats.repaid, icon: CheckCircle2, tint: "text-[#0d9488]" },
  ];

  const columns = [
    {
      key: "applicant", header: "Borrower", mobileTitle: true,
      render: (o) => {
        const b = borrowers[o.borrower_id];
        return (
          <>
            <div className="text-sm font-medium text-slate-900">{b ? `${b.first_name} ${b.last_name}` : "—"}</div>
            <div className="text-[11px] text-slate-400 font-mono">{o.application_id?.slice(-8)}</div>
          </>
        );
      },
    },
    { key: "amount", header: "Exposure", render: (o) => <span className="text-sm font-medium text-slate-900">{fmtMoney(o.loan_amount, o.loan_currency)}</span> },
    {
      key: "status", header: "Status",
      render: (o) => (
        <span className={`inline-flex items-center rounded border px-2 py-0.5 text-[11px] font-medium capitalize ${STATUS_BADGE[o.status] || "bg-slate-50 text-slate-600 border-slate-200"}`}>
          {o.status}
        </span>
      ),
    },
    { key: "dpd", header: "DPD", render: (o) => <span className="text-sm tabular-nums text-slate-600">{o.days_past_due || 0}</span> },
    {
      key: "pd", header: "Predicted PD",
      render: (o) => (
        <span className={`text-xs font-medium tabular-nums ${o.predicted_pd != null && o.predicted_pd > 0.3 ? "text-rose-600" : "text-slate-600"}`}>
          {o.predicted_pd != null ? pct(o.predicted_pd) : "—"}
        </span>
      ),
    },
    { key: "decision", header: "Decision", render: (o) => <span className="text-[11px] text-slate-500">{o.decision || "—"}</span> },
    { key: "observed", header: "Observed", render: (o) => <span className="text-[11px] text-slate-400">{o.observed_at ? new Date(o.observed_at).toLocaleDateString("en-GB") : "—"}</span> },
  ];

  return (
    <div className="min-h-screen bg-[#f7f8fa] text-slate-900">
      <Nav />
      <PullToRefresh onRefresh={handleRefresh} isRefreshing={refreshing}>
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-8">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Collections</h1>
              <p className="text-sm text-slate-500 mt-1 max-w-xl">
                Everything after disbursement — where the portfolio's P&amp;L is actually decided.
              </p>
            </div>
            <button
              onClick={exportCsv}
              disabled={filtered.length === 0}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-700 bg-white border border-slate-200 px-4 py-2.5 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Download className="w-4 h-4" /> Export CSV
            </button>
          </div>

          {/* Exposure at risk callout */}
          {!loading && !error && stats.total > 0 && (
            <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50/60 px-4 py-3 flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
              <p className="text-[13px] text-amber-800">
                <span className="font-semibold">{fmtMoney(stats.exposureAtRisk, stats.currency)}</span> exposure at risk
                across {stats.atRisk + stats.defaulted} late or defaulted loans.
              </p>
            </div>
          )}

          {error && <div className="mb-4"><ErrorState message={error} onRetry={load} /></div>}

          {/* Stats */}
          {!loading && !error && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {STAT_CARDS.map((st) => {
                const Icon = st.icon;
                return (
                  <div key={st.label} className="rounded-xl border border-slate-200 bg-white p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[12px] text-slate-500">{st.label}</span>
                      <Icon className={`w-4 h-4 ${st.tint}`} />
                    </div>
                    <div className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">{st.value}</div>
                  </div>
                );
              })}
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
            <div className="flex items-center gap-2 sm:ml-auto">
              <div className="relative w-56">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search borrowers…"
                  className="w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                />
              </div>
            </div>
          </div>

          {loading ? (
            <div className="rounded-xl border border-slate-200 bg-white p-10 flex items-center justify-center gap-3">
              <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />
              <span className="text-sm text-slate-500">Loading collections…</span>
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={Wallet}
              title="No loans in collections yet"
              description="Record loan outcomes from the Calibration page to track your post-disbursement portfolio here."
              actionLabel="Go to Calibration"
              actionTo="/monitoring"
            />
          ) : (
            <ResponsiveTable
              columns={columns}
              data={filtered}
              rowKey={(o) => o.id}
              onRowClick={(o) => navigate(`/applications/${o.application_id}`)}
            />
          )}
        </div>
      </PullToRefresh>
    </div>
  );
}