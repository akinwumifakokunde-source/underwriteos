import React from "react";

// Renders a real <table> on desktop (md+) and simple stacked cards on mobile.
// columns: [{ key, header, render(row), mobileTitle?, mobileHide?, mobileLabel? }]
// data, rowKey(row), onRowClick(row) optional.
export default function ResponsiveTable({ columns, data, rowKey, onRowClick }) {
  const mobileColumns = columns.filter((c) => !c.mobileHide);

  return (
    <>
      {/* Desktop table */}
      <div className="hidden md:block rounded-xl border border-slate-200 bg-white overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50">
              {columns.map((c) => (
                <th key={c.key} className="text-left text-[11px] uppercase tracking-wider text-slate-400 font-semibold px-5 py-3">
                  {c.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.map((row) => (
              <tr
                key={rowKey(row)}
                className={`hover:bg-slate-50 transition-colors ${onRowClick ? "cursor-pointer" : ""}`}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
              >
                {columns.map((c) => (
                  <td key={c.key} className="px-5 py-3">{c.render(row)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile stacked cards */}
      <div className="md:hidden space-y-3">
        {data.map((row) => (
          <div
            key={rowKey(row)}
            className={`rounded-xl border border-slate-200 bg-white p-4 ${onRowClick ? "cursor-pointer active:bg-slate-50" : ""}`}
            onClick={onRowClick ? () => onRowClick(row) : undefined}
          >
            {mobileColumns.map((c) =>
              c.mobileTitle ? (
                <div key={c.key} className="pb-2 mb-2 border-b border-slate-100">{c.render(row)}</div>
              ) : (
                <div key={c.key} className="flex items-start justify-between gap-3 py-1">
                  <span className="text-xs text-slate-400 shrink-0">{c.mobileLabel || c.header}</span>
                  <div className="text-sm text-slate-900 text-right">{c.render(row)}</div>
                </div>
              )
            )}
          </div>
        ))}
      </div>
    </>
  );
}