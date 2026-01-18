import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Send, Sparkles } from 'lucide-react';
import { reviewConfig, getSlidersForRelationship, getTagsForRelationship } from "@/config/reviewConfig";

const getScoreColor = (score) => {
  if (score <= 3) return 'text-red-500';
  if (score <= 6) return 'text-amber-500';
  return 'text-green-500';
};

export default function ReviewFormDynamic({ 
  colleague, 
  interactionType,
  onBack,
  onSubmit,
  isSubmitting
}) {
  const relationshipConfig = reviewConfig.relationshipTypes[interactionType];
  const sliders = getSlidersForRelationship(interactionType);
  const tags = getTagsForRelationship(interactionType);
  
  // Initialize scores with default value of 5
  const initialScores = {};
  sliders.forEach(slider => {
    initialScores[slider.key] = 5;
  });
  
  const [scores, setScores] = useState(initialScores);
  const [optionalSkipped, setOptionalSkipped] = useState({});
  const [selectedTags, setSelectedTags] = useState([]);
  const [workAgain, setWorkAgain] = useState(null);
  const [wouldPromote, setWouldPromote] = useState(null);
  const [comment, setComment] = useState('');
  const [polishedComment, setPolishedComment] = useState('');
  const [isPolishing, setIsPolishing] = useState(false);
  const [showPolishSuggestion, setShowPolishSuggestion] = useState(false);

  const handleScoreChange = (key, value) => {
    setScores(prev => ({ ...prev, [key]: value }));
  };

  const handleOptionalSkip = (key, checked) => {
    setOptionalSkipped(prev => ({ ...prev, [key]: checked }));
    if (checked) {
      setScores(prev => ({ ...prev, [key]: null }));
    } else {
      setScores(prev => ({ ...prev, [key]: 5 }));
    }
  };

  const handleTagClick = (tagId) => {
    if (selectedTags.includes(tagId)) {
      setSelectedTags(selectedTags.filter(t => t !== tagId));
    } else if (selectedTags.length < relationshipConfig.maxTags) {
      setSelectedTags([...selectedTags, tagId]);
    }
  };

  const handleSubmit = () => {
    // Build the review data object
    const reviewData = {
      scores,
      strength_tags: selectedTags,
      would_work_again: workAgain,
      optional_comment: comment.trim() || null
    };

    if (relationshipConfig.showWouldPromote && wouldPromote) {
      reviewData.would_promote = wouldPromote;
    }

    onSubmit(reviewData);
  };

  const isValid = relationshipConfig.showWorkAgain ? workAgain !== null : 
                  relationshipConfig.showLimitedWorkAgain ? workAgain !== null : true;

  const workAgainOptions = relationshipConfig.showLimitedWorkAgain 
    ? reviewConfig.workAgainOptions.limited 
    : reviewConfig.workAgainOptions.standard;

  return (
    <Card className="p-8 border-0 shadow-xl shadow-gray-200/50">
      {/* Profile Header */}
      <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl mb-8">
        <img 
          src={colleague.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(colleague.name)}&background=0A66C2&color=fff&size=80`}
          alt={colleague.name}
          className="w-20 h-20 rounded-full object-cover"
        />
        <div>
          <h2 className="font-semibold text-gray-900">{colleague.name}</h2>
          <p className="text-sm text-gray-500">{colleague.job_title}</p>
          <span className="inline-block mt-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
            {relationshipConfig.label}
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
          {sliders.map((slider) => (
            <div key={slider.key}>
              <div className="flex justify-between items-center mb-2">
                <div>
                  <p className="font-medium text-gray-900">{slider.label}</p>
                  <p className="text-sm text-gray-500">{slider.description}</p>
                </div>
                <div className="flex items-center gap-3">
                  {slider.optional && (
                    <label className="flex items-center gap-1 text-xs text-gray-500">
                      <Checkbox 
                        checked={optionalSkipped[slider.key] || false}
                        onCheckedChange={(checked) => handleOptionalSkip(slider.key, checked)}
                      />
                      Not Relevant
                    </label>
                  )}
                  <span className={`text-2xl font-bold ${getScoreColor(scores[slider.key] || 5)}`}>
                    {scores[slider.key] !== null ? scores[slider.key] : '-'}
                  </span>
                </div>
              </div>
              {!optionalSkipped[slider.key] && (
                <>
                  <Slider
                    value={[scores[slider.key] || 5]}
                    onValueChange={(value) => handleScoreChange(slider.key, value[0])}
                    min={1}
                    max={10}
                    step={1}
                    className="mb-1"
                  />
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>1</span>
                    <span>10</span>
                  </div>
                </>
              )}
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
          Select up to {relationshipConfig.maxTags} strengths <span className="text-amber-600">({selectedTags.length} selected)</span>
        </p>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {tags.map((tag) => (
            <button
              key={tag.id}
              onClick={() => handleTagClick(tag.id)}
              className={`px-4 py-2.5 rounded-lg border-2 text-sm font-medium transition-all ${
                selectedTags.includes(tag.id)
                  ? 'bg-blue-50 border-blue-400'
                  : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
              }`}
            >
              {tag.emoji} {tag.label}
            </button>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-100 my-8"></div>

      {/* SECTION 3: Would Work Again */}
      {(relationshipConfig.showWorkAgain || relationshipConfig.showLimitedWorkAgain) && (
        <>
          <div className="mb-10">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {relationshipConfig.showLimitedWorkAgain 
                ? `Based on your limited interaction, would you want to work more closely with ${colleague.name.split(' ')[0]}?`
                : `Would you want to work with ${colleague.name.split(' ')[0]} again?`
              }
            </h3>
            <p className="text-sm text-gray-500 mb-4">Be honest - this stays anonymous</p>

            <div className={`grid gap-2 ${workAgainOptions.length === 5 ? 'grid-cols-5' : 'grid-cols-4'}`}>
              {workAgainOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setWorkAgain(option.value)}
                  className={`p-3 rounded-xl border-2 text-center transition-all ${
                    workAgain === option.value
                      ? 'bg-blue-50 border-blue-400'
                      : 'border-gray-200 hover:border-blue-300'
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
        </>
      )}

      {/* SECTION 4: Would Promote (only for direct reports) */}
      {relationshipConfig.showWouldPromote && (
        <>
          <div className="mb-10">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              Would you recommend {colleague.name.split(' ')[0]} for a more senior role?
            </h3>
            <p className="text-sm text-gray-500 mb-4">This helps assess their growth potential</p>

            <div className="space-y-2">
              {reviewConfig.wouldPromoteOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setWouldPromote(option.value)}
                  className={`w-full p-3 rounded-lg border-2 text-left transition-all ${
                    wouldPromote === option.value
                      ? 'bg-blue-50 border-blue-400'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <span className="text-sm font-medium">{option.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-100 my-8"></div>
        </>
      )}

      {/* SECTION 5: Optional Comment */}
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
          onChange={(e) => {
            setComment(e.target.value);
            setShowPolishSuggestion(false);
            setPolishedComment('');
          }}
          className="resize-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
          rows={2}
          maxLength={200}
        />
        
        {/* Polish Button - Below textarea */}
        {comment.length > 10 && !showPolishSuggestion && (
          <button
            onClick={async () => {
              setIsPolishing(true);
              try {
                const apiUrl = import.meta.env.VITE_API_URL || 'https://estimate-mio1.onrender.com';
                const response = await fetch(`${apiUrl}/api/review/polish-comment`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ comment })
                });
                const data = await response.json();
                if (data.success && data.polished !== comment) {
                  setPolishedComment(data.polished);
                  setShowPolishSuggestion(true);
                }
              } catch (error) {
                console.error('Polish error:', error);
              } finally {
                setIsPolishing(false);
              }
            }}
            disabled={isPolishing}
            className="mt-2 flex items-center gap-1 px-3 py-1.5 text-xs text-blue-600 hover:text-blue-700 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 transition-colors disabled:opacity-50"
          >
            <Sparkles className="w-3 h-3" />
            {isPolishing ? 'Polishing...' : 'Polish with AI'}
          </button>
        )}
        
        {/* Polish Suggestion */}
        {showPolishSuggestion && polishedComment && (
          <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-xs font-medium text-blue-900 mb-1">Polished version:</p>
                <p className="text-sm text-gray-800">{polishedComment}</p>
              </div>
            </div>
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => {
                  setComment(polishedComment);
                  setShowPolishSuggestion(false);
                  setPolishedComment('');
                }}
                className="flex-1 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
              >
                Use this version
              </button>
              <button
                onClick={() => {
                  setShowPolishSuggestion(false);
                  setPolishedComment('');
                }}
                className="flex-1 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-md transition-colors"
              >
                Keep original
              </button>
            </div>
          </div>
        )}
        
        <div className="flex justify-between items-center mt-2">
          <p className="text-xs text-gray-400">💡 Great reviews include specific examples</p>
          <p className="text-xs text-gray-400">{comment.length}/200</p>
        </div>
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
        ⏱️ Takes about {sliders.length <= 3 ? '60' : '90'} seconds
      </p>
    </Card>
  );
}
