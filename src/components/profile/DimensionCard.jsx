import React from 'react';
import { behavioralConfig, getLevel } from '@/config/behavioralConfig';

export default function DimensionCard({ dimension, level, percentile, compact = false }) {
  const dimensionConfig = behavioralConfig.dimensions[dimension];
  const levelConfig = getLevel(level);
  
  if (!dimensionConfig || !levelConfig) return null;
  
  if (compact) {
    return (
      <div 
        className="flex items-center justify-between p-2.5 md:p-3 rounded-lg"
        style={{ 
          backgroundColor: levelConfig.bgColor,
          borderLeft: `4px solid ${levelConfig.color}`
        }}
      >
        <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
          <span className="text-xl md:text-2xl flex-shrink-0">{dimensionConfig.icon}</span>
          <div className="min-w-0">
            <span className="font-semibold text-gray-900 text-sm md:text-base block truncate">{dimensionConfig.name}</span>
            <p className="text-[10px] md:text-xs text-gray-500 mt-0.5 line-clamp-2">{dimensionConfig.description}</p>
          </div>
        </div>
        <div className="text-right flex-shrink-0 ml-2 md:ml-3">
          <span 
            className="text-xs md:text-sm font-semibold px-2 md:px-3 py-0.5 md:py-1 rounded-full inline-block"
            style={{ 
              color: levelConfig.color,
              backgroundColor: 'white',
              border: `1px solid ${levelConfig.color}`
            }}
          >
            {levelConfig.label}
          </span>
          {percentile && (
            <div className="text-[10px] md:text-xs text-gray-500 mt-0.5 md:mt-1">
              Top {percentile}%
            </div>
          )}
        </div>
      </div>
    );
  }
  
  return (
    <div 
      className="p-4 rounded-xl transition-all hover:shadow-md"
      style={{ 
        backgroundColor: levelConfig.bgColor,
        borderLeft: `4px solid ${levelConfig.color}`
      }}
    >
      <div className="flex justify-between items-start">
        <div className="flex items-start gap-3 flex-1">
          <span className="text-2xl mt-0.5">{dimensionConfig.icon}</span>
          <div>
            <h4 className="font-semibold text-gray-900 text-base">
              {dimensionConfig.name}
            </h4>
            <p className="text-sm text-gray-600 mt-1 leading-relaxed">
              {dimensionConfig.description}
            </p>
          </div>
        </div>
        <div className="text-right ml-4 flex-shrink-0">
          <div 
            className="font-semibold text-sm px-3 py-1 rounded-full inline-block"
            style={{ 
              color: levelConfig.color,
              backgroundColor: 'white',
              border: `1px solid ${levelConfig.color}`
            }}
          >
            {levelConfig.label}
          </div>
          {percentile && (
            <div className="text-xs text-gray-500 mt-1.5">
              Top {percentile}%
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
