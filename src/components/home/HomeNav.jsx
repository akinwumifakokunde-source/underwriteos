import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Menu, X } from "lucide-react";
import Logo from "@/components/Logo";
import { base44 } from "@/api/base44Client";

const NAV = [
  { to: "/insights", label: "Insights" },
  { to: "/pricing", label: "Pricing" },
  { to: "/security", label: "Security" },
  { to: "/contact", label: "Contact" },
];

export default function HomeNav() {
  const [authed, setAuthed] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let mounted = true;
    base44.auth.isAuthenticated().then((ok) => mounted && setAuthed(ok)).catch(() => {});
    return () => { mounted = false; };
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-[#eceef1]">
      <div className="max-w-5xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 shrink-0" onClick={() => setOpen(false)}>
          <Logo size={32} />
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="text-sm text-[#525965] hover:text-[#0a0c12] px-3 py-2 rounded-md transition-colors"
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1 sm:gap-2">
          <Link
            to="/login"
            className="hidden sm:inline-block text-sm text-[#525965] hover:text-[#0a0c12] px-3 py-2 rounded-md transition-colors"
          >
            Sign in
          </Link>
          <Link
            to="/onboarding"
            className="group inline-flex items-center gap-1.5 text-sm font-medium text-white bg-[#0a0c12] px-4 py-2 rounded-lg hover:bg-[#1c1f26] transition-all shadow-sm hover:shadow-md"
          >
            <span className="hidden sm:inline">Start building</span>
            <span className="sm:hidden">Start</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
          <button
            onClick={() => setOpen((v) => !v)}
            className="md:hidden ml-1 inline-flex items-center justify-center w-9 h-9 rounded-lg text-[#0a0c12] hover:bg-[#f7f8fa] transition-colors"
            aria-label="Toggle menu"
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-[#eceef1] bg-white">
          <nav className="max-w-5xl mx-auto px-5 py-3 flex flex-col gap-1">
            {NAV.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setOpen(false)}
                className="text-sm text-[#525965] hover:text-[#0a0c12] px-3 py-2.5 rounded-md hover:bg-[#f7f8fa] transition-colors"
              >
                {n.label}
              </Link>
            ))}
            <Link
              to="/login"
              onClick={() => setOpen(false)}
              className="text-sm text-[#525965] hover:text-[#0a0c12] px-3 py-2.5 rounded-md hover:bg-[#f7f8fa] transition-colors"
            >
              Sign in
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}