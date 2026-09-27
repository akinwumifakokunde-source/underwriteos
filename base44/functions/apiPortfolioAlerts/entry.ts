import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { apiError, apiSuccess, readBody, resolveOrganization, audit } from "../../shared/utils.ts";

// Portfolio alerts — computes drift, default-rate spikes, and concentration
// breaches from the org's decisions + loan outcomes, then emails a summary to
// the configured alerts recipient. Invoked daily by the Portfolio Alerts
// workflow; also callable on demand from the dashboard.
//
// run — compute alerts + (optionally) email the summary
export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const body = await readBody(req);
    const ctx = await resolveOrganization(base44, body);
    const { organization_id } = ctx;
    const action = body.action || "run";

    if (action !== "run") return apiError("UNKNOWN_ACTION", `Action '${action}' is not supported. Use run.`, 400);

    const [orgs, outcomes, decisions, applications] = await Promise.all([
      base44.asServiceRole.entities.Organization.filter({ id: organization_id }, "-created_date", 1),
      base44.asServiceRole.entities.LoanOutcome.filter({ organization_id }, "-observed_at", 500),
      base44.asServiceRole.entities.UnderwritingDecision.filter({ organization_id }, "-decision_timestamp", 500),
      base44.asServiceRole.entities.Application.filter({ organization_id }, "-created_date", 500),
    ]);
    const appById: Record<string, any> = {};
    for (const a of applications) appById[a.id] = a;
    const org = orgs[0];
    const alertsEmail = org?.settings?.alerts_email || body.recipient_email || null;
    const currency = org?.settings?.default_currency || outcomes[0]?.loan_currency || "GBP";

    const alerts = [];

    // --- 1. Calibration drift (predicted PD vs actual bad rate) ---
    const withPred = outcomes.filter((o: any) => o.predicted_pd != null);
    if (withPred.length >= 10) {
      const avgPred = withPred.reduce((s: number, o: any) => s + o.predicted_pd, 0) / withPred.length;
      const actualBad = withPred.filter((o: any) => o.bad).length / withPred.length;
      const gap = actualBad - avgPred;
      if (Math.abs(gap) > 0.05) {
        alerts.push({
          severity: Math.abs(gap) > 0.1 ? "high" : "medium",
          type: "calibration_drift",
          title: "Model calibration drift detected",
          detail: `Actual default rate (${(actualBad * 100).toFixed(1)}%) diverges from predicted avg PD (${(avgPred * 100).toFixed(1)}%) by ${(gap * 100).toFixed(1)} pp.`,
          metric: { predicted: avgPred, actual: actualBad, gap },
        });
      }
    }

    // --- 2. Default-rate spike (recent 30d vs overall baseline) ---
    const observed = outcomes.filter((o: any) => o.observed_at);
    if (observed.length >= 10) {
      const now = Date.now();
      const recent = observed.filter((o: any) => new Date(o.observed_at).getTime() >= now - 30 * 86400000);
      const overallRate = observed.filter((o: any) => o.bad).length / observed.length;
      if (recent.length >= 5) {
        const recentRate = recent.filter((o: any) => o.bad).length / recent.length;
        if (recentRate > overallRate * 1.5 && recentRate > 0.1) {
          alerts.push({
            severity: recentRate > 0.25 ? "high" : "medium",
            type: "default_rate_spike",
            title: "Default-rate spike in last 30 days",
            detail: `Recent default rate (${(recentRate * 100).toFixed(1)}%) is ${(recentRate / Math.max(overallRate, 0.001)).toFixed(1)}x the portfolio baseline (${(overallRate * 100).toFixed(1)}%).`,
            metric: { recent_rate: recentRate, baseline_rate: overallRate, recent_count: recent.length },
          });
        }
      }
    }

    // --- 3. Concentration breaches (single market > 40% of approved decisions) ---
    const approved = decisions.filter((d: any) => d.decision === "APPROVE");
    if (approved.length >= 10) {
      const byMarket: Record<string, number> = {};
      for (const d of approved) {
        const m = appById[d.application_id]?.market || "unknown";
        byMarket[m] = (byMarket[m] || 0) + 1;
      }
      const total = approved.length;
      for (const [market, count] of Object.entries(byMarket)) {
        const share = count / total;
        if (share > 0.4) {
          alerts.push({
            severity: share > 0.6 ? "high" : "medium",
            type: "concentration_breach",
            title: `Market concentration: ${market}`,
            detail: `${(share * 100).toFixed(0)}% of approved decisions (${count}/${total}) are in market ${market}, above the 40% concentration limit.`,
            metric: { market, count, share },
          });
        }
      }
    }

    // --- 4. High-risk approvals (approved with PD above 0.2) ---
    const highRiskApproved = approved.filter((d: any) => d.probability_of_default != null && d.probability_of_default > 0.2);
    if (highRiskApproved.length > 0) {
      alerts.push({
        severity: "low",
        type: "high_risk_approvals",
        title: `${highRiskApproved.length} high-risk approval${highRiskApproved.length === 1 ? "" : "s"}`,
        detail: `${highRiskApproved.length} approved decision${highRiskApproved.length === 1 ? " has" : "s have"} a predicted default probability above 20%.`,
        metric: { count: highRiskApproved.length },
      });
    }

    // --- Email summary ---
    let emailStatus: any = { sent: false, to: null, error: null };
    if (alertsEmail && alerts.length > 0) {
      const subject = `CreditDecide portfolio alert${alerts.length > 1 ? "s" : ""}: ${alerts.length} item${alerts.length > 1 ? "s" : ""} needing attention`;
      const lines = [
        `Portfolio alert summary for ${org?.name || "your organization"}`,
        `Generated: ${new Date().toISOString()}`,
        "",
        `${alerts.length} alert${alerts.length > 1 ? "s" : ""} detected:`,
        "",
        ...alerts.map((a, i) => `${i + 1}. [${a.severity.toUpperCase()}] ${a.title}\n   ${a.detail}`),
        "",
        "Review the full portfolio risk dashboard at your CreditDecide workspace.",
      ];
      try {
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: alertsEmail,
          subject,
          text: lines.join("\n"),
        });
        emailStatus = { sent: true, to: alertsEmail, error: null };
      } catch (e) {
        emailStatus = { sent: false, to: alertsEmail, error: e?.message || "Email send failed" };
      }
    } else if (!alertsEmail && alerts.length > 0) {
      emailStatus = { sent: false, to: null, error: "No alerts_email configured in organization settings" };
    }

    await audit(base44, organization_id, "portfolio.alerts_run", { actor: ctx.actor, actor_type: ctx.actor_type, details: { alert_count: alerts.length, email_sent: emailStatus.sent } });

    return apiSuccess({
      alerts,
      summary: {
        total_alerts: alerts.length,
        high: alerts.filter((a) => a.severity === "high").length,
        medium: alerts.filter((a) => a.severity === "medium").length,
        low: alerts.filter((a) => a.severity === "low").length,
        outcomes_analysed: outcomes.length,
        decisions_analysed: decisions.length,
        currency,
      },
      email: emailStatus,
    }, 200);
  } catch (e) {
    if (e.status) return apiError(e.code || "ERROR", e.message, e.status);
    return apiError("INTERNAL_ERROR", e.message, 500);
  }
}