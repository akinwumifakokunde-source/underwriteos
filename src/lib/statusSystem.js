// Canonical status system — single source of truth for status labels and styles
// across the workspace. Keeps badges consistent on every screen.

export const APP_STATUS_STYLES = {
  draft: "bg-slate-50 text-slate-600 border-slate-200",
  data_collection: "bg-sky-50 text-sky-700 border-sky-200",
  analyzing: "bg-indigo-50 text-indigo-700 border-indigo-200",
  underwriting: "bg-violet-50 text-violet-700 border-violet-200",
  completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  failed: "bg-rose-50 text-rose-700 border-rose-200",
};

export const APP_STATUS_LABELS = {
  draft: "Needs information",
  data_collection: "Collecting data",
  analyzing: "Processing",
  underwriting: "Ready for review",
  completed: "Completed",
  failed: "Failed",
};

export const DECISION_STYLES = {
  APPROVE: "bg-emerald-50 text-emerald-700 border-emerald-200",
  REVIEW: "bg-amber-50 text-amber-700 border-amber-200",
  DECLINE: "bg-rose-50 text-rose-700 border-rose-200",
};

export const DECISION_LABELS = {
  APPROVE: "Approved",
  REVIEW: "Review",
  DECLINE: "Declined",
};

export const DOC_STATUS_STYLES = {
  uploaded: "bg-slate-50 text-slate-600 border-slate-200",
  processing: "bg-indigo-50 text-indigo-700 border-indigo-200",
  processed: "bg-sky-50 text-sky-700 border-sky-200",
  verified: "bg-emerald-50 text-emerald-700 border-emerald-200",
  needs_review: "bg-amber-50 text-amber-700 border-amber-200",
  failed: "bg-rose-50 text-rose-700 border-rose-200",
};

export const DOC_STATUS_LABELS = {
  uploaded: "Uploaded",
  processing: "Processing",
  processed: "Extracted",
  verified: "Verified",
  needs_review: "Needs review",
  failed: "Rejected",
};