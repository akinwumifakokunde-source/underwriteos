// Credit risk model integration (ASSESS layer).
//
// Architecture boundaries enforced by this module:
//   GPT READS AND REASONS  ->  CODE CALCULATES  ->  ML MODEL SCORES  ->  POLICY CONTROLS
//
// This module provides:
//   1. CreditRiskModelProvider interface — a clean provider abstraction for risk models.
//   2. MODEL_CATALOG — governance registry (EBM champion, XGBoost/LightGBM/CatBoost
//      challengers, Logistic+WoE benchmark) with validation/production status.
//   3. buildModelFeatures() — DETERMINISTIC feature engineering from the canonical
//      FinancialProfile + CreditProfile. GPT never calculates these.
//   4. routeModel() — automatic model router. No model-selection UI. Selects the
//      highest-ranked eligible VALIDATED + PRODUCTION model, with fallback.
//   5. Mock provider implementations (clearly labelled DEMO/MOCK) so the workflow
//      is exercisable end-to-end in sandbox. Production never fabricates a score
//      from a mock — it returns "Credit risk model unavailable" until a real
//      validated model service is connected via the same provider interface.
//
// The CreditDecide Risk Score / PD produced here is SEPARATE from the bureau
// credit score (stored on CreditProfile). The policy engine remains authoritative
// for the final APPROVE/REVIEW/DECLINE decision.

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ModelType = "ebm" | "xgboost" | "lightgbm" | "catboost" | "logistic_woe" | "external";
export type ValidationStatus = "DRAFT" | "VALIDATING" | "VALIDATED" | "PRODUCTION" | "RETIRED";
export type ModelRole = "champion" | "challenger" | "benchmark";

export interface ModelMetadata {
  name: string;
  model_type: ModelType;
  version: string;
  feature_set_version: string;
  markets: string[];          // ["*"] = all
  products: string[];          // ["*"] = all
  borrower_types: string[];    // ["*"] = all
  required_features: string[];
  validation_status: ValidationStatus;
  production_status: "PRODUCTION" | "RETIRED" | "DRAFT";
  champion: boolean;
  challenger: boolean;
  benchmark: boolean;
  activation_date: string;
  retirement_date: string | null;
  performance: { auc: number; gini: number };
  calibration: { brier: number };
  validation_timestamp: string;
  is_mock: boolean;
}

export interface FeatureProvenance {
  feature: string;
  value: number | null;
  sources: string[];
  formula: string;
  calc_version: string;
  timestamp: string;
}

export interface ModelFeatureVector {
  features: Record<string, number | null>;
  provenance: FeatureProvenance[];
  feature_set_version: string;
}

export interface FeatureContribution {
  feature: string;
  value: number | null;
  contribution: number;     // signed logit contribution
  direction: "positive" | "negative"; // positive = increases risk
}

export interface ModelPredictionResult {
  model_name: string;
  model_type: ModelType;
  model_version: string;
  feature_set_version: string;
  probability_of_default: number;
  credit_risk_score: number;
  risk_band: string;
  feature_contributions: FeatureContribution[];
  model_quality_metadata: {
    auc: number;
    gini: number;
    brier: number;
    validation_status: ValidationStatus;
    role: ModelRole;
    is_mock: boolean;
  };
  prediction_timestamp: string;
  is_mock: boolean;
}

export interface CreditRiskModelProvider {
  metadata: ModelMetadata;
  predict(features: ModelFeatureVector): ModelPredictionResult;
  predictPD(features: ModelFeatureVector): number;
  predictScore(features: ModelFeatureVector): number;
  getRiskBand(score: number): string;
  getModelMetadata(): ModelMetadata;
  validateInputFeatures(features: ModelFeatureVector): { valid: boolean; missing: string[] };
  getRequiredFeatures(): string[];
}

export interface RouteContext {
  market: string;
  product_type: string;
  borrower_type: string;
  features: Record<string, number | null>;
}

export interface RoutingResult {
  selected: ModelMetadata | null;
  eligible: ModelMetadata[];
  ranked: { model_name: string; rank: number; score: number; role: ModelRole }[];
  fallback_chain: string[];
  feature_completeness: Record<string, { missing: string[]; complete: boolean }>;
  selection_reason: string;
}

// ---------------------------------------------------------------------------
// Governance catalog
// ---------------------------------------------------------------------------

