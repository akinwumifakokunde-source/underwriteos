import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { apiError, apiSuccess, readBody, resolveOrganization, requireScope } from "../../shared/utils.ts";
import { runAnalyze } from "../../shared/analyzePipeline.ts";

// POST /v1/applications/{id}/analyze — runs the normalization -> risk signal ->
// evidence pipeline. Produces structured RiskSignals each linked to traceable
// Evidence. The pipeline logic lives in shared/analyzePipeline.ts so it can be
// re-run automatically when a borrower uploads new documents via the portal.
export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const body = await readBody(req);
    const ctx = await resolveOrganization(base44, body);
    const { organization_id, actor, actor_type } = ctx;
    requireScope(ctx, "applications:write");
    const { application_id } = body;

    if (!application_id) return apiError("VALIDATION_ERROR", "application_id is required.", 400);
    const result = await runAnalyze(base44, application_id, organization_id, actor, actor_type);
    return apiSuccess(result, 202);
  } catch (e: any) {
    if (e.status) return apiError(e.code || "ERROR", e.message, e.status);
    return apiError("INTERNAL_ERROR", e.message, 500);
  }
}