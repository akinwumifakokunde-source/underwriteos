import React, { useMemo } from "react";
import CopyButton from "./CopyButton.jsx";

export default function JsonView({ data, maxHeight = "320px" }) {
  const json = useMemo(() => {
    try {
      return JSON.stringify(data, null, 2);
    } catch {
      return String(data);
    }
  }, [data]);
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 overflow-hidden">
      <div className="flex items-center justify-between border-b border-slate-800 px-3 py-1.5">
        <span className="text-[11px] font-medium text-slate-400">JSON</span>
        <CopyButton text={json} label="Copy JSON" />
      </div>
      <pre className="text-[12px] font-mono text-slate-200 p-3.5 overflow-auto leading-relaxed" style={{ maxHeight }}>
        <code>{json}</code>
      </pre>
    </div>
  );
}