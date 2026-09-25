import React, { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Nav from "@/components/layout/Nav.jsx";
import Hero from "@/components/home/Hero.jsx";
import BorrowerExperience from "@/components/home/BorrowerExperience.jsx";

export default function WorkspaceHome() {
  const navigate = useNavigate();

  const startLender = useCallback(() => {
    navigate("/applications/new?choice=sample&market=GB");
  }, [navigate]);

  const startBorrower = useCallback(() => {
    navigate("/start/borrower");
  }, [navigate]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Nav />
      <Hero onStart={startLender} tagline="Run a sample application · 4 minutes" />
      <BorrowerExperience onStart={startBorrower} />
    </div>
  );
}