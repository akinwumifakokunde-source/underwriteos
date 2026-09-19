import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Check, Copy, Plug, ArrowLeft, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

const PLATFORMS = [
  {
    id: "claude",
    name: "Claude",
    blurb: "Anthropic's Claude (desktop & web)",
    grad: "from-amber-400 to-orange-500",
    steps: [
      "Open Claude and go to your profile menu (top right).",
      "Choose Settings → Connectors → \"Add custom connector\".",
      "Name the connector (e.g. \"CreditDecide\") and paste the server URL above.",
      "Click Add. Claude opens the CreditDecide consent page — sign in and approve to grant access.",
    ],
  },
  {
    id: "chatgpt",
    name: "ChatGPT",
    blurb: "OpenAI's ChatGPT (desktop & web)",
    grad: "from-teal-400 to-emerald-500",
    steps: [
      "Open ChatGPT and go to Apps.",
      "Enable Developer mode (and accept the risk prompt ChatGPT shows).",
      "Click \"Create app\", name it, and paste the server URL above.",
      "Click Create, then enable the app from the chat composer before prompting it.",
      "The first call opens the CreditDecide consent page — sign in and approve.",
    ],
  },
  {
    id: "cursor",
    name: "Cursor",
    blurb: "The AI code editor",
    grad: "from-sky-400 to-indigo-500",
    steps: [
      "Open Cursor and go to Settings → Tools & Integrations.",
      "Click \"New MCP Server\" — this opens your mcp.json file.",
      "Add an entry whose \"url\" is the server URL above, then save.",
      "Toggle the server on. On first use, Cursor opens the CreditDecide consent page — sign in and approve.",
    ],
  },
  {
    id: "windsurf",
    name: "Windsurf",
    blurb: "Codeium's AI IDE",
    grad: "from-cyan-400 to-blue-500",
    steps: [
      "Open Windsurf and go to Settings → MCP Servers.",
      "Click \"Add MCP server\" and choose the \"Remote (URL)\" type.",
      "Paste the server URL above and save.",
      "On first use, Windsurf opens the CreditDecide consent page — sign in and approve.",
    ],
  },
  {
    id: "cline",
    name: "Cline",
    blurb: "Autonomous coding agent for VS Code",
    grad: "from-violet-400 to-purple-500",
    steps: [
      "Open VS Code with the Cline extension installed.",
      "Open the Cline panel and go to Settings → MCP Servers.",
      "Click \"Edit MCP Settings\" and add a server with the \"url\" set to the server URL above.",
      "Save and reload. On first use, Cline opens the CreditDecide consent page — sign in and approve.",
    ],
  },
  {
    id: "zed",
    name: "Zed",
    blurb: "The fast AI code editor",
    grad: "from-fuchsia-400 to-pink-500",
    steps: [
      "Open Zed and run the command \"mcp: open configuration\".",
      "Add a server entry whose \"url\" is the server URL above in the settings file.",
      "Save the file. Zed discovers the tools automatically.",
      "On first use, Zed opens the CreditDecide consent page — sign in and approve.",
    ],
  },
  {
    id: "vscode",
    name: "VS Code",
    blurb: "GitHub Copilot Chat (MCP support)",
    grad: "from-blue-400 to-indigo-500",
    steps: [
      "Open VS Code with GitHub Copilot Chat.",
      "Run the command \"MCP: Add Server\" and choose \"HTTP\".",
      "Paste the server URL above and give the server a name.",
      "On first use, VS Code opens the CreditDecide consent page — sign in and approve.",
    ],
  },
  {
    id: "continue",
    name: "Continue",
    blurb: "Open-source AI assistant for VS Code & JetBrains",
    grad: "from-emerald-400 to-teal-500",
    steps: [
      "Open Continue's config (config.json / config.yaml).",
      "Add an MCP server entry with the \"url\" set to the server URL above.",
      "Save and reload the window.",
      "On first use, Continue opens the CreditDecide consent page — sign in and approve.",
    ],
  },
  {
    id: "librechat",
    name: "LibreChat",
    blurb: "Self-hostable AI chat UI",
    grad: "from-rose-400 to-red-500",
    steps: [
      "Open LibreChat's MCP config (mcp_servers in librechat.yaml).",
      "Add a server entry with the \"url\" set to the server URL above.",
      "Restart LibreChat to load the server.",
      "On first use, LibreChat opens the CreditDecide consent page — sign in and approve.",
    ],
  },
  {
    id: "openwebui",
    name: "Open WebUI",
    blurb: "Self-hosted AI interface",
    grad: "from-orange-400 to-amber-500",
    steps: [
      "Open Open WebUI and go to Settings → Tools.",
      "Add a remote MCP server and paste the server URL above.",
      "Save and the tools appear in your workspace.",
      "On first use, Open WebUI opens the CreditDecide consent page — sign in and approve.",
    ],
  },
  {
    id: "custom",
    name: "Custom",
    blurb: "Any MCP-compatible client",
    grad: "from-slate-400 to-slate-600",
    steps: [
      "Copy the server URL above.",
      "Add it as a streamable HTTP MCP server in your client.",
      "A name and the URL is all most clients need — then reload the client.",
      "On first call, your client opens the CreditDecide consent page — sign in and approve.",
    ],
  },
];

