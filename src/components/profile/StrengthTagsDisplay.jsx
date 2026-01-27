import React from 'react';
import { behavioralConfig } from '@/config/behavioralConfig';

export default function StrengthTagsDisplay({ tags, maxDisplay = 6 }) {
  if (!tags || tags.length === 0) return null;
  
  // Sort by votes if available, otherwise by order
  const sortedTags = [...tags].sort((a, b) => (b.votes || 0) - (a.votes || 0));
  const displayTags = sortedTags.slice(0, maxDisplay);
  
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        What Colleagues Notice First
      </h3>
      <p className="text-sm text-gray-500 mb-5">
        Most frequently selected strengths
      </p>
      
      <div className="flex flex-wrap gap-2.5">
        {displayTags.map((tag, idx) => {
          const tagConfig = behavioralConfig.strengthTags[tag.id] || tag;
          const isTop3 = idx < 3;
          
          return (
            <div
              key={tag.id}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm ${
                isTop3 
                  ? 'bg-amber-50 border-2 border-amber-400 font-semibold text-amber-900'
                  : 'bg-gray-100 border border-gray-200 text-gray-600'
              }`}
            >
              <span>{tagConfig.icon}</span>
              <span>{tagConfig.label}</span>
              {tag.votes && (
                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                  isTop3 ? 'bg-amber-200' : 'bg-gray-200'
                }`}>
                  ×{tag.votes}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
