import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { apiSuccess, readBody } from "../../shared/utils.ts";
import { buildOpenApiSpec } from "../../shared/openapi.ts";
import { listProviders } from "../../shared/creditProviders.ts";
import { DEFAULT_POLICY } from "../../shared/policyEngine.ts";

// Returns OpenAPI documentation and platform metadata.
export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const body = await readBody(req);
    const action = body.action || "openapi";

    const apiBase = (body.api_base as string) || "https://api.underwriteos.dev";

    if (action === "openapi") {
      return apiSuccess(buildOpenApiSpec(apiBase), 200);
    }

    if (action === "providers") {
      return apiSuccess({ credit_providers: listProviders(), note: "All providers are mock/test implementations. No external bureau is connected." }, 200);
    }

    if (action === "policies") {
      return apiSuccess({ policies: [DEFAULT_POLICY], note: "consumer-v1 is the built-in default policy. Organizations can define custom policies." }, 200);
    }

    if (action === "sample") {
      return apiSuccess(samplePayload(), 200);
    }

    return apiSuccess({ actions: ["openapi", "providers", "policies", "sample"] }, 200);
  } catch (e) {
    return apiSuccess({ error: e.message }, 500);
  }
}

function samplePayload(): any {
  return {
    borrower: {
      first_name: "Jordan",
      last_name: "Okafor",
      email: "jordan.okafor@example.com",
      employment_status: "employed",
      employer_name: "Northwind Trading",
      annual_income: 58000,
      income_currency: "GBP"
    },
    application: {
      loan_amount: 15000,
      loan_currency: "GBP",
      loan_purpose: "debt_consolidation",
      loan_term_months: 36,
      interest_rate: 0.099,
      policy_id: "consumer-v1"
    },
    credit_report: {
      provider: "experian",
      raw_data: { credit_score: 672, active_accounts: 4, closed_accounts: 1, delinquent_accounts: 0, defaults: 0, outstanding_balance: 3200, credit_utilisation: 0.38, recent_enquiries: 2, repayment_history: 94 }
    },
    bank_statement: {
      period_start: "2026-05-01",
      period_end: "2026-07-31",
      account_number_masked: "****1234",
      transactions: [
        { date: "2026-05-25", description: "Salary Northwind Trading", amount: 4833, direction: "credit" },
        { date: "2026-06-25", description: "Salary Northwind Trading", amount: 4833, direction: "credit" },
        { date: "2026-07-25", description: "Salary Northwind Trading", amount: 4833, direction: "credit" },
        { date: "2026-05-01", description: "Rent standing order", amount: -1450, direction: "debit", recurring: true },
        { date: "2026-06-01", description: "Rent standing order", amount: -1450, direction: "debit", recurring: true },
        { date: "2026-07-01", description: "Rent standing order", amount: -1450, direction: "debit", recurring: true },
        { date: "2026-05-10", description: "Tesco groceries", amount: -240, direction: "debit" },
        { date: "2026-06-12", description: "Sainsbury groceries", amount: -198, direction: "debit" },
        { date: "2026-07-09", description: "Tesco groceries", amount: -221, direction: "debit" },
        { date: "2026-05-15", description: "Loan repayment Halifax", amount: -310, direction: "debit", recurring: true },
        { date: "2026-06-15", description: "Loan repayment Halifax", amount: -310, direction: "debit", recurring: true },
        { date: "2026-07-15", description: "Loan repayment Halifax", amount: -310, direction: "debit", recurring: true },
        { date: "2026-05-20", description: "Netflix subscription", amount: -12, direction: "debit", recurring: true },
        { date: "2026-06-20", description: "Netflix subscription", amount: -12, direction: "debit", recurring: true },
        { date: "2026-07-20", description: "Netflix subscription", amount: -12, direction: "debit", recurring: true },
        { date: "2026-06-05", description: "TFL transport", amount: -85, direction: "debit" },
        { date: "2026-07-05", description: "TFL transport", amount: -90, direction: "debit" }
      ]
    }
  };
}