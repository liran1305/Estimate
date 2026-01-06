import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2, Loader2 } from "lucide-react";
import { mockEntities } from "@/lib/mockAuth";

export default function WaitlistModal({ open, onClose }) {
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    await mockEntities.WaitlistEntry.create({
      company_name: companyName,
      email: email
    });
    
    setIsSubmitting(false);
    setIsSuccess(true);
  };

  const handleClose = () => {
    setCompanyName('');
    setEmail('');
    setIsSuccess(false);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        {isSuccess ? (
          <div className="py-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">You're on the list!</h3>
            <p className="text-gray-500">We'll be in touch soon.</p>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-center">Coming Soon for Recruiters</DialogTitle>
            </DialogHeader>
            <p className="text-gray-500 text-center mt-2 mb-6">
              We're building a talent discovery tool based on real peer insights. Join the waitlist.
            </p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="company" className="text-gray-700">Company Name</Label>
                <Input
                  id="company"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Your company"
                  className="mt-1.5 h-12 rounded-xl"
                  required
                />
              </div>
              <div>
                <Label htmlFor="email" className="text-gray-700">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="mt-1.5 h-12 rounded-xl"
                  required
                />
              </div>
              <Button 
                type="submit" 
                className="w-full bg-[#0A66C2] hover:bg-[#004182] h-12 rounded-xl font-medium"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  "Join Waitlist"
                )}
              </Button>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}