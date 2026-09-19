import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Check, Copy, Plug, ArrowLeft, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import ClientPicker from "@/components/connect/ClientPicker";

const PLATFORMS = [
  {
    id: "claude",
    name: "Claude",
    category: "assistants",
    blurb: "Anthropic's Claude (desktop & web)",
    color: "bg-[#f39c12]",
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
    category: "assistants",
    blurb: "OpenAI's ChatGPT (desktop & web)",
    color: "bg-[#1abc9c]",
    steps: [
      "Open ChatGPT and go to Apps.",
      "Enable Developer mode (and accept the risk prompt ChatGPT shows).",
      "Click \"Create app\", name it, and paste the server URL above.",
      "Click Create, then enable the app from the chat composer before prompting it.",
      "The first call opens the CreditDecide consent page — sign in and approve.",
    ],
  },
  {
    id: "gemini",
    name: "Gemini",
    category: "assistants",
    blurb: "Google Gemini (web, mobile & Gemini CLI)",
    color: "bg-gradient-to-br from-[#1a73e8] to-[#9b72cb]",
    steps: [
      "Open Gemini (or the Gemini CLI) and go to Settings → Extensions / MCP servers.",
      "Choose \"Add server\" and paste the server URL above.",
      "Name the server and save.",
      "On first use, Gemini opens the CreditDecide consent page — sign in and approve.",
    ],
  },
  {
    id: "googleaistudio",
    name: "Google AI Studio",
    category: "assistants",
    blurb: "Google AI Studio (developers)",
    color: "bg-[#4285f4]",
    steps: [
      "Open Google AI Studio and go to Tools / Connectors.",
      "Add a remote MCP server and paste the server URL above.",
      "Name the server and save.",
      "On first use, AI Studio opens the CreditDecide consent page — sign in and approve.",
    ],
  },
  {
    id: "cursor",
    name: "Cursor",
    category: "editors",
    blurb: "The AI code editor",
    color: "bg-gradient-to-br from-[#3498db] to-[#9b59b6]",
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
    category: "editors",
    blurb: "Codeium's AI IDE",
    color: "bg-[#3498db]",
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
    category: "editors",
    blurb: "Autonomous coding agent for VS Code",
    color: "bg-[#9b59b6]",
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
    category: "editors",
    blurb: "The fast AI code editor",
    color: "bg-[#e91e63]",
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
    category: "editors",
    blurb: "GitHub Copilot Chat (MCP support)",
    color: "bg-[#2196f3]",
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
    category: "editors",
    blurb: "Open-source AI assistant for VS Code & JetBrains",
    color: "bg-[#2ecc71]",
    steps: [
      "Open Continue's config (config.json / config.yaml).",
      "Add an MCP server entry with the \"url\" set to the server URL above.",
      "Save and reload the window.",
      "On first use, Continue opens the CreditDecide consent page — sign in and approve.",
    ],
  },
  {
    id: "antigravity",
    name: "Antigravity",
    category: "editors",
    blurb: "Google's agentic AI IDE",
    color: "bg-gradient-to-br from-[#5b8def] to-[#a872e8]",
    steps: [
      "Open Antigravity and go to Settings → MCP Servers.",
      "Click \"Add MCP server\" and choose the remote (URL) type.",
      "Paste the server URL above and save.",
      "On first use, Antigravity opens the CreditDecide consent page — sign in and approve.",
    ],
  },
  {
    id: "amazonq",
    name: "Amazon Q",
    category: "editors",
    blurb: "Amazon Q Developer (AWS)",
    color: "bg-[#ff9900]",
    steps: [
      "Open Amazon Q Developer (IDE extension or CodeCatalyst).",
      "Go to Tools → MCP Servers → Add.",
      "Paste the server URL above and save.",
      "On first use, Amazon Q opens the CreditDecide consent page — sign in and approve.",
    ],
  },
  {
    id: "lovable",
    name: "Lovable",
    category: "builders",
    blurb: "AI app builder",
    color: "bg-[#ec4899]",
    steps: [
      "Open Lovable and go to Settings → Integrations / MCP.",
      "Add a remote MCP server and paste the server URL above.",
      "Name the server and save.",
      "On first use, Lovable opens the CreditDecide consent page — sign in and approve.",
    ],
  },
  {
    id: "replit",
    name: "Replit",
    category: "builders",
    blurb: "Replit Agent (AI coding platform)",
    color: "bg-[#f26207]",
    steps: [
      "Open Replit and go to your project's Tools / MCP settings.",
      "Add a remote MCP server with the URL above.",
      "Save and reload the workspace.",
      "On first use, Replit opens the CreditDecide consent page — sign in and approve.",
    ],
  },
  {
    id: "bolt",
    name: "Bolt",
    category: "builders",
    blurb: "StackBlitz Bolt.new (AI app builder)",
    color: "bg-[#2563eb]",
    steps: [
      "Open Bolt.new and go to Settings → MCP Servers.",
      "Add a remote MCP server and paste the server URL above.",
      "Save and reload the workspace.",
      "On first use, Bolt opens the CreditDecide consent page — sign in and approve.",
    ],
  },
  {
    id: "librechat",
    name: "LibreChat",
    category: "selfhosted",
    blurb: "Self-hostable AI chat UI",
    color: "bg-[#e74c3c]",
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
    category: "selfhosted",
    blurb: "Self-hosted AI interface",
    color: "bg-[#e67e22]",
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
    category: "custom",
    blurb: "Any MCP-compatible client",
    color: "bg-[#7f8c8d]",
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
        <div className="flex items-center justify-between mb-3">
          <p className="text-[11px] font-mono uppercase tracking-wider text-[#7f8c8d]">Choose your client</p>
          <span className="inline-flex items-center gap-1.5 text-[11px] text-[#7f8c8d]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#1abc9c]" /> Available worldwide
          </span>
        </div>
        <div className="mb-6">
          <ClientPicker platforms={PLATFORMS} active={active} onSelect={setActive} />
        </div>

        {/* Active platform steps */}
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5 mb-8">
          <div className="flex items-center gap-2.5 mb-4">
            <div className={`w-8 h-8 rounded-lg ${current.color} flex items-center justify-center shadow-sm`}>
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