const FEATURE_SET_VERSION = "fs-v3";
const CALC_VERSION = "calc-v2";

export const MODEL_CATALOG: ModelMetadata[] = [
  {
    name: "ebm-v1",
    model_type: "ebm",
    version: "1.4.2",
    feature_set_version: FEATURE_SET_VERSION,
    markets: ["*"],
    products: ["*"],
    borrower_types: ["*"],
    required_features: ["credit_score", "debt_to_income", "disposable_income", "credit_utilisation", "repayment_history", "monthly_income"],
    validation_status: "VALIDATED",
    production_status: "PRODUCTION",
    champion: true,
    challenger: false,
    benchmark: false,
    activation_date: "2026-01-15",
    retirement_date: null,
    performance: { auc: 0.82, gini: 0.64 },
    calibration: { brier: 0.09 },
    validation_timestamp: "2026-01-10",
    is_mock: true
  },
  {
    name: "xgboost-v1",
    model_type: "xgboost",
    version: "1.2.0",
    feature_set_version: FEATURE_SET_VERSION,
    markets: ["*"],
    products: ["*"],
    borrower_types: ["*"],
    required_features: ["credit_score", "debt_to_income", "disposable_income", "credit_utilisation"],
    validation_status: "VALIDATED",
    production_status: "PRODUCTION",
    champion: false,
    challenger: true,
    benchmark: false,
    activation_date: "2026-02-01",
    retirement_date: null,
    performance: { auc: 0.81, gini: 0.62 },
    calibration: { brier: 0.10 },
    validation_timestamp: "2026-01-28",
    is_mock: true
  },
  {
    name: "lightgbm-v1",
    model_type: "lightgbm",
    version: "1.1.0",
    feature_set_version: FEATURE_SET_VERSION,
    markets: ["*"],
    products: ["*"],
    borrower_types: ["*"],
    required_features: ["credit_score", "debt_to_income", "disposable_income"],
    validation_status: "VALIDATED",
    production_status: "PRODUCTION",
    champion: false,
    challenger: true,
    benchmark: false,
    activation_date: "2026-02-10",
    retirement_date: null,
    performance: { auc: 0.80, gini: 0.60 },
    calibration: { brier: 0.10 },
    validation_timestamp: "2026-02-05",
    is_mock: true
  },
  {
    name: "catboost-v1",
    model_type: "catboost",
    version: "0.9.0",
    feature_set_version: FEATURE_SET_VERSION,
    markets: ["*"],
    products: ["*"],
    borrower_types: ["*"],
    required_features: ["credit_score", "debt_to_income", "disposable_income", "credit_utilisation"],
    validation_status: "VALIDATING",
    production_status: "DRAFT",
    champion: false,
    challenger: true,
    benchmark: false,
    activation_date: "2026-03-01",
    retirement_date: null,
    performance: { auc: 0.80, gini: 0.60 },
    calibration: { brier: 0.11 },
    validation_timestamp: "2026-02-25",
    is_mock: true
  },
  {
    name: "logistic-woe-v1",
    model_type: "logistic_woe",
    version: "1.0.3",
    feature_set_version: FEATURE_SET_VERSION,
    markets: ["*"],
    products: ["*"],
    borrower_types: ["*"],
    required_features: ["credit_score", "debt_to_income"],
    validation_status: "VALIDATED",
    production_status: "PRODUCTION",
    champion: false,
    challenger: false,
    benchmark: true,
    activation_date: "2025-11-01",
    retirement_date: null,
    performance: { auc: 0.76, gini: 0.52 },
    calibration: { brier: 0.12 },
    validation_timestamp: "2025-10-28",
    is_mock: true
  }
];

// ---------------------------------------------------------------------------
// Risk band mapping
// ---------------------------------------------------------------------------

export function getRiskBand(score: number): string {
  if (score < 0.10) return "A";
  if (score < 0.20) return "B";
  if (score < 0.35) return "C";
  if (score < 0.55) return "D";
  return "E";
}

export const RISK_BAND_LABELS: Record<string, string> = {
  A: "Very Low",
  B: "Low",
  C: "Medium",
  D: "High",
  E: "Very High"
};

// ---------------------------------------------------------------------------
// Deterministic feature engineering
// GPT never calculates these. Every feature carries provenance.
// ---------------------------------------------------------------------------

