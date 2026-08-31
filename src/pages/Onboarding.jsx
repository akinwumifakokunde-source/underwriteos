import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import Nav from "@/components/layout/Nav.jsx";
import { Building2, CheckCircle2, Loader2, ArrowRight, AlertTriangle, ShieldCheck, Circle, Rocket, MousePointerClick, Database, FileText } from "lucide-react";

const STEPS = [
  { key: "workspace", label: "Create organization", icon: Building2 },
  { key: "policy", label: "Choose lending type", icon: ShieldCheck },
  { key: "data", label: "Add data source", icon: Database },
  { key: "application", label: "Run first application", icon: FileText },
  { key: "decision", label: "Review decision", icon: CheckCircle2 },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [provisioning, setProvisioning] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const provision = async () => {
    setProvisioning(true);
    setError(null);
    try {
      const res = await base44.functions.invoke("apiOnboarding", { action: "provision" });
      setData(res.data);
    } catch (e) {
      const code = e?.response?.data?.error?.code;
      const status = e?.response?.status || e?.status;
      if (code === "MISSING_API_KEY" || status === 401) {
        navigate("/register", { replace: true });
        return;
      }
      setError(e?.response?.data?.error?.message || e.message || "Onboarding failed.");
    } finally {
      setProvisioning(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const authed = await base44.auth.isAuthenticated();
        if (!authed) {
          navigate("/register", { replace: true });
          return;
        }
      } catch {
        navigate("/register", { replace: true });
        return;
      }
      provision();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const org = data?.organization;
  const checklist = data?.checklist;

  return (
    <div className="min-h-screen bg-[#f7f8fa] text-slate-900">
      <Nav />
      <div className="max-w-3xl mx-auto px-5 sm:px-8 py-10">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-slate-500 mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Getting started
          </div>
          <h1 className="text-3xl font-semibold tracking-tight">Welcome to CreditDecide</h1>
          <p className="mt-2 text-slate-500">
            Set up your underwriting workspace and reach your first decision — no code required.
          </p>
        </div>

        {loading && (
          <div className="rounded-xl border border-slate-200 bg-white p-10 flex items-center justify-center gap-3">
            <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />
            <span className="text-sm text-slate-500">Setting up your workspace…</span>
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-rose-800">Setup failed</p>
              <p className="text-sm text-rose-600 mt-0.5">{error}</p>
              <button onClick={provision} disabled={provisioning} className="mt-3 text-sm font-medium text-white bg-rose-600 px-3 py-1.5 rounded-lg hover:bg-rose-700">
                {provisioning ? "Retrying…" : "Retry"}
              </button>
            </div>
          </div>
        )}

        {data && !error && (
          <div className="space-y-5">
            {/* Your workspace is ready */}
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center"><Rocket className="w-4 h-4 text-white" /></div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">Your workspace is ready</h3>
                  <p className="text-xs text-slate-500">Reach your first underwriting decision in minutes — no code needed.</p>
                </div>
              </div>
              <div className="space-y-2.5">
                {STEPS.map((s) => {
                  const Icon = s.icon;
                  const done = s.key === "workspace";
                  return (
                    <div key={s.key} className="flex items-center gap-2.5">
                      {done ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <Circle className="w-4 h-4 text-slate-300 shrink-0" />}
                      <Icon className={`w-3.5 h-3.5 ${done ? "text-slate-700" : "text-slate-300"}`} />
                      <span className={`text-sm ${done ? "text-slate-900" : "text-slate-400"}`}>{s.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Organization */}
            {org && (
              <div className="rounded-xl border border-slate-200 bg-white p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Building2 className="w-4 h-4 text-slate-500" />
                  <h3 className="text-sm font-semibold text-slate-900">Your organization</h3>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-xs text-slate-400">Name</div>
                    <div className="font-medium text-slate-900">{org.name}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">Plan</div>
                    <div className="font-medium text-slate-900 capitalize">{org.plan}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">Default policy</div>
                    <div className="font-mono text-slate-700 text-xs">{org.settings?.default_policy_id || "consumer-v1"}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">Status</div>
                    <div className="font-medium text-emerald-600">{org.status}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Next steps — no-code journey */}
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <h3 className="text-sm font-semibold text-slate-900 mb-3">Get started — no code needed</h3>
              <div className="space-y-2">
                <Link to="/policies" className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3 hover:bg-slate-50">
                  <div className="flex items-center gap-3">
                    <MousePointerClick className="w-4 h-4 text-[#0d9488]" />
                    <div>
                      <div className="text-sm font-medium text-slate-900">Configure your underwriting policy</div>
                      <div className="text-[12px] text-slate-400">Create rules visually — no code required</div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                </Link>
                <Link to="/applications/new" className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3 hover:bg-slate-50">
                  <div className="flex items-center gap-3">
                    <FileText className="w-4 h-4 text-[#0d9488]" />
                    <div>
                      <div className="text-sm font-medium text-slate-900">Create your first application</div>
                      <div className="text-[12px] text-slate-400">Enter borrower data and upload documents</div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                </Link>
                <Link to="/data-sources" className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3 hover:bg-slate-50">
                  <div className="flex items-center gap-3">
                    <Database className="w-4 h-4 text-[#0d9488]" />
                    <div>
                      <div className="text-sm font-medium text-slate-900">Connect data sources</div>
                      <div className="text-[12px] text-slate-400">Configure credit bureaus and open banking providers</div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                </Link>
              </div>
            </div>

            {/* Go to workspace */}
            <div className="flex items-center justify-center">
              <Link to="/workspace" className="inline-flex items-center gap-1.5 text-sm font-medium text-white bg-[#0a0c12] px-5 py-2.5 rounded-lg hover:bg-[#1c1f26]">
                Go to workspace <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}