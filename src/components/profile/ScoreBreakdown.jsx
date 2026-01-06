import React from 'react';
import { motion } from "framer-motion";

const categories = [
  { key: "communication_skills", label: "Communication" },
  { key: "teamwork_skills", label: "Teamwork" },
  { key: "problem_solving", label: "Problem-Solving" },
  { key: "adaptability", label: "Adaptability" },
  { key: "leadership_impact", label: "Leadership" },
  { key: "goal_achievement", label: "Goal Achievement" },
  { key: "stress_management", label: "Stress Management" },
  { key: "initiative", label: "Initiative" }
];

const getBarColor = (score) => {
  if (score >= 8) return "bg-green-500";
  if (score >= 6) return "bg-amber-500";
  return "bg-red-500";
};

export default function ScoreBreakdown({ scores }) {
  return (
    <div className="space-y-4">
      {categories.map((category, index) => {
        const score = scores[category.key];
        if (score === null || score === undefined) return null;
        
        return (
          <div key={category.key}>
            <div className="flex justify-between text-sm mb-1.5">
              <span className="text-gray-600 font-medium">{category.label}</span>
              <span className="font-bold text-gray-900">{score.toFixed(1)}</span>
            </div>
            <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
              <motion.div
                className={`h-full rounded-full ${getBarColor(score)}`}
                initial={{ width: 0 }}
                animate={{ width: `${(score / 10) * 100}%` }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}