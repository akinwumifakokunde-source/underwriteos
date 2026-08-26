import React from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Layers, LogOut, ChevronDown, Code2, MousePointerClick } from "lucide-react";
import { base44 } from "@/api/base44Client";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

const GROUPS = [
  {
    label: "No code",
    icon: MousePointerClick,
    items: [
      { to: "/dashboard", label: "Dashboard" },
      { to: "/underwrite", label: "Underwrite" },
      { to: "/sandbox", label: "Sandbox" },
      { to: "/members", label: "Members" },
      { to: "/settings", label: "Settings" },
    ],
  },
  {
    label: "API integration",
    icon: Code2,
    items: [
      { to: "/playground", label: "Playground" },
      { to: "/api-reference", label: "API Reference" },
      { to: "/api-keys", label: "API Keys" },
      { to: "/providers", label: "Providers" },
      { to: "/webhooks", label: "Webhooks" },
      { to: "/usage", label: "Usage" },
      { to: "/billing", label: "Billing" },
      { to: "/architecture", label: "Architecture" },
      { to: "/docs", label: "Documentation" },
    ],
  },
];

export default function Nav() {
  const location = useLocation();

  const logout = async () => {
    try {
      await base44.auth.logout("/login");
    } catch {
      window.location.href = "/login";
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#111111] border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-3">
        <Link to="/" className="flex items-center gap-2.5 shrink-0">
          <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center">
            <Layers className="w-4 h-4 text-[#111111]" />
          </div>
          <span className="font-semibold tracking-tight text-white hidden sm:inline">UnderwriteOS</span>
          <span className="text-[10px] font-mono text-[#6b6f76] border border-white/10 rounded px-1.5 py-0.5 hidden sm:inline">v1</span>
        </Link>

        <nav className="flex-1 flex items-center gap-2">
          {GROUPS.map((g) => {
            const Icon = g.icon;
            const groupActive = g.items.some((i) => location.pathname.startsWith(i.to));
            return (
              <DropdownMenu key={g.label}>
                <DropdownMenuTrigger asChild>
                  <button
                    className={`inline-flex items-center gap-1.5 text-[13px] px-3 py-1.5 rounded-md transition-colors ${groupActive ? "text-white bg-white/10" : "text-[#a0a4ab] hover:text-white hover:bg-white/5"}`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">{g.label}</span>
                    <ChevronDown className="w-3.5 h-3.5 opacity-60" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56 bg-[#1a1c21] border-white/10 text-white">
                  <DropdownMenuLabel className="text-[10px] uppercase tracking-wider text-[#6b6f76]">{g.label}</DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-white/10" />
                  {g.items.map((i) => {
                    const active = location.pathname === i.to;
                    return (
                      <DropdownMenuItem key={i.to} asChild className="focus:bg-white/10 data-[highlighted]:bg-white/10">
                        <NavLink to={i.to} className={`flex items-center justify-between rounded px-2 py-1.5 text-[13px] ${active ? "text-white" : "text-[#a0a4ab]"}`}>
                          <span>{i.label}</span>
                          {active && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />}
                        </NavLink>
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
            );
          })}
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