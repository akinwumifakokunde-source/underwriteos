import React from "react";
import { CreditCard, Wallet, ShoppingBag, Building2, Smartphone, Landmark, Car, Store, Users, PiggyBank, BadgePercent, Coins } from "lucide-react";

// Consumer lending company types CreditDecide serves — no brand names.
const LENDERS = [
  { label: "Personal loan providers", icon: CreditCard, grad: "from-teal-400 to-emerald-500" },
  { label: "Instalment lenders", icon: Wallet, grad: "from-sky-400 to-indigo-500" },
  { label: "Point-of-sale lenders", icon: ShoppingBag, grad: "from-violet-400 to-purple-500" },
  { label: "Buy-now-pay-later", icon: BadgePercent, grad: "from-amber-400 to-orange-500" },
  { label: "Digital banks", icon: Smartphone, grad: "from-cyan-400 to-blue-500" },
  { label: "Credit unions", icon: Users, grad: "from-rose-400 to-pink-500" },
  { label: "Microfinance", icon: Coins, grad: "from-lime-400 to-emerald-500" },
  { label: "Retail credit", icon: Store, grad: "from-fuchsia-400 to-purple-500" },
  { label: "Auto finance", icon: Car, grad: "from-emerald-400 to-teal-500" },
  { label: "Neobanks", icon: Building2, grad: "from-indigo-400 to-blue-500" },
  { label: "Savings & loans", icon: PiggyBank, grad: "from-orange-400 to-amber-500" },
  { label: "Community lenders", icon: Landmark, grad: "from-teal-400 to-cyan-500" },
];

export default function TrustBar() {
  return (
    <section className="border-b border-[#eceef1] dark:border-slate-800 bg-white dark:bg-slate-950">
      <div className="max-w-5xl mx-auto px-5 sm:px-8 py-12">
        <p className="text-center text-[11px] font-mono uppercase tracking-[0.18em] text-[#8a909c] dark:text-slate-500 mb-8">
          Underwriting infrastructure for consumer lenders
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {LENDERS.map((l) => {
            const Icon = l.icon;
            return (
              <div
                key={l.label}
                className="group flex items-center gap-2.5 rounded-xl border border-[#eceef1] dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-3 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_28px_-14px_rgba(13,148,136,0.25)] hover:border-[#0d9488]/30"
              >
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${l.grad} flex items-center justify-center shadow-sm transition-transform duration-300 group-hover:scale-110 shrink-0`}>
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <span className="text-[13px] font-medium text-[#525965] dark:text-slate-300 group-hover:text-[#0a0c12] dark:group-hover:text-slate-50 transition-colors leading-tight">
                  {l.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}