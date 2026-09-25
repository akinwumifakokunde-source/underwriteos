import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Briefcase, User, ShieldCheck, Sparkles } from "lucide-react";
import SectionBackdrop from "@/components/home/SectionBackdrop";

export default function StartAsSection() {
  return (
    <section className="relative overflow-hidden border-b border-[#eceef1] dark:border-slate-800 bg-white dark:bg-slate-950">
      <SectionBackdrop />
      <div className="relative max-w-5xl mx-auto px-5 sm:px-8 py-16 sm:py-20">
        <div className="text-center mb-10">
          <p className="text-xs font-mono uppercase tracking-wider mb-3">
            <span className="bg-gradient-to-r from-teal-500 to-emerald-500 dark:from-teal-300 dark:to-emerald-400 bg-clip-text text-transparent">
              Try it end to end
            </span>
          </p>
          <h2 className="text-2xl sm:text-4xl font-semibold tracking-tight text-[#0a0c12] dark:text-slate-50">
            See both sides of{" "}
            <span className="bg-gradient-to-r from-teal-500 via-emerald-500 to-teal-600 dark:from-teal-300 dark:via-emerald-400 dark:to-teal-300 bg-clip-text text-transparent">
              consumer lending
            </span>
          </h2>
          <p className="mt-3 text-[15px] text-[#525965] dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Walk through a borrower application, then review it as the lender — from intake to an explainable decision.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 max-w-3xl mx-auto">
          {/* Start as the borrower */}
          <Link
            to="/start/borrower"
            className="group relative rounded-2xl border border-[#eceef1] dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_-16px_rgba(13,148,136,0.25)] hover:border-[#0d9488]/30"
          >
            <span className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-teal-400 to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center shadow-sm transition-transform duration-300 group-hover:scale-110">
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-[11px] font-mono uppercase tracking-wider text-[#8a909c] dark:text-slate-500">Borrower</div>
                <div className="text-base font-semibold text-[#0a0c12] dark:text-slate-50">Start as the borrower</div>
              </div>
            </div>
            <p className="text-[13px] text-[#525965] dark:text-slate-300 leading-relaxed mb-4">
              A guided application that collects your details and documents, with a sample to load. Six steps, four minutes.
            </p>
            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-[#0d9488] dark:text-teal-400">
              Begin application <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </span>
            <div className="mt-4 flex items-center gap-1.5 text-[11px] text-[#8a909c] dark:text-slate-500">
              <Sparkles className="w-3 h-3" /> No sign-up · sample data included
            </div>
          </Link>

          {/* Start as the lender */}
          <Link
            to="/applications"
            className="group relative rounded-2xl border border-[#eceef1] dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_-16px_rgba(99,102,241,0.25)] hover:border-indigo-400/40"
          >
            <span className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-indigo-400 to-sky-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-400 to-sky-500 flex items-center justify-center shadow-sm transition-transform duration-300 group-hover:scale-110">
                <Briefcase className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-[11px] font-mono uppercase tracking-wider text-[#8a909c] dark:text-slate-500">Lender</div>
                <div className="text-base font-semibold text-[#0a0c12] dark:text-slate-50">Start as the lender</div>
              </div>
            </div>
            <p className="text-[13px] text-[#525965] dark:text-slate-300 leading-relaxed mb-4">
              Open the underwriter workspace — review applications, read the cited credit memo, and make the call.
            </p>
            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 dark:text-indigo-400">
              Open workspace <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </span>
            <div className="mt-4 flex items-center gap-1.5 text-[11px] text-[#8a909c] dark:text-slate-500">
              <ShieldCheck className="w-3 h-3" /> Sign in required · audit-tracked
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}