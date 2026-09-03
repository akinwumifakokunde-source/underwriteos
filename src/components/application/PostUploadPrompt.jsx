import React, { useMemo } from "react";
import { FileCheck2, SlidersHorizontal, ClipboardList, X, ArrowRight } from "lucide-react";

// Form fields the document extraction may or may not populate.
// Anything still blank here is "not covered by the auto-complete".
const FORM_FIELDS = [
  { key: "first_name", label: "First name" },
  { key: "last_name", label: "Last name" },
  { key: "email", label: "Email" },
  { key: "phone", label: "Phone" },
  { key: "employer_name", label: "Employer" },
  { key: "annual_income", label: "Annual income" },
  { key: "loan_amount", label: "Loan amount" },
  { key: "loan_term_months", label: "Loan term" },
  { key: "loan_purpose", label: "Loan purpose" },
];

export default function PostUploadPrompt({ fileName, extractedCount, form, onAdjustPolicy, onReviewDetails, onDismiss }) {
  const missing = useMemo(() => {
    if (!form) return [];
    return FORM_FIELDS.filter((f) => {
      const v = form[f.key];
      return v === "" || v === null || v === undefined;
    }).map((f) => f.label);
  }, [form]);

  return (
    <div className="rounded-xl border-2 border-teal-300 bg-teal-50/50 p-4 sm:p-5 relative">
      <button
        onClick={onDismiss}
        className="absolute top-3 right-3 text-slate-400 hover:text-slate-700 transition-colors"
        aria-label="Dismiss"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-lg bg-teal-600 text-white flex items-center justify-center shrink-0">
          <FileCheck2 className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-slate-900">
            Document processed{fileName ? `: ${fileName}` : ""}
          </h3>
          <p className="text-[13px] text-slate-600 mt-0.5 leading-relaxed">
            We auto-extracted {extractedCount} field{extractedCount === 1 ? "" : "s"} from this document.
            Before you decide, take a moment to fine-tune your policy and add any details we couldn't pick up from the file.
          </p>

          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <button
              onClick={onAdjustPolicy}
              className="group flex items-start gap-2.5 rounded-lg border border-slate-200 bg-white p-3 text-left hover:border-teal-300 hover:bg-teal-50/40 transition-colors"
            >
              <SlidersHorizontal className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-semibold text-slate-900">Adjust the policy</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Review thresholds and rules applied to this application.</div>
                <div className="mt-1 inline-flex items-center gap-1 text-[11px] font-medium text-teal-700 group-hover:gap-1.5 transition-all">
                  Open policy <ArrowRight className="w-3 h-3" />
                </div>
              </div>
            </button>

            <button
              onClick={onReviewDetails}
              className="group flex items-start gap-2.5 rounded-lg border border-slate-200 bg-white p-3 text-left hover:border-teal-300 hover:bg-teal-50/40 transition-colors"
            >
              <ClipboardList className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-semibold text-slate-900">
                  {missing.length > 0 ? `Add ${missing.length} missing detail${missing.length === 1 ? "" : "s"}` : "Review borrower details"}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  {missing.length > 0 ? `Not in the file: ${missing.slice(0, 4).join(", ")}${missing.length > 4 ? "…" : ""}` : "Confirm everything the file didn't cover."}
                </div>
                <div className="mt-1 inline-flex items-center gap-1 text-[11px] font-medium text-teal-700 group-hover:gap-1.5 transition-all">
                  Edit details <ArrowRight className="w-3 h-3" />
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}