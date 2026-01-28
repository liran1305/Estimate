import React, { useState, useEffect } from 'react';
import { X, Gift, Copy, Check, Loader2, Ticket, Link2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from 'framer-motion';

const BACKEND_API_URL = import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:3001';
const REVIEWS_PER_TOKEN = 5;

export default function RewardsModal({ isOpen, onClose, user }) {
  const [reviewsGiven, setReviewsGiven] = useState(0);
  const [tokensUsed, setTokensUsed] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [requestLink, setRequestLink] = useState('');
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  // Calculate tokens: earned - used
  const tokensEarned = Math.floor(reviewsGiven / REVIEWS_PER_TOKEN);
  const availableRequests = Math.max(0, tokensEarned - tokensUsed);
  const progressInCurrentCycle = reviewsGiven % REVIEWS_PER_TOKEN;
  const reviewsToNextToken = REVIEWS_PER_TOKEN - progressInCurrentCycle;

  useEffect(() => {
    if (isOpen && user) {
      fetchRewardsStatus();
    }
  }, [isOpen, user]);

  const fetchRewardsStatus = async () => {
    setIsLoading(true);
    setRequestLink('');
    setError('');
    try {
      const response = await fetch(`${BACKEND_API_URL}/api/tokens/balance?user_id=${user.id}`);
      const data = await response.json();
      if (data.success) {
        setReviewsGiven(data.progress?.reviews_given || 0);
        setTokensUsed(data.tokens?.used_total || 0);
      }
    } catch (err) {
      console.error('Failed to fetch rewards status:', err);
    }
    setIsLoading(false);
  };

  const handleGenerateLink = async () => {
    setIsGeneratingLink(true);
    setError('');
    
    try {
      const response = await fetch(`${BACKEND_API_URL}/api/tokens/create-request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id })
      });

      const data = await response.json();
      
      if (data.success && data.request?.full_url) {
        setRequestLink(data.request.full_url);
        setTokensUsed(prev => prev + 1);
      } else {
        setError(data.error || 'Failed to generate link');
      }
    } catch (err) {
      setError('Failed to generate link. Please try again.');
    }
    setIsGeneratingLink(false);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(requestLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-2xl max-w-md w-full shadow-xl overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Gift className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Rewards</h2>
                  <p className="text-white/80 text-sm">Earn direct review requests</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Available Requests */}
            <div className="bg-white/20 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <span className="text-white/90">Available Requests</span>
                <span className="text-3xl font-bold">{availableRequests}</span>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
              </div>
            ) : (
              <div>
                {/* Progress to next request */}
                <div className="mb-6">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-600">Progress to next request</span>
                    <span className="font-medium text-gray-900">{progressInCurrentCycle}/{REVIEWS_PER_TOKEN} reviews</span>
                  </div>
                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full transition-all duration-500"
                      style={{ width: `${(progressInCurrentCycle / REVIEWS_PER_TOKEN) * 100}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    {progressInCurrentCycle === 0 
                      ? `Give ${REVIEWS_PER_TOKEN} reviews to earn your ${tokensEarned === 0 ? 'first' : 'next'} request`
                      : `${reviewsToNextToken} more review${reviewsToNextToken > 1 ? 's' : ''} to earn a request`
                    }
                  </p>
                </div>

                {/* Request Link Section */}
                {availableRequests > 0 ? (
                  <div className="space-y-4">
                    {requestLink ? (
                      /* Show generated link */
                      <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <Check className="w-5 h-5 text-green-600" />
                          <span className="font-medium text-green-800">Link Generated!</span>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">
                          Share this link with someone you've worked with:
                        </p>
                        <div className="flex items-center gap-2">
                          <Input 
                            value={requestLink} 
                            readOnly 
                            className="text-sm bg-white flex-1"
                          />
                          <Button
                            size="sm"
                            onClick={handleCopyLink}
                            className={copied ? 'bg-green-500 hover:bg-green-600' : ''}
                          >
                            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                          </Button>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          {availableRequests - 1} request{availableRequests - 1 !== 1 ? 's' : ''} remaining after this
                        </p>
                      </div>
                    ) : (
                      /* Generate link button */
                      <div>
                        <Button
                          onClick={handleGenerateLink}
                          disabled={isGeneratingLink}
                          className="w-full bg-amber-500 hover:bg-amber-600 py-6"
                        >
                          {isGeneratingLink ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Generating...
                            </>
                          ) : (
                            <>
                              <Link2 className="w-4 h-4 mr-2" />
                              Generate Shareable Link
                            </>
                          )}
                        </Button>
                        <p className="text-xs text-gray-500 text-center mt-2">
                          Uses 1 of your {availableRequests} available request{availableRequests !== 1 ? 's' : ''}
                        </p>
                      </div>
                    )}

                    {error && (
                      <p className="text-red-500 text-sm text-center">{error}</p>
                    )}
                  </div>
                ) : (
                  /* No requests available */
                  <div className="text-center py-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Ticket className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="font-medium text-gray-900 mb-2">No requests available</h3>
                    <p className="text-sm text-gray-500 mb-4">
                      Give {reviewsToNextToken} more review{reviewsToNextToken > 1 ? 's' : ''} to earn your {tokensEarned === 0 ? 'first' : 'next'} request
                    </p>
                    <Button
                      onClick={onClose}
                      variant="outline"
                      className="w-full"
                    >
                      Start Reviewing
                    </Button>
                  </div>
                )}

                {/* How it works */}
                <div className="bg-gray-50 rounded-xl p-4 mt-6">
                  <h4 className="font-medium text-gray-900 mb-3 text-sm">How it works</h4>
                  <div className="space-y-2 text-xs text-gray-600">
                    <div className="flex items-start gap-2">
                      <span className="font-bold text-amber-600">1.</span>
                      <p>Give 5 reviews → Earn 1 direct review request</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="font-bold text-amber-600">2.</span>
                      <p>Generate a shareable link</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="font-bold text-amber-600">3.</span>
                      <p>Send to anyone you've worked with</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="font-bold text-amber-600">4.</span>
                      <p>They review you (still anonymous!)</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
