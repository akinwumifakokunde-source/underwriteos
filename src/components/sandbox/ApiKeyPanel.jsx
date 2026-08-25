import React, { useState } from "react";
import { Eye, EyeOff, RotateCw, KeyRound } from "lucide-react";
import CopyButton from "./CopyButton.jsx";

const FAKE_KEY = "uw_test_sk_3f9b2a8e7c1d4f6b8a0e2c4d6f8a1b3e";

export default function ApiKeyPanel() {
  const [revealed, setRevealed] = useState(false);
  const [rotated, setRotated] = useState(0);
  const display = revealed ? FAKE_KEY : "uw_test_••••••••••••••••••••";
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-center gap-2 mb-3">
        <KeyRound className="w-4 h-4 text-slate-600" />
        <h3 className="text-sm font-semibold text-slate-900">Sandbox API key</h3>
        <span className="text-[10px] font-medium text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-full px-2 py-0.5">Sandbox</span>
      </div>
      <div className="flex items-center gap-2">
        <code className="flex-1 font-mono text-sm text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 truncate">{display}</code>
        <button onClick={() => setRevealed((r) => !r)} className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600">
          {revealed ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
        <CopyButton text={FAKE_KEY} label="Copy" className="text-slate-500 hover:text-slate-900 hover:bg-slate-100 border border-slate-200" />
        <button onClick={() => setRotated((r) => r + 1)} className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600">
          <RotateCw className="w-4 h-4" />
        </button>
      </div>
      <p className="mt-2 text-[11px] text-slate-400">Sandbox keys only access synthetic test data. Rotated {rotated} time{rotated === 1 ? "" : "s"}.</p>
    </div>
  );
}