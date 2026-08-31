import React from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Layers, LogOut, ChevronDown, Terminal } from "lucide-react";
import { base44 } from "@/api/base44Client";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

const NAV_ITEMS = [
  { to: "/workspace", label: "Home" },
  { to: "/applications", label: "Applications" },
  { to: "/policies", label: "Policies" },
  { to: "/data-sources", label: "Data Sources" },
  { to: "/reports", label: "Reports" },
];

const SECONDARY_ITEMS = [
  { to: "/forms", label: "Forms" },
  { to: "/batch", label: "Batch" },
  { to: "/risk-signals", label: "Risk Signals" },
  { to: "/decisions", label: "Decisions" },
  { to: "/evidence", label: "Evidence" },
  { to: "/dashboard", label: "Dashboard" },
  { to: "/monitoring", label: "Calibration" },
  { to: "/members", label: "Members" },
  { to: "/billing", label: "Billing" },
  { to: "/settings", label: "Subscription" },
  { to: "/settings", label: "Settings" },
];

const DEVELOPER_ITEMS = [
  { to: "/api-reference", label: "API Reference" },
  { to: "/playground", label: "Playground" },
  { to: "/sandbox", label: "Sandbox" },
  { to: "/api-keys", label: "API Keys" },
  { to: "/webhooks", label: "Webhooks" },
  { to: "/docs", label: "Docs" },
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
    <header className="sticky top-0 z-40 bg-[#0a0c12] border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-3">
        <Link to="/workspace" className="flex items-center gap-2.5 shrink-0">
          <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center">
            <Layers className="w-4 h-4 text-[#0a0c12]" />
          </div>
          <span className="font-semibold tracking-tight text-white hidden sm:inline">CreditDecide</span>
        </Link>

        <nav className="flex-1 flex items-center gap-0.5 overflow-x-auto no-scrollbar">
          {NAV_ITEMS.map((item) => {
            const active = location.pathname === item.to || (item.to !== "/dashboard" && location.pathname.startsWith(item.to));
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={`shrink-0 text-[13px] px-3 py-1.5 rounded-md transition-colors ${active ? "text-white bg-white/10" : "text-[#a0a4ab] hover:text-white hover:bg-white/5"}`}
              >
                {item.label}
              </NavLink>
            );
          })}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="shrink-0 inline-flex items-center gap-1 text-[13px] px-3 py-1.5 rounded-md text-[#a0a4ab] hover:text-white hover:bg-white/5 transition-colors">
                More
                <ChevronDown className="w-3.5 h-3.5 opacity-60" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48 bg-[#1a1c21] border-white/10 text-white">
              <DropdownMenuLabel className="text-[10px] uppercase tracking-wider text-[#6b6f76]">Workspace</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-white/10" />
              {SECONDARY_ITEMS.map((i) => {
                const active = location.pathname === i.to || location.pathname.startsWith(i.to + "/");
                return (
                  <DropdownMenuItem key={i.to} asChild className="focus:bg-white/10 data-[highlighted]:bg-white/10">
                    <NavLink to={i.to} className={`flex items-center justify-between rounded px-2 py-1.5 text-[13px] ${active ? "text-white" : "text-[#a0a4ab]"}`}>
                      <span>{i.label}</span>
                      {active && <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />}
                    </NavLink>
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
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