import React from "react";
import { Upload, FileText, Sparkles, ArrowRight, Globe, Layers } from "lucide-react";
import { JURISDICTIONS, getJurisdiction } from "@/lib/jurisdictions";

export default function EntryChoice({ onChoose, market, onMarketChange }) {
  const jur = getJurisdiction(market || "GB");

  return (
    <div className="max-w-3xl mx-auto px-5 sm:px-8 py-10 sm:py-12">
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-teal-600 mb-3">
          <span className="w-1.5 h-1.5 rounded-full bg-teal-500" /> New application
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Start with the borrower file</h1>
        <p className="mt-2 text-sm text-slate-500 max-w-lg mx-auto">
          Upload financial documents and CreditDecide will extract the information, build the credit profile and identify what needs your attention.
        </p>
      </div>

      {/* Market selector */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 mb-4">
        <div className="flex flex-col gap-1 mb-3 sm:flex-row sm:items-center sm:gap-2">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-[#0d9488]" />
            <h3 className="text-sm font-semibold text-slate-900">Select market</h3>
          </div>
          <span className="text-[11px] text-slate-400 sm:ml-auto">Determines currency, policy, and document requirements</span>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {Object.values(JURISDICTIONS).filter((j) => j.code !== "OT").map((j) => (
            <button
              type="button"
              key={j.code}
              onClick={() => onMarketChange?.(j.code)}
              className={`cursor-pointer rounded-lg border px-2 py-2 text-center transition-all ${market === j.code ? "border-teal-400 bg-teal-50 ring-2 ring-teal-200" : "border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300"}`}
            >
              <div className={`text-[12px] font-semibold ${market === j.code ? "text-teal-700" : "text-slate-700"}`}>{j.name}</div>
              <div className="text-[10px] text-slate-400 font-mono">{j.currency}</div>
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => onMarketChange?.("OT")}
          className={`mt-2 w-full cursor-pointer rounded-lg border px-3 py-2 text-left transition-all flex items-center gap-2 ${market === "OT" ? "border-teal-400 bg-teal-50 ring-2 ring-teal-200" : "border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300"}`}
        >
          <Globe className="w-4 h-4 text-slate-400" />
          <div className="flex-1">
            <div className={`text-[12px] font-semibold ${market === "OT" ? "text-teal-700" : "text-slate-700"}`}>Others</div>
            <div className="text-[10px] text-slate-400">Outside the listed markets</div>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">USD</span>
        </button>
        <div className="mt-3 flex flex-col gap-1 text-[12px] text-slate-500 sm:flex-row sm:items-center sm:gap-3">
          <span>Regulatory profile: <span className="font-medium text-slate-700">{jur.regulatoryProfile}</span></span>
          <span className="hidden sm:inline">·</span>
          <span>Default policy: <span className="font-medium text-slate-700">{jur.policies[0]?.label}</span></span>
        </div>
      </div>

      <div className="space-y-3">
        <button
          onClick={() => onChoose("upload")}
          className="group w-full text-left rounded-xl border-2 border-teal-400 bg-teal-50/40 p-4 sm:p-5 transition-all hover:shadow-sm flex flex-wrap items-center gap-3 sm:gap-4"
        >
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-lg bg-teal-600 text-white flex items-center justify-center shrink-0">
            <Upload className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-slate-900">Start with documents</h3>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-teal-700 bg-teal-100 rounded px-1.5 py-0.5">Recommended</span>
            </div>
            <p className="text-[13px] text-slate-500 mt-0.5">Upload borrower documents and let CreditDecide build the underwriting case — we extract the data, build the credit profile and flag what needs your attention.</p>
          </div>
          <div className="inline-flex items-center gap-1 text-[12px] font-medium text-teal-700 group-hover:gap-2 transition-all shrink-0 w-full sm:w-auto justify-end">
            Get started <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </button>

        <button
          onClick={() => onChoose("manual")}
          className="group w-full text-left rounded-xl border border-slate-200 bg-white p-4 sm:p-5 transition-all hover:border-slate-300 hover:shadow-sm flex items-center gap-3 sm:gap-4"
        >
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-slate-900">Enter manually</h3>
            <p className="text-[13px] text-slate-500 mt-0.5">Fill in borrower and loan details yourself. Upload documents later to supplement.</p>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 shrink-0" />
        </button>

        <button
          onClick={() => onChoose("sample")}
          className="group w-full text-left rounded-xl border-2 border-violet-400 bg-gradient-to-br from-violet-50/60 to-white p-4 sm:p-5 transition-all hover:shadow-md hover:border-violet-500 flex flex-wrap items-center gap-3 sm:gap-4"
        >
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white flex items-center justify-center shrink-0 shadow-sm">
            <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-bold text-slate-900">Use sample application</h3>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-violet-700 bg-violet-100 rounded px-1.5 py-0.5">Live demo</span>
              <span className="text-[10px] font-medium uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 rounded px-1.5 py-0.5">No setup needed</span>
            </div>
            <p className="text-[13px] text-slate-600 mt-1 leading-relaxed">
              New here? Try a fully pre-filled borrower with synthetic credit and banking data — watch CreditDecide run the complete underwriting pipeline end-to-end: analysis, risk signals, policy evaluation and a final decision in seconds.
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500">
              <span className="inline-flex items-center gap-1"><span className="w-1 h-1 rounded-full bg-violet-400" /> Synthetic credit report</span>
              <span className="inline-flex items-center gap-1"><span className="w-1 h-1 rounded-full bg-violet-400" /> Bank statements</span>
              <span className="inline-flex items-center gap-1"><span className="w-1 h-1 rounded-full bg-violet-400" /> AI recommendation</span>
            </div>
          </div>
          <div className="inline-flex items-center gap-1 text-[12px] font-semibold text-violet-700 group-hover:gap-2 transition-all shrink-0 w-full sm:w-auto justify-end">
            Try it now <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </button>

        <button
          onClick={() => onChoose("batch")}
          className="group w-full text-left rounded-xl border border-slate-200 bg-white p-4 sm:p-5 transition-all hover:border-slate-300 hover:shadow-sm flex items-center gap-3 sm:gap-4"
        >
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
            <Layers className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-slate-900">Batch underwriting</h3>
            <p className="text-[13px] text-slate-500 mt-0.5">Upload a CSV of applicants and underwrite a whole portfolio in one run — decisions, risk scores and evidence for every row.</p>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 shrink-0" />
        </button>
      </div>
    </div>
  );
}