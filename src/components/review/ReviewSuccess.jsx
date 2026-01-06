import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ArrowRight, User } from "lucide-react";
import { motion } from "framer-motion";

export default function ReviewSuccess({ completedCount, onNextReview, onGoToProfile }) {
  const isComplete = completedCount >= 3;

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

        <p className="text-gray-500 mb-8">
          {isComplete 
            ? "You've completed all 3 reviews! Your professional score is now being calculated."
            : `${completedCount} of 3 reviews completed`
          }
        </p>

        {isComplete ? (
          <Button 
            className="w-full bg-[#0A66C2] hover:bg-[#004182] h-14 rounded-xl font-medium text-base"
            onClick={onGoToProfile}
          >
            <User className="w-5 h-5 mr-2" />
            Go to Profile
          </Button>
        ) : (
          <Button 
            className="w-full bg-[#0A66C2] hover:bg-[#004182] h-14 rounded-xl font-medium text-base"
            onClick={onNextReview}
          >
            Next Review
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        )}
      </Card>
    </motion.div>
  );
}