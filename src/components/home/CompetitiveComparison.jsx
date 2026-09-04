import React from "react";
import { Link } from "react-router-dom";
import { Check, Minus, X, ArrowRight } from "lucide-react";

// Competitors chosen as the most-evaluated alternatives across the markets we serve.
// Values reflect honest, publicly-documented capability — not a hit piece.
const COMPETITORS = [
  { key: "us", name: "CreditDecide", tag: "This platform", tone: "teal" },
  { key: "legacy", name: "FICO / Experian", tag: "Legacy decisioning", tone: "slate" },
  { key: "lms", name: "TurnKey Lender", tag: "Modern LMS + decisioning", tone: "slate" },
  { key: "loanpro", name: "LoanPro", tag: "US API-first LMS", tone: "slate" },
  { key: "mambu", name: "Mambu", tag: "Enterprise cloud lending", tone: "slate" },
  { key: "africa", name: "Lendsqr", tag: "Africa-focused LMS", tone: "slate" },
];

const MARKETS = [
  { code: "GB", label: "United Kingdom" },
  { code: "US", label: "United States" },
  { code: "NG", label: "Nigeria" },
  { code: "ZA", label: "South Africa" },
  { code: "KE", label: "Kenya" },
  { code: "GH", label: "Ghana" },
];

// market coverage: true = native, "partial" = limited/bureau-dependent, false = not supported
const COVERAGE = {
  us: { GB: true, US: true, NG: true, ZA: true, KE: true, GH: true },
  legacy: { GB: true, US: true, NG: "partial", ZA: "partial", KE: false, GH: false },
  lms: { GB: true, US: true, NG: true, ZA: true, KE: true, GH: true },
  loanpro: { GB: "partial", US: true, NG: "partial", ZA: "partial", KE: false, GH: false },
  mambu: { GB: true, US: true, NG: "partial", ZA: "partial", KE: "partial", GH: "partial" },
  africa: { GB: "partial", US: "partial", NG: true, ZA: true, KE: true, GH: true },
};

const FEATURES = [
  { label: "No-code policy builder", us: true, legacy: "partial", lms: "partial", loanpro: "partial", mambu: "partial", africa: "partial" },
  { label: "AI-assisted risk analysis (evidence-graph)", us: true, legacy: "partial", lms: "partial", loanpro: "partial", mambu: false, africa: false },
  { label: "Full evidence lineage (every signal → source)", us: true, legacy: false, lms: false, loanpro: false, mambu: false, africa: false },
  { label: "Automated adverse-action & reason codes", us: true, legacy: true, lms: "partial", loanpro: "partial", mambu: "partial", africa: false },
  { label: "Closed-loop outcome calibration", us: true, legacy: "partial", lms: "partial", loanpro: false, mambu: false, africa: false },
  { label: "Batch / portfolio underwriting (CSV)", us: true, legacy: true, lms: true, loanpro: true, mambu: true, africa: false },
  { label: "Multi-jurisdiction policies (6+ markets)", us: true, legacy: "partial", lms: true, loanpro: "partial", mambu: true, africa: "partial" },
  { label: "White-label borrower application forms", us: true, legacy: false, lms: true, loanpro: true, mambu: "partial", africa: true },
  { label: "REST API + webhooks from day one", us: true, legacy: true, lms: true, loanpro: true, mambu: true, africa: true },
  { label: "Setup in hours, not quarters", us: true, legacy: false, lms: "partial", loanpro: "partial", mambu: false, africa: true },
];

function Cell({ value }) {
  if (value === true) return <Check className="w-4 h-4 text-teal-600 mx-auto" />;
  if (value === "partial") return <Minus className="w-4 h-4 text-slate-400 mx-auto" />;
  return <X className="w-4 h-4 text-slate-300 mx-auto" />;
}

function toneClasses(tone) {
  return tone === "teal"
    ? "bg-teal-50/60 text-teal-700"
    : "bg-slate-50 text-slate-700";
}