function num(v: any): number | null {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function clamp01(n: number): number { return Math.max(0, Math.min(1, n)); }
function norm(v: number | null, min: number, max: number): number {
  if (v === null) return 0.5;
  return clamp01((v - min) / (max - min));
}

export function buildModelFeatures(
  financial: any,
  credit: any,
  application: any,
  borrower: any
): ModelFeatureVector {
  const now = new Date().toISOString();
  const fin = financial || {};
  const cr = credit || {};
  const app = application || {};
  const b = borrower || {};

  const defs: { key: string; value: number | null; sources: string[]; formula: string }[] = [
    { key: "credit_score", value: num(cr.credit_score), sources: ["credit_report"], formula: "direct_extract" },
    { key: "credit_utilisation", value: num(cr.credit_utilisation), sources: ["credit_report"], formula: "direct_extract" },
    { key: "active_accounts", value: num(cr.active_accounts), sources: ["credit_report"], formula: "direct_extract" },
    { key: "delinquent_accounts", value: num(cr.delinquent_accounts), sources: ["credit_report"], formula: "direct_extract" },
    { key: "defaults", value: num(cr.defaults), sources: ["credit_report"], formula: "direct_extract" },
    { key: "repayment_history", value: num(cr.repayment_history), sources: ["credit_report"], formula: "direct_extract" },
    { key: "recent_enquiries", value: num(cr.recent_enquiries), sources: ["credit_report"], formula: "direct_extract" },
    { key: "monthly_income", value: num(fin?.income?.monthly), sources: ["bank_statement"], formula: "sum_credits_divided_by_months" },
    { key: "monthly_expenses", value: num(fin?.expenses?.monthly), sources: ["bank_statement"], formula: "sum_debits_divided_by_months" },
    { key: "disposable_income", value: num(fin?.cashflow?.disposable_income), sources: ["bank_statement", "derived"], formula: "income_minus_expenses" },
    { key: "debt_to_income", value: num(fin?.affordability?.debt_to_income), sources: ["bank_statement", "derived"], formula: "debt_payments_divided_by_income" },
    { key: "income_to_loan", value: num(fin?.affordability?.income_to_loan), sources: ["bank_statement", "application", "derived"], formula: "annual_income_divided_by_loan" },
    { key: "repayment_capacity", value: num(fin?.affordability?.repayment_capacity), sources: ["bank_statement", "derived"], formula: "disposable_income_times_0.6" },
    { key: "affordability_ratio", value: num(fin?.affordability?.affordability_ratio), sources: ["bank_statement", "derived"], formula: "disposable_income_divided_by_expenses" },
    { key: "income_stability", value: num(fin?.financial_behaviour?.income_stability), sources: ["bank_statement", "derived"], formula: "one_minus_coefficient_of_variation" },
    { key: "expense_volatility", value: num(fin?.financial_behaviour?.expense_volatility), sources: ["bank_statement", "derived"], formula: "coefficient_of_variation" },
    { key: "average_balance", value: num(fin?.cashflow?.average_balance), sources: ["bank_statement", "derived"], formula: "running_balance_proxy" },
    { key: "debt_payments", value: num(fin?.debt?.monthly_payments), sources: ["bank_statement", "derived"], formula: "category_sum_divided_by_months" },
    { key: "recurring_obligations", value: num(fin?.financial_behaviour?.recurring_obligations), sources: ["bank_statement", "derived"], formula: "recurring_flag_sum_divided_by_months" },
    { key: "loan_amount", value: num(app.loan_amount), sources: ["application"], formula: "direct_extract" },
    { key: "loan_term_months", value: num(app.loan_term_months), sources: ["application"], formula: "direct_extract" },
    { key: "annual_income", value: num(fin?.employment?.annual_income ?? b.annual_income), sources: ["bank_statement", "borrower_declaration"], formula: "direct_extract_or_annualized_monthly" }
  ];

  const features: Record<string, number | null> = {};
  const provenance: FeatureProvenance[] = [];
  for (const d of defs) {
    features[d.key] = d.value;
    provenance.push({
      feature: d.key,
      value: d.value,
      sources: d.sources,
      formula: d.formula,
      calc_version: CALC_VERSION,
      timestamp: now
    });
  }

  return { features, provenance, feature_set_version: FEATURE_SET_VERSION };
}

// ---------------------------------------------------------------------------
// Oriented risk inputs (higher = more risk) shared by all logistic-style mocks
// ---------------------------------------------------------------------------

interface RiskInput {
  key: string;
  risk: number;        // 0..1, higher = riskier
  coef: number;        // base coefficient
  raw: number | null;
}

function buildRiskInputs(fv: ModelFeatureVector): RiskInput[] {
  const f = fv.features;
  const monthlyIncome = f.monthly_income ?? 0;
  const disposable = f.disposable_income ?? 0;
  return [
    { key: "credit_score", raw: f.credit_score, risk: f.credit_score === null ? 0.5 : 1 - norm(f.credit_score, 300, 850), coef: 1.2 },
    { key: "credit_utilisation", raw: f.credit_utilisation, risk: f.credit_utilisation === null ? 0.5 : clamp01(f.credit_utilisation), coef: 0.8 },
    { key: "defaults", raw: f.defaults, risk: f.defaults === null ? 0.5 : Math.min(f.defaults, 3) / 3, coef: 1.5 },
    { key: "delinquent_accounts", raw: f.delinquent_accounts, risk: f.delinquent_accounts === null ? 0.5 : Math.min(f.delinquent_accounts, 3) / 3, coef: 1.0 },
    { key: "repayment_history", raw: f.repayment_history, risk: f.repayment_history === null ? 0.5 : 1 - norm(f.repayment_history, 0, 100), coef: 0.9 },
    { key: "recent_enquiries", raw: f.recent_enquiries, risk: f.recent_enquiries === null ? 0.5 : Math.min(f.recent_enquiries, 6) / 6, coef: 0.5 },
    { key: "debt_to_income", raw: f.debt_to_income, risk: f.debt_to_income === null ? 0.5 : clamp01(f.debt_to_income), coef: 1.1 },
    { key: "disposable_income", raw: disposable, risk: monthlyIncome <= 0 ? 1 : 1 - clamp01(disposable / (monthlyIncome * 0.5 + 1)), coef: 0.9 },
    { key: "income_stability", raw: f.income_stability, risk: f.income_stability === null ? 0.5 : 1 - clamp01(f.income_stability), coef: 0.6 },
    { key: "expense_volatility", raw: f.expense_volatility, risk: f.expense_volatility === null ? 0.5 : clamp01(f.expense_volatility), coef: 0.5 },
    { key: "affordability_ratio", raw: f.affordability_ratio, risk: f.affordability_ratio === null ? 0.5 : 1 - clamp01(f.affordability_ratio), coef: 0.7 },
    { key: "income_to_loan", raw: f.income_to_loan, risk: f.income_to_loan === null ? 0.5 : 1 - clamp01(f.income_to_loan / 2), coef: 0.5 }
  ];
}

function sigmoid(x: number): number { return 1 / (1 + Math.exp(-x)); }

// ---------------------------------------------------------------------------
// Mock provider (logistic-style). Clearly labelled DEMO/MOCK.
// A real model service implements the same interface with is_mock=false.
// ---------------------------------------------------------------------------

function makeMockProvider(meta: ModelMetadata, intercept: number, coefOverrides: Partial<Record<string, number>>, featureSubset?: string[]): CreditRiskModelProvider {
  const baseCoef: Record<string, number> = {};
  const inputs = buildRiskInputs({ features: {}, provenance: [], feature_set_version: FEATURE_SET_VERSION });
  for (const r of inputs) baseCoef[r.key] = r.coef;
  const coefs = { ...baseCoef, ...coefOverrides };
  const useKeys = featureSubset || Object.keys(coefs);

  const predict = (fv: ModelFeatureVector): ModelPredictionResult => {
    const risks = buildRiskInputs(fv);
    const riskMap: Record<string, RiskInput> = {};
    for (const r of risks) riskMap[r.key] = r;

    let logit = intercept;
    const contributions: FeatureContribution[] = [];
    for (const key of useKeys) {
      const r = riskMap[key];
      if (!r) continue;
      const c = (coefs[key] || 0) * r.risk;
      logit += c;
      contributions.push({
        feature: key,
        value: r.raw,
        contribution: Math.round(c * 1000) / 1000,
        direction: c >= 0 ? "positive" : "negative"
      });
    }
    const pd = Math.round(sigmoid(logit) * 10000) / 10000;
    contributions.sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution));

    return {
      model_name: meta.name,
      model_type: meta.model_type,
      model_version: meta.version,
      feature_set_version: meta.feature_set_version,
      probability_of_default: pd,
      credit_risk_score: pd,
      risk_band: getRiskBand(pd),
      feature_contributions: contributions,
      model_quality_metadata: {
        auc: meta.performance.auc,
        gini: meta.performance.gini,
        brier: meta.calibration.brier,
        validation_status: meta.validation_status,
        role: meta.champion ? "champion" : meta.benchmark ? "benchmark" : "challenger",
        is_mock: meta.is_mock
      },
      prediction_timestamp: new Date().toISOString(),
      is_mock: meta.is_mock
    };
  };

  return {
    metadata: meta,
    predict,
    predictPD: (fv) => predict(fv).probability_of_default,
    predictScore: (fv) => predict(fv).credit_risk_score,
    getRiskBand,
    getModelMetadata: () => meta,
    validateInputFeatures: (fv) => {
      const missing = meta.required_features.filter(k => fv.features[k] === null || fv.features[k] === undefined);
      return { valid: missing.length === 0, missing };
    },
    getRequiredFeatures: () => meta.required_features
  };
}

