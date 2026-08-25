import React from "react";
import { Link, NavLink } from "react-router-dom";
import { Layers, LogOut } from "lucide-react";
import { base44 } from "@/api/base44Client";

const NAV = [
  { to: "/dashboard", label: "Dashboard" },
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
  const logout = async () => {
    try {
      await base44.auth.logout("/login");
    } catch {
      window.location.href = "/login";
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#111111] border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-4">
        <Link to="/" className="flex items-center gap-2.5 shrink-0">
          <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center">
            <Layers className="w-4 h-4 text-[#111111]" />
          </div>
          <span className="font-semibold tracking-tight text-white hidden sm:inline">UnderwriteOS</span>
          <span className="text-[10px] font-mono text-[#6b6f76] border border-white/10 rounded px-1.5 py-0.5 hidden sm:inline">v1</span>
        </Link>
        <nav className="flex-1 flex items-center gap-0.5 overflow-x-auto no-scrollbar">
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              className={({ isActive }) =>
                `shrink-0 text-[13px] px-2.5 py-1.5 rounded-md transition-colors ${isActive ? "text-white bg-white/10" : "text-[#a0a4ab] hover:text-white hover:bg-white/5"}`
              }
            >
              {n.label}
            </NavLink>
          ))}
        </nav>
        <button
          onClick={logout}
          className="shrink-0 inline-flex items-center gap-1.5 text-[13px] text-[#a0a4ab] hover:text-white px-2.5 py-1.5 rounded-md hover:bg-white/5 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Log out</span>
        </button>
      </div>
    </header>
  );
}