import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { genId, apiError, apiSuccess, readBody, resolveOrganization, requireScope, audit } from "../../shared/utils.ts";

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const body = await readBody(req);
    const action = body.action || "list";

    // ---- Public actions: no auth, org resolved from the form slug ----
    if (action === "public_get") {
      const { slug } = body;
      if (!slug) return apiError("VALIDATION_ERROR", "slug is required.", 400);
      const forms = await base44.asServiceRole.entities.ApplicationForm.filter({ slug, status: "active" }, "-created_date", 1);
      if (forms.length === 0) return apiError("FORM_NOT_FOUND", "This application form is not available.", 404);
      return apiSuccess({ form: publicForm(forms[0]) }, 200);
    }

    if (action === "public_submit") {
      const { slug, values } = body;
      if (!slug) return apiError("VALIDATION_ERROR", "slug is required.", 400);
      const forms = await base44.asServiceRole.entities.ApplicationForm.filter({ slug, status: "active" }, "-created_date", 1);
      if (forms.length === 0) return apiError("FORM_NOT_FOUND", "This application form is not available.", 404);
      const form = forms[0];
      const v = values || {};

      // Validate required fields per form config
      for (const fc of (form.fields || [])) {
        if (fc.enabled && fc.required) {
          if (v[fc.key] === undefined || v[fc.key] === null || v[fc.key] === "") {
            return apiError("VALIDATION_ERROR", `${fc.label} is required.`, 400);
          }
        }
      }
      if (!v.first_name || !v.last_name) return apiError("VALIDATION_ERROR", "first_name and last_name are required.", 400);
      if (!v.loan_amount || Number(v.loan_amount) <= 0) return apiError("VALIDATION_ERROR", "loan_amount must be a positive number.", 400);

      const organization_id = form.organization_id;
      const market = form.market || "GB";
      const currency = currencyFor(market);
      const kyc = kycFor(market);
      for (const f of kyc) {
        if (!v[f.key] || !String(v[f.key]).trim()) return apiError("VALIDATION_ERROR", `${f.label} is required.`, 400);
      }
      const kycValues = kyc.map((f) => String(v[f.key] || "")).filter(Boolean).join("|");
      const national_id_hash = kycValues ? await hashId(`${v.first_name}${v.last_name}${kycValues}`) : (v.date_of_birth ? await hashId(`${v.first_name}${v.last_name}${v.date_of_birth}`) : null);

      const borrower = await base44.asServiceRole.entities.Borrower.create({
        organization_id,
        borrower_reference: genId("BRW"),
        first_name: v.first_name,
        last_name: v.last_name,
        email: v.email || null,
        phone: v.phone || null,
        date_of_birth: v.date_of_birth || null,
        national_id_hash,
        address: {
          line1: v.address_line1 || null,
          city: v.address_city || null,
          postal_code: v.address_postal_code || null,
          country: market,
        },
        employment_status: v.employment_status || "other",
        employer_name: v.employer_name || null,
        annual_income: v.annual_income ? Number(v.annual_income) : null,
        income_currency: currency,
      });

      const application = await base44.asServiceRole.entities.Application.create({
        organization_id,
        environment: "sandbox",
        application_number: genId("APP"),
        borrower_id: borrower.id,
        form_id: form.id,
        market,
        regulatory_profile: null,
        state: v.state || null,
        borrower_type: form.borrower_type || "salaried",
        product_type: form.product_type || "personal_loan",
        loan_amount: Number(v.loan_amount),
        loan_currency: currency,
        loan_purpose: v.loan_purpose || "general",
        loan_term_months: Number(v.loan_term_months) || 12,
        interest_rate: null,
        policy_id: form.policy_id || "consumer-v1",
        status: "data_collection",
        decision: "null",
        idempotency_key: null,
      });

      try {
        await base44.asServiceRole.entities.ApplicationForm.update(form.id, { submissions_count: (form.submissions_count || 0) + 1 });
      } catch {}

      await audit(base44, organization_id, "form.submitted", {
        application_id: application.id,
        actor: "public",
        actor_type: "system",
        endpoint: "POST /apply/:slug",
        details: { form_id: form.id, borrower_id: borrower.id, application_number: application.application_number }
      });

      return apiSuccess({
        application_id: application.id,
        application_number: application.application_number,
        thank_you_message: form.thank_you_message || "Thank you. Your application has been received."
      }, 201);
    }

    // ---- Authenticated actions ----
    const ctx = await resolveOrganization(base44, body);
    const { organization_id, actor, actor_type } = ctx;

    if (action === "list") {
      requireScope(ctx, "applications:read");
      const forms = await base44.asServiceRole.entities.ApplicationForm.filter({ organization_id }, "-created_date", 100);
      return apiSuccess({ forms }, 200);
    }

    if (action === "get") {
      requireScope(ctx, "applications:read");
      const { form_id } = body;
      if (!form_id) return apiError("VALIDATION_ERROR", "form_id is required.", 400);
      const forms = await base44.asServiceRole.entities.ApplicationForm.filter({ id: form_id, organization_id }, "-created_date", 1);
      if (forms.length === 0) return apiError("FORM_NOT_FOUND", "Form not found.", 404);
      return apiSuccess({ form: forms[0] }, 200);
    }

    if (action === "submissions") {
      requireScope(ctx, "applications:read");
      const { form_id } = body;
      if (!form_id) return apiError("VALIDATION_ERROR", "form_id is required.", 400);
      const forms = await base44.asServiceRole.entities.ApplicationForm.filter({ id: form_id, organization_id }, "-created_date", 1);
      if (forms.length === 0) return apiError("FORM_NOT_FOUND", "Form not found.", 404);
      const form = forms[0];
      const apps = await base44.asServiceRole.entities.Application.filter({ form_id, organization_id }, "-created_date", 200);
      const borrowerIds = Array.from(new Set(apps.map((a: any) => a.borrower_id).filter(Boolean)));
      const borrowers: any[] = await Promise.all(borrowerIds.map((id: string) =>
        base44.asServiceRole.entities.Borrower.get(id).catch(() => null)
      ));
      const borrowerMap: any = {};
      borrowers.forEach((b) => { if (b) borrowerMap[b.id] = b; });
      const submissions = apps.map((a: any) => ({
        application_id: a.id,
        application_number: a.application_number,
        status: a.status,
        decision: a.decision,
        loan_amount: a.loan_amount,
        loan_currency: a.loan_currency,
        market: a.market,
        product_type: a.product_type,
        created_date: a.created_date,
        borrower: borrowerMap[a.borrower_id] ? {
          first_name: borrowerMap[a.borrower_id].first_name,
          last_name: borrowerMap[a.borrower_id].last_name,
          email: borrowerMap[a.borrower_id].email,
        } : null,
      }));
      return apiSuccess({ form, submissions }, 200);
    }

    if (action === "create") {
      requireScope(ctx, "applications:write");
      const { name, title, intro, accent_color, logo_url, market, borrower_type, product_type, policy_id, fields, thank_you_message } = body;
      if (!name) return apiError("VALIDATION_ERROR", "name is required.", 400);
      const slug = genId("frm", 10).toLowerCase();
      const form = await base44.asServiceRole.entities.ApplicationForm.create({
        organization_id,
        name,
        slug,
        title: title || name,
        intro: intro || "",
        accent_color: accent_color || "#0d9488",
        logo_url: logo_url || null,
        market: market || "GB",
        borrower_type: borrower_type || "salaried",
        product_type: product_type || "personal_loan",
        policy_id: policy_id || "consumer-v1",
        fields: Array.isArray(fields) ? fields : defaultFields(),
        thank_you_message: thank_you_message || "Thank you. Your application has been received.",
        status: "active",
        submissions_count: 0,
      });
      await audit(base44, organization_id, "form.created", { actor, actor_type, endpoint: "POST /v1/forms", details: { form_id: form.id } });
      return apiSuccess({ form_id: form.id, form }, 201);
    }

    if (action === "update") {
      requireScope(ctx, "applications:write");
      const { form_id, name, title, intro, accent_color, logo_url, market, borrower_type, product_type, policy_id, fields, thank_you_message, status } = body;
      if (!form_id) return apiError("VALIDATION_ERROR", "form_id is required.", 400);
      const forms = await base44.asServiceRole.entities.ApplicationForm.filter({ id: form_id, organization_id }, "-created_date", 1);
      if (forms.length === 0) return apiError("FORM_NOT_FOUND", "Form not found.", 404);
      const updates: any = {};
      if (name !== undefined) updates.name = name;
      if (title !== undefined) updates.title = title;
      if (intro !== undefined) updates.intro = intro;
      if (accent_color !== undefined) updates.accent_color = accent_color;
      if (logo_url !== undefined) updates.logo_url = logo_url;
      if (market !== undefined) updates.market = market;
      if (borrower_type !== undefined) updates.borrower_type = borrower_type;
      if (product_type !== undefined) updates.product_type = product_type;
      if (policy_id !== undefined) updates.policy_id = policy_id;
      if (fields !== undefined) updates.fields = fields;
      if (thank_you_message !== undefined) updates.thank_you_message = thank_you_message;
      if (status !== undefined) updates.status = status;
      if (Object.keys(updates).length === 0) return apiError("VALIDATION_ERROR", "No fields to update.", 400);
      const updated = await base44.asServiceRole.entities.ApplicationForm.update(form_id, updates);
      await audit(base44, organization_id, "form.updated", { actor, actor_type, endpoint: "PATCH /v1/forms/{id}", details: { form_id, fields: Object.keys(updates) } });
      return apiSuccess({ form: updated }, 200);
    }

    if (action === "delete") {
      requireScope(ctx, "applications:write");
      const { form_id } = body;
      if (!form_id) return apiError("VALIDATION_ERROR", "form_id is required.", 400);
      const forms = await base44.asServiceRole.entities.ApplicationForm.filter({ id: form_id, organization_id }, "-created_date", 1);
      if (forms.length === 0) return apiError("FORM_NOT_FOUND", "Form not found.", 404);
      await base44.asServiceRole.entities.ApplicationForm.delete(form_id);
      await audit(base44, organization_id, "form.deleted", { actor, actor_type, endpoint: "DELETE /v1/forms/{id}", details: { form_id } });
      return apiSuccess({ deleted: true }, 200);
    }

    return apiError("UNKNOWN_ACTION", `Action '${action}' is not supported.`, 400);
  } catch (e) {
    if (e.status) return apiError(e.code || "ERROR", e.message, e.status);
    return apiError("INTERNAL_ERROR", e.message, 500);
  }
}

