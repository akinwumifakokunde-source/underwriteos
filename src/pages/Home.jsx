import React from "react";
import HomeNav from "@/components/home/HomeNav.jsx";
import Hero from "@/components/home/Hero.jsx";
import NoCodeSolution from "@/components/home/NoCodeSolution.jsx";
import WorkflowSection from "@/components/home/WorkflowSection.jsx";
import PolicyBuilderShowcase from "@/components/home/PolicyBuilderShowcase.jsx";
import AiPolicy from "@/components/home/AiPolicy.jsx";
import Evidence from "@/components/home/Evidence.jsx";
import FormsFeature from "@/components/home/FormsFeature.jsx";
import Security from "@/components/home/Security.jsx";
import FinalCta from "@/components/home/FinalCta.jsx";
import SiteFooter from "@/components/home/SiteFooter.jsx";

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-[#0a0c12]">
      <HomeNav />
      <Hero />
      <NoCodeSolution />
      <WorkflowSection />
      <PolicyBuilderShowcase />
      <AiPolicy />
      <Evidence />
      <FormsFeature />
      <Security />
      <FinalCta />
      <SiteFooter />
    </div>
  );
}