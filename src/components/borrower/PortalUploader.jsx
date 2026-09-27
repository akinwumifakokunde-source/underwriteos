import React, { useRef } from "react";
import { UploadCloud, Loader2 } from "lucide-react";

// Minimal file-attach control for the borrower portal. The actual upload
// (UploadPublicFile) and backend submit happen in the parent, so this stays
// a presentational trigger with an uploading state.
export default function PortalUploader({ onUpload, uploading, label = "Attach file", accept }) {
  const inputRef = useRef(null);
  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onUpload(f);
          e.target.value = "";
        }}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[12px] font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
      >
        {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UploadCloud className="w-3.5 h-3.5" />}
        {uploading ? "Uploading…" : label}
      </button>
    </div>
  );
}