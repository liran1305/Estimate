import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Send } from "lucide-react";

const getScoreColor = (score) => {
  if (score <= 3) return 'text-red-500';
  if (score <= 6) return 'text-amber-500';
  return 'text-green-500';
};

const coreSkills = [
  { key: "communication_score", label: "Communication Skills", description: "Clear, effective communication" },
  { key: "reliability_score", label: "Reliability & Follow-Through", description: "Delivers on commitments" },
  { key: "problem_solving_score", label: "Problem-Solving", description: "Analytical thinking and solutions" },
  { key: "teamwork_score", label: "Teamwork & Collaboration", description: "Works well with others" },
  { key: "initiative_score", label: "Initiative & Ownership", description: "Takes action without being asked", hasNA: true }
];

const strengthTags = [
  { id: "reliable", label: "🎯 Reliable" },
  { id: "creative", label: "💡 Creative Thinker" },
  { id: "team_player", label: "🤝 Team Player" },
  { id: "detail_oriented", label: "📊 Detail-Oriented" },
  { id: "high_energy", label: "🔥 High Energy" },
  { id: "calm_pressure", label: "🧘 Calm Under Pressure" },
  { id: "great_communicator", label: "📣 Great Communicator" },
  { id: "quick_learner", label: "🎓 Quick Learner" },
  { id: "natural_leader", label: "🌟 Natural Leader" },
  { id: "problem_solver", label: "🛠️ Problem Solver" }
];

const workAgainOptions = [
  { value: 1, emoji: "😬", label: "Prefer not" },
  { value: 2, emoji: "😐", label: "Maybe" },
  { value: 3, emoji: "🙂", label: "Sure" },
  { value: 4, emoji: "😊", label: "Gladly" },
  { value: 5, emoji: "🤩", label: "Absolutely!" }
];

