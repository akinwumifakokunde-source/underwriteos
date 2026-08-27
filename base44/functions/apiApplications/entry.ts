import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { genId, apiError, apiSuccess, readBody, resolveOrganization, requireScope, audit, findIdempotent } from "../../shared/utils.ts";

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const body = await readBody(req);
    const ctx = await resolveOrganization(base44, body);
    const { organization_id, actor, actor_type } = ctx;
    const action = body.action || "create";
    if (action === "create") requireScope(ctx, "applications:write");
    if (action === "get" || action === "list") requireScope(ctx, "applications:read");

    if (action === "create") {
      const idempotencyKey = req.headers.get("idempotency-key") || body.idempotency_key;
      const existing = await findIdempotent(base44, "Application", organization_id, idempotencyKey);
      if (existing) return apiSuccess({ application_id: existing.id, application: existing, idempotent_replay: true }, 200);

      const { borrower_id, loan_amount, loan_currency, loan_purpose, loan_term_months, interest_rate, policy_id } = body;
      if (!borrower_id) return apiError("VALIDATION_ERROR", "borrower_id is required.", 400);
      if (loan_amount === undefined || loan_amount <= 0) return apiError("VALIDATION_ERROR", "loan_amount must be a positive number.", 400);

      const borrower = await base44.asServiceRole.entities.Borrower.filter({ id: borrower_id, organization_id }, "-created_date", 1);
      if (borrower.length === 0) return apiError("BORROWER_NOT_FOUND", `Borrower ${borrower_id} was not found.`, 404);

      const application = await base44.asServiceRole.entities.Application.create({
        organization_id,
        environment: "sandbox",
        application_number: genId("APP"),
        borrower_id,
        loan_amount: Number(loan_amount),
        loan_currency: loan_currency || "GBP",
        loan_purpose: loan_purpose || "general",
        loan_term_months: Number(loan_term_months) || 12,
        interest_rate: interest_rate ?? null,
        policy_id: policy_id || "consumer-v1",
        status: "draft",
        decision: "null",
        idempotency_key: idempotencyKey || null
      });

      await audit(base44, organization_id, "application.created", { application_id: application.id, actor, actor_type, endpoint: "POST /v1/applications", details: { loan_amount, loan_purpose } });
      return apiSuccess({ application_id: application.id, application }, 201);
    }

    if (action === "get") {
      const { application_id } = body;
      if (!application_id) return apiError("VALIDATION_ERROR", "application_id is required.", 400);
      const apps = await base44.asServiceRole.entities.Application.filter({ id: application_id, organization_id }, "-created_date", 1);
      if (apps.length === 0) return apiError("APPLICATION_NOT_FOUND", `Application ${application_id} was not found.`, 404);
      const app = apps[0];
      const borrowers = await base44.asServiceRole.entities.Borrower.filter({ id: app.borrower_id, organization_id }, "-created_date", 1);
      return apiSuccess({ application: app, borrower: borrowers[0] || null }, 200);
    }

    if (action === "list") {
      const limit = Math.min(Number(body.limit) || 50, 100);
      const apps = await base44.asServiceRole.entities.Application.filter({ organization_id }, "-created_date", limit);
      return apiSuccess({ applications: apps, count: apps.length }, 200);
    }

    if (action === "update") {
      requireScope(ctx, "applications:write");
      const { application_id, loan_amount, loan_currency, loan_purpose, loan_term_months, interest_rate, policy_id, product_type } = body;
      if (!application_id) return apiError("VALIDATION_ERROR", "application_id is required.", 400);
      const apps = await base44.asServiceRole.entities.Application.filter({ id: application_id, organization_id }, "-created_date", 1);
      if (apps.length === 0) return apiError("APPLICATION_NOT_FOUND", `Application ${application_id} was not found.`, 404);
      const updates: any = {};
      if (loan_amount !== undefined) updates.loan_amount = Number(loan_amount);
      if (loan_currency !== undefined) updates.loan_currency = loan_currency;
      if (loan_purpose !== undefined) updates.loan_purpose = loan_purpose;
      if (loan_term_months !== undefined) updates.loan_term_months = Number(loan_term_months);
      if (interest_rate !== undefined) updates.interest_rate = interest_rate;
      if (policy_id !== undefined) updates.policy_id = policy_id;
      if (product_type !== undefined) updates.product_type = product_type;
      if (Object.keys(updates).length === 0) return apiError("VALIDATION_ERROR", "No fields to update.", 400);
      const updated = await base44.asServiceRole.entities.Application.update(application_id, updates);
      await audit(base44, organization_id, "application.updated", { application_id, actor, actor_type, endpoint: "PATCH /v1/applications/{id}", details: updates });
      return apiSuccess({ application: updated }, 200);
    }

    return apiError("UNKNOWN_ACTION", `Action '${action}' is not supported. Use create|get|list|update.`, 400);
  } catch (e) {
    if (e.status) return apiError(e.code || "ERROR", e.message, e.status);
    return apiError("INTERNAL_ERROR", e.message, 500);
  }
}