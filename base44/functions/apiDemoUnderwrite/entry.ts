import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { genId, apiError, apiSuccess, readBody } from "../../shared/utils.ts";
import { runAnalyze } from "../../shared/analyzePipeline.ts";
import { runUnderwrite } from "../../shared/underwritePipeline.ts";
import { getRegulatoryProfile } from "../../shared/markets.ts";

// Public, no-login demo endpoint for potential customers. Picks one of a few
// fixed sample borrower profiles, creates a real sandbox borrower + application
// in a dedicated demo organization, seeds a credit + financial profile, then runs
// the real analyze + underwrite pipeline and returns the explainable result.
// `profile` is validated against a fixed allowlist — no caller-supplied data
// reaches the pipeline. A per-org run budget bounds abuse (integration credits
// are spent on the AI memo each run).

const DEMO_ORG_SLUG = "creditdecide-demo";
const DEMO_RUN_BUDGET = 500;

interface Profile {
  key: string;
  label: string;
  market: string;
  borrower_type: string;
  product_type: string;
  loan_amount: number;
  loan_currency: string;
  loan_term_months: number;
  loan_purpose: string;
  policy_id: string;
  first_name: string;
  last_name: string;
  employment_status: string;
  employer_name: string;
  annual_income: number;
  income_currency: string;
  address_country: string;
  credit: any;
  financial: any;
}

const PROFILES: Profile[] = [
  {
    key: "amara-uk",
    label: "Amara Okafor — UK personal loan",
    market: "GB", borrower_type: "salaried", product_type: "personal_loan",
    loan_amount: 12000, loan_currency: "GBP", loan_term_months: 36, loan_purpose: "debt_consolidation", policy_id: "consumer-v1",
    first_name: "Amara", last_name: "Okafor", employment_status: "employed", employer_name: "Helix Digital",
    annual_income: 54000, income_currency: "GBP", address_country: "GB",
    credit: { provider: "experian", credit_score: 742, score_band: "excellent", active_accounts: 4, closed_accounts: 2, delinquent_accounts: 0, defaults: 0, outstanding_balance: 1200, credit_utilisation: 0.22, recent_enquiries: 1, repayment_history: 96 },
    financial: { monthly_income: 4500, monthly_expenses: 2200, disposable_income: 2300, average_balance: 3200, debt_payments: 600, recurring_obligations: 700, income_stability: 0.82, expense_volatility: 0.25, debt_to_income: 0.13, repayment_capacity: 1380, affordability_ratio: 1.05 },
  },
  {
    key: "marcus-us",
    label: "Marcus Bell — US auto loan",
    market: "US", borrower_type: "salaried", product_type: "auto_loan",
    loan_amount: 18000, loan_currency: "USD", loan_term_months: 60, loan_purpose: "vehicle_purchase", policy_id: "us-consumer-v2",
    first_name: "Marcus", last_name: "Bell", employment_status: "employed", employer_name: "City Motors",
    annual_income: 48000, income_currency: "USD", address_country: "US",
    credit: { provider: "experian", credit_score: 640, score_band: "fair", active_accounts: 5, closed_accounts: 1, delinquent_accounts: 0, defaults: 0, outstanding_balance: 3200, credit_utilisation: 0.52, recent_enquiries: 2, repayment_history: 78 },
    financial: { monthly_income: 4000, monthly_expenses: 2600, disposable_income: 1400, average_balance: 1500, debt_payments: 700, recurring_obligations: 900, income_stability: 0.6, expense_volatility: 0.35, debt_to_income: 0.175, repayment_capacity: 840, affordability_ratio: 0.54 },
  },
  {
    key: "tunde-ng",
    label: "Tunde Bello — Nigeria personal loan",
    market: "NG", borrower_type: "self_employed", product_type: "personal_loan",
    loan_amount: 500000, loan_currency: "NGN", loan_term_months: 24, loan_purpose: "business_workcapital", policy_id: "ng-consumer-v1",
    first_name: "Tunde", last_name: "Bello", employment_status: "self_employed", employer_name: "Bello Trading",
    annual_income: 3600000, income_currency: "NGN", address_country: "NG",
    credit: { provider: "crc", credit_score: 510, score_band: "poor", active_accounts: 6, closed_accounts: 2, delinquent_accounts: 2, defaults: 1, outstanding_balance: 850000, credit_utilisation: 0.78, recent_enquiries: 5, repayment_history: 62 },
    financial: { monthly_income: 300000, monthly_expenses: 280000, disposable_income: 20000, average_balance: 40000, debt_payments: 90000, recurring_obligations: 120000, income_stability: 0.4, expense_volatility: 0.5, debt_to_income: 0.3, repayment_capacity: 12000, affordability_ratio: 0.07 },
  },
  {
    key: "sarah-za",
    label: "Sarah van Wyk — South Africa self-employed",
    market: "ZA", borrower_type: "self_employed", product_type: "personal_loan",
    loan_amount: 80000, loan_currency: "ZAR", loan_term_months: 48, loan_purpose: "home_improvement", policy_id: "za-consumer-v1",
    first_name: "Sarah", last_name: "van Wyk", employment_status: "self_employed", employer_name: "Van Wyk Consulting",
    annual_income: 540000, income_currency: "ZAR", address_country: "ZA",
    credit: { provider: "transunion", credit_score: 685, score_band: "good", active_accounts: 3, closed_accounts: 1, delinquent_accounts: 0, defaults: 0, outstanding_balance: 15000, credit_utilisation: 0.28, recent_enquiries: 1, repayment_history: 92 },
    financial: { monthly_income: 45000, monthly_expenses: 22000, disposable_income: 23000, average_balance: 30000, debt_payments: 6000, recurring_obligations: 8000, income_stability: 0.75, expense_volatility: 0.3, debt_to_income: 0.13, repayment_capacity: 13800, affordability_ratio: 1.05 },
  },
];

