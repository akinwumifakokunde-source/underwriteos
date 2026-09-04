export const JURISDICTIONS = {
  GB: {
    code: "GB", name: "United Kingdom", currency: "GBP",
    regulatoryProfile: "UK Consumer Credit",
    policies: [
      { id: "consumer-v1", label: "UK Consumer Lending v1" },
      { id: "sme-v1", label: "UK SME Lending v1" },
      { id: "mortgage-v1", label: "Mortgage Lending v1" },
      { id: "business-v1", label: "Business Loan v1" },
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
    policies: [
      { id: "us-consumer-v2", label: "US Consumer Lending v2" },
      { id: "mortgage-v1", label: "Mortgage Lending v1" },
      { id: "business-v1", label: "Business Loan v1" },
    ],
    products: [
      { value: "personal_loan", label: "Personal Loan" },
      { value: "auto_loan", label: "Auto Loan" },
      { value: "business_loan", label: "Business Loan" },
      { value: "mortgage", label: "Mortgage" },
    ],
    hasStates: true,
  },
  NG: {
    code: "NG", name: "Nigeria", currency: "NGN",
    regulatoryProfile: "Nigeria Consumer Lending",
    policies: [
      { id: "ng-consumer-v1", label: "Nigeria Consumer Lending v1" },
      { id: "mortgage-v1", label: "Mortgage Lending v1" },
      { id: "business-v1", label: "Business Loan v1" },
    ],
    products: [
      { value: "personal_loan", label: "Digital Personal Loan" },
      { value: "business_loan", label: "Business Loan" },
      { value: "mortgage", label: "Mortgage" },
    ],
  },
  ZA: {
    code: "ZA", name: "South Africa", currency: "ZAR",
    regulatoryProfile: "South Africa Consumer Credit",
    policies: [
      { id: "za-consumer-v1", label: "South Africa Consumer Lending v1" },
      { id: "mortgage-v1", label: "Mortgage Lending v1" },
      { id: "business-v1", label: "Business Loan v1" },
    ],
    products: [
      { value: "personal_loan", label: "Personal Loan" },
      { value: "auto_loan", label: "Auto Loan" },
      { value: "business_loan", label: "Business Loan" },
      { value: "mortgage", label: "Mortgage" },
    ],
  },
  KE: {
    code: "KE", name: "Kenya", currency: "KES",
    regulatoryProfile: "Kenya Consumer Lending",
    policies: [
      { id: "ke-consumer-v1", label: "Kenya Consumer Lending v1" },
      { id: "mortgage-v1", label: "Mortgage Lending v1" },
      { id: "business-v1", label: "Business Loan v1" },
    ],
    products: [
      { value: "personal_loan", label: "Digital Personal Loan" },
      { value: "business_loan", label: "Business Loan" },
      { value: "mortgage", label: "Mortgage" },
    ],
  },
  GH: {
    code: "GH", name: "Ghana", currency: "GHS",
    regulatoryProfile: "Ghana Consumer Lending",
    policies: [
      { id: "gh-consumer-v1", label: "Ghana Consumer Lending v1" },
      { id: "mortgage-v1", label: "Mortgage Lending v1" },
      { id: "business-v1", label: "Business Loan v1" },
    ],
    products: [
      { value: "personal_loan", label: "Digital Personal Loan" },
      { value: "business_loan", label: "Business Loan" },
      { value: "mortgage", label: "Mortgage" },
    ],
  },
  OT: {
    code: "OT", name: "Others", currency: "USD",
    regulatoryProfile: "General / Other Jurisdiction",
    policies: [
      { id: "consumer-v1", label: "Consumer Lending v1" },
      { id: "mortgage-v1", label: "Mortgage Lending v1" },
      { id: "business-v1", label: "Business Loan v1" },
    ],
    products: [
      { value: "personal_loan", label: "Personal Loan" },
      { value: "auto_loan", label: "Auto Loan" },
      { value: "business_loan", label: "Business Loan" },
      { value: "mortgage", label: "Mortgage" },
    ],
  },
};

const KYC_FIELDS = {
  GB: [
    { key: "national_insurance_number", label: "National Insurance Number (NI)", placeholder: "e.g. QQ 12 34 56 C", hint: "Used to verify identity and pull your UK credit report (Experian, Equifax, TransUnion)" },
  ],
  US: [
    { key: "ssn", label: "Social Security Number (SSN)", placeholder: "123-45-6789", hint: "Used to verify identity and pull your US credit report (KYC / Patriot Act)" },
  ],
  NG: [
    { key: "bvn", label: "Bank Verification Number (BVN)", placeholder: "11-digit BVN", hint: "Required by Nigerian credit bureaus (CRC, Credit Registry, FirstCentral)" },
    { key: "nin", label: "National Identification Number (NIN)", placeholder: "11-digit NIN", hint: "National ID for KYC verification" },
  ],
  ZA: [
    { key: "sa_id_number", label: "SA ID Number", placeholder: "ID number", hint: "Used to verify identity and pull your South African credit report (FICA)" },
  ],
  KE: [
    { key: "national_id", label: "National ID Number", placeholder: "National ID", hint: "Used for KYC and credit pull (CRB Africa, TransUnion)" },
    { key: "kra_pin", label: "KRA PIN", placeholder: "e.g. A000000000X", hint: "Kenya Revenue Authority PIN" },
  ],
  GH: [
    { key: "ghana_card_number", label: "Ghana Card Number", placeholder: "GHA-000000000", hint: "Used to verify identity and pull your Ghana credit report (XDS Ghana)" },
  ],
};

const OTHER_KYC = [
  { key: "national_id", label: "National ID / Passport Number", placeholder: "ID or passport number", hint: "Government-issued ID for KYC verification" },
];

export function getKycConfig(market) {
  return KYC_FIELDS[market] || OTHER_KYC;
}

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
    return getSelfEmployedRequirements(market);
  }
  if (policyId && policyId.includes("sme")) {
    return getSmeRequirements(market);
  }
  return getConsumerRequirements(market);
}