function publicForm(f: any) {
  return {
    id: f.id,
    slug: f.slug,
    title: f.title,
    intro: f.intro,
    accent_color: f.accent_color,
    logo_url: f.logo_url,
    market: f.market,
    borrower_type: f.borrower_type,
    product_type: f.product_type,
    kyc: kycFor(f.market),
    fields: (f.fields || []).filter((x: any) => x.enabled),
    thank_you_message: f.thank_you_message,
  };
}

function kycFor(market: string): any[] {
  const map: any = {
    GB: [{ key: "national_insurance_number", label: "National Insurance Number (NI)", placeholder: "e.g. QQ 12 34 56 C", hint: "Used to verify identity and pull your UK credit report (Experian, Equifax, TransUnion)" }],
    US: [{ key: "ssn", label: "Social Security Number (SSN)", placeholder: "123-45-6789", hint: "Used to verify identity and pull your US credit report (KYC / Patriot Act)" }],
    NG: [
      { key: "bvn", label: "Bank Verification Number (BVN)", placeholder: "11-digit BVN", hint: "Required by Nigerian credit bureaus (CRC, Credit Registry, FirstCentral)" },
      { key: "nin", label: "National Identification Number (NIN)", placeholder: "11-digit NIN", hint: "National ID for KYC verification" },
    ],
    ZA: [{ key: "sa_id_number", label: "SA ID Number", placeholder: "ID number", hint: "Used to verify identity and pull your South African credit report (FICA)" }],
    KE: [
      { key: "national_id", label: "National ID Number", placeholder: "National ID", hint: "Used for KYC and credit pull (CRB Africa, TransUnion)" },
      { key: "kra_pin", label: "KRA PIN", placeholder: "e.g. A000000000X", hint: "Kenya Revenue Authority PIN" },
    ],
    GH: [{ key: "ghana_card_number", label: "Ghana Card Number", placeholder: "GHA-000000000", hint: "Used to verify identity and pull your Ghana credit report (XDS Ghana)" }],
  };
  return map[market] || map.GB;
}

