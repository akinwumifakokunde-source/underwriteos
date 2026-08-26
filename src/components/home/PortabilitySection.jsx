import React from "react";
import { Globe2, ShieldCheck, ArrowRight } from "lucide-react";

export default function PortabilitySection() {
  return (
    <section className="border-t border-[#eceef1]">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-20">
        <div className="max-w-2xl mb-10">
          <div className="inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-[#0d9488] mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0d9488]" /> Cross-border portability
          </div>
          <h2 className="text-4xl sm:text-5xl font-semibold tracking-tight text-[#0a0c12] leading-[1.05]">
            A credit profile that travels with the borrower.
          </h2>
          <p className="mt-5 text-lg text-[#525965] leading-relaxed">
            A borrower underwritten in Lagos shouldn't start from zero in London. UnderwriteOS attests a
            normalized credit profile and ingests it into a new-region application — so a UK decision can
            cite a Nigerian bureau record with full provenance, and the evidence graph carries across.
          </p>
        </div>

        <div className="rounded-2xl border border-[#eceef1] bg-white p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-stretch gap-3">
            <RegionCard
              flag="🇳🇬"
              region="Nigeria"
              provider="CRC"
              note="Origin bureau pull"
              tone="origin"
            />
            <div className="flex sm:flex-col items-center justify-center gap-1 text-[#8a909c]">
              <span className="hidden sm:block text-xs font-medium">attest</span>
              <ArrowRight className="w-4 h-4 rotate-90 sm:rotate-0" />
            </div>
            <AttestationCard />
            <div className="flex sm:flex-col items-center justify-center gap-1 text-[#8a909c]">
              <span className="hidden sm:block text-xs font-medium">import</span>
              <ArrowRight className="w-4 h-4 rotate-90 sm:rotate-0" />
            </div>
            <RegionCard
              flag="🇬🇧"
              region="United Kingdom"
              provider="Experian"
              note="Portable profile ingested"
              tone="target"
            />
          </div>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Point
              icon={ShieldCheck}
              title="Attested, not copied blindly"
              body="A SHA-256 attestation hash over the canonical profile fields ties the ported data to its origin. Tampering breaks the hash."
            />
            <Point
              icon={Globe2}
              title="Provenance preserved"
              body="The target decision's credit signals trace to a CreditReport marked portable, recording the origin application, provider, and attestation."
            />
            <Point
              icon={ArrowRight}
              title="One borrower, many markets"
              body="Lenders expanding across regions reuse underwriting work already done — no re-pulling bureaus, no blank-slate applicants."
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function RegionCard({ flag, region, provider, note, tone }) {
  const accent = tone === "origin" ? "border-[#e5e7eb]" : "border-[#99e6d8] bg-[#f0fdfa]";
  return (
    <div className={`flex-1 rounded-xl border ${accent} p-4`}>
      <div className="text-2xl">{flag}</div>
      <div className="mt-2 text-sm font-semibold text-[#0a0c12]">{region}</div>
      <div className="text-xs text-[#525965]">provider: {provider}</div>
      <div className="mt-2 text-[11px] font-mono text-[#8a909c]">{note}</div>
    </div>
  );
}

function AttestationCard() {
  return (
    <div className="flex-1 rounded-xl border border-[#0a0c12] bg-[#0a0c12] text-white p-4">
      <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-[#9be7d8]">
        <ShieldCheck className="w-3.5 h-3.5" /> Attested profile
      </div>
      <div className="mt-2 text-sm font-semibold">Portable credit passport</div>
      <div className="mt-2 font-mono text-[10px] text-[#a0a4ab] break-all">
        attestation: 7f3a9c21e8…b4d2
      </div>
      <div className="mt-1 font-mono text-[10px] text-[#6b6f76]">normalized · provider-pinned</div>
    </div>
  );
}

function Point({ icon: Icon, title, body }) {
  return (
    <div className="rounded-lg border border-[#eceef1] bg-[#fbfcfd] p-4">
      <Icon className="w-4 h-4 text-[#0d9488]" />
      <p className="mt-2 text-sm font-medium text-[#0a0c12]">{title}</p>
      <p className="mt-1 text-[13px] text-[#525965] leading-relaxed">{body}</p>
    </div>
  );
}