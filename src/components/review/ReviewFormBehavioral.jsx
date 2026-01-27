import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Send, Sparkles, Trophy, Check, Wand2, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { behavioralConfig, getStrengthTags } from "@/config/behavioralConfig";

const BACKEND_API_URL = import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:3001';

// Simplified questions - fewer, more impactful
const QUICK_QUESTIONS = [
  {
    id: 'work_again',
    question: 'Would you want to work with {name} again?',
    type: 'emoji',
    options: [
      { value: 1, emoji: '😬', label: 'Nope' },
      { value: 2, emoji: '😐', label: 'Maybe' },
      { value: 3, emoji: '🙂', label: 'Sure' },
      { value: 4, emoji: '😊', label: 'Gladly' },
      { value: 5, emoji: '🤩', label: 'Absolutely!' }
    ]
  },
  {
    id: 'learns_fast',
    question: 'How quickly does {name} pick up new things?',
    type: 'emoji',
    options: [
      { value: 1, emoji: '🐢', label: 'Slow' },
      { value: 2, emoji: '🚶', label: 'Average' },
      { value: 3, emoji: '🏃', label: 'Fast' },
      { value: 4, emoji: '🚀', label: 'Lightning' }
    ]
  },
  {
    id: 'owns_it',
    question: 'When things go wrong, {name}...',
    type: 'choice',
    options: [
      { value: 1, label: 'Points fingers' },
      { value: 2, label: 'Stays quiet' },
      { value: 3, label: 'Takes responsibility' },
      { value: 4, label: 'Fixes it & prevents it next time' }
    ]
  },
  {
    id: 'gets_buyin',
    question: 'Can {name} convince people without being their boss?',
    type: 'emoji',
    options: [
      { value: 1, emoji: '😅', label: 'Rarely' },
      { value: 2, emoji: '🤷', label: 'Sometimes' },
      { value: 3, emoji: '👍', label: 'Usually' },
      { value: 4, emoji: '🎯', label: 'Always' }
    ]
  },
  {
    id: 'startup_hire',
    question: 'If you started a company, would you hire {name}?',
    type: 'emoji',
    options: [
      { value: 1, emoji: '👎', label: 'No' },
      { value: 2, emoji: '🤔', label: 'Maybe' },
      { value: 3, emoji: '🚀', label: 'Yes!' }
    ]
  },
  {
    id: 'never_worry',
    question: 'With {name}, you never worry about...',
    type: 'choice',
    options: [
      { value: 'commitments', label: 'Dropping the ball on commitments' },
      { value: 'feedback', label: 'Getting defensive about feedback' },
      { value: 'cracks', label: 'Things slipping through the cracks' },
      { value: 'drama', label: 'Creating unnecessary drama' },
      { value: 'quality', label: 'Cutting corners on quality' }
    ]
  }
];

