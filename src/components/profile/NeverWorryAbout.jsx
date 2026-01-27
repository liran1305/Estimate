import React from 'react';
import { Check } from 'lucide-react';

export default function NeverWorryAbout({ items, firstName }) {
  if (!items || items.length === 0) return null;
  
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        With {firstName}, You Don't Worry About...
      </h3>
      <p className="text-sm text-gray-500 mb-4">
        What colleagues say they can count on
      </p>
      
      <div className="space-y-2.5">
        {items.map((item, idx) => (
          <div 
            key={idx}
            className="flex items-center gap-3 px-4 py-3.5 bg-green-50 rounded-xl text-green-800 font-medium"
          >
            <span className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center flex-shrink-0">
              <Check className="w-4 h-4" />
            </span>
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}
