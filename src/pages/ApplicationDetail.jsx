import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import Nav from "@/components/layout/Nav.jsx";
import { Loader2, AlertTriangle, ArrowLeft } from "lucide-react";
import StatusIndicator from "@/components/application/StatusIndicator";
import OverviewTab from "@/components/application/OverviewTab";
import DocumentsSection from "@/components/application/DocumentsSection";
import FinancialProfileTab from "@/components/application/FinancialProfileTab";
import RiskSignalsTab from "@/components/application/RiskSignalsTab";
import AnalysisSection from "@/components/application/AnalysisSection";
import PolicySection from "@/components/application/PolicySection";
import DecisionSection from "@/components/application/DecisionSection";
import EvidenceTab from "@/components/application/EvidenceTab";
import ActivityTab from "@/components/application/ActivityTab";
import ApplicationHeader from "@/components/application/ApplicationHeader";
import AffordabilityTab from "@/components/application/AffordabilityTab";
import ReconciliationPanel from "@/components/application/ReconciliationPanel";
import ChatAssistant from "@/components/application/ChatAssistant";
import DataSourcePuller from "@/components/application/DataSourcePuller";
import { getJurisdiction, getPolicyLabel, getCurrency } from "@/lib/jurisdictions";
import { computeRiskDimensions } from "@/lib/riskDimensions";

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

const TABS = ["Overview", "Documents", "Financial Profile", "Affordability", "Reconciliation", "Risk", "AI Underwriter", "Policy", "Decision", "Evidence", "Activity"];

