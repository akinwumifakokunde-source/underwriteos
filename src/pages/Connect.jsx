import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Check, Copy, Plug, ArrowLeft, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const STEPS = {
  claude: [
    "Open Claude and go to your profile menu (top right).",
    "Choose Settings → Connectors → \"Add custom connector\".",
    "Name the connector (e.g. \"CreditDecide\") and paste the server URL above.",
    "Click Add. Claude will open the CreditDecide consent page — sign in and approve to grant access.",
  ],
  chatgpt: [
    "Open ChatGPT and go to Apps.",
    "Enable Developer mode (and accept the risk prompt ChatGPT shows).",
    "Click \"Create app\", name it, and paste the server URL above.",
    "Click Create, then enable the app from the chat composer before prompting it.",
    "The first call opens the CreditDecide consent page — sign in and approve to grant access.",
  ],
  cursor: [
    "Open Cursor and go to Settings → Tools & Integrations.",
    "Click \"New MCP Server\" — this opens your mcp.json file.",
    "Add an entry whose \"url\" is the server URL above, then save.",
    "Toggle the server on. On first use, Cursor opens the CreditDecide consent page — sign in and approve.",
  ],
  custom: [
    "Copy the server URL above.",
    "Add it as a streamable HTTP MCP server in your client.",
    "A name and the URL is all most clients need — then reload the client.",
    "On first call, your client opens the CreditDecide consent page — sign in and approve.",
  ],
};

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
  const serverUrl = new URL("/api/mcp", window.location.origin).toString();
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(serverUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };

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
          Point Claude, ChatGPT, Cursor, or any MCP-compatible client at CreditDecide. Your assistant can then
          run underwriting, read risk signals and evidence, and manage loan applications on your behalf —
          scoped to your own organization's data.
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

        {/* Client tabs */}
        <Tabs defaultValue="claude" className="mb-8">
          <TabsList className="bg-white/[0.03] border border-white/10 p-1 h-auto flex-wrap">
            <TabsTrigger value="claude" className="data-[state=active]:bg-teal-500/15 data-[state=active]:text-teal-300 text-[#a0a4ab] text-sm px-4 py-2">Claude</TabsTrigger>
            <TabsTrigger value="chatgpt" className="data-[state=active]:bg-teal-500/15 data-[state=active]:text-teal-300 text-[#a0a4ab] text-sm px-4 py-2">ChatGPT</TabsTrigger>
            <TabsTrigger value="cursor" className="data-[state=active]:bg-teal-500/15 data-[state=active]:text-teal-300 text-[#a0a4ab] text-sm px-4 py-2">Cursor</TabsTrigger>
            <TabsTrigger value="custom" className="data-[state=active]:bg-teal-500/15 data-[state=active]:text-teal-300 text-[#a0a4ab] text-sm px-4 py-2">Custom</TabsTrigger>
          </TabsList>

          <TabsContent value="claude" className="mt-5"><StepList steps={STEPS.claude} /></TabsContent>
          <TabsContent value="chatgpt" className="mt-5"><StepList steps={STEPS.chatgpt} /></TabsContent>
          <TabsContent value="cursor" className="mt-5"><StepList steps={STEPS.cursor} /></TabsContent>
          <TabsContent value="custom" className="mt-5"><StepList steps={STEPS.custom} /></TabsContent>
        </Tabs>

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