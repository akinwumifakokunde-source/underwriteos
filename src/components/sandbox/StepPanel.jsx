import React from "react";
import CodeBlock from "./CodeBlock.jsx";
import JsonView from "./JsonView.jsx";

const STATUS_LABEL = { 200: "OK", 201: "Created", 202: "Accepted", 400: "Bad Request", 401: "Unauthorized", 404: "Not Found", 500: "Server Error" };

export default function StepPanel({ step, ctxId }) {
  if (!step) return <p className="text-sm text-slate-400">Select a step to view its request and response.</p>;
  const st = step.state;
  const path = step.path.replace("{id}", ctxId || ":id");
  const tone = st.statusCode >= 400 ? "text-rose-600 bg-rose-50 border-rose-200" : "text-emerald-700 bg-emerald-50 border-emerald-200";
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-[11px] font-mono font-bold px-2 py-1 rounded border bg-slate-900 text-white">{step.method}</span>
        <code className="text-sm font-mono text-slate-700 break-all">{path}</code>
        {st.status === "completed" && (
          <span className={`text-[11px] font-mono font-semibold px-2 py-1 rounded border ${tone}`}>
            {st.statusCode} {STATUS_LABEL[st.statusCode] || ""}
          </span>
        )}
        {st.durationMs != null && <span className="text-[11px] font-mono text-slate-400">{st.durationMs} ms</span>}
      </div>

      <div>
        <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-2">Request</div>
        {st.request ? (
          <CodeBlock request={{ method: step.method, path, body: st.request.body, headers: st.request.headers }} />
        ) : (
          <p className="text-sm text-slate-400">Not sent yet. Run the flow to execute this API call.</p>
        )}
      </div>

      <div>
        <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-2">Response</div>
        {st.response ? <JsonView data={st.response} /> : <p className="text-sm text-slate-400">No response yet.</p>}
      </div>
    </div>
  );
}