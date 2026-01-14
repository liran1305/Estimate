import React, { useState } from 'react';
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "Is it really anonymous?",
    answer: "Yes, completely. Reviewers never see who rated them, and you'll never know who reviewed you. We use advanced anonymization to ensure privacy."
  },
  {
    question: "What if I get bad reviews?",
    answer: "Honest feedback is how we grow. Your score reflects real perceptions, giving you actionable insights to improve. You control who sees your score — share it only when you're ready."
  },
  {
    question: "Who can see my score?",
    answer: "Only you. Your score is private by default. You choose if and when to share it with recruiters or add it to job applications. We never post to LinkedIn or share without your permission."
  },
  {
    question: "How does sharing with recruiters work?",
    answer: "After receiving at least 3 peer reviews, your professional reputation score becomes available to unlock. You maintain full control over visibility — choose to make your verified score discoverable to recruiters when you're ready. This gives you a competitive advantage by showcasing validated peer feedback from real colleagues."
  }
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <section className="py-24 px-6 bg-white">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-4">
          Frequently Asked Questions
        </h2>
        <p className="text-gray-500 text-center mb-12">
          Everything you need to know about anonymous peer reviews
        </p>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div 
              key={index}
              className="border border-gray-200 rounded-xl overflow-hidden hover:border-[#0A66C2]/30 transition-colors"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
              >
                <span className="font-semibold text-gray-900 pr-8">{faq.question}</span>
                <ChevronDown 
                  className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {openIndex === index && (
                <div className="px-6 pb-5 text-gray-600 leading-relaxed">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
