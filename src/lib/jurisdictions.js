export const JURISDICTIONS = {
  GB: {
    code: "GB", name: "United Kingdom", currency: "GBP",
    regulatoryProfile: "UK Consumer Credit",
    policies: [
      { id: "consumer-v1", label: "UK Consumer Lending v1" },
      { id: "sme-v1", label: "UK SME Lending v1" },
    ],
    products: [
      { value: "personal_loan", label: "Personal Loan" },
      { value: "auto_loan", label: "Auto Loan" },
      { value: "business_loan", label: "Business Loan" },
      { value: "mortgage", label: "Mortgage" },
    ],
  },
  US: {
    code: "US", name: "United States", currency: "USD",
    regulatoryProfile: "US Consumer Lending",
    policies: [{ id: "us-consumer-v2", label: "US Consumer Lending v2" }],
    products: [
      { value: "personal_loan", label: "Personal Loan" },
      { value: "auto_loan", label: "Auto Loan" },
      { value: "mortgage", label: "Mortgage" },
    ],
    hasStates: true,
  },
  NG: {
    code: "NG", name: "Nigeria", currency: "NGN",
    regulatoryProfile: "Nigeria Consumer Lending",
    policies: [{ id: "ng-consumer-v1", label: "Nigeria Consumer Lending v1" }],
    products: [
      { value: "personal_loan", label: "Digital Personal Loan" },
      { value: "business_loan", label: "Business Loan" },
    ],
  },
  ZA: {
    code: "ZA", name: "South Africa", currency: "ZAR",
    regulatoryProfile: "South Africa Consumer Credit",
    policies: [{ id: "za-consumer-v1", label: "South Africa Consumer Lending v1" }],
    products: [
      { value: "personal_loan", label: "Personal Loan" },
      { value: "auto_loan", label: "Auto Loan" },
    ],
  },
  KE: {
    code: "KE", name: "Kenya", currency: "KES",
    regulatoryProfile: "Kenya Consumer Lending",
    policies: [{ id: "ke-consumer-v1", label: "Kenya Consumer Lending v1" }],
    products: [
      { value: "personal_loan", label: "Digital Personal Loan" },
      { value: "business_loan", label: "Business Loan" },
    ],
  },
  GH: {
    code: "GH", name: "Ghana", currency: "GHS",
    regulatoryProfile: "Ghana Consumer Lending",
    policies: [{ id: "gh-consumer-v1", label: "Ghana Consumer Lending v1" }],
    products: [
      { value: "personal_loan", label: "Digital Personal Loan" },
      { value: "business_loan", label: "Business Loan" },
    ],
  },
};

export function getJurisdiction(code) {
  return JURISDICTIONS[code] || JURISDICTIONS.GB;
}

export function getPolicyLabel(policyId, market) {
  const jur = getJurisdiction(market);
  const policy = jur.policies.find((p) => p.id === policyId);
  return policy?.label || policyId;
}

export function getProducts(market) {
  return getJurisdiction(market).products;
}

export function getPolicies(market) {
  return getJurisdiction(market).policies;
}

export function getCurrency(market) {
  return getJurisdiction(market).currency;
}

export function formatCurrency(amount, currency) {
  const c = (currency || "GBP").toUpperCase();
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: c, maximumFractionDigits: 0 }).format(amount || 0);
  } catch {
    return `${c} ${Math.round(amount || 0).toLocaleString()}`;
  }
}

export function getDocumentRequirements(market, policyId, borrowerType) {
  if (borrowerType === "self_employed" || borrowerType === "business") {
    return [
      { type: "bank_statement", label: "Bank statements", required: true, detail: "6–12 months" },
      { type: "tax", label: "Tax documents", required: true, detail: "Latest 2 years" },
      { type: "financial_statement", label: "Business accounts", required: true },
      { type: "credit_report", label: "Credit report", required: true },
      { type: "proof_of_address", label: "Proof of address", required: false },
    ];
  }
  if (policyId === "sme-v1") {
    return [
      { type: "bank_statement", label: "Bank statements", required: true, detail: "Last 3 months" },
      { type: "tax", label: "Tax returns", required: true, detail: "Latest 2 years" },
      { type: "credit_report", label: "Credit report", required: true },
      { type: "financial_statement", label: "Financial statements", required: true },
    ];
  }
  return [
    { type: "bank_statement", label: "Bank statements", required: true, detail: "Last 3 months" },
    { type: "payslip", label: "Payslips", required: true, detail: "Latest 3 payslips" },
    { type: "credit_report", label: "Credit report", required: true },
    { type: "proof_of_address", label: "Proof of address", required: false },
  ];
}