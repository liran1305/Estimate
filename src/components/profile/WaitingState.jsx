import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Star, Clock, CheckCircle2, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { createPageUrl } from "@/utils";

export default function WaitingState({ reviewsReceived = 0, reviewsGiven = 0, reviewsNeeded = 3 }) {
  const scoreUnlocked = reviewsGiven >= reviewsNeeded;
  const hasReviewsWaiting = reviewsReceived > 0;
  
  // State 1: Score unlocked but no reviews received yet
  if (scoreUnlocked && !hasReviewsWaiting) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="p-8 border-0 shadow-xl shadow-gray-200/50 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            You're All Set! 🎉
          </h2>
          <p className="text-gray-500 mb-6">
            You've completed {reviewsGiven} reviews and your score is ready to be calculated.
            Now waiting for colleagues to review you back.
          </p>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="p-4 bg-green-50 rounded-xl border border-green-200 text-center">
              <p className="text-sm font-medium text-gray-600 mb-1">Reviews Given</p>
              <p className="text-2xl font-bold text-green-600">{reviewsGiven}</p>
              <p className="text-xs text-green-600 mt-1">Score unlocked ✓</p>
            </div>
            
            <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-center">
              <p className="text-sm font-medium text-gray-600 mb-1">Reviews Received</p>
              <p className="text-2xl font-bold text-amber-600">{reviewsReceived}</p>
              <p className="text-xs text-amber-600 mt-1">Waiting for colleagues</p>
            </div>
          </div>

          <Link to={createPageUrl("Review")}>
            <Button className="w-full bg-[#0A66C2] hover:bg-[#004182] h-12 rounded-xl font-medium text-white">
              Continue Reviewing
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
          <p className="text-xs text-gray-400 mt-3">Help more colleagues get their scores!</p>
        </Card>
      </motion.div>
    );
  }

  // State 2: Has reviews waiting to be unlocked (need to give more reviews)
  if (hasReviewsWaiting && !scoreUnlocked) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="p-8 border-0 shadow-xl shadow-gray-200/50 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-[#0A66C2]/10 rounded-full flex items-center justify-center">
            <Star className="w-8 h-8 text-[#0A66C2]" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            You have {reviewsReceived} review{reviewsReceived > 1 ? 's' : ''} waiting! 🎉
          </h2>
          <p className="text-gray-500 mb-6">
            Complete {reviewsNeeded - reviewsGiven} more review{reviewsNeeded - reviewsGiven > 1 ? 's' : ''} to unlock your score!
          </p>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="p-4 bg-[#0A66C2]/5 rounded-xl border border-[#0A66C2]/20 text-center">
              <p className="text-sm font-medium text-gray-600 mb-1">Reviews Received</p>
              <p className="text-2xl font-bold text-[#0A66C2]">{reviewsReceived}</p>
              <p className="text-xs text-[#0A66C2] mt-1">Waiting to unlock!</p>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 text-center">
              <p className="text-sm font-medium text-gray-600 mb-1">Reviews Given</p>
              <p className="text-2xl font-bold text-gray-900">{reviewsGiven} / {reviewsNeeded}</p>
              <p className="text-xs text-gray-500 mt-1">{reviewsNeeded - reviewsGiven} more needed</p>
            </div>
          </div>

          <Link to={createPageUrl("Review")}>
            <Button className="w-full bg-[#0A66C2] hover:bg-[#004182] h-12 rounded-xl font-medium text-white">
              Continue Reviewing
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </Card>
      </motion.div>
    );
  }

  // State 3: Default - just starting out (no reviews given or received)
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="p-8 border-0 shadow-xl shadow-gray-200/50 text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
          <Users className="w-8 h-8 text-gray-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Welcome to Your Feedback Hub! 👋
        </h2>
        <p className="text-gray-500 mb-6">
          Start reviewing colleagues to unlock your professional score and receive feedback.
        </p>

        <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 text-center mb-6">
          <p className="text-sm font-medium text-gray-600 mb-1">Reviews Given</p>
          <p className="text-2xl font-bold text-gray-900">{reviewsGiven} / {reviewsNeeded}</p>
          <p className="text-xs text-gray-500 mt-1">{reviewsNeeded - reviewsGiven} more to unlock your score</p>
        </div>

        <Link to={createPageUrl("Review")}>
          <Button className="w-full bg-[#0A66C2] hover:bg-[#004182] h-12 rounded-xl font-medium text-white">
            Start Reviewing
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </Card>
    </motion.div>
  );
}