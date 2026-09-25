import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, FileText, ShieldCheck, Check } from "lucide-react";

const FOREST = "#0B3D21";
const OFFWHITE = "#F9F9F8";

export default function BorrowerExperience({ onStart }) {
  return (
    <section className="bg-white dark:bg-slate-950 border-b border-[#eceef1] dark:border-slate-800">
      <div className="max-w-5xl mx-auto px-5 sm:px-8 py-16 sm:py-20">
        <div className="rounded-2xl p-6 sm:p-10" style={{ backgroundColor: OFFWHITE }}>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-black dark:text-slate-50">
                The borrower experience
              </h2>
              <p className="mt-3 text-sm text-[#6B7280] dark:text-slate-400 max-w-xl leading-relaxed">
                Guided intake that keeps applicants moving and gathers credit context while they apply. Automated
                follow-ups pull more information and keep borrowers informed — so fewer drop off.
              </p>
            </div>
            {onStart ? (
              <button
                onClick={onStart}
                className="group inline-flex items-center gap-2 text-sm font-medium px-5 py-2.5 rounded-full border border-[#0B3D21]/30 bg-white hover:shadow-md transition-all self-start sm:self-auto"
                style={{ color: FOREST }}
              >
                Start as the borrower
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
            ) : (
              <Link
                to="/start/borrower"
                className="group inline-flex items-center gap-2 text-sm font-medium px-5 py-2.5 rounded-full border border-[#0B3D21]/30 bg-white hover:shadow-md transition-all self-start sm:self-auto"
                style={{ color: FOREST }}
              >
                Start as the borrower
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            )}
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {/* AI-assisted application */}
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: FOREST }}>
                  <FileText className="w-4.5 h-4.5 text-white" />
                </div>
                <h3 className="text-sm font-semibold text-black dark:text-slate-50">AI-assisted application</h3>
              </div>
              <p className="text-[13px] text-[#6B7280] dark:text-slate-400 leading-relaxed mb-4">
                Walks applicants through step by step, asking follow-ups in their own words.
              </p>
              <div className="rounded-lg border border-slate-200 bg-white p-4 flex gap-4">
                {/* Stepper circles */}
                <div className="flex flex-col items-center gap-2">
                  {[0, 1, 2, 3].map((i) => (
                    <div key={i} className="flex flex-col items-center">
                      <span className={`w-3 h-3 rounded-full ${i < 3 ? "bg-[#0B3D21]" : "border-2 border-slate-300 bg-white"}`} />
                      {i < 3 && <span className="w-px h-4 bg-slate-200" />}
                    </div>
                  ))}
                </div>
                {/* Progress + fields */}
                <div className="flex-1 space-y-3 pt-0.5">
                  <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: "60%", backgroundColor: FOREST }} />
                  </div>
                  <div className="space-y-2">
                    <div className="h-2.5 rounded bg-slate-100 w-full" />
                    <div className="h-2.5 rounded bg-slate-100 w-3/4" />
                    <div className="h-6 rounded border border-slate-200 bg-slate-50 w-2/3" />
                  </div>
                </div>
              </div>
            </div>

            {/* Borrower portal */}
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: FOREST }}>
                  <ShieldCheck className="w-4.5 h-4.5 text-white" />
                </div>
                <h3 className="text-sm font-semibold text-black dark:text-slate-50">Borrower portal</h3>
              </div>
              <p className="text-[13px] text-[#6B7280] dark:text-slate-400 leading-relaxed mb-4">
                Shows what's still outstanding and keeps nudging. Applicants know where they stand.
              </p>
              <div className="rounded-lg border border-slate-200 bg-white p-4 space-y-3">
                {[
                  { done: true },
                  { done: true },
                  { done: false },
                ].map((r, i) => (
                  <div key={i} className="flex items-center gap-3">
                    {r.done ? (
                      <span className="w-4 h-4 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: FOREST }}>
                        <Check className="w-2.5 h-2.5 text-white" />
                      </span>
                    ) : (
                      <span className="w-4 h-4 rounded-full border-2 border-slate-300 shrink-0" />
                    )}
                    <div className="flex-1 space-y-1.5">
                      <div className="h-2 rounded bg-slate-100 w-3/4" />
                      <div className="h-2 rounded bg-slate-100 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}