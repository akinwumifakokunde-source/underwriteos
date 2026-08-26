import React from "react";
import { Link } from "react-router-dom";
import { Layers } from "lucide-react";

const COLS = [
  {
    title: "Product",
    links: [
      { label: "Sandbox", to: "/sandbox" },
      { label: "API Reference", to: "/api-reference" },
      { label: "Documentation", to: "/docs" },
      { label: "Pricing", to: "/pricing" },
    ],
  },
  {
    title: "Company",
    links: [{ label: "Security", to: "/security" }, { label: "Contact", to: "mailto:hello@underwriteos.com" }],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy", to: "#" },
      { label: "Terms", to: "#" },
    ],
  },
  {
    title: "Environment",
    links: [{ label: "Sandbox", to: "/sandbox" }],
  },
];

export default function SiteFooter() {
  return (
    <footer className="border-t border-[#eceef1]">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-12">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8">
          <div className="col-span-2 sm:col-span-3 lg:col-span-1">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-[#0a0c12] flex items-center justify-center">
                <Layers className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold tracking-tight text-[#0a0c12]">UnderwriteOS</span>
            </Link>
            <p className="mt-3 text-sm text-[#8a909c] max-w-xs">Underwriting infrastructure for lenders and fintechs.</p>
          </div>
          {COLS.map((c) => (
            <div key={c.title}>
              <div className="font-mono text-[10px] uppercase tracking-wider text-[#8a909c] mb-3">{c.title}</div>
              <ul className="space-y-2">
                {c.links.map((l) => (
                  <li key={l.label}>
                    <Link to={l.to} className="text-sm text-[#525965] hover:text-[#0a0c12] transition-colors">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </footer>
  );
}