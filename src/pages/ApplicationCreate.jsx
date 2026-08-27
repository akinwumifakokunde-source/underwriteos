import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import Nav from "@/components/layout/Nav.jsx";
import EntryChoice from "@/components/application/EntryChoice";
import { getJurisdiction, getCurrency, getPolicies } from "@/lib/jurisdictions";
import { Loader2, ArrowLeft } from "lucide-react";

const SAMPLE = {
  borrower: { first_name: "Maria", last_name: "Smith", email: "maria@example.com", phone: "+44 7700 900000", employment_status: "employed", employer_name: "Acme Corp", annual_income: 52000 },
  application: { loan_amount: 12000, loan_term_months: 24, loan_purpose: "debt_consolidation", product_type: "personal_loan", policy_id: "consumer-v1" },
  credit: { credit_score: 680, active_accounts: 4, closed_accounts: 1, delinquent_accounts: 0, defaults: 0, credit_utilisation: 0.25, recent_enquiries: 1, repayment_history: 95, outstanding_balance: 3000 },
  financial: { monthly_income: 4333, monthly_expenses: 1800, existing_debt: 3000 }
};

export default function ApplicationCreate() {
  const navigate = useNavigate();
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState([]);
  const [market, setMarket] = useState("GB");

  const addProgress = (msg) => setProgress((p) => [...p, { id: Date.now() + Math.random(), msg }]);

  const handleChoose = async (choice) => {
    setCreating(true);
    setError(null);
    setProgress([]);
    try {
      if (choice === "sample") {
        await createSampleApplication(navigate, addProgress, market);
      } else {
        await createDraftApplication(choice, navigate, addProgress, market);
      }
    } catch (e) {
      setError(e?.response?.data?.error?.message || e.message || "Failed to create application.");
      addProgress("✗ Stopped");
    } finally {
      setCreating(false);
    }
  };

  // Auto-start when navigated with ?choice= (from the workspace home cards)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const choice = urlParams.get("choice");
    if (choice) handleChoose(choice);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-[#f7f8fa] text-slate-900">
      <Nav />
      {!creating && !error && <EntryChoice onChoose={handleChoose} market={market} onMarketChange={setMarket} />}

      {creating && (
        <div className="max-w-2xl mx-auto px-5 sm:px-8 py-10">
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <div className="flex items-center gap-3 mb-4">
              <Loader2 className="w-5 h-5 text-teal-600 animate-spin" />
              <h2 className="text-sm font-semibold text-slate-900">
                {progress.length === 0 ? "Creating application…" : "Processing…"}
              </h2>
            </div>
            <div className="space-y-1.5 max-h-60 overflow-y-auto">
              {progress.map((p) => (
                <div key={p.id} className="text-xs text-slate-600 font-mono">{p.msg}</div>
              ))}
            </div>
          </div>
        </div>
      )}

      {error && !creating && (
        <div className="max-w-2xl mx-auto px-5 sm:px-8 py-10">
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 mb-4">{error}</div>
          <button onClick={() => { setError(null); setProgress([]); }} className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900">
            <ArrowLeft className="w-4 h-4" /> Back to choices
          </button>
        </div>
      )}
    </div>
  );
}

async function createDraftApplication(choice, navigate, addProgress, market) {
  const jur = getJurisdiction(market);
  const currency = jur.currency;
  const policyId = jur.policies[0]?.id || "consumer-v1";
  const productType = jur.products[0]?.value || "personal_loan";

  addProgress("Creating borrower…");
  const isUpload = choice === "upload";
  const b = await base44.functions.invoke("apiBorrowers", {
    action: "create",
    first_name: "New",
    last_name: "Applicant",
    email: "", phone: "",
    employment_status: "employed",
    income_currency: currency,
  });
  const borrowerId = b.data.borrower_id;
  addProgress("✓ Borrower created");

  addProgress("Creating application…");
  const a = await base44.functions.invoke("apiApplications", {
    action: "create",
    borrower_id: borrowerId,
    loan_amount: 10000,
    loan_currency: currency,
    loan_purpose: "general",
    loan_term_months: 12,
    product_type: productType,
    policy_id: policyId,
    market,
    borrower_type: "salaried",
  });
  const appId = a.data.application_id;
  addProgress("✓ Application created");

  addProgress("Opening workspace…");
  setTimeout(() => navigate(`/applications/${appId}${isUpload ? "?tab=Documents" : ""}`), 400);
}

async function createSampleApplication(navigate, addProgress, market) {
  const s = SAMPLE;
  const jur = getJurisdiction(market);
  const currency = jur.currency;
  const policyId = jur.policies[0]?.id || "consumer-v1";
  const productType = jur.products[0]?.value || "personal_loan";

  addProgress("Creating borrower…");
  const b = await base44.functions.invoke("apiBorrowers", {
    action: "create",
    first_name: s.borrower.first_name, last_name: s.borrower.last_name,
    email: s.borrower.email, phone: s.borrower.phone,
    employment_status: s.borrower.employment_status,
    employer_name: s.borrower.employer_name,
    annual_income: s.borrower.annual_income,
    income_currency: currency,
  });
  const borrowerId = b.data.borrower_id;
  addProgress("✓ Borrower created");

  addProgress("Creating application…");
  const a = await base44.functions.invoke("apiApplications", {
    action: "create",
    borrower_id: borrowerId,
    loan_amount: s.application.loan_amount,
    loan_currency: currency,
    loan_purpose: s.application.loan_purpose,
    loan_term_months: s.application.loan_term_months,
    product_type: productType,
    policy_id: policyId,
    market,
    borrower_type: "salaried",
  });
  const appId = a.data.application_id;
  addProgress("✓ Application created");

  addProgress("Ingesting credit data…");
  await base44.functions.invoke("apiCreditReport", {
    action: "submit",
    application_id: appId,
    provider: "mock",
    raw_data: s.credit,
  });
  addProgress("✓ Credit data ingested");

  addProgress("Ingesting financial data…");
  const income = s.financial.monthly_income;
  const rent = Math.round(s.financial.monthly_expenses * 0.6);
  const living = s.financial.monthly_expenses - rent;
  const debt = Math.max(1, Math.round(s.financial.existing_debt / s.application.loan_term_months));
  const tx = [];
  for (const m of [5, 6, 7]) {
    const mm = String(m).padStart(2, "0");
    tx.push({ date: `2026-${mm}-25`, description: `Salary ${s.borrower.employer_name}`, amount: income, direction: "credit" });
    tx.push({ date: `2026-${mm}-01`, description: "Rent & utilities", amount: -rent, direction: "debit", recurring: true });
    tx.push({ date: `2026-${mm}-15`, description: "Loan repayment", amount: -debt, direction: "debit", recurring: true });
    tx.push({ date: `2026-${mm}-20`, description: "Groceries & transport", amount: -living, direction: "debit" });
  }
  await base44.functions.invoke("apiBankStatement", {
    action: "submit",
    application_id: appId,
    period_start: "2026-05-01",
    period_end: "2026-07-31",
    account_number_masked: "****1234",
    transactions: tx,
  });
  addProgress("✓ Financial data ingested");

  addProgress("Analyzing risk…");
  await base44.functions.invoke("apiAnalyze", { application_id: appId });
  addProgress("✓ Risk signals generated");

  addProgress("Evaluating policy…");
  await base44.functions.invoke("apiUnderwrite", { application_id: appId, policy_id: s.application.policy_id });
  addProgress("✓ Decision ready");

  addProgress("Opening workspace…");
  setTimeout(() => navigate(`/applications/${appId}`), 600);
}