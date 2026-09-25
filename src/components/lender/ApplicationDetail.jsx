import React from "react";
import { BORROWER, GREEN } from "./data";
import ApplicationDetailsTab from "./tabs/ApplicationDetailsTab";
import DocumentsTab from "./tabs/DocumentsTab";
import CreditMemoTab from "./tabs/CreditMemoTab";
import ConversationTab from "./tabs/ConversationTab";
import ActivityTab from "./tabs/ActivityTab";

const TABS = [
  { key: "details", label: "Application Details" },
  { key: "documents", label: "Documents", count: 11 },
  { key: "creditmemo", label: "Credit Memo" },
  { key: "conversation", label: "Conversation" },
  { key: "activity", label: "Activity" },
];

export default function ApplicationDetail({ tab, setTab, step }) {
  const revealed = step >= 4 ? 6 : 3;
  return (
    <div className="max-w-6xl mx-auto px-5 sm:px-8 py-6">
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-lg font-semibold text-slate-900">{BORROWER.name}</h1>
            <p className="text-[13px] text-slate-500">{BORROWER.applicant} · {BORROWER.loanType}</p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-[#d1e2f7] text-[#2b5ea7]">FOR REVIEW</span>
            <button className="text-[12px] font-medium px-3 py-1.5 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50">Handoff note</button>
            <span className="text-[15px] font-semibold text-slate-900">{BORROWER.amount}</span>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-4 text-[12px]">
          <div><div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Loan officer</div><div className="text-slate-700 mt-0.5">{BORROWER.officer}</div></div>
          <div><div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Last activity</div><div className="text-slate-700 mt-0.5">{BORROWER.lastActivity}</div></div>
          <div><div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">App ID</div><div className="text-slate-700 mt-0.5 font-mono">{BORROWER.appId}</div></div>
        </div>
      </div>

      <div className="mt-5 flex items-center gap-1 border-b border-slate-200 overflow-x-auto no-scrollbar">
        {TABS.map((t) => {
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px whitespace-nowrap transition-colors"
              style={active ? { borderColor: GREEN, color: "#111827" } : { borderColor: "transparent", color: "#6b7280" }}
            >
              {t.label}{t.count ? <span className="text-[11px] text-slate-400"> ({t.count})</span> : null}
            </button>
          );
        })}
      </div>

      <div className="mt-5">
        {tab === "details" && <ApplicationDetailsTab />}
        {tab === "documents" && <DocumentsTab />}
        {tab === "creditmemo" && <CreditMemoTab step={step} />}
        {tab === "conversation" && <ConversationTab revealed={revealed} />}
        {tab === "activity" && <ActivityTab />}
      </div>
    </div>
  );
}