import React from 'react';
import { behavioralConfig } from '@/config/behavioralConfig';

export default function StrengthTagsDisplay({ tags, maxDisplay = 6 }) {
  if (!tags || tags.length === 0) return null;
  
  // Sort by votes/count if available
  const sortedTags = [...tags].sort((a, b) => (b.votes || b.count || 0) - (a.votes || a.count || 0));
  const displayTags = sortedTags.slice(0, maxDisplay);
  
  return (
    <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 shadow-sm">
      <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-0.5 md:mb-1">
        What Colleagues Notice First
      </h3>
      <p className="text-xs md:text-sm text-gray-500 mb-4 md:mb-5">
        Most frequently selected strengths
      </p>
      
      <div className="space-y-2.5">
        {displayTags.map((tag, idx) => {
          const tagId = tag.id || tag.tag;
          const tagConfig = behavioralConfig?.strengthTags?.[tagId] || {};
          const isTop3 = idx < 3;
          const votes = tag.votes || tag.count || 0;
          
          return (
            <div
              key={tagId || idx}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-sm mr-2 ${
                isTop3 
                  ? 'bg-amber-50 border-2 border-amber-300 font-medium text-amber-900'
                  : 'bg-gray-50 border border-gray-200 text-gray-600'
              }`}
            >
              <span className="text-base">{tagConfig.icon || '⭐'}</span>
              <span>{tagConfig.label || tag.tag || tag.label}</span>
              {votes > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded font-semibold ${
                  isTop3 ? 'text-amber-600' : 'text-gray-400'
                }`}>
                  ×{votes}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
