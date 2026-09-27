import React, { useState, useRef, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Sparkles, Send, Loader2, UserRound } from "lucide-react";

// Context-aware chat assistant for the post-submission borrower portal. Calls
// apiBorrowerPortalChat with the application_number + email so the assistant
// can answer status questions and flag handoff to the loan officer.
export default function PortalAssistant({ applicationNumber, email }) {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hi! I'm your assistant. Ask me where your application stands, what's left to do, or what your decision means — I'm here day and night." },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [handoff, setHandoff] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, sending]);

  const send = async (text) => {
    const msg = (text ?? input).trim();
    if (!msg || sending) return;
    setInput("");
    const history = [...messages, { role: "user", content: msg }];
    setMessages(history);
    setSending(true);
    try {
      const res = await base44.functions.invoke("apiBorrowerPortalChat", {
        application_number: applicationNumber,
        email,
        message: msg,
        history: messages,
      });
      const { reply, handoff: ho } = res.data || {};
      setMessages((m) => [...m, { role: "assistant", content: reply }]);
      if (ho) setHandoff(true);
    } catch (e) {
      setMessages((m) => [...m, { role: "assistant", content: "Sorry, I couldn't process that just now. Please try again in a moment." }]);
    } finally {
      setSending(false);
    }
  };

  const SUGGESTED = ["What's the status of my application?", "What do I still need to do?", "When will I get a decision?"];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white flex flex-col h-full overflow-hidden shadow-sm">
      <div className="flex items-center gap-2.5 px-4 py-3 border-b border-slate-100">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-emerald-600 flex items-center justify-center shrink-0">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-slate-900">CreditDecide Assistant</div>
          <div className="text-[11px] text-slate-400">Instant answers, day & night</div>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3 min-h-[200px]">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            {m.role === "assistant" && (
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-teal-400 to-emerald-600 flex items-center justify-center shrink-0 mr-2 mt-0.5">
                <Sparkles className="w-3.5 h-3.5 text-white" />
              </div>
            )}
            <div className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed ${m.role === "user" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700"}`}>
              {m.content}
            </div>
            {m.role === "user" && (
              <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center shrink-0 ml-2 mt-0.5">
                <UserRound className="w-3.5 h-3.5 text-slate-500" />
              </div>
            )}
          </div>
        ))}
        {sending && (
          <div className="flex justify-start">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-teal-400 to-emerald-600 flex items-center justify-center shrink-0 mr-2">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            <div className="rounded-2xl bg-slate-100 px-3.5 py-2.5">
              <Loader2 className="w-4 h-4 text-slate-400 animate-spin" />
            </div>
          </div>
        )}
      </div>

      {handoff && (
        <div className="mx-4 mb-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[12px] text-amber-800">
          I've passed your question to your loan officer — they'll reach out to you directly.
        </div>
      )}

      {messages.length <= 1 && (
        <div className="px-4 pb-2 flex flex-wrap gap-1.5">
          {SUGGESTED.map((s) => (
            <button key={s} onClick={() => send(s)} disabled={sending} className="text-[11px] text-left text-slate-600 border border-slate-200 rounded-lg px-2.5 py-1.5 hover:bg-slate-50 disabled:opacity-50 transition-colors">
              {s}
            </button>
          ))}
        </div>
      )}

      <div className="p-3 border-t border-slate-100">
        <div className="flex items-end gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
            placeholder="Ask me anything…"
            rows={1}
            className="flex-1 resize-none text-sm rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-400 max-h-24"
          />
          <button onClick={() => send()} disabled={sending || !input.trim()} className="shrink-0 w-9 h-9 rounded-lg flex items-center justify-center text-white disabled:opacity-50 transition-opacity bg-slate-900">
            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}