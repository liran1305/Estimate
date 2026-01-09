import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { createPageUrl } from "@/utils";
import { linkedinAuth } from "@/lib/linkedinAuth";
import { Loader2, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import Logo from "@/components/Logo";

export default function LinkedInCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');
      const state = searchParams.get('state');
      const errorParam = searchParams.get('error');
      const errorDescription = searchParams.get('error_description');

      if (errorParam) {
        setError(errorDescription || 'LinkedIn authentication failed');
        return;
      }

      if (!code || !state) {
        setError('Missing authentication parameters');
        return;
      }

      try {
        const user = await linkedinAuth.handleCallback(code, state);
        
        if (user.isOnboarded) {
          navigate(createPageUrl("Review"));
        } else {
          navigate(createPageUrl("Onboarding"));
        }
      } catch (err) {
        console.error('Authentication error:', err);
        setError(err.message || 'Authentication failed. Please try again.');
      }
    };

    handleCallback();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center mb-12">
          <Logo className="h-10" />
        </div>

        <Card className="p-8 border-0 shadow-xl shadow-gray-200/50">
          {error ? (
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                Authentication Failed
              </h2>
              <p className="text-gray-600 mb-6">
                {error}
              </p>
              <button
                onClick={() => navigate(createPageUrl("LinkedInAuth"))}
                className="w-full bg-[#0A66C2] hover:bg-[#004182] text-white font-medium py-3 px-4 rounded-xl transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : (
            <div className="text-center">
              <Loader2 className="w-12 h-12 text-[#0A66C2] animate-spin mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                Authenticating...
              </h2>
              <p className="text-gray-600">
                Please wait while we complete your sign-in
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
