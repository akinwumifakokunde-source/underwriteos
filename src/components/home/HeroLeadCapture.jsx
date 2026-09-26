import React, { useState } from "react";
import { ArrowRight } from "lucide-react";
import BookingModal from "@/components/booking/BookingModal.jsx";

// Low-friction email capture that lives inside the hero. The visitor enters
// their work email and we immediately open the booking modal with it
// pre-filled — capturing the lead and moving them to book in one motion.
export default function HeroLeadCapture() {
  const [email, setEmail] = useState("");
  const [bookingOpen, setBookingOpen] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    setBookingOpen(true);
  };

  return (
    <>
      <form onSubmit={submit} className="mt-8 flex flex-col sm:flex-row items-stretch gap-3 w-full max-w-md">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your work email"
          className="flex-1 min-w-0 text-sm rounded-full border border-white/15 bg-white/5 px-4 py-2.5 text-white placeholder-white/40 focus:outline-none focus:border-teal-400/50 focus:ring-2 focus:ring-teal-400/20 transition"
        />
        <button
          type="submit"
          className="group inline-flex items-center justify-center gap-2 text-sm font-medium text-black bg-white pl-4 pr-5 py-2.5 rounded-full hover:bg-emerald-50 transition-all shadow-lg whitespace-nowrap"
        >
          <span className="w-2 h-2 rounded-full bg-[#2E7D32] group-hover:scale-110 transition-transform" />
          Book a demo
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </form>
      <p className="mt-3 text-[12px] text-[#8f9f97]">No sign-up required · 30-minute walkthrough · We'll run it on your file</p>

      <BookingModal open={bookingOpen} onClose={() => setBookingOpen(false)} defaultEmail={email} />
    </>
  );
}