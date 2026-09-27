import React, { useEffect, useState, useMemo } from "react";
import DrawerSelect from "@/components/ui/drawer-select";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import Nav from "@/components/layout/Nav.jsx";
import { Loader2, AlertTriangle, Plus, Search, FileText, Download, CheckCircle2, XCircle, Clock } from "lucide-react";
import { AppStatusBadge, DecisionBadge } from "@/components/application/StatusBadge";
import EmptyState from "@/components/shared/EmptyState";
import ErrorState from "@/components/shared/ErrorState";
import PullToRefresh from "@/components/PullToRefresh";
import ResponsiveTable from "@/components/shared/ResponsiveTable";
import GuidedPipeline from "@/components/applications/GuidedPipeline";
import NewApplicationModal from "@/components/applications/NewApplicationModal";

// Priority order: actionable states (New, Pending) first, then in-flight, then done.
const STATUS_PRIORITY = {
  draft: 0,
  data_collection: 1,
  analyzing: 2,
  underwriting: 3,
  completed: 4,
  failed: 5,
};

const FILTERS = ["All", "New", "Pending", "Analyzing", "Review", "Approved", "Declined"];

export default function Applications() {
  const navigate = useNavigate();
  const [apps, setApps] = useState([]);
  const [borrowers, setBorrowers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [market, setMarket] = useState("All");
  const [refreshing, setRefreshing] = useState(false);
  const urlParams = new URLSearchParams(window.location.search);
  const guidedApp = urlParams.get("guided") === "1" ? urlParams.get("app") : null;
  const [guided, setGuided] = useState(!!guidedApp);
  const [newModalOpen, setNewModalOpen] = useState(false);

  const load = async (silent = false) => {
    if (!silent) setLoading(true);
    setError(null);
    try {
      const res = await base44.functions.invoke("apiApplications", { action: "list", limit: 100 });
      const list = res.data?.applications || [];
      setApps(list);
      const borrowerIds = [...new Set(list.map((a) => a.borrower_id).filter(Boolean))];
      const borrowerMap = {};
      if (borrowerIds.length > 0) {
        try {
          const bRes = await base44.functions.invoke("apiBorrowers", { action: "batch", borrower_ids: borrowerIds });
          (bRes.data?.borrowers || []).forEach((b) => { borrowerMap[b.id] = b; });
        } catch {}
      }
      setBorrowers(borrowerMap);
    } catch (e) {
      setError(e?.response?.data?.error?.message || e.message || "Failed to load applications.");
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try { await load(true); } finally { setRefreshing(false); }
  };

  useEffect(() => { load(); }, []);

  // Counts per filter — drives the badges on the filter pills.
  const counts = useMemo(() => {
    const c = { All: apps.length, New: 0, Pending: 0, Analyzing: 0, Review: 0, Approved: 0, Declined: 0 };
    apps.forEach((a) => {
      if (a.status === "draft") c.New++;
      if (a.status === "data_collection") c.Pending++;
      if (a.status === "analyzing") c.Analyzing++;
      if (a.status === "underwriting" || a.decision === "REVIEW") c.Review++;
      if (a.decision === "APPROVE") c.Approved++;
      if (a.decision === "DECLINE") c.Declined++;
    });
    return c;
  }, [apps]);

  const filtered = useMemo(() => {
    let result = apps;
    if (filter !== "All") {
      result = result.filter((a) => {
        switch (filter) {
          case "New": return a.status === "draft";
          case "Pending": return a.status === "data_collection";
          case "Analyzing": return a.status === "analyzing";
          case "Review": return a.status === "underwriting" || a.decision === "REVIEW";
          case "Approved": return a.decision === "APPROVE";
          case "Declined": return a.decision === "DECLINE";
          default: return true;
        }
      });
    }
    if (market !== "All") {
      result = result.filter((a) => (a.market || "GB") === market);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((a) => {
        const b = borrowers[a.borrower_id];
        const name = b ? `${b.first_name} ${b.last_name}`.toLowerCase() : "";
        return (a.application_number || "").toLowerCase().includes(q) || name.includes(q);
      });
    }
    // Priority sort: actionable first, then most recently updated.
    return [...result].sort((a, b) => {
      const pa = STATUS_PRIORITY[a.status] ?? 99;
      const pb = STATUS_PRIORITY[b.status] ?? 99;
      if (pa !== pb) return pa - pb;
      return new Date(b.updated_date || b.created_date || 0) - new Date(a.updated_date || a.created_date || 0);
    });
  }, [apps, filter, market, search, borrowers]);

  const fmtMoney = (n, c) => new Intl.NumberFormat("en-US", { style: "currency", currency: (c || "GBP").toUpperCase(), maximumFractionDigits: 0 }).format(n || 0);

  const guidedAppRecord = guidedApp ? apps.find((a) => a.id === guidedApp) : null;
  const guidedBorrower = guidedAppRecord ? borrowers[guidedAppRecord.borrower_id] : null;
  const guidedBorrowerName = guidedBorrower ? `${guidedBorrower.first_name} ${guidedBorrower.last_name}`.trim() : null;
  const guidedLoanAmount = guidedAppRecord ? fmtMoney(guidedAppRecord.loan_amount, guidedAppRecord.loan_currency) : null;

  const exportCsv = () => {
    const headers = ["Application number", "Applicant", "Email", "Market", "Product", "Loan amount", "Currency", "Risk score", "Probability of default", "Policy", "Status", "Decision", "Updated"];
    const rows = filtered.map((a) => {
      const b = borrowers[a.borrower_id];
      return [
        a.application_number || a.id,
        b ? `${b.first_name} ${b.last_name}` : "",
        b?.email || "",
        a.market || "GB",
        a.product_type || "personal_loan",
        a.loan_amount ?? "",
        a.loan_currency || "",
        a.risk_score ?? "",
        a.probability_of_default ?? "",
        a.policy_id || "",
        a.status || "",
        a.decision || "",
        a.updated_date || a.created_date || "",
      ];
    });
    const csv = [headers, ...rows].map((r) => r.map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `applications-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const columns = [
    {
      key: "applicant", header: "Applicant", mobileTitle: true,
      render: (a) => {
        const b = borrowers[a.borrower_id];
        return (
          <>
            <div className="text-sm font-medium text-slate-900">{b ? `${b.first_name} ${b.last_name}` : "—"}</div>
            <div className="text-[11px] text-slate-400 font-mono">{a.application_number || a.id.slice(-8)}</div>
          </>
        );
      },
    },
    { key: "loan", header: "Loan", render: (a) => <span className="text-sm text-slate-600 capitalize">{(a.product_type || "personal_loan").replace(/_/g, " ")}</span> },
    { key: "amount", header: "Amount", render: (a) => <span className="text-sm font-medium text-slate-900 tabular-nums">{fmtMoney(a.loan_amount, a.loan_currency)}</span> },
    {
      key: "risk", header: "Risk",
      render: (a) => a.risk_score != null ? (
        <span className={`text-xs font-medium tabular-nums ${a.risk_score < 30 ? "text-emerald-600" : a.risk_score < 60 ? "text-amber-600" : "text-rose-600"}`}>{a.risk_score.toFixed(1)}</span>
      ) : <span className="text-sm text-slate-300">—</span>,
    },
    { key: "policy", header: "Policy", render: (a) => <span className="text-[11px] font-mono text-slate-500">{a.policy_id || "—"}</span> },
    {
      key: "status", header: "Status",
      render: (a) => (
        <span className="inline-flex flex-col items-start gap-1">
          <AppStatusBadge status={a.status} />
          <DecisionBadge decision={a.decision} />
        </span>
      ),
    },
    { key: "updated", header: "Updated", render: (a) => <span className="text-[11px] text-slate-400 tabular-nums">{a.updated_date ? new Date(a.updated_date).toLocaleDateString("en-GB") : a.created_date ? new Date(a.created_date).toLocaleDateString("en-GB") : ""}</span> },
  ];

  return (
    <div className="min-h-screen bg-[#f7f8fa] text-slate-900">
      <Nav />
      <PullToRefresh onRefresh={handleRefresh} isRefreshing={refreshing}>
      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Applications</h1>
            <p className="text-sm text-slate-500 mt-1">Manage and review all underwriting applications.</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={exportCsv}
              disabled={filtered.length === 0}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-700 bg-white border border-slate-200 px-4 py-2.5 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Download className="w-4 h-4" /> Export CSV
            </button>
            <button
              onClick={() => setNewModalOpen(true)}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-white bg-[#0a0c12] px-4 py-2.5 rounded-lg hover:bg-[#1c1f26] transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" /> New Application
            </button>
          </div>
        </div>

        {error && <div className="mb-4"><ErrorState message={error} onRetry={load} /></div>}

        {!loading && !error && <StatsBand counts={counts} />}

        {/* Filters + Search */}
        <div className="flex flex-col lg:flex-row gap-3 mb-4">
          <div className="flex items-center gap-1.5 flex-wrap">
            {FILTERS.map((f) => {
              const active = filter === f;
              const count = counts[f] ?? 0;
              return (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${active ? "bg-[#0a0c12] text-white" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"}`}
                >
                  {f}
                  <span className={`text-[10px] font-semibold tabular-nums px-1.5 py-0.5 rounded ${active ? "bg-white/15 text-white" : "bg-slate-100 text-slate-500"}`}>{count}</span>
                </button>
              );
            })}
          </div>
          <div className="flex items-center gap-2 lg:ml-auto">
            <DrawerSelect
              value={market}
              onChange={(e) => setMarket(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
            >
              <option value="All">All markets</option>
              <option value="GB">United Kingdom</option>
              <option value="US">United States</option>
              <option value="NG">Nigeria</option>
              <option value="ZA">South Africa</option>
              <option value="KE">Kenya</option>
              <option value="GH">Ghana</option>
            </DrawerSelect>
            <div className="relative w-56">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search applications…"
                className="w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10"
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="rounded-xl border border-slate-200 bg-white p-10 flex items-center justify-center gap-3">
            <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />
            <span className="text-sm text-slate-500">Loading applications…</span>
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState icon={FileText} title="No applications found" description="Try adjusting your filters, or create a new application to get started." actionLabel="New Application" actionIcon={Plus} onAction={() => setNewModalOpen(true)} />
        ) : (
          <ResponsiveTable
            columns={columns}
            data={filtered}
            rowKey={(a) => a.id}
            rowClassName={(a) => (a.id === guidedApp ? "ring-2 ring-teal-400 ring-inset" : "")}
            onRowClick={(a) => navigate(`/applications/${a.id}${a.id === guidedApp && guided ? "?guided=1" : ""}`)}
          />
        )}
      </div>
      </PullToRefresh>
      {guided && guidedApp && (
        <GuidedPipeline
          borrowerName={guidedBorrowerName}
          loanAmount={guidedLoanAmount}
          onOpen={() => navigate(`/applications/${guidedApp}?guided=1`)}
          onSkip={() => setGuided(false)}
        />
      )}
      <NewApplicationModal
        open={newModalOpen}
        onClose={() => setNewModalOpen(false)}
        apps={apps}
        borrowers={borrowers}
      />
    </div>
  );
}

