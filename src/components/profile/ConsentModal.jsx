import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export default function ConsentModal({ open, onClose, onConfirm, isLoading }) {
  const [agreed, setAgreed] = useState(false);

  const handleConfirm = () => {
    if (agreed) {
      onConfirm();
      setAgreed(false);
    }
  };

  const handleClose = () => {
    setAgreed(false);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center">Consent to Use Reviews in Recruitment</DialogTitle>
        </DialogHeader>
        
        <div className="py-4 space-y-4 text-sm text-gray-700">
          <p>
            By switching on "Reviews Permitted for Recruitment," you are granting Estimate the permission to:
          </p>
          
          <ol className="list-decimal list-outside ml-5 space-y-3">
            <li>
              <span className="font-medium">Share Your Reviews:</span> Make your professional reviews accessible to our network of verified recruiters and hiring companies. This includes all past and future reviews you submit.
            </li>
            <li>
              <span className="font-medium">Enhance Your Professional Opportunities:</span> Use your reviews to match you with relevant job opportunities and career advancements. Your insights and feedback are valuable to potential employers seeking candidates with your experience and skills.
            </li>
            <li>
              <span className="font-medium">Privacy and Anonymity:</span> While your reviews will be shared to showcase your professional insights, Estimate is committed to protecting your privacy. Your identity will remain anonymous to employers viewing your reviews, unless you decide to engage further with their opportunities.
            </li>
            <li>
              <span className="font-medium">Opt-out Anytime:</span> You have full control over this permission and can opt out at any moment. Disabling this feature will immediately cease the sharing of your reviews with recruiters and companies, but will not affect reviews already accessed during the enabled period.
            </li>
          </ol>

          <p className="text-gray-600">
            Please read our <a href="/privacy" className="text-[#0A66C2] underline hover:no-underline">Privacy Policy</a> and <a href="/terms" className="text-[#0A66C2] underline hover:no-underline">Terms of Use</a> for more detailed information on how your data is managed and protected.
          </p>

          <div className="flex items-start gap-3 pt-4 border-t border-gray-100">
            <Checkbox 
              id="consent" 
              checked={agreed} 
              onCheckedChange={setAgreed}
              className="mt-1"
            />
            <Label htmlFor="consent" className="text-sm text-gray-700 cursor-pointer leading-relaxed">
              I agree to the "Reviews Permitted for Recruitment" terms and consent to my reviews being used for recruitment purposes.
            </Label>
          </div>
        </div>

        <DialogFooter className="gap-3 sm:gap-3">
          <Button variant="outline" onClick={handleClose} className="rounded-lg px-6">
            Cancel
          </Button>
          <Button 
            onClick={handleConfirm}
            disabled={!agreed || isLoading}
            className="bg-[#0A66C2] hover:bg-[#004182] rounded-lg px-6"
          >
            {isLoading ? 'Confirming...' : 'Confirm'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}