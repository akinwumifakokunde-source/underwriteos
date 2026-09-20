import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

// Sticky top header for mobile only. Shows the current page title and a
// left-aligned back arrow. When `backTo` is provided it navigates to that
// parent route; otherwise it steps back in history.
export default function MobilePageHeader({ title, backTo, backLabel = "Back" }) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (backTo) navigate(backTo);
    else navigate(-1);
  };

  return (
    <header className="md:hidden sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-slate-200">
      <div className="flex items-center gap-1 px-3 h-14">
        <button
          onClick={handleBack}
          aria-label={backLabel}
          className="inline-flex items-center justify-center w-9 h-9 -ml-1 rounded-lg text-slate-700 hover:bg-slate-100 active:bg-slate-200 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-base font-semibold text-slate-900 truncate flex-1">{title}</h1>
      </div>
    </header>
  );
}