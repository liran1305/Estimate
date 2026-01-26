import React from 'react';
import { Ticket } from 'lucide-react';

/**
 * TokenProgressBar - Shows progress toward earning the next Request Token
 * 
 * Props:
 * - reviewsGiven: number - Total reviews given by user
 * - tokensAvailable: number - Current token balance
 * - compact: boolean - Show compact version (for header/sidebar)
 */
export default function TokenProgressBar({ 
  reviewsGiven = 0, 
  tokensAvailable = 0, 
  compact = false,
  onRequestClick 
}) {
  const REVIEWS_PER_TOKEN = 5;
  const progressInCurrentCycle = reviewsGiven % REVIEWS_PER_TOKEN;
  const reviewsToNextToken = REVIEWS_PER_TOKEN - progressInCurrentCycle;
  const progressPercentage = (progressInCurrentCycle / REVIEWS_PER_TOKEN) * 100;
  const nextTokenAt = (Math.floor(reviewsGiven / REVIEWS_PER_TOKEN) + 1) * REVIEWS_PER_TOKEN;

  if (compact) {
    return (
      <div className="flex items-center gap-2 text-sm">
        <div className="flex items-center gap-1 text-amber-600">
          <Ticket className="w-4 h-4" />
          <span className="font-medium">{tokensAvailable}</span>
        </div>
        {tokensAvailable > 0 && onRequestClick && (
          <button
            onClick={onRequestClick}
            className="text-xs text-blue-600 hover:text-blue-700 underline"
          >
            Use
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-200">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-amber-100 rounded-lg">
            <Ticket className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Request Tokens</h3>
            <p className="text-xs text-gray-500">Invite colleagues to review you</p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-2xl font-bold text-amber-600">{tokensAvailable}</span>
          <p className="text-xs text-gray-500">available</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-3">
        <div className="flex justify-between text-xs text-gray-600 mb-1">
          <span>{progressInCurrentCycle}/{REVIEWS_PER_TOKEN} reviews</span>
          <span>Next token at {nextTokenAt} reviews</span>
        </div>
        <div className="h-2 bg-amber-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full transition-all duration-500"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        <p className="text-xs text-gray-500 mt-1">
          {reviewsToNextToken} more review{reviewsToNextToken !== 1 ? 's' : ''} to earn a token
        </p>
      </div>

      {/* Action button */}
      {tokensAvailable > 0 && onRequestClick && (
        <button
          onClick={onRequestClick}
          className="w-full py-2 px-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg font-medium hover:from-amber-600 hover:to-orange-600 transition-all flex items-center justify-center gap-2"
        >
          <Ticket className="w-4 h-4" />
          Request a Review
        </button>
      )}

      {tokensAvailable === 0 && (
        <p className="text-center text-sm text-gray-500">
          Complete {reviewsToNextToken} more review{reviewsToNextToken !== 1 ? 's' : ''} to earn your {reviewsGiven < REVIEWS_PER_TOKEN ? 'first' : 'next'} token
        </p>
      )}
    </div>
  );
}
