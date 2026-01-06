import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Shield, Eye, LogOut } from "lucide-react";

export default function ConsentModal({ open, onClose, onConfirm, isLoading }) {
  const [agreed, setAgreed] = useState(false);

  const handleConfirm = () => {
    if (agreed) {
      onConfirm();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Consent to Use Reviews in Recruitment</DialogTitle>
        </DialogHeader>
        
        <div className="py-4 space-y-4">
          <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
            <div className="w-10 h-10 bg-[#0A66C2]/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <Eye className="w-5 h-5 text-[#0A66C2]" />
            </div>
            <div>
              <p className="font-medium text-gray-900 text-sm">Visible to Recruiters</p>
              <p className="text-xs text-gray-500">Your reviews become visible to verified recruiters</p>
            </div>
          </div>
          
          <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
            <div className="w-10 h-10 bg-[#0A66C2]/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <Shield className="w-5 h-5 text-[#0A66C2]" />
            </div>
            <div>
              <p className="font-medium text-gray-900 text-sm">Anonymous Reviews</p>
              <p className="text-xs text-gray-500">Your identity stays anonymous to reviewers</p>
            </div>
          </div>
          
          <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
            <div className="w-10 h-10 bg-[#0A66C2]/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <LogOut className="w-5 h-5 text-[#0A66C2]" />
            </div>
            <div>
              <p className="font-medium text-gray-900 text-sm">Opt Out Anytime</p>
              <p className="text-xs text-gray-500">You can disable this setting whenever you want</p>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Checkbox 
              id="consent" 
              checked={agreed} 
              onCheckedChange={setAgreed}
            />
            <Label htmlFor="consent" className="text-sm text-gray-700 cursor-pointer">
              I agree to the terms and conditions
            </Label>
          </div>
        </div>

        <DialogFooter className="gap-3">
          <Button variant="outline" onClick={onClose} className="rounded-xl">
            Cancel
          </Button>
          <Button 
            onClick={handleConfirm}
            disabled={!agreed || isLoading}
            className="bg-[#0A66C2] hover:bg-[#004182] rounded-xl"
          >
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}