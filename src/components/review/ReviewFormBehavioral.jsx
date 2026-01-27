import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeft, Send, Sparkles, Trophy, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { behavioralConfig, getStrengthTags } from "@/config/behavioralConfig";

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
  const [selectedTags, setSelectedTags] = useState([]);
  const [showTags, setShowTags] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  
  const startTimeRef = useRef(Date.now());
  const strengthTags = getStrengthTags();
  const firstName = colleague?.name?.split(' ')[0] || 'this person';
  
  const totalSteps = QUICK_QUESTIONS.length + 1; // +1 for tags
  const progress = showTags 
    ? 100 
    : Math.round(((currentQuestion + 1) / totalSteps) * 100);
  
  const formatQuestion = (text) => text.replace(/{name}/g, firstName);
  
  const handleAnswer = (questionId, value) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
    
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
    
    setTimeout(() => {
      onSubmit({
        behavioral_answers,
        high_signal_answers,
        strength_tags: selectedTags,
        time_spent_seconds: timeSpent,
        review_version: 2
      });
    }, 500);
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
            className="absolute left-0 top-0 h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full"
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
              {showTags ? 'Final step' : `${currentQuestion + 1}/${QUICK_QUESTIONS.length}`}
            </span>
          </div>
        </div>
      </div>
      
      <AnimatePresence mode="wait">
        {!showTags ? (
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
            
            {/* Skip option */}
            <button
              onClick={() => handleAnswer(currentQ.id, null)}
              className="w-full mt-4 py-2 text-sm text-gray-400 hover:text-gray-600 transition-colors"
            >
              🤷 Can't say / Skip this one
            </button>
          </motion.div>
        ) : (
          /* Tags Selection */
          <motion.div
            key="tags"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
          >
            <div className="text-center mb-6">
              <Trophy className="w-10 h-10 text-amber-500 mx-auto mb-2" />
              <h2 className="text-xl font-semibold text-gray-900">Almost done!</h2>
              <p className="text-gray-500 text-sm">Pick up to 3 superpowers for {firstName}</p>
            </div>
            
            <div className="flex flex-wrap gap-2 justify-center mb-6">
              {strengthTags.slice(0, 9).map((tag) => {
                const isSelected = selectedTags.includes(tag.id);
                const isDisabled = !isSelected && selectedTags.length >= 3;
                
                return (
                  <motion.button
                    key={tag.id}
                    whileHover={{ scale: isDisabled ? 1 : 1.05 }}
                    whileTap={{ scale: isDisabled ? 1 : 0.95 }}
                    onClick={() => !isDisabled && handleTagToggle(tag.id)}
                    disabled={isDisabled}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-sm transition-all ${
                      isSelected
                        ? 'bg-amber-500 text-white shadow-md'
                        : isDisabled
                          ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                          : 'bg-gray-100 text-gray-700 hover:bg-amber-100'
                    }`}
                  >
                    <span>{tag.icon}</span>
                    <span className="font-medium">{tag.label}</span>
                  </motion.button>
                );
              })}
            </div>
            
            <p className="text-center text-sm text-gray-500 mb-4">
              {selectedTags.length}/3 selected
            </p>
            
            <Button
              onClick={handleSubmit}
              disabled={selectedTags.length === 0 || isSubmitting}
              className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-6 text-lg rounded-xl shadow-lg"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 animate-spin" />
                  Submitting...
                </span>
              ) : (
                <span className="flex items-center gap-2">
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
