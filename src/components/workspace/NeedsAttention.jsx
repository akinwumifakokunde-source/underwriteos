import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { AlertCircle, ChevronRight } from "lucide-react";

const STUCK_MS = 1000 * 60 * 60 * 24; // 24h

export default function NeedsAttention() {
  const navigate = useNavigate();
  const [items, setItems] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await base44.functions.invoke("apiApplications", { action: "list", limit: 100 });
        if (!alive) return;
        const apps = res.data?.applications || [];
        const now = Date.now();
        const flagged = apps
          .map((a) => {
            const reasons = [];
            if (a.human_review_required || a.decision === "REVIEW") reasons.push("Awaiting human review");
            if (a.status === "data_collection") reasons.push("Missing information");
            if (a.status === "failed") reasons.push("Processing failed");
            const updated = a.updated_date ? new Date(a.updated_date).getTime() : 0;
            if ((a.status === "analyzing" || a.status === "underwriting") && updated && now - updated > STUCK_MS) {
              reasons.push("Stuck in progress");
            }
            return { app: a, reasons, updated };
          })
          .filter((r) => r.reasons.length > 0)
          .sort((a, b) => (b.updated || 0) - (a.updated || 0))
          .slice(0, 5);
        setItems(flagged);
      } catch {
        if (!alive) return;
        setItems([]);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  if (loading || !items || items.length === 0) return null;

  return (
    <div className="max-w-3xl mx-auto px-5 sm:px-8 mb-8">
      <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4">
        <div className="flex items-center gap-2 mb-3">
          <AlertCircle className="w-4 h-4 text-amber-600" />
          <h3 className="text-sm font-semibold text-slate-900">Needs attention</h3>
          <span className="text-[11px] text-amber-700 bg-amber-100 border border-amber-200 rounded-full px-2 py-0.5">{items.length}</span>
        </div>
        <div className="space-y-1.5">
          {items.map(({ app, reasons }) => (
            <button
              key={app.id}
              onClick={() => navigate(`/applications/${app.id}`)}
              className="w-full flex items-center justify-between gap-3 rounded-lg bg-white border border-amber-100 px-3 py-2.5 text-left hover:border-amber-300 transition-colors"
            >
              <div className="min-w-0">
                <div className="text-sm font-medium text-slate-900 truncate">{app.application_number || app.id.slice(-8)}</div>
                <div className="text-[11px] text-amber-700 truncate">{reasons.join(" · ")}</div>
              </div>
              <ChevronRight className="w-4 h-4 text-amber-500 shrink-0" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}