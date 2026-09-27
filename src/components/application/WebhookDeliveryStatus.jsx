import React, { useEffect, useState } from "react";
import { Webhook, CheckCircle2, XCircle, Clock, Loader2, ChevronDown, ChevronUp, RefreshCw, ExternalLink } from "lucide-react";
import { base44 } from "@/api/base44Client";

const STATUS_STYLE = {
  delivered: { icon: CheckCircle2, cls: "text-emerald-600 bg-emerald-50 border-emerald-200", label: "Delivered" },
  failed: { icon: XCircle, cls: "text-rose-600 bg-rose-50 border-rose-200", label: "Failed" },
  pending: { icon: Clock, cls: "text-amber-600 bg-amber-50 border-amber-200", label: "Pending retry" },
};

function maskUrl(url) {
  try {
    const u = new URL(url);
    const host = u.host;
    const path = u.pathname.length > 1 ? u.pathname.slice(0, 12) : "";
    return `${host}${path}${u.pathname.length > 13 ? "…" : ""}`;
  } catch {
    return url?.slice(0, 40) || "—";
  }
}

export default function WebhookDeliveryStatus({ decisionId, applicationId }) {
  const [deliveries, setDeliveries] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const load = async (silent = false) => {
    if (silent) setRefreshing(true); else setLoading(true);
    try {
      const filter = decisionId ? { decision_id: decisionId } : { application_id: applicationId };
      const recs = await base44.entities.WebhookDelivery.filter(filter, "-created_date", 50);
      setDeliveries(recs);
    } catch {
      setDeliveries([]);
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [decisionId, applicationId]);

  if (loading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-4 flex items-center gap-2 text-sm text-slate-400">
        <Loader2 className="w-4 h-4 animate-spin" /> Loading webhook delivery status…
      </div>
    );
  }

  if (!deliveries || deliveries.length === 0) return null;

  const counts = deliveries.reduce((acc, d) => {
    acc[d.status] = (acc[d.status] || 0) + 1;
    return acc;
  }, {});
  const allDelivered = counts.failed === 0 && counts.pending === 0;
  const hasFailures = (counts.failed || 0) > 0;
  const hasPending = (counts.pending || 0) > 0;

  const summaryIcon = allDelivered ? CheckCircle2 : hasFailures ? XCircle : Clock;
  const summaryCls = allDelivered
    ? "border-emerald-200 bg-emerald-50/50"
    : hasFailures
      ? "border-rose-200 bg-rose-50/50"
      : "border-amber-200 bg-amber-50/50";
  const SIcon = summaryIcon;

  return (
    <div className={`rounded-xl border ${summaryCls} p-4`}>
      <div className="flex items-center gap-3">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${allDelivered ? "bg-emerald-100" : hasFailures ? "bg-rose-100" : "bg-amber-100"}`}>
          <SIcon className={`w-4 h-4 ${allDelivered ? "text-emerald-600" : hasFailures ? "text-rose-600" : "text-amber-600"}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <Webhook className="w-3.5 h-3.5 text-slate-400" />
            <h3 className="text-sm font-semibold text-slate-900">Decision webhooks</h3>
          </div>
          <p className="text-[12px] text-slate-500 mt-0.5">
            {deliveries.length} delivery {deliveries.length === 1 ? "attempt" : "attempts"} ·{" "}
            {counts.delivered || 0} delivered
            {counts.failed ? ` · ${counts.failed} failed` : ""}
            {counts.pending ? ` · ${counts.pending} retrying` : ""}
          </p>
        </div>
        <button
          onClick={() => load(true)}
          disabled={refreshing}
          className="text-[12px] text-slate-500 hover:text-slate-900 inline-flex items-center gap-1 px-2 py-1 rounded-md hover:bg-white/60 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} /> Refresh
        </button>
        <button
          onClick={() => setExpanded((v) => !v)}
          className="text-[12px] text-slate-500 hover:text-slate-900 inline-flex items-center gap-1 px-2 py-1 rounded-md hover:bg-white/60 transition-colors"
        >
          {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />} Details
        </button>
      </div>

      {expanded && (
        <div className="mt-3 space-y-1.5">
          {deliveries.map((d, i) => {
            const st = STATUS_STYLE[d.status] || STATUS_STYLE.pending;
            const StIcon = st.icon;
            return (
              <div key={d.id || i} className="flex items-center gap-2.5 text-[12px] py-1.5 px-2.5 rounded-lg bg-white/70 border border-slate-200/60">
                <StIcon className={`w-3.5 h-3.5 shrink-0 ${st.cls.split(" ")[0]}`} />
                <span className="font-mono text-[11px] text-slate-500 shrink-0 w-28 truncate">{d.event}</span>
                <span className="text-slate-700 font-medium truncate flex-1">{maskUrl(d.url)}</span>
                {d.http_status != null && (
                  <span className={`font-mono text-[11px] shrink-0 ${d.http_status >= 200 && d.http_status < 300 ? "text-emerald-600" : "text-rose-600"}`}>
                    {d.http_status}
                  </span>
                )}
                {d.attempt > 1 && (
                  <span className="text-[10px] text-slate-400 shrink-0">attempt {d.attempt}</span>
                )}
                {d.next_retry_at && d.status === "pending" && (
                  <span className="text-[10px] text-amber-600 shrink-0 inline-flex items-center gap-0.5">
                    <Clock className="w-3 h-3" /> retry queued
                  </span>
                )}
                {d.error && (
                  <span className="text-[10px] text-rose-500 truncate max-w-[30%]" title={d.error}>{d.error}</span>
                )}
              </div>
            );
          })}
          <p className="text-[11px] text-slate-400 pt-1 flex items-center gap-1">
            <ExternalLink className="w-3 h-3" />
            Manage endpoints and view full delivery logs in <span className="font-medium text-slate-600">Webhooks</span>.
          </p>
        </div>
      )}
    </div>
  );
}