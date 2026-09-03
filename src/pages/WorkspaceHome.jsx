import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import Nav from "@/components/layout/Nav.jsx";
import EntryChoice from "@/components/application/EntryChoice";
import FormsSection from "@/components/home/FormsSection";
import RecentApplications from "@/components/workspace/RecentApplications";
import NeedsAttention from "@/components/workspace/NeedsAttention";
import GettingStarted from "@/components/workspace/GettingStarted";
import { Loader2, AlertTriangle, Shield, Plus, ArrowRight, Sparkles } from "lucide-react";

export default function WorkspaceHome() {
  const navigate = useNavigate();
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [market, setMarket] = useState("GB");
  const [userName, setUserName] = useState("");

  const load = useCallback(async () => {
    try {
      const me = await base44.auth.me();
      const oid = me.data?.organization_id || me.organization_id;
      setUserName(me.full_name || me.data?.full_name || "");
      const list = await base44.entities.Policy.filter({ organization_id: oid }, "-created_date", 50);
      setPolicies(list);
    } catch (e) {
      setError(e?.message || "Failed to load policies.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleChoose = (choice) => {
    if (choice === "batch") { navigate(`/batch`); return; }
    navigate(`/applications/new?choice=${choice}&market=${market}`);
  };

  return (
    <div className="min-h-screen bg-[#f7f8fa] text-slate-900">
      <Nav />

      {/* Welcome banner */}
      <div className="max-w-3xl mx-auto px-5 sm:px-8 pt-8 pb-2">
        <div className="rounded-2xl bg-gradient-to-br from-[#0a0c12] to-[#1c1f26] p-6 sm:p-7 text-white relative overflow-hidden">
          <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-teal-500/10 blur-2xl" />
          <div className="absolute right-20 bottom-0 w-32 h-32 rounded-full bg-violet-500/10 blur-2xl" />
          <div className="relative">
            <div className="inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-teal-300 mb-2">
              <Sparkles className="w-3 h-3" /> Welcome back
            </div>
            <h1 className="text-2xl sm:text-[26px] font-semibold tracking-tight">
              {userName ? `Hi, ${userName.split(" ")[0]}.` : "Let's underwrite."}
            </h1>
            <p className="text-sm text-slate-300 mt-1.5 max-w-md leading-relaxed">
              New to CreditDecide? Run a sample application to see the full pipeline in under a minute — then set your policy and start deciding for real.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <button
                onClick={() => handleChoose("sample")}
                className="inline-flex items-center gap-1.5 text-sm font-medium bg-white text-slate-900 px-4 py-2 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <Sparkles className="w-4 h-4 text-violet-600" /> Try the live demo
              </button>
              <Link
                to="/applications"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-white border border-white/20 px-4 py-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                My applications <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <EntryChoice onChoose={handleChoose} market={market} onMarketChange={setMarket} />
      </div>

      <div className="mt-8">
        <GettingStarted />
      </div>

      <div className="mt-10">
        <NeedsAttention />
      </div>

      <div className="mt-10">
        <RecentApplications />
      </div>

      <div className="mt-10">
        <FormsSection />
      </div>

      <div className="max-w-3xl mx-auto px-5 sm:px-8 pb-12">
        <div className="border-t border-slate-200 mb-8" />

        {/* Policies section */}
        <div className="flex flex-col gap-3 mb-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-teal-600 mb-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-500" /> Set your rules
            </div>
            <h2 className="text-2xl font-semibold tracking-tight">Policies</h2>
            <p className="text-sm text-slate-500 mt-1">Create and manage underwriting policies without code.</p>
          </div>
          <Link to="/policies" className="inline-flex items-center gap-1.5 text-sm font-medium text-white bg-[#0a0c12] px-4 py-2.5 rounded-lg hover:bg-[#1c1f26] self-start sm:self-auto">
            <Plus className="w-4 h-4" /> New Policy
          </Link>
        </div>

        {loading ? (
          <div className="rounded-xl border border-slate-200 bg-white p-10 flex items-center justify-center gap-3">
            <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />
            <span className="text-sm text-slate-500">Loading policies…</span>
          </div>
        ) : error ? (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <p className="text-sm text-rose-700">{error}</p>
          </div>
        ) : policies.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-12 text-center">
            <Shield className="w-8 h-8 text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-400 mb-1">No policies yet for {market === "GB" ? "the UK" : market}.</p>
            <p className="text-[12px] text-slate-400 mb-4">Start from a template — rules are pre-filled for your market.</p>
            <div className="flex items-center justify-center gap-2 flex-wrap">
              <Link to={`/policies?template=consumer&market=${market}`} className="inline-flex items-center gap-1.5 text-sm font-medium text-white bg-slate-900 px-3.5 py-2 rounded-lg hover:bg-slate-800">
                Consumer Lending
              </Link>
              <Link to={`/policies?template=mortgage&market=${market}`} className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-700 bg-white border border-slate-200 px-3.5 py-2 rounded-lg hover:bg-slate-50">
                Mortgage
              </Link>
              <Link to={`/policies?template=business&market=${market}`} className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-700 bg-white border border-slate-200 px-3.5 py-2 rounded-lg hover:bg-slate-50">
                Business Loan
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {policies.slice(0, 4).map((p) => (
              <Link key={p.id} to="/policies" className="block rounded-xl border border-slate-200 bg-white p-4 hover:border-slate-300 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">{p.name}</h3>
                    <div className="text-[11px] text-slate-400 font-mono">{p.policy_id} · v{p.version} · {p.rules?.length || 0} rules</div>
                  </div>
                  <span className={`text-[10px] font-medium border rounded px-2 py-0.5 ${p.status === "active" ? "text-emerald-700 bg-emerald-50 border-emerald-200" : "text-slate-600 bg-slate-50 border-slate-200"}`}>
                    {p.status?.toUpperCase()}
                  </span>
                </div>
              </Link>
            ))}
            <Link to="/policies" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900">
              View all policies <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}