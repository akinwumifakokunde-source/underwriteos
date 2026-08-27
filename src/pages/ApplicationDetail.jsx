import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import Nav from "@/components/layout/Nav.jsx";
import { Loader2, AlertTriangle, ArrowLeft, Check, X, AlertTriangle as Alert, ShieldCheck, Brain, FileText, GitBranch, Activity, RotateCcw } from "lucide-react";

const DECISION_STYLES = {
  APPROVE: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", icon: Check },
  REVIEW: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", icon: Alert },
  DECLINE: { bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-200", icon: X },
};

const STATUS_STYLES = {
  draft: "bg-slate-50 text-slate-600 border-slate-200",
  data_collection: "bg-sky-50 text-sky-700 border-sky-200",
  analyzing: "bg-indigo-50 text-indigo-700 border-indigo-200",
  underwriting: "bg-violet-50 text-violet-700 border-violet-200",
  completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  failed: "bg-rose-50 text-rose-700 border-rose-200",
};

const STATUS_LABELS = {
  draft: "NEW",
  data_collection: "PENDING INFO",
  analyzing: "ANALYZING",
  underwriting: "UNDER REVIEW",
  completed: "COMPLETED",
  failed: "FAILED",
};

const TABS = ["Overview", "Documents", "Financials", "Risk Analysis", "Policy", "Decision", "Evidence", "Activity"];

export default function ApplicationDetail() {
  const { applicationId } = useParams();
  const [app, setApp] = useState(null);
  const [borrower, setBorrower] = useState(null);
  const [results, setResults] = useState(null);
  const [audit, setAudit] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState("Overview");
  const [overrideMode, setOverrideMode] = useState(false);
  const [overrideReason, setOverrideReason] = useState("");
  const [overrideDecision, setOverrideDecision] = useState("");
  const [acting, setActing] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const appRes = await base44.functions.invoke("apiApplications", { action: "get", application_id: applicationId });
      setApp(appRes.data?.application);
      setBorrower(appRes.data?.borrower);

      const get = async (action) => {
        try {
          const r = await base44.functions.invoke("apiRetrieve", { action, application_id: applicationId });
          return r.data;
        } catch { return null; }
      };
      const [fp, cp, rec, dec, risk, ev, aud] = await Promise.all([
        get("financial-profile"), get("credit-profile"), get("recommendation"),
        get("decision"), get("risk"), get("evidence"), get("audit"),
      ]);
      setResults({
        financialProfile: fp?.financial_profile,
        creditProfile: cp?.credit_profile,
        recommendation: rec?.recommendation,
        decision: dec?.decision,
        riskSignals: risk?.signals || [],
        evidence: ev?.evidence || [],
      });
      setAudit(aud?.audit_events || []);
    } catch (e) {
      setError(e?.response?.data?.error?.message || e.message || "Failed to load application.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [applicationId]);

  const runAnalysis = async () => {
    setActing(true);
    try {
      await base44.functions.invoke("apiAnalyze", { application_id: applicationId });
      await base44.functions.invoke("apiUnderwrite", { application_id: applicationId, policy_id: app?.policy_id || "consumer-v1" });
      await load();
    } catch (e) {
      setError(e?.response?.data?.error?.message || e.message || "Analysis failed.");
    } finally {
      setActing(false);
    }
  };

  const submitOverride = async () => {
    if (!overrideDecision || !overrideReason.trim()) return;
    setActing(true);
    try {
      await base44.functions.invoke("apiUnderwrite", {
        application_id: applicationId,
        policy_id: app?.policy_id || "consumer-v1",
        override: { decision: overrideDecision, reason: overrideReason, decided_by: "human_underwriter" },
      });
      setOverrideMode(false);
      setOverrideReason("");
      setOverrideDecision("");
      await load();
    } catch (e) {
      setError(e?.response?.data?.error?.message || e.message || "Override failed.");
    } finally {
      setActing(false);
    }
  };

  const fmtMoney = (n, c) => new Intl.NumberFormat("en-US", { style: "currency", currency: (c || "GBP").toUpperCase(), maximumFractionDigits: 0 }).format(n || 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f8fa]">
        <Nav />
        <div className="max-w-5xl mx-auto px-5 sm:px-8 py-10 flex items-center justify-center gap-3">
          <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />
          <span className="text-sm text-slate-500">Loading application…</span>
        </div>
      </div>
    );
  }

  if (error && !app) {
    return (
      <div className="min-h-screen bg-[#f7f8fa]">
        <Nav />
        <div className="max-w-5xl mx-auto px-5 sm:px-8 py-10">
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <p className="text-sm text-rose-700">{error}</p>
          </div>
          <Link to="/applications" className="mt-4 inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900">
            <ArrowLeft className="w-4 h-4" /> Back to applications
          </Link>
        </div>
      </div>
    );
  }

  const decision = results?.decision;
  const recommendation = results?.recommendation;
  const riskSignals = results?.riskSignals || [];
  const evidence = results?.evidence || [];
  const fp = results?.financialProfile;
  const cp = results?.creditProfile;
  const dStyle = decision ? DECISION_STYLES[decision.decision] || DECISION_STYLES.REVIEW : null;
  const DIcon = dStyle?.icon;

  return (
    <div className="min-h-screen bg-[#f7f8fa] text-slate-900">
      <Nav />
      <div className="max-w-5xl mx-auto px-5 sm:px-8 py-8">
        {/* Breadcrumb */}
        <Link to="/applications" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 mb-4">
          <ArrowLeft className="w-4 h-4" /> Applications
        </Link>

        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-semibold tracking-tight">{app?.application_number || applicationId.slice(-8)}</h1>
              <span className={`text-[10px] font-medium border rounded px-2 py-0.5 ${STATUS_STYLES[app?.status] || STATUS_STYLES.draft}`}>{STATUS_LABELS[app?.status] || app?.status}</span>
            </div>
            <p className="text-sm text-slate-500">
              {borrower ? `${borrower.first_name} ${borrower.last_name}` : "—"} · {fmtMoney(app?.loan_amount, app?.loan_currency)} · {(app?.product_type || "personal_loan").replace(/_/g, " ")}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {app?.status !== "completed" && (
              <button onClick={runAnalysis} disabled={acting} className="inline-flex items-center gap-1.5 text-sm font-medium text-white bg-[#0a0c12] px-3.5 py-2 rounded-lg hover:bg-[#1c1f26] disabled:opacity-50">
                {acting ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />} Run analysis
              </button>
            )}
          </div>
        </div>

        {/* Decision banner */}
        {decision && dStyle && (
          <div className={`rounded-xl border p-5 flex items-center gap-4 mb-5 ${dStyle.bg} ${dStyle.border}`}>
            <div className="w-11 h-11 rounded-full bg-white/60 flex items-center justify-center shrink-0">
              <DIcon className={`w-6 h-6 ${dStyle.text}`} />
            </div>
            <div className="flex-1">
              <div className="text-[11px] uppercase tracking-wider opacity-70">Final decision</div>
              <div className="text-xl font-semibold">{decision.decision}</div>
              <div className="text-[12px] opacity-70 mt-0.5">Decided by {decision.decision_source?.replace(/_/g, " ")}</div>
            </div>
            <div className="text-right shrink-0">
              <div className="text-[11px] uppercase tracking-wider opacity-70">Risk score</div>
              <div className="text-xl font-semibold">{decision.risk_score?.toFixed(1) || "—"}</div>
            </div>
          </div>
        )}

        {/* AI vs Policy comparison */}
        {recommendation && decision && (
          <div className="grid grid-cols-3 gap-3 mb-5">
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex items-center gap-1.5 mb-1"><Brain className="w-3.5 h-3.5 text-violet-500" /><span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">AI recommendation</span></div>
              <div className={`text-lg font-semibold ${recommendation.recommendation === "APPROVE" ? "text-emerald-700" : recommendation.recommendation === "DECLINE" ? "text-rose-700" : "text-amber-700"}`}>{recommendation.recommendation}</div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex items-center gap-1.5 mb-1"><ShieldCheck className="w-3.5 h-3.5 text-sky-500" /><span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Policy evaluation</span></div>
              <div className={`text-lg font-semibold ${decision.decision === "APPROVE" ? "text-emerald-700" : decision.decision === "DECLINE" ? "text-rose-700" : "text-amber-700"}`}>{decision.decision}</div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex items-center gap-1.5 mb-1"><GitBranch className="w-3.5 h-3.5 text-slate-500" /><span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Final decision</span></div>
              <div className={`text-lg font-semibold ${decision.decision === "APPROVE" ? "text-emerald-700" : decision.decision === "DECLINE" ? "text-rose-700" : "text-amber-700"}`}>{decision.decision}</div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex items-center gap-1.5 mb-5 border-b border-slate-100 pb-3 overflow-x-auto no-scrollbar">
          {TABS.map((t) => (
            <button key={t} onClick={() => setTab(t)} className={`shrink-0 text-xs px-3 py-1.5 rounded-lg transition-colors ${tab === t ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"}`}>
              {t}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="space-y-4">
          {tab === "Overview" && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Card title="Borrower information">
                  <Row label="Name" value={borrower ? `${borrower.first_name} ${borrower.last_name}` : "—"} />
                  <Row label="Email" value={borrower?.email} />
                  <Row label="Phone" value={borrower?.phone} />
                  <Row label="Employment" value={borrower?.employment_status?.replace(/_/g, " ")} />
                  <Row label="Employer" value={borrower?.employer_name} />
                  <Row label="Annual income" value={borrower?.annual_income ? fmtMoney(borrower.annual_income, borrower.income_currency) : "—"} />
                </Card>
                <Card title="Loan information">
                  <Row label="Product type" value={(app?.product_type || "personal_loan").replace(/_/g, " ")} />
                  <Row label="Requested amount" value={fmtMoney(app?.loan_amount, app?.loan_currency)} />
                  <Row label="Term" value={app?.loan_term_months ? `${app.loan_term_months} months` : "—"} />
                  <Row label="Purpose" value={app?.loan_purpose?.replace(/_/g, " ")} />
                  <Row label="Policy" value={app?.policy_id} />
                  <Row label="Interest rate" value={app?.interest_rate ? `${app.interest_rate}%` : "—"} />
                </Card>
              </div>
              {recommendation?.ai_memo && (
                <Card title="AI underwriting summary">
                  <p className="text-sm text-slate-700 leading-relaxed">{recommendation.ai_memo}</p>
                </Card>
              )}
            </>
          )}

          {tab === "Documents" && (
            <Card title="Uploaded documents">
              <p className="text-sm text-slate-400">Documents uploaded for this application will appear here. Upload documents when creating or editing an application.</p>
            </Card>
          )}

          {tab === "Financials" && (
            <>
              {cp && (
                <Card title="Credit profile">
                  <div className="grid grid-cols-2 gap-2">
                    <Row label="Credit score" value={cp.credit_score} />
                    <Row label="Score band" value={cp.score_band} />
                    <Row label="Utilisation" value={cp.credit_utilisation != null ? `${Math.round(cp.credit_utilisation * 100)}%` : "—"} />
                    <Row label="Defaults" value={cp.defaults} />
                    <Row label="Active accounts" value={cp.active_accounts} />
                    <Row label="Delinquent accounts" value={cp.delinquent_accounts} />
                    <Row label="Recent enquiries" value={cp.recent_enquiries} />
                    <Row label="Repayment history" value={cp.repayment_history != null ? `${cp.repayment_history}%` : "—"} />
                  </div>
                </Card>
              )}
              {fp && (
                <Card title="Financial profile">
                  <div className="grid grid-cols-2 gap-2">
                    <Row label="Monthly income" value={fp.income?.monthly ? fmtMoney(fp.income.monthly) : "—"} />
                    <Row label="Monthly expenses" value={fp.expenses?.monthly ? fmtMoney(fp.expenses.monthly) : "—"} />
                    <Row label="Monthly net" value={fp.cashflow?.monthly_net ? fmtMoney(fp.cashflow.monthly_net) : "—"} />
                    <Row label="Disposable income" value={fp.cashflow?.disposable_income ? fmtMoney(fp.cashflow.disposable_income) : "—"} />
                    <Row label="Debt-to-income" value={fp.affordability?.debt_to_income != null ? fp.affordability.debt_to_income.toFixed(2) : "—"} />
                    <Row label="Average balance" value={fp.cashflow?.average_balance ? fmtMoney(fp.cashflow.average_balance) : "—"} />
                  </div>
                </Card>
              )}
              {!cp && !fp && <Card title="Financials"><p className="text-sm text-slate-400">No financial data yet. Run analysis to generate financial profiles.</p></Card>}
            </>
          )}

          {tab === "Risk Analysis" && (
            <Card title="Risk signals">
              {riskSignals.length === 0 ? (
                <p className="text-sm text-slate-400">No risk signals generated yet. Run analysis to generate signals.</p>
              ) : (
                <div className="space-y-2">
                  {riskSignals.map((s, i) => (
                    <div key={i} className="flex items-center gap-3 py-2 border-b border-slate-100 last:border-0">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${s.flag === "positive" ? "text-emerald-700 bg-emerald-50 border-emerald-200" : s.flag === "negative" ? "text-amber-700 bg-amber-50 border-amber-200" : s.flag === "critical" ? "text-rose-700 bg-rose-50 border-rose-200" : "text-slate-600 bg-slate-50 border-slate-200"}`}>{(s.flag || "neutral").toUpperCase()}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-slate-800">{s.signal}</div>
                        {s.explanation && <div className="text-[12px] text-slate-500">{s.explanation}</div>}
                      </div>
                      <div className="text-sm font-mono text-slate-700">{String(s.value ?? "—")}</div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )}

          {tab === "Policy" && (
            <Card title="Policy evaluation">
              {decision?.policy_outcome ? (
                <>
                  <div className="space-y-2 mb-4">
                    {(decision.policy_outcome.evaluated_rules || []).map((r, i) => (
                      <div key={i} className="flex items-center gap-3 py-2 border-b border-slate-100 last:border-0">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${r.result === "PASS" ? "text-emerald-700 bg-emerald-50" : "text-rose-700 bg-rose-50"}`}>{r.result}</span>
                        <div className="flex-1">
                          <div className="text-sm font-medium text-slate-800">{r.field} {r.operator} {String(r.threshold)}</div>
                          <div className="text-[12px] text-slate-500">{r.reason}</div>
                        </div>
                        <div className="text-sm font-mono text-slate-600">Observed: {String(r.input ?? "—")}</div>
                      </div>
                    ))}
                  </div>
                  {decision.policy_outcome.triggered_rules?.length > 0 && (
                    <div className="rounded-lg bg-amber-50 border border-amber-200 p-3">
                      <div className="text-[11px] font-semibold text-amber-700 mb-1">Triggered rules</div>
                      <ul className="space-y-1">
                        {decision.policy_outcome.triggered_rules.map((r, i) => (
                          <li key={i} className="text-[12px] text-amber-700">{r.reason}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-sm text-slate-400">No policy evaluation yet. Run analysis to evaluate the policy.</p>
              )}
            </Card>
          )}

          {tab === "Decision" && (
            <>
              {decision ? (
                <>
                  <Card title="Final decision">
                    <div className="grid grid-cols-2 gap-2">
                      <Row label="Decision" value={decision.decision} />
                      <Row label="Decision source" value={decision.decision_source?.replace(/_/g, " ")} />
                      <Row label="Policy" value={`${decision.policy_id} v${decision.policy_version}`} />
                      <Row label="Risk score" value={decision.risk_score?.toFixed(2)} />
                      <Row label="Probability of default" value={decision.probability_of_default?.toFixed(3)} />
                      <Row label="Confidence" value={decision.confidence != null ? `${Math.round(decision.confidence * 100)}%` : "—"} />
                      <Row label="Human review" value={decision.human_review_required ? "Required" : "Not required"} />
                    </div>
                    {decision.reasons?.length > 0 && (
                      <div className="mt-4">
                        <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-2">Reasons</div>
                        <ul className="space-y-1">
                          {decision.reasons.map((r, i) => <li key={i} className="text-sm text-slate-700 flex gap-2"><span className="text-slate-300">•</span>{r}</li>)}
                        </ul>
                      </div>
                    )}
                  </Card>

                  {/* Human review / override */}
                  {!overrideMode ? (
                    <Card title="Human review">
                      <p className="text-sm text-slate-500 mb-3">As an underwriter, you can approve, decline, or request more information. Overrides require a reason and are recorded in the audit log.</p>
                      <button onClick={() => setOverrideMode(true)} className="inline-flex items-center gap-1.5 text-sm font-medium text-white bg-slate-900 px-3.5 py-2 rounded-lg hover:bg-slate-800">
                        Override decision
                      </button>
                    </Card>
                  ) : (
                    <Card title="Override decision">
                      <div className="space-y-3">
                        <div>
                          <label className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">New decision</label>
                          <div className="flex gap-2 mt-1">
                            {["APPROVE", "REVIEW", "DECLINE"].map((d) => (
                              <button key={d} onClick={() => setOverrideDecision(d)} className={`text-sm px-3 py-2 rounded-lg border ${overrideDecision === d ? "bg-slate-900 text-white border-slate-900" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
                                {d}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <label className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Reason (required)</label>
                          <textarea value={overrideReason} onChange={(e) => setOverrideReason(e.target.value)} rows={3} placeholder="Explain why this decision is being overridden…" className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10" />
                        </div>
                        <div className="flex items-center gap-2">
                          <button onClick={submitOverride} disabled={acting || !overrideDecision || !overrideReason.trim()} className="inline-flex items-center gap-1.5 text-sm font-medium text-white bg-slate-900 px-3.5 py-2 rounded-lg hover:bg-slate-800 disabled:opacity-50">
                            {acting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />} Submit override
                          </button>
                          <button onClick={() => { setOverrideMode(false); setOverrideReason(""); setOverrideDecision(""); }} className="text-sm text-slate-600 px-3 py-2 rounded-lg hover:bg-slate-100">
                            Cancel
                          </button>
                        </div>
                      </div>
                    </Card>
                  )}
                </>
              ) : (
                <Card title="Decision"><p className="text-sm text-slate-400">No decision yet. Run analysis to generate a decision.</p></Card>
              )}
            </>
          )}

          {tab === "Evidence" && (
            <Card title={`Evidence (${evidence.length})`}>
              {evidence.length === 0 ? (
                <p className="text-sm text-slate-400">No evidence records yet. Run analysis to generate evidence.</p>
              ) : (
                <div className="space-y-1">
                  {evidence.map((e, i) => (
                    <div key={i} className="text-[12px] text-slate-600 font-mono flex gap-2 py-1.5 border-b border-slate-100 last:border-0">
                      <span className="text-slate-300">{i + 1}.</span>
                      <span className="flex-1">{e.signal}: {String(e.value)} <span className="text-slate-400">[{e.source_type}{e.field ? ` · ${e.field}` : ""}]</span></span>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )}

          {tab === "Activity" && (
            <Card title="Audit trail">
              {audit.length === 0 ? (
                <p className="text-sm text-slate-400">No activity recorded yet.</p>
              ) : (
                <div className="space-y-2">
                  {audit.map((e, i) => (
                    <div key={i} className="flex items-start gap-3 py-2 border-b border-slate-100 last:border-0">
                      <Activity className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                      <div className="flex-1">
                        <div className="text-sm font-medium text-slate-800">{e.event}</div>
                        <div className="text-[11px] text-slate-400">{e.created_date ? new Date(e.created_date).toLocaleString() : ""} · {e.actor_type}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function Card({ title, children }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <h3 className="text-sm font-semibold text-slate-900 mb-3">{title}</h3>
      {children}
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between border-b border-slate-50 py-1.5">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="text-sm font-medium text-slate-800">{value ?? "—"}</span>
    </div>
  );
}