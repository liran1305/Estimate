import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { mockAuth, mockEntities } from "@/lib/mockAuth";
import { Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ColleagueCard from "@/components/review/ColleagueCard";
import ReviewForm from "@/components/review/ReviewForm";
import ReviewSuccess from "@/components/review/ReviewSuccess";

// Mocked colleagues data
const mockColleagues = [
  { id: "1", name: "Sarah Chen", job_title: "Senior Product Manager", company: "TechCorp", photo_url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop" },
  { id: "2", name: "Michael Rodriguez", job_title: "Software Engineer", company: "StartupXYZ", photo_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop" },
  { id: "3", name: "Emily Thompson", job_title: "UX Designer", company: "DesignHub", photo_url: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop" },
  { id: "4", name: "David Kim", job_title: "Data Scientist", company: "AnalyticsPro", photo_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop" },
  { id: "5", name: "Jessica Martinez", job_title: "Marketing Director", company: "BrandCo", photo_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop" },
  { id: "6", name: "James Wilson", job_title: "Engineering Manager", company: "TechCorp", photo_url: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop" },
  { id: "7", name: "Amanda Foster", job_title: "HR Business Partner", company: "PeopleFirst", photo_url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop" },
  { id: "8", name: "Robert Chang", job_title: "CTO", company: "StartupXYZ", photo_url: "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=150&h=150&fit=crop" },
  { id: "9", name: "Lisa Anderson", job_title: "Product Designer", company: "DesignHub", photo_url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop" },
  { id: "10", name: "Chris Taylor", job_title: "Sales Executive", company: "SalesForce", photo_url: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop" }
];

export default function Review() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [step, setStep] = useState('select'); // select, review, success
  const [currentColleague, setCurrentColleague] = useState(null);
  const [availableColleagues, setAvailableColleagues] = useState([]);
  const [interactionType, setInteractionType] = useState('');
  const [reviewsGiven, setReviewsGiven] = useState(0);
  const [scores, setScores] = useState({});
  const [notRelevant, setNotRelevant] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const init = async () => {
      const currentUser = await mockAuth.me();
      setUser(currentUser);
      setReviewsGiven(currentUser.reviews_given || 0);
      
      // Filter out reviewed colleagues (in real app, check against Review entity)
      const reviews = await mockEntities.Review.filter({ reviewer_id: currentUser.id });
      const reviewedIds = reviews.map(r => r.colleague_id);
      const available = mockColleagues.filter(c => !reviewedIds.includes(c.id));
      
      setAvailableColleagues(available);
      if (available.length > 0) {
        setCurrentColleague(available[0]);
      }
      setIsLoading(false);
    };
    init();
  }, []);

  const handleSkip = () => {
    const currentIndex = availableColleagues.findIndex(c => c.id === currentColleague.id);
    const nextIndex = (currentIndex + 1) % availableColleagues.length;
    setCurrentColleague(availableColleagues[nextIndex]);
    setInteractionType('');
  };

  const handleContinue = () => {
    setStep('review');
    setScores({
      communication_skills: 5,
      teamwork_skills: 5,
      problem_solving: 5,
      adaptability: 5,
      leadership_impact: 5,
      goal_achievement: 5,
      stress_management: 5,
      initiative: 5
    });
    setNotRelevant({});
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

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    const reviewData = {
      reviewer_id: user.id,
      colleague_id: currentColleague.id,
      colleague_name: currentColleague.name,
      interaction_type: interactionType,
      ...scores
    };

    // Set null for not relevant categories
    Object.keys(notRelevant).forEach(key => {
      if (notRelevant[key]) {
        reviewData[key] = null;
      }
    });

    await mockEntities.Review.create(reviewData);
    
    const newReviewsGiven = reviewsGiven + 1;
    await mockAuth.updateMe({ reviews_given: newReviewsGiven });
    setReviewsGiven(newReviewsGiven);
    
    // Remove current colleague from available
    const newAvailable = availableColleagues.filter(c => c.id !== currentColleague.id);
    setAvailableColleagues(newAvailable);
    
    setIsSubmitting(false);
    setStep('success');
  };

  const handleNextReview = () => {
    if (availableColleagues.length > 0) {
      setCurrentColleague(availableColleagues[0]);
    }
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 px-6">
      <div className="max-w-lg mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Review a Colleague</h1>
          <p className="text-gray-500">Select someone you've worked with</p>
          
          <div className="flex items-center justify-center gap-2 mt-4">
            {[1, 2, 3].map((num) => (
              <div
                key={num}
                className={`w-2.5 h-2.5 rounded-full transition-colors ${
                  num <= reviewsGiven ? 'bg-[#0A66C2]' : 'bg-gray-200'
                }`}
              />
            ))}
            <span className="text-sm text-gray-500 ml-2">{reviewsGiven}/3 reviews</span>
          </div>
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
              <ReviewForm
                colleague={currentColleague}
                interactionType={interactionType}
                scores={scores}
                notRelevant={notRelevant}
                onScoreChange={handleScoreChange}
                onNotRelevantChange={handleNotRelevantChange}
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