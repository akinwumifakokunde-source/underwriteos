import React, { useState } from "react";
import HomeNav from "@/components/layout/HomeNav.jsx";
import SiteFooter from "@/components/home/SiteFooter.jsx";
import { Mail, MessageSquare, ArrowRight, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";

const CHANNELS = [
  { icon: Mail, title: "Email", value: "akinfaks@yahoo.com", href: "mailto:akinfaks@yahoo.com", desc: "For sales, security reviews, and data requests. We reply within one business day." },
  { icon: MessageSquare, title: "Product feedback", value: "Tell us what to build", href: "/onboarding", desc: "Feature requests and roadmap input from builders using the sandbox." },
];

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sent, setSent] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div className="min-h-screen bg-white text-[#0a0c12]">
      <HomeNav />
      <section className="max-w-3xl mx-auto px-5 sm:px-8 pt-16 sm:pt-24 pb-12">
        <div className="inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-[#525965] mb-5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#0d9488]" /> Contact
        </div>
        <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight leading-[1.05] text-[#0a0c12]">
          Talk to the team.
        </h1>
        <p className="mt-6 text-lg text-[#525965] leading-relaxed">
          Building with UnderwriteOS? Need a security review or a custom integration? Reach out — we work directly with
          lenders and fintechs on onboarding, data processing agreements, and production readiness.
        </p>
      </section>

      <section className="max-w-3xl mx-auto px-5 sm:px-8 pb-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {CHANNELS.map((c) => (
            <a
              key={c.title}
              href={c.href}
              className="rounded-2xl border border-[#eceef1] bg-white p-5 hover:border-[#0d9488] transition-colors"
            >
              <div className="w-9 h-9 rounded-lg bg-[#f7f8fa] border border-[#e5e7eb] flex items-center justify-center mb-3.5">
                <c.icon className="w-4 h-4 text-[#0d9488]" />
              </div>
              <div className="text-[11px] uppercase tracking-wider text-[#8a909c]">{c.title}</div>
              <div className="mt-1 text-base font-semibold text-[#0a0c12]">{c.value}</div>
              <p className="mt-1.5 text-sm text-[#525965] leading-relaxed">{c.desc}</p>
            </a>
          ))}
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-5 sm:px-8 pb-20">
        <div className="rounded-2xl border border-[#eceef1] bg-white p-6">
          <h2 className="text-lg font-semibold text-[#0a0c12] mb-1">Send a message</h2>
          <p className="text-sm text-[#525965] mb-5">We'll get back to you at the email you provide.</p>
          {sent ? (
            <div className="rounded-xl border border-[#e6f7f3] bg-[#e6f7f3] p-5 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-[#0d9488] shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-[#0a0c12]">Thanks — your message has been noted.</p>
                <p className="text-sm text-[#525965] mt-0.5">For a faster reply, email us directly at akinfaks@yahoo.com.</p>
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
              <div className="flex items-center justify-between">
                <Link to="/onboarding" className="inline-flex items-center gap-1.5 text-sm text-[#525965] hover:text-[#0a0c12]">
                  Or start building <ArrowRight className="w-4 h-4" />
                </Link>
                <button type="submit" className="inline-flex items-center gap-1.5 text-sm font-medium text-white bg-[#0a0c12] px-4 py-2.5 rounded-lg hover:bg-[#1c1f26] transition-colors">
                  Send message
                </button>
              </div>
            </form>
          )}
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}