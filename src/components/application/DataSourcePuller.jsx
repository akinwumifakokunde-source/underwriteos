import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Download, Loader2, KeyRound, Link2, CheckCircle2, AlertCircle, ArrowRight } from "lucide-react";

// Market → available providers (mirrors the Providers page config)
const MARKET_PROVIDERS = {
  NG: { bureaus: ["crc", "first_central", "credit_registry"], openBanking: ["okra", "mono"] },
  GH: { bureaus: ["xds"], openBanking: ["okra", "mono"] },
  KE: { bureaus: ["crb_africa", "transunion"], openBanking: ["okra", "mono"] },
  ZA: { bureaus: ["experian", "transunion"], openBanking: ["stitch"] },
  EG: { bureaus: ["iscore"], openBanking: [] },
  GB: { bureaus: ["experian", "equifax", "transunion"], openBanking: ["truelayer", "yapily"] },
  US: { bureaus: ["experian", "equifax", "transunion"], openBanking: ["plaid"] },
};

const PROVIDER_LABELS = {
  crc: "CRC", first_central: "FirstCentral", credit_registry: "CreditRegistry",
  xds: "XDS Data", crb_africa: "CRB Africa", iscore: "I-Score",
  experian: "Experian", equifax: "Equifax", transunion: "TransUnion",
  okra: "Okra", mono: "Mono", stitch: "Stitch",
  truelayer: "TrueLayer", yapily: "Yapily", plaid: "Plaid",
};

export default function DataSourcePuller({ market, onPullCredit, onPullBank, pulling }) {
  const [creds, setCreds] = useState([]);
  const [loadingCreds, setLoadingCreds] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await base44.functions.invoke("apiProviders", { action: "list" });
        if (active) setCreds(res.data?.credentials || []);
      } catch {
        if (active) setCreds([]);
      } finally {
        if (active) setLoadingCreds(false);
      }
    })();
    return () => { active = false; };
  }, []);

  const config = MARKET_PROVIDERS[market] || MARKET_PROVIDERS.GB;
  const connectedSet = new Set(creds.filter((c) => c.status === "active").map((c) => c.provider));

  const bureauConnected = config.bureaus.find((p) => connectedSet.has(p));
  const obConnected = config.openBanking.find((p) => connectedSet.has(p));

  const pullingCredit = pulling === "credit";
  const pullingBank = pulling === "bank";

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex items-center gap-2 mb-1">
        <Download className="w-4 h-4 text-teal-600" />
        <h3 className="text-sm font-semibold text-slate-900">Pull from data source</h3>
      </div>
      <p className="text-[12px] text-slate-500 mb-4">
        Fetch live credit reports and bank transactions from the providers you connected in{" "}
        <Link to="/data-sources" className="text-teal-600 hover:text-teal-700 underline underline-offset-2">Data Sources</Link>.
        If no provider is connected, a deterministic mock is used so you can explore the full flow.
      </p>

      {loadingCreds ? (
        <div className="flex items-center gap-2 text-sm text-slate-400 py-2">
          <Loader2 className="w-4 h-4 animate-spin" /> Checking connected providers…
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Credit bureau pull */}
          <PullCard
            icon={KeyRound}
            title="Credit report"
            subtitle="Credit bureau"
            providers={config.bureaus}
            connectedProvider={bureauConnected}
            onPull={() => onPullCredit(bureauConnected || config.bureaus[0])}
            pulling={pullingCredit}
            label="Pull credit report"
          />
          {/* Open banking pull */}
          <PullCard
            icon={Link2}
            title="Bank transactions"
            subtitle="Open banking"
            providers={config.openBanking}
            connectedProvider={obConnected}
            onPull={() => onPullBank(obConnected || config.openBanking[0])}
            pulling={pullingBank}
            label="Pull bank statement"
            disabled={config.openBanking.length === 0}
          />
        </div>
      )}
    </div>
  );
}

function PullCard({ icon: Icon, title, subtitle, providers, connectedProvider, onPull, pulling, label, disabled }) {
  const isLive = !!connectedProvider;
  return (
    <div className={`rounded-lg border p-4 ${isLive ? "border-emerald-200 bg-emerald-50/30" : "border-slate-200 bg-slate-50/50"}`}>
      <div className="flex items-start gap-2.5 mb-3">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isLive ? "bg-emerald-100" : "bg-slate-100"}`}>
          <Icon className={`w-4 h-4 ${isLive ? "text-emerald-600" : "text-slate-500"}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-medium text-slate-900">{title}</h4>
            {isLive ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-700 bg-emerald-100 border border-emerald-200 rounded-full px-1.5 py-0.5">
                <CheckCircle2 className="w-3 h-3" /> Live
              </span>
            ) : (
              <span className="text-[10px] font-medium text-slate-500 bg-slate-100 border border-slate-200 rounded-full px-1.5 py-0.5">
                {disabled ? "N/A" : "Mock"}
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">{subtitle}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-1 mb-3">
        {providers.map((p) => (
          <span key={p} className={`text-[10px] font-medium rounded px-1.5 py-0.5 ${
            connectedProvider === p ? "text-emerald-700 bg-emerald-100" : "text-slate-500 bg-slate-100"
          }`}>
            {PROVIDER_LABELS[p] || p}
          </span>
        ))}
      </div>

      <button
        onClick={onPull}
        disabled={pulling || disabled}
        className="w-full inline-flex items-center justify-center gap-1.5 text-sm font-medium text-white bg-slate-900 px-3 py-2 rounded-lg hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        {pulling ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
        {pulling ? "Fetching…" : label}
      </button>

      {!isLive && !disabled && (
        <p className="mt-2 text-[11px] text-slate-400 flex items-start gap-1">
          <AlertCircle className="w-3 h-3 shrink-0 mt-0.5" />
          No live provider connected — mock data will be used.
          <Link to="/data-sources" className="text-teal-600 hover:text-teal-700 inline-flex items-center gap-0.5 shrink-0">
            Connect <ArrowRight className="w-3 h-3" />
          </Link>
        </p>
      )}
    </div>
  );
}