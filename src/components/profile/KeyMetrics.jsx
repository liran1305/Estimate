import React from 'react';

export default function KeyMetrics({ 
  startupHirePct, 
  harderJobPct, 
  workAgainAbsolutelyPct 
}) {
  const metrics = [
    {
      value: startupHirePct,
      label: '"I\'d try to hire them\nfor my own startup"'
    },
    {
      value: harderJobPct,
      label: '"I\'d want them on my team\nwhen things get tough"'
    },
    {
      value: workAgainAbsolutelyPct,
      label: '"Absolutely!" want to\nwork together again'
    }
  ];
  
  return (
    <div className="bg-slate-800 rounded-2xl p-7">
      <h3 className="text-slate-400 text-sm font-medium tracking-wide mb-5">
        THE QUESTIONS THAT ACTUALLY MATTER
      </h3>
      
      <div className="grid grid-cols-3 gap-5">
        {metrics.map((metric, idx) => (
          <div 
            key={idx} 
            className={`text-center ${
              idx === 1 ? 'border-l border-r border-slate-600 px-4' : ''
            }`}
          >
            <div className="text-5xl font-bold text-green-400">
              {metric.value !== null && metric.value !== undefined ? `${metric.value}%` : '—'}
            </div>
            <div className="text-slate-300 text-sm mt-2 whitespace-pre-line leading-relaxed">
              {metric.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
