import React from 'react';
import { Lock } from 'lucide-react';

export default function RoomToGrow({ items, isOwner = false }) {
  // Only show to profile owner
  if (!isOwner || !items || items.length === 0) return null;
  
  return (
    <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 shadow-sm border border-dashed border-gray-200">
      <div className="flex flex-wrap items-center gap-2 mb-3 md:mb-4">
        <Lock className="w-4 h-4 md:w-5 md:h-5 text-gray-400" />
        <h3 className="text-lg md:text-xl font-semibold text-gray-900">
          Room to Grow
        </h3>
        <span className="text-[10px] md:text-xs bg-gray-100 text-gray-500 px-2 md:px-2.5 py-0.5 md:py-1 rounded-full">
          Only you can see this
        </span>
      </div>
      <p className="text-xs md:text-sm text-gray-500 mb-3 md:mb-4">
        Patterns from feedback that might help you grow
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
        {items.map((item, idx) => (
          <div 
            key={idx}
            className={`p-4 rounded-xl border-l-4 ${
              idx === 0 
                ? 'bg-amber-50 border-amber-400' 
                : 'bg-gray-50 border-gray-300'
            }`}
          >
            {item.title && (
              <div className={`font-semibold mb-1.5 ${
                idx === 0 ? 'text-amber-800' : 'text-gray-700'
              }`}>
                {item.title}
              </div>
            )}
            <div className={`text-sm leading-relaxed ${
              idx === 0 ? 'text-amber-700' : 'text-gray-600'
            }`}>
              {item.text || item}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
