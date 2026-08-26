import React from "react";
import { Link } from "react-router-dom";

// YC narrative: the feedback loop that makes the engine get smarter.
export default function FeedbackLoop() {
  return (
    <section className="border-t border-[#eceef1] bg-[#fafbfc]">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-20">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-start">
          <div className="md:col-span-5">
            <div className="inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-[#525965] mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0d9488]" /> The feedback loop
            </div>
            <h2 className="text-4xl sm:text-5xl font-semibold tracking-tight text-[#0a0c12]">
              Decisions that get sharper with every loan.
            </h2>
            <p className="mt-5 text-[15px] text-[#525965] leading-relaxed">
              Most underwriting engines predict and forget. UnderwriteOS records what actually happened —
              repaid, late, defaulted — and folds it back into the model. The predicted probability of
              default converges on the observed default rate, and you can watch it happen.
            </p>
            <Link
              to="/monitoring"
              className="mt-6 inline-flex items-center gap-1.5 text-[13px] font-medium text-[#0d9488] hover:underline"
            >
              See the calibration dashboard →
            </Link>
          </div>

          <div className="md:col-span-7">
            <div className="rounded-2xl border border-[#eceef1] bg-white p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[12px] font-medium text-[#0a0c12]">Calibration — predicted vs actual default</span>
                <span className="text-[10px] font-mono text-[#8a909c]">PD bucket → observed default rate</span>
              </div>
              {/* Schematic calibration visual */}
              <div className="space-y-2.5">
                {[
                  { bucket: "0–10%", pred: 6, actual: 5 },
                  { bucket: "10–20%", pred: 15, actual: 17 },
                  { bucket: "20–30%", pred: 26, actual: 24 },
                  { bucket: "30–40%", pred: 35, actual: 38 },
                  { bucket: "40–50%", pred: 46, actual: 44 },
                  { bucket: "50%+", pred: 62, actual: 60 },
                ].map((r) => (
                  <div key={r.bucket} className="flex items-center gap-3">
                    <span className="w-14 shrink-0 text-[11px] font-mono text-[#525965]">{r.bucket}</span>
                    <div className="flex-1 relative h-3 rounded bg-[#f3f4f6] overflow-hidden">
                      <div className="absolute inset-y-0 left-0 bg-[#0d9488]/30" style={{ width: `${r.pred}%` }} />
                      <div
                        className="absolute top-0 bottom-0 w-0.5 bg-[#dc2626]"
                        style={{ left: `calc(${r.actual}% - 1px)` }}
                      />
                    </div>
                    <span className="w-20 shrink-0 text-right text-[11px] font-mono text-[#8a909c]">
                      {r.pred}% / {r.actual}%
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex items-center gap-4 text-[11px] text-[#525965]">
                <span className="inline-flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-[#0d9488]/40" /> Predicted PD</span>
                <span className="inline-flex items-center gap-1.5"><span className="w-2.5 h-0.5 bg-[#dc2626]" /> Actual default</span>
              </div>
            </div>
            <p className="mt-4 text-[12px] text-[#8a909c] leading-relaxed">
              Lenders report outcomes back through the API. The monitoring layer buckets each loan by its
              predicted PD and compares it to the realized default rate — so you can prove the model is
              calibrated, not just confident.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}