export default function ReviewFormNew({ 
  colleague, 
  interactionType,
  onBack,
  onSubmit,
  isSubmitting
}) {
  const [scores, setScores] = useState({
    communication_score: 5,
    reliability_score: 5,
    problem_solving_score: 5,
    teamwork_score: 5,
    initiative_score: 5
  });
  
  const [initiativeNA, setInitiativeNA] = useState(false);
  const [selectedTags, setSelectedTags] = useState([]);
  const [workAgain, setWorkAgain] = useState(null);
  const [comment, setComment] = useState('');

  const handleScoreChange = (key, value) => {
    setScores(prev => ({ ...prev, [key]: value }));
  };

  const handleTagClick = (tagId) => {
    if (selectedTags.includes(tagId)) {
      setSelectedTags(selectedTags.filter(t => t !== tagId));
    } else if (selectedTags.length < 3) {
      setSelectedTags([...selectedTags, tagId]);
    }
  };

  const handleSubmit = () => {
    onSubmit({
      ...scores,
      initiative_na: initiativeNA,
      strength_tags: selectedTags,
      would_work_again: workAgain,
      optional_comment: comment.trim() || null
    });
  };

  const isValid = workAgain !== null; // Only "would work again" is required

  return (
    <Card className="p-8 border-0 shadow-xl shadow-gray-200/50">
      {/* Profile Header */}
      <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl mb-8">
        <img 
          src={colleague.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(colleague.name)}&background=0A66C2&color=fff&size=56`}
          alt={colleague.name}
          className="w-14 h-14 rounded-full object-cover"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(colleague.name)}&background=0A66C2&color=fff&size=56`;
          }}
        />
        <div>
          <h2 className="font-semibold text-gray-900">{colleague.name}</h2>
          <p className="text-sm text-gray-500">{colleague.job_title}</p>
          <span className="inline-block mt-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
            {interactionType === 'peer' ? 'Direct Colleague' : 
             interactionType === 'manager' ? 'They Were My Manager' :
             interactionType === 'direct_report' ? 'They Reported to Me' :
             interactionType === 'cross_team' ? 'Cross-Team Collaboration' : 'Other Professional'}
          </span>
        </div>
      </div>

      {/* SECTION 1: Core Skills */}
      <div className="mb-10">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">
          Rate {colleague.name.split(' ')[0]}'s Professional Skills
        </h3>
        <p className="text-sm text-gray-500 mb-6">Drag sliders or tap to rate</p>

        <div className="space-y-6">
          {coreSkills.map((skill) => (
            <div key={skill.key}>
              <div className="flex justify-between items-center mb-2">
                <div>
                  <p className="font-medium text-gray-900">{skill.label}</p>
                  <p className="text-sm text-gray-500">{skill.description}</p>
                </div>
                <div className="flex items-center gap-3">
                  {skill.hasNA && (
                    <label className="flex items-center gap-1 text-xs text-gray-500">
                      <Checkbox 
                        checked={initiativeNA}
                        onCheckedChange={setInitiativeNA}
                      />
                      Not Relevant
                    </label>
                  )}
                  <span className={`text-2xl font-bold ${getScoreColor(scores[skill.key])}`}>
                    {scores[skill.key]}
                  </span>
                </div>
              </div>
              <Slider
                value={[scores[skill.key]]}
                onValueChange={(value) => handleScoreChange(skill.key, value[0])}
                min={1}
                max={10}
                step={1}
                className="mb-1"
                disabled={skill.hasNA && initiativeNA}
              />
              <div className="flex justify-between text-xs text-gray-400">
                <span>1</span>
                <span>10</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-100 my-8"></div>

      {/* SECTION 2: Strength Tags */}
      <div className="mb-10">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">
          What stands out about {colleague.name.split(' ')[0]}?
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          Select up to 3 strengths <span className="text-amber-600">({selectedTags.length} selected)</span>
        </p>

        <div className="flex flex-wrap gap-2">
          {strengthTags.map((tag) => (
            <button
              key={tag.id}
              onClick={() => handleTagClick(tag.id)}
              className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                selectedTags.includes(tag.id)
                  ? 'bg-blue-50 border-blue-400'
                  : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
              }`}
            >
              {tag.label}
            </button>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-100 my-8"></div>

      {/* SECTION 3: Would Work Again */}
      <div className="mb-10">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">
          Would you want to work with {colleague.name.split(' ')[0]} again?
        </h3>
        <p className="text-sm text-gray-500 mb-4">Be honest - this stays anonymous</p>

        <div className="grid grid-cols-5 gap-2">
          {workAgainOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setWorkAgain(option.value)}
              className={`p-3 rounded-xl border-2 text-center transition-all ${
                workAgain === option.value
                  ? 'bg-amber-50 border-amber-400'
                  : 'border-gray-200 hover:border-amber-300'
              }`}
            >
              <div className="text-2xl mb-1">{option.emoji}</div>
              <div className="text-xs text-gray-600">{option.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-100 my-8"></div>

      {/* SECTION 4: Optional Comment */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold text-gray-900">Anything else?</h3>
          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">Optional</span>
        </div>
        <p className="text-sm text-gray-500 mb-3">
          One sentence that captures working with {colleague.name.split(' ')[0]}
        </p>
        <Textarea
          placeholder="e.g., 'Always the first to help when deadlines get tight'"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="resize-none focus:ring-2 focus:ring-amber-200 focus:border-amber-400"
          rows={2}
        />
        <p className="text-xs text-gray-400 mt-2">💡 Great reviews include specific examples</p>
      </div>

      {/* Submit Buttons */}
      <div className="flex gap-3">
        <Button 
          variant="outline" 
          className="flex-1 h-12 px-6 rounded-xl font-medium"
          onClick={onBack}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button 
          className="flex-[2] bg-[#0A66C2] hover:bg-[#004182] h-12 rounded-xl font-medium text-white"
          onClick={handleSubmit}
          disabled={isSubmitting || !isValid}
        >
          Submit Review
          <Send className="w-4 h-4 ml-2" />
        </Button>
      </div>

      {/* Time estimate */}
      <p className="text-center text-xs text-gray-400 mt-4">
        ⏱️ Takes about 90 seconds
      </p>
    </Card>
  );
}
