import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Linkedin, X, Check, Shield, Users, Mail } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { mockAuth } from "@/lib/mockAuth";
import Logo from "@/components/Logo";
import { motion, AnimatePresence } from "framer-motion";

export default function LinkedInAuth() {
  const [showOAuth, setShowOAuth] = useState(false);
  const navigate = useNavigate();

  const handleAllow = async () => {
    // Check if already authenticated
    const isAuth = await mockAuth.isAuthenticated();
    if (isAuth) {
      navigate(createPageUrl("Review"));
    } else {
      mockAuth.redirectToLogin(window.location.origin + createPageUrl("Review"));
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

                <p className="text-xs text-gray-400 text-center mt-6">
                  By continuing, you agree to our Terms of Service and Privacy Policy
                </p>
              </Card>
            </motion.div>
          ) : (
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
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}