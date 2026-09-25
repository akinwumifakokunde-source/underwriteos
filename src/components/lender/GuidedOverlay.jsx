import React from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { GREEN } from "./data";

export default function GuidedOverlay({
  n, total = 7, position = "top-right",
  title, body, bullets = [], tryIt, footer, cta,
  onBack, onNext, onClose,
}) {
  const posCls =
    position === "bottom-left" ? "bottom-6 left-6"
    : position === "bottom-right" ? "bottom-6 right-6"
    : "top-20 right-6";

  return (
    <div className={`fixed z-50 w-[340px] max-w-[calc(100vw-2rem)] ${posCls}`}>
      <div className="rounded-xl border border-slate-200 bg-white shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-4 pt-3.5 pb-2">
          <div className="flex items-center gap-2.5">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Step {n} of {total}</span>
            <div className="flex items-center gap-1">
              {Array.from({ length: total }).map((_, i) => (
                <span key={i} className="h-1 w-5 rounded-full" style={{ backgroundColor: i < n ? GREEN : "#e5e7eb" }} />
              ))}
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 transition-colors" aria-label="Close">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="px-4 pb-4">
          <h3 className="text-[17px] font-semibold text-slate-900 leading-snug">{title}</h3>
          {body && <p className="mt-1.5 text-[13px] text-slate-600 leading-relaxed">{body}</p>}
          {bullets.length > 0 && (
            <ul className="mt-2.5 space-y-1.5">
              {bullets.map((b, i) => (
                <li key={i} className="flex items-start gap-2 text-[13px] text-slate-700">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: GREEN }} />
                  {b}
                </li>
              ))}
            </ul>
          )}
          {tryIt && (
            <div className="mt-3 rounded-lg px-3 py-2 text-[12px] text-slate-700" style={{ backgroundColor: "#eef6ee" }}>
              {tryIt}
            </div>
          )}
          {footer && <p className="mt-3 text-[12px] text-slate-400">{footer}</p>}
          <div className="mt-4 flex items-center justify-between">
            <button
              onClick={onBack}
              disabled={n === 1}
              className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50 disabled:opacity-40 transition-colors"
              aria-label="Back"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={onNext}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-white px-4 py-2 rounded-lg transition-shadow hover:shadow-md"
              style={{ backgroundColor: GREEN }}
            >
              {cta} <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}