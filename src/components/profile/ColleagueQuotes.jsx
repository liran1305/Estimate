import React from 'react';

export default function ColleagueQuotes({ quotes }) {
  if (!quotes || quotes.length === 0) return null;
  
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        What Colleagues Actually Said
      </h3>
      <p className="text-sm text-gray-500 mb-4">
        Direct quotes from reviews
      </p>
      
      <div className="space-y-4">
        {quotes.map((quote, idx) => (
          <div 
            key={idx}
            className="p-4 bg-amber-50 rounded-xl border-l-4 border-amber-400"
          >
            <p className="text-gray-800 italic leading-relaxed">
              "{quote.text}"
            </p>
            {quote.context && (
              <p className="text-sm text-gray-500 mt-3">
                Context: {quote.context}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
