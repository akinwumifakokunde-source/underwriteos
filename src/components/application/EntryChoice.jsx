import React from "react";
import { Upload, FileText, Sparkles, ArrowRight, Globe } from "lucide-react";
import { JURISDICTIONS, getJurisdiction } from "@/lib/jurisdictions";

export default function EntryChoice({ onChoose, market, onMarketChange }) {
  const jur = getJurisdiction(market || "GB");

  return (
    <div className="max-w-2xl mx-auto px-5 sm:px-8 py-12">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Start with the borrower file</h1>
        <p className="mt-2 text-sm text-slate-500 max-w-lg mx-auto">
          Upload financial documents and UnderwriteOS will extract the information, build the credit profile and identify what needs your attention.
        </p>
      </div>

      {/* Market selector */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <Globe className="w-4 h-4 text-[#0d9488]" />
          <h3 className="text-sm font-semibold text-slate-900">Select market</h3>
          <span className="text-[11px] text-slate-400 ml-auto">Determines currency, policy, and document requirements</span>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {Object.values(JURISDICTIONS).map((j) => (
            <button
              key={j.code}
              onClick={() => onMarketChange?.(j.code)}
              className={`rounded-lg border px-2 py-2 text-center transition-all ${market === j.code ? "border-teal-400 bg-teal-50" : "border-slate-200 bg-white hover:bg-slate-50"}`}
            >
              <div className={`text-[12px] font-semibold ${market === j.code ? "text-teal-700" : "text-slate-700"}`}>{j.name}</div>
              <div className="text-[10px] text-slate-400 font-mono">{j.currency}</div>
            </button>
          ))}
        </div>
        <div className="mt-3 flex items-center gap-3 text-[12px] text-slate-500">
          <span>Regulatory profile: <span className="font-medium text-slate-700">{jur.regulatoryProfile}</span></span>
          <span>·</span>
          <span>Default policy: <span className="font-medium text-slate-700">{jur.policies[0]?.label}</span></span>
        </div>
      </div>

      <div className="space-y-3">
        <button
          onClick={() => onChoose("upload")}
          className="group w-full text-left rounded-xl border-2 border-teal-400 bg-teal-50/40 p-5 transition-all hover:shadow-sm flex items-center gap-4"
        >
          <div className="w-12 h-12 rounded-lg bg-teal-600 text-white flex items-center justify-center shrink-0">
            <Upload className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-slate-900">Upload documents</h3>
            <p className="text-[13px] text-slate-500 mt-0.5">Drop in bank statements, payslips, or credit reports. UnderwriteOS extracts the data and builds the credit file automatically.</p>
          </div>
          <div className="inline-flex items-center gap-1 text-[12px] font-medium text-teal-700 group-hover:gap-2 transition-all shrink-0">
            Get started <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </button>

        <button
          onClick={() => onChoose("manual")}
          className="group w-full text-left rounded-xl border border-slate-200 bg-white p-5 transition-all hover:border-slate-300 hover:shadow-sm flex items-center gap-4"
        >
          <div className="w-12 h-12 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
            <FileText className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-slate-900">Enter manually</h3>
            <p className="text-[13px] text-slate-500 mt-0.5">Fill in borrower and loan details yourself. Upload documents later to supplement.</p>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 shrink-0" />
        </button>

        <button
          onClick={() => onChoose("sample")}
          className="group w-full text-left rounded-xl border border-slate-200 bg-white p-5 transition-all hover:border-slate-300 hover:shadow-sm flex items-center gap-4"
        >
          <div className="w-12 h-12 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-slate-900">Use sample application</h3>
            <p className="text-[13px] text-slate-500 mt-0.5">Pre-filled borrower with synthetic data. See the full underwriting pipeline in action.</p>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 shrink-0" />
        </button>
      </div>
    </div>
  );
}