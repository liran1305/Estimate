import React from 'react';

export default function QuoteSection() {
  return (
    <section className="py-16 px-6 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
          <div className="w-full md:w-1/4 flex justify-center">
            <img 
              src="/images/Simon_Sinek.png"
              alt="Simon Sinek"
              className="w-48 md:w-full max-w-xs"
            />
          </div>
          
          <div className="w-full md:w-3/4 text-center md:text-left">
            <blockquote className="space-y-4">
              <p className="text-3xl md:text-4xl lg:text-5xl font-serif text-gray-900 leading-tight">
                <span className="text-[#0A66C2] text-6xl">"</span>
                You don't hire for skills, you hire for attitude. You can always teach skills.
                <span className="text-[#0A66C2] text-6xl">"</span>
              </p>
              <cite className="block text-xl md:text-2xl text-gray-600 not-italic font-medium mt-6">
                 Simon Sinek
              </cite>
            </blockquote>
          </div>
        </div>
      </div>
    </section>
  );
}