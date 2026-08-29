import React from "react";
import { Link } from "react-router-dom";
import { Check, Minus, X, ArrowRight } from "lucide-react";

const FEATURES = [
  { label: "No-code policy builder", us: true, legacy: false, point: false },
  { label: "AI-assisted risk analysis", us: true, legacy: "partial", point: "partial" },
  { label: "Full evidence lineage (every signal → source)", us: true, legacy: false, point: false },
  { label: "Automated adverse-action & reason codes", us: true, legacy: "partial", point: false },
  { label: "Closed-loop outcome calibration", us: true, legacy: false, point: false },
  { label: "Batch / portfolio underwriting (CSV)", us: true, legacy: false, point: false },
  { label: "Multi-jurisdiction (UK, US, NG, ZA, KE, GH)", us: true, legacy: false, point: "partial" },
  { label: "White-label borrower application forms", us: true, legacy: false, point: "partial" },
  { label: "REST API + webhooks from day one", us: true, legacy: true, point: "partial" },
  { label: "Setup in hours, not quarters", us: true, legacy: false, point: false },
];

function Cell({ value }) {
  if (value === true) return <Check className="w-4 h-4 text-teal-600 mx-auto" />;
  if (value === "partial") return <Minus className="w-4 h-4 text-slate-400 mx-auto" />;
  return <X className="w-4 h-4 text-slate-300 mx-auto" />;
}

export default function CompetitiveComparison() {
  return (
    <section className="bg-white">
      <div className="max-w-5xl mx-auto px-5 sm:px-8 py-16 sm:py-20">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-teal-600 mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-500" /> Why GoUnderwriteOS
          </div>
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#0a0c12]">
            One operating system, not a stack of point tools
          </h2>
          <p className="mt-3 text-[15px] text-[#525965] max-w-2xl mx-auto leading-relaxed">
            Legacy decision engines take quarters to deploy and explain nothing. Point tools each solve one
            step and leave you to stitch them together. GoUnderwriteOS covers the whole pipeline — no code,
            with evidence — and gets you live in hours.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left font-medium text-slate-500 py-4 px-5 w-[44%]">Capability</th>
                  <th className="py-4 px-3 bg-teal-50/60">
                    <div className="flex flex-col items-center">
                      <span className="text-[13px] font-semibold text-teal-700">GoUnderwriteOS</span>
                      <span className="text-[10px] text-teal-500 font-mono mt-0.5">This platform</span>
                    </div>
                  </th>
                  <th className="py-4 px-3">
                    <div className="flex flex-col items-center">
                      <span className="text-[13px] font-semibold text-slate-700">Legacy engines</span>
                      <span className="text-[10px] text-slate-400 mt-0.5">e.g. FICO, Experian</span>
                    </div>
                  </th>
                  <th className="py-4 px-3">
                    <div className="flex flex-col items-center">
                      <span className="text-[13px] font-semibold text-slate-700">Point tools</span>
                      <span className="text-[10px] text-slate-400 mt-0.5">Bureau + OCR + BI</span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {FEATURES.map((f, i) => (
                  <tr key={f.label} className={i % 2 ? "bg-slate-50/50" : ""}>
                    <td className="py-3 px-5 text-slate-700">{f.label}</td>
                    <td className="py-3 px-3 bg-teal-50/40 text-center"><Cell value={f.us} /></td>
                    <td className="py-3 px-3 text-center"><Cell value={f.legacy} /></td>
                    <td className="py-3 px-3 text-center"><Cell value={f.point} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link to="/pricing" className="inline-flex items-center gap-1.5 rounded-lg bg-[#0a0c12] text-white text-sm font-medium px-5 py-2.5 hover:bg-[#1c1f26]">
            See pricing <ArrowRight className="w-4 h-4" />
          </Link>
          <Link to="/architecture" className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 text-slate-700 text-sm font-medium px-5 py-2.5 hover:bg-slate-50">
            Explore the architecture
          </Link>
        </div>
      </div>
    </section>
  );
}