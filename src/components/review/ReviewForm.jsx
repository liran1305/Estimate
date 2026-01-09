import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { ArrowLeft, Send } from "lucide-react";

const categories = [
  { key: "communication_skills", label: "Communication Skills", description: "Clear, effective communication" },
  { key: "teamwork_skills", label: "Teamwork Skills", description: "Collaboration and cooperation" },
  { key: "problem_solving", label: "Problem-Solving Skills", description: "Analytical thinking and solutions" },
  { key: "adaptability", label: "Adaptability to Changes", description: "Flexibility and openness" },
  { key: "leadership_impact", label: "Leadership Impact on Team", description: "Influence and guidance", optional: true },
  { key: "goal_achievement", label: "Goal Achievement Consistency", description: "Meeting objectives reliably" },
  { key: "creativity", label: "Creativity & Innovation", description: "Original ideas and solutions" },
  { key: "initiative", label: "Initiative Beyond Duties", description: "Proactive contributions" }
];

const getScoreColor = (score) => {
  if (score <= 3) return 'text-red-500';
  if (score <= 6) return 'text-amber-500';
  return 'text-green-500';
};

const getScoreLabel = (score) => {
  if (score <= 3) return 'Needs Improvement';
  if (score <= 6) return 'Average';
  if (score <= 8) return 'Good';
  return 'Excellent';
};

export default function ReviewForm({ 
  colleague, 
  interactionType,
  scores, 
  notRelevant,
  onScoreChange, 
  onNotRelevantChange,
  onBack,
  onSubmit,
  isSubmitting
}) {
  const interactionLabels = {
    direct: "Direct Collaboration",
    departmental: "Departmental Interaction",
    general: "General Association"
  };

  return (
    <Card className="p-8 border-0 shadow-xl shadow-gray-200/50">
      <div className="flex items-center gap-4 pb-6 mb-6 border-b border-gray-100">
        <img 
          src={colleague.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(colleague.name)}&background=0A66C2&color=fff&size=48`}
          alt={colleague.name}
          className="w-12 h-12 rounded-xl object-cover"
        />
        <div>
          <h2 className="font-bold text-gray-900">{colleague.name}</h2>
          <p className="text-sm text-gray-500">{interactionLabels[interactionType]}</p>
        </div>
      </div>

      <h3 className="text-lg font-bold text-gray-900 mb-6">
        Rate {colleague.name.split(' ')[0]}'s Professional Skills
      </h3>

      <div className="space-y-8">
        {categories.map((category) => (
          <div key={category.key} className={notRelevant[category.key] ? 'opacity-50' : ''}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <Label className="font-medium text-gray-900">{category.label}</Label>
                <p className="text-sm text-gray-500">{category.description}</p>
              </div>
              {category.optional && (
                <div className="flex items-center gap-2">
                  <Checkbox 
                    id={`${category.key}-na`}
                    checked={notRelevant[category.key]}
                    onCheckedChange={(checked) => onNotRelevantChange(category.key, checked)}
                  />
                  <Label htmlFor={`${category.key}-na`} className="text-sm text-gray-500 cursor-pointer">
                    Not Relevant
                  </Label>
                </div>
              )}
            </div>
            
            {!notRelevant[category.key] && (
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-gray-400 w-4">1</span>
                <Slider
                  value={[scores[category.key] || 5]}
                  onValueChange={(value) => onScoreChange(category.key, value[0])}
                  min={1}
                  max={10}
                  step={1}
                  className="flex-1"
                />
                <span className="text-sm font-medium text-gray-400 w-6">10</span>
                <div className="min-w-[80px] text-right">
                  <span className={`text-2xl font-bold ${getScoreColor(scores[category.key] || 5)}`}>
                    {scores[category.key] || 5}
                  </span>
                  <p className={`text-xs ${getScoreColor(scores[category.key] || 5)}`}>
                    {getScoreLabel(scores[category.key] || 5)}
                  </p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex gap-3 mt-8 pt-6 border-t border-gray-100">
        <Button 
          variant="outline" 
          className="h-12 px-6 rounded-xl font-medium"
          onClick={onBack}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button 
          className="flex-1 bg-[#0A66C2] hover:bg-[#004182] h-12 rounded-xl font-medium"
          onClick={onSubmit}
          disabled={isSubmitting}
        >
          <Send className="w-4 h-4 mr-2" />
          Submit Review
        </Button>
      </div>
    </Card>
  );
}