import React from 'react';
import { Check } from 'lucide-react';

export default function NeverWorryAbout({ items, firstName }) {
  if (!items || items.length === 0) return null;
  
  return (
    <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 shadow-sm">
      <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-0.5 md:mb-2">
        With {firstName}, You Don't Worry About...
      </h3>
      <p className="text-xs md:text-sm text-gray-500 mb-3 md:mb-4">
        What colleagues say they can count on
      </p>
      
      <div className="space-y-2">
        {items.map((item, idx) => (
          <div 
            key={idx}
            className="flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2.5 md:py-3.5 bg-green-50 rounded-lg md:rounded-xl text-green-800 font-medium text-sm md:text-base"
          >
            <span className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-green-500 text-white flex items-center justify-center flex-shrink-0">
              <Check className="w-3 h-3 md:w-4 md:h-4" />
            </span>
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}
