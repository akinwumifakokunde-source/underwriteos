import React, { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Layers, ArrowRight } from "lucide-react";
import { base44 } from "@/api/base44Client";

// public: true  → always visible (no login required)
// public: false → only visible when the user is logged in
const NAV = [
  { to: "/pricing", label: "Pricing", public: true },
  { to: "/security", label: "Security", public: true },
  { to: "/sandbox", label: "Sandbox", public: false },
  { to: "/playground", label: "Playground", public: false },
  { to: "/api-reference", label: "API Reference", public: false },
  { to: "/api-keys", label: "API Keys", public: false },
  { to: "/providers", label: "Providers", public: false },
  { to: "/usage", label: "Usage", public: false },
  { to: "/billing", label: "Billing", public: false },
  { to: "/webhooks", label: "Webhooks", public: false },
  { to: "/members", label: "Members", public: false },
  { to: "/settings", label: "Settings", public: false },
  { to: "/architecture", label: "Architecture", public: false },
  { to: "/docs", label: "Documentation", public: false },
];

export default function HomeNav() {
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    let mounted = true;
    base44.auth.isAuthenticated().then((ok) => mounted && setAuthed(ok)).catch(() => {});
    return () => { mounted = false; };
  }, []);

  const items = NAV.filter((n) => n.public || authed);

  return (
    <header className="sticky top-0 z-40 backdrop-blur bg-[#0a0c12]/80 border-b border-[#1c2029]">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 h-14 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center">
            <Layers className="w-4 h-4 text-[#0a0c12]" />
          </div>
          <span className="font-semibold tracking-tight text-white">GoUnderwriteOS</span>
        </Link>
        <nav className="hidden md:flex items-center gap-1 overflow-x-auto no-scrollbar">
          {items.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              className={({ isActive }) =>
                `shrink-0 text-sm px-3 py-1.5 rounded-md transition-colors ${isActive ? "text-white bg-[#13161f]" : "text-[#a0a5b0] hover:text-white"}`
              }
            >
              {n.label}
            </NavLink>
          ))}
        </nav>
        {authed ? (
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[#0a0c12] bg-white px-3.5 py-2 rounded-lg hover:bg-[#e8eaee] transition-colors"
          >
            Dashboard <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        ) : (
          <Link
            to="/onboarding"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[#0a0c12] bg-white px-3.5 py-2 rounded-lg hover:bg-[#e8eaee] transition-colors"
          >
            Start building <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>
    </header>
  );
}