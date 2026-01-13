import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { linkedinAuth } from "@/lib/linkedinAuth";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Loader2, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import ScoreCircle from "@/components/profile/ScoreCircle";
import ScoreBreakdown from "@/components/profile/ScoreBreakdown";
import WaitingState from "@/components/profile/WaitingState";
import ConsentModal from "@/components/profile/ConsentModal";

const BACKEND_API_URL = import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:3001';

export default function Profile() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [showConsent, setShowConsent] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const init = async () => {
      // Get real user from localStorage (set by LinkedIn OAuth)
      const currentUser = linkedinAuth.getCurrentUser();
      
      if (!currentUser) {
        navigate(createPageUrl("Login"));
        return;
      }
      
      setUser(currentUser);
      
      // If user has a matched LinkedIn profile, fetch their full profile data
      if (currentUser.linkedinProfileId) {
        try {
          const res = await fetch(`${BACKEND_API_URL}/api/colleagues/profile/${currentUser.linkedinProfileId}/colleagues`);
          const data = await res.json();
          if (data.success && data.profile) {
            setProfileData(data.profile);
          }
        } catch (err) {
          console.error('Failed to fetch profile data:', err);
        }
      }
      
      setReviews([]);
      setIsLoading(false);
    };
    init();
  }, [navigate]);

  const calculateAverageScores = () => {
    if (reviews.length === 0) return null;

    const categories = [
      'communication_skills', 'teamwork_skills', 'problem_solving', 
      'adaptability', 'leadership_impact', 'goal_achievement', 
      'creativity', 'initiative'
    ];

    const averages = {};
    categories.forEach(cat => {
      const validScores = reviews
        .map(r => r[cat])
        .filter(s => s !== null && s !== undefined);
      
      if (validScores.length > 0) {
        averages[cat] = validScores.reduce((a, b) => a + b, 0) / validScores.length;
      }
    });

    return averages;
  };

  const calculateOverallScore = (averages) => {
    if (!averages) return 0;
    const values = Object.values(averages).filter(v => v !== undefined);
    if (values.length === 0) return 0;
    return values.reduce((a, b) => a + b, 0) / values.length;
  };

  const handleConsentToggle = (checked) => {
    if (checked) {
      setShowConsent(true);
    } else {
      updateConsent(false);
    }
  };

  const updateConsent = async (value) => {
    setIsUpdating(true);
    // Update user in localStorage
    const updatedUser = { ...user, recruitment_consent: value };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);
    setIsUpdating(false);
    setShowConsent(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#0A66C2] animate-spin" />
      </div>
    );
  }

  const averageScores = calculateAverageScores();
  const overallScore = calculateOverallScore(averageScores);
  const hasEnoughReviews = reviews.length >= 3;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 px-6">
      <div className="max-w-2xl mx-auto">
        {/* Profile Header */}
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <img 
            src={user.picture || profileData?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'User')}&background=0A66C2&color=fff&size=120`}
            alt={user.name}
            className="w-24 h-24 rounded-2xl object-cover mx-auto mb-4 shadow-lg"
          />
          <h1 className="text-2xl font-bold text-gray-900">{profileData?.name || user.name || 'Professional'}</h1>
          <p className="text-gray-500">{profileData?.position || 'Professional'}</p>
          {profileData?.current_company_name && (
            <p className="text-gray-400 text-sm">at {profileData.current_company_name}</p>
          )}
        </motion.div>

        {hasEnoughReviews ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {/* Score Card */}
            <Card className="p-8 border-0 shadow-xl shadow-gray-200/50 mb-6">
              <ScoreCircle score={overallScore} />
              
              <div className="flex items-center justify-center gap-2 mt-6 py-3 px-4 bg-[#0A66C2]/5 rounded-xl">
                <TrendingUp className="w-5 h-5 text-[#0A66C2]" />
                <span className="text-[#0A66C2] font-medium">
                  You're in the TOP 10% of professionals
                </span>
              </div>
            </Card>

            {/* Score Breakdown */}
            <Card className="p-8 border-0 shadow-xl shadow-gray-200/50 mb-6">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Score Breakdown</h3>
              <ScoreBreakdown scores={averageScores} />
            </Card>

            {/* Recruitment Consent */}
            <Card className="p-6 border-0 shadow-xl shadow-gray-200/50">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="font-medium text-gray-900">Reviews Permitted for Recruitment</Label>
                  <p className="text-sm text-gray-500">Allow verified recruiters to see your reviews</p>
                </div>
                <Switch 
                  checked={user.recruitment_consent || false}
                  onCheckedChange={handleConsentToggle}
                  disabled={isUpdating}
                />
              </div>
            </Card>
          </motion.div>
        ) : (
          <WaitingState />
        )}

        {/* Review CTA */}
        {(user.reviewsGiven || 0) < 3 && (
          <motion.div 
            className="mt-8 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <p className="text-gray-500 mb-4">
              Complete your reviews to unlock more features
            </p>
            <Link 
              to={createPageUrl("Review")}
              className="inline-flex items-center justify-center px-6 py-3 bg-[#0A66C2] text-white rounded-xl font-medium hover:bg-[#004182] transition-colors"
            >
              Continue Reviewing
            </Link>
          </motion.div>
        )}
      </div>

      <ConsentModal 
        open={showConsent}
        onClose={() => setShowConsent(false)}
        onConfirm={() => updateConsent(true)}
        isLoading={isUpdating}
      />
    </div>
  );
}