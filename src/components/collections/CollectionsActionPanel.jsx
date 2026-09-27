import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, Mail, Phone, FileText, Handshake, Ban, StickyNote, Send, CheckCircle2, XCircle, Clock } from "lucide-react";

const ACTION_TYPES = [
  { value: "reminder_email", label: "Reminder email", icon: Mail, channel: "email" },
  { value: "phone_call", label: "Phone call", icon: Phone, channel: "phone" },
  { value: "letter", label: "Formal letter", icon: FileText, channel: "letter" },
  { value: "settlement_offer", label: "Settlement offer", icon: Handshake, channel: "letter" },
  { value: "payment_plan", label: "Payment plan", icon: Handshake, channel: "internal" },
  { value: "write_off", label: "Write-off", icon: Ban, channel: "internal" },
  { value: "manual_note", label: "Manual note", icon: StickyNote, channel: "internal" },
];

const RESULT_OPTIONS = ["pending", "promised", "partial", "recovered", "refused", "none"];

const STATUS_STYLE = {
  sent: "text-emerald-600 bg-emerald-50",
  completed: "text-slate-600 bg-slate-50",
  failed: "text-rose-600 bg-rose-50",
  queued: "text-amber-600 bg-amber-50",
};

function fmtMoney(n, c) {
  try { return new Intl.NumberFormat("en-US", { style: "currency", currency: (c || "GBP").toUpperCase(), maximumFractionDigits: 0 }).format(n || 0); }
  catch { return String(n || 0); }
}

