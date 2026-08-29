import React, { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import Nav from "@/components/layout/Nav";
import { UploadCloud, FileSpreadsheet, Loader2, CheckCircle2, XCircle, Download, ArrowRight } from "lucide-react";

const MARKETS = [
  { code: "GB", label: "United Kingdom", policy: "consumer-v1" },
  { code: "US", label: "United States", policy: "us-consumer-v2" },
  { code: "NG", label: "Nigeria", policy: "ng-consumer-v1" },
  { code: "ZA", label: "South Africa", policy: "za-consumer-v1" },
  { code: "KE", label: "Kenya", policy: "ke-consumer-v1" },
  { code: "GH", label: "Ghana", policy: "gh-consumer-v1" },
];

const BORROWER_TYPES = [
  { value: "salaried", label: "Salaried" },
  { value: "self_employed", label: "Self-employed" },
  { value: "business", label: "Business" },
];

const REQUIRED = ["first_name", "last_name", "loan_amount"];

// Minimal RFC-4180-ish CSV parser (handles quoted fields + commas inside quotes).
function parseCsv(text) {
  const rows = [];
  let row = [], field = "", inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else inQuotes = false;
      } else field += c;
    } else {
      if (c === '"') inQuotes = true;
      else if (c === ",") { row.push(field); field = ""; }
      else if (c === "\n" || c === "\r") {
        if (c === "\r" && text[i + 1] === "\n") i++;
        row.push(field); rows.push(row); row = []; field = "";
      } else field += c;
    }
  }
  if (field !== "" || row.length) { row.push(field); rows.push(row); }
  return rows.filter((r) => r.some((c) => c.trim() !== ""));
}

function toRows(raw) {
  const lines = parseCsv(raw);
  if (lines.length < 2) return [];
  const headers = lines[0].map((h) => h.trim().toLowerCase());
  return lines.slice(1).map((line) => {
    const obj = {};
    headers.forEach((h, i) => { obj[h] = (line[i] || "").trim(); });
    return obj;
  });
}

const TEMPLATE = "first_name,last_name,email,annual_income,employment_status,employer_name,loan_amount,loan_term_months,loan_purpose\nJane,Doe,jane@example.com,48000,employed,Acme Ltd,12000,24,debt_consolidation\nJohn,Smith,john@example.com,36000,employed,Globex,8000,12,home_improvement";

