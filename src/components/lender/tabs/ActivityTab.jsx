import React from "react";
import { CheckCircle2 } from "lucide-react";
import { GREEN, BORROWER } from "../data";

const EVENTS = [
  { t: "just now", text: "Credit memo drafted — 9 sections" },
  { t: "8d ago", text: "All required documents accepted" },
  { t: "8d ago", text: "Application moved to For Review" },
  { t: "9d ago", text: `${BORROWER.applicant} submitted the application` },
];

export default function ActivityTab() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <h3 className="text-sm font-semibold text-slate-900 mb-4">Activity</h3>
      <ol className="space-y-4 relative">
        <span className="absolute left-[11px] top-2 bottom-2 w-px bg-slate-200" />
        {EVENTS.map((e, i) => (
          <li key={i} className="flex gap-3 relative">
            <span className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-3.5 h-3.5" style={{ color: GREEN }} />
            </span>
            <div>
              <div className="text-[13px] text-slate-800">{e.text}</div>
              <div className="text-[11px] text-slate-400">{e.t}</div>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}