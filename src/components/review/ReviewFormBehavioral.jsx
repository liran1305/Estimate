import React, { useState, useEffect, useRef } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Send, AlertTriangle, Clock, ChevronRight } from 'lucide-react';
import { 
  behavioralConfig, 
  getBehavioralQuestions, 
  getHighSignalQuestions,
  getStrengthTags 
} from "@/config/behavioralConfig";

export default function ReviewFormBehavioral({ 
  colleague, 
  interactionType,
  onBack,
  onSubmit,
  isSubmitting
}) {
  // State for behavioral answers (dimension questions)
  const [behavioralAnswers, setBehavioralAnswers] = useState({});
  const [skippedQuestions, setSkippedQuestions] = useState({});
  
  // State for high-signal questions
  const [highSignalAnswers, setHighSignalAnswers] = useState({});
  
  // State for strength tags
  const [selectedTags, setSelectedTags] = useState([]);
  
  // State for free-text
  const [neverWorryAbout, setNeverWorryAbout] = useState('');
  
  // UI state
  const [currentStep, setCurrentStep] = useState(0); // 0: behavioral, 1: high-signal, 2: tags, 3: free-text
  const [showTimeWarning, setShowTimeWarning] = useState(false);
  const [hasAcknowledgedWarning, setHasAcknowledgedWarning] = useState(false);
  
  // Time tracking
  const startTimeRef = useRef(Date.now());
  const [timeSpent, setTimeSpent] = useState(0);
  
  const behavioralQuestions = getBehavioralQuestions();
  const highSignalQuestions = getHighSignalQuestions();
  const strengthTags = getStrengthTags();
  
  // Track time spent
  useEffect(() => {
    startTimeRef.current = Date.now();
    const interval = setInterval(() => {
      setTimeSpent(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, []);
  
  // Replace {name} placeholder in questions
  const formatQuestion = (text) => {
    const firstName = colleague?.name?.split(' ')[0] || 'this person';
    return text.replace(/{name}/g, firstName);
  };
  
  // Handle behavioral question answer
  const handleBehavioralAnswer = (questionKey, value) => {
    setBehavioralAnswers(prev => ({
      ...prev,
      [questionKey]: value
    }));
    // Remove from skipped if it was skipped
    if (skippedQuestions[questionKey]) {
      setSkippedQuestions(prev => {
        const next = { ...prev };
        delete next[questionKey];
        return next;
      });
    }
  };
  
  // Handle skip for optional questions
  const handleSkipQuestion = (questionKey) => {
    setSkippedQuestions(prev => ({
      ...prev,
      [questionKey]: true
    }));
    setBehavioralAnswers(prev => {
      const next = { ...prev };
      delete next[questionKey];
      return next;
    });
  };
  
  // Handle high-signal question answer
  const handleHighSignalAnswer = (questionKey, value) => {
    setHighSignalAnswers(prev => ({
      ...prev,
      [questionKey]: value
    }));
  };
  
  // Handle tag selection
  const handleTagToggle = (tagId) => {
    setSelectedTags(prev => {
      if (prev.includes(tagId)) {
        return prev.filter(t => t !== tagId);
      }
      if (prev.length >= behavioralConfig.maxTags) {
        return prev;
      }
      return [...prev, tagId];
    });
  };
  
  // Check if current step is complete
  const isStepComplete = (step) => {
    switch (step) {
      case 0: // Behavioral questions
        const requiredQuestions = behavioralQuestions.filter(q => !q.optional);
        return requiredQuestions.every(q => 
          behavioralAnswers[q.dimension] !== undefined || skippedQuestions[q.dimension]
        );
      case 1: // High-signal questions
        return Object.keys(highSignalAnswers).length >= 3; // All 3 required
      case 2: // Tags
        return selectedTags.length >= 1; // At least 1 tag
      case 3: // Free-text (optional)
        return true;
      default:
        return false;
    }
  };
  
  // Check if form is ready to submit
  const canSubmit = () => {
    return isStepComplete(0) && isStepComplete(1) && isStepComplete(2);
  };
  
  // Handle form submission
  const handleSubmit = () => {
    // Check for suspiciously fast completion
    if (timeSpent < 30 && !hasAcknowledgedWarning) {
      setShowTimeWarning(true);
      return;
    }
    
    const reviewData = {
      behavioral_answers: behavioralAnswers,
      high_signal_answers: highSignalAnswers,
      strength_tags: selectedTags,
      never_worry_about: neverWorryAbout.trim() || null,
      time_spent_seconds: timeSpent,
      review_version: 2 // New behavioral system
    };
    
    onSubmit(reviewData);
  };
  
  // Progress indicator
  const steps = [
    { label: 'Skills', count: behavioralQuestions.length },
    { label: 'Key Questions', count: highSignalQuestions.length },
    { label: 'Strengths', count: `${selectedTags.length}/${behavioralConfig.maxTags}` },
    { label: 'Final', count: '✓' }
  ];
  
  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button 
          onClick={onBack}
          className="flex items-center text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back
        </button>
        
        <div className="flex items-center gap-4 mb-4">
          {colleague?.photo_url ? (
            <img 
              src={colleague.photo_url} 
              alt={colleague.name}
              className="w-16 h-16 rounded-full object-cover"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white text-xl font-bold">
              {colleague?.name?.charAt(0) || '?'}
            </div>
          )}
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{colleague?.name}</h2>
            <p className="text-gray-500">{colleague?.job_title} at {colleague?.company}</p>
          </div>
        </div>
        
        {/* Progress Steps */}
        <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
          {steps.map((step, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentStep(idx)}
              className={`flex flex-col items-center px-3 py-1 rounded-lg transition-colors ${
                currentStep === idx 
                  ? 'bg-white shadow-sm' 
                  : isStepComplete(idx) 
                    ? 'text-green-600' 
                    : 'text-gray-400'
              }`}
            >
              <span className="text-xs font-medium">{step.label}</span>
              <span className={`text-sm ${currentStep === idx ? 'text-amber-600 font-semibold' : ''}`}>
                {step.count}
              </span>
            </button>
          ))}
        </div>
      </div>
      
      {/* Step 0: Behavioral Questions */}
      {currentStep === 0 && (
        <div className="space-y-6">
          <div className="text-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Skills That Matter Now</h3>
            <p className="text-sm text-gray-500">What separates people who thrive from those who struggle</p>
          </div>
          
          {behavioralQuestions.map((question, idx) => {
            const dimension = behavioralConfig.dimensions[question.dimension];
            const isAnswered = behavioralAnswers[question.dimension] !== undefined;
            const isSkipped = skippedQuestions[question.dimension];
            
            return (
              <Card key={question.dimension} className={`p-5 transition-all ${
                isAnswered ? 'border-green-200 bg-green-50/30' : 
                isSkipped ? 'border-gray-200 bg-gray-50/50 opacity-60' : ''
              }`}>
                <div className="flex items-start gap-3 mb-4">
                  <span className="text-2xl">{dimension.icon}</span>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{dimension.name}</h4>
                    <p className="text-sm text-gray-500">{dimension.description}</p>
                  </div>
                </div>
                
                <p className="text-gray-700 mb-4 font-medium">
                  {formatQuestion(question.question)}
                </p>
                
                <div className="space-y-2">
                  {question.options.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleBehavioralAnswer(question.dimension, option.value)}
                      className={`w-full text-left px-4 py-3 rounded-lg border transition-all ${
                        behavioralAnswers[question.dimension] === option.value
                          ? 'border-green-500 bg-green-50 text-green-800'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
                
                {question.optional && (
                  <button
                    onClick={() => handleSkipQuestion(question.dimension)}
                    className={`mt-3 text-sm ${
                      isSkipped ? 'text-amber-600 font-medium' : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    {question.skipLabel || "Skip this question"}
                  </button>
                )}
              </Card>
            );
          })}
          
          <Button
            onClick={() => setCurrentStep(1)}
            disabled={!isStepComplete(0)}
            className="w-full bg-amber-500 hover:bg-amber-600 text-white"
          >
            Continue to Key Questions
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      )}
      
      {/* Step 1: High-Signal Questions */}
      {currentStep === 1 && (
        <div className="space-y-6">
          <div className="text-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900">The Questions That Actually Matter</h3>
            <p className="text-sm text-gray-500">These tell us more than any skill rating</p>
          </div>
          
          {highSignalQuestions.map((question) => (
            <Card key={question.key} className={`p-5 transition-all ${
              highSignalAnswers[question.key] !== undefined ? 'border-green-200 bg-green-50/30' : ''
            }`}>
              <p className="text-gray-700 mb-4 font-medium text-lg">
                {formatQuestion(question.question)}
              </p>
              
              <div className="flex flex-wrap gap-2">
                {question.options.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleHighSignalAnswer(question.key, option.value)}
                    className={`flex items-center gap-2 px-4 py-3 rounded-lg border transition-all ${
                      highSignalAnswers[question.key] === option.value
                        ? 'border-green-500 bg-green-50 text-green-800'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <span className="text-xl">{option.emoji}</span>
                    <span>{option.label}</span>
                  </button>
                ))}
              </div>
            </Card>
          ))}
          
          <div className="flex gap-3">
            <Button
              onClick={() => setCurrentStep(0)}
              variant="outline"
              className="flex-1"
            >
              Back
            </Button>
            <Button
              onClick={() => setCurrentStep(2)}
              disabled={!isStepComplete(1)}
              className="flex-1 bg-amber-500 hover:bg-amber-600 text-white"
            >
              Continue to Strengths
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      )}
      
      {/* Step 2: Strength Tags */}
      {currentStep === 2 && (
        <div className="space-y-6">
          <div className="text-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900">What Stands Out Most?</h3>
            <p className="text-sm text-gray-500">
              Select up to {behavioralConfig.maxTags} strengths that best describe {colleague?.name?.split(' ')[0]}
            </p>
          </div>
          
          <Card className="p-5">
            <div className="flex flex-wrap gap-3">
              {strengthTags.map((tag) => {
                const isSelected = selectedTags.includes(tag.id);
                const isDisabled = !isSelected && selectedTags.length >= behavioralConfig.maxTags;
                
                return (
                  <button
                    key={tag.id}
                    onClick={() => handleTagToggle(tag.id)}
                    disabled={isDisabled}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-full border-2 transition-all ${
                      isSelected
                        ? 'border-amber-500 bg-amber-50 text-amber-800'
                        : isDisabled
                          ? 'border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed'
                          : 'border-gray-200 hover:border-amber-300 hover:bg-amber-50/50'
                    }`}
                  >
                    <span className="text-lg">{tag.icon}</span>
                    <span className="font-medium">{tag.label}</span>
                  </button>
                );
              })}
            </div>
            
            <p className="mt-4 text-center text-sm text-gray-500">
              {selectedTags.length} of {behavioralConfig.maxTags} selected
            </p>
          </Card>
          
          <div className="flex gap-3">
            <Button
              onClick={() => setCurrentStep(1)}
              variant="outline"
              className="flex-1"
            >
              Back
            </Button>
            <Button
              onClick={() => setCurrentStep(3)}
              disabled={!isStepComplete(2)}
              className="flex-1 bg-amber-500 hover:bg-amber-600 text-white"
            >
              Almost Done
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      )}
      
      {/* Step 3: Free-text & Submit */}
      {currentStep === 3 && (
        <div className="space-y-6">
          <div className="text-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900">One Last Thing (Optional)</h3>
            <p className="text-sm text-gray-500">This helps paint a fuller picture</p>
          </div>
          
          <Card className="p-5">
            <label className="block text-gray-700 font-medium mb-3">
              {formatQuestion(behavioralConfig.freeTextQuestion.prompt)}
            </label>
            <Textarea
              value={neverWorryAbout}
              onChange={(e) => setNeverWorryAbout(e.target.value)}
              placeholder={behavioralConfig.freeTextQuestion.placeholder}
              maxLength={behavioralConfig.freeTextQuestion.maxLength}
              className="w-full"
              rows={2}
            />
            <p className="mt-2 text-xs text-gray-400 text-right">
              {neverWorryAbout.length}/{behavioralConfig.freeTextQuestion.maxLength}
            </p>
          </Card>
          
          {/* Time Warning */}
          {showTimeWarning && !hasAcknowledgedWarning && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-amber-800 font-medium">That was quick!</p>
                <p className="text-amber-700 text-sm mt-1">
                  You completed this review in {timeSpent} seconds. Please make sure your answers 
                  reflect your genuine experience working with {colleague?.name?.split(' ')[0]}.
                </p>
                <Button
                  onClick={() => setHasAcknowledgedWarning(true)}
                  size="sm"
                  className="mt-3 bg-amber-500 hover:bg-amber-600 text-white"
                >
                  I understand, submit anyway
                </Button>
              </div>
            </div>
          )}
          
          {/* Summary */}
          <Card className="p-5 bg-gray-50">
            <h4 className="font-semibold text-gray-900 mb-3">Review Summary</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Skill assessments:</span>
                <span className="text-gray-900">{Object.keys(behavioralAnswers).length} answered</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Key questions:</span>
                <span className="text-gray-900">{Object.keys(highSignalAnswers).length}/3</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Strengths selected:</span>
                <span className="text-gray-900">{selectedTags.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Time spent:</span>
                <span className="text-gray-900 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {Math.floor(timeSpent / 60)}:{(timeSpent % 60).toString().padStart(2, '0')}
                </span>
              </div>
            </div>
          </Card>
          
          <div className="flex gap-3">
            <Button
              onClick={() => setCurrentStep(2)}
              variant="outline"
              className="flex-1"
            >
              Back
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!canSubmit() || isSubmitting}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
            >
              {isSubmitting ? (
                <>Submitting...</>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Submit Review
                </>
              )}
            </Button>
          </div>
          
          <p className="text-center text-xs text-gray-400">
            Your review is completely anonymous. {colleague?.name?.split(' ')[0]} will never know who wrote it.
          </p>
        </div>
      )}
    </div>
  );
}
