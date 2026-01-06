import React from 'react';
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function Header({ showSignIn = true }) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to={createPageUrl("Landing")} className="flex items-center gap-2">
            <div className="text-2xl font-bold text-[#0A66C2]">Estimate</div>
        </Link>
        
        {showSignIn && (
          <Link to={createPageUrl("LinkedInAuth")}>
            <Button variant="ghost" className="text-gray-600 hover:text-gray-900 font-medium">
              Sign In
            </Button>
          </Link>
        )}
      </div>
    </header>
  );
}