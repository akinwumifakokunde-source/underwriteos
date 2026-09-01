import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Google-search-style pagination: centered, "Previous" / "Next" text links
// with chevrons, a window of numbered pages, and the active page highlighted.
export default function GooglePagination({ page, pageCount, onChange }) {
  if (pageCount <= 1) return null;

  const maxVisible = 10;
  let start = Math.max(1, page - Math.floor(maxVisible / 2));
  let end = Math.min(pageCount, start + maxVisible - 1);
  start = Math.max(1, end - maxVisible + 1);
  const pages = [];
  for (let i = start; i <= end; i++) pages.push(i);

  const base =
    "inline-flex items-center justify-center min-w-9 h-9 px-2 rounded-full text-sm transition-colors";

  return (
    <nav className="flex items-center justify-center gap-1 mt-12 select-none" aria-label="Pagination">
      <button
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
        className={`${base} gap-1 px-3 text-[#0a0c12] hover:bg-[#f0f7f4] disabled:text-[#c0c4cc] disabled:hover:bg-transparent disabled:cursor-default`}
      >
        <ChevronLeft className="w-4 h-4" /> Previous
      </button>

      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onChange(p)}
          aria-current={p === page ? "page" : undefined}
          className={
            p === page
              ? `${base} font-medium text-white bg-[#0d9488]`
              : `${base} text-[#0a0c12] hover:bg-[#f0f7f4]`
          }
        >
          {p}
        </button>
      ))}

      <button
        onClick={() => onChange(page + 1)}
        disabled={page === pageCount}
        className={`${base} gap-1 px-3 text-[#0a0c12] hover:bg-[#f0f7f4] disabled:text-[#c0c4cc] disabled:hover:bg-transparent disabled:cursor-default`}
      >
        Next <ChevronRight className="w-4 h-4" />
      </button>
    </nav>
  );
}