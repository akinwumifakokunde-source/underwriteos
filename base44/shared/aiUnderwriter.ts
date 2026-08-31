// AI underwriter. Produces an underwriting memo that references structured
// evidence only — it is never permitted to invent financial information.
// The output is an advisory analysis that feeds the UnderwritingRecommendation.
// The AI must NEVER silently override lender policy.

export interface AIUnderwriterInput {
  borrower: any;
  application: any;
  credit: any;
  financial: any;
  signals: any[];
  evidence: any[];
  policyOutcome: any;
}

export interface AIUnderwriterOutput {
  summary: string;
  memo: string;
  positive_signals: string[];
  risk_factors: string[];
  confidence: number;
}

export async function generateUnderwritingMemo(base44: any, input: AIUnderwriterInput): Promise<AIUnderwriterOutput> {
  const evidenceDigest = input.evidence
    .slice(0, 30)
    .map(e => `- ${e.signal}: ${e.value}${e.currency ? " " + e.currency : ""} (source: ${e.source_type}${e.source_id ? ", id: " + e.source_id : ""}${e.calculation_method ? ", method: " + e.calculation_method : ""}, confidence: ${e.confidence})`)
    .join("\n");

  const signalDigest = input.signals
    .slice(0, 30)
    .map(s => `- ${s.category}/${s.signal}: ${s.value} [${s.flag}]`)
    .join("\n");

  const prompt = `You are an AI underwriting analyst for CreditDecide, a B2B underwriting infrastructure platform.
You are reviewing a loan application. You MUST base your analysis ONLY on the structured evidence and risk signals provided below.
Do NOT invent, estimate, or assume any financial figures that are not present in the evidence.
If information is missing, state that it is unavailable.

BORROWER:
${JSON.stringify(input.borrower, null, 2)}

APPLICATION:
${JSON.stringify({ loan_amount: input.application.loan_amount, loan_currency: input.application.loan_currency, loan_purpose: input.application.loan_purpose, loan_term_months: input.application.loan_term_months }, null, 2)}

CREDIT PROFILE (normalized):
${JSON.stringify(input.credit, null, 2)}

FINANCIAL PROFILE (canonical):
${JSON.stringify(input.financial, null, 2)}

RISK SIGNALS:
${signalDigest}

EVIDENCE (traceable to source):
${evidenceDigest}

POLICY OUTCOME (authoritative — your recommendation must not override this):
${JSON.stringify(input.policyOutcome, null, 2)}

Produce a concise underwriting memo with:
1. A 2-3 sentence summary of the borrower's financial position.
2. The most important positive signals.
3. The most important risk factors.
4. A short reasoning narrative that references the evidence by signal name.
5. A confidence score (0..1) in your analysis given the available evidence.

Return ONLY JSON with this exact schema:
{
  "summary": "string",
  "memo": "string (the reasoning narrative)",
  "positive_signals": ["string", ...],
  "risk_factors": ["string", ...],
  "confidence": 0.0
}`;

  const schema = {
    type: "object",
    properties: {
      summary: { type: "string" },
      memo: { type: "string" },
      positive_signals: { type: "array", items: { type: "string" } },
      risk_factors: { type: "array", items: { type: "string" } },
      confidence: { type: "number" }
    },
    required: ["summary", "memo", "positive_signals", "risk_factors", "confidence"]
  };

  try {
    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: schema
    });
    const parsed = typeof result === "string" ? JSON.parse(result) : result;
    return {
      summary: parsed.summary || "",
      memo: parsed.memo || "",
      positive_signals: Array.isArray(parsed.positive_signals) ? parsed.positive_signals : [],
      risk_factors: Array.isArray(parsed.risk_factors) ? parsed.risk_factors : [],
      confidence: typeof parsed.confidence === "number" ? parsed.confidence : 0.7
    };
  } catch {
    // Graceful fallback: deterministic memo without AI if LLM unavailable.
    return fallbackMemo(input);
  }
}

function fallbackMemo(input: AIUnderwriterInput): AIUnderwriterOutput {
  const positives = input.signals.filter(s => s.flag === "positive").map(s => s.signal).slice(0, 5);
  const risks = input.signals.filter(s => s.flag === "negative" || s.flag === "critical").map(s => s.signal).slice(0, 5);
  const income = input.financial?.income?.monthly ?? 0;
  const dti = input.financial?.affordability?.debt_to_income ?? 0;
  const disposable = input.financial?.cashflow?.disposable_income ?? 0;
  const currency = input.financial?.currency || "GBP";
  return {
    summary: `Borrower shows a credit score of ${input.credit.credit_score ?? "unavailable"} with ${input.credit.active_accounts ?? "unknown"} active accounts and monthly income of ${income} ${currency}.`,
    memo: `Based on the available evidence, the borrower's financial position is summarized by the normalized credit and cashflow profiles. Policy evaluation resulted in: ${input.policyOutcome.decision}. Key evidence includes debt-to-income of ${dti} and disposable income of ${disposable} ${currency}.`,
    positive_signals: positives,
    risk_factors: risks,
    confidence: 0.75
  };
}