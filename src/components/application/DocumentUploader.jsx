import React, { useState } from "react";
import { Upload, Loader2 } from "lucide-react";

export default function DocumentUploader({ onUpload, uploading, compact }) {
  const [dragOver, setDragOver] = useState(false);

  const handleFiles = (files) => {
    if (!files || files.length === 0) return;
    Array.from(files).forEach((f) => onUpload(f));
  };

  return (
    <div>
      <label
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
        className={`flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${dragOver ? "border-teal-400 bg-teal-50/40" : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"} ${compact ? "py-6" : "py-10"}`}
      >
        {uploading ? (
          <Loader2 className="w-6 h-6 text-teal-600 animate-spin" />
        ) : (
          <Upload className={`w-6 h-6 ${dragOver ? "text-teal-600" : "text-slate-400"}`} />
        )}
        <span className="text-sm text-slate-600 font-medium">
          {uploading ? "Processing…" : "Drop documents here or click to upload"}
        </span>
        <span className="text-[11px] text-slate-400">PDF, CSV, JSON, images · Bank statements, payslips, credit reports, tax documents</span>
        <input
          type="file"
          multiple
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
          accept=".pdf,.csv,.json,.png,.jpg,.jpeg,.webp"
        />
      </label>
    </div>
  );
}