function getConsumerRequirements(market) {
  switch (market) {
    case "GB":
      return [
        { type: "identity", label: "Identity verification", required: true, detail: "Passport or photocard driving licence (KYC/AML)" },
        { type: "bank_statement", label: "Bank statements", required: true, detail: "Last 3 months (all accounts)" },
        { type: "payslip", label: "Payslips", required: true, detail: "Latest 3 consecutive payslips" },
        { type: "credit_report", label: "Credit report", required: true, detail: "Experian, Equifax or TransUnion" },
        { type: "proof_of_address", label: "Proof of address", required: false, detail: "Utility bill or bank letter (last 3 months)" },
      ];
    case "US":
      return [
        { type: "identity", label: "Government-issued ID", required: true, detail: "Driver's licence or passport (KYC/Patriot Act)" },
        { type: "bank_statement", label: "Bank statements", required: true, detail: "Last 2 months (all accounts)" },
        { type: "payslip", label: "Pay stubs", required: true, detail: "Latest 2 consecutive pay stubs" },
        { type: "credit_report", label: "Credit report", required: true, detail: "FICO score — Experian, Equifax or TransUnion" },
        { type: "tax", label: "W-2 or 1099", required: false, detail: "Latest tax year (if variable income)" },
      ];
    case "NG":
      return [
        { type: "identity", label: "BVN & National ID", required: true, detail: "Bank Verification Number + NIN, Voter's Card or Driver's Licence" },
        { type: "bank_statement", label: "Bank statements", required: true, detail: "Last 6 months (all bank accounts)" },
        { type: "employment", label: "Employment letter", required: true, detail: "Employer confirmation letter (on letterhead)" },
        { type: "credit_report", label: "Credit report", required: true, detail: "CRC, Credit Registry or FirstCentral" },
        { type: "proof_of_address", label: "Proof of address", required: true, detail: "Utility bill or tenancy agreement (recent)" },
      ];
    case "ZA":
      return [
        { type: "identity", label: "SA ID document", required: true, detail: "ID book or smart ID card (FICA)" },
        { type: "bank_statement", label: "Bank statements", required: true, detail: "Last 3 months (all accounts)" },
        { type: "payslip", label: "Payslips", required: true, detail: "Latest 3 consecutive payslips" },
        { type: "credit_report", label: "Credit report", required: true, detail: "Experian, TransUnion or XDS" },
        { type: "proof_of_address", label: "Proof of address", required: true, detail: "Utility bill or rates account (FICA, recent)" },
      ];
    case "KE":
      return [
        { type: "identity", label: "National ID & KRA PIN", required: true, detail: "National ID card + KRA PIN certificate" },
        { type: "bank_statement", label: "Bank statements", required: true, detail: "Last 6 months (include M-Pesa statement if applicable)" },
        { type: "employment", label: "Employment letter", required: true, detail: "Employer confirmation or contract letter" },
        { type: "credit_report", label: "Credit report", required: true, detail: "CRB Africa, TransUnion or Metropol" },
        { type: "proof_of_address", label: "Proof of address", required: false, detail: "Utility bill or lease agreement (recent)" },
      ];
    case "GH":
      return [
        { type: "identity", label: "Ghana Card", required: true, detail: "Ghana Card (national ID)" },
        { type: "bank_statement", label: "Bank statements", required: true, detail: "Last 6 months (all accounts)" },
        { type: "employment", label: "Employment letter", required: true, detail: "Employer confirmation letter (on letterhead)" },
        { type: "credit_report", label: "Credit report", required: true, detail: "XDS Ghana or Dun & Bradstreet" },
        { type: "proof_of_address", label: "Proof of address", required: false, detail: "Utility bill or rent receipt (recent)" },
      ];
    default:
      return [
        { type: "identity", label: "Identity verification", required: true, detail: "Government-issued photo ID (KYC/AML)" },
        { type: "bank_statement", label: "Bank statements", required: true, detail: "Last 3 months (all accounts)" },
        { type: "payslip", label: "Payslips", required: true, detail: "Latest 3 consecutive payslips" },
        { type: "credit_report", label: "Credit report", required: true, detail: "From licensed credit bureau" },
        { type: "proof_of_address", label: "Proof of address", required: false, detail: "Utility bill or bank letter (recent)" },
      ];
  }
}

function getSelfEmployedRequirements(market) {
  const consumer = getConsumerRequirements(market);
  return consumer.map((r) => {
    if (r.type === "bank_statement") return { ...r, detail: "Last 12 months (business and personal accounts)" };
    if (r.type === "payslip") return { type: "tax", label: "Tax returns", required: true, detail: "Latest 2 years (SA302 / 1099 / ITX)" };
    return r;
  }).concat([
    { type: "financial_statement", label: "Business accounts", required: true, detail: "Latest 2 years filed accounts" },
  ]);
}

function getSmeRequirements(market) {
  return [
    { type: "identity", label: "Director ID", required: true, detail: "ID for all directors / beneficial owners (KYC/AML)" },
    { type: "bank_statement", label: "Bank statements", required: true, detail: "Last 6 months (business account)" },
    { type: "tax", label: "Tax returns", required: true, detail: "Latest 2 years filed returns" },
    { type: "financial_statement", label: "Financial statements", required: true, detail: "Latest 2 years (P&L + balance sheet)" },
    { type: "credit_report", label: "Credit report", required: true, detail: "Business credit report from licensed bureau" },
  ];
}