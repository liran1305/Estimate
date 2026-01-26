import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { linkedinAuth } from "@/lib/linkedinAuth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Loader2, CheckCircle2, MapPin, Clock, Users, Linkedin, LinkIcon, Star, Sparkles, Target, Lightbulb, MessageSquare, Zap } from "lucide-react";
import { motion } from "framer-motion";
import WaitingState from "@/components/profile/WaitingState";
import ConsentModal from "@/components/profile/ConsentModal";

const BACKEND_API_URL = import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:3001';

// Score badge colors based on score value
const getScoreBadgeColor = (score) => {
  if (score >= 9) return 'bg-emerald-500';
  if (score >= 8) return 'bg-green-500';
  if (score >= 7) return 'bg-lime-500';
  if (score >= 6) return 'bg-yellow-500';
  if (score >= 5) return 'bg-amber-500';
  return 'bg-orange-500';
};

// Score categories for horizontal breakdown
const scoreCategories = [
  { key: "teamwork", label: "Teamwork" },
  { key: "reliability", label: "Reliability" },
  { key: "communication", label: "Communication" },
  { key: "problem_solving", label: "Problem Solving" },
  { key: "leadership_impact", label: "Leadership" },
  { key: "initiative", label: "Initiative" },
  { key: "mentorship", label: "Mentorship" },
  { key: "strategic_thinking", label: "Strategic" }
];

// Strength tag icons mapping
const strengthTagIcons = {
  'Problem Solver': <Target className="w-4 h-4" />,
  'Great Communicator': <MessageSquare className="w-4 h-4" />,
  'Quick Learner': <Lightbulb className="w-4 h-4" />,
  'Team Player': <Users className="w-4 h-4" />,
  'Creative Thinker': <Sparkles className="w-4 h-4" />,
  'Reliable': <CheckCircle2 className="w-4 h-4" />,
  'Natural Leader': <Star className="w-4 h-4" />,
  'High Energy': <Zap className="w-4 h-4" />,
  'Detail-Oriented': <Target className="w-4 h-4" />,
  'Calm Under Pressure': <CheckCircle2 className="w-4 h-4" />
};

// Extract canonical job title from position (singular)
const extractCanonicalTitle = (position) => {
  if (!position) return 'Professional';
  const lowerPos = position.toLowerCase();
  if (lowerPos.includes('product manager') || lowerPos.includes('pm')) return 'Product Manager';
  if (lowerPos.includes('frontend') || lowerPos.includes('front-end') || lowerPos.includes('react') || lowerPos.includes('vue') || lowerPos.includes('angular')) return 'Frontend Engineer';
  if (lowerPos.includes('backend') || lowerPos.includes('back-end') || lowerPos.includes('node') || lowerPos.includes('python') || lowerPos.includes('java')) return 'Backend Engineer';
  if (lowerPos.includes('fullstack') || lowerPos.includes('full-stack') || lowerPos.includes('full stack')) return 'Full Stack Engineer';
  if (lowerPos.includes('devops') || lowerPos.includes('sre') || lowerPos.includes('infrastructure')) return 'DevOps Engineer';
  if (lowerPos.includes('data scientist') || lowerPos.includes('machine learning') || lowerPos.includes('ml engineer')) return 'Data Scientist';
  if (lowerPos.includes('data engineer') || lowerPos.includes('etl') || lowerPos.includes('data pipeline')) return 'Data Engineer';
  if (lowerPos.includes('data analyst') || lowerPos.includes('business analyst')) return 'Data Analyst';
  if (lowerPos.includes('engineer') || lowerPos.includes('developer')) return 'Software Engineer';
  if (lowerPos.includes('ux') || lowerPos.includes('ui') || lowerPos.includes('product design')) return 'Product Designer';
  if (lowerPos.includes('designer')) return 'Designer';
  if (lowerPos.includes('marketing')) return 'Marketing Manager';
  if (lowerPos.includes('sales')) return 'Sales Professional';
  if (lowerPos.includes('founder') || lowerPos.includes('ceo')) return 'Founder';
  if (lowerPos.includes('cto')) return 'CTO';
  if (lowerPos.includes('engineering manager') || lowerPos.includes('em')) return 'Engineering Manager';
  if (lowerPos.includes('tech lead') || lowerPos.includes('technical lead')) return 'Tech Lead';
  return 'Professional';
};

