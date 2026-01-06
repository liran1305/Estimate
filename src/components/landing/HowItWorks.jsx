import React from 'react';
import { Linkedin, Users, BarChart3 } from "lucide-react";

const steps = [
  {
    icon: Linkedin,
    title: "Sign up with LinkedIn",
    description: "Connect your professional network securely"
  },
  {
    icon: Users,
    title: "Review 3 colleagues anonymously",
    description: "Share honest feedback about people you've worked with"
  },
  {
    icon: BarChart3,
    title: "Get your professional score",
    description: "Unlock insights from peers who know your work"
  }
];

export default function HowItWorks() {
  return (
    <section className="py-24 px-6 bg-gray-50/50">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-4">
          How It Works
        </h2>
        <p className="text-gray-500 text-center mb-16 max-w-xl mx-auto">
          Three simple steps to discover your professional perception
        </p>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <div className="bg-white rounded-2xl p-8 border border-gray-100 h-full hover:shadow-lg transition-shadow duration-300">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-[#0A66C2]/10 rounded-xl flex items-center justify-center">
                    <step.icon className="w-6 h-6 text-[#0A66C2]" />
                  </div>
                  <span className="text-5xl font-bold text-gray-100">{index + 1}</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{step.title}</h3>
                <p className="text-gray-500">{step.description}</p>
              </div>
              
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gray-200" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}