export default function CompetitiveComparison() {
  return (
    <section className="bg-white">
      <div className="max-w-5xl mx-auto px-5 sm:px-8 py-16 sm:py-20">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-teal-600 mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-500" /> Why CreditDecide
          </div>
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#0a0c12]">
            The AI underwriting layer for lenders everywhere
          </h2>
          <p className="mt-3 text-[15px] text-[#525965] max-w-2xl mx-auto leading-relaxed">
            Legacy decision engines explain nothing. Loan management systems cover breadth but under-invest in
            decision quality. CreditDecide is the evidence-native underwriting brain — no code, fully auditable,
            live in hours — across the UK, US, Nigeria, South Africa, Kenya, Ghana and beyond.
          </p>
        </div>

        {/* Market coverage map */}
        <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-5 mb-8">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <h3 className="text-sm font-semibold text-slate-800">Market coverage</h3>
            <div className="flex items-center gap-4 text-[11px] text-slate-500">
              <span className="inline-flex items-center gap-1"><Check className="w-3.5 h-3.5 text-teal-600" /> Native</span>
              <span className="inline-flex items-center gap-1"><Minus className="w-3.5 h-3.5 text-slate-400" /> Limited</span>
              <span className="inline-flex items-center gap-1"><X className="w-3.5 h-3.5 text-slate-300" /> Not supported</span>
            </div>
          </div>
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-sm min-w-[640px]">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left font-medium text-slate-500 py-2 px-2 w-[24%]">Market</th>
                  {COMPETITORS.map((c) => (
                    <th key={c.key} className={`py-2 px-2 text-center ${c.tone === "teal" ? "bg-teal-50/60" : ""}`}>
                      <span className={`text-[12px] font-semibold ${c.tone === "teal" ? "text-teal-700" : "text-slate-700"}`}>{c.name}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {MARKETS.map((m, i) => (
                  <tr key={m.code} className={i % 2 ? "bg-white/60" : ""}>
                    <td className="py-2 px-2 text-slate-700">
                      <span className="font-mono text-[11px] text-slate-400 mr-2">{m.code}</span>{m.label}
                    </td>
                    {COMPETITORS.map((c) => (
                      <td key={c.key} className={`py-2 px-2 text-center ${c.tone === "teal" ? "bg-teal-50/30" : ""}`}>
                        <Cell value={COVERAGE[c.key][m.code]} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile: stacked cards */}
        <div className="sm:hidden space-y-3">
          {FEATURES.map((f) => (
            <div key={f.label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-sm font-medium text-slate-800 mb-3">{f.label}</p>
              <div className="grid grid-cols-2 gap-2 text-center">
                {COMPETITORS.map((c) => (
                  <div key={c.key} className={`rounded-lg py-2 ${toneClasses(c.tone)}`}>
                    <div className="flex justify-center"><Cell value={f[c.key]} /></div>
                    <span className="block text-[10px] font-mono mt-1 opacity-80">{c.name}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Desktop: table */}
        <div className="hidden sm:block rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-sm min-w-[760px]">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left font-medium text-slate-500 py-4 px-5 w-[34%]">Capability</th>
                  {COMPETITORS.map((c) => (
                    <th key={c.key} className={`py-4 px-3 ${c.tone === "teal" ? "bg-teal-50/60" : ""}`}>
                      <div className="flex flex-col items-center">
                        <span className={`text-[13px] font-semibold ${c.tone === "teal" ? "text-teal-700" : "text-slate-700"}`}>{c.name}</span>
                        <span className={`text-[10px] mt-0.5 ${c.tone === "teal" ? "text-teal-500" : "text-slate-400"}`}>{c.tag}</span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {FEATURES.map((f, i) => (
                  <tr key={f.label} className={i % 2 ? "bg-slate-50/50" : ""}>
                    <td className="py-3 px-5 text-slate-700">{f.label}</td>
                    {COMPETITORS.map((c) => (
                      <td key={c.key} className={`py-3 px-3 text-center ${c.tone === "teal" ? "bg-teal-50/40" : ""}`}>
                        <Cell value={f[c.key]} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <p className="mt-4 text-[11px] text-slate-400 text-center leading-relaxed max-w-2xl mx-auto">
          Competitor names are referenced for illustrative purposes only, based on publicly available product
          documentation as of {new Date().getFullYear()}. Capability assessments reflect CreditDecide's
          interpretation and may vary by deployment; readers should verify directly with each vendor.
        </p>

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