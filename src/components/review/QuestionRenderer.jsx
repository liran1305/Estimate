import React from 'react';
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

/**
 * Mobile-responsive question renderer for V2 Question Framework
 * Handles all question types: emoji_scale, single_choice, free_text
 */
export default function QuestionRenderer({ question, value, onChange, colleagueName }) {
  const firstName = colleagueName?.split(' ')[0] || 'them';
  const questionText = question.question.replace('[Name]', firstName);

  // EMOJI SCALE (e.g., Would work again)
  if (question.type === 'emoji_scale') {
    return (
      <div className="space-y-4">
        <div>
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
            {questionText}
          </h3>
          {question.description && (
            <p className="text-xs sm:text-sm text-gray-500">{question.description}</p>
          )}
        </div>

        <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
          {question.options.map((option) => (
            <button
              key={option.value}
              onClick={() => onChange(option.value)}
              className={`p-2 sm:p-3 rounded-lg sm:rounded-xl border-2 text-center transition-all ${
                value === option.value
                  ? 'bg-blue-50 border-blue-500 shadow-sm'
                  : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
              }`}
            >
              <div className="text-xl sm:text-2xl mb-0.5 sm:mb-1">{option.emoji}</div>
              <div className="text-[10px] sm:text-xs text-gray-600 leading-tight">
                {option.label}
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // SINGLE CHOICE (radio buttons - mobile optimized)
  if (question.type === 'single_choice') {
    return (
      <div className="space-y-4">
        <div>
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
            {questionText}
          </h3>
          {question.description && (
            <p className="text-xs sm:text-sm text-gray-500">{question.description}</p>
          )}
        </div>

        <div className="space-y-2">
          {question.options.map((option) => {
            const isSkip = option.skip === true;
            return (
              <button
                key={option.value}
                onClick={() => onChange(option.value)}
                className={`w-full p-3 sm:p-4 rounded-lg border-2 text-left transition-all ${
                  value === option.value
                    ? isSkip
                      ? 'bg-gray-50 border-gray-400'
                      : 'bg-blue-50 border-blue-500 shadow-sm'
                    : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                    value === option.value
                      ? isSkip
                        ? 'border-gray-500 bg-gray-500'
                        : 'border-blue-500 bg-blue-500'
                      : 'border-gray-300'
                  }`}>
                    {value === option.value && (
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full" />
                    )}
                  </div>
                  <span className={`text-sm sm:text-base flex-1 ${
                    isSkip ? 'text-gray-500 italic' : 'text-gray-900'
                  }`}>
                    {option.label}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // FREE TEXT
  if (question.type === 'free_text') {
    return (
      <div className="space-y-4">
        <div>
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">
              {questionText}
            </h3>
            {!question.required && (
              <span className="text-[10px] sm:text-xs text-gray-400 bg-gray-100 px-2 py-0.5 sm:py-1 rounded whitespace-nowrap">
                Optional
              </span>
            )}
          </div>
          {question.description && (
            <p className="text-xs sm:text-sm text-gray-500">{question.description}</p>
          )}
        </div>

        <Textarea
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={question.placeholder || `Your answer...`}
          className="resize-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 text-sm sm:text-base"
          rows={3}
        />
        
        {question.purpose && (
          <p className="text-[10px] sm:text-xs text-gray-400">
            💡 {question.purpose}
          </p>
        )}
      </div>
    );
  }

  // SLIDER (for legacy compatibility)
  if (question.type === 'slider') {
    return (
      <div className="space-y-4">
        <div>
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
            {questionText}
          </h3>
          {question.description && (
            <p className="text-xs sm:text-sm text-gray-500">{question.description}</p>
          )}
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          <span className="text-xs sm:text-sm font-medium text-gray-400 w-4">1</span>
          <Slider
            value={[value || 5]}
            onValueChange={(val) => onChange(val[0])}
            min={1}
            max={10}
            step={1}
            className="flex-1"
          />
          <span className="text-xs sm:text-sm font-medium text-gray-400 w-6">10</span>
          <div className="min-w-[60px] sm:min-w-[80px] text-right">
            <span className="text-xl sm:text-2xl font-bold text-blue-600">
              {value || 5}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // TAGS SELECTION
  if (question.type === 'tags') {
    const selectedTags = value || [];
    const maxTags = question.maxTags || 3;

    return (
      <div className="space-y-4">
        <div>
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
            {questionText}
          </h3>
          <p className="text-xs sm:text-sm text-gray-500">
            Select up to {maxTags} strengths{' '}
            <span className="text-blue-600 font-medium">
              ({selectedTags.length} selected)
            </span>
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {question.options.map((tag) => {
            const isSelected = selectedTags.includes(tag.id);
            const canSelect = isSelected || selectedTags.length < maxTags;

            return (
              <button
                key={tag.id}
                onClick={() => {
                  if (isSelected) {
                    onChange(selectedTags.filter(id => id !== tag.id));
                  } else if (canSelect) {
                    onChange([...selectedTags, tag.id]);
                  }
                }}
                disabled={!canSelect}
                className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg border-2 text-xs sm:text-sm font-medium transition-all ${
                  isSelected
                    ? 'bg-blue-50 border-blue-500 text-blue-700'
                    : canSelect
                      ? 'border-gray-200 hover:border-blue-300 hover:bg-blue-50 text-gray-700'
                      : 'border-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                {tag.emoji && <span className="mr-1">{tag.emoji}</span>}
                {tag.label}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
      <p className="text-sm text-red-600">
        Unknown question type: {question.type}
      </p>
    </div>
  );
}
