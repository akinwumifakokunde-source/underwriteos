import React, { useState } from "react";
import GuidedOverlay from "@/components/lender/GuidedOverlay";

// Step 1 of the live guided walkthrough — mirrors the demo's pipeline intro.
// Shows the intro modal, then a guided overlay pointing at the new application
// row. Opening the file hands off to the detail page (steps 2–7).
export default function GuidedPipeline({ borrowerName, loanAmount, onOpen, onSkip }) {
  const [started, setStarted] = useState(false);

  if (!started) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-5">
        <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 pt-4">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Guided Review</span>
            <button onClick={onSkip} className="text-slate-400 hover:text-slate-700 text-lg leading-none">✕</button>
          </div>
          <div className="px-5 pb-5">
            <h2 className="text-xl font-semibold text-slate-900 leading-snug">Watch one loan file go from documents to decision-ready.</h2>
            <p className="mt-2 text-[14px] text-slate-600 leading-relaxed">
              {borrowerName ? `${borrowerName} wants ${loanAmount || "a loan"}. ` : ""}
              CreditDecide reads the file, chases what is missing, and drafts the memo. Your team makes the call.
            </p>
            <div className="mt-5 flex items-center justify-between">
              <button onClick={onSkip} className="text-[13px] text-slate-500 hover:text-slate-700">Skip walkthrough</button>
              <button onClick={() => setStarted(true)} className="text-sm font-medium text-white px-5 py-2.5 rounded-full" style={{ backgroundColor: "#0B3D21" }}>Start review</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <GuidedOverlay
      n={1}
      total={7}
      position="bottom-left"
      title="New loan files arrive in your pipeline automatically"
      body="Every row is a borrower application, pulled straight from your application flow, LOS, or core banking system."
      bullets={["Applications arrive by API or from your team"]}
      tryIt="Try it: Click the highlighted row to open the file."
      cta="Open the file"
      onNext={onOpen}
      onClose={onSkip}
    />
  );
}