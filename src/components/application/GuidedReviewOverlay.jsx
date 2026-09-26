import React, { useState, useEffect } from "react";
import GuidedOverlay from "@/components/lender/GuidedOverlay";

// Mirrors the public demo's lender walkthrough (steps 2–7), but drives the
// REAL application detail tabs on real data. Step 1 (pipeline intro) lives on
// the Applications list; the portfolio finish lives on Reports.
const STEPS = [
  {
    n: 2, tab: "Documents", pos: "top-right",
    title: "CreditDecide reads every document and pulls the numbers",
    body: "Vision-language models transcribe each page, then extract the credit signals from it.",
    bullets: ["Pages transcribed, not keyword-matched", "Evidence cross-checked against your requirements"],
    footer: "Reading the file…",
    cta: "CreditDecide chases the gaps",
    next: { tab: "Activity" },
  },
  {
    n: 3, tab: "Activity", pos: "top-right",
    title: "CreditDecide interviews the borrower and chases what's missing",
    body: "A real conversation in the borrower's own channel, not a portal task list.",
    bullets: ["Chases the documents the file still needs", "Asks about the numbers that disagree"],
    cta: "Draft the credit memo",
    next: { tab: "Credit Memo" },
  },
  {
    n: 4, tab: "Credit Memo", pos: "top-right",
    title: "Draft the credit memo",
    body: "CreditDecide assembles the evidence into a draft memo, section by section, each line cited.",
    bullets: ["Every claim traced to a source", "Your underwriter edits and decides"],
    cta: "See the citations",
    next: { tab: "Credit Memo" },
  },
  {
    n: 5, tab: "Credit Memo", pos: "bottom-left",
    title: "Click any citation to see the exact source line",
    body: "Nothing in the memo is unattributed. Each numbered chip opens the page it came from.",
    bullets: ["Findings and mitigants both carry sources", "The document opens to the cited line"],
    tryIt: "Try it: Click any numbered citation in this section.",
    cta: "Bureau and outside data",
    next: { tab: "Credit Memo" },
  },
  {
    n: 6, tab: "Credit Memo", pos: "top-right",
    title: "Bureau, device and any API you connect feed the memo",
    body: "With borrower authorization, your outside sources enter the same analysis as their documents.",
    bullets: ["Bureau scores, device signals, public records", "Any API you connect, cited like a document"],
    cta: "CreditDecide's recommendation",
    next: { tab: "Decision" },
  },
  {
    n: 7, tab: "Decision", pos: "top-right",
    title: "CreditDecide recommends. Your underwriter decides.",
    body: "The recommendation arrives with its evidence and conditions. What happens next is your officer's call.",
    bullets: ["Audit every claim, then approve or decline", "Or set auto-approve and auto-decline thresholds"],
    cta: "See portfolio insights",
    next: null,
  },
];

export default function GuidedReviewOverlay({ setTab, onFinish }) {
  const [step, setStep] = useState(0);
  const cur = STEPS[step];

  useEffect(() => {
    setTab(STEPS[0].tab);
  }, [setTab]);

  const next = () => {
    const nx = cur.next;
    if (!nx) { onFinish?.(); return; }
    if (nx.tab) setTab(nx.tab);
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const back = () => {
    if (step <= 0) return;
    const prev = STEPS[step - 1];
    if (prev?.tab) setTab(prev.tab);
    setStep((s) => s - 1);
  };

  return (
    <GuidedOverlay
      n={cur.n}
      total={7}
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