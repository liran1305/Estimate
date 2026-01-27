import React from 'react';
import { behavioralConfig } from '@/config/behavioralConfig';

// Icon mapping for strength tags
const TAG_ICONS = {
  'Problem Solver': '⚙️',
  'Great Communicator': '💬',
  'Quick Learner': '💡',
  'Team Player': '👥',
  'Creative Thinker': '✨',
  'Reliable': '✓',
  'Natural Leader': '👑',
  'Detail-Oriented': '🎯',
  'creative': '✨',
  'reliable': '✓'
};

export default function StrengthTagsDisplay({ tags, maxDisplay = 6 }) {
  if (!tags || tags.length === 0) return null;
  
  // Sort by votes/count if available
  const sortedTags = [...tags].sort((a, b) => (b.votes || b.count || 0) - (a.votes || a.count || 0));
  const displayTags = sortedTags.slice(0, maxDisplay);
  
  return (
    <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 shadow-sm">
      <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-3 md:mb-4">
        Top Strengths
      </h3>
      
      <div className="flex flex-wrap gap-2">
        {displayTags.map((tag, idx) => {
          const tagId = tag.id || tag.tag;
          const tagConfig = behavioralConfig?.strengthTags?.[tagId] || {};
          const tagLabel = tagConfig.label || tag.tag || tag.label;
          const icon = TAG_ICONS[tagLabel] || tagConfig.icon || '⚙️';
          
          return (
            <div
              key={tagId || idx}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm border border-amber-300 bg-amber-50 text-amber-900"
            >
              <span className="text-sm opacity-70">{icon}</span>
              <span className="font-medium">{tagLabel}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
