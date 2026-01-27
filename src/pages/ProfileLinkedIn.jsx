import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { linkedinAuth } from "@/lib/linkedinAuth";
import { Loader2 } from "lucide-react";
import WaitingState from "@/components/profile/WaitingState";
import { RequestReviewModal } from "@/components/tokens";
import { behavioralConfig } from "@/config/behavioralConfig";

const BACKEND_API_URL = import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:3001';

const LINKEDIN_BLUE = '#0a66c2';

const PercentileBar = ({ percentile }) => {
  if (!percentile && percentile !== 0) return null;
  // percentile is already "Top X%" value (e.g., 25 means Top 25%)
  // Bar should fill based on how good the score is (Top 10% = 90% fill, Top 25% = 75% fill)
  const barFill = 100 - percentile;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px' }}>
      <div style={{ flex: 1, height: '4px', backgroundColor: '#e5e5e5', borderRadius: '2px', overflow: 'hidden' }}>
        <div style={{ width: `${barFill}%`, height: '100%', backgroundColor: LINKEDIN_BLUE, borderRadius: '2px' }} />
      </div>
      <span style={{ fontSize: '13px', color: '#666666', minWidth: '65px' }}>Top {percentile}%</span>
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
      <div style={{ minHeight: '100vh', backgroundColor: '#f3f2ef', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: LINKEDIN_BLUE }} />
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

  if (!hasAnyReviews) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f3f2ef', padding: '24px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
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
    <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', backgroundColor: '#f3f2ef', minHeight: '100vh', padding: '24px' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        
        {/* Header Card */}
        <div style={{ backgroundColor: 'white', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 0 0 1px rgba(0,0,0,0.08)', marginBottom: '8px' }}>
          <div style={{ height: '120px', background: `linear-gradient(135deg, ${LINKEDIN_BLUE} 0%, #004182 100%)` }} />
          <div style={{ padding: '0 24px 24px', position: 'relative' }}>
            <div style={{
              width: '120px', height: '120px', borderRadius: '50%', border: '4px solid white',
              position: 'absolute', top: '-60px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '48px', fontWeight: '600', color: LINKEDIN_BLUE,
              background: 'linear-gradient(135deg, #e7f3ff 0%, #cce4ff 100%)',
              overflow: 'hidden'
            }}>
              <img 
                src={avatarUrl || fallbackAvatar} 
                alt={user?.name} 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e) => { e.target.src = fallbackAvatar; }}
              />
            </div>
            
            <div style={{ marginLeft: '140px', paddingTop: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h1 style={{ margin: 0, fontSize: '24px', color: '#191919', fontWeight: '600' }}>{user?.name}</h1>
                  <p style={{ margin: '4px 0 0', color: '#191919', fontSize: '16px' }}>{profileData?.position || user?.position}</p>
                  <p style={{ margin: '4px 0 0', color: '#666666', fontSize: '14px' }}>{profileData?.location || 'Professional'}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', backgroundColor: '#e7f3ff', borderRadius: '4px', border: '1px solid #b4d4ff' }}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill={LINKEDIN_BLUE}>
                    <path d="M8 0L10.2 2.4H13.6V5.8L16 8L13.6 10.2V13.6H10.2L8 16L5.8 13.6H2.4V10.2L0 8L2.4 5.8V2.4H5.8L8 0Z"/>
                    <path d="M7 9.5L5.5 8L4.5 9L7 11.5L12 6.5L11 5.5L7 9.5Z" fill="white"/>
                  </svg>
                  <span style={{ fontSize: '14px', fontWeight: '600', color: LINKEDIN_BLUE }}>Peer Verified</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '24px', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #e5e5e5' }}>
                <div><span style={{ fontWeight: '600', color: '#191919' }}>{scoreData?.reviews_received || 0}</span><span style={{ color: '#666666' }}> peer reviews</span></div>
                <div><span style={{ fontWeight: '600', color: '#191919' }}>{scoreData?.reviews_given || 0}</span><span style={{ color: '#666666' }}> reviews given</span></div>
              </div>
            </div>
          </div>
        </div>

        {/* Key Metrics Card */}
        {(workAgainPct || startupHirePct || harderJobPct) && (
          <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '24px', boxShadow: '0 0 0 1px rgba(0,0,0,0.08)', marginBottom: '8px' }}>
            <h2 style={{ margin: '0 0 20px', fontSize: '18px', color: '#191919', fontWeight: '600' }}>Colleague Endorsements</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
              {[
                { value: workAgainPct, label: 'Would work with again' },
                { value: startupHirePct, label: 'Would recruit to their team' },
                { value: harderJobPct, label: 'Want on tough projects' }
              ].map((metric, idx) => (
                <div key={idx} style={{ textAlign: 'center', padding: '20px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
                  <div style={{ fontSize: '36px', fontWeight: '600', color: LINKEDIN_BLUE }}>{metric.value || '—'}%</div>
                  <div style={{ fontSize: '14px', color: '#666666', marginTop: '8px' }}>{metric.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Two Column Layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          {/* Left Column - Skills */}
          <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '24px', boxShadow: '0 0 0 1px rgba(0,0,0,0.08)' }}>
            <h2 style={{ margin: '0 0 4px', fontSize: '18px', color: '#191919', fontWeight: '600' }}>Workplace Skills</h2>
            <p style={{ margin: '0 0 20px', fontSize: '14px', color: '#666666' }}>Based on peer assessments</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {dimensionScores && Object.entries(dimensionScores).map(([key, data]) => {
                const dim = behavioralConfig.dimensions[key];
                if (!dim) return null;
                return (
                  <div key={key}>
                    <div style={{ fontWeight: '600', color: '#191919', fontSize: '15px' }}>{dim.name}</div>
                    <div style={{ fontSize: '13px', color: '#666666', marginTop: '2px' }}>{dim.description}</div>
                    <PercentileBar percentile={data.percentile} />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {/* Top Qualities */}
            <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '24px', boxShadow: '0 0 0 1px rgba(0,0,0,0.08)' }}>
              <h2 style={{ margin: '0 0 16px', fontSize: '18px', color: '#191919', fontWeight: '600' }}>Top Qualities</h2>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {strengthTags.map((tag, idx) => (
                  <div key={idx} style={{
                    display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 14px',
                    backgroundColor: idx < 3 ? '#e7f3ff' : '#f3f2ef', borderRadius: '20px',
                    fontSize: '14px', fontWeight: idx < 3 ? '600' : '400',
                    color: idx < 3 ? LINKEDIN_BLUE : '#191919',
                    border: idx < 3 ? '1px solid #b4d4ff' : '1px solid #e5e5e5'
                  }}>
                    <span>{tag.tag || tag.label}</span>
                    <span style={{ fontSize: '12px', backgroundColor: idx < 3 ? '#cce4ff' : '#e5e5e5', padding: '2px 8px', borderRadius: '10px', fontWeight: '600', color: idx < 3 ? '#004182' : '#666666' }}>
                      {tag.count || tag.votes || 1}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* What You Can Count On */}
            {neverWorryAbout.length > 0 && (
              <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '24px', boxShadow: '0 0 0 1px rgba(0,0,0,0.08)' }}>
                <h2 style={{ margin: '0 0 16px', fontSize: '18px', color: '#191919', fontWeight: '600' }}>What You Can Count On</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {neverWorryAbout.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px', backgroundColor: '#f0f7f0', borderRadius: '6px', fontSize: '14px', color: '#1a7f37' }}>
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="#1a7f37">
                        <path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0zm3.78 4.97a.75.75 0 0 0-1.06 0L7 8.69 5.28 6.97a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.06 0l4.25-4.25a.75.75 0 0 0 0-1.06z"/>
                      </svg>
                      <span style={{ fontWeight: '500' }}>No {item.toLowerCase()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Peer Feedback */}
        {quotes.length > 0 && (
          <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '24px', boxShadow: '0 0 0 1px rgba(0,0,0,0.08)', marginTop: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0, fontSize: '18px', color: '#191919', fontWeight: '600' }}>Peer Feedback</h2>
              <span style={{ fontSize: '14px', color: LINKEDIN_BLUE }}>Show all {quotes.length} →</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {quotes.slice(0, 3).map((quote, idx) => (
                <div key={idx} style={{ padding: '20px', backgroundColor: '#f9fafb', borderRadius: '8px', borderLeft: `3px solid ${LINKEDIN_BLUE}` }}>
                  <p style={{ margin: 0, fontSize: '15px', color: '#191919', lineHeight: '1.6' }}>"{quote.text}"</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#e5e5e5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="#666666"><path d="M8 8a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                    </div>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: '600', color: '#191919' }}>Anonymous Colleague</div>
                      {quote.context && <div style={{ fontSize: '13px', color: '#666666' }}>{quote.context}</div>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Growth Areas - Private */}
        {roomToGrow.length > 0 && (
          <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '24px', boxShadow: '0 0 0 1px rgba(0,0,0,0.08)', marginTop: '8px', border: '1px dashed #ccc' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="#666666"><path d="M4 6V4a4 4 0 1 1 8 0v2h1a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h1zm2-2a2 2 0 1 1 4 0v2H6V4zm2 7a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z"/></svg>
              <h2 style={{ margin: 0, fontSize: '18px', color: '#191919', fontWeight: '600' }}>Growth Areas</h2>
              <span style={{ fontSize: '12px', backgroundColor: '#f3f2ef', padding: '4px 10px', borderRadius: '4px', color: '#666666', fontWeight: '500' }}>Only visible to you</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {roomToGrow.map((item, idx) => (
                <div key={idx} style={{ padding: '16px', backgroundColor: idx === 0 ? '#fffbeb' : '#f9fafb', borderRadius: '6px', borderLeft: `3px solid ${idx === 0 ? '#f59e0b' : '#9ca3af'}` }}>
                  {item.title && <div style={{ fontWeight: '600', color: idx === 0 ? '#92400e' : '#4b5563', marginBottom: '6px', fontSize: '14px' }}>{item.title}</div>}
                  <div style={{ fontSize: '13px', color: idx === 0 ? '#78716c' : '#6b7280', lineHeight: '1.5' }}>"{item.text || item}"</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div style={{ textAlign: 'center', marginTop: '24px', padding: '16px', color: '#666666', fontSize: '13px' }}>
          Based on {scoreData?.reviews_received || 0} anonymous peer reviews · Last updated {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </div>
      </div>

      {showRequestModal && (
        <RequestReviewModal userId={user?.id} onClose={() => setShowRequestModal(false)} onSuccess={() => setShowRequestModal(false)} />
      )}
    </div>
  );
}
