import React, { useEffect } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { Home, FileText, SlidersHorizontal, Settings as SettingsIcon } from "lucide-react";

const TABS = [
  { to: "/workspace", label: "Home", icon: Home },
  { to: "/applications", label: "Applications", icon: FileText },
  { to: "/policies", label: "Policies", icon: SlidersHorizontal },
  { to: "/settings", label: "Settings", icon: SettingsIcon },
];

// Module-level caches so they survive Nav/MobileTabBar remounts across page
// navigations (each page renders its own <Nav />, so the bar remounts).
// - scrollCache: per-tab last scroll position.
// - tabPaths: per-tab last visited path. This preserves sub-path stacks — e.g.
//   an open ApplicationDetail is restored when you switch away to Policies and
//   come back to the Applications tab, instead of resetting to the list root.
const scrollCache = new Map();
const tabPaths = new Map();

const tabFor = (pathname) =>
  TABS.find((t) => pathname === t.to || pathname.startsWith(t.to + "/"));

export default function MobileTabBar() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    document.body.classList.add("has-mobile-tabbar");
    return () => document.body.classList.remove("has-mobile-tabbar");
  }, []);

  // Record the current path under its tab so we can return to it later.
  useEffect(() => {
    const current = tabFor(location.pathname);
    if (current) tabPaths.set(current.to, location.pathname);
  }, [location.pathname]);

  const handleTabClick = (to) => {
    const current = tabFor(location.pathname);
    const isCurrent = current && current.to === to;

    // Cache the outgoing tab's scroll position.
    if (current) scrollCache.set(current.to, window.scrollY);

    // Tapping the active tab pops back to its root (native tab behaviour).
    // Tapping another tab returns to its last sub-path if one is remembered.
    const target = isCurrent ? to : tabPaths.get(to) || to;
    navigate(target);

    // Restore the destination tab's scroll position after the page mounts.
    setTimeout(() => {
      const cached = scrollCache.get(to);
      if (cached != null) window.scrollTo({ top: cached, left: 0, behavior: "instant" });
      else window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }, 350);
  };

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-[#0a0c12] border-t border-white/10 pb-safe">
      <div className="flex items-stretch justify-around h-16">
        {TABS.map((t) => {
          const Icon = t.icon;
          return (
            <NavLink
              key={t.to}
              to={t.to}
              onClick={(e) => {
                e.preventDefault();
                handleTabClick(t.to);
              }}
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