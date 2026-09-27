import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Bell, Loader2, CheckCircle2, Save, AlertTriangle, Mail, TrendingUp } from "lucide-react";

// Self-contained notifications preferences. The alerts email is the single
// destination for automated lender notifications. When blank, the system
// falls back to the organization's admin users so responses are never missed.
export default function NotificationsSection() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await base44.functions.invoke("apiSettings", { action: "get" });
      setEmail(res.data?.organization?.settings?.alerts_email || "");
    } catch (e) {
      setError(e?.response?.data?.error?.message || e.message || "Failed to load notifications.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      await base44.functions.invoke("apiSettings", { action: "update", settings: { alerts_email: email.trim() || null } });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      setError(e?.response?.data?.error?.message || e.message || "Failed to save.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-10 flex items-center justify-center gap-3">
        <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />
        <span className="text-sm text-slate-500">Loading notifications…</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex items-center gap-2 mb-1">
          <Bell className="w-4 h-4 text-slate-500" />
          <h3 className="text-sm font-semibold text-slate-900">Notification recipient</h3>
        </div>
        <p className="text-sm text-slate-500 mb-4">A single inbox for every automated alert CreditDecide sends your team.</p>

        {error && (
          <div className="mb-3 rounded-lg border border-rose-200 bg-rose-50 p-3 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <p className="text-sm text-rose-700">{error}</p>
          </div>
        )}

        <label className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Alerts email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="alerts@yourlender.com"
          className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10"
        />
        <p className="mt-1.5 text-[11px] text-slate-400">Leave blank to fall back to your organization admins — so borrower responses are never missed.</p>

        <button
          onClick={save}
          disabled={saving}
          className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-white bg-slate-900 px-4 py-2 rounded-lg hover:bg-slate-800 disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          {saved ? "Saved" : "Save"}
        </button>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <h3 className="text-sm font-semibold text-slate-900 mb-3">What we notify you about</h3>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-teal-50 ring-1 ring-teal-100 flex items-center justify-center shrink-0">
              <Mail className="w-4 h-4 text-teal-600" />
            </div>
            <div>
              <div className="text-sm font-medium text-slate-800">Borrower responses</div>
              <p className="text-[12px] text-slate-500">When a borrower uploads a requested document or replies through the borrower portal — including an automatic re-evaluation of their decision.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-50 ring-1 ring-amber-100 flex items-center justify-center shrink-0">
              <TrendingUp className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <div className="text-sm font-medium text-slate-800">Portfolio alerts</div>
              <p className="text-[12px] text-slate-500">A daily summary of model drift, default-rate spikes, and concentration breaches across your book.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}