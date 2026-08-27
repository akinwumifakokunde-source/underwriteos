import React, { useEffect, useState, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import Nav from "@/components/layout/Nav.jsx";
import { Loader2, AlertTriangle, Plus, Trash2, GripVertical, Save, Copy, ArrowLeft, Shield, Check, X } from "lucide-react";

const FIELDS = [
  { value: "credit_score", label: "Credit score", type: "number" },
  { value: "debt_to_income", label: "Debt-to-income ratio", type: "number" },
  { value: "credit_utilisation", label: "Credit utilisation", type: "number" },
  { value: "annual_income", label: "Annual income", type: "number" },
  { value: "monthly_income", label: "Monthly income", type: "number" },
  { value: "defaults", label: "Defaults", type: "number" },
  { value: "delinquent_accounts", label: "Delinquent accounts", type: "number" },
  { value: "recent_enquiries", label: "Recent enquiries", type: "number" },
  { value: "repayment_history", label: "Repayment history", type: "number" },
  { value: "repayment_capacity", label: "Repayment capacity", type: "number" },
  { value: "suspicious_transactions", label: "Suspicious transactions", type: "boolean" },
  { value: "income_stability", label: "Income stability", type: "number" },
  { value: "expense_volatility", label: "Expense volatility", type: "number" },
  { value: "active_accounts", label: "Active accounts", type: "number" },
  { value: "outstanding_balance", label: "Outstanding balance", type: "number" },
];

const OPERATORS = ["<", "<=", ">", ">=", "==", "!=", "between", "contains", "in"];

const OUTCOMES = ["APPROVE", "REVIEW", "DECLINE"];

const TEMPLATES = {
  "consumer-v1": {
    name: "Consumer Lending v1",
    description: "Baseline consumer credit policy",
    rules: [
      { rule_id: "CR-SCORE", field: "credit_score", operator: "<", threshold: 500, decision: "DECLINE", reason: "Credit score below minimum (500)" },
      { rule_id: "AF-DTI", field: "debt_to_income", operator: ">", threshold: 0.45, decision: "REVIEW", reason: "Debt-to-income exceeds 45%" },
      { rule_id: "CR-DEF", field: "defaults", operator: ">", threshold: 0, decision: "DECLINE", reason: "Active defaults on credit file" },
      { rule_id: "CR-UTIL", field: "credit_utilisation", operator: ">", threshold: 0.4, decision: "REVIEW", reason: "Credit utilisation above 40%" },
      { rule_id: "CR-ENQ", field: "recent_enquiries", operator: ">", threshold: 3, decision: "REVIEW", reason: "High recent credit enquiries (>3)" },
      { rule_id: "RP-HIST", field: "repayment_history", operator: "<", threshold: 80, decision: "REVIEW", reason: "Repayment history below 80%" },
    ],
  },
  "sme-v1": {
    name: "SME Lending v1",
    description: "Small business lending policy",
    rules: [
      { rule_id: "AF-INC", field: "annual_income", operator: "<", threshold: 30000, decision: "DECLINE", reason: "Annual revenue below minimum (£30,000)" },
      { rule_id: "AF-DTI", field: "debt_to_income", operator: ">", threshold: 0.5, decision: "REVIEW", reason: "Debt-to-income exceeds 50%" },
      { rule_id: "CR-DEF", field: "defaults", operator: ">", threshold: 0, decision: "DECLINE", reason: "Active defaults on credit file" },
      { rule_id: "INC-STAB", field: "income_stability", operator: "<", threshold: 0.5, decision: "REVIEW", reason: "Income stability below threshold" },
    ],
  },
};

export default function Policies() {
  const [policies, setPolicies] = useState([]);
  const [orgId, setOrgId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const me = await base44.auth.me();
      const oid = me.data?.organization_id || me.organization_id;
      setOrgId(oid);
      const list = await base44.entities.Policy.filter({ organization_id: oid }, "-created_date", 50);
      setPolicies(list);
      if (list.length > 0 && !selected) setSelected(list[0]);
    } catch (e) {
      setError(e?.message || "Failed to load policies.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Auto-open the editor when navigated with ?template= (from the workspace home)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const template = urlParams.get("template");
    if (template) startNewPolicy(template);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startNewPolicy = (templateKey) => {
    const tpl = TEMPLATES[templateKey] || TEMPLATES["consumer-v1"];
    setEditing({
      policy_id: templateKey || "custom-" + Date.now().toString(36),
      name: tpl.name,
      description: tpl.description,
      version: "1",
      status: "draft",
      rules: tpl.rules.map((r) => ({ ...r })),
    });
  };

  const savePolicy = async () => {
    if (!editing.name.trim()) return;
    setSaving(true);
    try {
      const existing = policies.find((p) => p.policy_id === editing.policy_id && p.status === "active");
      if (existing) {
        // Create a new version instead of overwriting
        await base44.entities.Policy.create({
          organization_id: orgId,
          policy_id: editing.policy_id,
          version: String(Number(existing.version) + 1),
          name: editing.name,
          description: editing.description,
          rules: editing.rules,
          status: "draft",
        });
      } else {
        await base44.entities.Policy.create({
          organization_id: orgId,
          policy_id: editing.policy_id,
          version: editing.version || "1",
          name: editing.name,
          description: editing.description,
          rules: editing.rules,
          status: editing.status || "draft",
        });
      }
      setEditing(null);
      await load();
    } catch (e) {
      setError(e?.message || "Failed to save policy.");
    } finally {
      setSaving(false);
    }
  };

  const activatePolicy = async (p) => {
    try {
      // Deactivate existing active versions
      const samePolicy = policies.filter((x) => x.policy_id === p.policy_id && x.status === "active" && x.id !== p.id);
      await Promise.all(samePolicy.map((x) => base44.entities.Policy.update(x.id, { status: "archived" })));
      await base44.entities.Policy.update(p.id, { status: "active" });
      await load();
    } catch (e) {
      setError(e?.message || "Failed to activate policy.");
    }
  };

  const duplicatePolicy = async (p) => {
    try {
      await base44.entities.Policy.create({
        organization_id: orgId,
        policy_id: p.policy_id + "-copy",
        version: "1",
        name: p.name + " (Copy)",
        description: p.description,
        rules: p.rules,
        status: "draft",
      });
      await load();
    } catch (e) {
      setError(e?.message || "Failed to duplicate policy.");
    }
  };

  // Editing helpers
  const addRule = () => setEditing((e) => ({ ...e, rules: [...e.rules, { rule_id: "R-" + Date.now().toString(36).slice(-4), field: "credit_score", operator: "<", threshold: 500, decision: "REVIEW", reason: "" }] }));
  const updateRule = (idx, key, val) => setEditing((e) => ({ ...e, rules: e.rules.map((r, i) => i === idx ? { ...r, [key]: val } : r) }));
  const removeRule = (idx) => setEditing((e) => ({ ...e, rules: e.rules.filter((_, i) => i !== idx) }));
  const moveRule = (idx, dir) => setEditing((e) => {
    const rules = [...e.rules];
    const target = idx + dir;
    if (target < 0 || target >= rules.length) return e;
    [rules[idx], rules[target]] = [rules[target], rules[idx]];
    return { ...e, rules };
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f8fa]">
        <Nav />
        <div className="max-w-5xl mx-auto px-5 sm:px-8 py-10 flex items-center justify-center gap-3">
          <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />
          <span className="text-sm text-slate-500">Loading policies…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f8fa] text-slate-900">
      <Nav />
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Policies</h1>
            <p className="text-sm text-slate-500 mt-1">Create and manage underwriting policies without code.</p>
          </div>
          {!editing && (
            <button onClick={() => startNewPolicy("consumer-v1")} className="inline-flex items-center gap-1.5 text-sm font-medium text-white bg-[#0a0c12] px-4 py-2.5 rounded-lg hover:bg-[#1c1f26]">
              <Plus className="w-4 h-4" /> New Policy
            </button>
          )}
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <p className="text-sm text-rose-700">{error}</p>
          </div>
        )}

        {editing ? (
          /* Policy Editor */
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <button onClick={() => setEditing(null)} className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900">
                <ArrowLeft className="w-4 h-4" /> Back to policies
              </button>
              <button onClick={savePolicy} disabled={saving} className="inline-flex items-center gap-1.5 text-sm font-medium text-white bg-slate-900 px-4 py-2 rounded-lg hover:bg-slate-800 disabled:opacity-50">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save policy
              </button>
            </div>

            {/* Policy metadata */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Policy name</label>
                  <input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10" />
                </div>
                <div>
                  <label className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Policy ID</label>
                  <input value={editing.policy_id} onChange={(e) => setEditing({ ...editing, policy_id: e.target.value })} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-slate-900/10" />
                </div>
              </div>
              <div>
                <label className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Description</label>
                <input value={editing.description || ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10" />
              </div>
            </div>

            {/* Visual workflow */}
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <div className="flex items-center gap-2 mb-4">
                <Shield className="w-4 h-4 text-[#0d9488]" />
                <h3 className="text-sm font-semibold text-slate-900">Policy workflow</h3>
              </div>
              <div className="flex items-center gap-2 text-[12px] text-slate-500 flex-wrap">
                <span className="rounded-lg bg-slate-50 border border-slate-200 px-2.5 py-1">Borrower data</span>
                <span>→</span>
                <span className="rounded-lg bg-slate-50 border border-slate-200 px-2.5 py-1">Risk signals</span>
                <span>→</span>
                <span className="rounded-lg bg-slate-50 border border-slate-200 px-2.5 py-1">Policy rules</span>
                <span>→</span>
                <span className="rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 px-2.5 py-1">Decision</span>
              </div>
            </div>

            {/* Rules */}
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-slate-900">Rules ({editing.rules.length})</h3>
                <button onClick={addRule} className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-slate-900 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50">
                  <Plus className="w-3.5 h-3.5" /> Add rule
                </button>
              </div>
              <div className="space-y-2">
                {editing.rules.map((r, idx) => (
                  <div key={idx} className="flex items-start gap-2 rounded-lg border border-slate-200 bg-slate-50/50 p-3">
                    <div className="flex flex-col gap-0.5 pt-1">
                      <button onClick={() => moveRule(idx, -1)} className="text-slate-300 hover:text-slate-600 text-[10px]">▲</button>
                      <GripVertical className="w-3.5 h-3.5 text-slate-300" />
                      <button onClick={() => moveRule(idx, 1)} className="text-slate-300 hover:text-slate-600 text-[10px]">▼</button>
                    </div>
                    <div className="flex-1 grid grid-cols-2 sm:grid-cols-5 gap-2 items-center">
                      <div>
                        <label className="text-[10px] text-slate-400 font-medium">Field</label>
                        <select value={r.field} onChange={(e) => updateRule(idx, "field", e.target.value)} className="w-full rounded-md border border-slate-200 px-2 py-1.5 text-[12px] bg-white">
                          {FIELDS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 font-medium">Operator</label>
                        <select value={r.operator} onChange={(e) => updateRule(idx, "operator", e.target.value)} className="w-full rounded-md border border-slate-200 px-2 py-1.5 text-[12px] bg-white">
                          {OPERATORS.map((o) => <option key={o} value={o}>{o}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 font-medium">Threshold</label>
                        <input value={r.threshold} onChange={(e) => updateRule(idx, "threshold", e.target.value)} className="w-full rounded-md border border-slate-200 px-2 py-1.5 text-[12px] font-mono" />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 font-medium">If triggered</label>
                        <select value={r.decision} onChange={(e) => updateRule(idx, "decision", e.target.value)} className={`w-full rounded-md border px-2 py-1.5 text-[12px] font-medium ${r.decision === "APPROVE" ? "bg-emerald-50 border-emerald-200 text-emerald-700" : r.decision === "DECLINE" ? "bg-rose-50 border-rose-200 text-rose-700" : "bg-amber-50 border-amber-200 text-amber-700"}`}>
                          {OUTCOMES.map((o) => <option key={o} value={o}>{o}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 font-medium">Reason</label>
                        <input value={r.reason} onChange={(e) => updateRule(idx, "reason", e.target.value)} placeholder="Why this rule exists…" className="w-full rounded-md border border-slate-200 px-2 py-1.5 text-[12px]" />
                      </div>
                    </div>
                    <button onClick={() => removeRule(idx)} className="text-slate-300 hover:text-rose-600 pt-6">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                {editing.rules.length === 0 && (
                  <div className="text-center py-8 text-sm text-slate-400">No rules yet. Click "Add rule" to start building your policy.</div>
                )}
              </div>
            </div>

            {/* Default outcome */}
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <h3 className="text-sm font-semibold text-slate-900 mb-2">Default outcome</h3>
              <p className="text-[13px] text-slate-500">If no rules are triggered, the application will be <span className="font-medium text-emerald-700">APPROVED</span>.</p>
            </div>
          </div>
        ) : (
          /* Policy List */
          <div className="space-y-4">
            {policies.length === 0 ? (
              <div className="rounded-xl border border-slate-200 bg-white p-12 text-center">
                <Shield className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                <p className="text-sm text-slate-400 mb-4">No policies yet. Start from a template.</p>
                <div className="flex items-center justify-center gap-2">
                  <button onClick={() => startNewPolicy("consumer-v1")} className="inline-flex items-center gap-1.5 text-sm font-medium text-white bg-slate-900 px-3.5 py-2 rounded-lg hover:bg-slate-800">
                    Consumer Lending
                  </button>
                  <button onClick={() => startNewPolicy("sme-v1")} className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-700 bg-white border border-slate-200 px-3.5 py-2 rounded-lg hover:bg-slate-50">
                    SME Lending
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {policies.map((p) => (
                  <div key={p.id} className="rounded-xl border border-slate-200 bg-white p-5">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-sm font-semibold text-slate-900">{p.name}</h3>
                        <div className="text-[11px] text-slate-400 font-mono">{p.policy_id} · v{p.version}</div>
                      </div>
                      <span className={`text-[10px] font-medium border rounded px-2 py-0.5 ${p.status === "active" ? "text-emerald-700 bg-emerald-50 border-emerald-200" : p.status === "draft" ? "text-slate-600 bg-slate-50 border-slate-200" : "text-slate-400 bg-slate-50 border-slate-200"}`}>
                        {p.status?.toUpperCase()}
                      </span>
                    </div>
                    {p.description && <p className="text-[13px] text-slate-500 mb-3">{p.description}</p>}
                    <div className="text-[11px] text-slate-400 mb-3">{p.rules?.length || 0} rules</div>
                    <div className="flex items-center gap-2">
                      {p.status !== "active" && (
                        <button onClick={() => activatePolicy(p)} className="text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1.5 rounded-lg hover:bg-emerald-100">
                          Activate
                        </button>
                      )}
                      <button onClick={() => setEditing({ ...p, rules: [...(p.rules || [])] })} className="text-xs font-medium text-slate-600 bg-white border border-slate-200 px-2.5 py-1.5 rounded-lg hover:bg-slate-50">
                        Edit
                      </button>
                      <button onClick={() => duplicatePolicy(p)} className="text-xs font-medium text-slate-600 bg-white border border-slate-200 px-2.5 py-1.5 rounded-lg hover:bg-slate-50">
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}