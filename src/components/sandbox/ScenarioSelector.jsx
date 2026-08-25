import React from "react";

export const SCENARIOS = {
  strong: {
    label: "Strong applicant",
    desc: "High income, excellent credit",
    config: {
      first_name: "Alex", last_name: "Morgan", email: "alex.morgan@example.com",
      employment_status: "employed", employer_name: "Helix Digital Ltd",
      annual_income: 78000, monthly_expenses: 1800, existing_debt: 3000,
      loan_amount: 12000, loan_term_months: 24,
      credit_score: 781, active_accounts: 6, delinquent_accounts: 0, defaults: 0,
      credit_utilisation: 0.18, recent_enquiries: 1, repayment_history: 98,
    },
  },
  borderline: {
    label: "Borderline applicant",
    desc: "Moderate risk, review likely",
    config: {
      first_name: "Alex", last_name: "Morgan", email: "alex.morgan@example.com",
      employment_status: "employed", employer_name: "Helix Digital Ltd",
      annual_income: 52000, monthly_expenses: 2150, existing_debt: 8400,
      loan_amount: 12000, loan_term_months: 24,
      credit_score: 742, active_accounts: 6, delinquent_accounts: 0, defaults: 0,
      credit_utilisation: 0.44, recent_enquiries: 4, repayment_history: 88,
    },
  },
  highrisk: {
    label: "High-risk applicant",
    desc: "Defaults, high utilisation",
    config: {
      first_name: "Alex", last_name: "Morgan", email: "alex.morgan@example.com",
      employment_status: "employed", employer_name: "Helix Digital Ltd",
      annual_income: 28000, monthly_expenses: 2400, existing_debt: 15000,
      loan_amount: 12000, loan_term_months: 24,
      credit_score: 568, active_accounts: 3, delinquent_accounts: 2, defaults: 1,
      credit_utilisation: 0.72, recent_enquiries: 5, repayment_history: 58,
    },
  },
};

const ORDER = ["strong", "borderline", "highrisk"];

export default function ScenarioSelector({ selected, onSelect }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="text-sm font-semibold text-slate-900 mb-2">Scenario</div>
      <div className="grid grid-cols-3 gap-2">
        {ORDER.map((id) => {
          const s = SCENARIOS[id];
          const active = selected === id;
          return (
            <button
              key={id}
              onClick={() => onSelect(id)}
              className={`text-left rounded-lg border p-2.5 transition-colors ${active ? "border-slate-900 bg-slate-50" : "border-slate-200 hover:bg-slate-50"}`}
            >
              <div className="text-xs font-medium text-slate-800">{s.label}</div>
              <div className="text-[10px] text-slate-400 mt-0.5 leading-tight">{s.desc}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}