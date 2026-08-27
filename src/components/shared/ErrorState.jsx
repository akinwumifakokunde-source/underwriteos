import React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function ErrorState({ message, onRetry }) {
  return (
    <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 flex items-start gap-3">
      <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
      <div className="flex-1">
        <p className="text-sm text-rose-700">{message}</p>
        {onRetry && (
          <button onClick={onRetry} className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-rose-700 bg-white border border-rose-200 px-2.5 py-1.5 rounded-lg hover:bg-rose-100">
            <RefreshCw className="w-3.5 h-3.5" /> Try again
          </button>
        )}
      </div>
    </div>
  );
}