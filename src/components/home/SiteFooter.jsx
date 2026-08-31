import React from "react";
import { Link } from "react-router-dom";
import { Layers } from "lucide-react";

const COLS = [
  {
    title: "Product",
    links: [
      { to: "/policies", label: "Policy Builder" },
      { to: "/applications", label: "Applications" },
      { to: "/data-sources", label: "Data Sources" },
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
              <div className="w-6 h-6 rounded-md bg-[#0a0c12] flex items-center justify-center">
                <Layers className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-semibold tracking-tight text-[#0a0c12]">CreditDecide</span>
            </Link>
            <p className="mt-3 text-sm text-[#8a909c] leading-relaxed">
              The AI-native underwriting platform for lenders and fintechs. Automate applications, configure policies, and make smarter, explainable decisions across six markets.
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
          <p className="text-xs text-[#8a909c]">© {new Date().getFullYear()} CreditDecide</p>
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
      </div>
    </footer>
  );
}