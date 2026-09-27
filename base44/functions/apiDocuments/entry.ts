import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { genId, apiError, apiSuccess, readBody, resolveOrganization, requireScope, audit } from "../../shared/utils.ts";
import { processDocument } from "../../shared/documentProcessing.ts";

// Document intelligence: upload, auto-classify, AI-extract, create profiles,
// generate evidence — all with full provenance from document to field.
// The extraction + profile + evidence logic lives in shared/documentProcessing.ts
// so the public borrower portal can reuse it.

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const body = await readBody(req);
    const ctx = await resolveOrganization(base44, body);
    const { organization_id, actor, actor_type } = ctx;
    const action = body.action || "upload";
    if (action === "upload" || action === "process" || action === "reprocess") requireScope(ctx, "applications:write");
    if (action === "list" || action === "get") requireScope(ctx, "applications:read");
    if (action === "delete") requireScope(ctx, "applications:write");

    // ── UPLOAD ──────────────────────────────────────────────
    if (action === "upload") {
      const { application_id, document_type, file_url, file_name, mime_type } = body;
      if (!application_id) return apiError("VALIDATION_ERROR", "application_id is required.", 400);
      if (!file_url) return apiError("VALIDATION_ERROR", "file_url is required.", 400);

      const apps = await base44.asServiceRole.entities.Application.filter({ id: application_id, organization_id }, "-created_date", 1);
      if (apps.length === 0) return apiError("APPLICATION_NOT_FOUND", `Application ${application_id} was not found.`, 404);

      // Auto-classify if not provided
      const classified = classifyDocument(file_name || "", mime_type || "");
      const docType = document_type || classified.type;
      const fileFormat = detectFormat(file_name, mime_type);

      const doc = await base44.asServiceRole.entities.Document.create({
        organization_id,
        application_id,
        document_reference: genId("DOC"),
        document_type: docType,
        file_url,
        file_name: file_name || null,
        mime_type: mime_type || null,
        file_format: fileFormat,
        status: "uploaded",
        extracted_data: null,
        confidence: null,
        extracted_fields_count: 0,
        issues: []
      });

      await audit(base44, organization_id, "document.uploaded", { application_id, actor, actor_type, endpoint: "POST /v1/applications/{id}/documents", details: { document_id: doc.id, document_type: docType, classified: !document_type } });
      return apiSuccess({ document_id: doc.id, document: doc, classified_type: docType, classification_confidence: classified.confidence }, 201);
    }

    // ── PROCESS (AI extraction + profile creation + evidence) ──
    if (action === "process" || action === "reprocess") {
      const { document_id } = body;
      if (!document_id) return apiError("VALIDATION_ERROR", "document_id is required.", 400);

      const docs = await base44.asServiceRole.entities.Document.filter({ id: document_id, organization_id }, "-created_date", 1);
      if (docs.length === 0) return apiError("DOCUMENT_NOT_FOUND", `Document ${document_id} was not found.`, 404);

      try {
        const result = await processDocument(base44, docs[0], organization_id, actor, actor_type);
        return apiSuccess(result, 200);
      } catch (e: any) {
        if (e.status) return apiError(e.code || "ERROR", e.message, e.status);
        return apiError("INTERNAL_ERROR", e.message, 500);
      }
    }

    // ── LIST ────────────────────────────────────────────────
    if (action === "list") {
      const { application_id } = body;
      if (!application_id) return apiError("VALIDATION_ERROR", "application_id is required.", 400);
      const docs = await base44.asServiceRole.entities.Document.filter({ application_id, organization_id }, "-created_date", 100);
      return apiSuccess({ documents: docs, count: docs.length }, 200);
    }

    // ── GET ────────────────────────────────────────────────
    if (action === "get") {
      const { document_id } = body;
      if (!document_id) return apiError("VALIDATION_ERROR", "document_id is required.", 400);
      const docs = await base44.asServiceRole.entities.Document.filter({ id: document_id, organization_id }, "-created_date", 1);
      if (docs.length === 0) return apiError("DOCUMENT_NOT_FOUND", `Document ${document_id} was not found.`, 404);
      return apiSuccess({ document: docs[0] }, 200);
    }

    // ── DELETE ──────────────────────────────────────────────
    if (action === "delete") {
      const { document_id } = body;
      if (!document_id) return apiError("VALIDATION_ERROR", "document_id is required.", 400);
      const docs = await base44.asServiceRole.entities.Document.filter({ id: document_id, organization_id }, "-created_date", 1);
      if (docs.length === 0) return apiError("DOCUMENT_NOT_FOUND", `Document ${document_id} was not found.`, 404);
      // Delete linked evidence
      const evidence = await base44.asServiceRole.entities.Evidence.filter({ document_id, organization_id }, "-created_date", 500);
      if (evidence.length) await base44.asServiceRole.entities.Evidence.deleteMany({ document_id, organization_id });
      await base44.asServiceRole.entities.Document.delete(document_id);
      await audit(base44, organization_id, "document.deleted", { application_id: docs[0].application_id, actor, actor_type, details: { document_id } });
      return apiSuccess({ deleted: true }, 200);
    }

    return apiError("UNKNOWN_ACTION", `Action '${action}' is not supported. Use upload|process|list|get|delete|reprocess.`, 400);
  } catch (e) {
    if (e.status) return apiError(e.code || "ERROR", e.message, e.status);
    return apiError("INTERNAL_ERROR", e.message, 500);
  }
}

// ── Helpers ──────────────────────────────────────────────────

function classifyDocument(filename: string, _mime: string): { type: string; confidence: number } {
  const name = (filename || "").toLowerCase();
  if (name.includes("bank") || name.includes("statement")) return { type: "bank_statement", confidence: 0.90 };
  if (name.includes("payslip") || name.includes("pay_slip") || name.includes("salary")) return { type: "payslip", confidence: 0.90 };
  if (name.includes("credit")) return { type: "credit_report", confidence: 0.88 };
  if (name.includes("tax")) return { type: "tax", confidence: 0.85 };
  if (name.includes("id") || name.includes("passport") || name.includes("license") || name.includes("licence")) return { type: "identity", confidence: 0.82 };
  if (name.includes("address") || name.includes("utility") || name.includes("bill")) return { type: "proof_of_address", confidence: 0.80 };
  if (name.includes("financial") || name.includes("balance_sheet") || name.includes("pnl")) return { type: "financial_statement", confidence: 0.80 };
  return { type: "other", confidence: 0.50 };
}

function detectFormat(file_name?: string, mime_type?: string): string {
  if (mime_type?.includes("pdf")) return "pdf";
  if (mime_type?.includes("csv")) return "csv";
  if (mime_type?.includes("json")) return "json";
  if (mime_type?.includes("image")) return "image";
  const ext = file_name?.split(".").pop()?.toLowerCase();
  if (ext === "pdf" || ext === "csv" || ext === "json") return ext;
  if (["png", "jpg", "jpeg", "webp"].includes(ext || "")) return "image";
  return "other";
}