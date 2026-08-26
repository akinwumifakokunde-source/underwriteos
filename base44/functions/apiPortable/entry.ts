import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { genId, apiError, apiSuccess, readBody, resolveOrganization, requireScope, audit, sha256 } from "../../shared/utils.ts";

// Cross-border credit portability.
//
// attest  — read an application's normalized CreditProfile + its credit-category
//           risk signals and evidence, and produce an attested portable bundle
//           with a SHA-256 attestation hash over the canonical profile fields.
//           Read-only. Lets a lender preview what would travel with the borrower.
//
// import  — ingest an origin application's attested CreditProfile into a target
//           application in a new region. Creates a CreditReport on the target
//           whose raw_data records the portable attestation (origin application,
//           origin provider, attestation hash), and a CreditProfile copied from
//           the origin. The target's subsequent analyze/underwrite then generates
//           credit signals whose evidence traces to the attested portable
//           CreditReport — so a UK decision can cite a Nigerian bureau record
//           with full provenance. The full origin evidence graph remains on the
//           origin application and is referenceable via the attestation.
export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const body = await readBody(req);
    const ctx = await resolveOrganization(base44, body);
    const { organization_id, actor, actor_type } = ctx;
    const action = body.action || "attest";

    if (action === "attest") requireScope(ctx, "risk:read");
    if (action === "import") requireScope(ctx, "applications:write");

    if (action === "attest") {
      const application_id = body.application_id;
      if (!application_id) return apiError("VALIDATION_ERROR", "application_id is required.", 400);
      const bundle = await buildPortableBundle(base44, organization_id, application_id);
      if (!bundle) return apiError("PROFILE_NOT_FOUND", `No credit profile found for application ${application_id}. Ingest credit data first.`, 404);
      return apiSuccess({
        portable_reference: application_id,
        origin: { application_id, provider: bundle.provider, environment: ctx.environment },
        credit_profile: bundle.profile,
        attestation_hash: bundle.attestation_hash,
        attested_at: bundle.attested_at,
        signals_count: bundle.signals.length,
        evidence_count: bundle.evidence.length,
      }, 200);
    }

    if (action === "import") {
      const { application_id, portable_reference } = body;
      if (!application_id) return apiError("VALIDATION_ERROR", "application_id (target) is required.", 400);
      if (!portable_reference) return apiError("VALIDATION_ERROR", "portable_reference (origin application_id) is required.", 400);
      if (application_id === portable_reference) return apiError("VALIDATION_ERROR", "Target and origin applications must differ.", 400);

      const targetApps = await base44.asServiceRole.entities.Application.filter({ id: application_id, organization_id }, "-created_date", 1);
      if (targetApps.length === 0) return apiError("APPLICATION_NOT_FOUND", `Target application ${application_id} was not found.`, 404);
      const target = targetApps[0];

      const bundle = await buildPortableBundle(base44, organization_id, portable_reference);
      if (!bundle) return apiError("PROFILE_NOT_FOUND", `Origin application ${portable_reference} has no credit profile to port.`, 404);

      // Create an attested CreditReport on the target carrying the portable provenance.
      const report = await base44.asServiceRole.entities.CreditReport.create({
        organization_id,
        application_id,
        provider: bundle.provider,
        report_reference: genId("CRR"),
        raw_data: {
          portable: true,
          origin_application_id: portable_reference,
          origin_provider: bundle.provider,
          attestation_hash: bundle.attestation_hash,
          attested_at: bundle.attested_at,
          origin_credit_profile: bundle.profile,
        },
        status: "normalized",
      });

      // Replace any existing credit profile on the target with the ported one.
      const existing = await base44.asServiceRole.entities.CreditProfile.filter({ application_id, organization_id }, "-created_date", 1);
      if (existing.length > 0) await base44.asServiceRole.entities.CreditProfile.delete(existing[0].id);

      const profile = await base44.asServiceRole.entities.CreditProfile.create({
        organization_id,
        application_id,
        credit_report_id: report.id,
        provider: bundle.provider,
        credit_score: bundle.profile.credit_score,
        score_band: bundle.profile.score_band,
        active_accounts: bundle.profile.active_accounts,
        closed_accounts: bundle.profile.closed_accounts,
        delinquent_accounts: bundle.profile.delinquent_accounts,
        defaults: bundle.profile.defaults,
        outstanding_balance: bundle.profile.outstanding_balance,
        credit_utilisation: bundle.profile.credit_utilisation,
        recent_enquiries: bundle.profile.recent_enquiries,
        repayment_history: bundle.profile.repayment_history,
        currency: target.loan_currency || bundle.profile.currency,
      });

      await base44.asServiceRole.entities.Application.update(target.id, { status: "data_collection" });
      await audit(base44, organization_id, "credit_profile.ported", {
        application_id, actor, actor_type,
        endpoint: "POST /v1/portable/import",
        details: { origin_application_id: portable_reference, origin_provider: bundle.provider, attestation_hash: bundle.attestation_hash, credit_report_id: report.id },
      });

      return apiSuccess({
        credit_report_id: report.id,
        credit_profile: profile,
        portable: true,
        origin_application_id: portable_reference,
        origin_provider: bundle.provider,
        attestation_hash: bundle.attestation_hash,
      }, 201);
    }

    return apiError("UNKNOWN_ACTION", `Action '${action}' is not supported. Use attest|import.`, 400);
  } catch (e) {
    if (e.status) return apiError(e.code || "ERROR", e.message, e.status);
    return apiError("INTERNAL_ERROR", e.message, 500);
  }
}

// Build an attested portable bundle from an origin application.
async function buildPortableBundle(base44: any, organization_id: string, application_id: string) {
  const profiles = await base44.asServiceRole.entities.CreditProfile.filter({ application_id, organization_id }, "-created_date", 1);
  if (profiles.length === 0) return null;
  const profile = profiles[0];

  const signals = await base44.asServiceRole.entities.RiskSignal.filter({ application_id, organization_id, category: "credit" }, "-created_date", 200);
  const signalIds = new Set(signals.map((s: any) => s.id));
  const allEvidence = await base44.asServiceRole.entities.Evidence.filter({ application_id, organization_id }, "-created_date", 200);
  const evidence = allEvidence.filter((e: any) => signalIds.has(e.signal_id));

  const canonical = JSON.stringify({
    credit_score: profile.credit_score,
    score_band: profile.score_band,
    active_accounts: profile.active_accounts,
    closed_accounts: profile.closed_accounts,
    delinquent_accounts: profile.delinquent_accounts,
    defaults: profile.defaults,
    outstanding_balance: profile.outstanding_balance,
    credit_utilisation: profile.credit_utilisation,
    recent_enquiries: profile.recent_enquiries,
    repayment_history: profile.repayment_history,
    currency: profile.currency,
    provider: profile.provider,
  });
  const attestation_hash = await sha256(canonical);
  const attested_at = new Date().toISOString();

  return {
    provider: profile.provider || "other",
    profile: {
      credit_score: profile.credit_score,
      score_band: profile.score_band,
      active_accounts: profile.active_accounts,
      closed_accounts: profile.closed_accounts,
      delinquent_accounts: profile.delinquent_accounts,
      defaults: profile.defaults,
      outstanding_balance: profile.outstanding_balance,
      credit_utilisation: profile.credit_utilisation,
      recent_enquiries: profile.recent_enquiries,
      repayment_history: profile.repayment_history,
      currency: profile.currency,
    },
    signals,
    evidence,
    attestation_hash,
    attested_at,
  };
}