import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { linkedinAuth } from "@/lib/linkedinAuth";
import { Loader2, Linkedin } from "lucide-react";
import { motion } from "framer-motion";

// New profile components
import DimensionCard from "@/components/profile/DimensionCard";
import KeyMetrics from "@/components/profile/KeyMetrics";
import QualitativeBadge from "@/components/profile/QualitativeBadge";
import StrengthTagsDisplay from "@/components/profile/StrengthTagsDisplay";
import NeverWorryAbout from "@/components/profile/NeverWorryAbout";
import ColleagueQuotes from "@/components/profile/ColleagueQuotes";
import RoomToGrow from "@/components/profile/RoomToGrow";

// Existing components
import WaitingState from "@/components/profile/WaitingState";
import { TokenProgressBar, RequestReviewModal } from "@/components/tokens";
import { behavioralConfig } from "@/config/behavioralConfig";

const BACKEND_API_URL = import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:3001';

// Extract canonical job title from position
const extractCanonicalTitle = (position) => {
  if (!position) return 'Professional';
  const lowerPos = position.toLowerCase();
  if (lowerPos.includes('product manager') || lowerPos.includes('pm')) return 'Product Manager';
  if (lowerPos.includes('engineer') || lowerPos.includes('developer')) return 'Software Engineer';
  if (lowerPos.includes('designer')) return 'Designer';
  if (lowerPos.includes('founder') || lowerPos.includes('ceo')) return 'Founder';
  return 'Professional';
};

