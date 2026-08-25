import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { withApiKey } from "@/lib/apiKey";
import Nav from "@/components/layout/Nav.jsx";
import ProviderCard from "@/components/providers/ProviderCard.jsx";
import { Loader2, AlertTriangle, ArrowRight } from "lucide-react";

const PROVIDER_DEFS = {
  crc: { provider: "crc", provider_type: "credit_bureau", label: "CRC", kind: "Credit bureau", defaultBaseUrl: "https://api-sandbox.crccreditbureau.com", help: "Enter your CRC sandbox API credentials. Used to auto-pull credit reports (Nigeria)." },
  first_central: { provider: "first_central", provider_type: "credit_bureau", label: "FirstCentral", kind: "Credit bureau", defaultBaseUrl: "https://api-sandbox.firstcentralcreditbureau.com", help: "Enter your FirstCentral sandbox API credentials. Used to auto-pull credit reports (Nigeria)." },
  okra: { provider: "okra", provider_type: "open_banking", label: "Nigerian open banking", kind: "Open banking", defaultBaseUrl: "https://api.okra.ng", help: "Enter your Okra sandbox client credentials. Used to auto-pull bank transactions (Nigeria)." },
  experian: { provider: "experian", provider_type: "credit_bureau", label: "Experian", kind: "Credit bureau", defaultBaseUrl: "https://api-sandbox.experian.com", help: "Enter your Experian sandbox API credentials. Used to auto-pull credit reports." },
  equifax: { provider: "equifax", provider_type: "credit_bureau", label: "Equifax", kind: "Credit bureau", defaultBaseUrl: "https://api-sandbox.equifax.com", help: "Enter your Equifax sandbox API credentials. Used to auto-pull credit reports." },
  transunion: { provider: "transunion", provider_type: "credit_bureau", label: "TransUnion", kind: "Credit bureau", defaultBaseUrl: "https://api-sandbox.transunion.com", help: "Enter your TransUnion sandbox API credentials. Used to auto-pull credit reports." },
  truelayer: { provider: "truelayer", provider_type: "open_banking", label: "Open Banking", kind: "Open banking", defaultBaseUrl: "https://api.truelayer-sandbox.com", help: "Enter your TrueLayer sandbox client credentials. Used to auto-pull bank transactions (UK)." },
  yapily: { provider: "yapily", provider_type: "open_banking", label: "Open Finance", kind: "Open finance", defaultBaseUrl: "https://api.yapily.com", help: "Enter your Yapily sandbox client credentials. Used to auto-pull open finance data (UK)." },
  plaid: { provider: "plaid", provider_type: "open_banking", label: "Plaid", kind: "Open banking", defaultBaseUrl: "https://sandbox.plaid.com", help: "Enter your Plaid sandbox API credentials. Used to auto-pull bank transactions (US)." },
};

const REGIONS = [
  { name: "Nigeria", providers: ["crc", "first_central", "okra"] },
  { name: "UK", providers: ["experian", "equifax", "transunion", "truelayer", "yapily"] },
  { name: "US", providers: ["experian", "equifax", "transunion", "plaid"] },
];

export default function Providers() {
  const [loading, setLoading] = useState(true);
  const [creds, setCreds] = useState([]);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(null);
  const [testing, setTesting] = useState(null);
  const [forms, setForms] = useState(() =>
    Object.fromEntries(Object.keys(PROVIDER_DEFS).map((k) => [k, { client_id: "", client_secret: "", base_url: PROVIDER_DEFS[k].defaultBaseUrl }]))
  );
  const [testResult, setTestResult] = useState({});

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await base44.functions.invoke("apiProviders", withApiKey({ action: "list" }));
      setCreds(res.data?.credentials || []);
      const next = { ...forms };
      for (const c of res.data?.credentials || []) {
        if (next[c.provider]) next[c.provider] = { ...next[c.provider], client_id: c.client_id || "", base_url: c.base_url || next[c.provider].base_url };
      }
      setForms(next);
    } catch (e) {
      setError(e?.response?.data?.error?.message || e.message || "Failed to load credentials.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  const existingFor = (provider) => creds.find((c) => c.provider === provider);

  const save = async (def) => {
    setSaving(def.provider);
    setError(null);
    try {
      const form = forms[def.provider];
      await base44.functions.invoke("apiProviders", withApiKey({
        action: "save",
        provider: def.provider,
        provider_type: def.provider_type,
        client_id: form.client_id,
        client_secret: form.client_secret,
        base_url: form.base_url
      }));
      await load();
    } catch (e) {
      setError(e?.response?.data?.error?.message || e.message || "Save failed.");
    } finally {
      setSaving(null);
    }
  };

  const remove = async (id) => {
    if (!confirm("Remove these credentials?")) return;
    try {
      await base44.functions.invoke("apiProviders", withApiKey({ action: "delete", id }));
      await load();
    } catch (e) {
      setError(e?.response?.data?.error?.message || e.message || "Delete failed.");
    }
  };

  const test = async (def) => {
    setTesting(def.provider);
    setTestResult((t) => ({ ...t, [def.provider]: null }));
    try {
      const res = await base44.functions.invoke("apiProviders", withApiKey({ action: "test", provider: def.provider }));
      setTestResult((t) => ({ ...t, [def.provider]: res.data }));
      await load();
    } catch (e) {
      setTestResult((t) => ({ ...t, [def.provider]: { status: "failed", error: e?.response?.data?.error?.message || e.message } }));
    } finally {
      setTesting(null);
    }
  };

  const setField = (provider, field, value) => setForms((f) => ({ ...f, [provider]: { ...f[provider], [field]: value } }));

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-900">
      <Nav />
      <div className="max-w-5xl mx-auto px-5 sm:px-8 py-10">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-slate-500 mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Provider setup
          </div>
          <h1 className="text-3xl font-semibold tracking-tight">Connect your data providers</h1>
          <p className="mt-2 text-slate-500">
            Bring your own credit bureau and open banking credentials for Nigeria, the UK, and the US. They are stored to
            your organization and used for live data pulls. Until you add them, the sandbox uses deterministic mock data so
            you can explore the full flow.
          </p>
        </div>

        {error && (
          <div className="mb-5 rounded-xl border border-rose-200 bg-rose-50 p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <p className="text-sm text-rose-700">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="rounded-xl border border-slate-200 bg-white p-10 flex items-center justify-center gap-3">
            <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />
            <span className="text-sm text-slate-500">Loading provider settings…</span>
          </div>
        ) : (
          <div className="space-y-8">
            {REGIONS.map((region) => (
              <section key={region.name}>
                <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">{region.name}</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  {region.providers.map((key) => (
                    <ProviderCard
                      key={key}
                      def={PROVIDER_DEFS[key]}
                      form={forms[key]}
                      existing={existingFor(key)}
                      result={testResult[key]}
                      saving={saving}
                      testing={testing}
                      onField={setField}
                      onSave={save}
                      onTest={test}
                      onRemove={remove}
                    />
                  ))}
                </div>
              </section>
            ))}

            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <h3 className="text-sm font-semibold text-slate-900 mb-3">Next steps</h3>
              <div className="space-y-2">
                <Link to="/sandbox" className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3 hover:bg-slate-50">
                  <span className="text-sm font-medium text-slate-900">Run the sandbox flow with live data</span>
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                </Link>
                <Link to="/playground" className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3 hover:bg-slate-50">
                  <span className="text-sm font-medium text-slate-900">Try the credit-report / bank-statement endpoints</span>
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