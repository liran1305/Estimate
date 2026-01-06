import React from 'react';
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import Logo from "@/components/Logo";

export default function Header({ showSignIn = true }) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="w-full px-6 md:px-16 h-16 flex items-center justify-between">
        <Link to={createPageUrl("Landing")}>
            <Logo />
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