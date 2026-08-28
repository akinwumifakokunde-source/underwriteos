import React from "react";
import Nav from "@/components/layout/Nav.jsx";
import BillingSection from "@/components/settings/BillingSection.jsx";

export default function Billing() {
  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-900">
      <Nav />
      <div className="max-w-4xl mx-auto px-5 sm:px-8 py-10">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight">Billing &amp; Subscription</h1>
          <p className="text-sm text-slate-500 mt-1">Subscribe to a monthly plan or top up credits anytime. Payments are processed by Stripe.</p>
        </div>
        <BillingSection />
      </div>
    </div>
  );
}