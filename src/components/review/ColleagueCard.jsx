import React from 'react';
import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ArrowRight, RefreshCw } from "lucide-react";

const interactionTypes = [
  { 
    value: "direct", 
    label: "Direct Collaboration", 
    description: "Worked closely together on projects" 
  },
  { 
    value: "departmental", 
    label: "Departmental Interaction", 
    description: "Same department, some interaction" 
  },
  { 
    value: "general", 
    label: "General Association", 
    description: "Know of them, limited interaction" 
  }
];

export default function ColleagueCard({ 
  colleague, 
  interactionType, 
  onInteractionChange, 
  onContinue, 
  onSkip 
}) {
  return (
    <div className="space-y-6">
      <Card className="p-8 border-0 shadow-xl shadow-gray-200/50">
        <div className="flex items-center gap-5 mb-8">
          <img 
            src={colleague.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(colleague.name)}&background=0A66C2&color=fff&size=80`}
            alt={colleague.name}
            className="w-20 h-20 rounded-2xl object-cover"
          />
          <div>
            <h2 className="text-xl font-bold text-gray-900">{colleague.name}</h2>
            <p className="text-gray-500">{colleague.job_title}</p>
            <p className="text-gray-400 text-sm">{colleague.company}</p>
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

        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <button 
            onClick={onSkip}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm font-medium transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Insufficient interaction
          </button>
          
          <Button 
            className="bg-[#0A66C2] hover:bg-[#004182] h-12 px-6 rounded-xl font-medium"
            disabled={!interactionType}
            onClick={onContinue}
          >
            Continue
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </Card>
    </div>
  );
}