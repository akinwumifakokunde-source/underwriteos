import React from "react";
import { FileText, MessageSquare } from "lucide-react";

// Live product mockups for the four AI modules. Dark forest-green cards so they
// read as "product UI" against the light section behind them.

// 01 — AI Underwriter: a draft credit memo with policy-tested ratios
export function UnderwriterMock() {
  const ratios = [
    { label: "DSCR · Base case", value: "1.42×", state: "PASS", bar: 71, color: "#34d399" },
    { label: "DSCR · −15% stress", value: "1.18×", state: "WATCH", bar: 59, color: "#fbbf24" },
    { label: "Operating margin", value: "18%", state: "PASS", bar: 72, color: "#34d399" },
    { label: "Concentration", value: "32%", state: "FLAG", bar: 32, color: "#f87171" },
  ];
  return (
    <div className="rounded-2xl bg-[#0e261a] border border-emerald-400/15 p-4 shadow-xl">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] font-mono text-emerald-300/70">Draft memo · file-2026-04-1162</span>
        <span className="text-[10px] text-amber-300/80 bg-amber-500/10 px-2 py-0.5 rounded-full">Pending review</span>
      </div>
      <div className="mb-3">
        <div className="text-sm font-semibold text-white">Verde Logística S.A. de C.V.</div>
        <div className="text-[11px] text-emerald-100/50">Trucking · CDMX</div>
      </div>
      <div className="grid grid-cols-3 gap-2 mb-3 text-center">
        <div className="rounded-lg bg-emerald-900/40 py-1.5"><div className="text-[9px] text-emerald-200/60">Recommend</div><div className="text-xs font-bold text-emerald-300">Approve</div></div>
        <div className="rounded-lg bg-emerald-900/40 py-1.5"><div className="text-[9px] text-emerald-200/60">Term</div><div className="text-xs font-bold text-white">36 mo</div></div>
        <div className="rounded-lg bg-emerald-900/40 py-1.5"><div className="text-[9px] text-emerald-200/60">Rate</div><div className="text-xs font-bold text-white">14.5%</div></div>
      </div>
      <div className="space-y-2">
        {ratios.map((r) => (
          <div key={r.label}>
            <div className="flex items-center justify-between text-[10px] mb-1">
              <span className="text-emerald-100/70">{r.label}</span>
              <span className="font-mono text-white">{r.value} <span className="ml-1" style={{ color: r.color }}>{r.state}</span></span>
            </div>
            <div className="h-1.5 rounded-full bg-emerald-950/60 overflow-hidden">
              <div className="h-full rounded-full" style={{ width: `${r.bar}%`, backgroundColor: r.color }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// 02 — AI Credit Officer: conversational document collection over SMS
export function CreditOfficerMock() {
  return (
    <div className="rounded-2xl bg-[#0e261a] border border-emerald-400/15 p-4 shadow-xl">
      <div className="flex items-center justify-between mb-3">
        <span className="inline-flex items-center gap-1.5 text-[10px] text-emerald-300"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live · SMS</span>
        <span className="text-[10px] text-emerald-100/50">3m 12s</span>
      </div>
      <div className="space-y-2 mb-3">
        <div className="flex gap-2"><div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0"><MessageSquare className="w-3 h-3 text-emerald-300" /></div><div className="rounded-lg rounded-tl-sm bg-emerald-900/40 px-2.5 py-1.5 text-[11px] text-emerald-50">Hi Maria, please send your last three bank statements for your £85,000 loan.</div></div>
        <div className="flex gap-2 justify-end"><div className="rounded-lg rounded-tr-sm bg-emerald-500/15 border border-emerald-400/20 px-2.5 py-1.5 text-[11px] text-emerald-50">Can I send screenshots from my banking app?</div><div className="w-6 h-6 rounded-full bg-emerald-500/30 flex items-center justify-center shrink-0 text-[10px] text-white">M</div></div>
        <div className="flex gap-2"><div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0"><MessageSquare className="w-3 h-3 text-emerald-300" /></div><div className="rounded-lg rounded-tl-sm bg-emerald-900/40 px-2.5 py-1.5 text-[11px] text-emerald-50">Of course — screenshots work perfectly ✓</div></div>
      </div>
      <div className="rounded-lg bg-emerald-950/50 p-2.5">
        <div className="flex items-center justify-between text-[10px] mb-1"><span className="text-emerald-100/60">File completeness</span><span className="font-bold text-emerald-300">78%</span></div>
        <div className="h-1.5 rounded-full bg-emerald-900/60 overflow-hidden mb-2"><div className="h-full bg-emerald-400 rounded-full" style={{ width: "78%" }} /></div>
        <div className="flex flex-wrap gap-1 text-[9px]">
          <span className="text-emerald-300/80 bg-emerald-500/10 px-1.5 py-0.5 rounded">✓ Identity</span>
          <span className="text-emerald-300/80 bg-emerald-500/10 px-1.5 py-0.5 rounded">✓ 3 docs</span>
          <span className="text-amber-300/80 bg-amber-500/10 px-1.5 py-0.5 rounded">1 pending</span>
        </div>
      </div>
    </div>
  );
}

// 03 — CreditDecide Risk Score: ten repayment signals from the documents
export function RiskScoreMock() {
  const scores = [
    ["Income stability", 0.82], ["Affordability", 0.74], ["Cash-flow regularity", 0.68],
    ["Employment formality", 0.79], ["Debt burden", 0.55], ["Capture fidelity", 0.91],
    ["Layout consistency", 0.86], ["Bill regularity", 0.63], ["Submission intent", 0.88], ["Liquidity", 0.71],
  ];
  return (
    <div className="rounded-2xl bg-[#0e261a] border border-emerald-400/15 p-4 shadow-xl">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] text-white font-medium">Maria Santos</span>
        <span className="text-[10px] text-emerald-100/50">3 files · 10 scores · 1.2s</span>
      </div>
      <div className="flex flex-wrap gap-1.5 mb-3">
        {["statement.pdf", "IMG_4471.jpg", "gcash-screenshot.png"].map((f) => (
          <span key={f} className="inline-flex items-center gap-1 text-[9px] text-emerald-100/70 bg-emerald-950/50 border border-emerald-400/15 px-1.5 py-0.5 rounded"><FileText className="w-2.5 h-2.5" />{f}</span>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
        {scores.map(([label, val], i) => (
          <div key={label} className="flex items-center gap-2">
            <span className="text-[9px] text-emerald-100/50 font-mono w-3">{String(i + 1).padStart(2, "0")}</span>
            <span className="text-[10px] text-emerald-100/70 flex-1 truncate">{label}</span>
            <div className="w-10 h-1 rounded-full bg-emerald-950/60 overflow-hidden"><div className="h-full bg-emerald-400 rounded-full" style={{ width: `${val * 100}%` }} /></div>
            <span className="text-[9px] font-mono text-white w-7 text-right">{val.toFixed(2)}</span>
          </div>
        ))}
      </div>
      <p className="mt-3 pt-2 border-t border-emerald-400/10 text-[9px] text-emerald-100/50 leading-relaxed">Backtest · 8,000 microloans — riskiest tenth defaults 2.2× the safest. Bureau alone is flat.</p>
    </div>
  );
}

// 04 — CreditDecide Capture: vision-language extraction from any photo
export function CaptureMock() {
  const fields = [["account_holder", "Maria Santos"], ["available_balance", "$4,218.50"], ["period", "Mar 2026"], ["transactions", "42"], ["monthly_inflow", "$8,400"], ["tampering", "none"]];
  return (
    <div className="rounded-2xl bg-[#0e261a] border border-emerald-400/15 p-4 shadow-xl">
      <div className="flex items-center justify-between mb-3">
        <span className="inline-flex items-center gap-1.5 text-[10px] text-emerald-300"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live · Vision extraction</span>
        <span className="text-[10px] text-emerald-100/50">1.8s</span>
      </div>
      <div className="rounded-lg bg-gradient-to-br from-emerald-950 to-emerald-900/40 p-2.5 mb-3">
        <div className="flex items-center justify-between text-[9px] text-emerald-200/70 mb-1.5"><span className="font-mono">CHASE</span><span>9:42 AM</span></div>
        <div className="text-[11px] text-white mb-1.5">Available balance <span className="font-bold">$4,218.50</span></div>
        <div className="space-y-1 text-[9px] text-emerald-100/70">
          <div className="flex justify-between"><span>Card settlement</span><span className="text-emerald-300">+1,200</span></div>
          <div className="flex justify-between"><span>Supplier ACH</span><span className="text-rose-300/80">−800</span></div>
          <div className="flex justify-between"><span>Mobile deposit</span><span className="text-emerald-300">+2,000</span></div>
        </div>
      </div>
      <div className="text-[10px] text-emerald-300/80 mb-2">✓ Vision read: photo at angle — read perfectly</div>
      <div className="grid grid-cols-2 gap-1.5 text-[9px]">
        {fields.map(([k, v]) => (
          <div key={k} className="rounded bg-emerald-950/50 px-1.5 py-1"><span className="text-emerald-100/50 font-mono">{k}</span> <span className="text-white">{v}</span></div>
        ))}
      </div>
    </div>
  );
}