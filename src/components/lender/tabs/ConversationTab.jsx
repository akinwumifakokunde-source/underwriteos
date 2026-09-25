import React from "react";
import { FileText, ExternalLink, Send } from "lucide-react";
import { GREEN, CONVERSATION } from "../data";

export default function ConversationTab({ revealed = 6 }) {
  const msgs = CONVERSATION.slice(0, revealed);
  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden flex flex-col" style={{ height: "560px" }}>
      <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
        <div className="text-sm font-semibold text-slate-900">Maria Delgado</div>
        <span className="text-[12px] text-slate-400">4</span>
      </div>
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 bg-[#fafafa]">
        {msgs.map((m, i) => {
          if (m.type === "system") {
            return (
              <div key={i} className="text-[12px] text-slate-500 bg-slate-100 border border-slate-200 rounded-lg px-3 py-2.5 leading-relaxed">
                {m.text}
              </div>
            );
          }
          if (m.type === "note") {
            return (
              <div key={i} className="text-center text-[12px] text-slate-400 px-4 py-1 leading-relaxed">• {m.text}</div>
            );
          }
          const ai = m.type === "ai";
          return (
            <div key={i} className={`flex ${ai ? "justify-start" : "justify-end"}`}>
              <div
                className={`max-w-[78%] rounded-2xl px-4 py-2.5 text-[13px] leading-relaxed text-slate-800 ${ai ? "" : "bg-white border border-slate-200"}`}
                style={ai ? { backgroundColor: "#e6f4e6" } : undefined}
              >
                {m.text}
                {m.attachment && (
                  <div className="mt-2 flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-2.5 py-2">
                    <div className="w-7 h-7 rounded bg-rose-50 text-rose-500 flex items-center justify-center shrink-0"><FileText className="w-3.5 h-3.5" /></div>
                    <div className="min-w-0">
                      <div className="text-[12px] font-medium text-slate-700 truncate">{m.attachment.name}</div>
                      <div className="text-[10px] text-slate-400">{m.attachment.kind} document</div>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400 ml-auto shrink-0" />
                  </div>
                )}
                {m.time && <div className={`mt-1 text-[10px] text-right ${ai ? "text-slate-500" : "text-slate-400"}`}>{m.time}</div>}
              </div>
            </div>
          );
        })}
      </div>
      <div className="px-4 py-3 border-t border-slate-100 bg-white">
        <div className="flex items-center gap-2 mb-2">
          <span className="inline-flex items-center gap-1.5 text-[11px] text-slate-500">
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: GREEN }} /> AI replies on its own
          </span>
          <div className="ml-auto flex items-center gap-1.5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Channel</span>
            {["Email", "SMS", "WhatsApp"].map((c) => (
              <span key={c} className={`text-[11px] px-2.5 py-1 rounded-full ${c === "WhatsApp" ? "bg-slate-900 text-white" : "border border-slate-200 text-slate-500"}`}>{c}</span>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <textarea disabled placeholder="Messaging is disabled in this demo." className="flex-1 text-[13px] rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-slate-400 resize-none focus:outline-none" rows={1} />
          <button className="inline-flex items-center justify-center w-9 h-9 rounded-lg text-white shrink-0" style={{ backgroundColor: GREEN }}><Send className="w-4 h-4" /></button>
        </div>
      </div>
    </div>
  );
}