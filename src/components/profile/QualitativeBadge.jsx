import React from 'react';
import { behavioralConfig } from '@/config/behavioralConfig';

export default function QualitativeBadge({ badge, percentile, jobTitle }) {
  const badgeConfig = behavioralConfig.badges[badge] || behavioralConfig.badges.growing;
  
  return (
    <div 
      className="text-center px-8 py-5 rounded-2xl border-2"
      style={{ 
        background: badgeConfig.bgGradient,
        borderColor: badgeConfig.color
      }}
    >
      <div 
        className="text-xs font-semibold tracking-wider mb-1"
        style={{ color: badgeConfig.color }}
      >
        {badgeConfig.description?.toUpperCase() || 'PROFESSIONAL PROFILE'}
      </div>
      <div 
        className="text-2xl font-bold"
        style={{ color: badgeConfig.color }}
      >
        {badgeConfig.label}
      </div>
      {percentile && jobTitle && (
        <div 
          className="text-sm mt-1.5"
          style={{ color: badgeConfig.color }}
        >
          Top {percentile}% of {jobTitle}s
        </div>
      )}
    </div>
  );
}
