import React from "react";
import { Search, SlidersHorizontal, MoreHorizontal } from "lucide-react";
import { GREEN } from "./data";

const statusStyle = (s) => {
  if (s === "COLLECTING") return "bg-[#f9f0c7] text-[#8a6d1f]";
  if (s === "FOR REVIEW") return "bg-[#d1e2f7] text-[#2b5ea7]";
  return "bg-slate-100 text-slate-600";
};

export default function ApplicationsPipeline({ rows, onOpenRow, highlightId }) {
  return (
    <div className="max-w-6xl mx-auto px-5 sm:px-8 py-8">
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input placeholder="Search borrowers..." className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-200 bg-white text-slate-700 placeholder-slate-400 focus:outline-none focus:border-slate-300" />
        </div>
        <button className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50">
          <SlidersHorizontal className="w-4 h-4" />
        </button>
      </div>
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr className="text-left text-[11px] font-mono uppercase tracking-wider text-slate-400">
                <th className="px-4 py-3 font-medium">Borrower</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Loan type</th>
                <th className="px-4 py-3 font-medium">Loan officer</th>
                <th className="px-4 py-3 font-medium">Last activity</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((r) => (
                <tr
                  key={r.id}
                  onClick={() => onOpenRow(r)}
                  className={`cursor-pointer transition-colors ${highlightId === r.id ? "bg-[#eef6ee]" : "hover:bg-slate-50"}`}
                >
                  <td className="px-4 py-3.5">
                    <div className="font-medium text-slate-900">{r.borrower}</div>
                    <div className="text-[12px] text-slate-400">{r.applicant}{r.appId ? ` · ${r.appId}` : ""}</div>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-full ${statusStyle(r.status)}`}>{r.status}</span>
                  </td>
                  <td className="px-4 py-3.5 text-slate-600">{r.loanType}</td>
                  <td className="px-4 py-3.5 text-slate-600">{r.officer}</td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${r.progress}%`, backgroundColor: GREEN }} />
                      </div>
                      <span className="text-[12px] text-slate-400">{r.activity}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-right"><MoreHorizontal className="w-4 h-4 text-slate-400 inline" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}