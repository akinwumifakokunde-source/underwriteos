import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { apiError, apiSuccess, readBody, resolveOrganization, requireScope } from "../../shared/utils.ts";
import { runUnderwrite } from "../../shared/underwritePipeline.ts";

// POST /v1/applications/{id}/underwrite — runs the full underwriting evaluation.
// Pipeline: AI Analysis -> Risk Signals -> Evidence -> Policy Engine -> Recommendation -> Final Decision.
// The AI recommendation never overrides lender policy; the final decision is authoritative.
// The pipeline logic lives in shared/underwritePipeline.ts so it can be re-run
// automatically when a borrower uploads new documents via the portal.
export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const body = await readBody(req);
    const ctx = await resolveOrganization(base44, body);
    const { organization_id, actor, actor_type } = ctx;
    requireScope(ctx, "applications:write");
    const { application_id, policy_id, decision_source, override_reason, override } = body;

    if (!application_id) return apiError("VALIDATION_ERROR", "application_id is required.", 400);

    const idempotency_key = req.headers.get("idempotency-key") || body.idempotency_key;
    const result = await runUnderwrite(base44, application_id, organization_id, actor, actor_type, { policy_id, override, decision_source, override_reason, idempotency_key });
    return apiSuccess(result, 200);
  } catch (e: any) {
    if (e.status) return apiError(e.code || "ERROR", e.message, e.status);
    return apiError("INTERNAL_ERROR", e.message, 500);
  }
}