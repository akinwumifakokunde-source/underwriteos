import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Loader2, CheckCircle2, AlertTriangle, ArrowRight } from "lucide-react";
import Logo from "@/components/Logo";

const STEPS = [
  { key: "account", label: "Account verified" },
  { key: "organization", label: "Workspace created" },
  { key: "sandbox", label: "Sandbox environment ready" },
  { key: "api_key", label: "Sandbox API key provisioned" },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const [status, setStatus] = useState("loading"); // loading | done | error
  const [checklist, setChecklist] = useState({ account: false, organization: false, sandbox: false, api_key: false });
  const [error, setError] = useState(null);

  const provision = async () => {
    setStatus("loading");
    setError(null);
    try {
      const res = await base44.functions.invoke("apiOnboarding", { action: "provision" });
      const cl = res.data?.checklist || { account: true, organization: true, sandbox: true, api_key: true };
      setChecklist(cl);
      setStatus("done");
      // Brief beat so the user sees the completed checklist, then enter workspace.
      setTimeout(() => {
        window.location.href = "/workspace";
      }, 1100);
    } catch (e) {
      setError(e?.response?.data?.error?.message || e?.message || "We couldn't finish setting up your workspace.");
      setStatus("error");
    }
  };

  useEffect(() => {
    provision();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-slate-50 px-5">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <Logo size={36} />
          <h1 className="mt-5 text-2xl font-semibold tracking-tight text-[#0a0c12]">
            Setting up your workspace
          </h1>
          <p className="mt-2 text-sm text-[#525965] text-center leading-relaxed">
            We're provisioning your sandbox environment and API key. This only takes a moment.
          </p>
        </div>

        <div className="rounded-2xl border border-[#eceef1] bg-white p-6 shadow-sm">
          <ul className="space-y-4">
            {STEPS.map((s) => {
              const done = checklist[s.key];
              const active = status === "loading" && !done && STEPS.findIndex((x) => x.key === s.key) === STEPS.findIndex((x) => !checklist[x.key]);
              return (
                <li key={s.key} className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full flex items-center justify-center shrink-0">
                    {done ? (
                      <CheckCircle2 className="w-6 h-6 text-[#0d9488]" />
                    ) : active ? (
                      <Loader2 className="w-5 h-5 text-[#0d9488] animate-spin" />
                    ) : (
                      <span className="w-2.5 h-2.5 rounded-full bg-[#d4d8dd]" />
                    )}
                  </span>
                  <span className={`text-sm ${done ? "text-[#0a0c12] font-medium" : "text-[#8a909c]"}`}>
                    {s.label}
                  </span>
                </li>
              );
            })}
          </ul>

          {status === "error" && (
            <div className="mt-5 rounded-lg border border-rose-200 bg-rose-50 px-3.5 py-3 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="text-[13px] text-rose-700 leading-relaxed">
                {error}
                <button onClick={provision} className="block mt-2 font-medium underline hover:no-underline">
                  Try again
                </button>
              </div>
            </div>
          )}

          {status === "done" && (
            <div className="mt-5 flex items-center gap-2 text-sm font-medium text-[#0d9488]">
              You're all set — entering your workspace
              <ArrowRight className="w-4 h-4" />
            </div>
          )}
        </div>

        {status === "error" && (
          <div className="mt-5 text-center">
            <button onClick={() => navigate("/workspace")} className="text-sm text-[#525965] hover:text-[#0a0c12] underline">
              Continue to workspace anyway
            </button>
          </div>
        )}
      </div>
    </div>
  );
}