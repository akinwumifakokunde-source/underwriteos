import React, { useState, useEffect } from "react";
import GuidedOverlay from "@/components/lender/GuidedOverlay";

// Same guided walkthrough as the public demo, but stepping through the REAL
// application detail tabs on real data. Drives the host page's tab state.
const STEPS = [
  {
    n: 1, tab: "Application Details", pos: "bottom-left",
    title: "Open the borrower's file",
    body: "Every application arrives with its details, documents and status in one place.",
    bullets: ["Applications arrive by API, a white-label form, or from your team"],
    cta: "Read the documents",
    next: { tab: "Documents" },
  },
  {
    n: 2, tab: "Documents", pos: "top-right",
    title: "CreditDecide reads every document and pulls the numbers",
    body: "Vision-language models transcribe each page, then extract the credit signals from it.",
    bullets: ["Pages transcribed, not keyword-matched", "Evidence cross-checked against your requirements"],
    cta: "Draft the credit memo",
    next: { tab: "Credit Memo" },
  },
  {
    n: 3, tab: "Credit Memo", pos: "top-right",
    title: "Draft the credit memo",
    body: "CreditDecide assembles the evidence into a draft memo, section by section, each line cited.",
    bullets: ["Every claim traced to a source", "Your underwriter edits and decides"],
    cta: "See the citations",
    next: { tab: "Credit Memo" },
  },
  {
    n: 4, tab: "Credit Memo", pos: "bottom-left",
    title: "Click any citation to see the exact source line",
    body: "Nothing in the memo is unattributed. Each numbered chip opens the page it came from.",
    bullets: ["Findings and mitigants both carry sources", "The document opens to the cited line"],
    tryIt: "Try it: Click any numbered citation in this section.",
    cta: "Bureau and outside data",
    next: { tab: "Credit Memo" },
  },
  {
    n: 5, tab: "Credit Memo", pos: "top-right",
    title: "Bureau, device and any API you connect feed the memo",
    body: "With borrower authorization, your outside sources enter the same analysis as their documents.",
    bullets: ["Bureau scores, device signals, public records", "Any API you connect, cited like a document"],
    cta: "CreditDecide's recommendation",
    next: { tab: "Decision" },
  },
  {
    n: 6, tab: "Decision", pos: "top-right",
    title: "CreditDecide recommends. Your underwriter decides.",
    body: "The recommendation arrives with its evidence and conditions. What happens next is your officer's call.",
    bullets: ["Audit every claim, then approve or decline", "Or set auto-approve and auto-decline thresholds"],
    cta: "Finish the walkthrough",
    next: null,
  },
];

export default function GuidedReviewOverlay({ setTab, onFinish, borrowerName, loanAmount }) {
  const [step, setStep] = useState(1);
  const [started, setStarted] = useState(false);
  const cur = STEPS[step - 1];

  // Start on the first step's tab.
  useEffect(() => {
    setTab(STEPS[0].tab);
  }, [setTab]);

  const next = () => {
    const nx = cur.next;
    if (!nx) { onFinish?.(); return; }
    if (nx.tab) setTab(nx.tab);
    setStep((s) => Math.min(s + 1, STEPS.length));
  };

  const back = () => {
    if (step <= 1) return;
    const prev = STEPS[step - 2];
    if (prev?.tab) setTab(prev.tab);
    setStep((s) => s - 1);
  };

  if (!started) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-5">
        <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 pt-4">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Guided Review</span>
            <button onClick={onFinish} className="text-slate-400 hover:text-slate-700 text-lg leading-none">✕</button>
          </div>
          <div className="px-5 pb-5">
            <h2 className="text-xl font-semibold text-slate-900 leading-snug">Walk through this loan file from documents to decision.</h2>
            <p className="mt-2 text-[14px] text-slate-600 leading-relaxed">
              {borrowerName ? `${borrowerName} wants ${loanAmount || "a loan"}. ` : ""}
              CreditDecide reads the file, drafts the credit memo, and recommends. Your team makes the call.
            </p>
            <div className="mt-5 flex items-center justify-between">
              <button onClick={onFinish} className="text-[13px] text-slate-500 hover:text-slate-700">Skip walkthrough</button>
              <button onClick={() => setStarted(true)} className="text-sm font-medium text-white px-5 py-2.5 rounded-full" style={{ backgroundColor: "#0B3D21" }}>Start review</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <GuidedOverlay
      n={cur.n}
      total={STEPS.length}
      position={cur.pos}
      title={cur.title}
      body={cur.body}
      bullets={cur.bullets}
      tryIt={cur.tryIt}
      footer={cur.footer}
      cta={cur.cta}
      onBack={back}
      onNext={next}
      onClose={onFinish}
    />
  );
}