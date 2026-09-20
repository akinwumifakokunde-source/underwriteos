import React from "react";
import { Link } from "react-router-dom";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQS = [
  {
    q: "Do I need to write code to use CreditDecide?",
    a: "No. Build consumer lending policies visually, publish white-label intake forms, and run underwriting decisions from the workspace — no engineering required. Prefer natural language? CreditDecide speaks MCP, so you can analyse applications, explore the evidence behind a decision and surface risk signals straight from your AI assistant — no code, no copy-paste. A full REST API is also available for teams that want to embed consumer underwriting into their own product.",
  },
  {
    q: "Which markets and currencies are supported?",
    a: "CreditDecide works for consumer lenders in any country. Configure your own currency defaults, regulatory profile, baseline policy and data providers per market — or simply upload borrower documents in any format and decide in your local currency or USD. No geographic limits.",
  },
  {
    q: "Can I bring my own data providers?",
    a: "Yes. Connect credit bureaus and open banking providers per market, or simply upload documents (credit reports, bank statements, payslips, identity). Either path produces the same canonical financial and credit profiles.",
  },
  {
    q: "Does the AI make the final consumer lending decision?",
    a: "No. The AI underwriter produces an advisory recommendation with risk factors, positive signals and an evidence-referenced memo. Your versioned policy engine remains authoritative and produces the final APPROVE, REVIEW or DECLINE decision.",
  },
  {
    q: "Can I use CreditDecide from my AI assistant?",
    a: "Yes. CreditDecide speaks the Model Context Protocol (MCP), so any compatible assistant — Claude, ChatGPT, Gemini, Cursor and more — can retrieve your authorized lending data, analyse applications and explore the evidence behind a decision. Every call runs as you, scoped to your organization's data and within your lender policies — decision-changing actions require explicit confirmation and the whole session is audited.",
  },
  {
    q: "Does CreditDecide cover the whole underwriting flow end to end?",
    a: "Yes. Every application moves through one governed pipeline — borrower intake, document intelligence, data normalization, risk assessment across five dimensions, policy evaluation, an explainable APPROVE / REVIEW / DECLINE decision, and post-decision monitoring that compares predicted default against observed outcomes. Each step is traceable to the next, and every decision is explainable back to its source evidence.",
  },
  {
    q: "How is my data secured and isolated?",
    a: "Every record is organization-scoped with row-level security. Policies are versioned, provider credentials are isolated, and every action is captured in an immutable audit log. Sandbox and production environments are kept strictly separate.",
  },
  {
    q: "How does billing work?",
    a: "Choose a monthly subscription plan (Starter, Growth or Scale) for a recurring credit allowance, or buy one-time credit packs for extra capacity. Every new account receives 1,000 free credits on signup — no card required to start.",
  },
];

export default function Faq() {
  return (
    <section className="border-b border-[#eceef1] bg-gradient-to-b from-[#fafbfc] to-white">
      <div className="max-w-3xl mx-auto px-5 sm:px-8 py-16 sm:py-24">
        <div className="text-center mb-10">
          <p className="text-xs font-mono uppercase tracking-wider text-[#0d9488] mb-3">FAQ</p>
          <h2 className="text-2xl sm:text-4xl font-semibold tracking-tight text-[#0a0c12]">
            Questions, answered.
          </h2>
          <p className="mt-3 text-sm sm:text-base text-[#525965] max-w-xl mx-auto">
            Everything you need to evaluate CreditDecide before you start building.
          </p>
        </div>

        <Accordion type="single" collapsible className="w-full">
          {FAQS.map((f, i) => (
            <AccordionItem
              key={i}
              value={`item-${i}`}
              className="border-[#eceef1] bg-white rounded-2xl mb-3 px-5 sm:px-6 shadow-sm border transition-all duration-300 hover:shadow-md hover:border-[#0d9488]/40"
            >
              <AccordionTrigger className="text-left text-sm sm:text-base font-semibold text-[#0a0c12] hover:no-underline py-5">
                {f.q}
              </AccordionTrigger>
              <AccordionContent className="text-sm text-[#525965] leading-relaxed pb-5">
                {f.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <p className="mt-8 text-center text-sm text-[#8a909c]">
          Still have questions?{" "}
          <Link to="/contact" className="font-medium text-[#0d9488] hover:text-[#0b7d72] transition-colors">
            Talk to our team
          </Link>
        </p>
      </div>
    </section>
  );
}