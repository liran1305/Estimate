import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Linkedin, X, Check, Shield, Users, Mail, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { linkedinAuth } from "@/lib/linkedinAuth";
import { turnstile } from "@/lib/turnstile";
import Logo from "@/components/Logo";
import { motion, AnimatePresence } from "framer-motion";

export default function LinkedInAuth() {
  const [showOAuth, setShowOAuth] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [verificationError, setVerificationError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    turnstile.loadScript().catch(console.error);
  }, []);

  // Show verification step
  const handleAllow = () => {
    // Track LinkedIn auth start in GTM
    if (window.dataLayer) {
      window.dataLayer.push({
        event: 'linkedin_auth_start'
      });
    }
    
    setShowVerification(true);
    setVerificationError(null);
  };

  // Ref callback - renders Turnstile when container is mounted
  const turnstileContainerRef = (element) => {
    if (element && !element.hasChildNodes()) {
      turnstile.renderAutoVerify(
        element,
        (token) => {
          // Success - proceed to LinkedIn
          linkedinAuth.initiateLogin(token);
        },
        (error) => {
          console.error('Bot verification failed:', error);
          setVerificationError('Verification failed. Please try again.');
        }
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <Link to={createPageUrl("Landing")} className="flex items-center justify-center mb-12">
          <Logo className="h-10" />
        </Link>

        <AnimatePresence mode="wait">
          {!showOAuth ? (
            <motion.div
              key="login"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className="p-8 border-0 shadow-xl shadow-gray-200/50">
                <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">
                  Welcome to Estimate
                </h1>
                <p className="text-gray-500 text-center mb-8">
                  Sign in to discover your professional score
                </p>

                <Button 
                  className="w-full bg-[#0A66C2] hover:bg-[#004182] h-14 rounded-xl font-medium text-base"
                  onClick={() => setShowOAuth(true)}
                >
                  <Linkedin className="w-5 h-5 mr-3" />
                  Continue with LinkedIn
                </Button>

                <div className="flex items-center justify-center gap-2 mt-4 mb-2">
                  <Shield className="w-4 h-4 text-orange-500" />
                  <p className="text-xs text-gray-500">
                    Protected by <span className="font-medium text-gray-700">Cloudflare</span>
                  </p>
                </div>

                <p className="text-xs text-gray-400 text-center mt-4">
                  By continuing, you agree to our{' '}
                  <Link to={createPageUrl("TermsOfService")} className="text-[#0A66C2] hover:underline">
                    Terms of Service
                  </Link>
                  {' '}and{' '}
                  <Link to={createPageUrl("PrivacyPolicy")} className="text-[#0A66C2] hover:underline">
                    Privacy Policy
                  </Link>
                </p>
              </Card>
            </motion.div>
          ) : !showVerification ? (
            <motion.div
              key="oauth"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className="p-8 border-0 shadow-xl shadow-gray-200/50">
                <div className="flex items-center justify-center gap-3 mb-8">
                  <div className="w-12 h-12 bg-[#0A66C2] rounded-xl flex items-center justify-center">
                    <Linkedin className="w-6 h-6 text-white" />
                  </div>
                </div>

                <h2 className="text-xl font-bold text-gray-900 text-center mb-2">
                  Authorize Estimate
                </h2>
                <p className="text-gray-500 text-center mb-8 text-sm">
                  Estimate would like to access your LinkedIn profile
                </p>

                <div className="space-y-4 mb-8">
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                    <div className="w-10 h-10 bg-[#0A66C2]/10 rounded-lg flex items-center justify-center">
                      <Shield className="w-5 h-5 text-[#0A66C2]" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">Use your name and photo</p>
                      <p className="text-xs text-gray-500">Display your professional identity</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                    <div className="w-10 h-10 bg-[#0A66C2]/10 rounded-lg flex items-center justify-center">
                      <Users className="w-5 h-5 text-[#0A66C2]" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">Access your connections</p>
                      <p className="text-xs text-gray-500">Find colleagues to review</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                    <div className="w-10 h-10 bg-[#0A66C2]/10 rounded-lg flex items-center justify-center">
                      <Mail className="w-5 h-5 text-[#0A66C2]" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">Access your email</p>
                      <p className="text-xs text-gray-500">Send important notifications</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button 
                    variant="outline" 
                    className="flex-1 h-12 rounded-xl font-medium"
                    onClick={() => setShowOAuth(false)}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                  <Button 
                    className="flex-1 bg-[#0A66C2] hover:bg-[#004182] h-12 rounded-xl font-medium"
                    onClick={handleAllow}
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Allow
                  </Button>
                </div>
              </Card>
            </motion.div>
          ) : (
            <motion.div
              key="verification"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className="p-8 border-0 shadow-xl shadow-gray-200/50">
                {!verificationError ? (
                  <>
                    <h2 className="text-xl font-bold text-gray-900 text-center mb-2">
                      Security Check
                    </h2>
                    <p className="text-gray-500 text-center mb-6 text-sm">
                      Verifying you're human...
                    </p>
                    {/* Cloudflare Turnstile Widget - shows logo and auto-verifies */}
                    <div className="flex justify-center mb-4">
                      <div ref={turnstileContainerRef}></div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <X className="w-6 h-6 text-red-600" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 text-center mb-2">
                      Verification Failed
                    </h2>
                    <p className="text-gray-500 text-center mb-6 text-sm">
                      {verificationError}
                    </p>
                    <Button 
                      className="w-full bg-[#0A66C2] hover:bg-[#004182] h-12 rounded-xl font-medium"
                      onClick={() => {
                        setShowVerification(false);
                        setVerificationError(null);
                      }}
                    >
                      Try Again
                    </Button>
                  </>
                )}
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}