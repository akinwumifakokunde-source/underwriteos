import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Loader2, CheckCircle2, AlertTriangle, Handshake, Globe2, Percent, Rocket, ShieldCheck, Users, CalendarDays } from "lucide-react";
import HomeNav from "@/components/home/HomeNav";
import SiteFooter from "@/components/home/SiteFooter";
import BookingModal from "@/components/booking/BookingModal";
import { base44 } from "@/api/base44Client";

const PARTNER_TYPES = ["Reseller", "Implementation partner", "Referral partner", "Technology partner"];

const BENEFITS = [
  {
    icon: Percent,
    title: "Recurring commission",
    body: "Earn a share of every CreditDecide subscription you bring live — and keep earning for as long as it stays active. The more lenders you deploy, the more durable your revenue becomes.",
  },
  {
    icon: Globe2,
    title: "Own your region",
    body: "Bring CreditDecide to the consumer lenders in your market. Local credit bureaus, open banking providers, KYC and regulatory profiles are already configured — so you can deploy faster, in the language and currency your customers expect.",
  },
  {
    icon: Rocket,
    title: "Deploy, not just refer",
    body: "This is a true deployment partnership. You run the implementation, configure your customers' markets and policies, and own the relationship end-to-end — not a one-off referral that ends at the handshake.",
  },
  {
    icon: ShieldCheck,
    title: "Co-branded, governed",
    body: "White-label the borrower experience for your customers while CreditDecide keeps policy enforcement, security and compliance running underneath. Your brand leads; the platform stays governed and audit-ready.",
  },
];

const STEPS = [
  { n: "01", title: "Apply", body: "Tell us about your business, region and the lenders you serve." },
  { n: "02", title: "Get approved", body: "We review fit, sign a partner agreement and provision your partner environment." },
  { n: "03", title: "Deploy", body: "Onboard your customers, configure their markets and policies, and go live." },
  { n: "04", title: "Earn", body: "Collect commission on every active subscription you bring to the platform." },
];

const inputCls = "w-full text-sm rounded-lg border border-[#d1d1d1] bg-white px-3.5 py-2.5 text-[#111] placeholder-[#a0a0a0] focus:outline-none focus:border-[#0a0c12] focus:ring-2 focus:ring-[#0a0c12]/10 transition";