export default function CollectionsActionPanel({ outcome, borrower, onClose }) {
  const [actions, setActions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ action_type: "reminder_email", subject: "", body: "", result: "pending", amount_recovered: 0 });

  const load = async () => {
    setLoading(true);
    try {
      const res = await base44.functions.invoke("apiCollections", { action: "list_actions", outcome_id: outcome.id });
      setActions(res.data?.actions || []);
    } catch { setActions([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { if (outcome) load(); }, [outcome?.id]);

  const sendReminder = async () => {
    setBusy(true); setMsg(null);
    try {
      const res = await base44.functions.invoke("apiCollections", {
        action: "send_reminder",
        application_id: outcome.application_id,
        outcome_id: outcome.id,
        borrower_id: outcome.borrower_id,
        days_past_due: outcome.days_past_due || 0,
      });
      setMsg({ type: "ok", text: "Reminder email sent to borrower." });
      load();
    } catch (e) {
      setMsg({ type: "error", text: e?.response?.data?.error?.message || e.message || "Failed to send reminder." });
    } finally { setBusy(false); }
  };

  const logAction = async (e) => {
    e.preventDefault();
    setBusy(true); setMsg(null);
    const cfg = ACTION_TYPES.find((a) => a.value === form.action_type);
    try {
      await base44.functions.invoke("apiCollections", {
        action: "log_action",
        application_id: outcome.application_id,
        borrower_id: outcome.borrower_id,
        outcome_id: outcome.id,
        action_type: form.action_type,
        channel: cfg?.channel,
        subject: form.subject || undefined,
        body: form.body || undefined,
        result: form.result,
        amount_recovered: Number(form.amount_recovered) || 0,
        days_past_due: outcome.days_past_due || 0,
      });
      setForm({ action_type: "reminder_email", subject: "", body: "", result: "pending", amount_recovered: 0 });
      setShowForm(false);
      setMsg({ type: "ok", text: "Action logged." });
      load();
    } catch (e2) {
      setMsg({ type: "error", text: e2?.response?.data?.error?.message || e2.message || "Failed to log action." });
    } finally { setBusy(false); }
  };

  if (!outcome) return null;
  const borrowerName = borrower ? `${borrower.first_name} ${borrower.last_name}` : "—";
  const borrowerEmail = borrower?.email;

  return (
    <div className="space-y-4">
      {/* Loan summary */}
      <div className="rounded-lg border border-slate-200 bg-slate-50/60 p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold text-slate-900">{borrowerName}</div>
            <div className="text-[11px] text-slate-500 font-mono">{outcome.application_id?.slice(-8)} · {outcome.decision}</div>
          </div>
          <div className="text-right">
            <div className="text-sm font-semibold text-slate-900">{fmtMoney(outcome.loan_amount, outcome.loan_currency)}</div>
            <div className="text-[11px] text-slate-500">{outcome.days_past_due || 0} days past due</div>
          </div>
        </div>
        {borrowerEmail && <div className="mt-2 text-[11px] text-slate-500">📧 {borrowerEmail}</div>}
      </div>

      {msg && (
        <div className={`rounded-lg px-3 py-2 text-[12px] ${msg.type === "ok" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-rose-50 text-rose-700 border border-rose-200"}`}>
          {msg.text}
        </div>
      )}

      {/* Quick actions */}
      <div className="flex flex-wrap gap-2">
        <button onClick={sendReminder} disabled={busy || !borrowerEmail}
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-white bg-teal-700 px-3.5 py-2 rounded-lg hover:bg-teal-800 disabled:opacity-50">
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} Send reminder
        </button>
        <button onClick={() => setShowForm((v) => !v)}
          className="inline-flex items-center gap-1.5 text-[13px] text-slate-700 px-3.5 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50">
          <StickyNote className="w-4 h-4" /> Log action
        </button>
      </div>
      {!borrowerEmail && <p className="text-[11px] text-amber-600">No email on file — email reminder disabled. Use “Log action” to record phone/letter outreach.</p>}

      {/* Log action form */}
      {showForm && (
        <form onSubmit={logAction} className="rounded-lg border border-slate-200 p-4 space-y-3 bg-white">
          <div>
            <label className="block text-[12px] font-medium text-slate-700 mb-1">Action type</label>
            <select value={form.action_type} onChange={(e) => setForm({ ...form, action_type: e.target.value })}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-[13px] bg-white">
              {ACTION_TYPES.map((a) => <option key={a.value} value={a.value}>{a.label}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] font-medium text-slate-700 mb-1">Result</label>
              <select value={form.result} onChange={(e) => setForm({ ...form, result: e.target.value })}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-[13px] bg-white">
                {RESULT_OPTIONS.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[12px] font-medium text-slate-700 mb-1">Amount recovered</label>
              <input type="number" min={0} value={form.amount_recovered} onChange={(e) => setForm({ ...form, amount_recovered: e.target.value })}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-[13px]" />
            </div>
          </div>
          <div>
            <label className="block text-[12px] font-medium text-slate-700 mb-1">Subject / note</label>
            <input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-[13px]" />
          </div>
          <div>
            <label className="block text-[12px] font-medium text-slate-700 mb-1">Details</label>
            <textarea value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} rows={3}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-[13px]" />
          </div>
          <button type="submit" disabled={busy}
            className="w-full rounded-lg bg-slate-900 text-white text-[13px] font-medium py-2 hover:bg-slate-800 disabled:opacity-50">
            {busy ? "Saving…" : "Save action"}
          </button>
        </form>
      )}

      {/* Action history */}
      <div>
        <h4 className="text-[12px] font-semibold text-slate-700 uppercase tracking-wider mb-2">Action history</h4>
        {loading ? (
          <div className="flex items-center gap-2 py-3"><Loader2 className="w-4 h-4 text-slate-400 animate-spin" /><span className="text-[12px] text-slate-500">Loading…</span></div>
        ) : actions.length === 0 ? (
          <p className="text-[12px] text-slate-400 py-3">No actions recorded yet for this loan.</p>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {actions.map((a) => {
              const cfg = ACTION_TYPES.find((x) => x.value === a.action_type);
              const Icon = cfg?.icon || StickyNote;
              return (
                <div key={a.id} className="flex items-start gap-2.5 rounded-lg border border-slate-100 px-3 py-2">
                  <Icon className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[12px] font-medium text-slate-900">{cfg?.label || a.action_type}</span>
                      <span className={`text-[10px] rounded px-1.5 py-0.5 ${STATUS_STYLE[a.status] || "text-slate-500 bg-slate-50"}`}>{a.status}</span>
                      <span className="text-[10px] text-slate-400">{a.stage}</span>
                    </div>
                    {a.subject && <div className="text-[11px] text-slate-600 truncate">{a.subject}</div>}
                    <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-400">
                      <span>{a.result}</span>
                      {a.amount_recovered > 0 && <span className="text-emerald-600">+{fmtMoney(a.amount_recovered, outcome.loan_currency)}</span>}
                      <span>{new Date(a.performed_at || a.created_date).toLocaleDateString("en-GB")}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}