function defaultFields() {
  return [
    { key: "first_name", label: "First name", enabled: true, required: true },
    { key: "last_name", label: "Last name", enabled: true, required: true },
    { key: "email", label: "Email", enabled: true, required: true },
    { key: "phone", label: "Phone", enabled: true, required: false },
    { key: "date_of_birth", label: "Date of birth", enabled: true, required: false },
    { key: "address_line1", label: "Address line 1", enabled: false, required: false },
    { key: "address_city", label: "City", enabled: false, required: false },
    { key: "address_postal_code", label: "Postal code", enabled: false, required: false },
    { key: "employment_status", label: "Employment status", enabled: true, required: false },
    { key: "employer_name", label: "Employer name", enabled: false, required: false },
    { key: "annual_income", label: "Annual income", enabled: true, required: false },
    { key: "loan_amount", label: "Loan amount", enabled: true, required: true },
    { key: "loan_term_months", label: "Loan term (months)", enabled: true, required: false },
    { key: "loan_purpose", label: "Loan purpose", enabled: true, required: false },
  ];
}

function currencyFor(market: string): string {
  const map: any = { GB: "GBP", US: "USD", NG: "NGN", ZA: "ZAR", KE: "KES", GH: "GHS" };
  return map[market] || "GBP";
}

async function hashId(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const h = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(h)).map(b => b.toString(16).padStart(2, "0")).join("").slice(0, 32);
}