export default function Partners() {
  const [form, setForm] = useState({
    company: "", contact_name: "", email: "", phone: "", country: "", website: "",
    partner_type: "", region: "", client_base: "", years: "", lending_focus: "", motivation: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState(null);
  const [bookingOpen, setBookingOpen] = useState(false);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await base44.functions.invoke("apiPartners", form);
      setDone(true);
    } catch (err) {
      setError(err?.response?.data?.error?.message || err.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <HomeNav />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-[#eceef1]">
        <div className="absolute inset-0 bg-gradient-to-b from-[#f0f7f4] via-white to-white" />
        <div className="relative max-w-3xl mx-auto px-5 sm:px-8 py-16 sm:py-24">
          <div className="inline-flex items-center gap-2 text-[11px] font-medium text-[#0a2e2a] mb-5 bg-[#0d9488]/10 border border-[#0d9488]/20 rounded-full px-3 py-1">
            <Handshake className="w-3.5 h-3.5" /> CreditDecide Partner Program
          </div>
          <h1 className="text-3xl sm:text-5xl font-semibold tracking-tight text-[#0a0c12] leading-[1.08]">
            Deploy CreditDecide to lenders in your region.
          </h1>
          <p className="mt-6 text-lg text-[#525965] leading-relaxed">
            Become a CreditDecide partner and bring AI-native underwriting to the consumer lenders you already
            serve. Resell, implement and own the customer relationship — and earn recurring commission on every
            deployment that goes live.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <a href="#apply" className="group inline-flex items-center gap-1.5 text-sm font-medium text-white bg-[#0a0c12] px-5 py-3 rounded-full hover:bg-[#1c1f26] transition-all shadow-sm">
              Apply to partner <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </a>
            <button
              onClick={() => setBookingOpen(true)}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-[#0a0c12] bg-white border border-[#e6e8eb] px-5 py-3 rounded-full hover:bg-[#f7f8fa] transition-all"
            >
              <CalendarDays className="w-4 h-4" /> Book a partner intro <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="max-w-5xl mx-auto px-5 sm:px-8 py-14 sm:py-20">
        <div className="mb-8 max-w-2xl">
          <h2 className="text-2xl sm:text-3xl font-semibold text-[#0a0c12] tracking-tight">Why partner with us</h2>
          <p className="mt-2 text-sm text-[#525965] leading-relaxed">
            A partner program built for teams who deploy, not just refer — with the economics, tooling and governance to match.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {BENEFITS.map((b) => {
            const Icon = b.icon;
            return (
              <div
                key={b.title}
                className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md hover:border-[#0d9488]/30 transition-all duration-200"
              >
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-[#0d9488]/15 to-[#0d9488]/5 mb-4 group-hover:scale-105 transition-transform">
                  <Icon className="w-5 h-5 text-[#0d9488]" />
                </div>
                <h3 className="text-base font-semibold text-slate-900 mb-2">{b.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{b.body}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-[#0a0c12] text-white">
        <div className="max-w-5xl mx-auto px-5 sm:px-8 py-16 sm:py-24">
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight mb-2">How the program works</h2>
          <p className="text-sm text-slate-400 mb-10 max-w-xl">
            A clear path from application to earning — built for partners who deploy, not just refer.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {STEPS.map((s) => (
              <div key={s.n} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                <div className="text-[10px] font-mono text-[#34d399] mb-2">{s.n}</div>
                <h3 className="text-sm font-semibold mb-1">{s.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Form */}
      <section id="apply" className="max-w-3xl mx-auto px-5 sm:px-8 py-14 sm:py-20">
        {done ? (
          <div className="max-w-md mx-auto text-center">
            <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 bg-[#e8f5e9]">
              <CheckCircle2 className="w-7 h-7 text-[#0a2e2a]" />
            </div>
            <h1 className="text-2xl font-semibold text-[#0a0c12]">Application received.</h1>
            <p className="mt-2 text-sm text-[#525965] leading-relaxed">
              Thanks for applying to the CreditDecide Partner Program. Our partnerships team will review your
              application and reach out within a few business days.
            </p>
            <Link to="/" className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-[#0d9488]">
              Back to home <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div>
            <h2 className="text-2xl font-semibold text-[#0a0c12] mb-1">Apply to become a partner</h2>
            <p className="text-sm text-[#525965] mb-4">
              Tell us about your business and the region you'd deploy CreditDecide into. We'll be in touch.
            </p>
            <button
              onClick={() => setBookingOpen(true)}
              className="mb-8 inline-flex items-center gap-1.5 text-sm font-medium text-[#0d9488] hover:text-[#0a2e2a] transition-colors"
            >
              <CalendarDays className="w-4 h-4" /> Prefer to talk first? Book a partner intro
            </button>
            <form onSubmit={submit} className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-4">
              {error && (
                <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm text-rose-700 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" /> {error}
                </div>
              )}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#111] mb-1.5">Company <span className="text-rose-500">*</span></label>
                  <input className={inputCls} required value={form.company} onChange={(e) => set("company", e.target.value)} placeholder="Acme Lending Solutions" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#111] mb-1.5">Contact name <span className="text-rose-500">*</span></label>
                  <input className={inputCls} required value={form.contact_name} onChange={(e) => set("contact_name", e.target.value)} placeholder="Jane Doe" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#111] mb-1.5">Work email <span className="text-rose-500">*</span></label>
                  <input type="email" className={inputCls} required value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="jane@acme.com" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#111] mb-1.5">Phone</label>
                  <input className={inputCls} value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+44 7700 900000" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#111] mb-1.5">Country / HQ <span className="text-rose-500">*</span></label>
                  <input className={inputCls} required value={form.country} onChange={(e) => set("country", e.target.value)} placeholder="United Kingdom" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#111] mb-1.5">Website</label>
                  <input className={inputCls} value={form.website} onChange={(e) => set("website", e.target.value)} placeholder="https://acme.com" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#111] mb-1.5">Partner type <span className="text-rose-500">*</span></label>
                  <select className={inputCls} required value={form.partner_type} onChange={(e) => set("partner_type", e.target.value)}>
                    <option value="">Select…</option>
                    {PARTNER_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#111] mb-1.5">Years in operation</label>
                  <input className={inputCls} value={form.years} onChange={(e) => set("years", e.target.value)} placeholder="e.g. 5" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#111] mb-1.5">Regions / markets you'd deploy into</label>
                <input className={inputCls} value={form.region} onChange={(e) => set("region", e.target.value)} placeholder="e.g. West Africa — Nigeria, Ghana, Kenya" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#111] mb-1.5">Current client base</label>
                <input className={inputCls} value={form.client_base} onChange={(e) => set("client_base", e.target.value)} placeholder="e.g. 12 consumer lenders, ~$40M originations/yr" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#111] mb-1.5">Lending focus</label>
                <textarea rows={3} className={inputCls} value={form.lending_focus} onChange={(e) => set("lending_focus", e.target.value)} placeholder="Which lending products and markets do your customers operate in?" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#111] mb-1.5">Why do you want to partner with CreditDecide?</label>
                <textarea rows={4} className={inputCls} value={form.motivation} onChange={(e) => set("motivation", e.target.value)} placeholder="How would you deploy CreditDecide to your customers, and what value do you bring?" />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full inline-flex items-center justify-center gap-2.5 text-sm font-medium text-white bg-[#0a0c12] px-5 py-3 rounded-full hover:bg-[#1c1f26] disabled:opacity-70 transition-all mt-2"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Users className="w-4 h-4" />}
                Submit application
              </button>
            </form>
          </div>
        )}
      </section>

      <BookingModal
        open={bookingOpen}
        onClose={() => setBookingOpen(false)}
        title="Let's talk partnerships."
        subtitle="Book a 30-minute intro with the CreditDecide partnerships team."
        eventTitle="Partner Intro"
        eventDescription="A 30-minute intro call to explore fit, your region and the lenders you'd deploy CreditDecide to. We'll walk through the program, economics and what a deployment looks like."
        meetingType="partner"
      />

      <SiteFooter />
    </div>
  );
}