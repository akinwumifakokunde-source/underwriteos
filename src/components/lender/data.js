export const GREEN = "#2e633d";
export const GREEN_DARK = "#0B3D21";

export const BORROWER = {
  name: "Brightleaf Catering Co.",
  applicant: "Elena R. Mendoza",
  loanType: "Small Business Term Loan",
  appId: "DEMO-BL-7741",
  officer: "Jordan Avila",
  lastActivity: "8d ago",
  amount: "$175,000",
  status: "FOR REVIEW",
  progress: 100,
};

export const PIPELINE_ROWS = [
  { id: "r1", borrower: "Northpeak Machining LLC", applicant: "David Chen", status: "COLLECTING", loanType: "Equipment Term Loan", officer: "Jordan Avila", activity: "8d ago", progress: 80 },
  { id: "r2", borrower: "Brightleaf Catering Co.", applicant: "Elena R. Mendoza", status: "FOR REVIEW", loanType: "Small Business Term Loan", officer: "Jordan Avila", activity: "8d ago", progress: 100, appId: "DEMO-BL-7741" },
  { id: "r3", borrower: "Cedar Park Dental Group", applicant: "Ananya Rao", status: "COLLECTING", loanType: "Microloan / Personal Loan", officer: "Jordan Avila", activity: "5d ago", progress: 50 },
  { id: "r4", borrower: "Greypine Logistics LLC", applicant: "Michael Adeyemi", status: "FOR REVIEW", loanType: "Commercial Real Estate", officer: "Jordan Avila", activity: "2d ago", progress: 87 },
];

export const DOCUMENTS_ANALYZING = [
  "Brightleaf Form 1120S 2024 2025.pdf",
  "Mendoza Form 1040 2024 2025.pdf",
  "Brightleaf PL YTD May 2026.pdf",
  "Brightleaf Balance Sheet May 2026.pdf",
  "bank statements apr-may.pdf",
  "BankofAmerica Statement March 2026.png",
  "Brightleaf Debt Schedule.pdf",
  "Mendoza Personal Financial Statement.pdf",
];

export const DOCUMENTS_ACCEPTED = [
  "Articles of Incorporation (Brightleaf Formation Certificate.png)",
  "Operating Agreement (Brightleaf OA signed.pdf)",
  "EIN Letter (IRS CP575.pdf)",
];

export const CONVERSATION = [
  { type: "system", text: "Cross-document check: Chase deposits run $72,400 in March, $72,584 in April and $73,305 in May against $386,200 of January–May 2026 P&L revenue. Each month opens with a dip after the Sysco payment, to $39,652 on March 4 and $68,869 on April 3, then recovers as institutional receipts arrive. The closed Bank of America account is excluded from this comparison." },
  { type: "ai", time: "10:04 AM", text: "Hi Elena, the Chase statement you sent covers April and May only. We need the last three months for Brightleaf's current operating account, so March is missing. Please send the complete March-May statement through your secure borrower portal." },
  { type: "ai", time: "10:13 AM", text: "One more question: I noticed some large transactions and a cash dip on April 3. Can you provide context on the cash flow during that period?" },
  { type: "note", text: "No one on your team wrote those. CreditDecide cross-checked the documents, caught the evidence gap and the underwriting question, and asked Elena itself. Your team can read or step into this thread at any time." },
  { type: "borrower", time: "10:15 AM", text: "Sorry, I exported the wrong date range. Attached is the full March through May statement for our Chase operating account.", attachment: { name: "Brightleaf Bank Statement Mar-May.pdf", kind: "PDF" } },
  { type: "borrower", time: "10:15 AM", text: "That is just how our month starts. Sysco bills us right after the big events, so the food is paid for before the schools pay us, and the district is net 30 so their money does not land until the first week. It gets tight for about five days and then it fills back up. Happens every month, I am used to it." },
];

export const MEMO_SECTIONS = [
  { name: "Deal Summary", status: "DONE" },
  { name: "Mission Fit", status: "DONE" },
  { name: "Strengths, Weaknesses & Mitigants", status: "WRITING" },
  { name: "Business Overview", status: "QUEUED" },
  { name: "Owner / Management", status: "QUEUED" },
  { name: "Financial Spreading", status: "QUEUED" },
  { name: "Cash Flow & DSCR", status: "QUEUED" },
  { name: "Risk Factors & Mitigants", status: "QUEUED" },
  { name: "Recommendation", status: "FINAL" },
];

