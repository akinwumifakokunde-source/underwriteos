import React from "react";
import { Link, NavLink } from "react-router-dom";
import { Layers, ArrowRight } from "lucide-react";

const NAV = [
  { to: "/sandbox", label: "Sandbox" },
  { to: "/playground", label: "Playground" },
  { to: "/api-reference", label: "API Reference" },
  { to: "/api-keys", label: "API Keys" },
  { to: "/architecture", label: "Architecture" },
  { to: "/docs", label: "Documentation" },
];

export default function HomeNav() {
  return (
    <header className="sticky top-0 z-40 backdrop-blur bg-[#0a0c12]/80 border-b border-[#1c2029]">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 h-14 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center">
            <Layers className="w-4 h-4 text-[#0a0c12]" />
          </div>
          <span className="font-semibold tracking-tight text-white">UnderwriteOS</span>
          <span className="text-[10px] font-mono text-[#5b6472] border border-[#2a2f3a] rounded px-1.5 py-0.5">v1</span>
        </Link>
        <nav className="hidden md:flex items-center gap-1">
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              className={({ isActive }) =>
                `text-sm px-3 py-1.5 rounded-md transition-colors ${isActive ? "text-white bg-[#13161f]" : "text-[#a0a5b0] hover:text-white"}`
              }
            >
              {n.label}
            </NavLink>
          ))}
        </nav>
        <Link
          to="/onboarding"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[#0a0c12] bg-white px-3.5 py-2 rounded-lg hover:bg-[#e8eaee] transition-colors"
        >
          Start building <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </header>
  );
}