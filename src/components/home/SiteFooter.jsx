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
      <div className="max-w-5xl mx-auto px-5 sm:px-8 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-md bg-[#0a0c12] flex items-center justify-center">
                <Layers className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-semibold tracking-tight text-[#0a0c12]">UnderwriteOS</span>
            </Link>
            <p className="mt-3 text-sm text-[#8a909c] leading-relaxed">
              Continuous, AI-native underwriting for lenders and fintechs — across six markets.
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

        <div className="mt-10 pt-6 border-t border-[#eceef1] flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-[#8a909c]">© {new Date().getFullYear()} UnderwriteOS</p>
          <p className="text-xs text-[#8a909c]">Live data sources · 5 risk dimensions · Evidence lineage · PDF / CSV / Word exports</p>
        </div>
      </div>
    </footer>
  );
}