import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { genId, apiError, apiSuccess, readBody, resolveOrganization, audit } from "../../shared/utils.ts";

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const body = await readBody(req);
    const { organization_id, actor, actor_type } = await resolveOrganization(base44);
    const action = body.action || "upload";

    if (action === "upload") {
      const { application_id, document_type, file_url, file_name, mime_type, file_format, extracted_data } = body;
      if (!application_id) return apiError("VALIDATION_ERROR", "application_id is required.", 400);
      if (!document_type) return apiError("VALIDATION_ERROR", "document_type is required.", 400);

      const apps = await base44.asServiceRole.entities.Application.filter({ id: application_id, organization_id }, "-created_date", 1);
      if (apps.length === 0) return apiError("APPLICATION_NOT_FOUND", `Application ${application_id} was not found.`, 404);

      const doc = await base44.asServiceRole.entities.Document.create({
        organization_id,
        application_id,
        document_reference: genId("DOC"),
        document_type,
        file_url: file_url || null,
        file_name: file_name || null,
        mime_type: mime_type || null,
        file_format: file_format || detectFormat(file_name, mime_type),
        status: "uploaded",
        extracted_data: extracted_data || null
      });

      await audit(base44, organization_id, "document.processed", { application_id, actor, actor_type, endpoint: "POST /v1/applications/{id}/documents", details: { document_id: doc.id, document_type } });
      return apiSuccess({ document_id: doc.id, document: doc }, 201);
    }

    if (action === "list") {
      const { application_id } = body;
      if (!application_id) return apiError("VALIDATION_ERROR", "application_id is required.", 400);
      const docs = await base44.asServiceRole.entities.Document.filter({ application_id, organization_id }, "-created_date", 100);
      return apiSuccess({ documents: docs, count: docs.length }, 200);
    }

    return apiError("UNKNOWN_ACTION", `Action '${action}' is not supported.`, 400);
  } catch (e) {
    if (e.status) return apiError(e.code || "ERROR", e.message, e.status);
    return apiError("INTERNAL_ERROR", e.message, 500);
  }
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