import React from "react";
import HomeNav from "@/components/home/HomeNav.jsx";
import Hero from "@/components/home/Hero.jsx";
import AnnouncementBanner from "@/components/home/AnnouncementBanner.jsx";
import TrustBar from "@/components/home/TrustBar.jsx";
import StatsBand from "@/components/home/StatsBand.jsx";
import NoCodeSolution from "@/components/home/NoCodeSolution.jsx";
import WorkflowSection from "@/components/home/WorkflowSection.jsx";
import PipelineFlow from "@/components/home/PipelineFlow.jsx";
import PolicyBuilderShowcase from "@/components/home/PolicyBuilderShowcase.jsx";
import AiPolicy from "@/components/home/AiPolicy.jsx";
import Evidence from "@/components/home/Evidence.jsx";
import RegulatoryOutputs from "@/components/home/RegulatoryOutputs.jsx";
import Outcomes from "@/components/home/Outcomes.jsx";
import Providers from "@/components/home/Providers.jsx";
import CompetitiveComparison from "@/components/home/CompetitiveComparison.jsx";
import FormsFeature from "@/components/home/FormsFeature.jsx";
import Security from "@/components/home/Security.jsx";
import Faq from "@/components/home/Faq.jsx";
import TeamBar from "@/components/home/TeamBar.jsx";
import FinalCta from "@/components/home/FinalCta.jsx";
import SiteFooter from "@/components/home/SiteFooter.jsx";

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-[#0a0c12]">
      <AnnouncementBanner />
      <HomeNav />
      <Hero />
      <TrustBar />
      <StatsBand />
      <NoCodeSolution />
      <WorkflowSection />
      <PipelineFlow />
      <Providers />
      <FormsFeature />
      <PolicyBuilderShowcase />
      <AiPolicy />
      <Evidence />
      <RegulatoryOutputs />
      <Outcomes />
      <Security />
      <CompetitiveComparison />
      <Faq />
      <TeamBar />
      <FinalCta />
      <SiteFooter />
    </div>
  );
}