export default function ProfileV2() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [scoreData, setScoreData] = useState(null);
  const [dimensionScores, setDimensionScores] = useState(null);
  const [tokenData, setTokenData] = useState(null);
  const [showRequestModal, setShowRequestModal] = useState(false);

  useEffect(() => {
    const init = async () => {
      const currentUser = linkedinAuth.getCurrentUser();
      
      if (!currentUser) {
        navigate(createPageUrl("Login"));
        return;
      }
      
      setUser(currentUser);
      
      try {
        // Fetch profile data
        const profileRes = await fetch(`${BACKEND_API_URL}/api/user/profile?user_id=${currentUser.id}`);
        const profileJson = await profileRes.json();
        if (profileJson.success) {
          setProfileData(profileJson.profile);
        }
        
        // Fetch score data (includes new dimension scores)
        const scoreRes = await fetch(`${BACKEND_API_URL}/api/user/score?user_id=${currentUser.id}`);
        const scoreJson = await scoreRes.json();
        if (scoreJson.success) {
          setScoreData(scoreJson);
          setDimensionScores(scoreJson.dimension_scores || null);
        }
        
        // Fetch token data
        const tokenRes = await fetch(`${BACKEND_API_URL}/api/tokens/balance?user_id=${currentUser.id}`);
        const tokenJson = await tokenRes.json();
        if (tokenJson.success) {
          setTokenData(tokenJson);
        }
      } catch (error) {
        console.error('Error fetching profile data:', error);
      }
      
      setIsLoading(false);
    };
    
    init();
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
      </div>
    );
  }

  const hasAnyReviews = (scoreData?.reviews_received || 0) > 0;
  const firstName = user?.name?.split(' ')[0] || 'User';
  const jobTitle = extractCanonicalTitle(profileData?.position || user?.position);
  
  // Get data for display
  const badge = scoreData?.qualitative_badge || 'growing';
  const percentile = scoreData?.percentile?.value || 25;
  const strengthTags = scoreData?.strength_tags || [];
  const neverWorryAbout = scoreData?.never_worry_about || [];
  const quotes = scoreData?.quotes || [];
  const roomToGrow = scoreData?.room_to_grow || [];

  // High-signal percentages
  const startupHirePct = scoreData?.startup_hire_pct;
  const harderJobPct = scoreData?.harder_job_pct;
  const workAgainAbsolutelyPct = scoreData?.work_again_absolutely_pct;

  // Check if this is the user's own profile
  const isOwner = true; // For now, Profile page is always own profile

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4">
      <div className="max-w-5xl mx-auto">
        
        {hasAnyReviews ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Header Card */}
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm">
              <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                {/* Left: Profile Info */}
                <div className="flex items-center gap-5">
                  <div className="relative">
                    <img 
                      src={profileData?.avatar || user?.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=f59e0b&color=fff&size=200`}
                      alt={user?.name}
                      className="w-24 h-24 rounded-full object-cover shadow-lg"
                    />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">{user?.name}</h1>
                    <p className="text-gray-500 mt-1">{profileData?.position || user?.position}</p>
                    <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                      <span>📝 {scoreData?.reviews_received || 0} reviews received</span>
                      <span>✍️ {scoreData?.reviews_given || 0} reviews given</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-2">
                      Verified by peers from {scoreData?.company_count || 1} companies
                    </p>
                  </div>
                </div>
                
                {/* Right: Qualitative Badge */}
                <QualitativeBadge 
                  badge={badge}
                  percentile={percentile}
                  jobTitle={jobTitle}
                />
              </div>
            </div>

            {/* Key Metrics - Dark Section */}
            {(startupHirePct || harderJobPct || workAgainAbsolutelyPct) && (
              <KeyMetrics 
                startupHirePct={startupHirePct}
                harderJobPct={harderJobPct}
                workAgainAbsolutelyPct={workAgainAbsolutelyPct}
              />
            )}

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Left Column - Dimensions */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Skills That Matter Now
                </h3>
                <p className="text-sm text-gray-500 mb-5">
                  What separates people who thrive from those who struggle
                </p>
                
                <div className="space-y-3">
                  {Object.entries(behavioralConfig.dimensions).map(([key, dim]) => {
                    const score = dimensionScores?.[key];
                    if (!score) return null;
                    
                    return (
                      <DimensionCard
                        key={key}
                        dimension={key}
                        level={score.level}
                        percentile={score.percentile}
                      />
                    );
                  })}
                  
                  {/* Show placeholder if no dimension scores yet */}
                  {!dimensionScores && (
                    <div className="text-center py-8 text-gray-400">
                      <p>Dimension scores will appear as you receive more reviews</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Strength Tags */}
                {strengthTags.length > 0 && (
                  <StrengthTagsDisplay tags={strengthTags} />
                )}
                
                {/* Never Worry About */}
                {neverWorryAbout.length > 0 && (
                  <NeverWorryAbout items={neverWorryAbout} firstName={firstName} />
                )}
                
                {/* Colleague Quotes */}
                {quotes.length > 0 && (
                  <ColleagueQuotes quotes={quotes} />
                )}
              </div>
            </div>

            {/* Room to Grow - Private Section */}
            <RoomToGrow items={roomToGrow} isOwner={isOwner} />

            {/* Request Reviews Section */}
            {tokenData && (
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Request Direct Reviews</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Use tokens to request reviews from specific colleagues
                    </p>
                  </div>
                  <button
                    onClick={() => setShowRequestModal(true)}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium transition-colors"
                  >
                    Request Review
                  </button>
                </div>
                <div className="mt-4">
                  <TokenProgressBar 
                    balance={tokenData.balance}
                    lifetime={tokenData.lifetime_earned}
                  />
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="text-center py-4 text-gray-400 text-sm">
              Based on {scoreData?.reviews_received || 0} anonymous reviews from verified colleagues
              <br />
              <span className="text-xs">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
            </div>
          </motion.div>
        ) : (
          /* Waiting State - No Reviews Yet */
          <WaitingState 
            reviewsGiven={scoreData?.reviews_given || 0}
            reviewsNeeded={3}
            onStartReviewing={() => navigate(createPageUrl("Review"))}
          />
        )}

        {/* Request Review Modal */}
        {showRequestModal && (
          <RequestReviewModal
            userId={user?.id}
            onClose={() => setShowRequestModal(false)}
            onSuccess={() => {
              setShowRequestModal(false);
              // Refresh token data
              fetch(`${BACKEND_API_URL}/api/tokens/balance?user_id=${user?.id}`)
                .then(res => res.json())
                .then(data => {
                  if (data.success) setTokenData(data);
                });
            }}
          />
        )}
      </div>
    </div>
  );
}
