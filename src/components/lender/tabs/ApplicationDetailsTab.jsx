import React from "react";
import { BORROWER } from "../data";

export default function ApplicationDetailsTab() {
  const rows = [
    ["Borrower", BORROWER.name],
    ["Applicant", BORROWER.applicant],
    ["Loan type", BORROWER.loanType],
    ["Loan request", BORROWER.amount],
    ["App ID", BORROWER.appId],
    ["Loan officer", BORROWER.officer],
    ["Last activity", BORROWER.lastActivity],
    ["Status", BORROWER.status],
  ];
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <h3 className="text-sm font-semibold text-slate-900 mb-4">Application Details</h3>
      <div className="grid sm:grid-cols-2 gap-x-8 gap-y-0">
        {rows.map(([k, v]) => (
          <div key={k} className="flex items-center justify-between border-b border-slate-100 py-2.5">
            <span className="text-[12px] text-slate-400">{k}</span>
            <span className="text-[13px] font-medium text-slate-800">{v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}