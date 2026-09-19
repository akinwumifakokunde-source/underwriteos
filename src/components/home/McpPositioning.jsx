import React from "react";

/**
 * MCP positioning block — a feature card plus an overall recommendation.
 * `dark` adapts the block to a dark surface (Connect AI page).
 */
export default function McpPositioning({ dark = false }) {
  const isDark = dark;

  const head = isDark ? "text-white" : "text-[#0a0c12]";
  const body = isDark ? "text-[#a0a4ab]" : "text-[#374151]";
  const card = isDark
    ? "bg-white/[0.03] border-white/10"
    : "bg-[#f9fafb] border-[#eceef1]";
  const badge = "text-[#2563eb] bg-[#eff6ff] border border-[#dbeafe]";
  const rule = isDark ? "border-white/10" : "border-[#eceef1]";

  return (
    <section className={isDark ? "py-10" : "py-14 sm:py-16 border-b border-[#eceef1] bg-white"}>
      <div className="max-w-3xl mx-auto px-5 sm:px-8">
        <h2 className={`text-lg sm:text-xl font-semibold tracking-tight mb-5 ${head}`}>
          How I would position this feature
        </h2>

        <div className={`rounded-2xl border ${card} p-5 sm:p-6`}>
          <span className={`inline-flex items-center text-[11px] font-medium rounded-full px-2.5 py-1 ${badge}`}>
            CreditDecide MCP
          </span>
          <h3 className={`mt-3 text-base sm:text-lg font-semibold leading-snug ${isDark ? "text-white" : "text-[#0a0c12]"}`}>
            Bring credit underwriting into your AI workflow.
          </h3>
          <p className={`mt-2 text-sm leading-relaxed ${body}`}>
            Connect compatible AI assistants to CreditDecide to retrieve authorised lending data, analyse
            applications, explore supporting evidence and interact with underwriting workflows — with
            permissions, policy controls and auditability.
          </p>
        </div>

        <div className={`mt-6 pt-5 border-t ${rule}`}>
          <h3 className={`text-sm font-semibold ${head}`}>
            My overall recommendation:
          </h3>
          <p className={`mt-1.5 text-sm leading-relaxed ${body}`}>
            keep MCP as an important platform capability, but don't make unrestricted AI-driven approvals
            the headline feature. The compelling proposition is that AI assistants can work with a lender's
            underwriting infrastructure while CreditDecide continues to enforce the lender's policies,
            permissions and decision controls.
          </p>
        </div>
      </div>
    </section>
  );
}