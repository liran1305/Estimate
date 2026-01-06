import React from 'react';
import { Card } from "@/components/ui/card";
import { Clock, Users, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";

export default function WaitingState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="p-8 border-0 shadow-xl shadow-gray-200/50 text-center">
        <div className="w-20 h-20 bg-[#0A66C2]/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <Clock className="w-10 h-10 text-[#0A66C2]" />
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Welcome to Your Feedback Hub! 👋
        </h2>
        <p className="text-gray-500 mb-8">
          Your insights haven't arrived yet, but don't worry! This is just the beginning.
        </p>

        <div className="space-y-4 text-left">
          <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
            <div className="w-10 h-10 bg-[#0A66C2]/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <Users className="w-5 h-5 text-[#0A66C2]" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Stay Engaged</p>
              <p className="text-sm text-gray-500">Keep reviewing colleagues. The more you give, the more you're likely to receive.</p>
            </div>
          </div>
          
          <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
            <div className="w-10 h-10 bg-[#0A66C2]/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <RefreshCw className="w-5 h-5 text-[#0A66C2]" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Check Back Soon</p>
              <p className="text-sm text-gray-500">Your colleagues' perspectives are on their way.</p>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}