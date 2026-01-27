import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { linkedinAuth } from "@/lib/linkedinAuth";
import { Loader2, Lock, CheckCircle, User } from "lucide-react";
import WaitingState from "@/components/profile/WaitingState";
import { RequestReviewModal } from "@/components/tokens";
import { behavioralConfig } from "@/config/behavioralConfig";

const BACKEND_API_URL = import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:3001';

const PercentileBar = ({ percentile }) => {
  if (!percentile && percentile !== 0) return null;
  const barFill = 100 - percentile;
  return (
    <div className="flex items-center gap-2 sm:gap-3 mt-2">
      <div className="flex-1 h-1 bg-gray-200 rounded-full overflow-hidden">
        <div className="h-full bg-[#0a66c2] rounded-full" style={{ width: `${barFill}%` }} />
      </div>
      <span className="text-xs sm:text-sm text-gray-500 min-w-[55px] sm:min-w-[65px]">Top {percentile}%</span>
    </div>
  );
};

export default function ProfileLinkedIn() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [scoreData, setScoreData] = useState(null);
  const [dimensionScores, setDimensionScores] = useState(null);
  const [showRequestModal, setShowRequestModal] = useState(false);

  useEffect(() => {
    const init = async () => {
      const currentUser = linkedinAuth.getCurrentUser();
      if (!currentUser) { navigate(createPageUrl("Login")); return; }
      setUser(currentUser);
      
      try {
        // Fetch profile data including avatar
        if (currentUser.linkedinProfileId) {
          const profileRes = await fetch(`${BACKEND_API_URL}/api/colleagues/profile/${currentUser.linkedinProfileId}/colleagues`);
          const profileJson = await profileRes.json();
          if (profileJson.success && profileJson.profile) setProfileData(profileJson.profile);
        }
        
        const scoreRes = await fetch(`${BACKEND_API_URL}/api/score/me?user_id=${currentUser.id}`);
        const scoreJson = await scoreRes.json();
        setScoreData(scoreJson);
        setDimensionScores(scoreJson.dimension_scores || null);
        
        // If no avatar yet, try to get from score response
        if (scoreJson.avatar) {
          setProfileData(prev => ({ ...prev, avatar: scoreJson.avatar }));
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
      <div className="min-h-screen bg-[#f3f2ef] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#0a66c2]" />
      </div>
    );
  }

  const hasAnyReviews = (scoreData?.reviews_received || 0) > 0;
  const firstName = user?.name?.split(' ')[0] || 'User';
  const initials = user?.name?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'U';
  
  // Get avatar from multiple sources - prioritize user.picture (from localStorage) like header does
  const avatarUrl = user?.picture || scoreData?.avatar || profileData?.avatar || user?.avatar;
  const fallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&background=0A66C2&color=fff&size=120`;
  
  const strengthTags = scoreData?.strength_tags || [];
  const neverWorryAbout = scoreData?.never_worry_about || [];
  const quotes = (scoreData?.comments || []).map(c => ({ text: c.comment, context: c.context || c.company_name }));
  const roomToGrow = scoreData?.room_to_grow || [];
  
  const workAgainPct = scoreData?.work_again_absolutely_pct || scoreData?.would_work_again?.percent;
  const startupHirePct = scoreData?.startup_hire_pct;
  const harderJobPct = scoreData?.harder_job_pct;
  
  // Recruiter-focused data
  const reviewerBreakdown = scoreData?.reviewer_breakdown || {};
  const companies = scoreData?.companies || [];
  const companyCount = scoreData?.company_count || companies.length;
  const timeContext = scoreData?.time_context;
  const percentileTier = scoreData?.percentile?.tier || 'Top 25%';
  const userPosition = scoreData?.user_position || 'Professional';
  
  // Format reviewer breakdown for display
  const reviewerTypes = [];
  if (reviewerBreakdown.manager > 0) reviewerTypes.push(`${reviewerBreakdown.manager} manager${reviewerBreakdown.manager > 1 ? 's' : ''}`);
  if (reviewerBreakdown.peer > 0) reviewerTypes.push(`${reviewerBreakdown.peer} peer${reviewerBreakdown.peer > 1 ? 's' : ''}`);
  if (reviewerBreakdown.direct_report > 0) reviewerTypes.push(`${reviewerBreakdown.direct_report} direct report${reviewerBreakdown.direct_report > 1 ? 's' : ''}`);
  if (reviewerBreakdown.cross_team > 0) reviewerTypes.push(`${reviewerBreakdown.cross_team} cross-team`);
  if (reviewerBreakdown.other > 0) reviewerTypes.push(`${reviewerBreakdown.other} other`);

  if (!hasAnyReviews) {
    return (
      <div className="min-h-screen bg-[#f3f2ef] p-4 sm:p-6">
        <div className="max-w-[900px] mx-auto">
          <WaitingState 
            reviewsGiven={scoreData?.reviews_given || 0}
            reviewsNeeded={3}
            onStartReviewing={() => navigate(createPageUrl("Review"))}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f3f2ef] p-3 sm:p-4 md:p-6">
      <div className="max-w-[900px] mx-auto space-y-2">
        
        {/* Header Card */}
        <div className="bg-white rounded-lg overflow-hidden shadow-[0_0_0_1px_rgba(0,0,0,0.08)]">
          {/* Cover Photo */}
          <div className="h-16 sm:h-20 md:h-28 bg-gradient-to-br from-[#0a66c2] to-[#004182]" />
          
          {/* Profile Section */}
          <div className="px-3 sm:px-4 md:px-6 pb-4 md:pb-6 relative">
            {/* Avatar - Responsive sizing */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-28 md:h-28 rounded-full border-2 sm:border-4 border-white absolute -top-8 sm:-top-10 md:-top-14 bg-gradient-to-br from-blue-50 to-blue-100 overflow-hidden shadow-lg">
              <img 
                src={avatarUrl || fallbackAvatar} 
                alt={user?.name} 
                className="w-full h-full object-cover"
                onError={(e) => { e.target.src = fallbackAvatar; }}
              />
            </div>
            
            {/* Content next to avatar - Mobile: below avatar, Desktop: beside */}
            <div className="pt-10 sm:pt-12 md:pt-0 md:ml-32 lg:ml-36">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 sm:gap-3">
                <div className="min-w-0">
                  <h1 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-900 truncate">{user?.name}</h1>
                  <p className="text-sm sm:text-base text-gray-700 mt-0.5 line-clamp-2">{profileData?.position || user?.position}</p>
                  <p className="text-xs sm:text-sm text-gray-500 mt-0.5">{profileData?.location || scoreData?.location || 'Professional'}</p>
                </div>
                
                {/* Peer Verified Badge */}
                <div className="flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 bg-blue-50 rounded border border-blue-200 self-start flex-shrink-0">
                  <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" viewBox="0 0 16 16" fill="#0a66c2">
                    <path d="M8 0L10.2 2.4H13.6V5.8L16 8L13.6 10.2V13.6H10.2L8 16L5.8 13.6H2.4V10.2L0 8L2.4 5.8V2.4H5.8L8 0Z"/>
                    <path d="M7 9.5L5.5 8L4.5 9L7 11.5L12 6.5L11 5.5L7 9.5Z" fill="white"/>
                  </svg>
                  <span className="text-xs sm:text-sm font-semibold text-[#0a66c2]">Peer Verified</span>
                </div>
              </div>
              
              {/* Stats */}
              <div className="flex gap-4 sm:gap-6 mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-200 text-sm">
                <div>
                  <span className="font-semibold text-gray-900">{scoreData?.reviews_received || 0}</span>
                  <span className="text-gray-500"> peer reviews</span>
                </div>
                <div>
                  <span className="font-semibold text-gray-900">{scoreData?.reviews_given || 0}</span>
                  <span className="text-gray-500"> reviews given</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recruiter Credibility Bar - Overall tier + reviewer breakdown + companies + time */}
        <div className="bg-white rounded-lg p-3 sm:p-4 md:p-5 shadow-[0_0_0_1px_rgba(0,0,0,0.08)]">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            {/* Overall Tier Badge */}
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-[#0a66c2] to-[#004182] flex items-center justify-center flex-shrink-0">
                <span className="text-white text-sm sm:text-lg font-bold">
                  {percentileTier.replace('Top ', '').replace('%', '')}
                </span>
              </div>
              <div>
                <div className="text-sm sm:text-base font-semibold text-gray-900">{percentileTier} of {userPosition}s</div>
                <div className="text-[10px] sm:text-xs text-gray-500">Based on peer assessments</div>
              </div>
            </div>
            
            {/* Quick Stats */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-[10px] sm:text-xs">
              {/* Reviewer Types */}
              {reviewerTypes.length > 0 && (
                <div className="flex items-center gap-1.5 px-2 py-1 bg-blue-50 rounded-full text-[#0a66c2]">
                  <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
                  </svg>
                  <span className="font-medium">{reviewerTypes.join(', ')}</span>
                </div>
              )}
              
              {/* Companies */}
              {companyCount > 0 && (
                <div className="flex items-center gap-1.5 px-2 py-1 bg-green-50 rounded-full text-green-700">
                  <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd"/>
                  </svg>
                  <span className="font-medium">{companyCount} {companyCount === 1 ? 'company' : 'companies'}</span>
                </div>
              )}
              
              {/* Time Context */}
              {timeContext && (
                <div className="flex items-center gap-1.5 px-2 py-1 bg-amber-50 rounded-full text-amber-700">
                  <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/>
                  </svg>
                  <span className="font-medium">{timeContext.years_of_data}+ year{timeContext.years_of_data > 1 ? 's' : ''} of data</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Companies List */}
          {companies.length > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <div className="text-[10px] sm:text-xs text-gray-500 mb-1.5">Verified at:</div>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {companies.map((company, idx) => (
                  <span key={idx} className="px-2 py-0.5 sm:py-1 bg-gray-100 rounded text-[10px] sm:text-xs text-gray-700 font-medium">
                    {company}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Key Metrics Card */}
        {(workAgainPct || startupHirePct || harderJobPct) && (
          <div className="bg-white rounded-lg p-4 sm:p-5 md:p-6 shadow-[0_0_0_1px_rgba(0,0,0,0.08)]">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 md:mb-5">Colleague Endorsements</h2>
            <div className="grid grid-cols-3 gap-2 sm:gap-4 md:gap-6">
              {[
                { value: workAgainPct, label: 'Would work with again' },
                { value: startupHirePct, label: 'Would recruit to their team' },
                { value: harderJobPct, label: 'Want on tough projects' }
              ].map((metric, idx) => (
                <div key={idx} className="text-center p-2 sm:p-4 md:p-5 bg-gray-50 rounded-lg">
                  <div className="text-xl sm:text-2xl md:text-4xl font-semibold text-[#0a66c2]">
                    {metric.value || '—'}{metric.value ? '%' : ''}
                  </div>
                  <div className="text-[10px] sm:text-xs md:text-sm text-gray-500 mt-1 sm:mt-2 leading-tight">
                    {metric.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Two Column Layout - Stack on mobile */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {/* Left Column - Skills */}
          <div className="bg-white rounded-lg p-4 sm:p-5 md:p-6 shadow-[0_0_0_1px_rgba(0,0,0,0.08)]">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-0.5">Workplace Skills</h2>
            <p className="text-xs sm:text-sm text-gray-500 mb-4 sm:mb-5">Based on peer assessments</p>
            <div className="space-y-4 sm:space-y-5">
              {dimensionScores && Object.entries(dimensionScores).map(([key, data]) => {
                const dim = behavioralConfig.dimensions[key];
                if (!dim) return null;
                return (
                  <div key={key}>
                    <div className="font-semibold text-gray-900 text-sm sm:text-base">{dim.name}</div>
                    <div className="text-xs sm:text-sm text-gray-500 mt-0.5 line-clamp-2">{dim.description}</div>
                    <PercentileBar percentile={data.percentile} />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-2">
            {/* Top Qualities */}
            <div className="bg-white rounded-lg p-4 sm:p-5 md:p-6 shadow-[0_0_0_1px_rgba(0,0,0,0.08)]">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Top Qualities</h2>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {strengthTags.map((tag, idx) => (
                  <div 
                    key={idx} 
                    className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm ${
                      idx < 3 
                        ? 'bg-blue-50 border border-blue-200 text-[#0a66c2] font-semibold' 
                        : 'bg-gray-100 border border-gray-200 text-gray-700'
                    }`}
                  >
                    <span>{tag.tag || tag.label}</span>
                    <span className={`text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full font-semibold ${
                      idx < 3 ? 'bg-blue-100 text-blue-800' : 'bg-gray-200 text-gray-600'
                    }`}>
                      {tag.count || tag.votes || 1}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* What You Can Count On */}
            {neverWorryAbout.length > 0 && (
              <div className="bg-white rounded-lg p-4 sm:p-5 md:p-6 shadow-[0_0_0_1px_rgba(0,0,0,0.08)]">
                <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">What You Can Count On</h2>
                <div className="space-y-2 sm:space-y-2.5">
                  {neverWorryAbout.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 bg-green-50 rounded-md text-xs sm:text-sm text-green-700">
                      <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0" />
                      <span className="font-medium">No {item.toLowerCase()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Peer Feedback */}
        {quotes.length > 0 && (
          <div className="bg-white rounded-lg p-4 sm:p-5 md:p-6 shadow-[0_0_0_1px_rgba(0,0,0,0.08)]">
            <div className="flex justify-between items-center mb-4 sm:mb-5">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900">Peer Feedback</h2>
              <span className="text-xs sm:text-sm text-[#0a66c2] cursor-pointer hover:underline">Show all {quotes.length} →</span>
            </div>
            <div className="space-y-3 sm:space-y-4">
              {quotes.slice(0, 3).map((quote, idx) => (
                <div key={idx} className="p-3 sm:p-4 md:p-5 bg-gray-50 rounded-lg border-l-3 border-l-[#0a66c2]" style={{ borderLeftWidth: '3px' }}>
                  <p className="text-sm sm:text-base text-gray-900 leading-relaxed">"{quote.text}"</p>
                  <div className="flex items-center gap-2 sm:gap-3 mt-3 sm:mt-4">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                      <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500" />
                    </div>
                    <div>
                      <div className="text-xs sm:text-sm font-semibold text-gray-900">Anonymous Colleague</div>
                      {quote.context && <div className="text-[10px] sm:text-xs text-gray-500">{quote.context}</div>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Growth Areas - Private */}
        {roomToGrow.length > 0 && (
          <div className="bg-white rounded-lg p-4 sm:p-5 md:p-6 shadow-[0_0_0_1px_rgba(0,0,0,0.08)] border border-dashed border-gray-300">
            <div className="flex items-center gap-2 mb-3 sm:mb-4 flex-wrap">
              <Lock className="w-4 h-4 text-gray-500" />
              <h2 className="text-base sm:text-lg font-semibold text-gray-900">Growth Areas</h2>
              <span className="text-[10px] sm:text-xs bg-gray-100 px-2 py-1 rounded text-gray-500 font-medium">Only visible to you</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {roomToGrow.map((item, idx) => (
                <div 
                  key={idx} 
                  className={`p-3 sm:p-4 rounded-md ${idx === 0 ? 'bg-amber-50 border-l-amber-400' : 'bg-gray-50 border-l-gray-400'}`}
                  style={{ borderLeftWidth: '3px' }}
                >
                  {item.title && (
                    <div className={`font-semibold text-xs sm:text-sm mb-1 ${idx === 0 ? 'text-amber-800' : 'text-gray-600'}`}>
                      {item.title}
                    </div>
                  )}
                  <div className={`text-xs sm:text-sm leading-relaxed ${idx === 0 ? 'text-amber-700' : 'text-gray-500'}`}>
                    "{item.text || item}"
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center py-4 sm:py-6 text-gray-500 text-xs sm:text-sm">
          Based on {scoreData?.reviews_received || 0} anonymous peer reviews · Last updated {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </div>
      </div>

      {showRequestModal && (
        <RequestReviewModal userId={user?.id} onClose={() => setShowRequestModal(false)} onSuccess={() => setShowRequestModal(false)} />
      )}
    </div>
  );
}
