import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, User, Ticket } from "lucide-react";
import { motion } from "framer-motion";

export default function ReviewSuccess({ completedCount, onNextReview, onGoToProfile }) {
  const isUnlocked = completedCount >= 3;
  
  // Token progress calculation
  const REVIEWS_PER_TOKEN = 5;
  const tokensEarned = Math.floor(completedCount / REVIEWS_PER_TOKEN);
  const reviewsInCurrentCycle = completedCount % REVIEWS_PER_TOKEN;
  const reviewsToNextToken = REVIEWS_PER_TOKEN - reviewsInCurrentCycle;
  const progressPercentage = (reviewsInCurrentCycle / REVIEWS_PER_TOKEN) * 100;
  const justEarnedToken = completedCount > 0 && completedCount % REVIEWS_PER_TOKEN === 0;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="p-10 border-0 shadow-xl shadow-gray-200/50 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10 text-green-600" />
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Review Submitted! ✓
        </h1>

        {!isUnlocked && (
          <div className="flex items-center justify-center gap-2 mb-8">
            {[1, 2, 3].map((num) => (
              <div
                key={num}
                className={`w-3 h-3 rounded-full transition-colors ${
                  num <= completedCount ? 'bg-[#0A66C2]' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        )}

        <p className="text-gray-500 mb-4">
          {isUnlocked 
            ? `${completedCount} reviews given! Keep helping colleagues unlock their scores.`
            : `${completedCount} of 3 reviews completed`
          }
        </p>

        {/* Token Progress Indicator */}
        {justEarnedToken ? (
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-xl p-5 mb-8">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Ticket className="w-6 h-6 text-amber-600" />
              <span className="font-bold text-amber-900 text-lg">🎉 You earned a Request Token!</span>
            </div>
            <p className="text-sm text-amber-800 font-medium mb-4 text-center">
              Send a direct review request to any colleague
            </p>
            <button
              onClick={() => {
                // Navigate to profile where they can use the token
                // Or open a modal to create request directly
                if (onGoToProfile) {
                  onGoToProfile();
                }
              }}
              className="w-full py-3 px-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg font-semibold hover:from-amber-600 hover:to-orange-600 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
            >
              <Ticket className="w-5 h-5" />
              Use Token Now
            </button>
          </div>
        ) : (
          <div className="bg-gray-50 rounded-xl p-4 mb-8">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Ticket className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">Earn a Direct Review Request</span>
              </div>
              <span className="text-xs text-gray-500">{reviewsInCurrentCycle}/{REVIEWS_PER_TOKEN}</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden mb-2">
              <div 
                className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <p className="text-xs text-gray-600">
              <span className="font-semibold">{reviewsToNextToken} more review{reviewsToNextToken !== 1 ? 's' : ''}</span> to request a review from anyone you choose
            </p>
          </div>
        )}

        {isUnlocked ? (
          <>
            <Button 
              className="w-full bg-[#0A66C2] hover:bg-[#004182] h-14 rounded-xl font-medium text-base mb-3"
              onClick={onNextReview}
            >
              Continue Reviewing
              <img src="/images/right-arrow.png" alt="Arrow" className="w-5 h-5 ml-2 brightness-0 invert" />
            </Button>
            <p className="text-sm text-gray-400 mb-6 px-4">
              More reviews help us grow faster and increase recruiter engagement with our platform
            </p>
            <Button 
              variant="outline"
              className="w-full border-[#0A66C2] text-[#0A66C2] hover:bg-[#0A66C2]/5 h-14 rounded-xl font-medium text-base"
              onClick={onGoToProfile}
            >
              <User className="w-5 h-5 mr-2" />
              Go to Profile
            </Button>
          </>
        ) : (
          <Button 
            className="w-full bg-[#0A66C2] hover:bg-[#004182] h-14 rounded-xl font-medium text-base"
            onClick={onNextReview}
          >
            Next Review
            <img src="/images/right-arrow.png" alt="Arrow" className="w-5 h-5 ml-2 brightness-0 invert" />
          </Button>
        )}
      </Card>
    </motion.div>
  );
}