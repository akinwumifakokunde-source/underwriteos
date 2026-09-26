import React, { useState, useRef, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Sparkles, Send, Loader2, CheckCircle2 } from "lucide-react";

const SUGGESTED = [
  "I'm Maria, I need £12,000 to consolidate debt",
  "I run a catering business, income £52k",
  "I want a 24-month personal loan in the UK",
];

const FIELD_LABELS = {
  first_name: "name", last_name: "surname", email: "email", phone: "phone",
  loan_amount: "loan amount", loan_purpose: "purpose", loan_term_months: "term",
  employment_status: "employment", employer_name: "employer", annual_income: "income",
  product_type: "product", market: "market", borrower_type: "borrower type",
};

export default function BorrowerAssistant({ values, setValues }) {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hi! Chat with me and I can fill out your application for you. Tell me about yourself and what you need in your own words — I'll take notes and fill in each field as we go." },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [filled, setFilled] = useState([]);
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
      const res = await base44.functions.invoke("apiBorrowerChat", { message: msg, history: messages, values });
      const { reply, extracted_fields } = res.data || {};
      setMessages((m) => [...m, { role: "assistant", content: reply }]);
      if (extracted_fields && typeof extracted_fields === "object") {
        const updates = {};
        const newlyFilled = [];
        Object.entries(extracted_fields).forEach(([k, v]) => {
          if (v == null || v === "" || String(v).toLowerCase() === "null" || Number.isNaN(v)) return;
          updates[k] = v;
          newlyFilled.push(k);
        });
        if (Object.keys(updates).length > 0) {
          setValues((prev) => ({ ...prev, ...updates }));
          setFilled((f) => [...newlyFilled.map((k) => FIELD_LABELS[k] || k), ...f].slice(0, 6));
        }
      }
    } catch (e) {
      setMessages((m) => [...m, { role: "assistant", content: "Sorry, I couldn't process that. Could you try again?" }]);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col h-full overflow-hidden shadow-sm">
      <div className="flex items-center gap-2.5 px-4 py-3 border-b border-slate-100 dark:border-slate-800">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-emerald-600 flex items-center justify-center shrink-0">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        <div>
          <div className="text-sm font-semibold text-slate-900 dark:text-slate-50">CreditDecide Assistant</div>
          <div className="text-[11px] text-slate-400">Here to help while you apply</div>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed ${m.role === "user" ? "bg-gradient-to-br from-teal-500 to-emerald-600 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200"}`}>
              {m.content}
            </div>
          </div>
        ))}
        {sending && (
          <div className="flex justify-start">
            <div className="rounded-2xl bg-slate-100 dark:bg-slate-800 px-3.5 py-2.5">
              <Loader2 className="w-4 h-4 text-slate-400 animate-spin" />
            </div>
          </div>
        )}
        {filled.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {filled.map((f, i) => (
              <span key={i} className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded-full">
                <CheckCircle2 className="w-3 h-3" /> {f} filled
              </span>
            ))}
          </div>
        )}
      </div>

      {messages.length <= 1 && (
        <div className="px-4 pb-2 flex flex-wrap gap-1.5">
          {SUGGESTED.map((s) => (
            <button key={s} onClick={() => send(s)} disabled={sending} className="text-[11px] text-left text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 transition-colors">
              {s}
            </button>
          ))}
        </div>
      )}

      <div className="p-3 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-end gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
            placeholder="Ask me anything…"
            rows={1}
            className="flex-1 resize-none text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-teal-400 max-h-24"
          />
          <button onClick={() => send()} disabled={sending || !input.trim()} className="shrink-0 w-9 h-9 rounded-lg flex items-center justify-center text-white disabled:opacity-50 transition-opacity" style={{ backgroundColor: "#0B3D21" }}>
            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}