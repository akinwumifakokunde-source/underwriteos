import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import Nav from "@/components/layout/Nav.jsx";
import {
  Loader2, AlertTriangle, ArrowLeft, RotateCcw, Check, X, AlertTriangle as Alert,
  Activity
} from "lucide-react";
import DocumentsSection from "@/components/application/DocumentsSection";
import AnalysisSection from "@/components/application/AnalysisSection";
import PolicySection from "@/components/application/PolicySection";
import DecisionSection from "@/components/application/DecisionSection";
import ApplicationFormSection from "@/components/application/ApplicationFormSection";

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

const TABS = ["Overview", "Documents", "Financials", "Risk", "AI Analysis", "Policy", "Decision", "Evidence", "Activity"];

export default function ApplicationDetail() {
  const { applicationId } = useParams();
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);

  const [app, setApp] = useState(null);
  const [borrower, setBorrower] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState(urlParams.get("tab") || "Overview");
  const [form, setForm] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [processingDocId, setProcessingDocId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [running, setRunning] = useState(false);
  const [overriding, setOverriding] = useState(false);

  const load = useCallback(async () => {
    try {
      const appRes = await base44.functions.invoke("apiApplications", { action: "get", application_id: applicationId });
      setApp(appRes.data?.application);
      setBorrower(appRes.data?.borrower);

      const docRes = await base44.functions.invoke("apiDocuments", { action: "list", application_id: applicationId });
      setDocuments(docRes.data?.documents || []);

      const summaryRes = await base44.functions.invoke("apiRetrieve", { action: "summary", application_id: applicationId });
      const s = summaryRes.data;
      setResults({
        financialProfile: s?.financial_profile,
        creditProfile: s?.credit_profile,
        riskSignals: s?.risk_signals || [],
        evidence: s?.evidence || [],
        recommendation: s?.recommendation,
        decision: s?.decision,
        audit: s?.audit_events || [],
      });
    } catch (e) {
      setError(e?.response?.data?.error?.message || e.message || "Failed to load application.");
    } finally {
      setLoading(false);
    }
  }, [applicationId]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (borrower && app) {
      setForm({
        first_name: borrower.first_name || "", last_name: borrower.last_name || "",
        email: borrower.email || "", phone: borrower.phone || "",
        employment_status: borrower.employment_status || "employed",
        employer_name: borrower.employer_name || "",
        annual_income: borrower.annual_income || "",
        loan_amount: app.loan_amount || "", loan_term_months: app.loan_term_months || "",
        loan_purpose: app.loan_purpose || "general",
        product_type: app.product_type || "personal_loan",
        policy_id: app.policy_id || "consumer-v1",
      });
    }
  }, [borrower, app]);

  const allExtracted = useMemo(() => {
    const fields = [];
    documents.forEach((d) => {
      if (d.extracted_data?.fields) {
        d.extracted_data.fields.forEach((f) => fields.push({ ...f, docName: d.file_name }));
      }
    });
    return fields;
  }, [documents]);

  const uploadDocument = async (file) => {
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      const res = await base44.functions.invoke("apiDocuments", {
        action: "upload", application_id: applicationId,
        file_url, file_name: file.name, mime_type: file.type,
      });
      const doc = res.data.document;
      setDocuments((prev) => [doc, ...prev]);
      setProcessingDocId(doc.id);
      await base44.functions.invoke("apiDocuments", { action: "process", document_id: doc.id });
      await load();
    } catch (e) {
      setError(e?.response?.data?.error?.message || e.message || "Document processing failed.");
    } finally {
      setProcessingDocId(null);
      setUploading(false);
    }
  };

  const reprocessDoc = async (doc) => {
    setProcessingDocId(doc.id);
    try {
      await base44.functions.invoke("apiDocuments", { action: "reprocess", document_id: doc.id });
      await load();
    } catch (e) {
      setError(e?.response?.data?.error?.message || e.message);
    } finally {
      setProcessingDocId(null);
    }
  };

  const deleteDoc = async (doc) => {
    if (!confirm(`Delete ${doc.file_name}?`)) return;
    try {
      await base44.functions.invoke("apiDocuments", { action: "delete", document_id: doc.id });
      setDocuments((prev) => prev.filter((d) => d.id !== doc.id));
    } catch (e) {
      setError(e?.response?.data?.error?.message || e.message);
    }
  };

  const saveForm = async () => {
    setSaving(true);
    try {
      await base44.functions.invoke("apiBorrowers", {
        action: "update", borrower_id: borrower.id,
        first_name: form.first_name, last_name: form.last_name,
        email: form.email, phone: form.phone,
        employment_status: form.employment_status,
        employer_name: form.employer_name,
        annual_income: form.annual_income ? Number(form.annual_income) : null,
      });
      await base44.functions.invoke("apiApplications", {
        action: "update", application_id: applicationId,
        loan_amount: Number(form.loan_amount), loan_term_months: Number(form.loan_term_months),
        loan_purpose: form.loan_purpose, product_type: form.product_type, policy_id: form.policy_id,
      });
      await load();
    } catch (e) {
      setError(e?.response?.data?.error?.message || e.message);
    } finally {
      setSaving(false);
    }
  };

  const runAnalysis = async () => {
    setRunning(true);
    setError(null);
    try {
      await base44.functions.invoke("apiAnalyze", { application_id: applicationId });
      await base44.functions.invoke("apiUnderwrite", { application_id: applicationId, policy_id: app?.policy_id || "consumer-v1" });
      await load();
      setTab("AI Analysis");
    } catch (e) {
      setError(e?.response?.data?.error?.message || e.message || "Analysis failed.");
    } finally {
      setRunning(false);
    }
  };

  const overrideDecision = async (decision, reason) => {
    setOverriding(true);
    try {
      await base44.functions.invoke("apiUnderwrite", {
        application_id: applicationId, policy_id: app?.policy_id || "consumer-v1",
        override: { decision, reason, decided_by: "human_underwriter" },
      });
      await load();
    } catch (e) {
      setError(e?.response?.data?.error?.message || e.message);
    } finally {
      setOverriding(false);
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
  const audit = results?.audit || [];
  const dStyle = decision ? DECISION_STYLES[decision.decision] || DECISION_STYLES.REVIEW : null;

  return (
    <div className="min-h-screen bg-[#f7f8fa] text-slate-900">
      <Nav />
      <div className="max-w-5xl mx-auto px-5 sm:px-8 py-8">
        <Link to="/applications" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 mb-4">
          <ArrowLeft className="w-4 h-4" /> Applications
        </Link>

        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-semibold tracking-tight">{app?.application_number || applicationId.slice(-8)}</h1>
              <span className={`text-[10px] font-medium border rounded px-2 py-0.5 ${STATUS_STYLES[app?.status] || STATUS_STYLES.draft}`}>{STATUS_LABELS[app?.status] || app?.status}</span>
              {decision && decision.decision !== "null" && (
                <span className={`text-[10px] font-medium border rounded px-2 py-0.5 ${dStyle?.bg} ${dStyle?.text} ${dStyle?.border}`}>{decision.decision}</span>
              )}
            </div>
            <p className="text-sm text-slate-500">
              {borrower ? `${borrower.first_name} ${borrower.last_name}` : "—"} · {fmtMoney(app?.loan_amount, app?.loan_currency)} · {(app?.product_type || "personal_loan").replace(/_/g, " ")} · {app?.loan_term_months ? `${app.loan_term_months} months` : ""}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {app?.status !== "completed" && (
              <button onClick={runAnalysis} disabled={running} className="inline-flex items-center gap-1.5 text-sm font-medium text-white bg-[#0a0c12] px-3.5 py-2 rounded-lg hover:bg-[#1c1f26] disabled:opacity-50">
                {running ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />} Run analysis
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm text-rose-700 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" /> {error}
          </div>
        )}

        {/* Tabs */}
        <div className="flex items-center gap-1.5 mb-5 border-b border-slate-100 pb-3 overflow-x-auto no-scrollbar">
          {TABS.map((t) => (
            <button key={t} onClick={() => setTab(t)} className={`shrink-0 text-xs px-3 py-1.5 rounded-lg transition-colors ${tab === t ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"}`}>
              {t}{t === "Documents" && documents.length > 0 && <span className="ml-1 text-[10px] opacity-60">{documents.length}</span>}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="space-y-4">
          {tab === "Overview" && form && (
            <OverviewTab borrower={borrower} app={app} fp={fp} cp={cp} decision={decision} recommendation={recommendation} fmtMoney={fmtMoney}>
              <ApplicationFormSection
                borrower={borrower} app={app} form={form} setForm={setForm}
                extractedFields={allExtracted} onSave={saveForm} saving={saving}
              />
            </OverviewTab>
          )}

          {tab === "Documents" && (
            <DocumentsSection
              documents={documents} policyId={app?.policy_id || "consumer-v1"}
              onUpload={uploadDocument} uploading={uploading}
              onReprocess={reprocessDoc} onDelete={deleteDoc}
              onView={(doc) => window.open(doc.file_url, "_blank")}
              processingDocId={processingDocId}
            />
          )}

          {tab === "Financials" && (
            <FinancialsTab fp={fp} cp={cp} fmtMoney={fmtMoney} />
          )}

          {tab === "Risk" && (
            <RiskTab signals={riskSignals} />
          )}

          {tab === "AI Analysis" && (
            <AnalysisSection
              results={results}
              running={running}
              lastUpdated={decision?.decision_timestamp ? timeAgo(new Date(decision.decision_timestamp)) : null}
              onRerun={runAnalysis}
            />
          )}

          {tab === "Policy" && (
            <PolicySection decision={decision} policyInfo={{ name: app?.policy_id === "sme-v1" ? "SME Lending v1" : "Consumer Lending v1" }} />
          )}

          {tab === "Decision" && (
            <DecisionSection
              decision={decision} recommendation={recommendation}
              evidence={evidence} onOverride={overrideDecision} overriding={overriding}
            />
          )}

          {tab === "Evidence" && (
            <EvidenceTab evidence={evidence} />
          )}

          {tab === "Activity" && (
            <ActivityTab audit={audit} />
          )}
        </div>
      </div>
    </div>
  );
}

// ── Overview Tab ──────────────────────────────────────────────
function OverviewTab({ borrower, app, fp, cp, decision, recommendation, fmtMoney, children }) {
  const dti = fp?.affordability?.debt_to_income;
  const riskLevel = decision?.risk_score != null ? (decision.risk_score < 0.3 ? "LOW" : decision.risk_score < 0.6 ? "MEDIUM" : "HIGH") : "—";

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Borrower" value={borrower ? `${borrower.first_name} ${borrower.last_name}` : "—"} />
        <StatCard label="Loan" value={fmtMoney(app?.loan_amount, app?.loan_currency)} />
        <StatCard label="Income" value={borrower?.annual_income ? fmtMoney(borrower.annual_income, borrower.income_currency) : fp?.income?.annual ? fmtMoney(fp.income.annual) : "—"} />
        <StatCard label="DTI" value={dti != null ? `${(dti * 100).toFixed(1)}%` : "—"} />
        <StatCard label="Credit score" value={cp?.credit_score ?? "—"} />
        <StatCard label="Risk" value={riskLevel} />
        <StatCard label="AI recommendation" value={recommendation?.recommendation || "—"} highlight={recommendation?.recommendation === "APPROVE" ? "emerald" : recommendation?.recommendation === "DECLINE" ? "rose" : "amber"} />
        <StatCard label="Final decision" value={decision?.decision || "—"} highlight={decision?.decision === "APPROVE" ? "emerald" : decision?.decision === "DECLINE" ? "rose" : "amber"} />
      </div>

      {decision?.reasons?.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h3 className="text-sm font-semibold text-slate-900 mb-2">Why this decision?</h3>
          <ul className="space-y-1.5">
            {decision.reasons.slice(0, 3).map((r, i) => (
              <li key={i} className="text-sm text-slate-600 flex gap-2"><span className="text-slate-300 mt-0.5">•</span>{r}</li>
            ))}
          </ul>
        </div>
      )}

      {children}
    </div>
  );
}

function StatCard({ label, value, highlight }) {
  const cls = highlight === "emerald" ? "text-emerald-700" : highlight === "rose" ? "text-rose-700" : highlight === "amber" ? "text-amber-700" : "text-slate-900";
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">{label}</div>
      <div className={`text-base font-semibold mt-1 ${cls}`}>{value}</div>
    </div>
  );
}

// ── Financials Tab ────────────────────────────────────────────
function FinancialsTab({ fp, cp, fmtMoney }) {
  return (
    <div className="space-y-4">
      {cp && (
        <Card title="Credit profile">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <Row label="Credit score" value={cp.credit_score} />
            <Row label="Score band" value={cp.score_band} />
            <Row label="Utilisation" value={cp.credit_utilisation != null ? `${Math.round(cp.credit_utilisation * 100)}%` : "—"} />
            <Row label="Defaults" value={cp.defaults} />
            <Row label="Active accounts" value={cp.active_accounts} />
            <Row label="Delinquent accounts" value={cp.delinquent_accounts} />
            <Row label="Recent enquiries" value={cp.recent_enquiries} />
            <Row label="Repayment history" value={cp.repayment_history != null ? `${cp.repayment_history}%` : "—"} />
            <Row label="Outstanding balance" value={cp.outstanding_balance != null ? fmtMoney(cp.outstanding_balance) : "—"} />
          </div>
        </Card>
      )}
      {fp && (
        <Card title="Financial profile">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <Row label="Monthly income" value={fp.income?.monthly ? fmtMoney(fp.income.monthly) : "—"} />
            <Row label="Annual income" value={fp.income?.annual ? fmtMoney(fp.income.annual) : "—"} />
            <Row label="Monthly expenses" value={fp.expenses?.monthly ? fmtMoney(fp.expenses.monthly) : "—"} />
            <Row label="Monthly net" value={fp.cashflow?.monthly_net ? fmtMoney(fp.cashflow.monthly_net) : "—"} />
            <Row label="Disposable income" value={fp.cashflow?.disposable_income ? fmtMoney(fp.cashflow.disposable_income) : "—"} />
            <Row label="Average balance" value={fp.cashflow?.average_balance ? fmtMoney(fp.cashflow.average_balance) : "—"} />
            <Row label="Debt-to-income" value={fp.affordability?.debt_to_income != null ? fp.affordability.debt_to_income.toFixed(2) : "—"} />
            <Row label="Repayment capacity" value={fp.affordability?.repayment_capacity ? fmtMoney(fp.affordability.repayment_capacity) : "—"} />
            <Row label="Income stability" value={fp.financial_behaviour?.income_stability != null ? `${Math.round(fp.financial_behaviour.income_stability * 100)}%` : "—"} />
          </div>
        </Card>
      )}
      {!cp && !fp && <Card title="Financials"><p className="text-sm text-slate-400">No financial data yet. Upload documents or run analysis to generate financial profiles.</p></Card>}
    </div>
  );
}

// ── Risk Tab ──────────────────────────────────────────────────
function RiskTab({ signals }) {
  if (!signals || signals.length === 0) {
    return <Card title="Risk signals"><p className="text-sm text-slate-400">No risk signals generated yet. Run analysis to generate signals.</p></Card>;
  }
  return (
    <Card title={`Risk signals (${signals.length})`}>
      <div className="space-y-2">
        {signals.map((s, i) => (
          <div key={i} className="flex items-center gap-3 py-2 border-b border-slate-100 last:border-0">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${s.flag === "positive" ? "text-emerald-700 bg-emerald-50 border-emerald-200" : s.flag === "negative" ? "text-amber-700 bg-amber-50 border-amber-200" : s.flag === "critical" ? "text-rose-700 bg-rose-50 border-rose-200" : "text-slate-600 bg-slate-50 border-slate-200"}`}>{(s.flag || "neutral").toUpperCase()}</span>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-slate-800">{s.signal.replace(/_/g, " ")}</div>
              {s.explanation && <div className="text-[12px] text-slate-500">{s.explanation}</div>}
            </div>
            <div className="text-sm font-mono text-slate-700">{formatSignalValue(s)}</div>
          </div>
        ))}
      </div>
    </Card>
  );
}

// ── Evidence Tab ──────────────────────────────────────────────
function EvidenceTab({ evidence }) {
  if (!evidence || evidence.length === 0) {
    return <Card title="Evidence"><p className="text-sm text-slate-400">No evidence records yet. Run analysis to generate evidence.</p></Card>;
  }
  return (
    <Card title={`Evidence (${evidence.length})`}>
      <p className="text-[12px] text-slate-400 mb-3">Every risk signal is traceable to its source through these evidence records.</p>
      <div className="space-y-1">
        {evidence.map((e, i) => (
          <div key={i} className="text-[12px] text-slate-600 flex gap-2 py-1.5 border-b border-slate-100 last:border-0">
            <span className="text-slate-300">{i + 1}.</span>
            <span className="flex-1">
              <span className="font-medium text-slate-700">{e.signal}</span>: {String(e.value)}
              <span className="text-slate-400 ml-1">[{e.source_type}{e.source_location ? ` · ${e.source_location}` : ""}{e.field ? ` · ${e.field}` : ""}]</span>
              {e.confidence != null && <span className="text-teal-600 ml-1">{Math.round(e.confidence * 100)}%</span>}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}

// ── Activity Tab ──────────────────────────────────────────────
function ActivityTab({ audit }) {
  if (!audit || audit.length === 0) {
    return <Card title="Audit trail"><p className="text-sm text-slate-400">No activity recorded yet.</p></Card>;
  }
  return (
    <Card title="Audit trail">
      <div className="space-y-2">
        {audit.map((e, i) => (
          <div key={i} className="flex items-start gap-3 py-2 border-b border-slate-100 last:border-0">
            <Activity className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
            <div className="flex-1">
              <div className="text-sm font-medium text-slate-800">{e.event.replace(/[._]/g, " ")}</div>
              <div className="text-[11px] text-slate-400">{e.created_date ? new Date(e.created_date).toLocaleString() : ""} · {e.actor_type}</div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

// ── Helpers ───────────────────────────────────────────────────
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

function formatSignalValue(s) {
  if (s.value_type === "number") {
    if (s.currency) return new Intl.NumberFormat("en-US", { style: "currency", currency: s.currency, maximumFractionDigits: 0 }).format(s.value || 0);
    if (s.value < 1 && s.value > 0) return `${Math.round(s.value * 100)}%`;
    return String(s.value);
  }
  return String(s.value ?? "—");
}

function timeAgo(date) {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return `${seconds} seconds ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
  return `${Math.floor(seconds / 86400)} days ago`;
}