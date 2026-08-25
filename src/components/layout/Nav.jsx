import React from "react";
import { Link, NavLink } from "react-router-dom";
import { Layers, ArrowRight } from "lucide-react";

const NAV = [
  { to: "/sandbox", label: "Sandbox" },
  { to: "/playground", label: "Playground" },
  { to: "/api-reference", label: "API Reference" },
  { to: "/api-keys", label: "API Keys" },
  { to: "/providers", label: "Providers" },
  { to: "/usage", label: "Usage" },
  { to: "/billing", label: "Billing" },
  { to: "/webhooks", label: "Webhooks" },
  { to: "/members", label: "Members" },
  { to: "/settings", label: "Settings" },
  { to: "/architecture", label: "Architecture" },
  { to: "/docs", label: "Documentation" },
];

export default function Nav() {
  return (
    <header className="sticky top-0 z-40 backdrop-blur bg-white/80 border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 h-14 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-slate-900 flex items-center justify-center">
            <Layers className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold tracking-tight text-slate-900">UnderwriteOS</span>
          <span className="text-[10px] font-mono text-slate-400 border border-slate-200 rounded px-1.5 py-0.5">v1</span>
        </Link>
        <nav className="hidden md:flex items-center gap-1">
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              className={({ isActive }) =>
                `text-sm px-3 py-1.5 rounded-md transition-colors ${isActive ? "text-slate-900 bg-slate-100" : "text-slate-500 hover:text-slate-900"}`
              }
            >
              {n.label}
            </NavLink>
          ))}
        </nav>
        <Link
          to="/onboarding"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-white bg-slate-900 px-3.5 py-2 rounded-lg hover:bg-slate-800 transition-colors"
        >
          Start building <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </header>
  );
}