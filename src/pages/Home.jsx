import React from "react";
import HomeNav from "@/components/home/HomeNav.jsx";
import Hero from "@/components/home/Hero.jsx";
import Problem from "@/components/home/Problem.jsx";
import Solution from "@/components/home/Solution.jsx";
import Capabilities from "@/components/home/Capabilities.jsx";
import TwoWays from "@/components/home/TwoWays.jsx";
import ApiCalls from "@/components/home/ApiCalls.jsx";
import Evidence from "@/components/home/Evidence.jsx";
import EvidenceGraphSection from "@/components/home/EvidenceGraphSection.jsx";
import AiPolicy from "@/components/home/AiPolicy.jsx";
import FeedbackLoop from "@/components/home/FeedbackLoop.jsx";
import ProvidersSection from "@/components/home/ProvidersSection.jsx";
import PortabilitySection from "@/components/home/PortabilitySection.jsx";
import Security from "@/components/home/Security.jsx";
import DeveloperFlow from "@/components/home/DeveloperFlow.jsx";
import SandboxCta from "@/components/home/SandboxCta.jsx";
import FinalCta from "@/components/home/FinalCta.jsx";
import SiteFooter from "@/components/home/SiteFooter.jsx";

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-[#0a0c12]">
      <HomeNav />
      {/* Hook */}
      <Hero />
      <Problem />
      <Solution />
      {/* How it works */}
      <Capabilities />
      <TwoWays />
      <ApiCalls />
      {/* Why it's different */}
      <Evidence />
      <EvidenceGraphSection />
      <AiPolicy />
      <FeedbackLoop />
      <ProvidersSection />
      <PortabilitySection />
      {/* Trust & get started */}
      <Security />
      <DeveloperFlow />
      <SandboxCta />
      <FinalCta />
      <SiteFooter />
    </div>
  );
}