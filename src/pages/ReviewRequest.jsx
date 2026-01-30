import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { User, Clock, AlertCircle, CheckCircle, Loader2, ArrowRight } from 'lucide-react';

const API_URL = import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:3001';

/**
 * ReviewRequest - Landing page for invited users who click a review request link
 * 
 * Flow:
 * 1. User clicks link from colleague
 * 2. Sees who invited them and explanation
 * 3. If not logged in → prompted to sign up
 * 4. If logged in → redirected to review flow with request context
 */
export default function ReviewRequest() {
  const { linkId } = useParams();
  const navigate = useNavigate();
  
  const [isLoading, setIsLoading] = useState(true);
  const [requestData, setRequestData] = useState(null);
  const [error, setError] = useState(null);

  // Check if user is logged in
  const storedUser = localStorage.getItem('user');
  const user = storedUser ? JSON.parse(storedUser) : null;

  useEffect(() => {
    const fetchRequestData = async () => {
      // If user is not logged in, redirect to auth with return URL
      if (!user) {
        localStorage.setItem('pendingReviewRequest', JSON.stringify({ linkId }));
        navigate('/auth', { 
          state: { 
            returnTo: `/review-request/${linkId}`,
            message: 'Please sign in to review your colleague'
          }
        });
        return;
      }

      try {
        const response = await fetch(`${API_URL}/api/tokens/request/${linkId}`);
        const data = await response.json();

        if (!data.success) {
          setError(data.error || 'Request not found');
          return;
        }

        if (!data.request.is_valid) {
          setError(data.request.message || 'This request is no longer valid');
          return;
        }

        setRequestData(data.request);
      } catch (err) {
        setError('Failed to load request. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    if (linkId) {
      fetchRequestData();
    }
  }, [linkId, user, navigate]);

  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState(null);

  const handleStartReview = async () => {
    if (!user) {
      // User needs to sign up/login first
      localStorage.setItem('pendingReviewRequest', JSON.stringify({ linkId }));
      navigate('/auth', { 
        state: { 
          returnTo: `/review-request/${linkId}`,
          message: 'Please sign in to review your colleague'
        }
      });
      return;
    }

    // Validate that user can review this person (same company, time overlap)
    setIsValidating(true);
    setValidationError(null);

    try {
      const response = await fetch(`${API_URL}/api/tokens/request/${linkId}/colleague?user_id=${user.id}`);
      const data = await response.json();

      if (!data.success) {
        // Show specific error message based on error code
        let errorMessage = data.error;
        if (data.error_code === 'NO_SHARED_COMPANY') {
          errorMessage = "You can only review colleagues you've worked with at the same company.";
        } else if (data.error_code === 'INSUFFICIENT_OVERLAP') {
          errorMessage = "You need at least 3 months of work overlap with this person to review them.";
        } else if (data.error_code === 'SELF_REVIEW') {
          errorMessage = "You cannot review yourself.";
        }
        setValidationError(errorMessage);
        setIsValidating(false);
        return;
      }

      // Validation passed - clear pending request and proceed to review
      localStorage.removeItem('pendingReviewRequest');

      navigate('/review', { 
        state: { 
          reviewRequest: {
            linkId,
            id: requestData?.id,
            requesterName: requestData?.requester_name,
            isRequested: true,
            colleague: data.colleague
          }
        }
      });
    } catch (err) {
      setValidationError('Failed to validate. Please try again.');
    } finally {
      setIsValidating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading invitation...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Link Not Valid</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Go to Homepage
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-6">
          {/* Requester avatar */}
          <div className="relative inline-block mb-4">
            {requestData?.requester_avatar ? (
              <img
                src={requestData.requester_avatar}
                alt={requestData.requester_name}
                className="w-20 h-20 rounded-full border-4 border-white shadow-lg"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center border-4 border-white shadow-lg">
                <User className="w-10 h-10 text-white" />
              </div>
            )}
            <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center border-2 border-white">
              <CheckCircle className="w-5 h-5 text-white" />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            {requestData?.requester_name} invited you!
          </h1>
          <p className="text-gray-600">
            {requestData?.requester_company && (
              <span className="text-sm">from {requestData.requester_company}</span>
            )}
          </p>
        </div>

        {/* Explanation */}
        <div className="bg-blue-50 rounded-xl p-4 mb-6">
          <h2 className="font-semibold text-blue-900 mb-2">
            What is Estimate?
          </h2>
          <p className="text-sm text-blue-800 mb-3">
            Estimate is a platform where professionals give each other anonymous feedback on soft skills.
            Your review helps {requestData?.requester_name?.split(' ')[0] || 'your colleague'} understand how they're perceived by colleagues.
          </p>
          <ul className="text-sm text-blue-700 space-y-1">
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-blue-500" />
              100% anonymous - they won't know it's you
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-blue-500" />
              Takes only 2 minutes
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-blue-500" />
              You'll also get YOUR score after joining
            </li>
          </ul>
        </div>

        {/* How it works for new users */}
        {!user && (
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <h3 className="font-semibold text-gray-900 mb-2">How it works:</h3>
            <ol className="text-sm text-gray-700 space-y-2">
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">1</span>
                <span>Sign up with LinkedIn (30 seconds)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">2</span>
                <span>Review 2 random colleagues first</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">3</span>
                <span>Then review {requestData?.requester_name?.split(' ')[0] || 'your colleague'}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">✓</span>
                <span>1 more review → unlock YOUR score!</span>
              </li>
            </ol>
          </div>
        )}

        {/* Expiry notice */}
        {requestData?.expires_at && (
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-6 justify-center">
            <Clock className="w-4 h-4" />
            <span>
              Link expires {new Date(requestData.expires_at).toLocaleDateString()}
            </span>
          </div>
        )}

        {/* Validation Error */}
        {validationError && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm font-medium">{validationError}</p>
            </div>
          </div>
        )}

        {/* CTA Button */}
        <button
          onClick={handleStartReview}
          disabled={isValidating}
          className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isValidating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Validating...
            </>
          ) : (
            <>
              {user ? 'Start Review' : 'Sign Up & Review'}
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>

        {user && (
          <p className="text-center text-sm text-gray-500 mt-3">
            Logged in as {user.name}
          </p>
        )}

        {/* Privacy note */}
        <p className="text-center text-xs text-gray-400 mt-4">
          Your review is completely anonymous. {requestData?.requester_name?.split(' ')[0] || 'They'} will never know who wrote it.
        </p>
      </div>
    </div>
  );
}
