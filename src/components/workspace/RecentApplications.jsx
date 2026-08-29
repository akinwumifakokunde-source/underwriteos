import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Loader2, AlertTriangle, ArrowRight, Inbox } from "lucide-react";

const STATUS_LABELS = {
  draft: "New",
  data_collection: "Pending",
  analyzing: "Analyzing",
  underwriting: "Review",
  completed: "Done",
  failed: "Failed",
};

const DECISION_STYLES = {
  APPROVE: "text-emerald-700 bg-emerald-50 border-emerald-200",
  REVIEW: "text-amber-700 bg-amber-50 border-amber-200",
  DECLINE: "text-rose-700 bg-rose-50 border-rose-200",
};

function timeAgo(date) {
  if (!date) return "—";
  const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

export default function RecentApplications() {
  const [apps, setApps] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await base44.functions.invoke("apiApplications", { action: "list", limit: 6 });
        if (!alive) return;
        setApps(res.data?.applications || []);
      } catch (e) {
        if (!alive) return;
        setError(e?.response?.data?.error?.message || e.message || "Failed to load applications.");
        setApps([]);
      }
    })();
    return () => { alive = false; };
  }, []);

  return (
    <div className="max-w-3xl mx-auto px-5 sm:px-8 pb-2">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-teal-600 mb-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-500" /> Your pipeline
          </div>
          <h2 className="text-2xl font-semibold tracking-tight">Recent applications</h2>
        </div>
        <Link to="/applications" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900">
          View all <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {apps === null ? (
        <div className="rounded-xl border border-slate-200 bg-white p-10 flex items-center justify-center gap-3">
          <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />
          <span className="text-sm text-slate-500">Loading…</span>
        </div>
      ) : error ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <p className="text-sm text-rose-700">{error}</p>
        </div>
      ) : apps.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center">
          <Inbox className="w-7 h-7 text-slate-300 mx-auto mb-2.5" />
          <p className="text-sm text-slate-500 mb-3">No applications yet. Start a new one above.</p>
        </div>
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white divide-y divide-slate-100 overflow-hidden">
          {apps.map((a) => {
            const decision = a.decision && a.decision !== "null" ? a.decision : null;
            return (
              <Link key={a.id} to={`/applications/${a.id}`} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-900 truncate">
                      {a.application_number || `App ${a.id.slice(0, 6)}`}
                    </span>
                    {decision && (
                      <span className={`text-[10px] font-medium border rounded px-1.5 py-0.5 ${DECISION_STYLES[decision]}`}>
                        {decision}
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {a.market || "GB"} · {a.borrower_type || "salaried"} · updated {timeAgo(a.updated_date)}
                  </div>
                </div>
                <span className="text-[11px] text-slate-500 shrink-0">{STATUS_LABELS[a.status] || a.status}</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}