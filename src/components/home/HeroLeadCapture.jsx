import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import BookingModal from "@/components/booking/BookingModal.jsx";

// Hero CTA row. "Book a demo" opens the booking modal; "Try CreditDecide"
// routes to the borrower apply flow. Tight horizontal grouping, no email field.
export default function HeroLeadCapture() {
  const [bookingOpen, setBookingOpen] = useState(false);

  return (
    <>
      <div className="mt-8 flex items-center gap-3">
        <button
          type="button"
          onClick={() => setBookingOpen(true)}
          className="group inline-flex items-center justify-center gap-2 text-sm font-medium text-black bg-white pl-4 pr-5 py-2.5 rounded-full hover:bg-emerald-50 transition-all shadow-lg whitespace-nowrap"
        >
          <span className="w-2 h-2 rounded-full bg-[#22c55e] group-hover:scale-110 transition-transform" />
          Book a demo
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </button>
        <Link
          to="/start/borrower"
          className="group inline-flex items-center justify-center gap-1.5 text-sm font-medium text-white/90 hover:text-white pl-1 pr-2 py-2.5 transition-colors"
        >
          Try CreditDecide
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      <BookingModal open={bookingOpen} onClose={() => setBookingOpen(false)} />
    </>
  );
}