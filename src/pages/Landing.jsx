import React from 'react';
import Header from "@/components/landing/Header";
import HeroSection from "@/components/landing/HeroSection";
import QuoteSection from "@/components/landing/QuoteSection";
import HowItWorks from "@/components/landing/HowItWorks";
import LeaderboardPreview from "@/components/landing/LeaderboardPreview";
import WhyEstimate from "@/components/landing/WhyEstimate";
import FAQ from "@/components/landing/FAQ";
import Footer from "@/components/landing/Footer";

export default function Landing() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        <HeroSection />
        <QuoteSection />
        <HowItWorks />
        <LeaderboardPreview />
        <WhyEstimate />
        <FAQ />
      </main>
      <Footer />
    </div>
  );
}