export default function ApplicationDetail() {
  const { applicationId } = useParams();
  const urlParams = new URLSearchParams(window.location.search);

  const [app, setApp] = useState(null);
  const [borrower, setBorrower] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState(TABS.includes(urlParams.get("tab")) ? urlParams.get("tab") : "Overview");
  const [form, setForm] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [processingDocId, setProcessingDocId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [overriding, setOverriding] = useState(false);
  const [autoRan, setAutoRan] = useState(false);
  const [pulling, setPulling] = useState(null);

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
        market: app.market || "GB",
        borrower_type: app.borrower_type || "salaried",
        state: app.state || "",
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

  // Auto-run analysis pipeline (analyze + underwrite) — silent on failure
  const runPipeline = useCallback(async (policyId) => {
    setAnalyzing(true);
    try {
      await base44.functions.invoke("apiAnalyze", { application_id: applicationId });
      await base44.functions.invoke("apiUnderwrite", { application_id: applicationId, policy_id: policyId || app?.policy_id || "consumer-v1" });
      await load();
    } catch (e) {
      console.warn("Auto-analysis failed", e);
    } finally {
      setAnalyzing(false);
    }
  }, [applicationId, app?.policy_id, load]);

  // Auto-run the pipeline once on load if documents exist but no decision yet
  useEffect(() => {
    if (!loading && !autoRan && documents.length > 0 && !results?.decision) {
      setAutoRan(true);
      runPipeline();
    }
  }, [loading, autoRan, documents, results?.decision, runPipeline]);

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
      await runPipeline();
      setTab("Overview");
    } catch (e) {
      setError(e?.response?.data?.error?.message || e.message || "Document processing failed.");
    } finally {
      setProcessingDocId(null);
      setUploading(false);
    }
  };

  const pullCreditReport = async (provider) => {
    setPulling("credit");
    try {
      await base44.functions.invoke("apiCreditReport", { application_id: applicationId, mode: "auto", provider });
      await load();
      await runPipeline();
      setTab("Overview");
    } catch (e) {
      setError(e?.response?.data?.error?.message || e.message || "Credit report pull failed.");
    } finally {
      setPulling(null);
    }
  };

  const pullBankStatement = async (provider) => {
    setPulling("bank");
    try {
      await base44.functions.invoke("apiBankStatement", { application_id: applicationId, mode: "auto", provider });
      await load();
      await runPipeline();
      setTab("Overview");
    } catch (e) {
      setError(e?.response?.data?.error?.message || e.message || "Bank statement pull failed.");
    } finally {
      setPulling(null);
    }
  };

  const reprocessDoc = async (doc) => {
    setProcessingDocId(doc.id);
    try {
      await base44.functions.invoke("apiDocuments", { action: "reprocess", document_id: doc.id });
      await load();
      await runPipeline();
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
      await runPipeline();
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
      const jur = getJurisdiction(form.market);
      await base44.functions.invoke("apiApplications", {
        action: "update", application_id: applicationId,
        loan_amount: Number(form.loan_amount), loan_term_months: Number(form.loan_term_months),
        loan_purpose: form.loan_purpose, product_type: form.product_type, policy_id: form.policy_id,
        market: form.market, borrower_type: form.borrower_type, state: form.state,
        loan_currency: jur.currency,
      });
      await load();
      await runPipeline(form.policy_id);
    } catch (e) {
      setError(e?.response?.data?.error?.message || e.message);
    } finally {
      setSaving(false);
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

  const decision = results?.decision;
  const recommendation = results?.recommendation;
  const riskSignals = results?.riskSignals || [];
  const evidence = results?.evidence || [];
  const fp = results?.financialProfile;
  const cp = results?.creditProfile;
  const audit = results?.audit || [];

  const status = analyzing ? "analyzing"
    : (decision?.decision === "REVIEW" || decision?.human_review_required) ? "review"
    : decision ? "up_to_date"
    : "needs_info";

  const lastUpdated = decision?.decision_timestamp ? timeAgo(new Date(decision.decision_timestamp)) : null;
  const onViewEvidence = () => setTab("Evidence");
  const dimensions = computeRiskDimensions({ fp, cp, riskSignals, documents, decision });

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

  return (
    <div className="min-h-screen bg-[#f7f8fa] text-slate-900">
      <Nav />
      <div className="max-w-5xl mx-auto px-5 sm:px-8 py-8">
        <Link to="/applications" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 mb-4">
          <ArrowLeft className="w-4 h-4" /> Applications
        </Link>

        <div className="flex items-start justify-between mb-5 gap-4">
          <div className="flex-1">
            <ApplicationHeader app={app} borrower={borrower} documents={documents} decision={decision} fmtMoney={fmtMoney} />
          </div>
          <StatusIndicator status={status} lastUpdated={lastUpdated} onRerun={() => runPipeline()} />
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
          {tab === "Overview" && (
            <OverviewTab
              borrower={borrower} app={app} fp={fp} cp={cp}
              decision={decision} recommendation={recommendation}
              riskSignals={riskSignals} documents={documents}
              fmtMoney={fmtMoney}
              form={form} setForm={setForm}
              allExtracted={allExtracted} onSave={saveForm} saving={saving}
              onNavigate={setTab}
            />
          )}

          {tab === "Documents" && (
            <>
              <DataSourcePuller
                market={app?.market || "GB"}
                onPullCredit={pullCreditReport}
                onPullBank={pullBankStatement}
                pulling={pulling}
              />
              <DocumentsSection
                documents={documents} policyId={app?.policy_id || "consumer-v1"}
                onUpload={uploadDocument} uploading={uploading}
                onReprocess={reprocessDoc} onDelete={deleteDoc}
                onView={(doc) => window.open(doc.file_url, "_blank")}
                processingDocId={processingDocId}
                market={app?.market} borrowerType={app?.borrower_type}
              />
            </>
          )}

          {tab === "Financial Profile" && (
            <FinancialProfileTab fp={fp} cp={cp} evidence={evidence} riskSignals={riskSignals} fmtMoney={fmtMoney} onViewEvidence={onViewEvidence} />
          )}

          {tab === "Affordability" && (
            <AffordabilityTab fp={fp} app={app} fmtMoney={fmtMoney} />
          )}

          {tab === "Reconciliation" && (
            <ReconciliationPanel documents={documents} borrower={borrower} fp={fp} fmtMoney={fmtMoney} onViewEvidence={onViewEvidence} />
          )}

          {tab === "Risk" && (
            <RiskSignalsTab signals={riskSignals} evidence={evidence} onViewEvidence={onViewEvidence} />
          )}

          {tab === "AI Underwriter" && (
            <AnalysisSection
              recommendation={recommendation}
              running={analyzing}
              lastUpdated={recommendation?.generated_at ? timeAgo(new Date(recommendation.generated_at)) : null}
              onRerun={() => runPipeline()}
              borrower={borrower} app={app} fp={fp} cp={cp}
              evidence={evidence} fmtMoney={fmtMoney}
            />
          )}

          {tab === "Policy" && (
            <PolicySection decision={decision} policyInfo={{ name: getPolicyLabel(app?.policy_id, app?.market) }} />
          )}

          {tab === "Decision" && (
            <DecisionSection
              decision={decision} recommendation={recommendation}
              evidence={evidence} onOverride={overrideDecision} overriding={overriding}
              dimensions={dimensions}
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
      <ChatAssistant applicationId={applicationId} />
    </div>
  );
}

function timeAgo(date) {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return `${seconds} seconds ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
  return `${Math.floor(seconds / 86400)} days ago`;
}