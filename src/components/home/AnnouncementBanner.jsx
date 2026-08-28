import React from "react";
import { ArrowRight } from "lucide-react";

export default function AnnouncementBanner() {
  return (
    <div className="bg-[#0a2e2a] text-white">
      <div className="max-w-5xl mx-auto px-5 sm:px-8 py-2.5 flex items-center justify-center gap-2.5 text-center">
        <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#0a2e2a] bg-[#5eead4] rounded-full px-2 py-0.5 shrink-0">
          New
        </span>
        <p className="text-[12px] sm:text-[13px] text-white/90">
          GoUnderwriteOS now supports six markets — GB, US, NG, ZA, KE, GH.
        </p>
        <a href="/pricing" className="hidden sm:inline-flex items-center gap-1 text-[12px] font-medium text-[#5eead4] hover:text-[#99f0e3] transition-colors shrink-0">
          Learn more <ArrowRight className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
}