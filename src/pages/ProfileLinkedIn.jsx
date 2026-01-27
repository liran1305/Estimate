import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { linkedinAuth } from "@/lib/linkedinAuth";
import { Loader2, Lock, CheckCircle, User } from "lucide-react";
import WaitingState from "@/components/profile/WaitingState";
import { RequestReviewModal } from "@/components/tokens";
import { behavioralConfig } from "@/config/behavioralConfig";
import { getRoleConfig, calculateSkillComparison } from "@/config/roleSkillsConfig";

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

  // Role-based skills comparison
  const roleConfig = getRoleConfig(userPosition);
  const skillsComparison = roleConfig.allSkills.map(skillKey => {
    const dim = behavioralConfig.dimensions[skillKey];
    const userPercentile = dimensionScores?.[skillKey]?.percentile;
    const avgPercentile = roleConfig.avgBenchmarks[skillKey];
    const comparison = userPercentile ? calculateSkillComparison(userPercentile, avgPercentile) : null;
    const isKeySkill = roleConfig.keySkills.includes(skillKey);
    
    return {
      key: skillKey,
      name: dim?.name || skillKey,
      description: dim?.description || '',
      userPercentile,
      avgPercentile,
      comparison,
      isKeySkill,
      isAboveAverage: comparison?.isAboveAverage || false
    };
  }).filter(s => s.userPercentile); // Only show skills with data
  
  // Sort: above average first, then by difference
  const sortedSkills = [...skillsComparison].sort((a, b) => {
    if (a.isAboveAverage && !b.isAboveAverage) return -1;
    if (!a.isAboveAverage && b.isAboveAverage) return 1;
    return (b.comparison?.difference || 0) - (a.comparison?.difference || 0);
  });
  
  // Count standout skills (above average)
  const standoutSkills = sortedSkills.filter(s => s.isAboveAverage);

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

        {/* Credibility Summary - LinkedIn Professional Style */}
        <div className="bg-white rounded-lg shadow-[0_0_0_1px_rgba(0,0,0,0.08)] overflow-hidden">
          {/* Main Content */}
          <div className="p-4 sm:p-5">
            {/* Title Row */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base sm:text-lg font-semibold text-[#191919]">Credibility Summary</h2>
              <div className="flex items-center gap-1.5 text-[#0a66c2]">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
                <span className="text-xs sm:text-sm font-medium">Verified</span>
              </div>
            </div>
            
            {/* Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              {/* Overall Ranking */}
              <div className="col-span-2 sm:col-span-1 bg-gradient-to-br from-[#0a66c2] to-[#004182] rounded-lg p-3 sm:p-4 text-white">
                <div className="text-2xl sm:text-3xl font-bold">{percentileTier.replace('Top ', '')}</div>
                <div className="text-xs sm:text-sm opacity-90 mt-0.5">of {userPosition}s</div>
              </div>
              
              {/* Reviewed By */}
              <div className="bg-[#f3f2ef] rounded-lg p-3 sm:p-4">
                <div className="text-lg sm:text-xl font-semibold text-[#191919]">
                  {(reviewerBreakdown.manager || 0) + (reviewerBreakdown.peer || 0) + (reviewerBreakdown.direct_report || 0) + (reviewerBreakdown.cross_team || 0) + (reviewerBreakdown.other || 0)}
                </div>
                <div className="text-xs sm:text-sm text-[#666666] mt-0.5">Reviewers</div>
                {reviewerTypes.length > 0 && (
                  <div className="text-[10px] sm:text-xs text-[#0a66c2] mt-1 font-medium">{reviewerTypes.slice(0, 2).join(', ')}</div>
                )}
              </div>
              
              {/* Companies */}
              <div className="bg-[#f3f2ef] rounded-lg p-3 sm:p-4">
                <div className="text-lg sm:text-xl font-semibold text-[#191919]">{companyCount}</div>
                <div className="text-xs sm:text-sm text-[#666666] mt-0.5">{companyCount === 1 ? 'Company' : 'Companies'}</div>
                {companies.length > 0 && (
                  <div className="text-[10px] sm:text-xs text-[#0a66c2] mt-1 font-medium truncate">{companies[0]}</div>
                )}
              </div>
              
              {/* Time Span */}
              <div className="bg-[#f3f2ef] rounded-lg p-3 sm:p-4">
                <div className="text-lg sm:text-xl font-semibold text-[#191919]">{timeContext?.years_of_data || 1}+</div>
                <div className="text-xs sm:text-sm text-[#666666] mt-0.5">{(timeContext?.years_of_data || 1) === 1 ? 'Year' : 'Years'} of data</div>
                <div className="text-[10px] sm:text-xs text-[#666666] mt-1">Working relationships</div>
              </div>
            </div>
          </div>
          
          {/* Companies Footer */}
          {companies.length > 1 && (
            <div className="px-4 sm:px-5 py-3 bg-[#f9fafb] border-t border-[#e5e5e5]">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-[#666666]">Verified at:</span>
                {companies.map((company, idx) => (
                  <span key={idx} className="text-xs font-medium text-[#191919]">
                    {company}{idx < companies.length - 1 ? ' · ' : ''}
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
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-2">
          {/* Left Column - Skills Comparison Table (wider) */}
          <div className="lg:col-span-3 bg-white rounded-lg shadow-[0_0_0_1px_rgba(0,0,0,0.08)] overflow-hidden">
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base sm:text-lg font-semibold text-[#191919]">Skills vs. {roleConfig.pluralName}</h2>
                  <p className="text-xs sm:text-sm text-[#666666] mt-0.5">How you compare to average {roleConfig.displayName.toLowerCase()}s</p>
                </div>
                {standoutSkills.length > 0 && (
                  <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-green-50 rounded-full text-green-700 text-xs font-medium">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Above avg in {standoutSkills.length} skill{standoutSkills.length > 1 ? 's' : ''}</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#f9fafb] text-[10px] sm:text-xs text-[#666666] uppercase tracking-wider">
                    <th className="text-left px-4 py-2.5 font-medium">Skill</th>
                    <th className="text-center px-2 py-2.5 font-medium">You</th>
                    <th className="text-center px-2 py-2.5 font-medium">Avg {roleConfig.displayName.split(' ')[0]}</th>
                    <th className="text-center px-2 py-2.5 font-medium">vs. Peers</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {sortedSkills.map((skill, idx) => (
                    <tr key={skill.key} className={skill.isAboveAverage ? 'bg-green-50/30' : ''}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm text-[#191919]">{skill.name}</span>
                          {skill.isKeySkill && (
                            <span className="px-1.5 py-0.5 bg-[#0a66c2] text-white text-[9px] sm:text-[10px] rounded font-medium uppercase">Key</span>
                          )}
                        </div>
                      </td>
                      <td className="text-center px-2 py-3">
                        <span className="font-semibold text-sm text-[#191919]">Top {skill.userPercentile}%</span>
                      </td>
                      <td className="text-center px-2 py-3">
                        <span className="text-sm text-[#666666]">Top {skill.avgPercentile}%</span>
                      </td>
                      <td className="text-center px-2 py-3">
                        {skill.comparison && (
                          <span className={`inline-flex items-center gap-0.5 font-semibold text-sm ${
                            skill.isAboveAverage ? 'text-green-600' : skill.comparison.difference < 0 ? 'text-amber-600' : 'text-gray-500'
                          }`}>
                            {skill.comparison.displayDiff}
                            <span className="text-xs">{skill.comparison.arrow}</span>
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Standout Summary */}
            {standoutSkills.length > 0 && (
              <div className="px-4 py-3 bg-green-50 border-t border-green-100">
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <span className="font-medium text-green-800">Standout for {roleConfig.pluralName}: </span>
                    <span className="text-green-700">
                      {standoutSkills.map((s, i) => (
                        <span key={s.key}>
                          {s.name} (Top {s.userPercentile}%)
                          {i < standoutSkills.length - 1 ? ', ' : ''}
                        </span>
                      ))}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column */}
          <div className="lg:col-span-2 space-y-2">
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
