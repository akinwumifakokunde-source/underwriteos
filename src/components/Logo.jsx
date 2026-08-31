import React from "react";

export default function Logo({ size = 32, className = "", textClassName = "" }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
        aria-hidden="true"
      >
        <rect x="0.5" y="0.5" width="31" height="31" rx="9" fill="#0d9488" />
        <rect x="0.5" y="0.5" width="31" height="31" rx="9" stroke="#0a0c12" strokeOpacity="0.1" />
        <path
          d="M7.5 16.5 L13 22 L24.5 8.5"
          stroke="white"
          strokeWidth="3.1"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <rect x="7" y="25" width="11" height="2.4" rx="1.2" fill="white" fillOpacity="0.5" />
      </svg>
      <span className={`font-semibold tracking-tight text-[#0a0c12] ${textClassName}`}>CreditDecide</span>
    </span>
  );
}