import React, { useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import Nav from "@/components/layout/Nav";
import { Search, Download, Loader2, Shield, Filter, FileJson, FileSpreadsheet, ChevronDown, X } from "lucide-react";
import DrawerSelect from "@/components/ui/drawer-select";

const ACTOR_TYPES = [
  { value: "", label: "All actors" },
  { value: "user", label: "User" },
  { value: "api_key", label: "API key" },
  { value: "system", label: "System" },
];

function timeAgo(iso) {
  if (!iso) return "—";
  const d = new Date(iso).getTime();
  const s = Math.floor((Date.now() - d) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

const ACTOR_STYLE = {
  user: "text-violet-600 bg-violet-50",
  api_key: "text-sky-600 bg-sky-50",
  system: "text-slate-500 bg-slate-100",
};

export default function AuditLog() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [events, setEvents] = useState([]);
  const [facets, setFacets] = useState({ events: [], actor_types: [], actors: [] });
  const [search, setSearch] = useState("");
  const [eventFilter, setEventFilter] = useState("");
  const [actorType, setActorType] = useState("");
  const [actorFilter, setActorFilter] = useState("");
  const [expanded, setExpanded] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await base44.functions.invoke("apiAudit", {
        action: "list",
        limit: 300,
        event: eventFilter || undefined,
        actor_type: actorType || undefined,
        actor: actorFilter || undefined,
        search: search || undefined,
      });
      setEvents(res.data?.events || []);
      setFacets(res.data?.facets || { events: [], actor_types: [], actors: [] });
    } catch (e) {
      setError(e?.response?.data?.error?.message || e.message || "Failed to load audit log.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [eventFilter, actorType, actorFilter]);

  // Debounce free-text search.
  useEffect(() => {
    const t = setTimeout(load, 350);
    return () => clearTimeout(t);
  }, [search]);

  const eventOptions = useMemo(() => [
    { value: "", label: "All events" },
    ...facets.events.map((f) => ({ value: f.event, label: `${f.event} (${f.count})` })),
  ], [facets.events]);

  const actorOptions = useMemo(() => [
    { value: "", label: "All actors" },
    ...facets.actors.map((f) => ({ value: f.actor, label: `${f.actor} (${f.count})` })),
  ], [facets.actors]);

  const clearFilters = () => {
    setSearch(""); setEventFilter(""); setActorType(""); setActorFilter("");
  };

  const hasFilters = search || eventFilter || actorType || actorFilter;

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(events, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "audit-log.json"; a.click();
    URL.revokeObjectURL(url);
  };

  const exportCsv = () => {
    const header = "timestamp,event,actor,actor_type,application_id,endpoint,ip_address,details\n";
    const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const lines = events.map((e) => [
      esc(e.created_date), esc(e.event), esc(e.actor), esc(e.actor_type),
      esc(e.application_id), esc(e.endpoint), esc(e.ip_address),
      esc(JSON.stringify(e.details || {})),
    ].join(",")).join("\n");
    const blob = new Blob([header + lines], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "audit-log.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#f7f8fa]">
      <Nav />
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-10">
        <div className="mb-6">
          <div className="inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-[#525965] mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0d9488]" /> Compliance
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-[#0a0c12]">Audit log explorer</h1>
          <p className="mt-2 text-[15px] text-[#525965] max-w-2xl leading-relaxed">
            Every action across your workspace — decisions, webhook fires, API calls, collections, billing —
            captured with actor, timestamp, and structured detail for examiner review.
          </p>
        </div>

        {/* Filters */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 mb-5">
          <div className="flex flex-col lg:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search events, endpoints, actors, application IDs…"
                className="w-full rounded-lg border border-slate-200 pl-9 pr-3 py-2 text-[13px] outline-none focus:border-teal-500"
              />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 lg:w-[520px]">
              <DrawerSelect value={eventFilter} onChange={(e) => setEventFilter(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-[13px] bg-white outline-none focus:border-teal-500">
                {eventOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </DrawerSelect>
              <DrawerSelect value={actorType} onChange={(e) => setActorType(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-[13px] bg-white outline-none focus:border-teal-500">
                {ACTOR_TYPES.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </DrawerSelect>
              <DrawerSelect value={actorFilter} onChange={(e) => setActorFilter(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-[13px] bg-white outline-none focus:border-teal-500">
                {actorOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </DrawerSelect>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-[12px] text-slate-500">
              <Filter className="w-3.5 h-3.5" />
              <span>{events.length} {events.length === 1 ? "event" : "events"}</span>
              {hasFilters && (
                <button onClick={clearFilters} className="inline-flex items-center gap-1 text-slate-400 hover:text-slate-600 ml-1">
                  <X className="w-3 h-3" /> Clear
                </button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button onClick={exportCsv} disabled={events.length === 0}
                className="inline-flex items-center gap-1.5 text-[12px] text-slate-700 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50">
                <FileSpreadsheet className="w-3.5 h-3.5" /> CSV
              </button>
              <button onClick={exportJson} disabled={events.length === 0}
                className="inline-flex items-center gap-1.5 text-[12px] text-slate-700 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50">
                  <FileJson className="w-3.5 h-3.5" /> JSON
                </button>
            </div>
          </div>
        </div>

        {/* Events */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 text-slate-300 animate-spin" />
          </div>
        ) : error ? (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-[13px] text-rose-700">{error}</div>
        ) : events.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 bg-white py-16 text-center">
            <Shield className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm text-slate-500 font-medium">No audit events match your filters</p>
            <p className="text-[12px] text-slate-400 mt-0.5">Try clearing filters or broadening your search.</p>
          </div>
        ) : (
          <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
            <div className="divide-y divide-slate-50">
              {events.map((e) => {
                const isOpen = expanded === e.id;
                const hasDetails = e.details && Object.keys(e.details).length > 0;
                return (
                  <div key={e.id} className="px-5 py-3 hover:bg-slate-50/50 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[13px] font-medium text-slate-900 font-mono">{e.event}</span>
                          <span className={`text-[10px] rounded px-1.5 py-0.5 font-medium ${ACTOR_STYLE[e.actor_type] || "text-slate-500 bg-slate-100"}`}>{e.actor_type}</span>
                          {e.endpoint && <span className="text-[10px] text-slate-400 font-mono">{e.endpoint}</span>}
                        </div>
                        <div className="mt-0.5 flex items-center gap-2 text-[11px] text-slate-500">
                          <span>{e.actor || "—"}</span>
                          {e.application_id && <span className="font-mono">· app {e.application_id.slice(-8)}</span>}
                          {e.ip_address && <span>· {e.ip_address}</span>}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-[11px] text-slate-400">{timeAgo(e.created_date)}</div>
                        <div className="text-[10px] text-slate-300">{new Date(e.created_date).toLocaleString("en-GB", { dateStyle: "short", timeStyle: "short" })}</div>
                      </div>
                      {hasDetails && (
                        <button onClick={() => setExpanded(isOpen ? null : e.id)} className="shrink-0 p-1 rounded hover:bg-slate-100">
                          <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                        </button>
                      )}
                    </div>
                    {isOpen && hasDetails && (
                      <pre className="mt-2 rounded-lg bg-slate-900 text-slate-100 text-[11px] font-mono p-3 overflow-x-auto max-h-48 overflow-y-auto">
                        {JSON.stringify(e.details, null, 2)}
                      </pre>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}