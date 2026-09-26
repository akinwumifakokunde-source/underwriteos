import React, { useState, useRef, useEffect } from "react";
import { Send, Loader2, Sparkles, MessageSquare } from "lucide-react";
import { base44 } from "@/api/base44Client";

const SUGGESTED = [
  "Why is this application under review?",
  "What are the biggest risks?",
  "Show me the evidence supporting the income figure.",
  "Which policy rules were triggered?",
  "What information is missing?",
];

export default function ConversationTab({ applicationId }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, loading]);

  const send = async (text) => {
    const content = (text || input).trim();
    if (!content || loading) return;
    setMessages((prev) => [...prev, { role: "user", content }]);
    setInput("");
    setLoading(true);
    try {
      const res = await base44.functions.invoke("apiChat", { application_id: applicationId, message: content, history: messages.slice(-10) });
      setMessages((prev) => [...prev, { role: "assistant", content: res.data?.reply || "Sorry, I couldn't process that." }]);
    } catch (e) {
      setMessages((prev) => [...prev, { role: "assistant", content: "Sorry, I encountered an error. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white flex flex-col" style={{ minHeight: "560px" }}>
      <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-slate-100 shrink-0">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#0B3D21" }}>
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1">
          <div className="text-sm font-semibold text-slate-900">AI Underwriting Assistant</div>
          <div className="text-[11px] text-slate-400">Ask about this application</div>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-5 space-y-3 bg-slate-50/60">
        {messages.length === 0 && (
          <div className="text-center py-8">
            <div className="w-12 h-12 rounded-xl bg-teal-100 flex items-center justify-center mx-auto mb-3">
              <MessageSquare className="w-6 h-6 text-teal-600" />
            </div>
            <p className="text-sm font-medium text-slate-700 mb-1">Ask me anything about this application</p>
            <p className="text-[12px] text-slate-400 mb-4">Risk signals, affordability, credit profile, policy outcomes…</p>
            <div className="flex flex-wrap gap-2 justify-center max-w-md mx-auto">
              {SUGGESTED.map((s) => (
                <button key={s} onClick={() => send(s)} className="text-[12px] text-slate-600 bg-white border border-slate-200 rounded-full px-3 py-1.5 hover:border-teal-300 hover:text-teal-700 transition-colors">
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${m.role === "user" ? "text-white rounded-br-md" : "bg-white border border-slate-200 text-slate-700 rounded-bl-md shadow-sm"}`} style={m.role === "user" ? { backgroundColor: "#0B3D21" } : undefined}>
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-1.5 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="w-2 h-2 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="w-2 h-2 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          </div>
        )}
      </div>

      <div className="px-4 py-3 border-t border-slate-100 bg-white shrink-0">
        <div className="flex items-end gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
            placeholder="Ask about risk, affordability, credit…"
            rows={1}
            className="flex-1 resize-none rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400 max-h-24"
          />
          <button onClick={() => send()} disabled={!input.trim() || loading} className="w-9 h-9 rounded-xl text-white flex items-center justify-center disabled:opacity-40 shrink-0 transition-colors" style={{ backgroundColor: "#0B3D21" }}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}