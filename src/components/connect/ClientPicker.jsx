import React, { useState } from "react";
import { Search } from "lucide-react";

const CATEGORIES = [
  { id: "assistants", label: "AI Assistants" },
  { id: "editors", label: "Code Editors" },
  { id: "builders", label: "App Builders" },
  { id: "selfhosted", label: "Self-hosted" },
  { id: "custom", label: "Custom" },
];

export default function ClientPicker({ platforms, active, onSelect }) {
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();
  const filtered = q ? platforms.filter((p) => p.name.toLowerCase().includes(q)) : platforms;

  return (
    <div>
      <div className="relative mb-5">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b6f76]" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search clients by name…"
          className="w-full bg-[#16181c] border border-[#2c3e50] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-[#6b6f76] focus:outline-none focus:border-[#1abc9c] transition-colors"
        />
      </div>

      {CATEGORIES.map((cat) => {
        const items = filtered.filter((p) => p.category === cat.id);
        if (items.length === 0) return null;
        return (
          <div key={cat.id} className="mb-5">
            <p className="text-[11px] font-mono uppercase tracking-wider text-[#7f8c8d] mb-2.5">{cat.label}</p>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {items.map((p) => {
                const isActive = p.id === active;
                return (
                  <button
                    key={p.id}
                    onClick={() => onSelect(p.id)}
                    className={`group flex flex-col items-center gap-2 rounded-xl border p-3 bg-[#16181c] transition-all duration-200 ${
                      isActive ? "border-[#1abc9c]" : "border-[#2c3e50] hover:border-[#3a4a5e]"
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-lg ${p.color} flex items-center justify-center shadow-sm transition-transform duration-300 group-hover:scale-110`}>
                      <span className="text-white text-base font-bold">{p.name[0]}</span>
                    </div>
                    <span className={`text-[12px] font-medium ${isActive ? "text-white" : "text-[#c8ccd0]"}`}>{p.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}

      {filtered.length === 0 && (
        <p className="text-sm text-[#6b6f76] text-center py-6">No clients match “{query}”.</p>
      )}
    </div>
  );
}