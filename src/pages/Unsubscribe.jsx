import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle2, XCircle, Mail } from "lucide-react";

const BACKEND_API_URL = import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:3001';

export default function Unsubscribe() {
  const { token } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [preferences, setPreferences] = useState({
    email_notifications: true,
    email_new_reviews: true,
    email_score_unlocked: true,
    email_marketing: false
  });
  const [updating, setUpdating] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPreferences();
  }, [token]);

  const fetchPreferences = async () => {
    try {
      const res = await fetch(`${BACKEND_API_URL}/api/email-preferences/unsubscribe/${token}`);
      const data = await res.json();

      if (data.success) {
        setUser(data.user);
        setPreferences(data.user.preferences);
      } else {
        setError(data.error || 'Invalid unsubscribe link');
      }
    } catch (err) {
      setError('Failed to load preferences');
    } finally {
      setLoading(false);
    }
  };

  const handleUnsubscribeAll = async () => {
    setUpdating(true);
    
    try {
      const res = await fetch(`${BACKEND_API_URL}/api/email-preferences/unsubscribe/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ unsubscribe_all: true })
      });

      const data = await res.json();

      if (data.success) {
        setSuccess(true);
        setPreferences({
          email_notifications: false,
          email_new_reviews: false,
          email_score_unlocked: false,
          email_marketing: false
        });

        // GTM Event: Unsubscribe All
        if (window.dataLayer) {
          window.dataLayer.push({
            event: 'email_unsubscribe_all',
            user_email: user?.email,
            timestamp: new Date().toISOString()
          });
        }
      } else {
        setError(data.error || 'Failed to unsubscribe');
      }
    } catch (err) {
      setError('Failed to update preferences');
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdatePreferences = async () => {
    setUpdating(true);
    
    try {
      const res = await fetch(`${BACKEND_API_URL}/api/email-preferences/unsubscribe/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preferences)
      });

      const data = await res.json();

      if (data.success) {
        setSuccess(true);

        // GTM Event: Update Email Preferences
        if (window.dataLayer) {
          window.dataLayer.push({
            event: 'email_preferences_updated',
            user_email: user?.email,
            preferences: {
              email_notifications: preferences.email_notifications,
              email_new_reviews: preferences.email_new_reviews,
              email_score_unlocked: preferences.email_score_unlocked,
              email_marketing: preferences.email_marketing
            },
            timestamp: new Date().toISOString()
          });
        }
      } else {
        setError(data.error || 'Failed to update preferences');
      }
    } catch (err) {
      setError('Failed to update preferences');
    } finally {
      setUpdating(false);
    }
  };

  const handleResubscribe = async () => {
    setUpdating(true);
    
    try {
      const res = await fetch(`${BACKEND_API_URL}/api/email-preferences/resubscribe/${token}`);
      const data = await res.json();

      if (data.success) {
        setSuccess(true);
        setPreferences({
          email_notifications: true,
          email_new_reviews: true,
          email_score_unlocked: true,
          email_marketing: false
        });

        // GTM Event: Resubscribe
        if (window.dataLayer) {
          window.dataLayer.push({
            event: 'email_resubscribe',
            user_email: user?.email,
            timestamp: new Date().toISOString()
          });
        }
      } else {
        setError(data.error || 'Failed to resubscribe');
      }
    } catch (err) {
      setError('Failed to resubscribe');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center p-6">
        <Loader2 className="w-8 h-8 animate-spin text-[#0A66C2]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center p-6">
        <Card className="max-w-md w-full p-8 text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Invalid Link</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button onClick={() => navigate('/')} className="bg-[#0A66C2] hover:bg-[#004182]">
            Go to Homepage
          </Button>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center p-6">
        <Card className="max-w-md w-full p-8 text-center">
          <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Preferences Updated</h1>
          <p className="text-gray-600 mb-6">
            Your email preferences have been successfully updated.
          </p>
          <Button onClick={() => navigate('/')} className="bg-[#0A66C2] hover:bg-[#004182]">
            Go to Homepage
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 px-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="relative inline-block">
            <Mail className="w-16 h-16 text-[#0A66C2] mx-auto mb-4" />
            <CheckCircle2 className="w-6 h-6 text-green-500 absolute -top-1 -right-1 bg-white rounded-full" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Email Preferences</h1>
          <p className="text-gray-600">
            Manage your email notifications for {user?.name || user?.email}
          </p>
        </div>

        {/* Preferences Card */}
        <Card className="p-8 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Choose what emails you'd like to receive</h2>
          
          <div className="space-y-6">
            {/* Email Notifications Master Toggle */}
            <div className="flex items-start space-x-3 pb-4 border-b">
              <Checkbox
                id="email_notifications"
                checked={preferences.email_notifications}
                onCheckedChange={(checked) => 
                  setPreferences({ ...preferences, email_notifications: checked })
                }
              />
              <div className="flex-1">
                <Label htmlFor="email_notifications" className="text-base font-semibold cursor-pointer">
                  Email Notifications
                </Label>
                <p className="text-sm text-gray-500 mt-1">
                  Master toggle for all email notifications
                </p>
              </div>
            </div>

            {/* New Reviews */}
            <div className="flex items-start space-x-3">
              <Checkbox
                id="email_new_reviews"
                checked={preferences.email_new_reviews}
                onCheckedChange={(checked) => 
                  setPreferences({ ...preferences, email_new_reviews: checked })
                }
                disabled={!preferences.email_notifications}
              />
              <div className="flex-1">
                <Label 
                  htmlFor="email_new_reviews" 
                  className={`text-base font-medium cursor-pointer ${!preferences.email_notifications ? 'text-gray-400' : ''}`}
                >
                  New Review Notifications
                </Label>
                <p className="text-sm text-gray-500 mt-1">
                  Get notified when a colleague reviews you
                </p>
              </div>
            </div>

            {/* Score Unlocked */}
            <div className="flex items-start space-x-3">
              <Checkbox
                id="email_score_unlocked"
                checked={preferences.email_score_unlocked}
                onCheckedChange={(checked) => 
                  setPreferences({ ...preferences, email_score_unlocked: checked })
                }
                disabled={!preferences.email_notifications}
              />
              <div className="flex-1">
                <Label 
                  htmlFor="email_score_unlocked" 
                  className={`text-base font-medium cursor-pointer ${!preferences.email_notifications ? 'text-gray-400' : ''}`}
                >
                  Score Unlocked Notifications
                </Label>
                <p className="text-sm text-gray-500 mt-1">
                  Get notified when you unlock your professional score
                </p>
              </div>
            </div>

            {/* Marketing Emails */}
            <div className="flex items-start space-x-3">
              <Checkbox
                id="email_marketing"
                checked={preferences.email_marketing}
                onCheckedChange={(checked) => 
                  setPreferences({ ...preferences, email_marketing: checked })
                }
              />
              <div className="flex-1">
                <Label htmlFor="email_marketing" className="text-base font-medium cursor-pointer">
                  Marketing & Updates
                </Label>
                <p className="text-sm text-gray-500 mt-1">
                  Product updates, tips, and occasional promotions
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 mt-8">
            <Button
              onClick={handleUpdatePreferences}
              disabled={updating}
              className="flex-1 bg-[#0A66C2] hover:bg-[#004182]"
            >
              {updating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                'Save Preferences'
              )}
            </Button>
            
            <Button
              onClick={handleUnsubscribeAll}
              disabled={updating}
              variant="outline"
              className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
            >
              Unsubscribe from All
            </Button>
          </div>
        </Card>

        {/* Resubscribe Option */}
        {!preferences.email_notifications && (
          <Card className="p-6 bg-blue-50 border-blue-200">
            <p className="text-sm text-gray-700 mb-3">
              Changed your mind? You can resubscribe to all email notifications.
            </p>
            <Button
              onClick={handleResubscribe}
              disabled={updating}
              variant="outline"
              className="border-[#0A66C2] text-[#0A66C2] hover:bg-[#0A66C2] hover:text-white"
            >
              Resubscribe to All Emails
            </Button>
          </Card>
        )}

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>
            Need help? Contact us at{' '}
            <a href="mailto:support@estimatenow.io" className="text-[#0A66C2] hover:underline">
              support@estimatenow.io
            </a>
          </p>
          <p className="mt-2">
            <a href="/privacy" className="text-[#0A66C2] hover:underline">Privacy Policy</a>
            {' · '}
            <a href="/" className="text-[#0A66C2] hover:underline">Back to Estimate</a>
          </p>
        </div>
      </div>
    </div>
  );
}
