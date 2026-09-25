import React from "react";
import { Link } from "react-router-dom";

/**
 * Consistent marketing CTA pair: "Try CreditDecide" link + "Book a demo" pill.
 * Used across the home page and marketing pages so the action is always the same.
 */
export default function CtaPair({ dark = false, className = "" }) {
  const linkCls = dark
    ? "text-slate-200 hover:text-white"
    : "text-black dark:text-slate-50 hover:opacity-70";
  const pillCls = dark
    ? "bg-white text-[#0a0c12] hover:bg-slate-100"
    : "bg-[#111111] text-white hover:bg-[#1a1a1a]";

  return (
    <div className={`flex flex-col sm:flex-row items-center justify-center gap-4 ${className}`}>
      <Link to="/start/borrower" className={`text-sm font-medium transition-colors ${linkCls}`}>
        Try CreditDecide
      </Link>
      <Link
        to="/demo"
        className={`group inline-flex items-center gap-2 text-sm font-medium px-5 py-2.5 rounded-full transition-all shadow-sm ${pillCls}`}
      >
        <span className="w-2 h-2 rounded-full bg-[#2E7D32] group-hover:scale-110 transition-transform" />
        Book a demo
      </Link>
    </div>
  );
}