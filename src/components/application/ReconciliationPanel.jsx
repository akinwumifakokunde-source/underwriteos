import React from "react";
import { CheckCircle2, AlertTriangle, FileSearch, ArrowRight } from "lucide-react";

function extractIncomeValues(documents, borrower, fp) {
  const values = [];
  if (borrower?.annual_income) {
    values.push({ source: "Application (borrower-declared)", value: borrower.annual_income, sourceType: "borrower_declaration" });
  }
  documents.forEach((doc) => {
    const fields = doc.extracted_data?.fields || [];
    const incomeFields = fields.filter((f) => {
      const n = (f.name || f.label || "").toLowerCase();
      return n.includes("income") || n.includes("annual") || n.includes("salary");
    });
    incomeFields.forEach((f) => {
      const val = Number(f.value);
      if (val > 0) values.push({ source: doc.file_name || doc.document_type, value: val, sourceType: "document", confidence: f.confidence });
    });
  });
  if (fp?.income?.annual) {
    values.push({ source: "Bank-derived (calculated)", value: fp.income.annual, sourceType: "derived" });
  }
  return values;
}

function reconcile(values) {
  const numeric = values.filter((v) => v.value > 0);
  if (numeric.length < 2) return { status: "insufficient", values: numeric };
  const max = Math.max(...numeric.map((v) => v.value));
  const min = Math.min(...numeric.map((v) => v.value));
  const diff = Math.abs(max - min);
  const pct = min > 0 ? (diff / min) * 100 : 0;
  if (pct <= 5) return { status: "consistent", values: numeric, pct };
  if (pct <= 15) return { status: "minor_variance", values: numeric, pct };
  return { status: "mismatch", values: numeric, pct };
}

const STATUS_CONFIG = {
  consistent: { icon: CheckCircle2, cls: "text-emerald-600", bg: "bg-emerald-50 border-emerald-200", label: "INCOME CONSISTENT" },
  minor_variance: { icon: AlertTriangle, cls: "text-amber-600", bg: "bg-amber-50 border-amber-200", label: "MINOR VARIANCE" },
  mismatch: { icon: AlertTriangle, cls: "text-rose-600", bg: "bg-rose-50 border-rose-200", label: "INCOME MISMATCH" },
  insufficient: { icon: FileSearch, cls: "text-slate-400", bg: "bg-slate-50 border-slate-200", label: "INSUFFICIENT DATA" },
};

export default function ReconciliationPanel({ documents, borrower, fp, fmtMoney, onViewEvidence }) {
  const incomeValues = extractIncomeValues(documents, borrower, fp);
  const result = reconcile(incomeValues);
  const config = STATUS_CONFIG[result.status];
  const SIcon = config.icon;
  const currency = "GBP";

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex items-center gap-2 mb-3">
          <FileSearch className="w-4 h-4 text-[#0d9488]" />
          <h3 className="text-sm font-semibold text-slate-900">Cross-document reconciliation</h3>
        </div>
        <p className="text-[12px] text-slate-400 mb-4">UnderwriteOS compares information across documents to detect inconsistencies and verify borrower-declared data.</p>

        {/* Result banner */}
        <div className={`rounded-lg border p-4 flex items-start gap-3 mb-4 ${config.bg}`}>
          <SIcon className={`w-5 h-5 ${config.cls} shrink-0 mt-0.5`} />
          <div>
            <div className={`text-sm font-semibold ${config.cls}`}>{config.label}</div>
            {result.pct != null && (
              <div className={`text-[13px] ${config.cls} mt-0.5`}>
                {result.status === "consistent" ? "All sources agree within 5%." : `Difference: ${result.pct.toFixed(1)}%`}
              </div>
            )}
            {result.status === "insufficient" && (
              <div className="text-[13px] text-slate-500 mt-0.5">Upload at least two documents with income data to enable reconciliation.</div>
            )}
          </div>
        </div>

        {/* Source comparison */}
        {result.values.length > 0 && (
          <div className="space-y-2">
            {result.values.map((v, i) => (
              <div key={i} className="flex items-center gap-3 rounded-lg border border-slate-100 p-3">
                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                  <span className="text-[10px] font-bold text-slate-500">{v.sourceType === "borrower_declaration" ? "B" : v.sourceType === "derived" ? "C" : "E"}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-slate-800 truncate">{v.source}</div>
                  <div className="text-[11px] text-slate-400 capitalize">{v.sourceType?.replace(/_/g, " ")}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-mono font-semibold text-slate-900">{fmtMoney(v.value, currency)}</div>
                  {v.confidence != null && <div className="text-[10px] text-teal-600">{Math.round(v.confidence * 100)}% confidence</div>}
                </div>
              </div>
            ))}
          </div>
        )}

        {result.status === "mismatch" && (
          <div className="mt-4 flex items-center gap-2 text-[13px]">
            <span className="text-slate-500">Recommended action:</span>
            <button onClick={() => onViewEvidence?.()} className="inline-flex items-center gap-1 text-teal-600 font-medium hover:text-teal-700">
              Review evidence <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Data status legend */}
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <h3 className="text-sm font-semibold text-slate-900 mb-3">Data status indicators</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[12px]">
          {[
            { label: "Available", desc: "Data has been received", cls: "text-emerald-600" },
            { label: "Missing", desc: "No data received", cls: "text-slate-400" },
            { label: "Inferred", desc: "Derived from other data", cls: "text-indigo-600" },
            { label: "Verified", desc: "Confirmed across sources", cls: "text-emerald-600" },
            { label: "Conflicted", desc: "Sources disagree", cls: "text-rose-600" },
            { label: "Stale", desc: "Data is outdated", cls: "text-amber-600" },
          ].map((s, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className={`font-medium ${s.cls}`}>{s.label}</span>
              <span className="text-slate-400">{s.desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}