const PROFILE_MAP: Record<string, Profile> = Object.fromEntries(PROFILES.map(p => [p.key, p]));

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const body = await readBody(req);
    const profileKey = String(body.profile || "").trim();
    const profile = PROFILE_MAP[profileKey];
    if (!profile) return apiError("VALIDATION_ERROR", `Unknown sample profile. Available: ${PROFILES.map(p => p.key).join(", ")}`, 400);

    const orgId = await getDemoOrg(base44);
    const allowed = await consumeDemoCredit(base44, orgId);
    if (!allowed) return apiError("DEMO_LIMIT_REACHED", "The demo run limit has been reached. Contact CreditDecide to reset it and keep exploring.", 429);

    const runTag = Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
    const email = `demo+${profile.key}+${runTag}@creditdecide.demo`;

    const borrower = await base44.asServiceRole.entities.Borrower.create({
      organization_id: orgId,
      borrower_reference: genId("BRW"),
      first_name: profile.first_name,
      last_name: profile.last_name,
      email,
      employment_status: profile.employment_status,
      employer_name: profile.employer_name,
      annual_income: profile.annual_income,
      income_currency: profile.income_currency,
      address: { country: profile.address_country },
    });

    const application = await base44.asServiceRole.entities.Application.create({
      organization_id: orgId,
      environment: "sandbox",
      application_number: genId("APP"),
      borrower_id: borrower.id,
      market: profile.market,
      regulatory_profile: getRegulatoryProfile(profile.market),
      borrower_type: profile.borrower_type,
      product_type: profile.product_type,
      loan_amount: profile.loan_amount,
      loan_currency: profile.loan_currency,
      loan_purpose: profile.loan_purpose,
      loan_term_months: profile.loan_term_months,
      policy_id: profile.policy_id,
      status: "draft",
      decision: "null",
    });

    const c = profile.credit;
    await base44.asServiceRole.entities.CreditProfile.create({
      organization_id: orgId,
      application_id: application.id,
      provider: c.provider,
      credit_score: c.credit_score,
      score_band: c.score_band,
      active_accounts: c.active_accounts,
      closed_accounts: c.closed_accounts,
      delinquent_accounts: c.delinquent_accounts,
      defaults: c.defaults,
      outstanding_balance: c.outstanding_balance,
      credit_utilisation: c.credit_utilisation,
      recent_enquiries: c.recent_enquiries,
      repayment_history: c.repayment_history,
      currency: profile.loan_currency,
    });

    const f = profile.financial;
    const annual = f.monthly_income * 12;
    await base44.asServiceRole.entities.FinancialProfile.create({
      organization_id: orgId,
      application_id: application.id,
      currency: profile.loan_currency,
      income: { monthly: f.monthly_income, annual, stability: f.income_stability, sources: 1 },
      expenses: { monthly: f.monthly_expenses, volatility: f.expense_volatility, recurring: f.recurring_obligations, categories: {} },
      assets: { total: f.average_balance * 2, liquid: f.average_balance },
      liabilities: { total: f.debt_payments * 12, monthly_servicing: f.debt_payments },
      debt: { total: f.debt_payments * 12, monthly_payments: f.debt_payments, to_income: f.debt_to_income },
      cashflow: { monthly_net: f.disposable_income, average_balance: f.average_balance, disposable_income: f.disposable_income },
      credit: { utilisation: c.credit_utilisation, outstanding_balance: c.outstanding_balance },
      affordability: { debt_to_income: f.debt_to_income, income_to_loan: annual / profile.loan_amount, repayment_capacity: f.repayment_capacity, affordability_ratio: f.affordability_ratio },
      employment: { status: profile.employment_status, employer: profile.employer_name, annual_income: annual },
      financial_behaviour: { income_stability: f.income_stability, expense_volatility: f.expense_volatility, savings_pattern: f.income_stability >= 0.7 ? "consistent_saver" : "intermittent_saver", recurring_obligations: f.recurring_obligations },
    });

    const analysis = await runAnalyze(base44, application.id, orgId, "demo", "system");
    const result = await runUnderwrite(base44, application.id, orgId, "demo", "system", { policy_id: profile.policy_id });

    const decision = result.decision || {};
    const recommendation = result.recommendation || {};

    return apiSuccess({
      posted: true,
      application_id: application.id,
      application_number: application.application_number,
      borrower_name: `${profile.first_name} ${profile.last_name}`,
      market: profile.market,
      product_type: profile.product_type,
      loan_amount: profile.loan_amount,
      loan_currency: profile.loan_currency,
      loan_term_months: profile.loan_term_months,
      policy_id: profile.policy_id,
      analysis: analysis,
      decision: decision.decision,
      risk_score: decision.risk_score,
      probability_of_default: decision.probability_of_default,
      confidence: decision.confidence,
      human_review_required: decision.human_review_required,
      reasons: decision.reasons || [],
      adverse_action_codes: decision.adverse_action_codes || [],
      recommendation_value: recommendation.recommendation,
      ai_summary: recommendation.ai_summary,
      ai_memo: recommendation.ai_memo,
      interest_rate: result.interest_rate,
      signal_count: analysis.signal_count,
    }, 200);
  } catch (e: any) {
    if (e.status) return apiError(e.code || "ERROR", e.message, e.status);
    return apiError("INTERNAL_ERROR", e.message, 500);
  }
}

