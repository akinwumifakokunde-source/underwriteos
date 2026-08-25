import React from "react";
import { Webhook, Check } from "lucide-react";
import CopyButton from "./CopyButton.jsx";

const EVENTS = ["application.created", "application.analyzed", "underwriting.completed", "recommendation.created", "decision.created"];

export default function WebhookSimulator({ event }) {
  const payload = event ? JSON.stringify(event, null, 2) : "";
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-center gap-2 mb-3">
        <Webhook className="w-4 h-4 text-slate-600" />
        <h3 className="text-sm font-semibold text-slate-900">Webhook simulation</h3>
      </div>
      <div className="flex flex-wrap gap-1.5 mb-3">
        {EVENTS.map((e) => (
          <span key={e} className="text-[10px] font-mono text-slate-500 bg-slate-100 rounded px-1.5 py-0.5">{e}</span>
        ))}
      </div>
      {!event ? (
        <p className="text-sm text-slate-400">Webhook events fire when the underwriting flow completes.</p>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <span className="inline-flex items-center gap-1 text-emerald-600 font-medium">
              <Check className="w-4 h-4" /> Delivered
            </span>
            <code className="font-mono text-slate-700">{event.type}</code>
          </div>
          <div className="rounded-lg border border-slate-800 bg-slate-900 p-3 flex items-start justify-between gap-2">
            <pre className="text-[12px] font-mono text-slate-200 overflow-x-auto flex-1">
              <code>{payload}</code>
            </pre>
            <CopyButton text={payload} label="Copy payload" />
          </div>
        </div>
      )}
    </div>
  );
}