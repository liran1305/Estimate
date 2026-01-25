import React from 'react';
import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { RefreshCw, Loader2 } from "lucide-react";

const interactionTypes = [
  { 
    value: "peer", 
    label: "Direct Colleague", 
    description: "Worked directly with them as a peer" 
  },
  { 
    value: "manager", 
    label: "They Were My Manager", 
    description: "They managed or supervised me" 
  },
  { 
    value: "direct_report", 
    label: "They Reported to Me", 
    description: "I managed or supervised them" 
  },
  { 
    value: "cross_team", 
    label: "Cross-Team Collaboration", 
    description: "Worked with them across different teams" 
  },
  { 
    value: "other", 
    label: "Other Professional Interaction", 
    description: "Know them from work but limited interaction" 
  }
];

export default function ColleagueCard({ 
  colleague, 
  interactionType, 
  onInteractionChange, 
  onContinue, 
  onSkip,
  skipsRemaining,
  totalSkips,
  isSkipping,
  onBackToProfile,
  companySkips // Per-company skip info: { company_name, skips_remaining, initial_budget, daily_refresh }
}) {
  return (
    <div className="space-y-6">
      {/* Company Context Banner */}
      {companySkips && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-4 py-3 bg-blue-50 rounded-xl border border-blue-100">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-blue-600 text-sm font-medium">
              📍 Reviewing colleagues from
            </span>
            <span className="text-blue-800 font-semibold">
              {companySkips.company_name}
            </span>
          </div>
          <span className="text-blue-600 text-sm font-medium">
            {companySkips.skips_remaining} skips left
          </span>
        </div>
      )}
      
      <Card className="p-5 md:p-6 lg:p-8 border-0 shadow-xl shadow-gray-200/50">
        <div className="flex items-center justify-between gap-2.5 md:gap-3 mb-7 md:mb-8">
          <div className="flex items-center gap-3 md:gap-4 lg:gap-5 min-w-0 flex-1">
            <img 
              src={colleague.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(colleague.name)}&background=0A66C2&color=fff&size=80`}
              alt={colleague.name}
              className="w-16 h-16 md:w-16 md:h-16 lg:w-20 lg:h-20 rounded-2xl object-cover flex-shrink-0"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(colleague.name)}&background=0A66C2&color=fff&size=80`;
              }}
            />
            <div className="min-w-0 flex-1">
              <h2 className="text-lg md:text-lg lg:text-xl font-bold text-gray-900 truncate">{colleague.name}</h2>
              <p className="text-gray-500 text-sm md:text-sm lg:text-base truncate">{colleague.job_title}</p>
              <p className="text-gray-400 text-sm md:text-sm truncate">at {colleague.company}</p>
            </div>
          </div>
          
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button 
                  onClick={skipsRemaining <= 0 ? onBackToProfile : onSkip}
                  className="flex flex-col items-center justify-center gap-1.5 md:gap-1.5 text-[#0A66C2] hover:text-[#004182] font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed px-3 md:px-3 lg:px-4 py-2.5 md:py-2.5 lg:py-3 rounded-xl hover:bg-[#0A66C2]/5 min-w-[70px] md:min-w-[70px] lg:min-w-[80px] active:scale-95 flex-shrink-0"
                  disabled={isSkipping}
                >
                  {isSkipping ? (
                    <Loader2 className="w-5.5 h-5.5 md:w-5 md:h-5 lg:w-6 lg:h-6 animate-spin" />
                  ) : (
                    <RefreshCw className="w-5.5 h-5.5 md:w-5 md:h-5 lg:w-6 lg:h-6" />
                  )}
                  <span className="text-xs md:text-xs whitespace-nowrap font-semibold">
                    {skipsRemaining <= 0 ? 'No Skips' : `Skip (${skipsRemaining})`}
                  </span>
                </button>
              </TooltipTrigger>
              <TooltipContent side="left" className="max-w-xs bg-gray-900 text-white">
                <p className="text-sm">
                  {skipsRemaining <= 0 
                    ? `No skips remaining for ${companySkips?.company_name || colleague.company}. Come back tomorrow for +${companySkips?.daily_refresh || 3} more skips!` 
                    : `${skipsRemaining} skips remaining for ${companySkips?.company_name || colleague.company} colleagues`}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Anonymity Trust Message */}
        <div className="mb-6 p-3 md:p-4 bg-blue-50 border border-blue-100 rounded-xl">
          <div className="flex items-start gap-2 md:gap-3">
            <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-blue-900 font-medium">Your review is anonymous.</p>
              <p className="text-xs text-blue-700 mt-0.5">Once submitted, even we can't see who wrote it.</p>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-4">How do you know this person?</h3>
          <RadioGroup value={interactionType} onValueChange={onInteractionChange}>
            <div className="space-y-3">
              {interactionTypes.map((type) => (
                <Label
                  key={type.value}
                  htmlFor={type.value}
                  className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    interactionType === type.value 
                      ? 'border-[#0A66C2] bg-[#0A66C2]/5' 
                      : 'border-gray-100 hover:border-gray-200'
                  }`}
                >
                  <RadioGroupItem value={type.value} id={type.value} className="mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">{type.label}</p>
                    <p className="text-sm text-gray-500">{type.description}</p>
                  </div>
                </Label>
              ))}
            </div>
          </RadioGroup>
        </div>

        <div className="flex justify-end pt-4 border-t border-gray-100">
          <Button 
            className="bg-[#0A66C2] hover:bg-[#004182] h-12 px-6 rounded-xl font-medium"
            disabled={!interactionType}
            onClick={onContinue}
          >
            Continue
            <img src="/images/right-arrow.png" alt="Arrow" className="w-4 h-4 ml-2 brightness-0 invert" />
          </Button>
        </div>
      </Card>
    </div>
  );
}