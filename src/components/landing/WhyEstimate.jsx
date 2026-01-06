import React from 'react';
import { HelpCircle, FileText, TrendingUp } from "lucide-react";

const reasons = [
  {
    icon: HelpCircle,
    title: "Tired of rejections without knowing why?",
    description: "Get honest feedback from people who've actually worked with you."
  },
  {
    icon: FileText,
    title: "Your CV shows experience. Your score shows who you really are.",
    description: "Stand out with verified peer insights that go beyond bullet points."
  },
  {
    icon: TrendingUp,
    title: "See what's holding you back. Fix it. Get hired.",
    description: "Actionable insights to improve your professional perception."
  }
];

export default function WhyEstimate() {
  return (
    <section className="py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-4">
          Why Estimate?
        </h2>
        <p className="text-gray-500 text-center mb-16 max-w-xl mx-auto">
          The truth about your professional reputation
        </p>

        <div className="space-y-6">
          {reasons.map((reason, index) => (
            <div 
              key={index} 
              className="bg-white rounded-2xl p-8 border border-gray-100 hover:border-[#0A66C2]/20 transition-all duration-300 hover:shadow-lg flex gap-6 items-start"
            >
              <div className="w-14 h-14 bg-[#0A66C2]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <reason.icon className="w-7 h-7 text-[#0A66C2]" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{reason.title}</h3>
                <p className="text-gray-500">{reason.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}