import React from 'react';
import DimensionCard from './DimensionCard';

export default function SkillsThatMatter({ dimensions }) {
  if (!dimensions || Object.keys(dimensions).length === 0) return null;
  
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <h3 className="text-xl font-semibold text-gray-900 mb-1">
        Skills That Matter Now
      </h3>
      <p className="text-sm text-gray-500 mb-5">
        What separates people who thrive from those who struggle
      </p>
      
      <div className="space-y-3">
        {Object.entries(dimensions).map(([dimension, data]) => (
          <DimensionCard 
            key={dimension}
            dimension={dimension}
            level={data.level}
            percentile={data.percentile}
            compact
          />
        ))}
      </div>
    </div>
  );
}
