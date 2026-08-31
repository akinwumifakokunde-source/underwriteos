import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Target, RefreshCw, TrendingUp } from "lucide-react";

const LOOP = [
  { step: "Decide", desc: "AI recommends with a predicted probability of default." },
  { step: "Disburse", desc: "The lender funds the approved loan." },
  { step: "Observe", desc: "Record what actually happened — repaid, late, or defaulted." },
  { step: "Calibrate", desc: "Predicted PD is measured against the observed default rate." },
  { step: "Re-tune", desc: "Policy thresholds tighten where the model drifted." },
];

// Static illustration of a well-calibrated model — predicted tracks actual.
const BUCKETS = [
  { bucket: "0–10%", predicted: 6, actual: 5 },
  { bucket: "10–20%", predicted: 15, actual: 17 },
  { bucket: "20–30%", predicted: 26, actual: 24 },
  { bucket: "30–40%", predicted: 35, actual: 38 },
  { bucket: "40–50%", predicted: 46, actual: 44 },
  { bucket: "50%+", predicted: 61, actual: 58 },
];

export default function Outcomes() {
  const max = 70;
  return (
    <section className="border-b border-[#eceef1] bg-white">
      <div className="max-w-5xl mx-auto px-5 sm:px-8 py-16 sm:py-24">
        <p className="text-xs font-mono uppercase tracking-wider text-[#0d9488] mb-4">The closed loop</p>
        <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#0a0c12] max-w-2xl">
          Decisions get smarter <span className="text-[#0d9488]">after the loan.</span>
        </h2>
        <p className="mt-5 text-base sm:text-lg text-[#525965] leading-relaxed max-w-2xl">
          Most underwriting tools stop at the decision. CreditDecide records what actually happened on every
          loan and measures the predicted probability of default against the observed default rate — the
          feedback loop that turns one-time decisions into a self-improving model.
        </p>

        {/* Loop */}
        <div className="mt-10 grid grid-cols-2 sm:grid-cols-5 gap-3">
          {LOOP.map((l, i) => (
            <React.Fragment key={l.step}>
              <div className="rounded-2xl border border-[#eceef1] bg-gradient-to-b from-white to-[#fcfcfd] p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-6 h-6 rounded-full bg-[#0d9488] text-white text-[11px] font-semibold flex items-center justify-center">{i + 1}</span>
                  <span className="text-[13px] font-semibold text-[#0a0c12]">{l.step}</span>
                </div>
                <p className="text-[12px] text-[#525965] leading-relaxed">{l.desc}</p>
              </div>
              {i < LOOP.length - 1 && (
                <div className="hidden sm:flex items-center justify-center text-[#b0b5be]">
                  <RefreshCw className="w-3.5 h-3.5" />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Calibration visual */}
        <div className="mt-10 grid md:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-[#eceef1] bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <Target className="w-4 h-4 text-[#0d9488]" />
              <h3 className="text-[15px] font-semibold text-[#0a0c12]">Calibration chart</h3>
            </div>
            <p className="text-[12px] text-[#525965] mb-5">Predicted PD bucket → observed default rate. A calibrated model tracks the diagonal.</p>
            <div className="space-y-2.5">
              {BUCKETS.map((b) => (
                <div key={b.bucket} className="flex items-center gap-3">
                  <span className="text-[11px] font-mono text-[#8a909c] w-14 shrink-0">{b.bucket}</span>
                  <div className="flex-1 relative h-5 bg-[#f6f7f9] rounded">
                    <div className="absolute top-0 left-0 h-5 bg-[#0d9488]/15 rounded" style={{ width: `${(b.predicted / max) * 100}%` }} />
                    <div className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[#0d9488]" style={{ left: `calc(${(b.predicted / max) * 100}% - 4px)` }} />
                    <div className="absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full border-2 border-[#dc2626] bg-white" style={{ left: `calc(${(b.actual / max) * 100}% - 5px)` }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center gap-5 text-[11px]">
              <span className="inline-flex items-center gap-1.5 text-[#525965]"><span className="w-2 h-2 rounded-full bg-[#0d9488]" /> Predicted PD</span>
              <span className="inline-flex items-center gap-1.5 text-[#525965]"><span className="w-2.5 h-2.5 rounded-full border-2 border-[#dc2626] bg-white" /> Actual default</span>
            </div>
          </div>

          <div className="rounded-2xl border border-[#eceef1] bg-white p-6 shadow-sm flex flex-col">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-[#0d9488]" />
              <h3 className="text-[15px] font-semibold text-[#0a0c12]">Why it matters</h3>
            </div>
            <ul className="mt-3 space-y-3 text-[13px] text-[#525965] leading-relaxed">
              <li className="flex gap-2.5"><span className="text-[#0d9488] shrink-0">·</span> Prove to regulators and investors that your model is calibrated, not just confident.</li>
              <li className="flex gap-2.5"><span className="text-[#0d9488] shrink-0">·</span> Catch drift early — buckets where actual diverges from predicted show exactly where to re-tune.</li>
              <li className="flex gap-2.5"><span className="text-[#0d9488] shrink-0">·</span> Turn every disbursed loan into a labelled training signal for the next policy version.</li>
            </ul>
            <div className="mt-auto pt-5">
              <Link to="/monitoring" className="group inline-flex items-center gap-1.5 text-sm font-medium text-[#0a0c12] hover:text-[#0d9488] transition-colors">
                Open calibration dashboard <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}