import React from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import { ArrowRight, Check, FileText, ShieldCheck, Database, GitBranch, Gauge, Scale, FileCheck2, LineChart } from "lucide-react";
import HomeNav from "@/components/home/HomeNav";
import SiteFooter from "@/components/home/SiteFooter";
import {
  getJurisdiction,
  getKycConfig,
  getDocumentRequirements,
} from "@/lib/jurisdictions";
import { DEFAULT_FIELDS, FIELD_META } from "@/lib/formFields";

const FLAGS = { GB: "🇬🇧", US: "🇺🇸", NG: "🇳🇬", ZA: "🇿🇦", KE: "🇰🇪", GH: "🇬🇭", OT: "🌐" };

export default function MarketDetail() {
  const { code } = useParams();
  const upper = (code || "").toUpperCase();
  const jur = getJurisdiction(upper);
  if (!jur || (upper !== "OT" && !FLAGS[upper])) {
    return <Navigate to="/features" replace />;
  }
  const marketCode = jur.code;
  const kyc = getKycConfig(marketCode);
  const docs = getDocumentRequirements(marketCode, jur.policies[0]?.id, "salaried");
  const enabledFields = DEFAULT_FIELDS.filter((f) => f.enabled);

  // market-specific data sources from the shared backend config (mirrored here)
  const SOURCES = {
    GB: { bureau: "Experian", open: "TrueLayer" },
    US: { bureau: "Experian", open: "Plaid" },
    NG: { bureau: "CRC", open: "Okra" },
    ZA: { bureau: "XDS", open: "Stitch" },
    KE: { bureau: "CRB Africa", open: "Okra" },
    GH: { bureau: "XDS Ghana", open: "Mono" },
    OT: { bureau: "Licensed credit bureau", open: "Open banking provider" },
  };
  const src = SOURCES[marketCode] || SOURCES.OT;

  const FLOW = [
    { icon: FileText, title: "Borrower applies", detail: `White-label form collects personal, contact, employment and loan details — plus ${kyc.map((k) => k.label).join(" & ") || "market KYC"}.` },
    { icon: ShieldCheck, title: "KYC & identity", detail: kyc.length ? kyc.map((k) => `${k.label} — ${k.hint}`).join(" · ") : "Government-issued ID verified against bureau records." },
    { icon: FileCheck2, title: "Document intelligence", detail: docs.map((d) => d.label).join(", ") + " — auto-classified, extracted and verified." },
    { icon: Database, title: "Data sources connected", detail: `Credit bureau (${src.bureau}) and open banking (${src.open}) — or uploaded documents — normalized into canonical profiles.` },
    { icon: GitBranch, title: "Risk signals & evidence", detail: "Credit, affordability, fraud and data-quality signals, each traced to its source field." },
    { icon: Scale, title: "Policy evaluation", detail: `Applied under ${jur.policies[0]?.label || "your policy"} — ${jur.policies.length} policies available, versioned and never overwritten.` },
    { icon: Gauge, title: "Explainable decision", detail: "APPROVE / REVIEW / DECLINE with an evidence-referenced credit memo and audit trail." },
    { icon: LineChart, title: "Monitoring & outcomes", detail: "Track loan performance against predicted default; calibrate the model over time." },
  ];

  return (
    <div className="min-h-screen bg-white">
      <HomeNav />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-[#eceef1]">
        <div className="absolute inset-0 bg-gradient-to-b from-[#f0f7f4] via-white to-white" />
        <div className="relative max-w-5xl mx-auto px-5 sm:px-8 py-16 sm:py-20">
          <Link to="/features" className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-800 mb-6">
            ← All markets
          </Link>
          <div className="flex items-center gap-4 mb-5">
            <span className="text-5xl leading-none">{FLAGS[marketCode]}</span>
            <div>
              <h1 className="text-3xl sm:text-5xl font-semibold tracking-tight text-[#0a0c12] leading-[1.05]">
                {jur.name}
              </h1>
              <p className="mt-1 text-sm text-slate-500">{jur.regulatoryProfile}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#0a2e2a] bg-[#0d9488]/10 border border-[#0d9488]/20 rounded-full px-3 py-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0d9488]" /> {jur.currency}
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 bg-slate-100 border border-slate-200 rounded-full px-3 py-1">
              Credit: {src.bureau}
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 bg-slate-100 border border-slate-200 rounded-full px-3 py-1">
              Open banking: {src.open}
            </span>
          </div>
          <div className="mt-8 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <Link to="/start/borrower" className="inline-flex items-center gap-2 text-sm font-medium text-white bg-[#0a0c12] pl-4 pr-5 py-2.5 rounded-full hover:bg-[#1a2021] transition-colors">
              Try CreditDecide <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/demo" className="text-sm font-medium text-slate-700 hover:text-[#0d9488] transition-colors">
              Book a demo →
            </Link>
          </div>
        </div>
      </section>

      {/* Application form + documents */}
      <section className="max-w-5xl mx-auto px-5 sm:px-8 py-14 sm:py-20">
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Application form */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900 mb-1">Application form</h2>
            <p className="text-sm text-slate-500 mb-6">Fields collected from the borrower in {jur.name}.</p>
            <div className="space-y-2">
              {enabledFields.map((f) => (
                <div key={f.key} className="flex items-center justify-between gap-3 py-2 border-b border-slate-100 last:border-0">
                  <div>
                    <div className="text-sm font-medium text-slate-800">{f.label}</div>
                    <div className="text-xs text-slate-400">{FIELD_META[f.key]?.type || "text"}</div>
                  </div>
                  {f.required ? (
                    <span className="text-[10px] font-semibold text-[#0a2e2a] bg-[#0d9488]/10 rounded-full px-2 py-0.5">Required</span>
                  ) : (
                    <span className="text-[10px] font-medium text-slate-400 bg-slate-100 rounded-full px-2 py-0.5">Optional</span>
                  )}
                </div>
              ))}
              {/* market KYC fields */}
              {kyc.map((k) => (
                <div key={k.key} className="flex items-center justify-between gap-3 py-2 border-b border-slate-100 last:border-0">
                  <div>
                    <div className="text-sm font-medium text-[#0a2e2a]">{k.label}</div>
                    <div className="text-xs text-slate-500">{k.hint}</div>
                  </div>
                  <span className="text-[10px] font-semibold text-white bg-[#0d9488] rounded-full px-2 py-0.5">KYC</span>
                </div>
              ))}
            </div>
          </div>

          {/* Documents required */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900 mb-1">Documents required</h2>
            <p className="text-sm text-slate-500 mb-6">Auto-classified and extracted by document intelligence.</p>
            <div className="space-y-3">
              {docs.map((d) => (
                <div key={d.type + d.label} className="flex items-start gap-3">
                  <span className={`mt-0.5 inline-flex items-center justify-center w-5 h-5 rounded-full shrink-0 ${d.required ? "bg-[#0d9488] text-white" : "bg-slate-100 text-slate-400"}`}>
                    {d.required ? <Check className="w-3 h-3" /> : <span className="text-[10px]">·</span>}
                  </span>
                  <div>
                    <div className="text-sm font-medium text-slate-800">{d.label}</div>
                    <div className="text-xs text-slate-500">{d.detail}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Policies & products */}
      <section className="max-w-5xl mx-auto px-5 sm:px-8 pb-14 sm:pb-20">
        <div className="grid sm:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-slate-200 bg-[#f8faf9] p-6 sm:p-8">
            <h3 className="text-sm font-mono uppercase tracking-[0.16em] text-slate-500 mb-4">Available policies</h3>
            <div className="flex flex-wrap gap-2">
              {jur.policies.map((p) => (
                <span key={p.id} className="text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg px-3 py-1.5">{p.label}</span>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-[#f8faf9] p-6 sm:p-8">
            <h3 className="text-sm font-mono uppercase tracking-[0.16em] text-slate-500 mb-4">Loan products</h3>
            <div className="flex flex-wrap gap-2">
              {jur.products.map((p) => (
                <span key={p.value} className="text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg px-3 py-1.5">{p.label}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* End-to-end flow */}
      <section className="bg-[#0a0c12] text-white">
        <div className="max-w-5xl mx-auto px-5 sm:px-8 py-16 sm:py-24">
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight mb-2">End-to-end underwriting flow</h2>
          <p className="text-sm text-slate-400 mb-10 max-w-2xl">
            Every application in {jur.name} moves through one governed pipeline — from intake to
            explainable decision and post-decision monitoring.
          </p>
          <ol className="relative border-l border-white/10 ml-3">
            {FLOW.map((s, i) => {
              const Icon = s.icon;
              return (
                <li key={s.title} className="mb-10 pl-8 last:mb-0">
                  <span className="absolute -left-[13px] flex items-center justify-center w-6 h-6 rounded-full bg-[#0d9488] text-white">
                    <Icon className="w-3.5 h-3.5" />
                  </span>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-mono text-[#34d399]">{String(i + 1).padStart(2, "0")}</span>
                    <h3 className="text-base font-semibold">{s.title}</h3>
                  </div>
                  <p className="text-sm text-slate-400 leading-relaxed">{s.detail}</p>
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}