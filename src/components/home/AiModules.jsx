import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import {
  UnderwriterMock,
  CreditOfficerMock,
  RiskScoreMock,
  CaptureMock,
} from "@/components/home/ai-modules/Mockups.jsx";

// The four AI product modules — each with a short pitch, a headline stat, a
// "learn more" link, and a live product mockup. Layout alternates side per row.
const MODULES = [
  {
    num: "01",
    name: "AI Underwriter",
    tag: "Your best credit officer's judgment, on every file.",
    desc: "Reads the whole file — from tax returns to a photographed ledger — plus bank and external data. Spreads the financials, tests them against your credit policy, and drafts the memo. Every figure links to the page it came from. Your credit officer makes the call.",
    stat: "5 min",
    statLabel: "avg time to draft memo",
    cta: "See AI Underwriter",
    to: "/features/ai-underwriting",
    Mock: UnderwriterMock,
  },
  {
    num: "02",
    name: "AI Credit Officer",
    tag: "Chases the paperwork so your team doesn't.",
    desc: "Messages each borrower the minute they apply — on WhatsApp, SMS or email, in their own language. Asks for the exact documents the loan needs and keeps following up until the file is complete.",
    stat: "24/7",
    statLabel: "borrower follow-up",
    cta: "See AI Credit Officer",
    to: "/start/borrower",
    Mock: CreditOfficerMock,
  },
  {
    num: "03",
    name: "CreditDecide Risk Score",
    tag: "A credit signal where the bureau has none.",
    desc: "Built for high-volume consumer lending in thin-file markets. Scores repayment risk from the documents a borrower uploads and how they submit them. Feeds your existing model as one more input.",
    stat: "10",
    statLabel: "repayment signals scored",
    cta: "See Risk Score",
    to: "/features/ai-underwriting",
    Mock: RiskScoreMock,
  },
  {
    num: "04",
    name: "CreditDecide Capture",
    tag: "Reads the documents other tools reject.",
    desc: "Crumpled payslips, e-wallet screenshots, scanned bank statements. Capture extracts every field, then checks the document itself for edits, forgery and numbers that do not agree.",
    stat: "12+",
    statLabel: "field types extracted",
    cta: "See Capture",
    to: "/features/document-intelligence",
    Mock: CaptureMock,
  },
];

export default function AiModules() {
  return (
    <section className="relative overflow-hidden border-b border-[#eceef1] dark:border-slate-800 bg-white dark:bg-slate-950">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-20 sm:py-24">
        <div className="max-w-3xl mb-14">
          <p className="text-xs font-mono uppercase tracking-wider mb-3">
            <span className="bg-gradient-to-r from-teal-500 to-emerald-500 dark:from-teal-300 dark:to-emerald-400 bg-clip-text text-transparent">
              The AI underwriting stack
            </span>
          </p>
          <h2 className="text-2xl sm:text-4xl font-semibold tracking-tight text-[#0a0c12] dark:text-slate-50 leading-tight">
            AI that lets you scale loan volume, engage more customers, and lower risk.
          </h2>
          <p className="mt-5 text-base text-[#525965] dark:text-slate-300 leading-relaxed">
            Your most tenured credit officer can open a borrower file and see in minutes where it is weak. AI Underwriter brings that judgment to every file, against your own credit policy. It reads whatever the borrower sends, pulls in external data, and hands your team a credit memo with every number traced to its source.
          </p>
        </div>

        <div className="space-y-16 sm:space-y-24">
          {MODULES.map((m, i) => {
            const Mock = m.Mock;
            const flip = i % 2 === 1;
            return (
              <div key={m.num} className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                <div className={flip ? "lg:order-2" : ""}>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl font-bold bg-gradient-to-br from-[#0d9488] to-emerald-600 bg-clip-text text-transparent">{m.num}</span>
                    <h3 className="text-xl sm:text-2xl font-semibold text-[#0a0c12] dark:text-slate-50">{m.name}</h3>
                  </div>
                  <p className="text-sm font-medium text-[#0d9488] dark:text-teal-400 mb-3">{m.tag}</p>
                  <p className="text-[13px] sm:text-sm text-[#525965] dark:text-slate-300 leading-relaxed mb-5">{m.desc}</p>
                  <div className="mb-5">
                    <div className="text-2xl font-bold text-[#0a0c12] dark:text-slate-50">{m.stat}</div>
                    <div className="text-[10px] font-mono uppercase tracking-wider text-[#8a909c] dark:text-slate-500">{m.statLabel}</div>
                  </div>
                  <Link to={m.to} className="inline-flex items-center gap-1 text-sm font-medium text-[#0d9488] dark:text-teal-400 hover:gap-2 transition-all">
                    {m.cta} <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
                <div className={flip ? "lg:order-1" : ""}>
                  <Mock />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}