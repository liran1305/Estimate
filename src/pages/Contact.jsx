import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { createPageUrl } from "@/utils";
import { linkedinAuth } from "@/lib/linkedinAuth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Logo from "@/components/Logo";
import { Mail, AlertCircle, Send, CheckCircle } from "lucide-react";

const BACKEND_API_URL = import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:3001';

function GenericContactForm({ navigate }) {
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch(`${BACKEND_API_URL}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, subject, message })
      });

      const data = await response.json();

      if (data.success) {
        setIsSuccess(true);
        if (window.dataLayer) {
          window.dataLayer.push({
            event: 'contact_form_submitted',
            form_type: 'generic_contact'
          });
        }
      } else {
        setError(data.error || 'Failed to send message. Please try again.');
      }
    } catch (err) {
      setError('Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Message Sent!
        </h2>
        
        <p className="text-lg text-gray-600 mb-8">
          Thank you for contacting us. We'll get back to you within 24 hours.
        </p>

        <Button
          onClick={() => navigate(createPageUrl("Landing"))}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          size="lg"
        >
          Return to Home
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Mail className="w-8 h-8 text-blue-600" />
        </div>
        
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
          Get in Touch
        </h1>
        
        <p className="text-lg text-gray-600">
          Have questions about Estimate? We're here to help.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            Your Name
          </label>
          <Input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="John Doe"
            required
            className="w-full"
          />
        </div>

        <div>
          <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
            Subject
          </label>
          <Input
            id="subject"
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="What can we help you with?"
            required
            className="w-full"
          />
        </div>

        <div>
          <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
            Message
          </label>
          <Textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Tell us more about your question or issue..."
            required
            rows={6}
            className="w-full resize-none"
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <div className="space-y-3">
          <Button
            type="submit"
            disabled={isSubmitting || !name.trim() || !subject.trim() || !message.trim()}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            size="lg"
          >
            <Send className="w-5 h-5 mr-2" />
            {isSubmitting ? 'Sending...' : 'Send Message'}
          </Button>
          
          <Button
            type="button"
            onClick={() => navigate(createPageUrl("Landing"))}
            variant="outline"
            className="w-full"
            size="lg"
          >
            Return to Home
          </Button>
        </div>
      </form>
    </div>
  );
}

export default function Contact() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const reason = searchParams.get('reason');

  useEffect(() => {
    const currentUser = linkedinAuth.getCurrentUser();
    setUser(currentUser);
    
    // Track when users land on profile-not-found contact page
    if (reason === 'profile_not_found') {
      if (window.dataLayer) {
        window.dataLayer.push({
          event: 'profile_not_found_page_view',
          user_email: currentUser?.email,
          user_name: currentUser?.name
        });
      }
    }
  }, [reason]);

  const isProfileNotFound = reason === 'profile_not_found';

  const handleContactSupport = () => {
    if (user) {
      const subject = 'Account Setup Assistance Required';
      const body = `Hi Estimate Team,

I signed in with LinkedIn but my profile was not found in your system.

My details:
- Name: ${user.name}
- Email: ${user.email}

Please help me get my account set up.

Thank you!`;
      
      window.location.href = `mailto:support@estimatenow.io?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    } else {
      window.location.href = 'mailto:support@estimatenow.io?subject=Account Setup Assistance Required';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        <div className="flex items-center justify-center mb-12">
          <Logo className="h-10" />
        </div>

        <Card className="p-8 md:p-12 border-0 shadow-xl shadow-gray-200/50">
          {isProfileNotFound ? (
            <div className="text-center">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="w-8 h-8 text-amber-600" />
              </div>
              
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                Account Setup Required
              </h1>
              
              <p className="text-lg text-gray-600 mb-6">
                Your LinkedIn profile was not found in our system. Our team needs to add you manually to get started.
              </p>

              <div className="bg-gray-50 rounded-xl p-6 mb-8 text-left">
                <h2 className="font-semibold text-gray-900 mb-3">What happens next:</h2>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold mt-1">1.</span>
                    <span>Click the button below to contact our support team</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold mt-1">2.</span>
                    <span>We'll add your profile and match you with colleagues</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold mt-1">3.</span>
                    <span>You'll receive an email when your account is ready (usually within 24-48 hours)</span>
                  </li>
                </ul>
              </div>

              {user && (
                <div className="bg-blue-50 rounded-xl p-4 mb-6">
                  <p className="text-sm text-gray-700">
                    <strong>Signed in as:</strong> {user.name} ({user.email})
                  </p>
                </div>
              )}

              <div className="space-y-3">
                <Button
                  onClick={handleContactSupport}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  size="lg"
                >
                  <Mail className="w-5 h-5 mr-2" />
                  Contact Support Team
                </Button>
                
                <Button
                  onClick={() => navigate(createPageUrl("Landing"))}
                  variant="outline"
                  className="w-full"
                  size="lg"
                >
                  Return to Home
                </Button>
              </div>
            </div>
          ) : (
            <GenericContactForm navigate={navigate} />
          )}
        </Card>
      </div>
    </div>
  );
}
