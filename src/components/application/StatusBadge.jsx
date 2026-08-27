import React from "react";
import {
  APP_STATUS_STYLES, APP_STATUS_LABELS,
  DECISION_STYLES, DECISION_LABELS,
  DOC_STATUS_STYLES, DOC_STATUS_LABELS,
} from "@/lib/statusSystem";

export function AppStatusBadge({ status }) {
  return (
    <span className={`text-[10px] font-medium border rounded px-1.5 py-0.5 ${APP_STATUS_STYLES[status] || APP_STATUS_STYLES.draft}`}>
      {APP_STATUS_LABELS[status] || status}
    </span>
  );
}

export function DecisionBadge({ decision }) {
  if (!decision || decision === "null") {
    return <span className="text-[10px] font-medium border rounded px-1.5 py-0.5 bg-slate-50 text-slate-400 border-slate-200">Pending</span>;
  }
  return (
    <span className={`text-[10px] font-medium border rounded px-1.5 py-0.5 ${DECISION_STYLES[decision] || ""}`}>
      {DECISION_LABELS[decision] || decision}
    </span>
  );
}

export function DocStatusBadge({ status }) {
  return (
    <span className={`text-[10px] font-medium border rounded px-1.5 py-0.5 ${DOC_STATUS_STYLES[status] || DOC_STATUS_STYLES.uploaded}`}>
      {DOC_STATUS_LABELS[status] || status}
    </span>
  );
}