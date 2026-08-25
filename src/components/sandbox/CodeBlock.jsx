import React, { useState, useMemo } from "react";
import { buildCurl, buildPython, buildJs } from "@/lib/codegen";
import CopyButton from "./CopyButton.jsx";

export default function CodeBlock({ request }) {
  const [tab, setTab] = useState("curl");
  const tabs = useMemo(
    () => ({
      curl: buildCurl(request),
      python: buildPython(request),
      javascript: buildJs(request),
    }),
    [request]
  );
  const code = tabs[tab];
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 overflow-hidden">
      <div className="flex items-center justify-between border-b border-slate-800 px-2">
        <div className="flex">
          {["curl", "python", "javascript"].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`text-[11px] font-medium px-3 py-2 transition-colors ${tab === t ? "text-white border-b-2 border-emerald-400" : "text-slate-400 hover:text-slate-200"}`}
            >
              {t === "curl" ? "cURL" : t === "python" ? "Python" : "JavaScript"}
            </button>
          ))}
        </div>
        <CopyButton text={code} label="Copy" />
      </div>
      <pre className="text-[12px] font-mono text-slate-200 p-3.5 overflow-auto leading-relaxed max-h-72">
        <code>{code}</code>
      </pre>
    </div>
  );
}