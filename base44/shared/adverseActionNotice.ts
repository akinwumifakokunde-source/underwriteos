// Regulator-compliant adverse-action notice generator (server-side).
// Produces the formal notice text a lender must deliver to a declined or
// conditionally-approved borrower, using the standardized adverse_action_codes
// from the policy engine plus market-specific regulatory disclosures.
//
// This is the server-side counterpart to the frontend buildAdverseActionLetter
// in src/lib/regulatoryOutputs.js. It ensures API consumers receive the full
// notice text alongside the codes, without having to reconstruct it.

export interface AdverseActionInput {
  decision: "APPROVE" | "REVIEW" | "DECLINE";
  adverse_action_codes: any[]; // { code, label, rule_id, reason }
  market: string;
  borrower?: any;
  application?: any;
  lenderName?: string;
  creditBureau?: string | null;
  decisionTimestamp?: string;
}

export interface NoticeLine {
  kind: "h" | "p" | "li" | "m" | "sp";
  text?: string;
}

export interface AdverseActionNotice {
  framework: string;
  statute: string;
  text: string;
  lines: NoticeLine[];
  generated_at: string;
}

// Market-specific regulatory frameworks. Each defines the statute, the
// credit-reference-agency disclosure, and the borrower's statutory rights.
const MARKET_FRAMEWORKS: Record<string, { name: string; statute: string; craNote: string; rights: string[] }> = {
  US: {
    name: "US — Equal Credit Opportunity Act (Reg B) & FCRA §615",
    statute: "ECOA (15 U.S.C. §1691) / FCRA (15 U.S.C. §1681a)",
    craNote: "Our decision was based in whole or in part on information obtained from a consumer reporting agency.",
    rights: [
      "You have the right to obtain a free copy of your consumer report from the consumer reporting agency named below within 60 days of receiving this notice.",
      "You have the right to dispute the accuracy or completeness of any information contained in your consumer report with the consumer reporting agency.",
      "If you believe this application was evaluated in a discriminatory manner, you may contact the Consumer Financial Protection Bureau (CFPB) or the relevant federal regulator.",
    ],
  },
  GB: {
    name: "United Kingdom — FCA CONC 11 (Notice of Refusal)",
    statute: "FCA Handbook CONC 11 / Consumer Credit Act 1974",
    craNote: "Our decision was based in part on information supplied by a credit reference agency.",
    rights: [
      "You have the right to request the name and address of the credit reference agency we consulted so that you can obtain a copy of the information they hold about you.",
      "You may apply to the credit reference agency for a correction of any information you believe is inaccurate.",
      "If you remain dissatisfied, you may refer your complaint to the Financial Ombudsman Service.",
    ],
  },
  NG: {
    name: "Nigeria — CBN Consumer Protection Regulations",
    statute: "CBN Consumer Protection Framework / BOFIA 2020",
    craNote: "Our decision was informed by a credit bureau report obtained in accordance with the CBN Credit Bureau Regulations.",
    rights: [
      "You have the right to request access to your credit information held by the credit bureau named below.",
      "You may dispute any inaccurate information with the credit bureau and request correction.",
      "You may direct complaints to the Central Bank of Nigeria Consumer Protection Department.",
    ],
  },
  ZA: {
    name: "South Africa — National Credit Act 34 of 2005 (§62)",
    statute: "National Credit Act 34 of 2005",
    craNote: "Our decision was based in part on a credit bureau report obtained in accordance with the National Credit Act.",
    rights: [
      "You have the right to request the reasons for the refusal of your application.",
      "You have the right to obtain a copy of your credit report from the credit bureau named below.",
      "You may dispute inaccurate information with the credit bureau and lodge a complaint with the National Credit Regulator if unresolved.",
    ],
  },
  KE: {
    name: "Kenya — Consumer Protection Act & CRB Regulations",
    statute: "Consumer Protection Act 2012 / CRB Regulations 2020",
    craNote: "Our decision was informed by a credit reference bureau report.",
    rights: [
      "You have the right to obtain a copy of your credit report from the credit reference bureau named below.",
      "You may dispute any inaccurate information with the bureau and request correction.",
      "You may escalate unresolved disputes to the Central Bank of Kenya or the Office of the Data Protection Commissioner.",
    ],
  },
  GH: {
    name: "Ghana — Credit Reporting Act 726 (2006)",
    statute: "Credit Reporting Act 726 / Borrowers & Lenders Act 772",
    craNote: "Our decision was informed by a credit reference bureau report obtained under the Credit Reporting Act.",
    rights: [
      "You have the right to obtain a copy of your credit report from the credit reference bureau named below.",
      "You may dispute any inaccurate information with the bureau and request correction.",
      "You may escalate unresolved disputes to the Bank of Ghana.",
    ],
  },
};

