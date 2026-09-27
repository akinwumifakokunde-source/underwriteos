import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Bell } from "lucide-react";

// Live count of borrower responses the lender hasn't resolved yet (information
// requests with status "received"). RLS scopes the query to the user's org.
// Polls every 60s so new portal uploads surface without a page refresh.
export default function NotificationsBell() {
  const [count, setCount] = useState(0);

  const load = async () => {
    try {
      const list = await base44.entities.InformationRequest.filter({ status: "received" }, "-created_date", 200);
      setCount(list.length);
    } catch {
      setCount(0);
    }
  };

  useEffect(() => {
    load();
    const id = setInterval(load, 60000);
    const onFocus = () => load();
    window.addEventListener("focus", onFocus);
    return () => { clearInterval(id); window.removeEventListener("focus", onFocus); };
  }, []);

  return (
    <Link
      to="/applications?filter=Responded"
      className="relative inline-flex items-center justify-center w-9 h-9 rounded-lg text-[#a0a4ab] hover:text-white hover:bg-white/5 transition-colors"
      title="Borrower responses"
    >
      <Bell className="w-4 h-4" />
      {count > 0 && (
        <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-teal-500 text-white text-[10px] font-semibold flex items-center justify-center ring-2 ring-[#0a0c12]">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  );
}