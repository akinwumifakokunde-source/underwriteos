import React, { useEffect, useState } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { withApiKey, hasApiKey } from "@/lib/apiKey";
import Nav from "@/components/layout/Nav.jsx";
import EvidenceGraphView from "@/components/evidence/EvidenceGraphView.jsx";
import { Loader2, FileSearch, ArrowRight, KeyRound, Globe2, X } from "lucide-react";

export default function EvidenceGraph() {
  const { applicationId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialId = applicationId || searchParams.get("app") || "";

  const [apps, setApps] = useState([]);
  const [selected, setSelected] = useState(initialId);
  const [data, setData] = useState(null);
  const [loadingApps, setLoadingApps] = useState(true);
  const [loadingGraph, setLoadingGraph] = useState(false);
  const [error, setError] = useState(null);
  const [portOpen, setPortOpen] = useState(false);
  const [porting, setPorting] = useState(false);
  const [portErr, setPortErr] = useState(null);
  const [portForm, setPortForm] = useState({ currency: "GBP", loan_amount: 5000, loan_term_months: 24 });

  const hasPortableProfile = !!(data?.credit_profile);

  const portToRegion = async () => {
    setPorting(true); setPortErr(null);
    try {
      const origin = await base44.functions.invoke("apiApplications", withApiKey({ action: "get", application_id: selected }));
      const ob = origin.data?.borrower;
      const b = await base44.functions.invoke("apiBorrowers", withApiKey({
        action: "create",
        first_name: ob?.first_name || "Portable",
        last_name: ob?.last_name || "Borrower",
        email: ob?.email || `portable-${Date.now()}@example.com`,
        employment_status: ob?.employment_status || "employed",
        annual_income: ob?.annual_income || 36000,
        income_currency: portForm.currency,
      }));
      const a = await base44.functions.invoke("apiApplications", withApiKey({
        action: "create",
        borrower_id: b.data.borrower_id,
        loan_amount: Number(portForm.loan_amount),
        loan_currency: portForm.currency,
        loan_purpose: "cross_border_portable",
        loan_term_months: Number(portForm.loan_term_months),
        product_type: "personal_loan",
        policy_id: "consumer-v1",
      }));
      const newApp = a.data.application_id;
      await base44.functions.invoke("apiPortable", withApiKey({ action: "import", application_id: newApp, portable_reference: selected }));
      await base44.functions.invoke("apiAnalyze", withApiKey({ application_id: newApp }));
      await base44.functions.invoke("apiUnderwrite", withApiKey({ application_id: newApp, policy_id: "consumer-v1" }));
      setPortOpen(false);
      pick(newApp);
    } catch (e) {
      setPortErr(e?.response?.data?.error?.message || e.message || "Portability flow failed");
    } finally {
      setPorting(false);
    }
  };

  useEffect(() => {
    if (!hasApiKey()) { setLoadingApps(false); return; }
    (async () => {
      try {
        const r = await base44.functions.invoke("apiApplications", withApiKey({ action: "list", limit: 50 }));
        setApps(r.data?.applications || []);
      } catch (e) {
        setError(e?.response?.data?.error?.message || e.message || "Could not load applications");
      } finally {
        setLoadingApps(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (!selected || !hasApiKey()) { setData(null); return; }
    setLoadingGraph(true); setError(null); setData(null);
    (async () => {
      try {
        const [sum, pol] = await Promise.all([
          base44.functions.invoke("apiRetrieve", withApiKey({ action: "summary", application_id: selected })),
          base44.functions.invoke("apiRetrieve", withApiKey({ action: "policy", application_id: selected })),
        ]);
        setData({ ...sum.data, policy: pol.data });
      } catch (e) {
        setError(e?.response?.data?.error?.message || e.message || "Could not load evidence graph");
      } finally {
        setLoadingGraph(false);
      }
    })();
  }, [selected]);

  const pick = (id) => { setSelected(id); navigate(`/evidence/${id}`, { replace: true }); };

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-900">
      <Nav />
      <div className="border-b border-slate-200 bg-white">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-6">
          <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-teal-600 mb-2">
            <FileSearch className="w-3.5 h-3.5" /> Evidence graph
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Decision lineage explorer</h1>
          <p className="mt-1.5 text-sm text-slate-500 max-w-2xl">
            Trace any decision back through the AI recommendation, policy evaluation, risk signals, and the exact source field each signal was derived from. Every decline is auditable.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-6">
        {!hasApiKey() ? (
          <NoKey />
        ) : (
          <>
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center gap-3">
              <label className="text-xs font-medium text-slate-500 shrink-0">Application</label>
              <select
                value={selected}
                onChange={(e) => pick(e.target.value)}
                className="flex-1 max-w-md rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-200"
              >
                <option value="">{loadingApps ? "Loading…" : "Select an application"}</option>
                {apps.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.application_number || a.id.slice(-8)} · {a.decision || a.status} · {Number(a.loan_amount || 0).toLocaleString()} {a.loan_currency || ""}
                  </option>
                ))}
              </select>
              {hasPortableProfile && (
                <button
                  onClick={() => { setPortErr(null); setPortOpen(true); }}
                  className="shrink-0 inline-flex items-center gap-1.5 text-sm font-medium text-teal-700 bg-teal-50 border border-teal-200 hover:bg-teal-100 rounded-lg px-3 py-2"
                >
                  <Globe2 className="w-4 h-4" /> Port to new region
                </button>
              )}
            </div>

            {portOpen && (
              <PortDialog
                form={portForm} setForm={setPortForm}
                porting={porting} err={portErr}
                onConfirm={portToRegion} onClose={() => !porting && setPortOpen(false)}
              />
            )}

            {error && <div className="mb-4 text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-lg p-3">{error}</div>}

            {!selected && !loadingApps && apps.length > 0 && (
              <div className="text-sm text-slate-400">Pick an application above to load its evidence graph.</div>
            )}

            {loadingGraph && (
              <div className="flex items-center gap-2 text-sm text-slate-500 py-20 justify-center">
                <Loader2 className="w-4 h-4 animate-spin" /> Loading lineage…
              </div>
            )}

            {data && !loadingGraph && <EvidenceGraphView data={data} />}
          </>
        )}
      </div>
    </div>
  );
}

function NoKey() {
  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 max-w-lg">
      <div className="flex items-center gap-2 text-amber-800 font-medium mb-1">
        <KeyRound className="w-4 h-4" /> Sandbox API key required
      </div>
      <p className="text-sm text-amber-700">
        Complete onboarding to generate a sandbox key, then return here to explore decision lineage.
      </p>
      <a href="/onboarding" className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-amber-900 hover:underline">
        Go to onboarding <ArrowRight className="w-3.5 h-3.5" />
      </a>
    </div>
  );
}

