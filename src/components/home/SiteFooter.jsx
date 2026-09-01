import React from "react";
import { Link } from "react-router-dom";
import { Linkedin } from "lucide-react";
import Logo from "@/components/Logo";

const COLS = [
  {
    title: "Product",
    links: [
      { to: "/features/lending-policies", label: "Policy Builder" },
      { to: "/features/ai-underwriting", label: "Applications" },
      { to: "/features/document-intelligence", label: "Data Sources" },
      { to: "/features", label: "Capabilities" },
      { to: "/about", label: "About" },
      { to: "/pricing", label: "Pricing" },
    ],
  },
  {
    title: "Company",
    links: [
      { to: "/security", label: "Security" },
      { to: "/contact", label: "Contact" },
    ],
  },
  {
    title: "Legal",
    links: [
      { to: "/privacy", label: "Privacy" },
      { to: "/terms", label: "Terms" },
    ],
  },
];

export default function SiteFooter() {
  return (
    <footer className="bg-white">
      <div className="max-w-5xl mx-auto px-5 sm:px-8 py-12 pb-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 gap-y-10">
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2.5">
              <Logo size={24} />
            </Link>
            <p className="mt-3 text-sm text-[#8a909c] leading-relaxed">
              AI-native underwriting and credit decisioning for modern lenders. Automate applications, configure policies, and make smarter, explainable decisions across six markets.
            </p>
          </div>

          {COLS.map((c) => (
            <div key={c.title}>
              <h4 className="text-[11px] font-mono uppercase tracking-wider text-[#8a909c] mb-3">{c.title}</h4>
              <ul className="space-y-2">
                {c.links.map((l) => (
                  <li key={l.to}>
                    <Link to={l.to} className="text-sm text-[#525965] hover:text-[#0a0c12] transition-colors">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-6 border-t border-[#eceef1] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <p className="text-xs text-[#8a909c]">© {new Date().getFullYear()} CreditDecide</p>
            <a
              href="https://www.linkedin.com/company/creditdecide/?viewAsMember=true"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="CreditDecide on LinkedIn"
              className="text-[#8a909c] hover:text-[#0a76b1] transition-colors"
            >
              <Linkedin className="w-4 h-4" />
            </a>
          </div>
          <p className="text-xs text-[#8a909c] text-center sm:text-right max-w-md">No-code underwriting · AI-assisted risk analysis · Policy engine · Evidence lineage · Reporting &amp; exports</p>
        </div>

        <div className="mt-8 flex flex-col items-center justify-center gap-2 text-center text-[11px] text-[#8a909c] sm:flex-row sm:gap-2 sm:text-left">
          <span className="inline-flex items-center gap-1.5">
            <span className="text-base leading-none">🌍</span>
            Built for modern lenders across the United States, United Kingdom &amp; Africa
          </span>
          <span className="hidden sm:inline text-[#d4d7dd]">·</span>
          <span className="font-medium text-[#525965]">The underwriting operating system — go.</span>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-center text-[11px] text-[#8a909c] sm:justify-start sm:text-left">
          <span className="font-mono uppercase tracking-wider text-[#8a909c]">Our HQ</span>
          <span className="text-[#d4d7dd]">·</span>
          <span className="text-[#525965]">San Francisco</span>
          <span className="text-[#d4d7dd]">·</span>
          <span className="text-[#525965]">London</span>
          <span className="text-[#d4d7dd]">·</span>
          <span className="text-[#525965]">Lagos</span>
          <span className="text-[#d4d7dd]">·</span>
          <span className="text-[#525965]">Nairobi</span>
        </div>
      </div>
    </footer>
  );
}