function downloadTemplate() {
  const blob = new Blob([TEMPLATE], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = "batch-template.csv"; a.click();
  URL.revokeObjectURL(url);
}

function fmtMoney(n, c) {
  try { return new Intl.NumberFormat("en-US", { style: "currency", currency: (c || "GBP").toUpperCase(), maximumFractionDigits: 0 }).format(n || 0); }
  catch { return String(n || 0); }
}

const CONCURRENCY = 4;

async function pool(items, fn, onItem) {
  let i = 0;
  const workers = Array.from({ length: Math.min(CONCURRENCY, items.length) }, async () => {
    while (i < items.length) {
      const idx = i++;
      try { await fn(items[idx], idx); }
      catch (e) { /* onItem handles error state */ }
    }
  });
  await Promise.all(workers);
}

export default function BatchUnderwrite() {
  const [market, setMarket] = useState("GB");
  const [borrowerType, setBorrowerType] = useState("salaried");
  const [productType, setProductType] = useState("personal_loan");
  const [rows, setRows] = useState([]);
  const [fileName, setFileName] = useState("");
  const [parseError, setParseError] = useState(null);
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState({}); // index -> { status, application_id?, decision?, risk_score?, pd?, error? }
  const inputRef = useRef(null);

  const marketCfg = MARKETS.find((m) => m.code === market);

  const handleFile = async (file) => {
    setParseError(null);
    if (!file) return;
    setFileName(file.name);
    try {
      const text = await file.text();
      const parsed = toRows(text);
      if (parsed.length === 0) { setParseError("CSV is empty or has no data rows."); setRows([]); return; }
      const missing = parsed.findIndex((r) => REQUIRED.some((k) => !r[k]));
      if (missing !== -1) { setParseError(`Row ${missing + 2} is missing required fields (first_name, last_name, loan_amount).`); setRows([]); return; }
      setRows(parsed);
      setResults({});
    } catch (e) {
      setParseError("Could not read the file. Please upload a valid CSV.");
    }
  };

  const runBatch = async () => {
    if (rows.length === 0 || running) return;
    setRunning(true);
    const init = {};
    rows.forEach((_, i) => { init[i] = { status: "queued" }; });
    setResults({ ...init });

    const processRow = async (r, idx) => {
      setResults((prev) => ({ ...prev, [idx]: { ...prev[idx], status: "processing" } }));
      try {
        const policyId = marketCfg.policy;
        const borrowerRes = await base44.functions.invoke("apiBorrowers", {
          action: "create",
          first_name: r.first_name, last_name: r.last_name, email: r.email || undefined,
          employment_status: r.employment_status || "employed", employer_name: r.employer_name || undefined,
          annual_income: r.annual_income ? Number(r.annual_income) : undefined,
          income_currency: marketCfg.currency,
        });
        const borrowerId = borrowerRes.data.borrower_id;
        const appRes = await base44.functions.invoke("apiApplications", {
          action: "create",
          borrower_id: borrowerId,
          loan_amount: Number(r.loan_amount),
          loan_term_months: r.loan_term_months ? Number(r.loan_term_months) : 12,
          loan_purpose: r.loan_purpose || "general",
          market, borrower_type: borrowerType, product_type: productType,
          policy_id: policyId,
        });
        const appId = appRes.data.application_id;
        await base44.functions.invoke("apiAnalyze", { application_id: appId });
        const uwRes = await base44.functions.invoke("apiUnderwrite", { application_id: appId, policy_id: policyId });
        const dec = uwRes.data.decision;
        setResults((prev) => ({
          ...prev,
          [idx]: {
            status: "done", application_id: appId,
            decision: dec.decision, risk_score: dec.risk_score, pd: dec.probability_of_default,
            borrower_name: `${r.first_name} ${r.last_name}`,
          },
        }));
      } catch (e) {
        setResults((prev) => ({
          ...prev,
          [idx]: { status: "error", error: e?.response?.data?.error?.message || e.message || "Failed", borrower_name: `${r.first_name} ${r.last_name}` },
        }));
      }
    };

    await pool(rows, processRow);
    setRunning(false);
  };

  const done = Object.values(results).filter((r) => r.status === "done");
  const failed = Object.values(results).filter((r) => r.status === "error");
  const counts = {
    APPROVE: done.filter((r) => r.decision === "APPROVE").length,
    REVIEW: done.filter((r) => r.decision === "REVIEW").length,
    DECLINE: done.filter((r) => r.decision === "DECLINE").length,
  };

  const exportResults = () => {
    const header = "first_name,last_name,application_id,decision,risk_score,probability_of_default,error\n";
    const lines = rows.map((r, i) => {
      const res = results[i] || {};
      const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
      return [
        esc(r.first_name), esc(r.last_name), esc(res.application_id || ""),
        esc(res.decision || ""), esc(res.risk_score ?? ""), esc(res.pd ?? ""),
        esc(res.error || ""),
      ].join(",");
    }).join("\n");
    const blob = new Blob([header + lines], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "batch-results.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  const overall = running || done.length + failed.length > 0;

  return (
    <div className="min-h-screen bg-[#f7f8fa]">
      <Nav />
      <div className="max-w-5xl mx-auto px-5 sm:px-8 py-10">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-[#525965] mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0d9488]" /> Portfolio
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-[#0a0c12]">Batch underwriting</h1>
          <p className="mt-2 text-[15px] text-[#525965] max-w-2xl leading-relaxed">
            Upload a CSV of applicants and underwrite the whole portfolio in one run. Each row creates a
            borrower and application, runs the analysis pipeline, and returns a decision — with full evidence
            lineage per application.
          </p>
        </div>

        {/* Config + upload */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
            <div>
              <label className="block text-[12px] font-medium text-slate-700 mb-1">Market</label>
              <select value={market} onChange={(e) => setMarket(e.target.value)} disabled={running}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-[13px] outline-none focus:border-teal-500 bg-white disabled:opacity-60">
                {MARKETS.map((m) => <option key={m.code} value={m.code}>{m.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[12px] font-medium text-slate-700 mb-1">Borrower type</label>
              <select value={borrowerType} onChange={(e) => setBorrowerType(e.target.value)} disabled={running}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-[13px] outline-none focus:border-teal-500 bg-white disabled:opacity-60">
                {BORROWER_TYPES.map((b) => <option key={b.value} value={b.value}>{b.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[12px] font-medium text-slate-700 mb-1">Product type</label>
              <input value={productType} onChange={(e) => setProductType(e.target.value)} disabled={running}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-[13px] outline-none focus:border-teal-500 disabled:opacity-60" />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <label className="flex-1 cursor-pointer">
              <input ref={inputRef} type="file" accept=".csv" className="hidden"
                onChange={(e) => handleFile(e.target.files?.[0])} />
              <div className="rounded-xl border-2 border-dashed border-slate-200 hover:border-teal-400 transition-colors px-4 py-6 flex flex-col items-center justify-center text-center">
                <UploadCloud className="w-7 h-7 text-slate-300 mb-2" />
                <span className="text-[13px] font-medium text-slate-700">{fileName || "Drop a CSV here or click to upload"}</span>
                <span className="text-[11px] text-slate-400 mt-0.5">Columns: first_name, last_name, email, annual_income, employment_status, employer_name, loan_amount, loan_term_months, loan_purpose</span>
              </div>
            </label>
            <button onClick={downloadTemplate}
              className="shrink-0 inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-[13px] text-slate-700 hover:bg-slate-50">
              <FileSpreadsheet className="w-4 h-4" /> Template
            </button>
          </div>

          {parseError && (
            <div className="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-[12px] text-rose-700">{parseError}</div>
          )}

          {rows.length > 0 && (
            <div className="mt-4 flex items-center justify-between">
              <span className="text-[12px] text-slate-500">{rows.length} applicants parsed · market {market} ({marketCfg.currency})</span>
              <button onClick={runBatch} disabled={running}
                className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 text-white text-[13px] font-medium px-4 py-2 hover:bg-slate-800 disabled:opacity-50">
                {running ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                {running ? "Underwriting…" : `Underwrite ${rows.length} applications`}
              </button>
            </div>
          )}
        </div>

        {/* Summary */}
        {overall && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
            {[
              { label: "Processed", value: done.length + failed.length, total: rows.length, tint: "text-slate-900" },
              { label: "Approved", value: counts.APPROVE, tint: "text-emerald-600" },
              { label: "Review", value: counts.REVIEW, tint: "text-amber-600" },
              { label: "Declined", value: counts.DECLINE, tint: "text-rose-600" },
              { label: "Failed", value: failed.length, tint: "text-slate-500" },
            ].map((s) => (
              <div key={s.label} className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="text-[12px] text-slate-500">{s.label}</div>
                <div className={`mt-1 text-2xl font-semibold tracking-tight ${s.tint}`}>
                  {s.value}{s.total !== undefined ? <span className="text-sm text-slate-300"> / {s.total}</span> : null}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Results table */}
        {rows.length > 0 && (
          <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100">
              <h2 className="text-[14px] font-semibold text-slate-900">Results</h2>
              {done.length + failed.length > 0 && (
                <button onClick={exportResults} className="inline-flex items-center gap-1.5 text-[12px] text-slate-600 hover:text-slate-900">
                  <Download className="w-3.5 h-3.5" /> Export CSV
                </button>
              )}
            </div>
            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full text-[12px]">
                <thead>
                  <tr className="text-left text-slate-400 border-b border-slate-100">
                    <th className="font-medium py-2.5 px-5">Applicant</th>
                    <th className="font-medium py-2.5 px-3">Loan</th>
                    <th className="font-medium py-2.5 px-3">Status</th>
                    <th className="font-medium py-2.5 px-3">Decision</th>
                    <th className="font-medium py-2.5 px-3">Risk score</th>
                    <th className="font-medium py-2.5 px-3">PD</th>
                    <th className="font-medium py-2.5 px-5"></th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, i) => {
                    const res = results[i] || { status: "queued" };
                    return (
                      <tr key={i} className="border-b border-slate-50">
                        <td className="py-2.5 px-5 text-slate-900">{r.first_name} {r.last_name}</td>
                        <td className="py-2.5 px-3 text-slate-600">{fmtMoney(r.loan_amount, marketCfg.currency)}</td>
                        <td className="py-2.5 px-3">
                          {res.status === "processing" && <span className="inline-flex items-center gap-1 text-slate-500"><Loader2 className="w-3 h-3 animate-spin" /> processing</span>}
                          {res.status === "queued" && <span className="text-slate-400">queued</span>}
                          {res.status === "done" && <span className="inline-flex items-center gap-1 text-emerald-600"><CheckCircle2 className="w-3.5 h-3.5" /> done</span>}
                          {res.status === "error" && <span className="inline-flex items-center gap-1 text-rose-600" title={res.error}><XCircle className="w-3.5 h-3.5" /> error</span>}
                        </td>
                        <td className="py-2.5 px-3">
                          {res.decision ? (
                            <span className={`rounded px-1.5 py-0.5 text-[11px] font-medium ${
                              res.decision === "APPROVE" ? "bg-emerald-50 text-emerald-700" :
                              res.decision === "REVIEW" ? "bg-amber-50 text-amber-700" :
                              "bg-rose-50 text-rose-700"}`}>{res.decision}</span>
                          ) : <span className="text-slate-300">—</span>}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-slate-600">{res.risk_score != null ? res.risk_score.toFixed(2) : "—"}</td>
                        <td className="py-2.5 px-3 font-mono text-slate-600">{res.pd != null ? `${(res.pd * 100).toFixed(1)}%` : "—"}</td>
                        <td className="py-2.5 px-5 text-right">
                          {res.application_id ? (
                            <Link to={`/applications/${res.application_id}`} className="text-teal-600 hover:text-teal-700 text-[11px] font-medium">Open →</Link>
                          ) : <span className="text-slate-300">—</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}