import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import Nav from "@/components/layout/Nav.jsx";
import { Settings as SettingsIcon, Loader2, AlertTriangle, Save, CheckCircle2, Building2, Users, Database, Brain, Shield, FileText, ArrowRight, CreditCard } from "lucide-react";
import BillingSection from "@/components/settings/BillingSection.jsx";

const SECTIONS = [
  { id: "organization", label: "Organization", icon: Building2 },
  { id: "billing", label: "Billing & Subscription", icon: CreditCard },
  { id: "users", label: "Users & Roles", icon: Users },
  { id: "data-sources", label: "Data Sources", icon: Database },
  { id: "ai", label: "AI Settings", icon: Brain },
  { id: "decisions", label: "Decision Settings", icon: SettingsIcon },
  { id: "security", label: "Security", icon: Shield },
  { id: "audit", label: "Audit Logs", icon: FileText },
];

export default function Settings() {
  const [org, setOrg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(false);
  const [section, setSection] = useState("organization");
  const [name, setName] = useState("");
  const [defaultPolicy, setDefaultPolicy] = useState("consumer-v1");
  const [currency, setCurrency] = useState("GBP");
  const [auditEvents, setAuditEvents] = useState([]);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await base44.functions.invoke("apiSettings", { action: "get" });
      const o = res.data?.organization;
      setOrg(o);
      setName(o?.name || "");
      setDefaultPolicy(o?.settings?.default_policy_id || "consumer-v1");
      setCurrency(o?.settings?.default_currency || "GBP");
      // Load audit events
      try {
        const me = await base44.auth.me();
        const oid = me.data?.organization_id || me.organization_id;
        const events = await base44.entities.AuditEvent.filter({ organization_id: oid }, "-created_date", 50);
        setAuditEvents(events);
      } catch {}
    } catch (e) {
      setError(e?.response?.data?.error?.message || e.message || "Failed to load settings.");
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
      await base44.functions.invoke("apiSettings", { action: "update", name, settings: { default_policy_id: defaultPolicy, default_currency: currency } });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      await load();
    } catch (e) {
      setError(e?.response?.data?.error?.message || e.message || "Failed to save.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f8fa] text-slate-900">
      <Nav />
      <div className="max-w-5xl mx-auto px-5 sm:px-8 py-8">
        <h1 className="text-2xl font-semibold tracking-tight mb-1">Settings</h1>
        <p className="text-sm text-slate-500 mb-6">Manage your organization, users, and platform configuration.</p>

        {error && (
          <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <p className="text-sm text-rose-700">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-5">
          {/* Sidebar */}
          <div className="sm:col-span-1">
            <div className="rounded-xl border border-slate-200 bg-white p-2">
              {SECTIONS.map((s) => {
                const Icon = s.icon;
                const active = section === s.id;
                return (
                  <button key={s.id} onClick={() => setSection(s.id)} className={`w-full flex items-center gap-2 text-sm px-3 py-2 rounded-lg transition-colors ${active ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-50"}`}>
                    <Icon className="w-4 h-4" /> {s.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content */}
          <div className="sm:col-span-3">
            {loading ? (
              <div className="rounded-xl border border-slate-200 bg-white p-10 flex items-center justify-center gap-3">
                <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />
                <span className="text-sm text-slate-500">Loading settings…</span>
              </div>
            ) : (
              <>
                {section === "organization" && (
                  <div className="space-y-4">
                    <div className="rounded-xl border border-slate-200 bg-white p-5">
                      <h3 className="text-sm font-semibold text-slate-900 mb-3">Organization profile</h3>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Slug</div>
                          <code className="font-mono text-slate-700">{org?.slug}</code>
                        </div>
                        <div>
                          <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Plan</div>
                          <span className="text-slate-700">{org?.plan}</span>
                        </div>
                        <div>
                          <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Status</div>
                          <span className="text-slate-700">{org?.status}</span>
                        </div>
                        <div>
                          <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Created</div>
                          <span className="text-slate-700">{org?.created_at ? new Date(org.created_at).toLocaleDateString() : "—"}</span>
                        </div>
                      </div>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-white p-5">
                      <h3 className="text-sm font-semibold text-slate-900 mb-3">General settings</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Organization name</label>
                          <input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10" />
                        </div>
                        <div>
                          <label className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Default policy</label>
                          <input value={defaultPolicy} onChange={(e) => setDefaultPolicy(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-slate-900/10" />
                        </div>
                        <div>
                          <label className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Default currency</label>
                          <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10">
                            {["GBP", "USD", "EUR"].map((c) => <option key={c} value={c}>{c}</option>)}
                          </select>
                        </div>
                      </div>
                      <button onClick={save} disabled={saving} className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-white bg-slate-900 px-4 py-2 rounded-lg hover:bg-slate-800 disabled:opacity-50">
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />} {saved ? "Saved" : "Save changes"}
                      </button>
                    </div>
                  </div>
                )}

                {section === "billing" && <BillingSection />}

                {section === "users" && (
                  <div className="rounded-xl border border-slate-200 bg-white p-5">
                    <h3 className="text-sm font-semibold text-slate-900 mb-3">Users & Roles</h3>
                    <p className="text-sm text-slate-500 mb-4">Manage team members and their roles within your organization.</p>
                    <Link to="/members" className="inline-flex items-center gap-1.5 text-sm font-medium text-[#0d9488] hover:underline">
                      Go to Members <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                )}

                {section === "data-sources" && (
                  <div className="rounded-xl border border-slate-200 bg-white p-5">
                    <h3 className="text-sm font-semibold text-slate-900 mb-3">Data Sources</h3>
                    <p className="text-sm text-slate-500 mb-4">Configure credit bureaus, open banking providers, and document sources.</p>
                    <Link to="/data-sources" className="inline-flex items-center gap-1.5 text-sm font-medium text-[#0d9488] hover:underline">
                      Go to Data Sources <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                )}

                {section === "ai" && (
                  <div className="rounded-xl border border-slate-200 bg-white p-5">
                    <h3 className="text-sm font-semibold text-slate-900 mb-3">AI Underwriter Settings</h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center justify-between border-b border-slate-50 py-2">
                        <div>
                          <div className="font-medium text-slate-800">AI-assisted analysis</div>
                          <div className="text-[12px] text-slate-400">Enable AI risk analysis and recommendations</div>
                        </div>
                        <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded px-2 py-0.5">ENABLED</span>
                      </div>
                      <div className="flex items-center justify-between border-b border-slate-50 py-2">
                        <div>
                          <div className="font-medium text-slate-800">AI recommendation authority</div>
                          <div className="text-[12px] text-slate-400">AI recommends; your policy decides. AI never overrides policy.</div>
                        </div>
                        <span className="text-[10px] font-medium text-slate-600 bg-slate-50 border border-slate-200 rounded px-2 py-0.5">ADVISORY</span>
                      </div>
                      <div className="flex items-center justify-between py-2">
                        <div>
                          <div className="font-medium text-slate-800">Human review threshold</div>
                          <div className="text-[12px] text-slate-400">Automatically flag for human review when risk score exceeds threshold</div>
                        </div>
                        <span className="text-sm font-mono text-slate-600">60</span>
                      </div>
                    </div>
                  </div>
                )}

                {section === "decisions" && (
                  <div className="rounded-xl border border-slate-200 bg-white p-5">
                    <h3 className="text-sm font-semibold text-slate-900 mb-3">Decision Settings</h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center justify-between border-b border-slate-50 py-2">
                        <div>
                          <div className="font-medium text-slate-800">Override requires reason</div>
                          <div className="text-[12px] text-slate-400">Underwriters must provide a reason when overriding a decision</div>
                        </div>
                        <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded px-2 py-0.5">REQUIRED</span>
                      </div>
                      <div className="flex items-center justify-between border-b border-slate-50 py-2">
                        <div>
                          <div className="font-medium text-slate-800">Audit all decisions</div>
                          <div className="text-[12px] text-slate-400">Every decision and override is recorded in the audit log</div>
                        </div>
                        <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded px-2 py-0.5">ENABLED</span>
                      </div>
                      <div className="flex items-center justify-between py-2">
                        <div>
                          <div className="font-medium text-slate-800">Sandbox / production separation</div>
                          <div className="text-[12px] text-slate-400">Sandbox data never mixes with production records</div>
                        </div>
                        <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded px-2 py-0.5">ENFORCED</span>
                      </div>
                    </div>
                  </div>
                )}

                {section === "security" && (
                  <div className="rounded-xl border border-slate-200 bg-white p-5">
                    <h3 className="text-sm font-semibold text-slate-900 mb-3">Security</h3>
                    <div className="space-y-3 text-sm">
                      {[
                        "Organization-scoped access — users only access their organization's data",
                        "Encrypted provider credentials — stored per-organization, never returned in full",
                        "Secure document storage — uploaded files are access-controlled",
                        "Audit logging — all actions are recorded with timestamp and actor",
                        "Role-based access — owner, admin, underwriter, reviewer, analyst, viewer",
                        "Sandbox / production separation — strict environment isolation",
                        "Policy versioning — active policy versions are never overwritten",
                      ].map((s) => (
                        <div key={s} className="flex items-start gap-2">
                          <Shield className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          <span className="text-slate-600">{s}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {section === "audit" && (
                  <div className="rounded-xl border border-slate-200 bg-white p-5">
                    <h3 className="text-sm font-semibold text-slate-900 mb-3">Audit Logs</h3>
                    {auditEvents.length === 0 ? (
                      <p className="text-sm text-slate-400">No audit events recorded yet.</p>
                    ) : (
                      <div className="space-y-1 max-h-96 overflow-y-auto">
                        {auditEvents.map((e) => (
                          <div key={e.id} className="flex items-start gap-3 py-2 border-b border-slate-100 last:border-0">
                            <FileText className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                            <div className="flex-1">
                              <div className="text-sm font-medium text-slate-800">{e.event}</div>
                              <div className="text-[11px] text-slate-400">{e.created_date ? new Date(e.created_date).toLocaleString() : ""} · {e.actor_type}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}