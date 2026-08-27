import React from "react";
import { Upload, FileText, Sparkles, ArrowRight } from "lucide-react";

export default function EntryChoice({ onChoose }) {
  return (
    <div className="max-w-3xl mx-auto px-5 sm:px-8 py-10">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">New underwriting application</h1>
        <p className="mt-2 text-sm text-slate-500 max-w-lg mx-auto">
          Start with borrower information or upload documents. UnderwriteOS will extract and organize the information automatically.
        </p>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <ChoiceCard
          icon={<Upload className="w-5 h-5" />}
          title="Upload documents"
          subtitle="Start with documents"
          desc="Drop in bank statements, payslips, or credit reports. UnderwriteOS extracts the data and builds the credit file."
          badge="AI-extracted"
          onClick={() => onChoose("upload")}
          highlighted
        />
        <ChoiceCard
          icon={<FileText className="w-5 h-5" />}
          title="Enter manually"
          subtitle="Enter application manually"
          desc="Fill in borrower and loan details yourself. Upload documents later to supplement."
          onClick={() => onChoose("manual")}
        />
        <ChoiceCard
          icon={<Sparkles className="w-5 h-5" />}
          title="Use sample"
          subtitle="Use sample application"
          desc="Pre-filled borrower with synthetic data. See the full underwriting pipeline in action."
          onClick={() => onChoose("sample")}
        />
      </div>
    </div>
  );
}

function ChoiceCard({ icon, title, subtitle, desc, badge, onClick, highlighted }) {
  return (
    <button
      onClick={onClick}
      className={`group relative text-left rounded-xl border p-5 transition-all hover:shadow-sm ${highlighted ? "border-teal-400 bg-teal-50/40" : "border-slate-200 bg-white hover:border-slate-300"}`}
    >
      {badge && (
        <span className="absolute top-3 right-3 text-[10px] font-medium text-teal-700 bg-teal-100 border border-teal-200 rounded-full px-2 py-0.5">{badge}</span>
      )}
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${highlighted ? "bg-teal-600 text-white" : "bg-slate-100 text-slate-600"}`}>
        {icon}
      </div>
      <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      <p className="text-[11px] font-mono uppercase tracking-wider text-slate-400 mt-0.5">{subtitle}</p>
      <p className="text-[13px] text-slate-500 mt-2 leading-relaxed">{desc}</p>
      <div className="mt-3 inline-flex items-center gap-1 text-[12px] font-medium text-slate-700 group-hover:text-teal-600">
        Get started <ArrowRight className="w-3.5 h-3.5" />
      </div>
    </button>
  );
}