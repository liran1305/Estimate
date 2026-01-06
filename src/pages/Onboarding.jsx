import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sparkles, Shield, ArrowRight, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { mockAuth } from "@/lib/mockAuth";
import { motion } from "framer-motion";

export default function Onboarding() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkUser = async () => {
      const currentUser = await mockAuth.me();
      setUser(currentUser);
      
      if (currentUser.onboarding_complete) {
        navigate(createPageUrl("Profile"));
        return;
      }
      
      setIsLoading(false);
    };
    checkUser();
  }, [navigate]);

  const handleStart = async () => {
    await mockAuth.updateMe({ onboarding_complete: true });
    navigate(createPageUrl("Review"));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#0A66C2] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center p-6">
      <motion.div 
        className="w-full max-w-lg"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="p-10 border-0 shadow-xl shadow-gray-200/50 text-center">
          <div className="w-20 h-20 bg-[#0A66C2]/10 rounded-2xl flex items-center justify-center mx-auto mb-8">
            <Sparkles className="w-10 h-10 text-[#0A66C2]" />
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Welcome to Estimate! 🎉
          </h1>
          
          <p className="text-lg text-gray-600 mb-4">
            You're about to help shape professional profiles — starting with 3 colleagues.
          </p>

          <div className="flex items-center justify-center gap-3 py-4 px-6 bg-gray-50 rounded-xl mb-8">
            <Shield className="w-5 h-5 text-[#0A66C2]" />
            <span className="text-gray-700 font-medium">Your reviews are 100% anonymous. Be honest.</span>
          </div>

          <Button 
            className="w-full bg-[#0A66C2] hover:bg-[#004182] h-14 rounded-xl font-medium text-lg"
            onClick={handleStart}
          >
            Start Reviewing
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </Card>
      </motion.div>
    </div>
  );
}