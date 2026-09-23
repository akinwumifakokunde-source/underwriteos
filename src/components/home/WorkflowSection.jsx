import React from "react";
import { ArrowRight, UserCheck, TrendingUp, ShieldAlert, Gavel, Activity, CheckCircle2 } from "lucide-react";

const STEPS = [
  { icon: UserCheck, label: "Intake & KYC", desc: "White-label forms collect KYC, verify identity & documents", grad: "from-teal-400 to-emerald-500" },
  { icon: TrendingUp, label: "Income insights", desc: "Bank statements → cashflow, income & affordability in minutes", grad: "from-sky-400 to-indigo-500" },
  { icon: ShieldAlert, label: "Risk & fraud", desc: "5 dimensions · credit · affordability · fraud · loan-stacking", grad: "from-violet-400 to-purple-500" },
  { icon: Gavel, label: "Policy & decision", desc: "Your versioned rules → APPROVE / REVIEW / DECLINE, explained", grad: "from-amber-400 to-orange-500" },
  { icon: Activity, label: "Collections & calibration", desc: "Track outcomes, close the loop, keep models honest", grad: "from-rose-400 to-pink-500" },
];

export default function WorkflowSection() {
  return (
    <section className="border-b border-[#eceef1] dark:border-slate-800 bg-gradient-to-b from-[#fafbfc] to-white dark:from-slate-950 dark:to-slate-950">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-14 sm:py-20">
        <div className="text-center mb-12">
          <p className="text-xs font-mono uppercase tracking-wider text-[#0d9488] mb-3">The credit supply chain</p>
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#0a0c12] dark:text-slate-50">
            From intake to collections — one continuous credit lifecycle
          </h2>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch gap-3 sm:gap-2">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            return (
              <React.Fragment key={s.label}>
                <div className="group flex-1 rounded-2xl border border-[#eceef1] dark:border-slate-800 bg-white dark:bg-slate-900 p-5 text-center shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_18px_40px_-16px_rgba(13,148,136,0.25)] hover:border-[#0d9488]/30">
                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${s.grad} flex items-center justify-center mx-auto mb-3 shadow-sm transition-transform duration-300 group-hover:scale-110`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-[10px] font-mono uppercase tracking-wider text-[#8a909c] dark:text-slate-500 mb-1">Step {i + 1}</div>
                  <div className="text-sm font-semibold text-[#0a0c12] dark:text-slate-50 mb-1">{s.label}</div>
                  <div className="text-[11px] text-[#8a909c] dark:text-slate-400 leading-snug">{s.desc}</div>
                </div>
                {i < STEPS.length - 1 && (
                  <div className="hidden sm:flex items-center justify-center text-[#0d9488] shrink-0">
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>

        <div className="mt-10 flex items-center justify-center gap-2 text-sm text-[#525965] dark:text-slate-300">
          <CheckCircle2 className="w-4 h-4 text-[#0d9488]" />
          Every step is auditable, traceable to source — and the loop closes back on itself
        </div>
      </div>
    </section>
  );
}