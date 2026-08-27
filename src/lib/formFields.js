// Shared field metadata for white-label application forms.
// Used by both the FormEditor (lender configures which fields to collect)
// and the Apply page (borrower fills the enabled fields).

export const FIELD_SECTIONS = [
  { name: "Personal", fields: ["first_name", "last_name", "date_of_birth"] },
  { name: "Contact", fields: ["email", "phone"] },
  { name: "Address", fields: ["address_line1", "address_city", "address_postal_code"] },
  { name: "Employment", fields: ["employment_status", "employer_name", "annual_income"] },
  { name: "Loan", fields: ["loan_amount", "loan_term_months", "loan_purpose"] },
];

export const FIELD_META = {
  first_name: { label: "First name", type: "text", placeholder: "Jane" },
  last_name: { label: "Last name", type: "text", placeholder: "Doe" },
  email: { label: "Email", type: "email", placeholder: "jane@example.com" },
  phone: { label: "Phone", type: "tel", placeholder: "+44 7700 900000" },
  date_of_birth: { label: "Date of birth", type: "date" },
  address_line1: { label: "Address line 1", type: "text", placeholder: "123 High Street" },
  address_city: { label: "City", type: "text", placeholder: "London" },
  address_postal_code: { label: "Postal code", type: "text", placeholder: "SW1A 1AA" },
  employment_status: {
    label: "Employment status",
    type: "select",
    options: [
      { value: "employed", label: "Employed" },
      { value: "self_employed", label: "Self-employed" },
      { value: "unemployed", label: "Unemployed" },
      { value: "retired", label: "Retired" },
      { value: "other", label: "Other" },
    ],
  },
  employer_name: { label: "Employer name", type: "text", placeholder: "Acme Ltd" },
  annual_income: { label: "Annual income", type: "number", placeholder: "45000" },
  loan_amount: { label: "Loan amount", type: "number", placeholder: "10000" },
  loan_term_months: { label: "Loan term (months)", type: "number", placeholder: "24" },
  loan_purpose: { label: "Loan purpose", type: "text", placeholder: "Home improvement" },
};

export const DEFAULT_FIELDS = [
  { key: "first_name", label: "First name", enabled: true, required: true },
  { key: "last_name", label: "Last name", enabled: true, required: true },
  { key: "email", label: "Email", enabled: true, required: true },
  { key: "phone", label: "Phone", enabled: true, required: false },
  { key: "date_of_birth", label: "Date of birth", enabled: true, required: false },
  { key: "address_line1", label: "Address line 1", enabled: false, required: false },
  { key: "address_city", label: "City", enabled: false, required: false },
  { key: "address_postal_code", label: "Postal code", enabled: false, required: false },
  { key: "employment_status", label: "Employment status", enabled: true, required: false },
  { key: "employer_name", label: "Employer name", enabled: false, required: false },
  { key: "annual_income", label: "Annual income", enabled: true, required: false },
  { key: "loan_amount", label: "Loan amount", enabled: true, required: true },
  { key: "loan_term_months", label: "Loan term (months)", enabled: true, required: false },
  { key: "loan_purpose", label: "Loan purpose", enabled: true, required: false },
];