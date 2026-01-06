import React from 'react';
import { motion } from "framer-motion";

export default function ScoreCircle({ score }) {
  const getScoreLabel = (score) => {
    if (score >= 9) return "Outstanding";
    if (score >= 8) return "Amazing";
    if (score >= 7) return "Great";
    if (score >= 6) return "Good";
    if (score >= 5) return "Average";
    return "Needs Work";
  };

  const getScoreColor = (score) => {
    if (score >= 8) return "#10B981";
    if (score >= 6) return "#F59E0B";
    return "#EF4444";
  };

  const circumference = 2 * Math.PI * 54;
  const progress = (score / 10) * circumference;

  return (
    <div className="relative w-40 h-40 mx-auto">
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
        <circle
          cx="60"
          cy="60"
          r="54"
          fill="none"
          stroke="#E5E7EB"
          strokeWidth="8"
        />
        <motion.circle
          cx="60"
          cy="60"
          r="54"
          fill="none"
          stroke={getScoreColor(score)}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference - progress }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span 
          className="text-4xl font-bold text-gray-900"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
        >
          {score.toFixed(1)}
        </motion.span>
        <span className="text-sm font-medium" style={{ color: getScoreColor(score) }}>
          {getScoreLabel(score)}
        </span>
      </div>
    </div>
  );
}