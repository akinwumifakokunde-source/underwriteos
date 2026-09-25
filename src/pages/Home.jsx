import React from "react";
import HomeNav from "@/components/home/HomeNav.jsx";
import MarketingHero from "@/components/home/MarketingHero.jsx";
import TrustBar from "@/components/home/TrustBar.jsx";
import NoCodeSolution from "@/components/home/NoCodeSolution.jsx";
import AiModules from "@/components/home/AiModules.jsx";
import WorkflowSection from "@/components/home/WorkflowSection.jsx";
import PolicyBuilderShowcase from "@/components/home/PolicyBuilderShowcase.jsx";
import Evidence from "@/components/home/Evidence.jsx";
import RegulatoryOutputs from "@/components/home/RegulatoryOutputs.jsx";
import GlobalCoverage from "@/components/home/GlobalCoverage.jsx";
import CompetitiveComparison from "@/components/home/CompetitiveComparison.jsx";
import FormsFeature from "@/components/home/FormsFeature.jsx";
import AiConnectFeature from "@/components/home/AiConnectFeature.jsx";
import Security from "@/components/home/Security.jsx";
import Faq from "@/components/home/Faq.jsx";
import FinalCta from "@/components/home/FinalCta.jsx";
import SiteFooter from "@/components/home/SiteFooter.jsx";
import Reveal from "@/components/home/Reveal.jsx";

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-[#0a0c12] dark:bg-slate-950 dark:text-slate-50">
      <HomeNav />
      <Reveal><MarketingHero /></Reveal>
      <Reveal><TrustBar /></Reveal>
      <Reveal><NoCodeSolution /></Reveal>
      <Reveal><AiModules /></Reveal>
      <Reveal><WorkflowSection /></Reveal>
      <Reveal><GlobalCoverage /></Reveal>
      <Reveal><FormsFeature /></Reveal>
      <Reveal><AiConnectFeature /></Reveal>
      <Reveal><PolicyBuilderShowcase /></Reveal>
      <Reveal><Evidence /></Reveal>
      <Reveal><RegulatoryOutputs /></Reveal>
      <Reveal><Security /></Reveal>
      <Reveal><CompetitiveComparison /></Reveal>
      <Reveal><Faq /></Reveal>
      <Reveal><FinalCta /></Reveal>
      <SiteFooter />
    </div>
  );
}