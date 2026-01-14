import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Linkedin, Building2, Shield, Lock, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import WaitlistModal from "@/components/landing/WaitlistModal";
import TypewriterTitle from "@/components/landing/TypewriterTitle";

export default function HeroSection() {
  const [showWaitlist, setShowWaitlist] = useState(false);

  return (
    <>
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <TypewriterTitle />
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-8 mt-6">
            A peer-verified reputation layer for hiring - helping great talent get discovered and helping recruiters hire with confidence.
          </p>
          
          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 text-sm text-gray-500 mb-12">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-[#0A66C2]" />
              <span>Anonymous reviews</span>
            </div>
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-[#0A66C2]" />
              <span>You control visibility</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#0A66C2]" />
              <span>100% Free</span>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-6 justify-center max-w-2xl mx-auto">
            <Card className="flex-1 p-8 border-2 border-gray-100 hover:border-[#0A66C2]/20 transition-all duration-300 hover:shadow-lg group flex flex-col">
              <div className="w-14 h-14 bg-[#0A66C2]/10 rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform">
                <Linkedin className="w-7 h-7 text-[#0A66C2]" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Talents</h3>
              <p className="text-gray-500 mb-6 text-sm flex-grow">Get anonymous peer feedback & share with recruiters</p>
              <Link to={createPageUrl("LinkedInAuth")}>
                <Button className="w-full bg-[#0A66C2] hover:bg-[#004182] text-white font-medium h-12 rounded-xl">
                  Continue with LinkedIn
                  <img src="/images/right-arrow.png" alt="Arrow" className="w-4 h-4 ml-2 brightness-0 invert" />
                </Button>
              </Link>
            </Card>

            <Card className="flex-1 p-8 border-2 border-gray-100 hover:border-gray-200 transition-all duration-300 hover:shadow-lg group flex flex-col">
              <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform">
                <Building2 className="w-7 h-7 text-gray-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Recruiters</h3>
              <p className="text-gray-500 mb-6 text-sm flex-grow">HR & recruiting companies</p>
              <Button 
                variant="outline" 
                className="w-full font-medium h-12 rounded-xl border-2"
                onClick={() => setShowWaitlist(true)}
              >
                Join Waitlist
              </Button>
            </Card>
          </div>
        </div>
      </section>

      <WaitlistModal open={showWaitlist} onClose={() => setShowWaitlist(false)} />
    </>
  );
}