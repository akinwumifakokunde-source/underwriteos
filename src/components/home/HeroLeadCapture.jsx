import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import BookingModal from "@/components/booking/BookingModal.jsx";

// Low-friction email capture that lives inside the hero. The visitor enters
// their work email and we immediately open the booking modal with it
// pre-filled — capturing the lead and moving them to book in one motion.
// The "Try CreditDecide" ghost link sits tight beside the primary CTA.
export default function HeroLeadCapture() {
  const [email, setEmail] = useState("");
  const [bookingOpen, setBookingOpen] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    setBookingOpen(true);
  };

  return (
    <>
      <form onSubmit={submit} className="mt-8 w-full max-w-md">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your work email"
          className="w-full text-sm rounded-full border border-white/15 bg-white/5 px-4 py-2.5 text-white placeholder-white/40 focus:outline-none focus:border-teal-400/50 focus:ring-2 focus:ring-teal-400/20 transition"
        />
        <div className="mt-3 flex items-center gap-3">
          <button
            type="submit"
            className="group inline-flex items-center justify-center gap-2 text-sm font-medium text-black bg-white pl-4 pr-5 py-2.5 rounded-full hover:bg-emerald-50 transition-all shadow-lg whitespace-nowrap"
          >
            <span className="w-2 h-2 rounded-full bg-[#2E7D32] group-hover:scale-110 transition-transform" />
            Book a demo
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
          <Link
            to="/start/lender"
            className="group inline-flex items-center justify-center gap-1.5 text-sm font-medium text-white/90 hover:text-white pl-1 pr-2 py-2.5 transition-colors"
          >
            Try CreditDecide
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </form>

      <BookingModal open={bookingOpen} onClose={() => setBookingOpen(false)} defaultEmail={email} />
    </>
  );
}