const PROVIDERS: Record<string, CreditRiskModelProvider> = {
  "ebm-v1": makeMockProvider(MODEL_CATALOG[0], -2.2, {}),
  "xgboost-v1": makeMockProvider(MODEL_CATALOG[1], -2.0, { debt_to_income: 1.3, credit_utilisation: 0.9 }),
  "lightgbm-v1": makeMockProvider(MODEL_CATALOG[2], -2.1, { income_stability: 0.7 }),
  "catboost-v1": makeMockProvider(MODEL_CATALOG[3], -2.05, {}),
  "logistic-woe-v1": makeMockProvider(MODEL_CATALOG[4], -1.8, {}, ["credit_score", "defaults", "delinquent_accounts", "repayment_history", "debt_to_income", "disposable_income", "affordability_ratio"])
};

export function getProvider(name: string): CreditRiskModelProvider | null {
  return PROVIDERS[name] || null;
}

export function getModelMetadata(name: string): ModelMetadata | null {
  return MODEL_CATALOG.find(m => m.name === name) || null;
}

// ---------------------------------------------------------------------------
// Automatic model router
// ---------------------------------------------------------------------------

function compatible(m: ModelMetadata, ctx: RouteContext): boolean {
  const inList = (list: string[], val: string) => list.includes("*") || list.includes(val);
  return inList(m.markets, ctx.market) && inList(m.products, ctx.product_type) && inList(m.borrower_types, ctx.borrower_type);
}

