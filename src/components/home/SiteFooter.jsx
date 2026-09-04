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
      { to: "/insights", label: "Insights" },
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
    <footer className="relative overflow-hidden bg-white">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#0d9488] to-transparent" />
      <div className="absolute -top-20 left-1/4 w-[360px] h-[360px] bg-[#0d9488]/8 rounded-full blur-3xl animate-pulse" />
      <div className="absolute -bottom-16 right-1/4 w-[300px] h-[300px] bg-indigo-400/8 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "2s" }} />
      <div className="relative max-w-5xl mx-auto px-5 sm:px-8 py-12 pb-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 gap-y-10">
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2.5">
              <Logo size={24} />
            </Link>
            <p className="mt-3 text-sm text-[#8a909c] leading-relaxed">
              AI-native underwriting and credit decisioning for modern lenders. Automate applications, configure policies, and make smarter, explainable decisions — anywhere in the world.
            </p>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {["No-code", "AI-assisted", "Multi-market"].map((t) => (
                <span key={t} className="text-[10px] font-medium text-[#0d9488] bg-[#0d9488]/10 border border-[#0d9488]/20 rounded-full px-2 py-0.5">{t}</span>
              ))}
            </div>
          </div>

          {COLS.map((c) => (
            <div key={c.title}>
              <h4 className="text-[11px] font-mono uppercase tracking-wider text-[#8a909c] mb-3 flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-gradient-to-br from-teal-400 to-indigo-500" /> {c.title}
              </h4>
              <ul className="space-y-2">
                {c.links.map((l) => (
                  <li key={l.to}>
                    <Link to={l.to} className="group relative text-sm text-[#525965] transition-all duration-200 hover:text-[#0a0c12] hover:translate-x-0.5 inline-block">
                      {l.label}
                      <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-gradient-to-r from-teal-500 to-indigo-500 transition-all duration-300 group-hover:w-full" />
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
              className="text-[#8a909c] hover:text-[#0a76b1] hover:scale-125 transition-all duration-300"
            >
              <Linkedin className="w-4 h-4" />
            </a>
          </div>
          <p className="text-xs text-[#8a909c] text-center sm:text-right max-w-md">
            <span className="bg-gradient-to-r from-teal-600 to-indigo-600 bg-clip-text text-transparent font-medium">No-code underwriting</span>
            {" · "}AI-assisted risk analysis · Policy engine · Evidence lineage · Reporting &amp; exports
          </p>
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