// Pluralize for "Avg Product Managers" display
const extractRole = (position) => {
  const canonical = extractCanonicalTitle(position);
  if (canonical.endsWith('s')) return canonical;
  return canonical + 's';
};

export default function Profile() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [scoreData, setScoreData] = useState(null);
  const [showConsent, setShowConsent] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [badgeCopied, setBadgeCopied] = useState(false);
  const [customPhotoUrl, setCustomPhotoUrl] = useState(null);

  useEffect(() => {
    const init = async () => {
      const currentUser = linkedinAuth.getCurrentUser();
      
      if (!currentUser) {
        navigate(createPageUrl("Login"));
        return;
      }
      
      setUser(currentUser);
      
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

        try {
          const scoreRes = await fetch(`${BACKEND_API_URL}/api/score/me?user_id=${currentUser.id}`);
          const scoreApiData = await scoreRes.json();
          setScoreData(scoreApiData);
          
          // Track profile view in GTM
          if (window.dataLayer) {
            window.dataLayer.push({
              event: 'profile_viewed',
              has_score: scoreApiData?.overall_score ? true : false,
              reviews_received: scoreApiData?.reviews_received || 0
            });
          }
        } catch (err) {
          console.error('Failed to fetch score data:', err);
          setScoreData(null);
        }

        // Fetch custom profile photo
        try {
          const photoRes = await fetch(`${BACKEND_API_URL}/api/profile-photo/${currentUser.id}`);
          const photoData = await photoRes.json();
          if (photoData.success && photoData.photoUrl) {
            setCustomPhotoUrl(photoData.photoUrl);
          }
        } catch (err) {
          console.error('Failed to fetch profile photo:', err);
        }
      }
      
      setIsLoading(false);
    };
    init();
  }, [navigate]);

  const handlePhotoUploadSuccess = (photoUrl) => {
    setCustomPhotoUrl(photoUrl);
    // Reload page to show new photo
    window.location.reload();
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
    const updatedUser = { ...user, recruitment_consent: value };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);
    
    // Track recruiter consent change in GTM
    if (window.dataLayer) {
      window.dataLayer.push({
        event: value ? 'recruiter_consent_enabled' : 'recruiter_consent_disabled',
        reviews_received: scoreData?.reviews_received || 0
      });
    }
    
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

  const overallScore = scoreData?.score?.overall ? parseFloat(scoreData.score.overall) : 0;
  const hasAnyReviews = (scoreData?.reviews_received || 0) > 0;
  const hasEnoughForRecruiters = (scoreData?.reviews_received || 0) >= 3;
  const hasEnoughReviewsGiven = (scoreData?.reviews_received || 0) >= 3; // Badge unlocks when user has 3+ reviews received (verified user)
  
  // Get strength tags from score data (aggregated from reviews)
  const strengthTags = scoreData?.strength_tags || [];
  const wouldWorkAgain = scoreData?.would_work_again || { percent: 0, yes_count: 0, total_count: 0 };
  const reviewerBreakdown = scoreData?.reviewer_breakdown || { peer: 0, manager: 0, direct_report: 0, cross_team: 0 };
  
  // Get percentile tier and role from API (with fallbacks)
  const percentileTier = scoreData?.percentile || { tier: 'Top 20%', emoji: '✓', color: '#84cc16' };
  // Get position from profile data (headline like "Senior AI/AdTech Product Manager")
  const rawPosition = profileData?.position || user?.position || '';
  // Use canonical position (e.g., "Product Manager" not "Senior AI/AdTech Product Manager")
  const roleDisplayName = scoreData?.role_display_name || extractRole(rawPosition);
  // userPosition should be the normalized canonical title (singular) for percentile badge
  const userPosition = scoreData?.user_position || extractCanonicalTitle(rawPosition) || 'Professional';
  const categoryAverages = scoreData?.category_averages || {
    teamwork: 7.2, reliability: 7.0, communication: 6.8, problem_solving: 7.1,
    leadership_impact: 6.5, initiative: 6.9, mentorship: 6.3, strategic_thinking: 6.6
  };
  
  // Use pluralized for "Avg Product Managers", actual position for percentile badge
  const userRole = roleDisplayName;
  
  // Calculate total reviewers
  const totalReviewers = Object.values(reviewerBreakdown).reduce((a, b) => a + b, 0);

  // Copy badge to clipboard function
  const copyBadgeToClipboard = () => {
    const headline = profileData?.position || user.position || 'Professional';
    const badgeText = `${percentileTier.emoji} ${percentileTier.tier} of ${userPosition}`;
    const fullText = `${headline} | ${badgeText}`;
    
    navigator.clipboard.writeText(fullText).then(() => {
      // Track badge copy in GTM
      if (window.dataLayer) {
        window.dataLayer.push({
          event: 'badge_copied',
          badge_tier: percentileTier.tier,
          user_position: userPosition
        });
      }
      
      setBadgeCopied(true);
      setTimeout(() => setBadgeCopied(false), 2000);
    });
  };

  // Human-readable "Would Work Again" response
  const getWorkAgainVerbal = (percent) => {
    if (percent >= 90) return { emoji: '🤩', text: 'Absolutely!', subtext: 'Colleagues would love to work with you again' };
    if (percent >= 75) return { emoji: '😊', text: 'Gladly', subtext: 'Most colleagues would happily work with you again' };
    if (percent >= 60) return { emoji: '🙂', text: 'Sure', subtext: 'Colleagues would be open to working together again' };
    if (percent >= 40) return { emoji: '😐', text: 'Maybe', subtext: 'Mixed feelings about working together again' };
    return { emoji: '😕', text: 'Uncertain', subtext: 'Building your professional reputation' };
  };
  
  const workAgainVerbal = getWorkAgainVerbal(wouldWorkAgain.percent);

  // Human-readable reviewer type labels
  const reviewerTypeLabels = {
    peer: { label: 'Direct Colleagues', description: 'Worked directly as peers', icon: '👥' },
    manager: { label: 'Managers', description: 'Managed or supervised you', icon: '👔' },
    direct_report: { label: 'Direct Reports', description: 'You managed them', icon: '📋' },
    cross_team: { label: 'Cross-Team', description: 'Collaborated across teams', icon: '🔗' },
    other: { label: 'Other Professionals', description: 'Professional connections', icon: '🤝' }
  };

  const handleShareLinkedIn = () => {
    const text = `I just received my professional peer review score on Estimate! Check out how your colleagues really see you. 🎯`;
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent('https://estimatenow.io')}&title=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'width=600,height=400');
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText('https://estimatenow.io');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-4 sm:py-8 px-3 sm:px-4">
      <div className="max-w-5xl mx-auto">
        
        {hasAnyReviews ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* Single Hero Section - Everything in One Card */}
            <Card className="p-4 sm:p-6 md:p-8 border-0 shadow-xl shadow-gray-200/50">
              
              {/* Top Row: Profile Info + Score */}
              <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6 pb-4 sm:pb-6 border-b border-gray-100">
                
                {/* Left: Avatar and Info */}
                <div className="flex items-start gap-3 sm:gap-4 flex-1 w-full">
                  {/* Profile Picture with Estimate Verified Badge Overlay */}
                  <div className="relative group">
                    <div 
                      className={`relative w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 rounded-full overflow-hidden ${hasEnoughReviewsGiven ? 'cursor-pointer' : 'cursor-default'}`}
                      onClick={(e) => {
                        if (!hasEnoughReviewsGiven) {
                          e.preventDefault();
                          e.stopPropagation();
                          return false;
                        }
                        navigate('/badge-creator');
                      }}
                    >
                      {/* Profile Image */}
                      <img 
                        src={customPhotoUrl ? `${BACKEND_API_URL}${customPhotoUrl}` : (profileData?.avatar || user.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'User')}&background=0A66C2&color=fff&size=200`)}
                        alt={user.name}
                        crossOrigin="anonymous"
                        className="w-full h-full rounded-full object-cover shadow-lg"
                      />
                      {/* Estimate Verified Badge Overlay - Show for all users */}
                      <img 
                        src="/images/Estimat_Verified.png"
                        alt="Estimate Verified"
                        className="absolute inset-0 w-full h-full pointer-events-none rounded-full"
                      />
                      {/* Hover overlay - Only show for users with 3+ reviews */}
                      {hasEnoughReviewsGiven && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                          <span className="text-white text-xs font-medium">
                            Create Badge
                          </span>
                        </div>
                      )}
                    </div>
                    {/* Tooltip for locked state */}
                    {!hasEnoughReviewsGiven && (
                      <div className="absolute left-0 top-full mt-2 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                        <p className="font-medium mb-1">🔒 Badge Creator Locked</p>
                        <p>Receive 3 reviews to unlock the Estimate Verified badge creator. You currently have {scoreData?.reviews_received || 0} review{(scoreData?.reviews_received || 0) !== 1 ? 's' : ''} received.</p>
                        <div className="absolute -top-1 left-4 w-2 h-2 bg-gray-900 rotate-45"></div>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h1 className="text-lg sm:text-xl font-bold text-gray-900 mb-0.5 leading-tight">
                      {profileData?.name || user.name || 'Professional'}
                    </h1>
                    <div className="mb-2">
                      <p className="text-xs sm:text-sm text-gray-500 inline">
                        {profileData?.position || user.position || 'Professional'}
                      </p>
                      {/* Badge Preview - Grayed with hover-to-copy */}
                      {hasAnyReviews && (
                        <div className="inline-block relative group ml-1">
                          <button
                            onClick={copyBadgeToClipboard}
                            className="text-xs sm:text-sm text-gray-400 hover:text-[#0A66C2] transition-colors cursor-pointer border-0 bg-transparent p-0"
                          >
                            <span className="border-l border-gray-300 pl-1.5">
                              {percentileTier.tier} of {userPosition}
                            </span>
                          </button>
                          {/* Tooltip */}
                          <div className="absolute left-0 bottom-full mb-2 w-48 p-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                            <p>Copy badge for LinkedIn</p>
                            <div className="absolute -bottom-1 left-4 w-2 h-2 bg-gray-900 rotate-45"></div>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400 mb-2">
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" /> {scoreData?.reviews_received || 0} reviews received
                      </span>
                      <span className="text-gray-300">•</span>
                      <span className="flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> {scoreData?.reviews_given || 0} reviews given
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Score Circle - Smaller on mobile, centered */}
                <div className="flex flex-col items-center w-full sm:w-auto mt-3 sm:mt-0">
                  <div className={`w-24 h-24 sm:w-20 sm:h-20 rounded-full flex flex-col items-center justify-center border-4 shadow-lg ${
                    overallScore >= 8 ? 'border-emerald-500 bg-white' :
                    overallScore >= 6 ? 'border-yellow-500 bg-white' :
                    'border-orange-500 bg-white'
                  }`}>
                    <span className={`text-3xl sm:text-2xl font-bold ${
                      overallScore >= 8 ? 'text-emerald-600' :
                      overallScore >= 6 ? 'text-yellow-600' :
                      'text-orange-600'
                    }`}>
                      {overallScore.toFixed(1)}
                    </span>
                    <span className="text-[9px] sm:text-[9px] text-gray-400 mt-0.5">out of 10</span>
                  </div>
                  <p 
                    className="text-[11px] sm:text-[10px] font-medium mt-2 px-2.5 py-1 rounded-md"
                    style={{ 
                      backgroundColor: `${percentileTier.color}20`, 
                      color: percentileTier.color 
                    }}
                  >
                    {percentileTier.emoji} {percentileTier.tier} of {userPosition}
                  </p>
                </div>
              </div>

              {/* Middle Row: Would Work Again + Top Strengths */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 py-4 sm:py-6 border-b border-gray-100">
                
                {/* Would Work Again - Blurred until 3+ reviews */}
                <div className="relative">
                  <p className="text-sm sm:text-base font-semibold text-gray-900 mb-2 sm:mb-3">Would Work Again?</p>
                  {(scoreData?.reviews_received || 0) >= 3 ? (
                    <>
                      <div className="flex items-center gap-3 mb-2">
                        <div className="text-3xl">{workAgainVerbal.emoji}</div>
                        <div>
                          <p className="font-semibold text-gray-800">{workAgainVerbal.text}</p>
                          <p className="text-xs text-gray-500">{workAgainVerbal.subtext}</p>
                        </div>
                      </div>
                      {/* Response breakdown */}
                      <div className="flex flex-wrap gap-2 mt-2">
                        {wouldWorkAgain.breakdown ? (
                          Object.entries(wouldWorkAgain.breakdown).map(([response, count]) => {
                            if (count === 0) return null;
                            return (
                              <span key={response} className="text-[10px] px-2 py-1 bg-gray-100 rounded-full text-gray-600">
                                {count} said "{response}"
                              </span>
                            );
                          })
                        ) : (
                          <span className="text-[10px] text-gray-400">
                            {wouldWorkAgain.yes_count} of {wouldWorkAgain.total_count} reviewers would gladly work together again
                          </span>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="relative">
                      <div className="blur-sm select-none pointer-events-none">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="text-3xl">😊</div>
                          <div>
                            <p className="font-semibold text-gray-800">Gladly</p>
                            <p className="text-xs text-gray-500">Most colleagues would happily work with you again</p>
                          </div>
                        </div>
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center bg-white/60 rounded-lg">
                        <p className="text-xs text-gray-500 text-center px-4">
                          🔒 Unlocks after 3 reviews<br/>
                          <span className="text-[10px] text-gray-400">{3 - (scoreData?.reviews_received || 0)} more to go</span>
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Top Strengths */}
                <div>
                  <p className="text-sm sm:text-base font-semibold text-gray-900 mb-2">Top Strengths</p>
                  <div className="flex flex-wrap gap-2">
                    {(strengthTags.length > 0 ? strengthTags : [
                      { tag: 'Problem Solver', count: 1 },
                      { tag: 'Great Communicator', count: 1 }
                    ]).slice(0, 3).map((item, index) => (
                      <span
                        key={item.tag || index}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-md text-xs font-medium text-amber-800"
                      >
                        {strengthTagIcons[item.tag] || <Star className="w-3 h-3" />}
                        {item.tag}
                        {item.count > 1 && <span className="text-amber-500 ml-1">×{item.count}</span>}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Score Breakdown Row - Bar Chart Style */}
              <div className="py-4 sm:py-6 border-b border-gray-100">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3 sm:mb-4">
                  <p className="text-sm sm:text-base font-semibold text-gray-900">Score Breakdown</p>
                  <div className="flex items-center gap-3 sm:gap-4 text-[9px] sm:text-[10px]">
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-sm bg-emerald-500"></span> Your Score
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-sm bg-gray-300"></span> Avg {userRole}
                    </span>
                  </div>
                </div>
                <div className="space-y-2 sm:space-y-3">
                  {scoreCategories.map((category, index) => {
                    const score = scoreData?.score?.[category.key];
                    if (!score) return null;
                    
                    const numScore = parseFloat(score);
                    // Get the average for this category from API (cold start defaults)
                    const positionAvg = categoryAverages[category.key] || 7.0;
                    
                    return (
                      <motion.div
                        key={category.key}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-center gap-2 sm:gap-3"
                      >
                        <span className="text-[10px] sm:text-xs text-gray-600 w-20 sm:w-24 flex-shrink-0">{category.label}</span>
                        <div className="flex-1 relative h-5 sm:h-6">
                          {/* Background bar (position average) */}
                          <div 
                            className="absolute top-1 h-3 sm:h-4 bg-gray-200 rounded"
                            style={{ width: `${(positionAvg / 10) * 100}%` }}
                          />
                          {/* Your score bar */}
                          <div 
                            className={`absolute top-1 h-3 sm:h-4 rounded ${getScoreBadgeColor(numScore)}`}
                            style={{ width: `${(numScore / 10) * 100}%` }}
                          />
                          {/* Position average marker */}
                          <div 
                            className="absolute top-0 h-5 sm:h-6 w-0.5 bg-gray-400"
                            style={{ left: `${(positionAvg / 10) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs sm:text-sm font-bold text-gray-900 w-7 sm:w-8 text-right">{numScore.toFixed(1)}</span>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Comments Section */}
              {scoreData?.comments && scoreData.comments.length > 0 && (
                <div className="py-4 sm:py-6 border-b border-gray-100">
                  <p className="text-sm sm:text-base font-semibold text-gray-900 mb-3">What Colleagues Said</p>
                  <div className="space-y-3">
                    {scoreData.comments.slice(0, 5).map((item, index) => (
                      <div key={index} className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                        <p className="text-sm text-gray-700 italic">"{item.comment}"</p>
                      </div>
                    ))}
                  </div>
                  {scoreData.comments.length > 5 && (
                    <p className="text-xs text-gray-400 mt-2 text-center">
                      Showing 5 of {scoreData.comments.length} comments
                    </p>
                  )}
                </div>
              )}

              {/* Bottom Row: Who Reviewed (LEFT) + Share Button (RIGHT) */}
              <div className="pt-4 sm:pt-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                {/* Who Reviewed - LEFT */}
                <div>
                  <p className="text-[11px] sm:text-xs font-medium text-gray-500 mb-2">Who reviewed you:</p>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {Object.entries(reviewerBreakdown).map(([type, count]) => {
                      if (count === 0) return null;
                      const typeInfo = reviewerTypeLabels[type];
                      return (
                        <div key={type} className="flex items-center gap-2 px-2 py-1.5 bg-gray-50 rounded-lg">
                          <span className="text-base">{typeInfo.icon}</span>
                          <div>
                            <p className="text-[11px] font-medium text-gray-700">{count} {typeInfo.label}</p>
                            <p className="text-[9px] text-gray-400">{typeInfo.description}</p>
                          </div>
                        </div>
                      );
                    })}
                    {totalReviewers === 0 && (
                      <p className="text-[10px] text-gray-400">Details appear after more reviews</p>
                    )}
                  </div>
                </div>

                {/* Open for Recruiters - More prominent with toggle */}
                <div className="relative group">
                  <div className={`inline-flex items-center gap-3 px-4 py-3 rounded-lg border-2 ${
                    user.recruitment_consent 
                      ? 'bg-green-50 border-green-500' 
                      : hasEnoughForRecruiters 
                        ? 'bg-blue-50 border-blue-500 hover:bg-blue-100 cursor-pointer' 
                        : 'bg-purple-50 border-purple-400 opacity-80'
                  }`}
                  onClick={() => {
                    if (hasEnoughForRecruiters) {
                      handleConsentToggle(!user.recruitment_consent);
                    }
                  }}
                  >
                    <CheckCircle2 className={`w-5 h-5 ${
                      user.recruitment_consent 
                        ? 'text-green-600' 
                        : hasEnoughForRecruiters 
                          ? 'text-blue-600' 
                          : 'text-purple-400'
                    }`} />
                    <span className={`text-sm font-semibold ${
                      user.recruitment_consent 
                        ? 'text-green-700' 
                        : hasEnoughForRecruiters 
                          ? 'text-blue-700' 
                          : 'text-purple-600'
                    }`}>
                      {user.recruitment_consent ? 'Visible to Recruiters' : 'Open for Recruiters'}
                    </span>
                    <Switch 
                      checked={user.recruitment_consent || false}
                      onCheckedChange={handleConsentToggle}
                      disabled={isUpdating || !hasEnoughForRecruiters}
                      className="scale-90"
                    />
                  </div>
                  {/* Tooltip */}
                  {!hasEnoughForRecruiters && (
                    <div className="absolute left-0 bottom-full mb-2 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                      <p className="font-medium mb-1">🔒 Locked</p>
                      <p>You need at least 3 reviews to enable recruiter visibility. You currently have {scoreData?.reviews_received || 0} review{(scoreData?.reviews_received || 0) !== 1 ? 's' : ''}.</p>
                      <div className="absolute -bottom-1 left-4 w-2 h-2 bg-gray-900 rotate-45"></div>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </motion.div>
        ) : (
          <WaitingState 
            reviewsReceived={scoreData?.reviews_received || 0}
            reviewsGiven={scoreData?.reviews_given || 0}
            reviewsNeeded={3}
          />
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