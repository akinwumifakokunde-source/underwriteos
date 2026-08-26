import React from "react";
import HomeNav from "@/components/home/HomeNav.jsx";
import Hero from "@/components/home/Hero.jsx";
import ApiDemo from "@/components/home/ApiDemo.jsx";
import Problem from "@/components/home/Problem.jsx";
import Solution from "@/components/home/Solution.jsx";
import HowItWorks from "@/components/home/HowItWorks.jsx";
import Evidence from "@/components/home/Evidence.jsx";
import AiPolicy from "@/components/home/AiPolicy.jsx";
import Providers from "@/components/home/Providers.jsx";
import Security from "@/components/home/Security.jsx";
import Onboarding from "@/components/home/Onboarding.jsx";
import SandboxCta from "@/components/home/SandboxCta.jsx";
import FinalCta from "@/components/home/FinalCta.jsx";
import SiteFooter from "@/components/home/SiteFooter.jsx";

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-[#0a0c12]">
      <HomeNav />
      <Hero />
      <ApiDemo />
      <Problem />
      <Solution />
      <HowItWorks />
      <Evidence />
      <AiPolicy />
      <Providers />
      <Security />
      <Onboarding />
      <SandboxCta />
      <FinalCta />
      <SiteFooter />
    </div>
  );
}