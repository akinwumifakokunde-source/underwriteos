import React from "react";
import { getJurisdiction, getPolicyLabel } from "@/lib/jurisdictions";

const STAGES = ["COLLECT", "VERIFY", "ASSESS", "DECIDE"];

function getStageIndex(app, documents, decision) {
  if (decision?.decision && decision.decision !== "null") return 3;
  if (app?.status === "underwriting" || app?.status === "analyzing") return 2;
  if (documents?.length > 0) return 1;
  return 0;
}

const STATUS_STYLES = {
  draft: "bg-slate-50 text-slate-600 border-slate-200",
  data_collection: "bg-sky-50 text-sky-700 border-sky-200",
  analyzing: "bg-indigo-50 text-indigo-700 border-indigo-200",
  underwriting: "bg-violet-50 text-violet-700 border-violet-200",
  completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  failed: "bg-rose-50 text-rose-700 border-rose-200",
};

const STATUS_LABELS = {
  draft: "Needs information",
  data_collection: "Collecting data",
  analyzing: "Analyzing",
  underwriting: "Under review",
  completed: "Completed",
  failed: "Failed",
};

export default function ApplicationHeader({ app, borrower, documents, decision, fmtMoney, onRequestInfo, onReassess }) {
  const jur = getJurisdiction(app?.market);
  const stageIndex = getStageIndex(app, documents, decision);
  const currency = app?.loan_currency || jur.currency;

  const infoItems = [
    { label: "Borrower", value: borrower ? `${borrower.first_name} ${borrower.last_name}` : "—" },
    { label: "Market", value: jur.name },
    { label: "Product", value: (app?.product_type || "personal_loan").replace(/_/g, " ") },
    { label: "Requested", value: fmtMoney(app?.loan_amount, currency) },
    { label: "Term", value: app?.loan_term_months ? `${app.loan_term_months} months` : "—" },
    { label: "Policy", value: getPolicyLabel(app?.policy_id, app?.market) },
  ];

  return (
    <div className="mb-5">
      <div className="flex items-center gap-2 mb-1 flex-wrap">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{app?.application_number || "—"}</h1>
        <span className={`text-[10px] font-medium border rounded px-2 py-0.5 ${STATUS_STYLES[app?.status] || STATUS_STYLES.draft}`}>
          {STATUS_LABELS[app?.status] || app?.status}
        </span>
        <div className="ml-auto flex items-center gap-2">
          <button onClick={onRequestInfo} className="text-[12px] font-medium text-slate-700 bg-white border border-slate-200 rounded-lg px-2.5 py-1 hover:bg-slate-50 transition-colors">
            Request information
          </button>
          <button onClick={onReassess} className="text-[12px] font-medium text-slate-700 bg-white border border-slate-200 rounded-lg px-2.5 py-1 hover:bg-slate-50 transition-colors">
            Reassess
          </button>
        </div>
      </div>

      <div className="flex items-center gap-x-4 gap-y-1 flex-wrap text-[13px] mb-4">
        {infoItems.map((item, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <span className="text-slate-400">{item.label}:</span>
            <span className="font-medium text-slate-700 capitalize">{item.value}</span>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-1">
        {STAGES.map((stage, i) => (
          <React.Fragment key={stage}>
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium ${i === stageIndex ? "bg-slate-900 text-white" : i < stageIndex ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-slate-50 text-slate-400 border border-slate-200"}`}>
              {i < stageIndex && <span>✓</span>}
              {stage}
            </div>
            {i < STAGES.length - 1 && <div className={`w-3 h-px ${i < stageIndex ? "bg-emerald-300" : "bg-slate-200"}`} />}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}