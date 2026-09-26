import React, { useState } from "react";
import GuidedOverlay from "@/components/lender/GuidedOverlay";
import BookingModal from "@/components/booking/BookingModal";

// Final step of the live guided walkthrough — mirrors the demo's portfolio
// finish. Shows a guided overlay over Reports, then opens the booking modal.
export default function GuidedPortfolio({ onSkip }) {
  const [bookingOpen, setBookingOpen] = useState(false);

  return (
    <>
      <GuidedOverlay
        n={7}
        total={7}
        position="top-right"
        title="Portfolio insights to see what drives approvals, declines and defaults"
        body="Every decision rolls up, so the patterns behind them become visible across the portfolio."
        bullets={["The top drivers behind each decision type", "Policy changes to lift approvals, cut defaults"]}
        cta="Finish the walkthrough"
        onNext={() => setBookingOpen(true)}
        onBack={onSkip}
        onClose={onSkip}
      />
      <BookingModal open={bookingOpen} onClose={() => setBookingOpen(false)} />
    </>
  );
}