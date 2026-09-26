import React from "react";
import { getPolicyLabel } from "@/lib/jurisdictions";

const FOREST = "#0B3D21";

function statusBadge(app, decision) {
  if (decision?.decision === "APPROVE") return { label: "APPROVED", bg: "#E8F5E9", color: "#1B5E20" };
  if (decision?.decision === "DECLINE") return { label: "DECLINED", bg: "#FDECEA", color: "#B71C1C" };
  if (decision?.human_review_required || decision?.decision === "REVIEW") return { label: "FOR REVIEW", bg: "#E8F5E9", color: "#1B5E20" };
  if (app?.status === "analyzing") return { label: "ANALYZING", bg: "#EEF2FF", color: "#3730A3" };
  if (app?.status === "data_collection") return { label: "PENDING INFO", bg: "#E0F2FE", color: "#075985" };
  return { label: "NEW", bg: "#F1F5F9", color: "#475569" };
}

const productLabel = (p) => (p || "personal_loan").replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

export default function KitaSummaryHeader({ app, borrower, decision, fmtMoney }) {
  const badge = statusBadge(app, decision);
  const currency = app?.loan_currency || "GBP";
  const fullName = borrower ? `${borrower.first_name || ""} ${borrower.last_name || ""}`.trim() : "—";

  const meta = [
    { label: "APP ID", value: app?.application_number || app?.id?.slice(0, 8) || "—" },
    { label: "POLICY", value: getPolicyLabel(app?.policy_id, app?.market) },
    { label: "MARKET", value: app?.market || "—" },
    { label: "LAST ACTIVITY", value: app?.updated_date ? new Date(app.updated_date).toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : "—" },
  ];

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 mb-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-900 truncate">{fullName}</h1>
          <p className="mt-1 text-sm text-slate-500">{productLabel(app?.product_type)}{app?.loan_purpose ? ` · ${app.loan_purpose}` : ""}</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="inline-flex items-center text-[11px] font-semibold tracking-wide px-2.5 py-1 rounded-full" style={{ backgroundColor: badge.bg, color: badge.color }}>
            {badge.label}
          </span>
          <span className="text-lg font-semibold text-slate-900">{fmtMoney(app?.loan_amount, currency)}</span>
        </div>
      </div>

      <div className="mt-5 pt-4 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-4">
        {meta.map((m) => (
          <div key={m.label}>
            <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">{m.label}</div>
            <div className="mt-0.5 text-sm font-medium text-slate-700 truncate">{m.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}