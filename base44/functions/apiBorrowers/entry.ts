import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { genId, apiError, apiSuccess, readBody, resolveOrganization, requireScope, audit, findIdempotent } from "../../shared/utils.ts";

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const body = await readBody(req);
    const ctx = await resolveOrganization(base44, body);
    const { organization_id, actor, actor_type } = ctx;
    const action = body.action || "create";
    if (action === "create") requireScope(ctx, "borrowers:write");
    if (action === "get") requireScope(ctx, "borrowers:read");

    if (action === "create") {
      const idempotencyKey = req.headers.get("idempotency-key") || body.idempotency_key;
      const existing = await findIdempotent(base44, "Borrower", organization_id, idempotencyKey);
      if (existing) return apiSuccess({ borrower_id: existing.id, borrower: existing, idempotent_replay: true }, 200);

      const { first_name, last_name, email, phone, date_of_birth, address, employment_status, employer_name, annual_income, income_currency } = body;
      if (!first_name || !last_name) return apiError("VALIDATION_ERROR", "first_name and last_name are required.", 400);

      const borrower = await base44.asServiceRole.entities.Borrower.create({
        organization_id,
        borrower_reference: genId("BRW"),
        first_name,
        last_name,
        email: email || null,
        phone: phone || null,
        date_of_birth: date_of_birth || null,
        national_id_hash: date_of_birth ? await hashId(`${first_name}${last_name}${date_of_birth}`) : null,
        address: address || {},
        employment_status: employment_status || "other",
        employer_name: employer_name || null,
        annual_income: annual_income ? Number(annual_income) : null,
        income_currency: income_currency || "GBP",
        idempotency_key: idempotencyKey || null
      });

      await audit(base44, organization_id, "borrower.created", { actor, actor_type, endpoint: "POST /v1/borrowers", details: { borrower_id: borrower.id } });
      return apiSuccess({ borrower_id: borrower.id, borrower }, 201);
    }

    if (action === "get") {
      const { borrower_id } = body;
      if (!borrower_id) return apiError("VALIDATION_ERROR", "borrower_id is required.", 400);
      const borrowers = await base44.asServiceRole.entities.Borrower.filter({ id: borrower_id, organization_id }, "-created_date", 1);
      if (borrowers.length === 0) return apiError("BORROWER_NOT_FOUND", `Borrower ${borrower_id} was not found.`, 404);
      return apiSuccess({ borrower: borrowers[0] }, 200);
    }

    if (action === "update") {
      requireScope(ctx, "borrowers:write");
      const { borrower_id, first_name, last_name, email, phone, date_of_birth, address, employment_status, employer_name, annual_income, income_currency } = body;
      if (!borrower_id) return apiError("VALIDATION_ERROR", "borrower_id is required.", 400);
      const borrowers = await base44.asServiceRole.entities.Borrower.filter({ id: borrower_id, organization_id }, "-created_date", 1);
      if (borrowers.length === 0) return apiError("BORROWER_NOT_FOUND", `Borrower ${borrower_id} was not found.`, 404);
      const updates: any = {};
      if (first_name !== undefined) updates.first_name = first_name;
      if (last_name !== undefined) updates.last_name = last_name;
      if (email !== undefined) updates.email = email;
      if (phone !== undefined) updates.phone = phone;
      if (date_of_birth !== undefined) updates.date_of_birth = date_of_birth;
      if (address !== undefined) updates.address = address;
      if (employment_status !== undefined) updates.employment_status = employment_status;
      if (employer_name !== undefined) updates.employer_name = employer_name;
      if (annual_income !== undefined) updates.annual_income = annual_income ? Number(annual_income) : null;
      if (income_currency !== undefined) updates.income_currency = income_currency;
      if (Object.keys(updates).length === 0) return apiError("VALIDATION_ERROR", "No fields to update.", 400);
      const updated = await base44.asServiceRole.entities.Borrower.update(borrower_id, updates);
      await audit(base44, organization_id, "borrower.updated", { actor, actor_type, endpoint: "PATCH /v1/borrowers/{id}", details: { borrower_id, fields: Object.keys(updates) } });
      return apiSuccess({ borrower: updated }, 200);
    }

    return apiError("UNKNOWN_ACTION", `Action '${action}' is not supported. Use create|get|update.`, 400);
  } catch (e) {
    if (e.status) return apiError(e.code || "ERROR", e.message, e.status);
    return apiError("INTERNAL_ERROR", e.message, 500);
  }
}

async function hashId(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const h = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(h)).map(b => b.toString(16).padStart(2, "0")).join("").slice(0, 32);
}