import React from "react";
import { Sparkles } from "lucide-react";

export default function ExtractedField({ field, onEdit, editedBy }) {
  return (
    <div className="flex items-start justify-between gap-3 py-2.5 border-b border-slate-50 last:border-0">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-medium text-slate-700">{field.label}</span>
          {field.source && (
            <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-teal-700 bg-teal-50 border border-teal-200 rounded-full px-1.5 py-0.5">
              <Sparkles className="w-2.5 h-2.5" /> AI extracted
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-base font-semibold text-slate-900">{formatValue(field.value)}</span>
          {field.confidence != null && (
            <span className={`text-[11px] font-medium ${field.confidence >= 0.85 ? "text-emerald-600" : "text-amber-600"}`}>
              {Math.round(field.confidence * 100)}% confidence
            </span>
          )}
        </div>
        {field.source && (
          <div className="text-[11px] text-slate-400 mt-0.5">
            Source: {field.source}
            {editedBy && <span className="text-amber-600 ml-2">· Edited by {editedBy}</span>}
          </div>
        )}
      </div>
      <div className="flex items-center gap-1 shrink-0">
        {field.source && (
          <button className="text-[11px] font-medium text-teal-600 hover:text-teal-700 px-2 py-1 rounded hover:bg-teal-50">
            View evidence
          </button>
        )}
      </div>
    </div>
  );
}

function formatValue(v) {
  if (v == null) return "—";
  if (typeof v === "number") {
    if (v > 1000) return `£${v.toLocaleString()}`;
    if (v < 1 && v > 0) return `${Math.round(v * 100)}%`;
    return String(v);
  }
  return String(v);
}