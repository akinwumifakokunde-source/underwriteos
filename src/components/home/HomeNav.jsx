import React, { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Layers, ArrowRight, Menu } from "lucide-react";
import { base44 } from "@/api/base44Client";

const LINKS = [
  { to: "/docs", label: "Docs" },
  { to: "/pricing", label: "Pricing" },
];

export default function HomeNav() {
  const [authed, setAuthed] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let m = true;
    base44.auth.isAuthenticated().then((ok) => m && setAuthed(ok)).catch(() => {});
    return () => { m = false; };
  }, []);

  return (
    <header className="sticky top-0 z-40 backdrop-blur bg-white/80 border-b border-[#eceef1]">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 h-14 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-[#0a0c12] flex items-center justify-center">
            <Layers className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold tracking-tight text-[#0a0c12]">UnderwriteOS</span>
          <span className="text-[10px] font-mono text-[#8a909c] border border-[#e5e7eb] rounded px-1.5 py-0.5">v1</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `text-sm px-3 py-1.5 rounded-md transition-colors ${isActive ? "text-[#0a0c12] bg-[#f2f3f5]" : "text-[#525965] hover:text-[#0a0c12]"}`
              }
            >
              {l.label}
            </NavLink>
          ))}
          <Link to={authed ? "/dashboard" : "/login"} className="text-sm px-3 py-1.5 rounded-md text-[#525965] hover:text-[#0a0c12] transition-colors">
            {authed ? "Dashboard" : "Sign in"}
          </Link>
          <Link
            to="/onboarding"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-white bg-[#0a0c12] px-3.5 py-2 rounded-lg hover:bg-[#1c1f26] transition-colors ml-2"
          >
            Start building <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </nav>

        <div className="md:hidden flex items-center gap-2">
          <Link to="/onboarding" className="inline-flex items-center gap-1.5 text-sm font-medium text-white bg-[#0a0c12] px-3 py-1.5 rounded-lg">
            Start building <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <button onClick={() => setOpen((v) => !v)} className="p-1.5 text-[#525965] hover:text-[#0a0c12]" aria-label="Menu">
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-[#eceef1] bg-white px-5 py-3">
          <div className="flex flex-col">
            {LINKS.map((l) => (
              <NavLink key={l.to} to={l.to} onClick={() => setOpen(false)} className="text-sm py-2.5 text-[#525965] hover:text-[#0a0c12]">
                {l.label}
              </NavLink>
            ))}
            <Link to={authed ? "/dashboard" : "/login"} onClick={() => setOpen(false)} className="text-sm py-2.5 text-[#525965] hover:text-[#0a0c12]">
              {authed ? "Dashboard" : "Sign in"}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}