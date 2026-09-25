import React from "react";
import { Link } from "react-router-dom";
import { Linkedin } from "lucide-react";
import Logo from "@/components/Logo";

const COLS = [
  {
    title: "Platform",
    links: [
      { to: "/features/ai-underwriting", label: "AI Underwriter" },
      { to: "/features/document-intelligence", label: "AI Credit Officer" },
      { to: "/features/lending-policies", label: "Policy Builder" },
      { to: "/features/document-intelligence", label: "Capture" },
      { to: "/features/lending-policies", label: "Risk Score" },
      { to: "/features/ai-underwriting", label: "Application Forms" },
      { to: "/start/borrower", label: "Borrower Portal" },
    ],
  },
  {
    title: "Markets",
    links: [
      { to: "/features", label: "United Kingdom" },
      { to: "/features", label: "United States" },
      { to: "/features", label: "Nigeria" },
      { to: "/features", label: "South Africa" },
      { to: "/features", label: "Kenya" },
      { to: "/features", label: "Ghana" },
      { to: "/features", label: "Others" },
    ],
  },
  {
    title: "Company",
    links: [
      { to: "/about", label: "About" },
      { to: "/insights", label: "Insights" },
      { to: "/connect", label: "Connect AI" },
      { to: "/contact", label: "Contact" },
    ],
  },
  {
    title: "Resources",
    links: [
      { to: "/api-reference", label: "Documentation" },
      { to: "/security", label: "Security" },
      { to: "/privacy", label: "Privacy" },
      { to: "/terms", label: "Terms" },
    ],
  },
];

export default function SiteFooter() {
  return (
    <footer className="bg-[#0A0A0A] text-white">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 pt-16 sm:pt-20 pb-8">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-10 gap-y-12">
          {/* Brand block */}
          <div className="col-span-2 md:col-span-2">
            <Link to="/" className="flex items-center gap-2.5">
              <Logo size={26} tone="dark" />
            </Link>
            <p className="mt-4 text-sm text-[#808080] leading-relaxed max-w-xs">
              The AI-native underwriting operating system for consumer lenders.
              Built for personal loans, instalment and point-of-sale — deployed across markets.
            </p>
            <a
              href="https://www.linkedin.com/company/creditdecide/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="CreditDecide on LinkedIn"
              className="mt-5 inline-flex items-center justify-center w-9 h-9 rounded-lg border border-[#1A1A1A] text-[#808080] hover:text-white hover:border-[#333] transition-colors"
            >
              <Linkedin className="w-4 h-4" />
            </a>
          </div>

          {/* Link columns */}
          {COLS.map((c) => (
            <div key={c.title}>
              <h4 className="text-[11px] font-mono uppercase tracking-[0.18em] text-[#808080] mb-4">
                {c.title}
              </h4>
              <ul className="space-y-2.5">
                {c.links.map((l) => (
                  <li key={l.label + l.to}>
                    <Link
                      to={l.to}
                      className="text-sm text-white/90 hover:text-[#34d399] transition-colors"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* separator + bottom row */}
        <div className="mt-14 pt-6 border-t border-[#1A1A1A] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#808080]">
          <p>© {new Date().getFullYear()} CreditDecide. All rights reserved.</p>
          <p className="font-mono uppercase tracking-wider">Built for consumer lenders worldwide</p>
        </div>
      </div>
    </footer>
  );
}