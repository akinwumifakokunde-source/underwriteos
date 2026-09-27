import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { apiError, apiSuccess, readBody, resolveOrganization, requireScope, audit } from "../../shared/utils.ts";
import { evaluatePolicy } from "../../shared/policyEngine.ts";

// POST — Backtest a candidate policy against past applications.
// Re-evaluates each completed application's risk signals against the candidate
// policy rules and compares the result to the original decision stored on the
// application. Returns flip analysis (approve→decline, decline→approve, etc.)
// so lenders can preview the impact of a policy change before publishing.
export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const body = await readBody(req);
    const ctx = await resolveOrganization(base44, body);
    const { organization_id, actor, actor_type } = ctx;
    requireScope(ctx, "applications:read");

    const candidateRules = body.rules;
    const candidatePolicyId = body.policy_id || "backtest-candidate";
    const candidateVersion = body.version || "draft";
    const limit = Math.min(Number(body.limit) || 200, 500);

    if (!Array.isArray(candidateRules)) {
      return apiError("VALIDATION_ERROR", "rules (array) is required.", 400);
    }

    const candidatePolicy = {
      policy_id: candidatePolicyId,
      version: candidateVersion,
      name: "Backtest Candidate",
      rules: candidateRules
    };

    // Load completed applications that have a decision recorded.
    const apps = await base44.asServiceRole.entities.Application.filter(
      { organization_id, status: "completed" },
      "-created_date",
      limit
    );

    const results: any[] = [];
    let same = 0;
    let flipped = 0;
    const flipMatrix: Record<string, number> = {};

    for (const app of apps) {
      // Load risk signals for this application.
      const signals = await base44.asServiceRole.entities.RiskSignal.filter(
        { application_id: app.id, organization_id },
        "-created_date",
        100
      );

      if (signals.length === 0) continue;

      const outcome = evaluatePolicy(candidatePolicy, signals);
      const originalDecision = app.decision || "REVIEW";
      const candidateDecision = outcome.decision;

      const isSame = originalDecision === candidateDecision;
      if (isSame) same++; else flipped++;

      const flipKey = `${originalDecision}→${candidateDecision}`;
      if (!isSame) flipMatrix[flipKey] = (flipMatrix[flipKey] || 0) + 1;

      results.push({
        application_id: app.id,
        application_number: app.application_number,
        borrower_id: app.borrower_id,
        loan_amount: app.loan_amount,
        loan_currency: app.loan_currency,
        market: app.market,
        original_decision: originalDecision,
        candidate_decision: candidateDecision,
        original_risk_score: app.risk_score,
        flipped: !isSame,
        flip_type: isSame ? null : flipKey,
        triggered_rules: outcome.triggered_rules.map((t: any) => t.rule_id),
        reasons: outcome.reasons
      });
    }

    const total = results.length;
    const summary = {
      total,
      same,
      flipped,
      flip_rate: total > 0 ? flipped / total : 0,
      flip_matrix: flipMatrix,
      approval_rate_original: total > 0 ? results.filter(r => r.original_decision === "APPROVE").length / total : 0,
      approval_rate_candidate: total > 0 ? results.filter(r => r.candidate_decision === "APPROVE").length / total : 0,
      decline_rate_original: total > 0 ? results.filter(r => r.original_decision === "DECLINE").length / total : 0,
      decline_rate_candidate: total > 0 ? results.filter(r => r.candidate_decision === "DECLINE").length / total : 0
    };

    await audit(base44, organization_id, "policy.backtest", { actor, actor_type, endpoint: "POST /v1/policy-backtest", details: { candidate_policy_id: candidatePolicyId, total, flipped, flip_rate: summary.flip_rate } });

    return apiSuccess({ summary, results: results.slice(0, 100) }, 200);
  } catch (e) {
    if (e.status) return apiError(e.code || "ERROR", e.message, e.status);
    return apiError("INTERNAL_ERROR", e.message, 500);
  }
}