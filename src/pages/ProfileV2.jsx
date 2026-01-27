import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { linkedinAuth } from "@/lib/linkedinAuth";
import { Loader2, Lock, Check, User } from "lucide-react";
import WaitingState from "@/components/profile/WaitingState";
import { RequestReviewModal } from "@/components/tokens";
import { behavioralConfig } from "@/config/behavioralConfig";

const BACKEND_API_URL = import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:3001';

// LinkedIn blue color
const LINKEDIN_BLUE = '#0a66c2';
const LINKEDIN_DARK_BLUE = '#004182';

// Percentile bar component
const PercentileBar = ({ percentile }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px' }}>
    <div style={{ 
      flex: 1, 
      height: '4px', 
      backgroundColor: '#e5e5e5', 
      borderRadius: '2px',
      overflow: 'hidden'
    }}>
      <div style={{ 
        width: `${percentile}%`, 
        height: '100%', 
        backgroundColor: LINKEDIN_BLUE,
        borderRadius: '2px'
      }} />
    </div>
    <span style={{ fontSize: '13px', color: '#666666', minWidth: '65px' }}>
      Top {100 - percentile}%
    </span>
  </div>
);

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
        if (currentUser.linkedinProfileId) {
          const profileRes = await fetch(`${BACKEND_API_URL}/api/colleagues/profile/${currentUser.linkedinProfileId}/colleagues`);
          const profileJson = await profileRes.json();
          if (profileJson.success && profileJson.profile) {
            setProfileData(profileJson.profile);
          }
        }
        
        // Fetch score data (includes new dimension scores)
        const scoreRes = await fetch(`${BACKEND_API_URL}/api/score/me?user_id=${currentUser.id}`);
        const scoreJson = await scoreRes.json();
        setScoreData(scoreJson);
        setDimensionScores(scoreJson.dimension_scores || null);
        
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
  const percentile = scoreData?.percentile?.tier?.match(/\d+/)?.[0] || 25;
  const strengthTags = scoreData?.strength_tags || [];
  const neverWorryAbout = scoreData?.never_worry_about || [];
  // Map comments to quotes format for ColleagueQuotes component
  const quotes = (scoreData?.comments || []).map(c => ({
    text: c.comment,
    context: c.context || c.company_name
  }));
  const roomToGrow = scoreData?.room_to_grow || [];

  // High-signal percentages
  const startupHirePct = scoreData?.startup_hire_pct;
  const harderJobPct = scoreData?.harder_job_pct;
  const workAgainAbsolutelyPct = scoreData?.work_again_absolutely_pct;

  // Check if this is the user's own profile
  const isOwner = true; // For now, Profile page is always own profile

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      <div className="max-w-5xl mx-auto px-4 pt-4 md:pt-6">
        
        {hasAnyReviews ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4 md:space-y-6"
          >
            {/* Header Card - Mobile: stacked, Desktop: side by side */}
            <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 shadow-sm">
              <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                {/* Profile Info */}
                <div className="flex items-center gap-3 md:gap-4">
                  <img 
                    src={profileData?.avatar || user?.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=f59e0b&color=fff&size=200`}
                    alt={user?.name}
                    className="w-14 h-14 md:w-20 md:h-20 rounded-full object-cover shadow-lg flex-shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <h1 className="text-lg md:text-xl font-bold text-gray-900 truncate">{user?.name}</h1>
                    <p className="text-sm text-gray-500 truncate">{profileData?.position || user?.position}</p>
                    <div className="flex flex-wrap items-center gap-2 md:gap-3 mt-1.5 text-xs text-gray-500">
                      <span>📝 {scoreData?.reviews_received || 0} reviews received</span>
                      <span>✍️ {scoreData?.reviews_given || 0} reviews given</span>
                    </div>
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      Verified by peers from {scoreData?.company_count || 1} companies
                    </p>
                  </div>
                </div>
                
                {/* Qualitative Badge - Compact, aligned with profile */}
                <div className="flex-shrink-0">
                  <QualitativeBadge 
                    badge={badge}
                    percentile={percentile}
                    jobTitle={jobTitle}
                  />
                </div>
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

            {/* Main Content Grid - Mobile: stacked, Desktop: 2 columns */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
              
              {/* Left Column - Skills That Matter */}
              {dimensionScores && Object.keys(dimensionScores).length > 0 && (
                <SkillsThatMatter dimensions={dimensionScores} />
              )}

              {/* Right Column - Stacked sections */}
              <div className="space-y-4 md:space-y-6">
                {/* Strength Tags */}
                {strengthTags.length > 0 && (
                  <StrengthTagsDisplay tags={strengthTags} />
                )}
                
                {/* Never Worry About */}
                {neverWorryAbout.length > 0 && (
                  <NeverWorryAbout items={neverWorryAbout} firstName={firstName} />
                )}
              </div>
            </div>

            {/* Colleague Quotes - Full width */}
            {quotes.length > 0 && (
              <ColleagueQuotes quotes={quotes} />
            )}

            {/* Room to Grow - Private Section */}
            <RoomToGrow items={roomToGrow} isOwner={isOwner} />

            {/* Request Reviews - Compact on mobile */}
            {tokenData && (
              <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <h3 className="text-base md:text-lg font-semibold text-gray-900">Request Direct Reviews</h3>
                    <p className="text-xs md:text-sm text-gray-500 mt-0.5">
                      Use tokens to request reviews from specific colleagues
                    </p>
                  </div>
                  <button
                    onClick={() => setShowRequestModal(true)}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium transition-colors text-sm"
                  >
                    <Ticket className="w-4 h-4" />
                    Request Review
                  </button>
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="text-center py-4 text-gray-400 text-xs md:text-sm">
              Based on {scoreData?.reviews_received || 0} anonymous reviews from verified colleagues
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
