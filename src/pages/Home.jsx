import React from "react";
import HomeNav from "@/components/home/HomeNav.jsx";
import Hero from "@/components/home/Hero.jsx";
import Problem from "@/components/home/Problem.jsx";
import Solution from "@/components/home/Solution.jsx";
import Capabilities from "@/components/home/Capabilities.jsx";
import Evidence from "@/components/home/Evidence.jsx";
import AiPolicy from "@/components/home/AiPolicy.jsx";
import ApiCalls from "@/components/home/ApiCalls.jsx";
import ProvidersSection from "@/components/home/ProvidersSection.jsx";
import DeveloperFlow from "@/components/home/DeveloperFlow.jsx";
import SandboxCta from "@/components/home/SandboxCta.jsx";
import Security from "@/components/home/Security.jsx";
import FinalCta from "@/components/home/FinalCta.jsx";
import SiteFooter from "@/components/home/SiteFooter.jsx";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0a0c12] text-white">
      <HomeNav />
      <Hero />
      <Problem />
      <Solution />
      <Capabilities />
      <Evidence />
      <AiPolicy />
      <ApiCalls />
      <ProvidersSection />
      <DeveloperFlow />
      <SandboxCta />
      <Security />
      <FinalCta />
      <SiteFooter />
    </div>
  );
}