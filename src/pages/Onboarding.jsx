import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { withApiKey, setApiKey, getApiKey } from "@/lib/apiKey";
import Nav from "@/components/layout/Nav.jsx";
import CopyButton from "@/components/sandbox/CopyButton.jsx";
import { KeyRound, Building2, CheckCircle2, Loader2, ArrowRight, AlertTriangle, ShieldCheck } from "lucide-react";

export default function Onboarding() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [provisioning, setProvisioning] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [stored, setStored] = useState(getApiKey() !== "");

  const provision = async () => {
    setProvisioning(true);
    setError(null);
    try {
      const res = await base44.functions.invoke("apiOnboarding", { action: "provision" });
      setData(res.data);
      if (res.data?.api_key?.full_key) {
        setApiKey(res.data.api_key.full_key);
        setStored(true);
      }
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

  const key = data?.api_key;
  const org = data?.organization;
  const checklist = data?.checklist;
  const showKeyOnce = key?.full_key && !key.already_exists;

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-900">
      <Nav />
      <div className="max-w-3xl mx-auto px-5 sm:px-8 py-10">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-slate-500 mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Developer onboarding
          </div>
          <h1 className="text-3xl font-semibold tracking-tight">Set up your sandbox workspace</h1>
          <p className="mt-2 text-slate-500">
            We provision your organization and a sandbox API key so you can start calling the API immediately.
          </p>
        </div>

        {loading && (
          <div className="rounded-xl border border-slate-200 bg-white p-10 flex items-center justify-center gap-3">
            <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />
            <span className="text-sm text-slate-500">Provisioning your workspace…</span>
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-rose-800">Onboarding failed</p>
              <p className="text-sm text-rose-600 mt-0.5">{error}</p>
              <button onClick={provision} disabled={provisioning} className="mt-3 text-sm font-medium text-white bg-rose-600 px-3 py-1.5 rounded-lg hover:bg-rose-700">
                {provisioning ? "Retrying…" : "Retry"}
              </button>
            </div>
          </div>
        )}

        {data && !error && (
          <div className="space-y-5">
            {/* Checklist */}
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: "Account", ok: checklist?.account, icon: ShieldCheck },
                  { label: "Organization", ok: checklist?.organization, icon: Building2 },
                  { label: "Sandbox", ok: checklist?.sandbox, icon: CheckCircle2 },
                  { label: "API key", ok: checklist?.api_key, icon: KeyRound },
                ].map((c) => (
                  <div key={c.label} className="flex items-center gap-2.5">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${c.ok ? "bg-emerald-50 border border-emerald-100" : "bg-slate-50 border border-slate-100"}`}>
                      <c.icon className={`w-4 h-4 ${c.ok ? "text-emerald-600" : "text-slate-400"}`} />
                    </div>
                    <div>
                      <div className="text-xs text-slate-400">{c.label}</div>
                      <div className={`text-sm font-medium ${c.ok ? "text-slate-900" : "text-slate-400"}`}>{c.ok ? "Ready" : "Pending"}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Organization */}
            {org && (
              <div className="rounded-xl border border-slate-200 bg-white p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Building2 className="w-4 h-4 text-slate-500" />
                  <h3 className="text-sm font-semibold text-slate-900">Organization</h3>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-xs text-slate-400">Name</div>
                    <div className="font-medium text-slate-900">{org.name}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">Slug</div>
                    <div className="font-mono text-slate-700 text-xs">{org.slug}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">Plan</div>
                    <div className="font-medium text-slate-900 capitalize">{org.plan}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">Default policy</div>
                    <div className="font-mono text-slate-700 text-xs">{org.settings?.default_policy_id || "consumer-v1"}</div>
                  </div>
                </div>
              </div>
            )}

            {/* API key */}
            {key && (
              <div className="rounded-xl border border-slate-200 bg-white p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <KeyRound className="w-4 h-4 text-slate-500" />
                    <h3 className="text-sm font-semibold text-slate-900">Sandbox API key</h3>
                  </div>
                  <span className="text-[11px] font-mono text-emerald-600 bg-emerald-50 border border-emerald-100 rounded px-2 py-0.5">{key.environment}</span>
                </div>

                {showKeyOnce ? (
                  <div className="rounded-lg bg-amber-50 border border-amber-200 p-4">
                    <div className="flex items-start gap-2 mb-2">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <p className="text-xs text-amber-800">
                        Copy your key now. For security, the full key is only shown once and cannot be retrieved again.
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 font-mono text-sm text-slate-900 bg-white border border-slate-200 rounded px-3 py-2 break-all">{key.full_key}</code>
                      <CopyButton text={key.full_key} />
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <code className="flex-1 font-mono text-sm text-slate-700 bg-slate-50 border border-slate-200 rounded px-3 py-2">{key.prefix}••••••••</code>
                    <span className="text-xs text-slate-400">{stored ? "Saved locally" : "Not saved"}</span>
                  </div>
                )}

                <div className="mt-3 flex flex-wrap gap-1.5">
                  {(key.scopes || []).map((s) => (
                    <span key={s} className="text-[10px] font-mono text-slate-600 bg-slate-100 rounded px-1.5 py-0.5">{s}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Next steps */}
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <h3 className="text-sm font-semibold text-slate-900 mb-3">Next steps</h3>
              <div className="space-y-2">
                <Link to="/sandbox" className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3 hover:bg-slate-50">
                  <span className="text-sm font-medium text-slate-900">Run the sandbox flow</span>
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                </Link>
                <Link to="/playground" className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3 hover:bg-slate-50">
                  <span className="text-sm font-medium text-slate-900">Open the API playground</span>
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                </Link>
                <Link to="/api-keys" className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3 hover:bg-slate-50">
                  <span className="text-sm font-medium text-slate-900">Manage API keys</span>
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                </Link>
                <Link to="/providers" className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3 hover:bg-slate-50">
                  <span className="text-sm font-medium text-slate-900">Connect data providers (Experian / TrueLayer)</span>
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}