import React from "react";
import { Link } from "react-router-dom";
import {
  FileText, UploadCloud, RefreshCw, Bell, LayoutDashboard, Repeat, ArrowRight,
} from "lucide-react";

// Admin-only explainer shown on the borrower portal preview. Helps lenders
// evaluating CreditDecide understand how the borrower-facing portal mirrors
// their workspace — same records, two views.
const STEPS = [
  { icon: FileText, title: "Intake", body: "Borrower applies via a white-label form or your demo. A Borrower + Application is created in data_collection, scoped to your org." },
  { icon: UploadCloud, title: "Borrower uploads", body: "From this portal the borrower uploads documents against any open information request — no login, just application number + email." },
  { icon: RefreshCw, title: "Auto re-underwrite", body: "Each upload runs through extraction → normalized profiles → evidence graph, then re-runs analyze + underwrite so the decision reflects new information." },
  { icon: Bell, title: "Lender notified", body: "Your team is emailed (alerts email, or your admin users as fallback) with a link straight to the application in the workspace." },
  { icon: LayoutDashboard, title: "Lender workspace", body: "The same application appears in your pipeline with the full file: risk signals, evidence graph, credit memo, policy outcome and final decision." },
  { icon: Repeat, title: "Handoff loop", body: "Create an InformationRequest from the workspace and it instantly becomes a to-do here. The assistant can also flag a handoff when a borrower question needs you." },
];

export default function PortalEndToEndExplainer() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4 mb-1">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">How this portal connects to your workspace</h2>
          <p className="text-[13px] text-slate-500 mt-0.5">One data model, two views. The borrower sees progress and next steps; you see the full underwriting file.</p>
        </div>
        <span className="shrink-0 text-[10px] font-medium uppercase tracking-wider text-teal-700 bg-teal-50 rounded-full px-2 py-1">Admin preview</span>
      </div>

      <ol className="mt-5 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {STEPS.map((s, i) => {
          const Icon = s.icon;
          return (
            <li key={i} className="rounded-xl border border-slate-100 bg-slate-50/60 p-3.5">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0">
                  <Icon className="w-3.5 h-3.5 text-teal-600" />
                </span>
                <span className="text-[10px] font-mono text-slate-400">{String(i + 1).padStart(2, "0")}</span>
                <p className="text-[13px] font-semibold text-slate-900">{s.title}</p>
              </div>
              <p className="text-[12px] text-slate-500 leading-relaxed">{s.body}</p>
            </li>
          );
        })}
      </ol>

      <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
        <p className="text-[12px] text-slate-500">The portal isn't a separate system — it shares the same Application, Document, InformationRequest and UnderwritingDecision records as your workspace.</p>
        <Link to="/applications" className="shrink-0 inline-flex items-center gap-1 text-[13px] font-medium text-teal-700 hover:text-teal-900">
          Open your workspace <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}