function StepList({ steps }) {
  return (
    <ol className="space-y-3">
      {steps.map((s, i) => (
        <li key={i} className="flex gap-3">
          <span className="shrink-0 w-6 h-6 rounded-full bg-teal-500/15 text-teal-300 text-xs font-medium flex items-center justify-center mt-0.5">
            {i + 1}
          </span>
          <span className="text-sm text-[#a0a4ab] leading-relaxed">{s}</span>
        </li>
      ))}
    </ol>
  );
}

export default function Connect() {
  const serverUrl = "https://creditdecide.com/api/mcp";
  const [copied, setCopied] = useState(false);
  const [active, setActive] = useState("claude");

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(serverUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };

  const current = PLATFORMS.find((p) => p.id === active);

  return (
    <div className="min-h-screen bg-[#0a0c12] text-white">
      <div className="max-w-3xl mx-auto px-5 sm:px-8 py-10 sm:py-14">
        <Link to="/workspace" className="inline-flex items-center gap-1.5 text-[13px] text-[#a0a4ab] hover:text-white transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to workspace
        </Link>

        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-400 to-indigo-500 flex items-center justify-center shadow-lg">
            <Plug className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">Connect your AI client</h1>
        </div>
        <p className="text-[15px] text-[#a0a4ab] leading-relaxed max-w-2xl mb-8">
          Point any popular AI assistant at CreditDecide. Your assistant can then run underwriting, read risk
          signals and evidence, and manage loan applications on your behalf — scoped to your own organization's
          data. Works with every MCP-compatible client.
        </p>

        {/* Server URL */}
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 mb-8">
          <label className="text-[11px] font-mono uppercase tracking-wider text-[#6b6f76]">MCP server URL</label>
          <div className="mt-2 flex items-center gap-2">
            <code className="flex-1 text-sm text-teal-300 bg-black/30 rounded-lg px-3 py-2.5 overflow-x-auto no-scrollbar select-text">
              {serverUrl}
            </code>
            <Button
              onClick={copy}
              variant="outline"
              className="shrink-0 h-10 border-white/15 bg-white/5 text-white hover:bg-white/10 hover:text-white"
            >
              {copied ? <Check className="w-4 h-4 text-teal-300" /> : <Copy className="w-4 h-4" />}
              <span className="ml-1.5 hidden sm:inline">{copied ? "Copied" : "Copy"}</span>
            </Button>
          </div>
        </div>

        {/* Platform grid */}
        <p className="text-[11px] font-mono uppercase tracking-wider text-[#6b6f76] mb-3">Choose your client</p>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-6">
          {PLATFORMS.map((p) => {
            const isActive = p.id === active;
            return (
              <button
                key={p.id}
                onClick={() => setActive(p.id)}
                className={`group flex flex-col items-center gap-2 rounded-xl border p-3 transition-all duration-200 ${
                  isActive
                    ? "border-teal-400/40 bg-teal-500/10"
                    : "border-white/10 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/20"
                }`}
              >
                <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${p.grad} flex items-center justify-center shadow-sm transition-transform duration-300 group-hover:scale-110`}>
                  <span className="text-white text-sm font-bold">{p.name[0]}</span>
                </div>
                <span className={`text-[12px] font-medium ${isActive ? "text-white" : "text-[#a0a4ab]"}`}>{p.name}</span>
              </button>
            );
          })}
        </div>

        {/* Active platform steps */}
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5 mb-8">
          <div className="flex items-center gap-2.5 mb-4">
            <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${current.grad} flex items-center justify-center shadow-sm`}>
              <span className="text-white text-xs font-bold">{current.name[0]}</span>
            </div>
            <div>
              <div className="text-sm font-semibold text-white">{current.name}</div>
              <div className="text-[12px] text-[#6b6f76]">{current.blurb}</div>
            </div>
          </div>
          <StepList steps={current.steps} />
        </div>

        {/* OAuth note */}
        <div className="rounded-xl border border-teal-500/20 bg-teal-500/[0.06] p-4 mb-4">
          <p className="text-sm text-[#c8d4d0] leading-relaxed">
            <span className="font-medium text-teal-300">Sign-in required.</span> Because CreditDecide handles
            sensitive financial data, each AI client acts as you. The first time it connects, it opens the
            CreditDecide consent page — sign in with your own account and approve. The assistant only ever
            sees and acts on your organization's data.
          </p>
        </div>

        {/* Refresh note */}
        <div className="flex items-start gap-2.5 text-[13px] text-[#6b6f76] leading-relaxed">
          <RefreshCw className="w-4 h-4 mt-0.5 shrink-0" />
          <p>
            AI clients cache the tool list. If we add or change tools, refresh or reconnect the connector in
            your client so it picks up the latest capabilities.
          </p>
        </div>
      </div>
    </div>
  );
}