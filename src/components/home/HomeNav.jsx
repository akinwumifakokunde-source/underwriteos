import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X, ChevronDown, Globe } from "lucide-react";
import Logo from "@/components/Logo";

const NAV = [
  { to: "/features", label: "Platform" },
  { to: "/mcp", label: "MCP" },
  { to: "/security", label: "Security" },
  { to: "/connect", label: "Connect AI" },
  { to: "/contact", label: "Contact" },
];

export default function HomeNav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/85 dark:bg-slate-950/85 backdrop-blur-md border-b border-[#eceef1] dark:border-slate-800">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 shrink-0" onClick={() => setOpen(false)}>
          <Logo size={30} />
        </Link>

        <nav className="hidden lg:flex items-center gap-1">
          {NAV.map((n, i) => (
            <Link
              key={n.label + i}
              to={n.to}
              className="text-[13px] text-[#444] dark:text-slate-300 hover:text-black dark:hover:text-slate-50 px-3 py-2 rounded-md transition-colors"
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3 sm:gap-4">
          <Link
            to="/start/borrower"
            className="hidden sm:inline-block text-[13px] font-medium text-[#1b1b1b] dark:text-slate-100 hover:text-[#0B3D21] transition-colors"
          >
            Try CreditDecide
          </Link>
          <Link
            to="/demo"
            className="group inline-flex items-center gap-2 text-[13px] font-medium text-white bg-black dark:bg-white dark:text-slate-900 pl-3 pr-4 py-2 rounded-full hover:bg-[#1a1a1a] dark:hover:bg-slate-100 transition-all shadow-sm"
          >
            <span className="w-2 h-2 rounded-full bg-[#2E7D32] group-hover:scale-110 transition-transform" />
            Book a demo
          </Link>
          <button
            onClick={() => setOpen((v) => !v)}
            className="lg:hidden inline-flex items-center justify-center w-9 h-9 rounded-lg text-[#0a0c12] dark:text-slate-50 hover:bg-[#f7f8fa] dark:hover:bg-slate-800 transition-colors"
            aria-label="Toggle menu"
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="lg:hidden border-t border-[#eceef1] dark:border-slate-800 bg-white dark:bg-slate-950">
          <nav className="max-w-6xl mx-auto px-5 py-3 flex flex-col gap-1">
            {NAV.map((n, i) => (
              <Link
                key={n.label + i}
                to={n.to}
                onClick={() => setOpen(false)}
                className="text-sm text-[#444] dark:text-slate-300 hover:text-black dark:hover:text-slate-50 px-3 py-2.5 rounded-md hover:bg-[#f7f8fa] dark:hover:bg-slate-800 transition-colors"
              >
                {n.label}
              </Link>
            ))}
            <Link
              to="/start/borrower"
              onClick={() => setOpen(false)}
              className="text-sm font-medium text-[#0B3D21] px-3 py-2.5 rounded-md hover:bg-[#f7f8fa] dark:hover:bg-slate-800 transition-colors"
            >
              Try CreditDecide
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}