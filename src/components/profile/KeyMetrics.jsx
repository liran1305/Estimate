import React from 'react';

export default function KeyMetrics({ 
  startupHirePct, 
  harderJobPct, 
  workAgainAbsolutelyPct 
}) {
  const metrics = [
    {
      value: startupHirePct,
      label: '"I\'d try to hire them for my own startup"'
    },
    {
      value: harderJobPct,
      label: '"I\'d want them on my team when things get tough"'
    },
    {
      value: workAgainAbsolutelyPct,
      label: '"Absolutely!" want to work together again'
    }
  ];
  
  return (
    <div className="bg-slate-800 rounded-xl md:rounded-2xl p-4 md:p-7">
      <h3 className="text-slate-400 text-xs md:text-sm font-medium tracking-wide mb-4 md:mb-5">
        THE QUESTIONS THAT ACTUALLY MATTER
      </h3>
      
      {/* Mobile: horizontal scroll, Desktop: 3 columns */}
      <div className="grid grid-cols-3 gap-2 md:gap-5">
        {metrics.map((metric, idx) => (
          <div 
            key={idx} 
            className={`text-center ${
              idx === 1 ? 'border-l border-r border-slate-600 px-1 md:px-4' : ''
            }`}
          >
            <div className="text-2xl md:text-5xl font-bold text-green-400">
              {metric.value !== null && metric.value !== undefined ? `${metric.value}%` : '—'}
            </div>
            <div className="text-slate-300 text-[10px] md:text-sm mt-1 md:mt-2 leading-tight md:leading-relaxed">
              {metric.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