export const STRENGTHS = [
  "Two-year revenue growth: 2025 gross receipts $887,900 (up 9.3% from 2024).",
  "Conservative leverage: 0.27x debt-to-worth.",
  "Existing business debt: $38,424 equipment note at 8.40% fixed.",
  "Guarantor support: $744,850 personal net worth.",
  "Owner income: $98,000 W-2 and $104,600 S-Corp K-1 income.",
  "Accepted bank statements match balance sheet.",
];

export const WEAKNESSES = [
  { text: "Customer concentration: corporate/institutional catering is 69.5% of YTD revenue.", mitigant: "Relationships through 2027 with renewal options." },
  { text: "Interim earnings thin against distributions: $32,400 net income on $386,200 revenue.", mitigant: "Compensation is discretionary." },
  { text: "Operating-account coverage on closed BofA account for March.", mitigant: "Old account, not complete coverage." },
  { text: "Certificate entity name mismatch (\"Catering, Co.\" vs. application).", mitigant: "Business operated in predecessor form since 2017." },
];

export const BUREAU_DATA = [
  { provider: "EXPERIAN", product: "Intelliscore Plus V2", detail: "14 tradelines - no derogatories", value: "68 / 100" },
  { provider: "FICO", product: "SBSS", detail: "Screen: 155", value: "178 / 300" },
  { provider: "EXPERIAN", product: "Guarantor FICO 8", detail: "Utilization - credit history", value: "721 / 850" },
  { provider: "JACK HENRY / FISERV", product: "Member relationship", detail: "$42.8K loan - $1,150/mo - current", value: "4.2 years" },
];

export const POLICY_RESULTS = [
  { rule: "Rule 1 Verified cash-flow coverage", expected: "Verified DSCR >= 1.25x with lender-priced terms", actual: "Illustrative 2.32x; proposed repayments assumed", outcome: "Insufficient data", severity: "Review trigger" },
  { rule: "Rule 2 Identity and entity consistency", expected: "Consistent legal entity evidence", actual: "Entity spelling and formation dates require reconciliation", outcome: "Insufficient data", severity: "Hard stop" },
];

export const SCORECARD = [
  { metric: "DEBT SERVICE COVERAGE", value: "2.32x", status: "GOOD", points: "33 / 35 pts" },
  { metric: "LEVERAGE (DEBT TO WORTH)", value: "0.27x", status: "GOOD", points: "19 / 20 pts" },
  { metric: "LIQUIDITY (CURRENT RATIO)", value: "5.18x", status: "GOOD", points: "15 / 15 pts" },
  { metric: "OPERATING MARGIN", value: "12%", status: "GOOD", points: "12 / 15 pts" },
  { metric: "EVIDENCE COMPLETE", value: "100%", status: "GOOD", points: "15 / 15 pts" },
];

export const COMPETITIVE = [
  { label: "Customer concentration", text: "Oakland USD and Kaiser: 69.5% of YTD revenue. Confirm contract terms." },
  { label: "Local operations", text: "Verify Brightleaf and second-kitchen permits." },
  { label: "Market inputs", text: "Review local wage and food-service employment trends." },
];

export const PORTFOLIO_SUMMARY = [
  { status: "COLLECTING", files: 3, value: "USD 963K", avg: "Not measured", color: "#d1a843" },
  { status: "NEEDS REVIEW", files: 0, value: "USD 0", avg: "Not measured", color: "#9ca3af" },
  { status: "FOR REVIEW", files: 1, value: "USD 175K", avg: "Not measured", color: "#4b7be0" },
];

export const DECISION_DRIVERS = {
  approved: [
    { label: "Evidence complete", count: 6 },
    { label: "Coverage supported", count: 5 },
    { label: "Collateral supported", count: 4 },
    { label: "Track record", count: 4 },
  ],
  declined: [
    { label: "Coverage short", count: 2 },
    { label: "Evidence incomplete", count: 2 },
    { label: "Outside policy", count: 1 },
  ],
};

export const OUTCOMES = [
  { label: "Approved", files: 19, value: "USD 2.6M" },
  { label: "Declined", files: 5, value: "USD 529K" },
  { label: "Active", files: 4, value: "USD 1.1M" },
];

export const BORROWER_MIX = [
  { label: "Small Business Term Loan", value: 2 },
  { label: "Equipment Term Loan", value: 1 },
  { label: "Microloan / Personal Loan", value: 1 },
  { label: "Commercial Real Estate", value: 0 },
];

export const MIX_COLORS = ["#2e633d", "#4b7be0", "#d1a843", "#9ca3af"];