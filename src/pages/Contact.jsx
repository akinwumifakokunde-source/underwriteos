import React, { useState } from "react";
import HomeNav from "@/components/home/HomeNav.jsx";
import SiteFooter from "@/components/home/SiteFooter.jsx";
import BookingModal from "@/components/booking/BookingModal.jsx";
import {
  ArrowRight,
  CheckCircle2,
  Loader2,
  AlertCircle,
  CalendarDays,
  Handshake,
  PlayCircle,
  Send,
  ShieldCheck,
  FileText,
  BookOpen,
  Globe2,
} from "lucide-react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";

const PATHS = [
  {
    icon: CalendarDays,
    title: "Book a demo",
    desc: "A 30-minute walkthrough on one of your files — the memo, evidence and decision, live.",
    cta: "Book a slot",
    action: "demo",
  },
  {
    icon: Handshake,
    title: "Become a partner",
    desc: "Resell, implement and own the customer relationship in your region. Earn recurring commission.",
    cta: "Explore the program",
    to: "/partners",
  },
  {
    icon: PlayCircle,
    title: "Try CreditDecide",
    desc: "Spin up the sandbox and run a borrower application end-to-end — no setup required.",
    cta: "Open the sandbox",
    to: "/start/borrower",
  },
];

const RESOURCES = [
  { icon: ShieldCheck, title: "Security", desc: "How we keep borrower data safe.", to: "/security" },
  { icon: BookOpen, title: "Platform", desc: "Capabilities and how it fits together.", to: "/features" },
  { icon: Globe2, title: "Markets", desc: "Live in the UK, US and across Africa.", to: "/markets/GB" },
  { icon: FileText, title: "Documentation", desc: "API reference and integration guides.", to: "/api-reference" },
];

