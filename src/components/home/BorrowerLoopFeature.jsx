import React from "react";
import { Mail, UploadCloud, RefreshCw, Bell, ShieldCheck, CheckCircle2, ArrowDown } from "lucide-react";
import SectionBackdrop from "@/components/home/SectionBackdrop";

const STEPS = [
  { icon: Mail, label: "Lender requests info", sub: "One click — borrower gets an email", grad: "from-amber-400 to-orange-500" },
  { icon: UploadCloud, label: "Borrower uploads via portal", sub: "Branded, secure status page", grad: "from-teal-400 to-emerald-500" },
  { icon: RefreshCw, label: "Auto-extract & re-evaluate", sub: "Decision updates instantly", grad: "from-sky-400 to-indigo-500" },
  { icon: Bell, label: "Lender notified in-app", sub: "Live response badge", grad: "from-violet-400 to-purple-500" },
];

export default function BorrowerLoopFeature() {
  return (
    <section className="relative overflow-hidden border-b border-[#eceef1] dark:border-slate-800 bg-[#f8fafc] dark:bg-slate-950">
      <SectionBackdrop />
      <div className="relative max-w-5xl mx-auto px-5 sm:px-8 py-14 sm:py-20">
        <div className="grid md:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Copy */}
          <div>
            <p className="text-xs font-mono uppercase tracking-wider mb-3">
              <span className="bg-gradient-to-r from-teal-500 to-emerald-500 dark:from-teal-300 dark:to-emerald-400 bg-clip-text text-transparent">
                Borrower collaboration
              </span>
            </p>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#0a0c12] dark:text-slate-50 mb-4">
              Close the information loop —{" "}
              <span className="bg-gradient-to-r from-teal-500 via-emerald-500 to-teal-600 dark:from-teal-300 dark:via-emerald-400 dark:to-teal-300 bg-clip-text text-transparent">
                automatically
              </span>
            </h2>
            <p className="text-[#525965] dark:text-slate-300 leading-relaxed mb-6">
              When you need more, the borrower gets an email and uploads through a branded secure portal.
              CreditDecide extracts the data, re-runs the decision, and pings your team in-app — so nothing
              stalls, nothing gets re-keyed, and nothing slips through.
            </p>
            <ul className="space-y-2.5 text-sm text-[#525965] dark:text-slate-300">
              {[
                "One-click information requests → borrower email",
                "Secure borrower portal with live status tracking",
                "Auto-extract & re-evaluate on every upload",
                "In-app notifications with a live response count",
                "Private document storage with signed access",
              ].map((p) => (
                <li key={p} className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-teal-400 to-emerald-500 mt-2 shrink-0" />
                  {p}
                </li>
              ))}
            </ul>
          </div>

          {/* Loop demo */}
          <div className="group relative rounded-2xl border border-[#e8eaee] dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur overflow-hidden shadow-[0_1px_2px_rgba(10,12,18,0.04),0_12px_40px_-12px_rgba(10,12,18,0.12)] transition-all duration-500 hover:shadow-[0_24px_70px_-24px_rgba(13,148,136,0.3)] hover:-translate-y-1">
            <span className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-amber-400 via-teal-400 to-violet-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="px-4 py-3 border-b border-[#eceef1] dark:border-slate-800 bg-gradient-to-b from-[#fafbfc] to-white dark:from-slate-900 dark:to-slate-900 flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-[#e0e2e6] dark:bg-slate-700" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#e0e2e6] dark:bg-slate-700" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#e0e2e6] dark:bg-slate-700" />
              </div>
              <span className="text-[11px] font-mono text-[#8a909c] dark:text-slate-500 ml-2">The response loop</span>
            </div>

            <div className="p-5 space-y-2.5">
              {STEPS.map((s, i) => {
                const Icon = s.icon;
                return (
                  <React.Fragment key={s.label}>
                    <div className="flex items-center gap-3 rounded-xl border border-[#eceef1] dark:border-slate-800 bg-[#fafbfc] dark:bg-slate-800/60 px-3.5 py-3 transition-all hover:border-[#0d9488]/30 hover:-translate-y-0.5">
                      <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${s.grad} flex items-center justify-center shrink-0 shadow-sm`}>
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[13px] font-semibold text-[#0a0c12] dark:text-slate-50">{s.label}</div>
                        <div className="text-[11px] text-[#8a909c] dark:text-slate-400">{s.sub}</div>
                      </div>
                      {i === STEPS.length - 1 && (
                        <span className="shrink-0 inline-flex items-center justify-center min-w-[20px] h-5 px-1 rounded-full bg-teal-500 text-white text-[10px] font-semibold ring-2 ring-white dark:ring-slate-800">1</span>
                      )}
                    </div>
                    {i < STEPS.length - 1 && (
                      <div className="flex justify-center"><ArrowDown className="w-3.5 h-3.5 text-[#0d9488]/50" /></div>
                    )}
                  </React.Fragment>
                );
              })}

              <div className="mt-2 rounded-xl border border-teal-200 dark:border-teal-500/30 bg-gradient-to-b from-[#e6f7f3] to-[#d9f2ec] dark:from-teal-500/10 dark:to-teal-500/5 px-3.5 py-2.5 flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-teal-600 dark:text-teal-300 shrink-0" />
                <p className="text-[11px] font-medium text-teal-900 dark:text-teal-200">"Received — we've re-evaluated your application and notified your lender."</p>
              </div>

              <div className="mt-1 flex items-center justify-center gap-1.5 text-[10px] text-[#8a909c] dark:text-slate-500">
                <ShieldCheck className="w-3 h-3" /> Documents stored privately — signed access only
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}