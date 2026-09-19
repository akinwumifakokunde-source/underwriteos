import React, { useEffect } from "react";
import { NavLink } from "react-router-dom";
import { Home, FileText, SlidersHorizontal, Settings as SettingsIcon } from "lucide-react";

const TABS = [
  { to: "/workspace", label: "Home", icon: Home },
  { to: "/applications", label: "Applications", icon: FileText },
  { to: "/policies", label: "Policies", icon: SlidersHorizontal },
  { to: "/settings", label: "Settings", icon: SettingsIcon },
];

export default function MobileTabBar() {
  useEffect(() => {
    document.body.classList.add("has-mobile-tabbar");
    return () => document.body.classList.remove("has-mobile-tabbar");
  }, []);

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-[#0a0c12] border-t border-white/10 pb-safe">
      <div className="flex items-stretch justify-around h-16">
        {TABS.map((t) => {
          const Icon = t.icon;
          return (
            <NavLink
              key={t.to}
              to={t.to}
              className={({ isActive }) =>
                `flex flex-1 flex-col items-center justify-center gap-1 text-[10px] font-medium touch-target ${
                  isActive ? "text-teal-400" : "text-[#a0a4ab]"
                }`
              }
            >
              <Icon className="w-5 h-5" />
              <span>{t.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}