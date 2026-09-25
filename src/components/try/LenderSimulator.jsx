import React, { useState, useEffect } from "react";
import { Globe, Phone } from "lucide-react";
import GuidedOverlay from "@/components/lender/GuidedOverlay";
import ApplicationsPipeline from "@/components/lender/ApplicationsPipeline";
import ApplicationDetail from "@/components/lender/ApplicationDetail";
import PortfolioInsights from "@/components/lender/PortfolioInsights";
import BookingModal from "@/components/booking/BookingModal";
import { PIPELINE_ROWS, GREEN, BORROWER } from "@/components/lender/data";

const STEPS = [
  {
    n: 1, view: "pipeline", pos: "bottom-left",
    title: "New loan files arrive in your pipeline automatically",
    body: "Every row is a borrower application, pulled straight from your application flow, LOS, or core banking system.",
    bullets: ["Applications arrive by API or from your team"],
    tryIt: "Try it: Click Maria's row to open her file.",
    cta: "Open Maria's file",
    next: { view: "detail", tab: "details", step: 2 },
  },
  {
    n: 2, view: "detail", tab: "documents", pos: "top-right",
    title: "CreditDecide reads every document and pulls the numbers",
    body: "Vision-language models transcribe each page, then extract the credit signals from it.",
    bullets: ["Pages transcribed, not keyword-matched", "Evidence cross-checked against your requirements"],
    footer: "Reading 4 of 11...",
    cta: "CreditDecide chases the gaps",
    next: { view: "detail", tab: "conversation", step: 3 },
  },
  {
    n: 3, view: "detail", tab: "conversation", pos: "top-right",
    title: "CreditDecide interviews the borrower and chases what's missing",
    body: "A real conversation in Maria's own channel, not a portal task list.",
    bullets: ["Chases the documents the file still needs", "Asks about the numbers that disagree"],
    cta: "Maria responds",
    next: { view: "detail", tab: "conversation", step: 4 },
  },
  {
    n: 4, view: "detail", tab: "conversation", pos: "top-right",
    title: "Draft the credit memo",
    body: "CreditDecide assembles the evidence into a draft memo, section by section, each line cited.",
    bullets: ["Every claim traced to a source", "Your underwriter edits and decides"],
    cta: "Draft the credit memo",
    next: { view: "detail", tab: "creditmemo", step: 5 },
  },
  {
    n: 5, view: "detail", tab: "creditmemo", pos: "bottom-left",
    title: "Click any citation to see the exact source line",
    body: "Nothing in the memo is unattributed. Each numbered chip opens the page it came from.",
    bullets: ["Findings and mitigants both carry sources", "The document opens to the cited line"],
    tryIt: "Try it: Click any numbered citation in this section.",
    cta: "Bureau and outside data",
    next: { view: "detail", tab: "creditmemo", step: 6 },
  },
  {
    n: 6, view: "detail", tab: "creditmemo", pos: "top-right",
    title: "Bureau, device and any API you connect feed the memo",
    body: "With borrower authorization, your outside sources enter the same analysis as their documents.",
    bullets: ["Bureau scores, device signals, public records", "Any API you connect, cited like a document"],
    cta: "CreditDecide's recommendation",
    next: { view: "detail", tab: "creditmemo", step: 7 },
  },
  {
    n: 7, view: "detail", tab: "creditmemo", pos: "top-right",
    title: "CreditDecide recommends. Your underwriter decides.",
    body: "The recommendation arrives with its evidence and conditions. What happens next is your officer's call.",
    bullets: ["Audit every claim, then approve or decline", "Or set auto-approve and auto-decline thresholds"],
    cta: "Continue review",
    next: { view: "portfolio", tab: null, step: 8 },
  },
];

