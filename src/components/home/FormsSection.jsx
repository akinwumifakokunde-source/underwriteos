import React from "react";
import { Link } from "react-router-dom";
import { FileText, Share2, UserCheck, FolderInput, ArrowRight, Plus, Zap, ShieldCheck, ClipboardList } from "lucide-react";

const FLOW = [
  { icon: Share2, title: "Share the link", desc: "Publish a white-label form at /apply/:slug and send it to the borrower — no login required." },
  { icon: UserCheck, title: "Borrower submits", desc: "Borrower fills in loan details plus market-specific KYC (NI, SSN, BVN+NIN, etc.). IDs are validated and hashed." },
  { icon: FolderInput, title: "Application created", desc: "A borrower record and an application in data collection status are created automatically — ready to underwrite." },
];

const BENEFITS = [
  { icon: Zap, title: "No manual entry", desc: "Borrowers self-serve; submissions flow straight into your pipeline, eliminating re-keying and data-entry errors." },
  { icon: ClipboardList, title: "Standardised data", desc: "Every submission maps to the same canonical borrower + application model across all markets." },
  { icon: ShieldCheck, title: "KYC built in", desc: "Market-specific identity verification is required on every form, so credit pulls start from verified identity." },
];

export default function FormsSection() {
  return (
    <section className="max-w-3xl mx-auto px-5 sm:px-8 pt-8 pb-10 border-t border-slate-200">
      <div className="flex flex-col gap-3 mb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-teal-600 mb-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-500" /> Collect applications
          </div>
          <h2 className="text-2xl font-semibold tracking-tight">Forms</h2>
          <p className="text-sm text-slate-500 mt-1">White-label borrower application forms. Share a link, collect standardised data, and start underwriting automatically.</p>
        </div>
        <Link to="/forms/new" className="inline-flex items-center gap-1.5 text-sm font-medium text-white bg-[#0a0c12] px-4 py-2.5 rounded-lg hover:bg-[#1c1f26] self-start sm:self-auto">
          <Plus className="w-4 h-4" /> New form
        </Link>
      </div>

      {/* Functions */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 mb-4">
        <div className="flex items-center gap-2 mb-2">
          <FileText className="w-4 h-4 text-teal-600" />
          <h3 className="text-sm font-semibold text-slate-900">What forms do</h3>
        </div>
        <p className="text-sm text-slate-600 leading-relaxed">
          A form is a configurable, brandable intake page tied to a market, borrower type, and policy. It collects the
          borrower's personal and loan details, enforces market-specific KYC identity verification, and on submission
          creates a fully-formed application in your workspace — no API calls or manual data entry required.
        </p>
      </div>

      {/* Flow */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 mb-4">
        <div className="flex items-center gap-2 mb-4">
          <Share2 className="w-4 h-4 text-teal-600" />
          <h3 className="text-sm font-semibold text-slate-900">How the flow works</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {FLOW.map((step, i) => (
            <div key={step.title} className="relative">
              <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center mb-2.5">
                <step.icon className="w-4 h-4 text-teal-600" />
              </div>
              <div className="text-[11px] font-medium uppercase tracking-wider text-slate-400 mb-0.5">Step {i + 1}</div>
              <h4 className="text-sm font-medium text-slate-900">{step.title}</h4>
              <p className="text-[12px] text-slate-500 leading-relaxed mt-1">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Benefits */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-2">
        {BENEFITS.map((b) => (
          <div key={b.title} className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center mb-2.5">
              <b.icon className="w-4 h-4 text-slate-600" />
            </div>
            <h4 className="text-sm font-medium text-slate-900">{b.title}</h4>
            <p className="text-[12px] text-slate-500 leading-relaxed mt-1">{b.desc}</p>
          </div>
        ))}
      </div>

      <Link to="/forms" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900">
        View all forms <ArrowRight className="w-3.5 h-3.5" />
      </Link>
    </section>
  );
}