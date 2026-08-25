import React from "react";

export default function JsonBlock({ data, maxHeight = "320px" }) {
  const text = React.useMemo(() => {
    try {
      return JSON.stringify(data, null, 2);
    } catch {
      return String(data);
    }
  }, [data]);

  return (
    <pre className="text-[12px] leading-relaxed font-mono text-slate-200 bg-slate-950/90 rounded-xl border border-slate-800 p-4 overflow-auto"
      style={{ maxHeight }}>
      <code>{text}</code>
    </pre>
  );
}