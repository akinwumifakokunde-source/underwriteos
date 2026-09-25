import React from "react";

// CreditDecide brand mark.
// Icon: a teal "C" with a turquoise checkmark in its void, the left edge
// dissolving into fading pixels. Wordmark: "Credit" charcoal + "Decide" teal.
// `tone` controls the wordmark for the surface it sits on:
//   "light" (default) — light backgrounds (site nav)
//   "dark"            — dark backgrounds (footer, workspace nav)
export default function Logo({ size = 32, className = "", textClassName = "", tone = "light" }) {
  const creditColor = tone === "dark" ? "#ffffff" : "#1a2021";
  const decideColor = tone === "dark" ? "#34d399" : "#00a89d";
  const fontSize = Math.round(size * 0.46);

  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="cdCgrad" x1="4" y1="4" x2="32" y2="33" gradientUnits="userSpaceOnUse">
            <stop stopColor="#004d4f" />
            <stop offset="1" stopColor="#008e8b" />
          </linearGradient>
        </defs>

        {/* pixel dissolution — left edge breaking apart, fading out */}
        <g>
          <rect x="10.6" y="8.6" width="2.2" height="2.2" rx="0.4" fill="#008e8b" opacity="0.92" />
          <rect x="9" y="11.6" width="1.5" height="1.5" rx="0.3" fill="#008e8b" opacity="0.72" />
          <rect x="7.4" y="6.6" width="1.8" height="1.8" rx="0.3" fill="#00e5c9" opacity="0.78" />
          <rect x="6" y="10.6" width="1.1" height="1.1" rx="0.2" fill="#00e5c9" opacity="0.5" />
          <rect x="5" y="5" width="1.4" height="1.4" rx="0.3" fill="#00e5c9" opacity="0.58" />
          <rect x="3" y="3.4" width="1" height="1" rx="0.2" fill="#008e8b" opacity="0.38" />
          <rect x="8" y="28.4" width="1.4" height="1.4" rx="0.3" fill="#00e5c9" opacity="0.5" />
          <rect x="5" y="30.4" width="1" height="1" rx="0.2" fill="#008e8b" opacity="0.32" />
          <rect x="10.6" y="30" width="1" height="1" rx="0.2" fill="#00e5c9" opacity="0.25" />
        </g>

        {/* the "C" */}
        <path
          d="M 29.66 11.30 A 13 13 0 1 0 29.66 28.70"
          stroke="url(#cdCgrad)"
          strokeWidth="6.5"
          strokeLinecap="round"
        />

        {/* checkmark in the void */}
        <path
          d="M 14 21 L 18 25 L 26.5 15"
          stroke="#00e5c9"
          strokeWidth="3.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      <span
        className={`font-semibold tracking-tight leading-none ${textClassName}`}
        style={{ fontSize }}
      >
        <span style={{ color: creditColor }}>Credit</span>
        <span style={{ color: decideColor }}>Decide</span>
      </span>
    </span>
  );
}