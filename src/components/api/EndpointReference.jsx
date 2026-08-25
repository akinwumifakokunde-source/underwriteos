import React from "react";
import { ArrowRight } from "lucide-react";

const ENDPOINTS = [
  { group: "Borrowers", items: [
    { method: "POST", path: "/v1/borrowers", desc: "Create a borrower" },
    { method: "GET", path: "/v1/borrowers/{id}", desc: "Retrieve a borrower" },
  ]},
  { group: "Applications", items: [
    { method: "POST", path: "/v1/applications", desc: "Create a loan application" },
    { method: "GET", path: "/v1/applications/{id}", desc: "Retrieve an application" },
    { method: "GET", path: "/v1/applications", desc: "List applications" },
  ]},
  { group: "Data ingestion", items: [
    { method: "POST", path: "/v1/applications/{id}/documents", desc: "Upload a document" },
    { method: "POST", path: "/v1/applications/{id}/credit-report", desc: "Submit credit report data" },
    { method: "POST", path: "/v1/applications/{id}/bank-statement", desc: "Submit bank statement data" },
  ]},
  { group: "Intelligence", items: [
    { method: "POST", path: "/v1/applications/{id}/analyze", desc: "Start risk analysis (async job)" },
    { method: "POST", path: "/v1/applications/{id}/underwrite", desc: "Run underwriting evaluation" },
    { method: "GET", path: "/v1/applications/{id}/risk", desc: "Retrieve risk signals" },
    { method: "GET", path: "/v1/applications/{id}/evidence", desc: "Retrieve evidence" },
    { method: "GET", path: "/v1/applications/{id}/decision", desc: "Retrieve underwriting decision" },
    { method: "GET", path: "/v1/applications/{id}/audit", desc: "Retrieve audit trail" },
    { method: "GET", path: "/v1/jobs/{id}", desc: "Retrieve job status" },
  ]},
];

const methodColor = {
  POST: "text-emerald-700 bg-emerald-50 border-emerald-200",
  GET: "text-sky-700 bg-sky-50 border-sky-200",
};

export default function EndpointReference() {
  return (
    <div className="space-y-6">
      {ENDPOINTS.map((g) => (
        <div key={g.group}>
          <h3 className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">{g.group}</h3>
          <div className="space-y-1.5">
            {g.items.map((e) => (
              <div key={e.path + e.method} className="flex items-center gap-3 rounded-lg px-2.5 py-2 hover:bg-slate-50 transition-colors">
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${methodColor[e.method]} w-12 text-center`}>{e.method}</span>
                <code className="text-[12.5px] font-mono text-slate-700 flex-1">{e.path}</code>
                <span className="text-[11px] text-slate-400 hidden sm:block">{e.desc}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
      <div className="pt-2 border-t border-slate-100">
        <div className="flex items-center gap-2 text-[11px] text-slate-400">
          <ArrowRight className="w-3 h-3" />
          <span>All endpoints versioned. Auth via <code className="font-mono text-slate-500">Authorization: Bearer &lt;api_key&gt;</code></span>
        </div>
      </div>
    </div>
  );
}