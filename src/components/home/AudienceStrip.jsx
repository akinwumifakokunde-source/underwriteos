import React from "react";

const AUDIENCES = [
  "Consumer lenders",
  "Fintechs & neobanks",
  "BNPL providers",
  "Credit unions",
  "Mortgage brokers",
  "Embedded finance",
];

export default function AudienceStrip() {
  return (
    <section className="border-y border-[#1c2029] bg-[#0c0f17]">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8">
          <span className="text-[11px] font-medium uppercase tracking-wider text-[#5b6472] shrink-0">
            Built for
          </span>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            {AUDIENCES.map((a) => (
              <span
                key={a}
                className="text-sm text-[#a0a5b0] font-medium"
              >
                {a}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}