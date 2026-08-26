import React, { useEffect, useState } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { withApiKey, hasApiKey } from "@/lib/apiKey";
import Nav from "@/components/layout/Nav.jsx";
import EvidenceGraphView from "@/components/evidence/EvidenceGraphView.jsx";
import { Loader2, FileSearch, ArrowRight, KeyRound } from "lucide-react";

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
                    {a.application_number || a.id.slice(-8)} · {a.decision || a.status} · £{Number(a.loan_amount || 0).toLocaleString()}
                  </option>
                ))}
              </select>
            </div>

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