const DEFAULT_FRAMEWORK = {
  name: "General — Consumer Credit Protection",
  statute: "Applicable consumer credit protection regulations",
  craNote: "Our decision was based in part on information supplied by a credit reference agency.",
  rights: [
    "You have the right to request the reasons for our decision.",
    "You have the right to obtain a copy of your credit report from the credit reference agency consulted.",
    "You may dispute any inaccurate information with the credit reference agency.",
  ],
};

export function generateAdverseActionNotice(input: AdverseActionInput): AdverseActionNotice | null {
  const { decision, adverse_action_codes, market, borrower, application, lenderName, creditBureau, decisionTimestamp } = input;

  // Only generate for adverse decisions (DECLINE or REVIEW).
  if (decision === "APPROVE") return null;
  if (!adverse_action_codes || adverse_action_codes.length === 0) return null;

  const fw = MARKET_FRAMEWORKS[market] || DEFAULT_FRAMEWORK;
  const lender = lenderName || "the Lender";
  const borrowerName = borrower
    ? `${borrower.first_name || ""} ${borrower.last_name || ""}`.trim() || "Applicant"
    : "Applicant";
  const amount = application?.loan_amount
    ? `${application.loan_currency || ""} ${Number(application.loan_amount).toLocaleString()}`
    : "";
  const product = (application?.product_type || "credit").replace(/_/g, " ");
  const today = new Date().toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" });
  const action = decision === "DECLINE" ? "declined" : "approved with conditions requiring further information";

  const lines: NoticeLine[] = [];
  lines.push({ kind: "h", text: "Notice of Adverse Action" });
  lines.push({ kind: "m", text: lender });
  lines.push({ kind: "m", text: `Date: ${today}` });
  if (decisionTimestamp) {
    lines.push({ kind: "m", text: `Decision reference: ${decisionTimestamp}` });
  }
  lines.push({ kind: "sp" });
  lines.push({ kind: "m", text: `Dear ${borrowerName},` });
  lines.push({ kind: "sp" });
  lines.push({
    kind: "p",
    text: `Thank you for your recent application to ${lender} for ${product}${amount ? ` in the amount of ${amount}` : ""}. After careful consideration of the information available to us, we regret to inform you that your application has been ${action}.`,
  });
  lines.push({ kind: "sp" });

  if (creditBureau) {
    lines.push({ kind: "p", text: fw.craNote });
    lines.push({ kind: "p", text: `Consumer reporting agency consulted: ${creditBureau}.` });
    lines.push({ kind: "sp" });
  }

  lines.push({ kind: "p", text: "The specific reasons for our decision were:" });
  for (const code of adverse_action_codes) {
    lines.push({ kind: "li", text: `${code.code} — ${code.label || code.reason || "Unspecified factor"}` });
  }
  lines.push({ kind: "sp" });

  lines.push({ kind: "p", text: "Your rights:" });
  for (const right of fw.rights) {
    lines.push({ kind: "li", text: right });
  }
  lines.push({ kind: "sp" });

  lines.push({
    kind: "p",
    text: `If you have any questions about this notice or wish to request additional information, please contact ${lender}.`,
  });
  lines.push({ kind: "sp" });
  lines.push({ kind: "m", text: `Regulatory basis: ${fw.statute}` });
  lines.push({ kind: "m", text: "This notice is generated automatically by CreditDecide and is retained in the decision audit trail." });

  // Build plain text version
  const text = lines
    .map((ln) => {
      if (ln.kind === "sp") return "";
      if (ln.kind === "h") return `\n${ln.text}\n`;
      if (ln.kind === "li") return `  • ${ln.text}`;
      if (ln.kind === "m") return ln.text || "";
      return ln.text || "";
    })
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return {
    framework: fw.name,
    statute: fw.statute,
    text,
    lines,
    generated_at: new Date().toISOString(),
  };
}