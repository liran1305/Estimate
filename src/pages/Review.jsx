import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { linkedinAuth } from "@/lib/linkedinAuth";
import { Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ColleagueCard from "@/components/review/ColleagueCard";
import ReviewFormDynamic from "@/components/review/ReviewFormDynamic";
import ReviewSuccess from "@/components/review/ReviewSuccess";

const BACKEND_API_URL = import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:3001';

export default function Review() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSkipping, setIsSkipping] = useState(false);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [step, setStep] = useState('select'); // select, review, success
  const [currentColleague, setCurrentColleague] = useState(null);
  const [interactionType, setInteractionType] = useState('');
  const [reviewsGiven, setReviewsGiven] = useState(0);
  const [skipsRemaining, setSkipsRemaining] = useState(0);
  const [scores, setScores] = useState({});
  const [notRelevant, setNotRelevant] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [companySkips, setCompanySkips] = useState(null); // Per-company skip info

  useEffect(() => {
    const init = async () => {
      try {
        // Get current user from localStorage
        const currentUser = linkedinAuth.getCurrentUser();
        if (!currentUser || !currentUser.canUsePlatform) {
          navigate(createPageUrl("Login"));
          return;
        }
        setUser(currentUser);

        // Start review session
        const sessionRes = await fetch(`${BACKEND_API_URL}/api/session/start?user_id=${currentUser.id}`);
        const sessionData = await sessionRes.json();
        
        if (!sessionData.success) {
          // Check if account is blocked
          if (sessionData.error === 'account_blocked') {
            navigate(createPageUrl("Blocked"));
            return;
          }
          setError(sessionData.error || 'Failed to start session');
          setIsLoading(false);
          return;
        }

        setSession(sessionData.session);
        setSkipsRemaining(sessionData.session.skips_remaining || 0);

        // Fetch user's total reviews given (not just this session)
        const userRes = await fetch(`${BACKEND_API_URL}/api/user/stats?user_id=${currentUser.id}`);
        const userData = await userRes.json();
        if (userData.success) {
          setReviewsGiven(userData.reviews_given || 0);
        } else {
          setReviewsGiven(0);
        }

        // Get first colleague
        await fetchNextColleague(currentUser.id, sessionData.session.id);
        setIsLoading(false);
      } catch (err) {
        console.error('Init error:', err);
        setError(err.message);
        setIsLoading(false);
      }
    };
    init();
  }, [navigate]);

  const fetchNextColleague = async (userId, sessionId) => {
    const res = await fetch(`${BACKEND_API_URL}/api/colleague/next?user_id=${userId}&session_id=${sessionId}`);
    const data = await res.json();
    
    if (data.success && data.colleague) {
      setCurrentColleague({
        id: data.colleague.id,
        name: data.colleague.name,
        job_title: data.colleague.position,
        company: data.colleague.shared_company,
        photo_url: data.colleague.avatar,
        overlap_months: data.colleague.overlap_months
      });
      
      // Update per-company skip info
      if (data.company_skips) {
        setCompanySkips(data.company_skips);
        setSkipsRemaining(data.company_skips.skips_remaining);
      }
    } else if (data.all_companies_exhausted) {
      // All companies have no skips remaining
      setCurrentColleague(null);
      setCompanySkips(null);
      setSkipsRemaining(0);
    } else {
      setCurrentColleague(null);
    }
  };

  const handleSkip = async () => {
    if (skipsRemaining <= 0) {
      alert('No skips remaining');
      return;
    }

    if (isSkipping) return; // Prevent double-clicks

    setIsSkipping(true);
    try {
      const res = await fetch(`${BACKEND_API_URL}/api/colleague/skip`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          session_id: session.id,
          colleague_id: currentColleague.id
        })
      });
      const data = await res.json();
      
      if (data.success) {
        // Track review skip in GTM
        if (window.dataLayer) {
          window.dataLayer.push({
            event: 'review_skipped',
            skips_remaining: data.skips_remaining,
            company_name: data.company_name
          });
        }
        
        setSkipsRemaining(data.skips_remaining);
        if (companySkips) {
          setCompanySkips({
            ...companySkips,
            skips_remaining: data.skips_remaining
          });
        }
        setInteractionType('');
        await fetchNextColleague(user.id, session.id);
      }
    } catch (err) {
      console.error('Skip error:', err);
    } finally {
      setIsSkipping(false);
    }
  };

  const handleContinue = () => {
    setStep('review');
  };

  const handleBack = () => {
    setStep('select');
  };

  const handleScoreChange = (category, value) => {
    setScores(prev => ({ ...prev, [category]: value }));
  };

  const handleNotRelevantChange = (category, checked) => {
    setNotRelevant(prev => ({ ...prev, [category]: checked }));
  };

  const handleSubmit = async (reviewData) => {
    setIsSubmitting(true);
    
    try {
      // Step 1: Create anonymous review token
      const tokenRes = await fetch(`${BACKEND_API_URL}/api/anonymous/token/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          session_id: session.id,
          colleague_id: currentColleague.id,
          company_name: currentColleague.company,
          company_context: 'previous',
          interaction_type: interactionType
        })
      });
      
      const tokenData = await tokenRes.json();
      
      if (!tokenData.success) {
        alert(tokenData.error || 'Failed to create review token');
        setIsSubmitting(false);
        return;
      }
      
      // Step 2: Submit review with token (untraceable - token is burned after submission)
      const res = await fetch(`${BACKEND_API_URL}/api/anonymous/review/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: tokenData.token,
          ...reviewData
        })
      });
      
      const data = await res.json();
      
      if (data.success) {
        setReviewsGiven(data.reviews_given);
        
        // Track review submission in GTM
        if (window.dataLayer) {
          window.dataLayer.push({
            event: 'review_submitted',
            review_count: data.reviews_given,
            interaction_type: interactionType
          });
          
          // Track score unlock milestone (3 reviews)
          if (data.profile_unlocked) {
            window.dataLayer.push({
              event: 'score_unlocked',
              reviews_given: data.reviews_given
            });
          }
        }
        
        setIsSubmitting(false);
        setStep('success');
      } else {
        alert(data.error || 'Failed to submit review');
        setIsSubmitting(false);
      }
    } catch (err) {
      console.error('Submit error:', err);
      setIsSubmitting(false);
    }
  };

  const handleNextReview = async () => {
    await fetchNextColleague(user.id, session.id);
    setInteractionType('');
    setStep('select');
  };

  const handleGoToProfile = () => {
    navigate(createPageUrl("Profile"));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#0A66C2] animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button onClick={() => navigate(createPageUrl("Profile"))} className="text-[#0A66C2]">
            Go to Profile
          </button>
        </div>
      </div>
    );
  }

  if (!currentColleague && step === 'select') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 px-6">
        <div className="max-w-lg mx-auto text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">No More Colleagues</h1>
          <p className="text-gray-500 mb-6">You've reviewed all available colleagues with sufficient work overlap.</p>
          <button 
            onClick={() => navigate(createPageUrl("Profile"))}
            className="bg-[#0A66C2] text-white px-6 py-2 rounded-lg"
          >
            Go to Profile
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-4 px-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate(createPageUrl("Profile"))}
            className="text-gray-500 hover:text-gray-700 text-sm font-medium transition-colors"
          >
            ← Back to Profile
          </button>
          <div className="flex items-center gap-2">
            {reviewsGiven < 3 ? (
              <>
                {[1, 2, 3].map((num) => (
                  <div
                    key={num}
                    className={`w-2.5 h-2.5 rounded-full transition-colors ${
                      num <= reviewsGiven ? 'bg-[#0A66C2]' : 'bg-gray-200'
                    }`}
                  />
                ))}
                <span className="text-sm text-gray-500 ml-2">{reviewsGiven}/3 reviews</span>
              </>
            ) : (
              <span className="text-sm text-gray-500">{reviewsGiven} reviews given ✓</span>
            )}
          </div>
        </div>

        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Review a Colleague</h1>
          <p className="text-gray-500">Select someone you've worked with</p>
        </div>

        <AnimatePresence mode="wait">
          {step === 'select' && currentColleague && (
            <motion.div
              key="select"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <ColleagueCard
                colleague={currentColleague}
                interactionType={interactionType}
                onInteractionChange={setInteractionType}
                onContinue={handleContinue}
                onSkip={handleSkip}
                skipsRemaining={skipsRemaining}
                totalSkips={session?.skip_budget || 0}
                isSkipping={isSkipping}
                onBackToProfile={() => navigate(createPageUrl("Profile"))}
                companySkips={companySkips}
              />
            </motion.div>
          )}

          {step === 'review' && (
            <motion.div
              key="review"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <ReviewFormDynamic
                colleague={currentColleague}
                interactionType={interactionType}
                onBack={handleBack}
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
              />
            </motion.div>
          )}

          {step === 'success' && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
            >
              <ReviewSuccess
                completedCount={reviewsGiven}
                onNextReview={handleNextReview}
                onGoToProfile={handleGoToProfile}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}