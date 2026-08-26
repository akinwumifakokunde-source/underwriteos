import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Layers, ArrowRight } from "lucide-react";
import { base44 } from "@/api/base44Client";

const NAV = [
  { to: "/docs", label: "Docs" },
  { to: "/pricing", label: "Pricing" },
  { to: "/security", label: "Security" },
];

export default function HomeNav() {
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    let mounted = true;
    base44.auth.isAuthenticated().then((ok) => mounted && setAuthed(ok)).catch(() => {});
    return () => { mounted = false; };
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-[#eceef1]">
      <div className="max-w-5xl mx-auto px-5 sm:px-8 h-14 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 shrink-0">
          <div className="w-6 h-6 rounded-md bg-[#0a0c12] flex items-center justify-center">
            <Layers className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-semibold tracking-tight text-[#0a0c12]">UnderwriteOS</span>
          <span className="text-[10px] font-mono text-[#8a909c] border border-[#e6e8eb] rounded px-1.5 py-0.5">v1</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="text-sm text-[#525965] hover:text-[#0a0c12] px-3 py-1.5 rounded-md transition-colors"
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1 sm:gap-2">
          <Link
            to="/login"
            className="text-sm text-[#525965] hover:text-[#0a0c12] px-3 py-1.5 rounded-md transition-colors"
          >
            Sign in
          </Link>
          <Link
            to="/onboarding"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-white bg-[#0a0c12] px-3.5 py-2 rounded-md hover:bg-[#1c1f26] transition-colors"
          >
            Start building <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </header>
  );
}