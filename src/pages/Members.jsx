import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import Nav from "@/components/layout/Nav.jsx";
import { Users, Loader2, AlertTriangle, UserPlus, ShieldCheck, Trash2, CheckCircle2 } from "lucide-react";

export default function Members() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("user");
  const [invited, setInvited] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await base44.functions.invoke("apiMembers", { action: "list" });
      setMembers(res.data?.members || []);
    } catch (e) {
      setError(e?.response?.data?.error?.message || e.message || "Failed to load members.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const invite = async () => {
    setBusy(true);
    setError(null);
    setInvited(null);
    try {
      const res = await base44.functions.invoke("apiMembers", { action: "invite", email, role });
      setInvited(res.data);
      setEmail("");
      await load();
    } catch (e) {
      setError(e?.response?.data?.error?.message || e.message || "Failed to invite.");
    } finally {
      setBusy(false);
    }
  };

  const changeRole = async (id, r) => {
    setBusy(true);
    try {
      await base44.functions.invoke("apiMembers", { action: "update_role", user_id: id, role: r });
      await load();
    } catch (e) {
      setError(e?.response?.data?.error?.message || e.message || "Failed to update role.");
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id) => {
    if (!confirm("Remove this member from the organization?")) return;
    setBusy(true);
    try {
      await base44.functions.invoke("apiMembers", { action: "remove", user_id: id });
      await load();
    } catch (e) {
      setError(e?.response?.data?.error?.message || e.message || "Failed to remove.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-900">
      <Nav />
      <div className="max-w-3xl mx-auto px-5 sm:px-8 py-10">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight">Members</h1>
          <p className="text-sm text-slate-500 mt-1">Invite teammates and manage their access to this organization.</p>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <p className="text-sm text-rose-700">{error}</p>
          </div>
        )}

        {invited && (
          <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-emerald-800">Invitation sent to {invited.email}</p>
              <p className="text-xs text-emerald-700">They'll receive an email to join as {invited.role}.</p>
            </div>
          </div>
        )}

        <div className="mb-5 rounded-xl border border-slate-200 bg-white p-5">
          <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-1.5"><UserPlus className="w-4 h-4" /> Invite a member</h3>
          <div className="flex flex-col sm:flex-row gap-2">
            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="teammate@company.com"
              className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10" />
            <select value={role} onChange={(e) => setRole(e.target.value)}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10">
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
            <button onClick={invite} disabled={busy || !email} className="inline-flex items-center justify-center gap-1.5 text-sm font-medium text-white bg-slate-900 px-4 py-2 rounded-lg hover:bg-slate-800 disabled:opacity-50">
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />} Invite
            </button>
          </div>
        </div>

        {loading ? (
          <div className="rounded-xl border border-slate-200 bg-white p-10 flex items-center justify-center gap-3">
            <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />
            <span className="text-sm text-slate-500">Loading members…</span>
          </div>
        ) : members.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 bg-white p-10 text-center">
            <Users className="w-8 h-8 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-medium text-slate-600">No members yet.</p>
          </div>
        ) : (
          <div className="rounded-xl border border-slate-200 bg-white divide-y divide-slate-100">
            {members.map((m) => (
              <div key={m.id} className="p-4 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-900">{m.full_name || m.email}</span>
                    <span className={`text-[10px] font-mono rounded px-1.5 py-0.5 ${m.role === "admin" ? "text-indigo-600 bg-indigo-50 border border-indigo-100" : "text-slate-500 bg-slate-50 border border-slate-100"}`}>{m.role}</span>
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">{m.email}{m.created_at && ` · joined ${new Date(m.created_at).toLocaleDateString()}`}</div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button onClick={() => changeRole(m.id, m.role === "admin" ? "user" : "admin")} disabled={busy} title="Toggle role"
                    className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40">
                    <ShieldCheck className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => remove(m.id)} disabled={busy} title="Remove"
                    className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-rose-200 text-rose-500 hover:bg-rose-50 disabled:opacity-40">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}