const inputCls =
  "w-full text-sm rounded-lg border border-[#eceef1] bg-white px-3.5 py-2.5 text-[#0a0c12] placeholder-[#9a9aa3] outline-none focus:border-[#0d9488] focus:ring-2 focus:ring-[#0d9488]/10 transition";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", company: "", message: "" });
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [bookingOpen, setBookingOpen] = useState(false);

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

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-[#eceef1]">
        <div className="absolute inset-0 bg-gradient-to-b from-[#f0f7f4] via-white to-white" />
        <div className="relative max-w-3xl mx-auto px-5 sm:px-8 pt-16 sm:pt-24 pb-14">
          <div className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0d9488] mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0d9488]" /> Contact
          </div>
          <h1 className="text-3xl sm:text-5xl font-semibold tracking-tight leading-[1.06] text-[#0a0c12]">
            Let's get you live, fast.
          </h1>
          <p className="mt-6 text-lg text-[#525965] leading-relaxed max-w-2xl">
            Book a demo, apply to partner, or send us a note. Whether you're evaluating CreditDecide
            or ready to deploy, our team will help you move forward.
          </p>
        </div>
      </section>

      {/* Ways to reach us */}
      <section className="max-w-5xl mx-auto px-5 sm:px-8 py-14 sm:py-16">
        <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-[#8a909c] mb-6">
          Three ways to get started
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {PATHS.map((p) => {
            const Icon = p.icon;
            const inner = (
              <div className="group h-full rounded-2xl border border-[#e5e7eb] bg-white p-6 hover:border-[#0d9488] hover:shadow-[0_1px_2px_rgba(10,12,18,0.04),0_12px_30px_-18px_rgba(10,12,18,0.12)] transition-all flex flex-col">
                <div className="w-10 h-10 rounded-xl bg-[#f0f7f4] border border-[#0d9488]/15 flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-[#0d9488]" />
                </div>
                <h3 className="text-base font-semibold text-[#0a0c12]">{p.title}</h3>
                <p className="mt-1.5 text-sm text-[#525965] leading-relaxed flex-1">{p.desc}</p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-[#0d9488] group-hover:gap-2 transition-all">
                  {p.cta} <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            );
            return p.action === "demo" ? (
              <button key={p.title} onClick={() => setBookingOpen(true)} className="text-left">
                {inner}
              </button>
            ) : (
              <Link key={p.title} to={p.to}>
                {inner}
              </Link>
            );
          })}
        </div>
      </section>

      {/* Form + resources */}
      <section className="max-w-5xl mx-auto px-5 sm:px-8 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-8 lg:gap-12">
          {/* Form */}
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-[#0a0c12] mb-1">Send us a message</h2>
            <p className="text-sm text-[#525965] mb-6">
              Tell us what you're building. We'll reply to the email you provide within one business day.
            </p>
            {sent ? (
              <div className="rounded-xl border border-[#e6f7f3] bg-[#e6f7f3] p-5 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#0d9488] shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-[#0a0c12]">Thanks — your message has been sent.</p>
                  <p className="text-sm text-[#525965] mt-0.5">We'll reply to {form.email || "your email"} shortly.</p>
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
                      className={`mt-1 ${inputCls}`}
                      placeholder="Jane Doe"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] uppercase tracking-wider text-[#8a909c] font-medium">Email</label>
                    <input
                      required
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className={`mt-1 ${inputCls}`}
                      placeholder="jane@company.com"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[11px] uppercase tracking-wider text-[#8a909c] font-medium">Company</label>
                  <input
                    value={form.company}
                    onChange={(e) => setForm({ ...form, company: e.target.value })}
                    className={`mt-1 ${inputCls}`}
                    placeholder="Acme Lending"
                  />
                </div>
                <div>
                  <label className="text-[11px] uppercase tracking-wider text-[#8a909c] font-medium">Message</label>
                  <textarea
                    required
                    rows={5}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className={`mt-1 ${inputCls} resize-y`}
                    placeholder="What are you building, and which markets are you lending in?"
                  />
                </div>
                {error && (
                  <div className="flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm text-rose-700">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}
                <button
                  type="submit"
                  disabled={sending}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 text-sm font-medium text-white bg-[#0a0c12] px-5 py-3 rounded-full hover:bg-[#1c1f26] transition-colors disabled:opacity-60"
                >
                  {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  {sending ? "Sending…" : "Send message"}
                </button>
              </form>
            )}
          </div>

          {/* Resources */}
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-[#0a0c12] mb-1">Explore</h2>
            <p className="text-sm text-[#525965] mb-6">While you're here, dig into the platform.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {RESOURCES.map((r) => {
                const Icon = r.icon;
                return (
                  <Link
                    key={r.title}
                    to={r.to}
                    className="group rounded-xl border border-[#e5e7eb] bg-white p-4 hover:border-[#0d9488] transition-colors"
                  >
                    <Icon className="w-4 h-4 text-[#0d9488] mb-2.5" />
                    <div className="text-sm font-semibold text-[#0a0c12]">{r.title}</div>
                    <p className="mt-0.5 text-[13px] text-[#525965] leading-relaxed">{r.desc}</p>
                  </Link>
                );
              })}
            </div>
            <div className="mt-4 rounded-xl bg-[#0a0c12] text-white p-5">
              <h3 className="text-sm font-semibold">Prefer to see it first?</h3>
              <p className="mt-1 text-[13px] text-slate-300 leading-relaxed">
                Book a 30-minute demo and we'll run CreditDecide on one of your files.
              </p>
              <button
                onClick={() => setBookingOpen(true)}
                className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-white bg-white/10 hover:bg-white/15 border border-white/15 px-3.5 py-2 rounded-full transition-colors"
              >
                <CalendarDays className="w-4 h-4" /> Book a demo
              </button>
            </div>
          </div>
        </div>
      </section>

      <BookingModal
        open={bookingOpen}
        onClose={() => setBookingOpen(false)}
      />

      <SiteFooter />
    </div>
  );
}