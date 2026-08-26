import React, { useState } from "react";
import { Eye, EyeOff, KeyRound, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import CopyButton from "./CopyButton.jsx";
import { getApiKey } from "@/lib/apiKey";

export default function ApiKeyPanel() {
  const [revealed, setRevealed] = useState(false);
  const key = getApiKey();

  if (!key) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <div className="flex items-center gap-2 mb-2">
          <KeyRound className="w-4 h-4 text-slate-600" />
          <h3 className="text-sm font-semibold text-slate-900">Sandbox API key</h3>
        </div>
        <p className="text-xs text-slate-500 mb-3">
          No sandbox key found in this browser. Run onboarding to provision one — it's stored locally and
          injected into every sandbox API call.
        </p>
        <Link
          to="/onboarding"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-white bg-slate-900 px-3 py-2 rounded-lg hover:bg-slate-800"
        >
          Provision a sandbox key <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    );
  }

  const prefix = key.slice(0, key.indexOf("_") + 1) || "uw_test_";
  const display = revealed ? key : `${prefix}${"•".repeat(20)}`;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-center gap-2 mb-3">
        <KeyRound className="w-4 h-4 text-slate-600" />
        <h3 className="text-sm font-semibold text-slate-900">Sandbox API key</h3>
        <span className="text-[10px] font-medium text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-full px-2 py-0.5">Sandbox</span>
      </div>
      <div className="flex items-center gap-2">
        <code className="flex-1 font-mono text-sm text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 truncate">{display}</code>
        <button
          onClick={() => setRevealed((r) => !r)}
          className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600"
          title={revealed ? "Hide" : "Reveal"}
        >
          {revealed ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
        <CopyButton text={key} label="Copy" className="text-slate-500 hover:text-slate-900 hover:bg-slate-100 border border-slate-200" />
      </div>
      <p className="mt-2 text-[11px] text-slate-400">
        Stored locally in this browser and sent as <code className="font-mono">_api_key</code> on every sandbox
        request. Manage keys in <Link to="/api-keys" className="underline hover:text-slate-700">API Keys</Link>.
      </p>
    </div>
  );
}