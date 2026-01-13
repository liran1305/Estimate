import React from 'react';
import { Card } from "@/components/ui/card";
import { Users, Star } from "lucide-react";
import { motion } from "framer-motion";

export default function WaitingState({ reviewsReceived = 0, reviewsGiven = 0, reviewsNeeded = 3 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="p-8 border-0 shadow-xl shadow-gray-200/50 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {reviewsReceived > 0 ? `You have ${reviewsReceived} review${reviewsReceived > 1 ? 's' : ''} waiting! 🎉` : 'Welcome to Your Feedback Hub! 👋'}
        </h2>
        <p className="text-gray-500 mb-8">
          {reviewsReceived > 0 
            ? `Complete ${reviewsNeeded - reviewsGiven} more review${reviewsNeeded - reviewsGiven > 1 ? 's' : ''} to unlock your score and see your feedback!`
            : 'Start reviewing colleagues to unlock your professional score and receive feedback.'}
        </p>

        <div className="space-y-4 text-left mb-6">
          {reviewsReceived > 0 && (
            <div className="flex items-start gap-4 p-4 bg-[#0A66C2]/5 rounded-xl border-2 border-[#0A66C2]/20">
              <div className="w-10 h-10 bg-[#0A66C2]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Star className="w-5 h-5 text-[#0A66C2]" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900 mb-1">Reviews Received</p>
                <p className="text-2xl font-bold text-[#0A66C2]">{reviewsReceived}</p>
                <p className="text-sm text-gray-500 mt-1">Waiting to be unlocked!</p>
              </div>
            </div>
          )}
          
          <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
            <div className="w-10 h-10 bg-[#0A66C2]/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <Users className="w-5 h-5 text-[#0A66C2]" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900 mb-1">Reviews Given</p>
              <p className="text-2xl font-bold text-gray-900">{reviewsGiven} / {reviewsNeeded}</p>
              <p className="text-sm text-gray-500 mt-1">
                {reviewsGiven >= reviewsNeeded 
                  ? 'Score unlocked! 🎉' 
                  : `${reviewsNeeded - reviewsGiven} more to unlock your score`}
              </p>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}