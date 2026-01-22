import React, { useState, useEffect, useRef } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ArrowLeft, Send, Sparkles, AlertTriangle, Clock, HelpCircle } from 'lucide-react';
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
  const [skippedQuestions, setSkippedQuestions] = useState({});
  const [selectedTags, setSelectedTags] = useState([]);
  const [workAgain, setWorkAgain] = useState(null);
  const [wouldPromote, setWouldPromote] = useState(null);
  const [comment, setComment] = useState('');
  const [polishedComment, setPolishedComment] = useState('');
  const [isPolishing, setIsPolishing] = useState(false);
  const [showPolishSuggestion, setShowPolishSuggestion] = useState(false);
  
  // Abuse detection state
  const startTimeRef = useRef(Date.now());
  const [timeSpent, setTimeSpent] = useState(0);
  const [showTimeWarning, setShowTimeWarning] = useState(false);
  const [showPatternWarning, setShowPatternWarning] = useState(false);
  const [patternWarningMessage, setPatternWarningMessage] = useState('');
  const [hasAcknowledgedWarning, setHasAcknowledgedWarning] = useState(false);
  
  // Server-side fraud detection - no client-side tracking needed
  
  // Track time spent on review
  useEffect(() => {
    startTimeRef.current = Date.now();
    const interval = setInterval(() => {
      setTimeSpent(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, []);
  
  // Abuse detection functions
  const checkForPatterns = () => {
    const scoreValues = Object.values(scores).filter(s => s !== null && s !== undefined);
    
    // With 30% skip limit, at least 70% of questions must be answered
    // No need for minimum check - the skip limit enforces this
    
    // Check if all scores are identical
    const allIdentical = scoreValues.every(s => s === scoreValues[0]);
    if (allIdentical && scoreValues.length >= 3) {
      return {
        valid: false,
        blocked: true,
        message: `You rated all ${scoreValues.length} categories as ${scoreValues[0]}/10. Everyone has different strengths and weaknesses. Please rate each category individually.`
      };
    }
    
    // Check for all extreme scores (all 10s or all 1s)
    const allMax = scoreValues.every(s => s >= 9);
    const allMin = scoreValues.every(s => s <= 2);
    if ((allMax || allMin) && scoreValues.length >= 3) {
      return {
        valid: false,
        blocked: false,
        warning: true,
        message: allMax 
          ? "You've given very high scores across all categories. Are you sure this accurately reflects this person's skills?"
          : "You've given very low scores across all categories. Are you sure this accurately reflects this person's skills?"
      };
    }
    
    // Check for low variance (all scores within 1 point of each other)
    const min = Math.min(...scoreValues);
    const max = Math.max(...scoreValues);
    if (max - min <= 1 && scoreValues.length >= 4) {
      return {
        valid: false,
        blocked: false,
        warning: true,
        message: "Your ratings are very similar across all categories. Consider if there are areas where this person excels or could improve."
      };
    }
    
    return { valid: true };
  };

  const handleScoreChange = (key, value) => {
    setScores(prev => ({ ...prev, [key]: value }));
  };

  // Calculate max allowed skips (30% of total questions, minimum 1)
  const maxSkipsAllowed = Math.max(1, Math.floor(sliders.length * 0.3));
  const currentSkipCount = Object.values(skippedQuestions).filter(Boolean).length;
  const canSkipMore = currentSkipCount < maxSkipsAllowed;

  const handleSkipQuestion = (key, checked) => {
    // If trying to skip and already at max, don't allow
    if (checked && !canSkipMore) {
      return;
    }
    
    setSkippedQuestions(prev => ({ ...prev, [key]: checked }));
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
    const currentTimeSpent = Math.floor((Date.now() - startTimeRef.current) / 1000);
    
    // Client-side warnings only (server enforces blocking)
    if (currentTimeSpent < 15) {
      setShowTimeWarning(true);
      return;
    }
    
    // Pattern-based checks
    const patternCheck = checkForPatterns();
    if (!patternCheck.valid) {
      if (patternCheck.blocked) {
        // Blocking patterns - show as warning but don't allow submit
        setPatternWarningMessage(patternCheck.message);
        setShowPatternWarning(true);
        return;
      }
      if (patternCheck.warning && !hasAcknowledgedWarning) {
        setPatternWarningMessage(patternCheck.message);
        setShowPatternWarning(true);
        return;
      }
    }
    
    // Build the review data object
    const reviewData = {
      scores,
      strength_tags: selectedTags,
      would_work_again: workAgain,
      optional_comment: comment.trim() || null,
      time_spent_seconds: currentTimeSpent
    };

    if (relationshipConfig.showWouldPromote && wouldPromote) {
      reviewData.would_promote = wouldPromote;
    }

    onSubmit(reviewData);
  };
  
  const handleAcknowledgeWarning = () => {
    setHasAcknowledgedWarning(true);
    setShowPatternWarning(false);
  };

  const isValid = relationshipConfig.showWorkAgain ? workAgain !== null : 
                  relationshipConfig.showLimitedWorkAgain ? workAgain !== null : true;

  const workAgainOptions = relationshipConfig.showLimitedWorkAgain 
    ? reviewConfig.workAgainOptions.limited 
    : reviewConfig.workAgainOptions.standard;

  return (
    <TooltipProvider delayDuration={100}>
    <Card className="p-4 sm:p-8 border-0 shadow-xl shadow-gray-200/50">
      {/* Profile Header */}
      <div className="flex items-center gap-3 p-3 sm:p-4 bg-gray-50 rounded-xl mb-6 sm:mb-8">
        <img 
          src={colleague.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(colleague.name)}&background=0A66C2&color=fff&size=80`}
          alt={colleague.name}
          className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover flex-shrink-0"
        />
        <div className="min-w-0 flex-1">
          <h2 className="font-semibold text-gray-900 truncate">{colleague.name}</h2>
          <p className="text-sm text-gray-500 truncate">{colleague.job_title}</p>
          <span className="inline-block mt-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
            {relationshipConfig.label}
          </span>
        </div>
      </div>

      {/* SECTION 1: Core Skills */}
      <div className="mb-10">
        <div className="flex justify-between items-start mb-1">
          <h3 className="text-lg font-semibold text-gray-900">
            Rate {colleague.name.split(' ')[0]}'s Professional Skills
          </h3>
          {currentSkipCount > 0 && (
            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
              {currentSkipCount}/{maxSkipsAllowed} skipped
            </span>
          )}
        </div>
        <p className="text-sm text-gray-500 mb-6">
          Drag sliders or tap to rate
          {maxSkipsAllowed > 0 && <span className="text-gray-400"> • Can skip up to {maxSkipsAllowed}</span>}
        </p>

        <div className="space-y-6">
          {sliders.map((slider) => (
            <div key={slider.key} className={skippedQuestions[slider.key] ? 'opacity-60' : ''}>
              <div className="flex justify-between items-center mb-2">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{slider.label}</p>
                  <p className="text-sm text-gray-500">{slider.description}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-2xl font-bold ${skippedQuestions[slider.key] ? 'text-gray-400' : getScoreColor(scores[slider.key] || 5)}`}>
                    {skippedQuestions[slider.key] ? '-' : (scores[slider.key] !== null ? scores[slider.key] : '-')}
                  </span>
                </div>
              </div>
              {!skippedQuestions[slider.key] ? (
                <div className="py-2">
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
                </div>
              ) : (
                <div className="py-3 px-4 bg-gray-50 rounded-lg border border-gray-200 text-center">
                  <p className="text-sm text-gray-500">Skipped - won't affect their score</p>
                </div>
              )}
              {!canSkipMore && !skippedQuestions[slider.key] ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      disabled
                      className="mt-2 flex items-center gap-1.5 text-xs text-gray-300 cursor-not-allowed"
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                      Can't rate this
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="bg-gray-900 text-white">
                    <p>Skip limit reached ({maxSkipsAllowed} max)</p>
                  </TooltipContent>
                </Tooltip>
              ) : (
                <button
                  onClick={() => handleSkipQuestion(slider.key, !skippedQuestions[slider.key])}
                  className={`mt-2 py-2 min-h-[44px] flex items-center gap-1.5 text-sm transition-colors ${
                    skippedQuestions[slider.key] 
                      ? 'text-blue-600 hover:text-blue-700' 
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <HelpCircle className="w-4 h-4" />
                  {skippedQuestions[slider.key] ? 'I can rate this' : "Can't rate this"}
                </button>
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

        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <button
              key={tag.id}
              onClick={() => handleTagClick(tag.id)}
              className={`px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all flex items-center gap-2 ${
                selectedTags.includes(tag.id)
                  ? 'bg-blue-50 border-blue-400'
                  : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
              }`}
            >
              <span className="text-lg flex-shrink-0">{tag.emoji}</span>
              <span className="whitespace-nowrap">{tag.label}</span>
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

            <div className={`grid gap-2 ${workAgainOptions.length === 5 ? 'grid-cols-2 sm:grid-cols-5' : 'grid-cols-2 sm:grid-cols-4'}`}>
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
                  <div className="text-xs text-gray-600 break-words">{option.label}</div>
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
        
        {/* Polish Button - Below textarea - Always visible */}
        {!showPolishSuggestion && (
          <button
            onClick={async () => {
              if (comment.length <= 10) return;
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
            disabled={isPolishing || comment.length <= 10}
            className="mt-2 flex items-center gap-1 px-3 py-1.5 text-xs text-blue-600 hover:text-blue-700 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title={comment.length <= 10 ? 'Add more text to enable AI polish' : 'Polish your comment with AI'}
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
      
      {/* Time Warning Modal */}
      {showTimeWarning && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-4 sm:p-6 max-w-md w-full shadow-2xl mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full flex items-center justify-center bg-amber-100">
                <Clock className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Please take more time</h3>
              </div>
            </div>
            <p className="text-gray-600 mb-4">
              This review affects a real person's professional reputation. Please take at least 15 seconds to thoughtfully rate each category.
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Time spent: {timeSpent} seconds. Submit unlocks in {Math.max(0, 15 - timeSpent)} seconds.
            </p>
            <p className="text-xs text-amber-700 mb-4">
              Note: Repeated violations may result in temporary account restrictions.
            </p>
            <Button 
              className="w-full bg-amber-500 hover:bg-amber-600 text-white"
              onClick={() => setShowTimeWarning(false)}
            >
              I'll take more time
            </Button>
          </div>
        </div>
      )}
      
      {/* Pattern Warning Modal */}
      {showPatternWarning && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-4 sm:p-6 max-w-md w-full shadow-2xl mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                {checkForPatterns().blocked ? 'Action Required' : 'Review Pattern Detected'}
              </h3>
            </div>
            <p className="text-gray-600 mb-6">
              {patternWarningMessage}
            </p>
            <div className="flex gap-3">
              <Button 
                variant="outline"
                className={checkForPatterns().blocked ? "w-full" : "flex-1"}
                onClick={() => setShowPatternWarning(false)}
              >
                {checkForPatterns().blocked ? 'Go Back & Rate More' : 'Adjust Ratings'}
              </Button>
              {!checkForPatterns().blocked && (
                <Button 
                  className="flex-1 bg-gray-800 hover:bg-gray-900 text-white"
                  onClick={handleAcknowledgeWarning}
                >
                  Submit Anyway
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </Card>
    </TooltipProvider>
  );
}
