import React from "react";

const REQUEST = `curl -X POST https://api.underwriteos.com/v1/applications \\
  -H "Authorization: Bearer uw_live_••••" \\
  -H "Idempotency-Key: req_8f3a2c" \\
  -d '{
    "borrower_id": "brw_7Hk2",
    "loan_amount": 12000,
    "loan_currency": "GBP",
    "loan_term_months": 24,
    "policy_id": "consumer-v1"
  }'`;

const RESPONSE = `{
  "data": {
    "application_id": "app_9Xc1",
    "status": "completed",
    "decision": "APPROVE",
    "risk_score": 0.34,
    "probability_of_default": 0.061,
    "confidence": 0.88,
    "human_review_required": false,
    "reasons": [
      "dti_within_policy",
      "stable_income",
      "no_recent_delinquency"
    ]
  },
  "request_id": "req_8f3a2c"
}`;

export default function CodePreview() {
  return (
    <section className="max-w-7xl mx-auto px-5 sm:px-8 pb-20">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
        <div className="lg:col-span-5">
          <div className="inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-[#a0a5b0] mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00e6b8]" /> One request, one decision
          </div>
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white leading-tight">
            A response your underwriters and auditors can trust.
          </h2>
          <p className="mt-4 text-[#a0a5b0] leading-relaxed">
            Every decision ships with a request ID, an evidence graph, and the policy rules that fired. No black
            boxes — just structured, replayable reasoning your compliance team can stand behind.
          </p>
          <ul className="mt-6 space-y-2.5">
            {[
              "Idempotency keys on every mutation",
              "Sandbox and production isolation",
              "Webhooks for async analysis & decisions",
              "Full audit trail per application",
            ].map((t) => (
              <li key={t} className="flex items-center gap-2.5 text-sm text-[#c7ccd6]">
                <span className="w-1 h-1 rounded-full bg-[#00e6b8]" />
                {t}
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:col-span-7 space-y-4">
          <div className="rounded-2xl border border-[#2a2f3a] bg-[#0c0f17] overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-[#1c2029]">
              <span className="w-2.5 h-2.5 rounded-full bg-[#2a2f3a]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#2a2f3a]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#2a2f3a]" />
              <span className="ml-2 text-[11px] font-mono text-[#5b6472]">request.sh</span>
              <span className="ml-auto text-[10px] font-mono text-[#00e6b8] border border-[#1c2029] rounded px-1.5 py-0.5">
                POST
              </span>
            </div>
            <pre className="p-4 text-[12px] font-mono text-[#c7ccd6] leading-relaxed overflow-x-auto">
              {REQUEST}
            </pre>
          </div>
          <div className="rounded-2xl border border-[#2a2f3a] bg-[#0c0f17] overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-[#1c2029]">
              <span className="text-[11px] font-mono text-[#5b6472]">response.json</span>
              <span className="ml-auto text-[10px] font-mono text-emerald-400 border border-[#1c2029] rounded px-1.5 py-0.5">
                200 OK
              </span>
            </div>
            <pre className="p-4 text-[12px] font-mono text-[#c7ccd6] leading-relaxed overflow-x-auto">
              {RESPONSE}
            </pre>
          </div>
        </div>
      </div>
    </section>
  );
}