import React from "react";
import { Bot, Scale, Gavel } from "lucide-react";

const TONE = {
  APPROVE: "text-emerald-600 bg-emerald-50 border-emerald-200",
  REVIEW: "text-amber-600 bg-amber-50 border-amber-200",
  DECLINE: "text-rose-600 bg-rose-50 border-rose-200",
};

export default function RecommendationDecision({ recommendation, decision }) {
  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-3">
          Decision workflow
        </div>
        <div className="space-y-2.5">
          <Stage icon={Bot} label="AI underwriting recommendation" value={recommendation?.recommendation} note="Advisory only — the AI never approves or declines a borrower." />
          <div className="text-center text-slate-300 text-xs">↓</div>
          <Stage icon={Scale} label="Policy evaluation" value={decision?.policy_outcome?.decision} note={`Policy ${decision?.policy_id} v${decision?.policy_version}`} />
          <div className="text-center text-slate-300 text-xs">↓</div>
          <Stage icon={Gavel} label="Final decision" value={decision?.decision} note={`Source: ${decision?.decision_source}`} strong />
        </div>
      </div>

      {recommendation?.ai_memo && (
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-1.5">AI underwriting memo</div>
          <p className="text-sm text-slate-700 leading-relaxed">{recommendation.ai_memo}</p>
          <div className="mt-3 flex flex-wrap items-center gap-1.5 text-[10px] text-slate-500">
            <span className="font-medium">Generated from:</span>
            {["Financial profile", "Credit profile", "Risk signals", "Evidence"].map((s) => (
              <span key={s} className="bg-slate-100 rounded px-1.5 py-0.5">{s}</span>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <SignalList title="Positive signals" items={recommendation?.positive_signals} tone="emerald" />
        <SignalList title="Risk factors" items={recommendation?.risk_factors} tone="rose" />
      </div>
    </div>
  );
}

function Stage({ icon: Icon, label, value, note, strong }) {
  return (
    <div className={`rounded-lg border p-3 flex items-center justify-between ${value ? TONE[value] : "border-slate-200 bg-white"}`}>
      <div className="flex items-center gap-2.5">
        <Icon className="w-5 h-5" />
        <div>
          <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">{label}</div>
          <div className="text-xs text-slate-500">{note}</div>
        </div>
      </div>
      <div className={`text-xl font-bold ${strong ? "underline decoration-2 underline-offset-2" : ""}`}>{value || "—"}</div>
    </div>
  );
}

function SignalList({ title, items, tone }) {
  const dot = tone === "emerald" ? "bg-emerald-400" : "bg-rose-400";
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-2">{title}</div>
      {items?.length ? (
        <ul className="space-y-1.5">
          {items.map((s, i) => (
            <li key={i} className="text-sm text-slate-600 flex gap-2 items-start">
              <span className={`w-1.5 h-1.5 rounded-full ${dot} mt-1.5 shrink-0`} />
              {s}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-slate-400">None</p>
      )}
    </div>
  );
}