export default function ReviewFormBehavioral({ 
  colleague, 
  interactionType,
  onBack,
  onSubmit,
  isSubmitting
}) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [otherTexts, setOtherTexts] = useState({}); // For "Other" free text per question
  const [showOtherInput, setShowOtherInput] = useState(false);
  const [selectedTags, setSelectedTags] = useState([]);
  const [showTags, setShowTags] = useState(false);
  const [showFreeText, setShowFreeText] = useState(false);
  const [freeText, setFreeText] = useState('');
  const [roomToGrow, setRoomToGrow] = useState('');
  const [isPolishing, setIsPolishing] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  
  const startTimeRef = useRef(Date.now());
  const strengthTags = getStrengthTags();
  const firstName = colleague?.name?.split(' ')[0] || 'this person';
  
  // AI Grammar Polish
  const handlePolishText = async () => {
    if (!freeText.trim() || isPolishing) return;
    setIsPolishing(true);
    try {
      const res = await fetch(`${BACKEND_API_URL}/api/review/polish-comment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comment: freeText })
      });
      const data = await res.json();
      if (data.success && data.polished) {
        setFreeText(data.polished);
      }
    } catch (err) {
      console.error('Polish error:', err);
    }
    setIsPolishing(false);
  };
  
  const totalSteps = QUICK_QUESTIONS.length + 2; // +1 for tags, +1 for free text
  const progress = showFreeText 
    ? 100 
    : showTags 
      ? Math.round(((QUICK_QUESTIONS.length + 1) / totalSteps) * 100)
      : Math.round(((currentQuestion + 1) / totalSteps) * 100);
  
  const formatQuestion = (text) => text.replace(/{name}/g, firstName);
  
  const handleAnswer = (questionId, value) => {
    // If "other" is selected, show input instead of advancing
    if (value === 'other') {
      setShowOtherInput(true);
      setAnswers(prev => ({ ...prev, [questionId]: 'other' }));
      return;
    }
    
    setAnswers(prev => ({ ...prev, [questionId]: value }));
    setShowOtherInput(false);
    
    // Auto-advance after short delay
    setTimeout(() => {
      if (currentQuestion < QUICK_QUESTIONS.length - 1) {
        setCurrentQuestion(prev => prev + 1);
      } else {
        setShowTags(true);
      }
    }, 300);
  };
  
  const handleOtherSubmit = (questionId) => {
    if (!otherTexts[questionId]?.trim()) return;
    setShowOtherInput(false);
    
    // Auto-advance after short delay
    setTimeout(() => {
      if (currentQuestion < QUICK_QUESTIONS.length - 1) {
        setCurrentQuestion(prev => prev + 1);
      } else {
        setShowTags(true);
      }
    }, 300);
  };
  
  const handleTagToggle = (tagId) => {
    setSelectedTags(prev => {
      if (prev.includes(tagId)) return prev.filter(t => t !== tagId);
      if (prev.length >= 3) return prev;
      return [...prev, tagId];
    });
  };
  
  const handleSubmit = () => {
    const timeSpent = Math.floor((Date.now() - startTimeRef.current) / 1000);
    
    // Map answers to the expected format
    const behavioral_answers = {
      learns_fast: answers.learns_fast,
      owns_it: answers.owns_it,
      gets_buyin: answers.gets_buyin
    };
    
    const high_signal_answers = {
      work_again: answers.work_again,
      startup_hire: answers.startup_hire,
      harder_job: answers.startup_hire // Use startup as proxy
    };
    
    setShowConfetti(true);
    
    // Get the never_worry answer - map value to display text
    const neverWorryOption = QUICK_QUESTIONS.find(q => q.id === 'never_worry')?.options.find(o => o.value === answers.never_worry);
    const neverWorryText = neverWorryOption?.label || null;
    
    setTimeout(() => {
      onSubmit({
        behavioral_answers,
        high_signal_answers,
        strength_tags: selectedTags,
        optional_comment: freeText.trim() || null,
        never_worry_about: neverWorryText,
        room_to_grow: roomToGrow.trim() || null,
        other_answers: Object.keys(otherTexts).length > 0 ? otherTexts : null,
        time_spent_seconds: timeSpent,
        review_version: 2
      });
    }, 500);
  };
  
  const handleTagsContinue = () => {
    setShowTags(false);
    setShowFreeText(true);
  };
  
  const currentQ = QUICK_QUESTIONS[currentQuestion];
  
  return (
    <div className="max-w-lg mx-auto">
      {/* Confetti effect */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="text-6xl"
          >
            🎉
          </motion.div>
        </div>
      )}
      
      {/* Header with progress */}
      <div className="mb-8">
        <button 
          onClick={onBack}
          className="flex items-center text-gray-400 hover:text-gray-600 mb-4 text-sm"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back
        </button>
        
        {/* Progress bar */}
        <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden mb-4">
          <motion.div 
            className="absolute left-0 top-0 h-full bg-gradient-to-r from-[#4A9FD4] to-[#70B8E8] rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        
        {/* Colleague info - compact */}
        <div className="flex items-center gap-3">
          {colleague?.photo_url ? (
            <img 
              src={colleague.photo_url} 
              alt={colleague.name}
              className="w-12 h-12 rounded-full object-cover"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center text-white font-bold">
              {firstName.charAt(0)}
            </div>
          )}
          <div>
            <p className="font-medium text-gray-900">{colleague?.name}</p>
            <p className="text-sm text-gray-500">{colleague?.company}</p>
          </div>
          <div className="ml-auto text-right">
            <span className="text-xs text-gray-400">
              {showFreeText ? 'Final step' : showTags ? 'Strengths' : `${currentQuestion + 1}/${QUICK_QUESTIONS.length}`}
            </span>
          </div>
        </div>
      </div>
      
      <AnimatePresence mode="wait">
        {!showTags && !showFreeText ? (
          /* Question Card */
          <motion.div
            key={currentQuestion}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-6 text-center">
              {formatQuestion(currentQ.question)}
            </h2>
            
            <div className={`grid gap-3 ${currentQ.type === 'emoji' ? 'grid-cols-' + Math.min(currentQ.options.length, 5) : 'grid-cols-1'}`}>
              {currentQ.options.map((option) => (
                <motion.button
                  key={option.value}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleAnswer(currentQ.id, option.value)}
                  className={`relative p-4 rounded-xl border-2 transition-all ${
                    answers[currentQ.id] === option.value
                      ? 'border-amber-500 bg-amber-50'
                      : 'border-gray-200 hover:border-amber-300 hover:bg-amber-50/50'
                  } ${currentQ.type === 'emoji' ? 'flex flex-col items-center' : ''}`}
                >
                  {currentQ.type === 'emoji' && (
                    <span className="text-3xl mb-1">{option.emoji}</span>
                  )}
                  <span className={`font-medium ${
                    currentQ.type === 'emoji' ? 'text-xs text-gray-600' : 'text-gray-700'
                  }`}>
                    {option.label}
                  </span>
                  {answers[currentQ.id] === option.value && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center"
                    >
                      <Check className="w-4 h-4 text-white" />
                    </motion.div>
                  )}
                </motion.button>
              ))}
            </div>
            
            {/* Other option with free text - only for 'choice' type questions */}
            {currentQ.type === 'choice' && (
              showOtherInput && answers[currentQ.id] === 'other' ? (
                <div className="mt-4 space-y-2">
                  <input
                    type="text"
                    value={otherTexts[currentQ.id] || ''}
                    onChange={(e) => setOtherTexts(prev => ({ ...prev, [currentQ.id]: e.target.value }))}
                    placeholder="Type your answer..."
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 outline-none"
                    autoFocus
                  />
                  <button
                    onClick={() => handleOtherSubmit(currentQ.id)}
                    disabled={!otherTexts[currentQ.id]?.trim()}
                    className="w-full py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-200 disabled:text-gray-400 text-white rounded-lg font-medium transition-colors"
                  >
                    Continue
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => handleAnswer(currentQ.id, 'other')}
                  className="w-full mt-3 py-3 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg border border-dashed border-gray-200 transition-colors"
                >
                  ✏️ Other (type your own)
                </button>
              )
            )}
            
            {/* Skip option */}
            <button
              onClick={() => handleAnswer(currentQ.id, null)}
              className="w-full mt-2 py-2 text-sm text-gray-400 hover:text-gray-600 transition-colors"
            >
              🤷 Can't say / Skip this one
            </button>
          </motion.div>
        ) : showTags && !showFreeText ? (
          /* Tags Selection */
          <motion.div
            key="tags"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-lg p-6 shadow-sm border border-gray-200"
          >
            <div className="text-center mb-5">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-amber-100 rounded-lg mb-3">
                <Trophy className="w-6 h-6 text-amber-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Pick {firstName}'s superpowers</h2>
              <p className="text-gray-500 text-sm mt-1">Select up to 3 strengths</p>
            </div>
            
            <div className="grid grid-cols-1 gap-2 mb-5">
              {strengthTags.slice(0, 9).map((tag) => {
                const isSelected = selectedTags.includes(tag.id);
                const isDisabled = !isSelected && selectedTags.length >= 3;
                
                return (
                  <button
                    key={tag.id}
                    onClick={() => !isDisabled && handleTagToggle(tag.id)}
                    disabled={isDisabled}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg border text-left transition-all ${
                      isSelected
                        ? 'bg-amber-50 border-amber-500 text-amber-900'
                        : isDisabled
                          ? 'bg-gray-50 border-gray-100 text-gray-300 cursor-not-allowed'
                          : 'bg-white border-gray-200 text-gray-700 hover:border-amber-300 hover:bg-amber-50/50'
                    }`}
                  >
                    <span className="text-xl">{tag.icon}</span>
                    <span className="font-medium flex-1">{tag.label}</span>
                    {isSelected && (
                      <Check className="w-5 h-5 text-amber-600" />
                    )}
                  </button>
                );
              })}
            </div>
            
            <div className="flex items-center justify-between text-sm text-gray-500 mb-4 px-1">
              <span>{selectedTags.length}/3 selected</span>
              {selectedTags.length > 0 && (
                <button 
                  onClick={() => setSelectedTags([])}
                  className="text-gray-400 hover:text-gray-600"
                >
                  Clear all
                </button>
              )}
            </div>
            
            <Button
              onClick={handleTagsContinue}
              disabled={selectedTags.length === 0}
              className="w-full bg-amber-500 hover:bg-amber-600 text-white py-5 text-base rounded-lg"
            >
              Continue
            </Button>
          </motion.div>
        ) : (
          /* Free Text - Final Step */
          <motion.div
            key="freetext"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-lg p-6 shadow-sm border border-gray-200"
          >
            <div className="text-center mb-5">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mb-3">
                <MessageSquare className="w-6 h-6 text-green-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">The most valuable part!</h2>
              <p className="text-gray-500 text-sm mt-1">
                A few words about {firstName} can make a huge difference
              </p>
            </div>
            
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
              <p className="text-amber-800 text-sm">
                ⭐ <strong>This is the most important part.</strong> Recruiters and hiring managers value personal insights more than any score.
              </p>
            </div>
            
            <Textarea
              value={freeText}
              onChange={(e) => setFreeText(e.target.value)}
              placeholder={`What makes ${firstName} great to work with? Any specific example or story?`}
              className="w-full min-h-[120px] resize-none rounded-lg border-gray-200"
              maxLength={500}
            />
            
            <div className="flex items-center justify-between mt-2 mb-4">
              <span className="text-xs text-gray-400">{freeText.length}/500</span>
              <button
                onClick={handlePolishText}
                disabled={freeText.trim().length < 10 || isPolishing}
                className={`flex items-center gap-1.5 text-xs transition-colors ${
                  freeText.trim().length < 10 
                    ? 'text-gray-300 cursor-not-allowed' 
                    : 'text-blue-600 hover:text-blue-700'
                }`}
              >
                <Wand2 className={`w-3.5 h-3.5 ${isPolishing ? 'animate-spin' : ''}`} />
                {isPolishing ? 'Fixing...' : 'AI Grammar Fix'}
              </button>
            </div>
            
            {/* Room to Grow - Optional private feedback */}
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-medium text-gray-700">🌱 Room to Grow</span>
                <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Optional • Private</span>
              </div>
              <p className="text-xs text-gray-500 mb-2">
                Any constructive feedback? Only {firstName} will see this.
              </p>
              <Textarea
                value={roomToGrow}
                onChange={(e) => setRoomToGrow(e.target.value)}
                placeholder={`What could ${firstName} improve? (optional)`}
                className="w-full min-h-[60px] resize-none rounded-lg border-gray-200 text-sm"
                maxLength={300}
              />
              <span className="text-[10px] text-gray-400">{roomToGrow.length}/300</span>
            </div>
            
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-5 text-base rounded-lg"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <Sparkles className="w-5 h-5 animate-spin" />
                  Submitting...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <Send className="w-5 h-5" />
                  Submit Review
                </span>
              )}
            </Button>
            
            <p className="text-center text-xs text-gray-400 mt-4">
              🔒 100% anonymous - {firstName} will never know who wrote this
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
