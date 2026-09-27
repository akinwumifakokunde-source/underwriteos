import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { apiError, apiSuccess, readBody, resolveOrganization } from "../../shared/utils.ts";

// POST — Portfolio risk analytics.
// Action: overview — computes risk distribution, decision trends, default rates
// by segment, and concentration alerts from existing decisions, applications,
// and loan outcomes.
export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const body = await readBody(req);
    const ctx = await resolveOrganization(base44, body);
    const { organization_id } = ctx;
    const action = body.action || "overview";

    if (action !== "overview") return apiError("UNKNOWN_ACTION", `Action '${action}' is not supported.`, 400);

    const [decisions, apps, outcomes, borrowers] = await Promise.all([
      base44.asServiceRole.entities.UnderwritingDecision.filter({ organization_id }, "-created_date", 500),
      base44.asServiceRole.entities.Application.filter({ organization_id }, "-created_date", 500),
      base44.asServiceRole.entities.LoanOutcome.filter({ organization_id }, "-created_date", 200),
      base44.asServiceRole.entities.Borrower.filter({ organization_id }, "-created_date", 500)
    ]);

    const appById = new Map(apps.map((a: any) => [a.id, a]));
    const borrowerById = new Map(borrowers.map((b: any) => [b.id, b]));

    // --- 1. Portfolio summary ---
    const approvedApps = apps.filter((a: any) => a.decision === "APPROVE");
    const totalExposure = approvedApps.reduce((s: number, a: any) => s + (a.loan_amount || 0), 0);
    const decidedCount = decisions.length;
    const avgRiskScore = decidedCount > 0 ? decisions.reduce((s: number, d: any) => s + (d.risk_score || 0), 0) / decidedCount : 0;
    const avgPD = decidedCount > 0 ? decisions.reduce((s: number, d: any) => s + (d.probability_of_default || 0), 0) / decidedCount : 0;

    // --- 2. Risk score distribution (5 buckets) ---
    const RISK_BUCKETS = [
      { label: "0–20%", min: 0, max: 0.2 },
      { label: "20–40%", min: 0.2, max: 0.4 },
      { label: "40–60%", min: 0.4, max: 0.6 },
      { label: "60–80%", min: 0.6, max: 0.8 },
      { label: "80–100%", min: 0.8, max: 1.01 },
    ];
    const riskDistribution = RISK_BUCKETS.map((b) => ({
      label: b.label,
      count: decisions.filter((d: any) => {
        const rs = d.risk_score ?? 0;
        return rs >= b.min && rs < b.max;
      }).length
    }));

    // --- 3. Decision trend (last 12 months) ---
    const now = new Date();
    const months: { key: string; label: string; approve: number; review: number; decline: number }[] = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = d.toISOString().slice(0, 7);
      const label = d.toLocaleDateString("en", { month: "short", year: "2-digit" });
      months.push({ key, label, approve: 0, review: 0, decline: 0 });
    }
    const monthMap = new Map(months.map((m) => [m.key, m]));
    for (const dec of decisions) {
      const ts = (dec.decision_timestamp || dec.created_date || "").slice(0, 7);
      const m = monthMap.get(ts);
      if (m) {
        if (dec.decision === "APPROVE") m.approve++;
        else if (dec.decision === "REVIEW") m.review++;
        else if (dec.decision === "DECLINE") m.decline++;
      }
    }

    // --- 4. Default rate by segment ---
    const outcomesByApp = new Map(outcomes.map((o: any) => [o.application_id, o]));
    const segmentDefaultRate = (segmentFn: (app: any) => string) => {
      const segments: Record<string, { total: number; defaults: number }> = {};
      for (const app of approvedApps) {
        const outcome = outcomesByApp.get(app.id);
        if (!outcome) continue;
        const seg = segmentFn(app) || "unknown";
        if (!segments[seg]) segments[seg] = { total: 0, defaults: 0 };
        segments[seg].total++;
        if (outcome.bad) segments[seg].defaults++;
      }
      return Object.entries(segments).map(([segment, v]) => ({
        segment,
        total: v.total,
        defaults: v.defaults,
        default_rate: v.total > 0 ? v.defaults / v.total : 0
      })).sort((a, b) => b.default_rate - a.default_rate);
    };

    const defaultByMarket = segmentDefaultRate((a) => a.market);
    const defaultByBorrowerType = segmentDefaultRate((a) => a.borrower_type);
    const defaultByRiskBand = segmentDefaultRate((a) => {
      const app = appById.get(a.id);
      const rs = app?.risk_score ?? 0;
      if (rs < 0.2) return "Low (0–20%)";
      if (rs < 0.4) return "Medium-Low (20–40%)";
      if (rs < 0.6) return "Medium (40–60%)";
      if (rs < 0.8) return "Medium-High (60–80%)";
      return "High (80–100%)";
    });

    // --- 5. Concentration analysis ---
    // Exposure by market
    const totalExposureSafe = totalExposure;
    const exposureByMarket: Record<string, number> = {};
    for (const a of approvedApps) {
      const m = a.market || "OT";
      exposureByMarket[m] = (exposureByMarket[m] || 0) + (a.loan_amount || 0);
    }

    // Exposure by borrower (top 10)
    const exposureByBorrower: Record<string, number> = {};
    for (const a of approvedApps) {
      const bid = a.borrower_id;
      if (!bid) continue;
      exposureByBorrower[bid] = (exposureByBorrower[bid] || 0) + (a.loan_amount || 0);
    }
    const topBorrowers = Object.entries(exposureByBorrower)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([bid, exposure]) => {
        const b = borrowerById.get(bid);
        return {
          borrower_id: bid,
          name: b ? `${b.first_name || ""} ${b.last_name || ""}`.trim() || "—" : "—",
          exposure,
          pct_of_portfolio: totalExposureSafe > 0 ? exposure / totalExposureSafe : 0
        };
      });

    // --- 6. Concentration alerts ---
    const alerts: { level: string; message: string; detail: any }[] = [];
    const SINGLE_BORROWER_THRESHOLD = 0.1; // 10%
    const SINGLE_MARKET_THRESHOLD = 0.5; // 50%
    for (const [bid, exposure] of Object.entries(exposureByBorrower)) {
      const pct = totalExposureSafe > 0 ? exposure / totalExposureSafe : 0;
      if (pct > SINGLE_BORROWER_THRESHOLD) {
        const b = borrowerById.get(bid);
        alerts.push({
          level: "high",
          message: `Single-borrower concentration: ${b ? `${b.first_name} ${b.last_name}` : bid.slice(-8)} is ${(pct * 100).toFixed(1)}% of total exposure`,
          detail: { borrower_id: bid, exposure, pct }
        });
      }
    }
    for (const [market, exposure] of Object.entries(exposureByMarket)) {
      const pct = totalExposureSafe > 0 ? exposure / totalExposureSafe : 0;
      if (pct > SINGLE_MARKET_THRESHOLD) {
        alerts.push({
          level: "medium",
          message: `Market concentration: ${market} is ${(pct * 100).toFixed(1)}% of total exposure`,
          detail: { market, exposure, pct }
        });
      }
    }
    // High-risk concentration alert
    const highRiskApproved = approvedApps.filter((a: any) => {
      const app = appById.get(a.id);
      return (app?.risk_score ?? 0) >= 0.7;
    });
    if (highRiskApproved.length > 0 && approvedApps.length > 0) {
      const pct = highRiskApproved.length / approvedApps.length;
      if (pct > 0.2) {
        alerts.push({
          level: "medium",
          message: `${(pct * 100).toFixed(0)}% of approved loans are in the high-risk band (≥70%)`,
          detail: { count: highRiskApproved.length, pct }
        });
      }
    }

    // Observed default rate
    const observedOutcomes = outcomes.length;
    const observedDefaults = outcomes.filter((o: any) => o.bad).length;
    const observedDefaultRate = observedOutcomes > 0 ? observedDefaults / observedOutcomes : 0;

    return apiSuccess({
      summary: {
        total_decisions: decidedCount,
        total_approved: approvedApps.length,
        total_exposure: totalExposure,
        avg_risk_score: avgRiskScore,
        avg_pd: avgPD,
        observed_outcomes: observedOutcomes,
        observed_default_rate: observedDefaultRate
      },
      risk_distribution: riskDistribution,
      decision_trend: months,
      default_by_segment: {
        market: defaultByMarket,
        borrower_type: defaultByBorrowerType,
        risk_band: defaultByRiskBand
      },
      concentration: {
        exposure_by_market: Object.entries(exposureByMarket)
          .sort((a, b) => b[1] - a[1])
          .map(([market, exposure]) => ({ market, exposure, pct: totalExposureSafe > 0 ? exposure / totalExposureSafe : 0 })),
        top_borrowers: topBorrowers
      },
      alerts
    }, 200);
  } catch (e) {
    if (e.status) return apiError(e.code || "ERROR", e.message, e.status);
    return apiError("INTERNAL_ERROR", e.message, 500);
  }
}