function StatsBand({ counts }) {
  const stats = [
    { label: "Total", value: counts.All, icon: FileText, color: "text-slate-700", bg: "bg-slate-100", ring: "ring-slate-100" },
    { label: "Approved", value: counts.Approved, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50", ring: "ring-emerald-100" },
    { label: "In review", value: counts.Review, icon: AlertTriangle, color: "text-amber-600", bg: "bg-amber-50", ring: "ring-amber-100" },
    { label: "Declined", value: counts.Declined, icon: XCircle, color: "text-rose-600", bg: "bg-rose-50", ring: "ring-rose-100" },
    { label: "Pending", value: counts.New + counts.Pending, icon: Clock, color: "text-sky-600", bg: "bg-sky-50", ring: "ring-sky-100" },
  ];
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-5">
      {stats.map((s) => (
        <div key={s.label} className="rounded-xl border border-slate-200 bg-white p-4 hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <div className={`w-8 h-8 rounded-lg ${s.bg} flex items-center justify-center ring-1 ${s.ring}`}>
              <s.icon className={`w-4 h-4 ${s.color}`} />
            </div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">{s.label}</span>
          </div>
          <div className="text-2xl font-semibold tabular-nums text-slate-900">{s.value}</div>
        </div>
      ))}
    </div>
  );
}