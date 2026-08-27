import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, Plus, Send, CheckCircle2, ChevronRight, X } from "lucide-react";

const STATUSES = ["requested", "sent", "viewed", "received", "verified", "resolved"];
const STATUS_LABELS = {
  requested: "Requested", sent: "Sent", viewed: "Viewed", received: "Received", verified: "Verified", resolved: "Resolved",
};
const STATUS_STYLE = {
  requested: "bg-slate-100 text-slate-700 border-slate-200",
  sent: "bg-sky-50 text-sky-700 border-sky-200",
  viewed: "bg-indigo-50 text-indigo-700 border-indigo-200",
  received: "bg-amber-50 text-amber-700 border-amber-200",
  verified: "bg-teal-50 text-teal-700 border-teal-200",
  resolved: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

export default function RequestInformationPanel({ applicationId }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [item, setItem] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      const list = await base44.entities.InformationRequest.filter({ application_id: applicationId }, "-created_date", 50);
      setRequests(list);
    } catch {
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (applicationId) load();
  }, [applicationId]);

  const create = async () => {
    if (!item.trim()) return;
    setSaving(true);
    try {
      const me = await base44.auth.me();
      const oid = me.data?.organization_id || me.organization_id;
      await base44.entities.InformationRequest.create({
        organization_id: oid,
        application_id: applicationId,
        item: item.trim(),
        note: note.trim() || undefined,
        status: "requested",
      });
      setItem("");
      setNote("");
      setAdding(false);
      await load();
    } finally {
      setSaving(false);
    }
  };

  const advance = async (r) => {
    const idx = STATUSES.indexOf(r.status);
    const next = STATUSES[Math.min(idx + 1, STATUSES.length - 1)];
    await base44.entities.InformationRequest.update(r.id, {
      status: next,
      resolved_at: next === "resolved" ? new Date().toISOString() : undefined,
    });
    await load();
  };

  const open = requests.filter((r) => r.status !== "resolved");

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-slate-900">Request information</h3>
          {open.length > 0 && (
            <span className="text-[10px] font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded px-1.5 py-0.5">
              {open.length} open
            </span>
          )}
        </div>
        <button
          onClick={() => setAdding(!adding)}
          className="inline-flex items-center gap-1 text-[12px] font-medium text-slate-700 bg-white border border-slate-200 rounded-lg px-2.5 py-1 hover:bg-slate-50"
        >
          {adding ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
          {adding ? "Cancel" : "Request"}
        </button>
      </div>

      {adding && (
        <div className="mb-3 rounded-lg border border-slate-200 bg-slate-50/50 p-3 space-y-2">
          <input
            value={item}
            onChange={(e) => setItem(e.target.value)}
            placeholder="What do you need? (e.g. Credit report, Proof of address)"
            className="ui-input"
            autoFocus
          />
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Optional note for the borrower"
            className="ui-input"
          />
          <div className="flex justify-end">
            <button
              onClick={create}
              disabled={saving || !item.trim()}
              className="inline-flex items-center gap-1.5 text-[12px] font-medium text-white bg-slate-900 rounded-lg px-3 py-1.5 hover:bg-slate-800 disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              Send request
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center gap-2 text-[13px] text-slate-400 py-2">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading requests…
        </div>
      ) : requests.length === 0 ? (
        <p className="text-[13px] text-slate-400 py-2">
          No information requests yet. Request missing documents or data directly from the borrower.
        </p>
      ) : (
        <div className="space-y-2">
          {requests.map((r) => (
            <div key={r.id} className="flex items-center gap-3 rounded-lg border border-slate-100 bg-white px-3 py-2">
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-slate-800">{r.item}</div>
                {r.note && <div className="text-[11px] text-slate-400">{r.note}</div>}
              </div>
              <span className={`text-[10px] font-medium border rounded px-2 py-0.5 ${STATUS_STYLE[r.status] || STATUS_STYLE.requested}`}>
                {STATUS_LABELS[r.status] || r.status}
              </span>
              {r.status !== "resolved" && (
                <button
                  onClick={() => advance(r)}
                  className="shrink-0 inline-flex items-center gap-1 text-[12px] font-medium text-slate-700 bg-white border border-slate-200 rounded-lg px-2 py-1 hover:bg-slate-50"
                >
                  {r.status === "verified" ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Resolve
                    </>
                  ) : (
                    <>
                      Advance <ChevronRight className="w-3 h-3" />
                    </>
                  )}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}