function featureCompleteness(m: ModelMetadata, features: Record<string, number | null>): { missing: string[]; complete: boolean } {
  const missing = m.required_features.filter(k => features[k] === null || features[k] === undefined || Number.isNaN(features[k]));
  return { missing, complete: missing.length === 0 };
}

export function routeModel(ctx: RouteContext): RoutingResult {
  const completeness: Record<string, { missing: string[]; complete: boolean }> = {};

  const eligible = MODEL_CATALOG.filter(m => {
    if (m.validation_status !== "VALIDATED") return false;
    if (m.production_status !== "PRODUCTION") return false;
    if (!compatible(m, ctx)) return false;
    const fc = featureCompleteness(m, ctx.features);
    completeness[m.name] = fc;
    return fc.complete;
  });

  // Also record completeness for compatible-but-ineligible models (for audit).
  for (const m of MODEL_CATALOG) {
    if (!completeness[m.name] && compatible(m, ctx)) {
      completeness[m.name] = featureCompleteness(m, ctx.features);
    }
  }

  const rankScore = (m: ModelMetadata): number => {
    let s = m.performance.auc;
    if (m.champion) s += 0.05;
    if (m.benchmark) s -= 0.05;
    return s;
  };

  const sorted = [...eligible].sort((a, b) => rankScore(b) - rankScore(a));
  const ranked = sorted.map((m, i) => ({
    model_name: m.name,
    rank: i + 1,
    score: Math.round(rankScore(m) * 100) / 100,
    role: (m.champion ? "champion" : m.benchmark ? "benchmark" : "challenger") as ModelRole
  }));

  const selected = sorted[0] || null;
  const fallback_chain = sorted.slice(1).map(m => m.name);

  let selectionReason = "No eligible validated production model available for this application's context and feature set.";
  if (selected) {
    selectionReason = `Auto-selected ${selected.name} (${selected.champion ? "champion" : selected.benchmark ? "benchmark" : "challenger"}) — highest-ranked VALIDATED+PRODUCTION model with complete required features for market=${ctx.market}, product=${ctx.product_type}, borrower=${ctx.borrower_type}.`;
  }

  return {
    selected,
    eligible: sorted,
    ranked,
    fallback_chain,
    feature_completeness: completeness,
    selection_reason: selectionReason
  };
}

