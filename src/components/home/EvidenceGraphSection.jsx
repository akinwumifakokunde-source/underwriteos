import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Scale, Brain, Activity, FileSearch, Link2 } from "lucide-react";

const CHAIN = [
  { label: "Decision", icon: Scale },
  { label: "AI memo", icon: Brain },
  { label: "Risk signal", icon: Activity },
  { label: "Evidence", icon: FileSearch },
  { label: "Source field", icon: Link2 },
];

export default function EvidenceGraphSection() {
  return (
    <section className="border-t border-[#eceef1] bg-[#f7f9fb]">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-20">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-center">
          <div className="md:col-span-6">
            <div className="inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-[#0d9488] mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0d9488]" /> Evidence graph
            </div>
            <h2 className="text-4xl sm:text-5xl font-semibold tracking-tight text-[#0a0c12] leading-[1.05]">
              Every decision, traceable to the field it came from.
            </h2>
            <p className="mt-5 text-lg text-[#525965] leading-relaxed">
              A decline is never just a number. UnderwriteOS links each decision back through the AI
              recommendation, the policy that fired, the risk signal, and the exact source field in the
              credit report or bank statement it was derived from. Open the explorer and audit any
              decision end to end.
            </p>
            <div className="mt-7 flex items-center gap-3">
              <Link to="/evidence" className="inline-flex items-center gap-1.5 text-sm font-medium text-white bg-[#0a0c12] hover:bg-[#1a1c21] rounded-lg px-4 py-2.5">
                Open the explorer <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/api-reference" className="text-sm font-medium text-[#0a0c12] hover:underline">
                See the API
              </Link>
            </div>
          </div>

          <div className="md:col-span-6">
            <div className="rounded-2xl border border-[#eceef1] bg-white p-6 shadow-sm">
              <div className="text-[11px] font-medium uppercase tracking-wider text-[#8a909c] mb-4">Decision lineage</div>
              <div className="space-y-2">
                {CHAIN.map((c, i) => {
                  const Icon = c.icon;
                  return (
                    <React.Fragment key={c.label}>
                      <div className="flex items-center gap-3 rounded-lg border border-[#eceef1] bg-[#fbfcfd] px-3.5 py-2.5">
                        <span className="w-7 h-7 rounded-md bg-[#e6f7f3] flex items-center justify-center">
                          <Icon className="w-3.5 h-3.5 text-[#0d9488]" />
                        </span>
                        <span className="text-sm font-medium text-[#0a0c12] flex-1">{c.label}</span>
                        <span className="text-[10px] font-mono text-[#8a909c]">{`step ${i + 1}`}</span>
                      </div>
                      {i < CHAIN.length - 1 && (
                        <div className="ml-4 w-px h-3 bg-[#d8dce2]" />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
              <div className="mt-5 rounded-lg bg-[#0a0c12] text-[#e6e8ec] font-mono text-[11px] p-3.5 overflow-x-auto">
                <div className="text-[#6b6f76]">GET /v1/applications/{"{id}"}/evidence-graph</div>
                <div className="mt-1.5 text-[#9be7d8]">→ decision · recommendation · policy</div>
                <div className="text-[#9be7d8]">→ risk_signals[] · evidence[] · source.field</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}