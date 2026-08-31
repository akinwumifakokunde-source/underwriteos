import React, { useState } from "react";
import HomeNav from "@/components/layout/HomeNav.jsx";
import SiteFooter from "@/components/home/SiteFooter.jsx";
import { Mail, MessageSquare, ArrowRight, CheckCircle2, Loader2, AlertCircle, Blocks, Database, Sparkles, FileDown } from "lucide-react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";

const CHANNELS = [
  { icon: Mail, title: "Email", value: "akinfaks@yahoo.com", href: "mailto:akinfaks@yahoo.com", desc: "For sales, security reviews, and data requests. We reply within one business day." },
  { icon: MessageSquare, title: "Product feedback", value: "Tell us what to build", href: "/onboarding", desc: "Feature requests and roadmap input from builders using the sandbox." },
];

const CAPABILITIES = [
  { icon: Blocks, title: "Visual policy builder", desc: "Set rules, thresholds, and outcomes without code. Your policy is the authoritative decision engine." },
  { icon: Database, title: "Live data sources", desc: "Connect credit bureaus and open banking per market — or upload documents. Either path works." },
  { icon: Sparkles, title: "AI underwriter", desc: "Advisory recommendations and an in-context assistant, always traceable to source evidence." },
  { icon: FileDown, title: "Export & audit", desc: "Download decisions as PDF, CSV, or Word. Every step is auditable and evidence-linked." },
];

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    setSending(true);
    setError(null);
    try {
      await base44.functions.invoke("apiContact", form);
      setSent(true);
    } catch (err) {
      setError(err?.response?.data?.error?.message || err.message || "Failed to send message.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-[#0a0c12]">
      <HomeNav />
      <section className="max-w-3xl mx-auto px-5 sm:px-8 pt-20 sm:pt-28 pb-14">
        <div className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0d9488] mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-[#0d9488]" /> Contact
        </div>
        <h1 className="text-[2.5rem] sm:text-5xl font-semibold tracking-tight leading-[1.05] text-[#0a0c12]">
          Underwriting, without writing code.
        </h1>
        <p className="mt-6 text-lg text-[#525965] leading-relaxed max-w-2xl">
          CreditDecide is a no-code underwriting operating system for lenders and fintechs. Configure lending policies
          visually, connect live credit and bank data, and let AI produce evidence-backed decisions — all from one
          workspace. Tell us what you're building and we'll help you go live, fast.
        </p>
      </section>

      <section className="max-w-3xl mx-auto px-5 sm:px-8 pb-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {CAPABILITIES.map((c) => (
            <div key={c.title} className="flex items-start gap-3 rounded-2xl border border-[#e5e7eb] bg-white p-5">
              <div className="w-9 h-9 shrink-0 rounded-lg bg-[#f0f7f4] border border-[#0d9488]/15 flex items-center justify-center">
                <c.icon className="w-4 h-4 text-[#0d9488]" />
              </div>
              <div>
                <div className="text-sm font-semibold text-[#0a0c12]">{c.title}</div>
                <p className="mt-1 text-[13px] text-[#525965] leading-relaxed">{c.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-5 sm:px-8 pb-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {CHANNELS.map((c) => (
            <a
              key={c.title}
              href={c.href}
              className="group rounded-2xl border border-[#e5e7eb] bg-white p-6 hover:border-[#0d9488] hover:shadow-[0_1px_2px_rgba(10,12,18,0.04),0_12px_30px_-18px_rgba(10,12,18,0.12)] transition-all"
            >
              <c.icon className="w-5 h-5 text-[#0d9488] mb-4 transition-transform group-hover:scale-105" />
              <div className="text-[11px] uppercase tracking-wider text-[#8a909c]">{c.title}</div>
              <div className="mt-1 text-base font-semibold text-[#0a0c12]">{c.value}</div>
              <p className="mt-1.5 text-sm text-[#525965] leading-relaxed">{c.desc}</p>
            </a>
          ))}
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-5 sm:px-8 pb-24">
          <h2 className="text-xl font-semibold tracking-tight text-[#0a0c12] mb-1">Send a message</h2>
          <p className="text-sm text-[#525965] mb-6">We'll get back to you at the email you provide.</p>
          {sent ? (
            <div className="rounded-xl border border-[#e6f7f3] bg-[#e6f7f3] p-5 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-[#0d9488] shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-[#0a0c12]">Thanks — your message has been sent.</p>
                <p className="text-sm text-[#525965] mt-0.5">We'll reply to {form.email || "your email"} shortly. You can also reach us directly at akinfaks@yahoo.com.</p>
              </div>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] uppercase tracking-wider text-[#8a909c] font-medium">Name</label>
                  <input
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-[#eceef1] px-3 py-2 text-sm outline-none focus:border-[#0d9488]"
                  />
                </div>
                <div>
                  <label className="text-[11px] uppercase tracking-wider text-[#8a909c] font-medium">Email</label>
                  <input
                    required
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-[#eceef1] px-3 py-2 text-sm outline-none focus:border-[#0d9488]"
                  />
                </div>
              </div>
              <div>
                <label className="text-[11px] uppercase tracking-wider text-[#8a909c] font-medium">Message</label>
                <textarea
                  required
                  rows={5}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-[#eceef1] px-3 py-2 text-sm outline-none focus:border-[#0d9488] resize-y"
                />
              </div>
              {error && (
                <div className="flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm text-rose-700">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <Link to="/onboarding" className="inline-flex items-center gap-1.5 text-sm text-[#525965] hover:text-[#0a0c12]">
                  Or start building <ArrowRight className="w-4 h-4" />
                </Link>
                <button type="submit" disabled={sending} className="inline-flex items-center gap-1.5 text-sm font-medium text-white bg-[#0a0c12] px-4 py-2.5 rounded-lg hover:bg-[#1c1f26] transition-colors disabled:opacity-60">
                  {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  {sending ? "Sending…" : "Send message"}
                </button>
              </div>
            </form>
          )}
      </section>

      <SiteFooter />
    </div>
  );
}