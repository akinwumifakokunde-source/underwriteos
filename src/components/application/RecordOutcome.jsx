import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, CheckCircle2, RefreshCw } from "lucide-react";

const STATUS_OPTIONS = [
  { value: "repaid", label: "Repaid", bad: false },
  { value: "active", label: "Active / performing", bad: false },
  { value: "late", label: "Late (DPD < 30)", bad: false },
  { value: "defaulted", label: "Defaulted", bad: true },
];

function pct(n) {
  if (n == null || Number.isNaN(n)) return "—";
  return `${(n * 100).toFixed(1)}%`;
}

export default function RecordOutcome({ applicationId, decision }) {
  const [existing, setExisting] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("active");
  const [dpd, setDpd] = useState(0);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await base44.functions.invoke("apiOutcomes", { action: "list" });
      const found = (res.data?.outcomes || []).find((o) => o.application_id === applicationId);
      setExisting(found || null);
      if (found) { setStatus(found.status); setDpd(found.days_past_due || 0); setNote(found.note || ""); }
    } catch {
      // ignore — recorder still works without prior state
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [applicationId]);

  const record = async (e) => {
    e.preventDefault();
    setSaving(true); setMsg(null);
    try {
      await base44.functions.invoke("apiOutcomes", {
        action: "record",
        application_id: applicationId,
        status,
        days_past_due: Number(dpd) || 0,
        note: note.trim() || undefined,
      });
      setMsg({ type: "ok", text: "Outcome recorded — calibration updated." });
      await load();
    } catch (err) {
      setMsg({ type: "error", text: err?.response?.data?.error?.message || err.message || "Failed to record outcome." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-xl border border-[#eceef1] bg-white p-5 mb-4">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center shrink-0">
          <RefreshCw className="w-4 h-4 text-teal-600" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-slate-900">Record loan outcome</h3>
          <p className="text-[12px] text-slate-500 mt-0.5">
            Close the feedback loop — report what happened on this loan. The predicted PD
            ({pct(decision?.probability_of_default)}) is snapshotted and measured against the observed result.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-[13px] text-slate-400 py-2"><Loader2 className="w-4 h-4 animate-spin" /> Loading…</div>
      ) : (
        <form onSubmit={record} className="space-y-3">
          {existing && (
            <div className="flex items-center gap-2 rounded-lg bg-teal-50 px-3 py-2 text-[12px] text-teal-700 mb-1">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              Previously recorded as <span className="font-medium">{existing.status}</span>
              {existing.bad ? " (bad)" : ""} on {new Date(existing.observed_at).toLocaleDateString("en-GB")}.
            </div>
          )}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[12px] font-medium text-slate-700 mb-1">Status</label>
              <select
                value={status} onChange={(e) => setStatus(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-[13px] outline-none focus:border-teal-500 bg-white"
              >
                {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[12px] font-medium text-slate-700 mb-1">Days past due</label>
              <input
                type="number" min={0} value={dpd} onChange={(e) => setDpd(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-[13px] outline-none focus:border-teal-500"
              />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-[12px] font-medium text-slate-700 mb-1">Note (optional)</label>
              <input
                value={note} onChange={(e) => setNote(e.target.value)}
                placeholder="e.g. restructured"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-[13px] outline-none focus:border-teal-500"
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="submit" disabled={saving}
              className="rounded-lg bg-slate-900 text-white text-[13px] font-medium px-4 py-2 hover:bg-slate-800 disabled:opacity-50"
            >
              {saving ? "Recording…" : existing ? "Update outcome" : "Record outcome"}
            </button>
            {msg && (
              <span className={`text-[12px] ${msg.type === "ok" ? "text-teal-600" : "text-rose-600"}`}>{msg.text}</span>
            )}
          </div>
        </form>
      )}
    </div>
  );
}