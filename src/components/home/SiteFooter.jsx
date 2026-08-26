import React from "react";
import { Link } from "react-router-dom";

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
    links: [{ label: "Security", to: "/security" }, { label: "Contact", to: "/contact" }],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy", to: "/privacy" },
      { label: "Terms", to: "/terms" },
    ],
  },
  {
    title: "Environment",
    links: [{ label: "Sandbox", to: "/sandbox" }],
  },
];

export default function SiteFooter() {
  return (
    <footer className="border-t border-[#eceef1] bg-white">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-12">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
          {COLS.map((c) => (
            <div key={c.title}>
              <div className="text-[11px] uppercase tracking-wider text-[#94A3B8] mb-4">{c.title}</div>
              <ul className="space-y-2.5">
                {c.links.map((l) => (
                  <li key={l.label}>
                    <Link to={l.to} className="text-sm text-[#475569] hover:text-[#0a0c12] transition-colors">
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