function PortDialog({ form, setForm, porting, err, onConfirm, onClose }) {
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white shadow-xl">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Globe2 className="w-4 h-4 text-teal-600" />
            <h3 className="text-sm font-semibold text-slate-900">Port credit profile to a new region</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-5 space-y-4">
          <p className="text-xs text-slate-500">
            Creates a new application in the target region and ingests this application's attested credit profile. The new decision's credit signals will trace back to the ported CreditReport with full provenance.
          </p>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Target currency">
              <select value={form.currency} onChange={(e) => set("currency", e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm">
                <option value="GBP">GBP (UK)</option>
                <option value="USD">USD (US)</option>
                <option value="NGN">NGN (Nigeria)</option>
                <option value="GHS">GHS (Ghana)</option>
                <option value="KES">KES (Kenya)</option>
              </select>
            </Field>
            <Field label="Loan amount">
              <input type="number" min="1" value={form.loan_amount} onChange={(e) => set("loan_amount", e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
            </Field>
            <Field label="Term (months)">
              <input type="number" min="1" value={form.loan_term_months} onChange={(e) => set("loan_term_months", e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
            </Field>
          </div>
          {err && <div className="text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded p-2">{err}</div>}
        </div>
        <div className="flex justify-end gap-2 px-5 py-3.5 border-t border-slate-100">
          <button onClick={onClose} disabled={porting} className="text-sm text-slate-600 hover:text-slate-900 px-3 py-2 rounded-lg">Cancel</button>
          <button onClick={onConfirm} disabled={porting} className="inline-flex items-center gap-1.5 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-60 rounded-lg px-3.5 py-2">
            {porting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Globe2 className="w-4 h-4" />}
            {porting ? "Porting…" : "Port & underwrite"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-[11px] font-medium text-slate-500 mb-1">{label}</label>
      {children}
    </div>
  );
}