// ---------------------------------------------------------------------------
// Orchestrator: build features -> route -> predict -> persist.
// Returns { available, prediction, routing } or { available: false, reason }.
// ---------------------------------------------------------------------------

function allowProductionMock(): boolean {
  try {
    // Opt-in for staging environments mislabelled as production. Default off:
    // production never fabricates a score from a mock provider.
    return (globalThis as any).Deno?.env?.get?.("CREDIT_MODEL_ALLOW_PRODUCTION_MOCK") === "true";
  } catch {
    return false;
  }
}

export interface RunRiskModelInput {
  organization_id: string;
  application_id: string;
  environment: "sandbox" | "production";
  application: any;
  borrower: any;
  financial: any;
  credit: any;
}

export interface RunRiskModelResult {
  available: boolean;
  reason?: string;
  prediction?: any;     // persisted ModelPrediction record
  routing?: any;         // persisted ModelRoutingDecision record
}

export async function runRiskModel(base44: any, input: RunRiskModelInput): Promise<RunRiskModelResult> {
  const { organization_id, application_id, environment, application, borrower, financial, credit } = input;
  const app = application || {};
  const fv = buildModelFeatures(financial, credit, app, borrower);

  const ctx: RouteContext = {
    market: app.market || "GB",
    product_type: app.product_type || "personal_loan",
    borrower_type: app.borrower_type || "salaried",
    features: fv.features
  };

  const routing = routeModel(ctx);
  const now = new Date().toISOString();

  const routingRecord = await base44.asServiceRole.entities.ModelRoutingDecision.create({
    organization_id,
    application_id,
    environment,
    market: ctx.market,
    product_type: ctx.product_type,
    borrower_type: ctx.borrower_type,
    eligible_models: routing.eligible.map(m => m.name),
    ranked_models: routing.ranked,
    selected_model: routing.selected?.name || "",
    selection_reason: routing.selection_reason,
    fallback_chain: routing.fallback_chain,
    feature_completeness: routing.feature_completeness,
    is_mock: routing.selected?.is_mock ?? false,
    routing_timestamp: now
  });

  if (!routing.selected) {
    return { available: false, reason: "NO_ELIGIBLE_MODEL", routing: routingRecord };
  }

  const provider = getProvider(routing.selected.name);
  if (!provider) {
    return { available: false, reason: "PROVIDER_NOT_FOUND", routing: routingRecord };
  }

  // Boundary: never fabricate a production score from a mock provider.
  if (provider.metadata.is_mock && environment === "production" && !allowProductionMock()) {
    return { available: false, reason: "PRODUCTION_MODEL_NOT_CONFIGURED", routing: routingRecord };
  }

  const result = provider.predict(fv);
  const bureauScore = credit?.credit_score ?? null;
  const bureauSource = credit?.provider ?? null;

  const predictionRecord = await base44.asServiceRole.entities.ModelPrediction.create({
    organization_id,
    application_id,
    environment,
    model_name: result.model_name,
    model_type: result.model_type,
    model_version: result.model_version,
    feature_set_version: result.feature_set_version,
    routing_decision_id: routingRecord.id,
    probability_of_default: result.probability_of_default,
    credit_risk_score: result.credit_risk_score,
    risk_band: result.risk_band,
    bureau_score: bureauScore,
    bureau_score_source: bureauSource,
    feature_contributions: result.feature_contributions,
    input_feature_snapshot: { features: fv.features, provenance: fv.provenance, feature_set_version: fv.feature_set_version },
    model_quality_metadata: result.model_quality_metadata,
    is_mock: result.is_mock,
    prediction_timestamp: result.prediction_timestamp
  });

  return { available: true, prediction: predictionRecord, routing: routingRecord };
}