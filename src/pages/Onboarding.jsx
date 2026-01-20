import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sparkles, Shield, ArrowRight, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { linkedinAuth } from "@/lib/linkedinAuth";
import { motion } from "framer-motion";

const BACKEND_API_URL = import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:3001';

export default function Onboarding() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkUser = async () => {
      const currentUser = linkedinAuth.getCurrentUser();
      
      if (!currentUser) {
        navigate(createPageUrl("Login"));
        return;
      }
      
      setUser(currentUser);
      
      // Check if user has already completed 3 reviews (from database)
      try {
        const scoreRes = await fetch(`${BACKEND_API_URL}/api/score/me?user_id=${currentUser.id}`);
        const scoreData = await scoreRes.json();
        
        if (scoreData.success && scoreData.reviews_given >= 3) {
          // User has completed 3 reviews, mark as onboarded and go to Profile
          const updatedUser = { ...currentUser, isOnboarded: true };
          localStorage.setItem('user', JSON.stringify(updatedUser));
          navigate(createPageUrl("Profile"));
          return;
        }
      } catch (err) {
        console.error('Error checking review status:', err);
      }
      
      // Also check localStorage flag
      if (currentUser.isOnboarded) {
        navigate(createPageUrl("Profile"));
        return;
      }
      
      setIsLoading(false);
    };
    checkUser();
  }, [navigate]);

  const handleStart = () => {
    // Track onboarding completion in GTM
    if (window.dataLayer) {
      window.dataLayer.push({
        event: 'onboarding_complete'
      });
    }
    
    const updatedUser = { ...user, isOnboarded: true };
    localStorage.setItem('user', JSON.stringify(updatedUser));
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
        className="w-full max-w-2xl"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="p-10 border-0 shadow-xl shadow-gray-200/50 text-center">
          <div className="mb-6">
            <img 
              src={user?.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=0A66C2&color=fff&size=120`}
              alt={user?.name}
              className="w-24 h-24 rounded-full object-cover mx-auto shadow-lg ring-4 ring-white"
            />
            <h2 className="text-xl font-semibold text-gray-700 mt-4">
              {user?.name}
            </h2>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Welcome to Estimate! 🎉
          </h1>
          
          <p className="text-lg text-gray-600 mb-4">
            You're about to help shape professional profiles — starting with 3 colleagues.
          </p>

          <div className="flex items-center justify-center gap-3 py-4 px-6 bg-gray-50 rounded-xl mb-8">
            <img src="/images/anonimous.png" alt="Anonymous" className="w-8 h-8" />
            <span className="text-gray-700 font-medium">Your reviews are 100% anonymous. Be honest.</span>
          </div>

          <Button 
            className="w-full bg-[#0A66C2] hover:bg-[#004182] h-14 rounded-xl font-medium text-lg"
            onClick={handleStart}
          >
            Start Reviewing
            <img src="/images/right-arrow.png" alt="Arrow" className="w-5 h-5 ml-2 brightness-0 invert" />
          </Button>
        </Card>
      </motion.div>
    </div>
  );
}