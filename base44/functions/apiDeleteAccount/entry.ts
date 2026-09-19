import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

// Org-scoped entities to purge when an account and its data are deleted.
const ORG_ENTITIES = [
  "Application", "Borrower", "Document", "BankStatement", "CreditReport",
  "CreditProfile", "FinancialProfile", "RiskSignal", "Evidence",
  "UnderwritingRecommendation", "UnderwritingDecision", "InformationRequest",
  "Job", "Policy", "ProviderCredential", "Webhook", "APIKey", "Credit",
  "CreditTransaction", "AuditEvent", "LoanOutcome", "ApplicationForm", "Transaction"
];

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    if (body.confirm !== true && body.confirm !== "DELETE") {
      return Response.json({ error: "Confirmation required" }, { status: 400 });
    }

    const oid = user.data?.organization_id || user.organization_id;
    if (!oid) return Response.json({ error: "No organization found for this account" }, { status: 400 });

    const admin = base44.asServiceRole;
    const summary = {};

    for (const name of ORG_ENTITIES) {
      try {
        await admin.entities[name].deleteMany({ organization_id: oid });
        summary[name] = "deleted";
      } catch (e) {
        summary[name] = "skipped";
      }
    }

    try { await admin.entities.Organization.delete(oid); summary["Organization"] = "deleted"; }
    catch (e) { summary["Organization"] = "skipped"; }

    try { await admin.entities.User.delete(user.id); summary["User"] = "deleted"; }
    catch (e) { summary["User"] = "skipped"; }

    return Response.json({ ok: true, organization_id: oid, user_id: user.id, deleted: summary });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}