import React from 'react';
import { behavioralConfig } from '@/config/behavioralConfig';

export default function QualitativeBadge({ badge, percentile, jobTitle }) {
  const badgeConfig = behavioralConfig.badges[badge] || behavioralConfig.badges.growing;
  
  return (
    <div 
      className="text-center px-4 md:px-6 py-2 md:py-3 rounded-lg md:rounded-xl border-2"
      style={{ 
        background: badgeConfig.bgGradient,
        borderColor: badgeConfig.color
      }}
    >
      <div 
        className="text-[9px] md:text-[10px] font-semibold tracking-wider"
        style={{ color: badgeConfig.color }}
      >
        {badgeConfig.description?.toUpperCase() || 'PROFESSIONAL PROFILE'}
      </div>
      <div 
        className="text-base md:text-lg font-bold leading-tight"
        style={{ color: badgeConfig.color }}
      >
        {badgeConfig.label}
      </div>
      {percentile && jobTitle && (
        <div 
          className="text-[10px] md:text-xs"
          style={{ color: badgeConfig.color }}
        >
          Top {percentile}% of {jobTitle}s
        </div>
      )}
    </div>
  );
}
