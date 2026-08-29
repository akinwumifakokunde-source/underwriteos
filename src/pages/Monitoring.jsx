import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import Nav from "@/components/layout/Nav";
import CalibrationChart from "@/components/monitoring/CalibrationChart";
import { Activity, Target, TrendingUp, CheckCircle2, AlertTriangle } from "lucide-react";

const STATUS_OPTIONS = [
  { value: "repaid", label: "Repaid" },
  { value: "active", label: "Active / performing" },
  { value: "late", label: "Late (DPD < 30)" },
  { value: "defaulted", label: "Defaulted" },
];

function pct(n) {
  if (n == null || Number.isNaN(n)) return "—";
  return `${(n * 100).toFixed(1)}%`;
}

export default function Monitoring() {
  const [data, setData] = useState(null);
  const [outcomes, setOutcomes] = useState([]);
  const [decidedApps, setDecidedApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // record form
  const [appId, setAppId] = useState("");
  const [status, setStatus] = useState("repaid");
  const [dpd, setDpd] = useState(0);
  const [saving, setSaving] = useState(false);
  const [formMsg, setFormMsg] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [mon, list, appRes] = await Promise.all([
        base44.functions.invoke("apiOutcomes", { action: "monitor" }),
        base44.functions.invoke("apiOutcomes", { action: "list" }),
        base44.functions.invoke("apiApplications", { action: "list", limit: 100 }),
      ]);
      setData(mon.data);
      setOutcomes(list.data.outcomes || []);
      const decided = (appRes.data?.applications || []).filter((a) => a.decision && a.decision !== "null");
      setDecidedApps(decided);
    } catch (e) {
      setError(e?.response?.data?.error?.message || e.message || "Failed to load monitoring data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const record = async (e) => {
    e.preventDefault();
    if (!appId.trim()) { setFormMsg({ type: "error", text: "Application ID is required." }); return; }
    setSaving(true); setFormMsg(null);
    try {
      await base44.functions.invoke("apiOutcomes", {
        action: "record", application_id: appId.trim(), status, days_past_due: Number(dpd) || 0,
      });
      setFormMsg({ type: "ok", text: "Outcome recorded." });
      setAppId(""); setDpd(0);
      load();
    } catch (err) {
      setFormMsg({ type: "error", text: err?.response?.data?.error?.message || err.message || "Failed to record outcome." });
    } finally {
      setSaving(false);
    }
  };

  const s = data?.summary || {};

  const STATS = [
    { label: "Applications", value: s.applications ?? "—", icon: Activity, tint: "text-[#0a0c12]" },
    { label: "Approval rate", value: pct(s.approval_rate), icon: CheckCircle2, tint: "text-[#0d9488]" },
    { label: "Observed outcomes", value: s.observed_outcomes ?? "—", icon: Target, tint: "text-[#0a0c12]" },
    { label: "Observed default rate", value: pct(s.observed_default_rate), icon: s.observed_default_rate > (s.mean_predicted_pd || 0) ? AlertTriangle : TrendingUp, tint: s.observed_default_rate > (s.mean_predicted_pd || 0) ? "text-[#dc2626]" : "text-[#0d9488]" },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Nav />
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-10">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-[#525965] mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0d9488]" /> Model monitoring
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-[#0a0c12]">Outcome tracking &amp; calibration</h1>
          <p className="mt-2 text-[15px] text-[#525965] max-w-2xl leading-relaxed">
            Every underwritten loan is a data point. Record what actually happened and watch the predicted
            probability of default converge on the observed default rate — the loop that makes the engine get smarter.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-700">{error}</div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {STATS.map((st) => {
            const Icon = st.icon;
            return (
              <div key={st.label} className="rounded-xl border border-[#eceef1] p-4">
                <div className="flex items-center justify-between">
                  <span className="text-[12px] text-[#525965]">{st.label}</span>
                  <Icon className={`w-4 h-4 ${st.tint}`} />
                </div>
                <div className="mt-2 text-2xl font-semibold tracking-tight text-[#0a0c12]">{loading ? "…" : st.value}</div>
              </div>
            );
          })}
        </div>

        {/* Calibration */}
        <div className="rounded-xl border border-[#eceef1] p-5 mb-8">
          <div className="flex items-baseline justify-between mb-1">
            <h2 className="text-[15px] font-semibold text-[#0a0c12]">Calibration — predicted vs actual default</h2>
            <span className="text-[11px] font-mono text-[#8a909c]">predicted PD bucket → observed default rate</span>
          </div>
          <p className="text-[12px] text-[#525965] mb-4">
            A calibrated model tracks the dashed actual line against the solid predicted line. Gaps show where to re-tune.
          </p>
          {loading ? (
            <div className="h-72 flex items-center justify-center text-[13px] text-[#8a909c]">Loading…</div>
          ) : (data?.calibration || []).every((b) => b.count === 0) ? (
            <div className="h-72 flex items-center justify-center text-center text-[13px] text-[#8a909c] px-8">
              No outcomes recorded yet. Record an outcome below for an underwritten application to start the calibration loop.
            </div>
          ) : (
            <CalibrationChart data={data?.calibration} />
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Record outcome */}
          <div className="md:col-span-5">
            <div className="rounded-xl border border-[#eceef1] p-5">
              <h2 className="text-[15px] font-semibold text-[#0a0c12] mb-1">Record an outcome</h2>
              <p className="text-[12px] text-[#525965] mb-4">Report what happened on an underwritten loan. The predicted PD is snapshotted from the decision.</p>
              <form onSubmit={record} className="space-y-3">
                <div>
                  <label className="block text-[12px] font-medium text-[#0a0c12] mb-1">Application</label>
                  {decidedApps.length === 0 ? (
                    <p className="text-[12px] text-[#8a909c] py-2">No decided applications yet. Underwrite an application first.</p>
                  ) : (
                    <select
                      value={appId} onChange={(e) => setAppId(e.target.value)}
                      className="w-full rounded-lg border border-[#eceef1] px-3 py-2 text-[13px] outline-none focus:border-[#0d9488] bg-white"
                    >
                      <option value="">Select an application…</option>
                      {decidedApps.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.application_number || a.id.slice(-8)} · {a.decision} · {(a.loan_currency || "GBP")} {(a.loan_amount || 0).toLocaleString()}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
                <div>
                  <label className="block text-[12px] font-medium text-[#0a0c12] mb-1">Status</label>
                  <select
                    value={status} onChange={(e) => setStatus(e.target.value)}
                    className="w-full rounded-lg border border-[#eceef1] px-3 py-2 text-[13px] outline-none focus:border-[#0d9488] bg-white"
                  >
                    {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[12px] font-medium text-[#0a0c12] mb-1">Days past due</label>
                  <input
                    type="number" min={0} value={dpd} onChange={(e) => setDpd(e.target.value)}
                    className="w-full rounded-lg border border-[#eceef1] px-3 py-2 text-[13px] outline-none focus:border-[#0d9488]"
                  />
                </div>
                <button
                  type="submit" disabled={saving}
                  className="w-full rounded-lg bg-[#0a0c12] text-white text-[13px] font-medium py-2 hover:bg-[#1a1c21] disabled:opacity-50"
                >
                  {saving ? "Recording…" : "Record outcome"}
                </button>
                {formMsg && (
                  <div className={`text-[12px] ${formMsg.type === "ok" ? "text-[#0d9488]" : "text-red-600"}`}>{formMsg.text}</div>
                )}
              </form>
            </div>
          </div>

          {/* Recent outcomes */}
          <div className="md:col-span-7">
            <div className="rounded-xl border border-[#eceef1] p-5">
              <h2 className="text-[15px] font-semibold text-[#0a0c12] mb-3">Recent outcomes</h2>
              {outcomes.length === 0 ? (
                <p className="text-[13px] text-[#8a909c]">No outcomes recorded yet.</p>
              ) : (
                <div className="overflow-x-auto no-scrollbar">
                  <table className="w-full text-[12px]">
                    <thead>
                      <tr className="text-left text-[#8a909c] border-b border-[#eceef1]">
                        <th className="font-medium py-2 pr-3">Application</th>
                        <th className="font-medium py-2 pr-3">Status</th>
                        <th className="font-medium py-2 pr-3">Predicted PD</th>
                        <th className="font-medium py-2 pr-3">Decision</th>
                        <th className="font-medium py-2">Observed</th>
                      </tr>
                    </thead>
                    <tbody>
                      {outcomes.map((o) => (
                        <tr key={o.id} className="border-b border-[#f3f4f6]">
                          <td className="py-2 pr-3 font-mono text-[#0a0c12]">{o.application_id?.slice(0, 10)}…</td>
                          <td className="py-2 pr-3">
                            <span className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] ${o.bad ? "bg-red-50 text-red-700" : "bg-[#e6f7f3] text-[#0d9488]"}`}>
                              {o.status}
                            </span>
                          </td>
                          <td className="py-2 pr-3 font-mono text-[#525965]">{o.predicted_pd != null ? pct(o.predicted_pd) : "—"}</td>
                          <td className="py-2 pr-3 text-[#525965]">{o.decision || "—"}</td>
                          <td className="py-2 text-[#8a909c]">{o.observed_at ? new Date(o.observed_at).toLocaleDateString("en-GB") : "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}