async function getDemoOrg(base44: any): Promise<string> {
  const orgs = await base44.asServiceRole.entities.Organization.filter({ slug: DEMO_ORG_SLUG }, "-created_date", 1);
  if (orgs.length > 0) return orgs[0].id;
  const org = await base44.asServiceRole.entities.Organization.create({
    name: "CreditDecide Demo",
    slug: DEMO_ORG_SLUG,
    status: "active",
    plan: "sandbox",
    settings: { default_policy_id: "consumer-v1", default_currency: "GBP" }
  });
  return org.id;
}

// Bounds total demo runs against the demo org's credit balance (a simple,
// persistent counter). Initialized once; decremented per run; blocks at zero.
async function consumeDemoCredit(base44: any, orgId: string): Promise<boolean> {
  const credits = await base44.asServiceRole.entities.Credit.filter({ organization_id: orgId }, "-created_date", 1);
  let c = credits[0] || null;
  if (!c) {
    await base44.asServiceRole.entities.Credit.create({ organization_id: orgId, balance: DEMO_RUN_BUDGET, currency: "usd", subscription_status: "none" });
    return true;
  }
  if ((c.balance || 0) <= 0) return false;
  await base44.asServiceRole.entities.Credit.update(c.id, { balance: Math.max(0, (c.balance || 0) - 1) });
  return true;
}