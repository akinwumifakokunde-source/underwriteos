import React from "react";
import { Link } from "react-router-dom";
import {
  MousePointerClick, FlaskConical, Users, Settings as SettingsIcon,
  KeyRound, Link2, Terminal, Webhook, ArrowRight,
} from "lucide-react";

const GROUPS = [
  {
    label: "No code",
    items: [
      { to: "/underwrite", label: "Underwrite", desc: "Run a decision without code", icon: MousePointerClick },
      { to: "/sandbox", label: "Sandbox", desc: "Test the full pipeline", icon: FlaskConical },
      { to: "/members", label: "Members", desc: "Invite your team", icon: Users },
      { to: "/settings", label: "Settings", desc: "Workspace configuration", icon: SettingsIcon },
    ],
  },
  {
    label: "API integration",
    items: [
      { to: "/api-keys", label: "API Keys", desc: "Create & manage keys", icon: KeyRound },
      { to: "/providers", label: "Providers", desc: "Connect bureaus & banks", icon: Link2 },
      { to: "/playground", label: "Playground", desc: "Try live endpoints", icon: Terminal },
      { to: "/webhooks", label: "Webhooks", desc: "Event delivery", icon: Webhook },
    ],
  },
];

export default function QuickLinks() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {GROUPS.map((g) => (
        <div key={g.label} className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">{g.label}</h3>
            <span className="text-[11px] text-slate-300">{g.items.length} shortcuts</span>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            {g.items.map((i) => {
              const Icon = i.icon;
              return (
                <Link
                  key={i.to}
                  to={i.to}
                  className="group flex items-start gap-2.5 rounded-lg border border-slate-100 p-3 hover:border-slate-300 hover:bg-slate-50 transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 group-hover:bg-white">
                    <Icon className="w-4 h-4 text-slate-600" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-slate-900 flex items-center gap-1">
                      {i.label}
                      <ArrowRight className="w-3 h-3 text-slate-300 group-hover:text-slate-500 transition-colors" />
                    </div>
                    <div className="text-[11px] text-slate-400 truncate">{i.desc}</div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}