export default function LenderSimulator({ onBack }) {
  const [view, setView] = useState("pipeline");
  const [tab, setTab] = useState("details");
  const [step, setStep] = useState(0);
  const [guided, setGuided] = useState(true);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [autoplay, setAutoplay] = useState(false);

  const openRow = () => {
    setView("detail");
    setTab("details");
    setStep(2);
  };

  const next = () => {
    setAutoplay(false);
    const cur = STEPS[step - 1];
    if (!cur) return;
    const nx = cur.next;
    if (nx.view) setView(nx.view);
    if (nx.tab) setTab(nx.tab);
    setStep(nx.step);
  };

  const back = () => {
    setAutoplay(false);
    const prev = STEPS[step - 2];
    if (prev) {
      if (prev.view) setView(prev.view);
      if (prev.tab) setTab(prev.tab);
      setStep(step - 1);
    } else {
      setStep(1);
    }
  };

  const closeGuided = () => {
    setAutoplay(false);
    setGuided(false);
  };
  const resumeGuided = () => {
    setGuided(true);
    if (step === 0) setStep(1);
  };

  useEffect(() => {
    if (!autoplay) return;
    if (step < 1 || step > 7) {
      setAutoplay(false);
      return;
    }
    const t = setTimeout(() => {
      const cur = STEPS[step - 1];
      if (!cur) {
        setAutoplay(false);
        return;
      }
      const nx = cur.next;
      if (nx.view) setView(nx.view);
      if (nx.tab) setTab(nx.tab);
      setStep(nx.step);
    }, 4000);
    return () => clearTimeout(t);
  }, [autoplay, step]);

  const showIntro = view === "pipeline" && step === 0 && guided;
  const activeStep = STEPS[step - 1];
  const showOverlay = guided && step >= 1 && step <= 7 && activeStep && activeStep.view === view;
  const showFinish = view === "portfolio" && guided && step === 8;

  return (
    <div className="min-h-screen bg-[#f4f4f4]">
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button onClick={onBack} className="flex items-center gap-2 text-sm font-semibold" style={{ color: GREEN }}>
              <span className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: GREEN }}>C</span>
              CreditDecide
            </button>
            <nav className="hidden sm:flex items-center gap-5 text-sm">
              <button
                onClick={() => setView("pipeline")}
                className="font-medium pb-1"
                style={view === "pipeline" ? { color: "#111827", borderBottom: `2px solid ${GREEN}` } : { color: "#9ca3af", borderBottom: "2px solid transparent" }}
              >
                Applications
              </button>
              <button
                onClick={() => setView("portfolio")}
                className="font-medium pb-1"
                style={view === "portfolio" ? { color: "#111827", borderBottom: `2px solid ${GREEN}` } : { color: "#9ca3af", borderBottom: "2px solid transparent" }}
              >
                Portfolio Insights
              </button>
            </nav>
          </div>
          <div className="flex items-center gap-3 sm:gap-4">
            <button className="hidden md:inline-flex items-center gap-1.5 text-[12px] text-slate-500"><Globe className="w-4 h-4" /> United States English · USD</button>
            <button className="hidden sm:inline-flex text-[12px] text-slate-500 hover:text-slate-700">FAQs</button>
            <button className="hidden sm:inline-flex items-center gap-1.5 text-[12px] font-medium px-3 py-1.5 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50"><Phone className="w-3.5 h-3.5" /> Book a call</button>
            <button onClick={resumeGuided} className="text-[12px] font-medium text-white px-3.5 py-1.5 rounded-full" style={{ backgroundColor: GREEN }}>Start demo</button>
          </div>
        </div>
      </header>

      {view === "pipeline" && <ApplicationsPipeline rows={PIPELINE_ROWS} onOpenRow={openRow} highlightId={step === 1 ? "r2" : null} />}
      {view === "detail" && <ApplicationDetail tab={tab} setTab={setTab} step={step} />}
      {view === "portfolio" && <PortfolioInsights />}

      {showIntro && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-5">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 pt-4">
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Guided Demo</span>
              <button onClick={() => { setGuided(false); setStep(1); }} className="text-slate-400 hover:text-slate-700 text-lg leading-none">✕</button>
            </div>
            <div className="px-5 pb-5">
              <h2 className="text-xl font-semibold text-slate-900 leading-snug">Watch one loan file go from documents to decision-ready.</h2>
              <p className="mt-2 text-[14px] text-slate-600 leading-relaxed">{BORROWER.applicant} wants {BORROWER.amount} for {BORROWER.name}. CreditDecide reads her file, chases what is missing, and drafts the memo. Your team makes the call.</p>
              <div className="mt-5 flex items-center justify-between">
                <button onClick={() => { setStep(1); setAutoplay(true); }} className="text-[13px] text-slate-500 hover:text-slate-700">▶ or autoplay it</button>
                <button onClick={() => setStep(1)} className="text-sm font-medium text-white px-5 py-2.5 rounded-full" style={{ backgroundColor: GREEN }}>Start demo</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showOverlay && (
        <GuidedOverlay
          n={activeStep.n}
          total={7}
          position={activeStep.pos}
          title={activeStep.title}
          body={activeStep.body}
          bullets={activeStep.bullets}
          tryIt={activeStep.tryIt}
          footer={activeStep.footer}
          cta={activeStep.cta}
          onBack={back}
          onNext={next}
          onClose={closeGuided}
        />
      )}

      {showFinish && (
        <GuidedOverlay
          n={7}
          total={7}
          position="top-right"
          title="Portfolio insights to see what drives approvals, declines and defaults"
          body="Every decision rolls up, so the patterns behind them become visible across the portfolio."
          bullets={["The top drivers behind each decision type", "Policy changes to lift approvals, cut defaults"]}
          cta="Finish the walkthrough"
          onBack={() => { setView("detail"); setTab("creditmemo"); setStep(7); }}
          onNext={() => { setGuided(false); setBookingOpen(true); }}
          onClose={closeGuided}
        />
      )}

      <BookingModal open={bookingOpen} onClose={() => setBookingOpen(false)} />
    </div>
  );
}