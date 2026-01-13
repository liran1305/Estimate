
import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { linkedinAuth } from "@/lib/linkedinAuth";
import { Button } from "@/components/ui/button";
import Logo from "@/components/Logo";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Users, User, LogOut, ChevronDown } from "lucide-react";

const publicPages = ['Landing', 'LinkedInAuth', 'LinkedInCallback'];
const blockedOnlyPage = 'Blocked';

export default function Layout({ children, currentPageName }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const currentUser = linkedinAuth.getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
        
        // Check if user is blocked and redirect to Blocked page
        if (currentUser.is_blocked && currentPageName !== blockedOnlyPage) {
          window.location.href = createPageUrl(blockedOnlyPage);
          return;
        }
        
        // If user is NOT blocked but on Blocked page, redirect to Profile
        if (!currentUser.is_blocked && currentPageName === blockedOnlyPage) {
          window.location.href = createPageUrl("Profile");
          return;
        }
      }
      setIsLoading(false);
    };
    checkAuth();
  }, [currentPageName]);

  const handleLogout = () => {
    linkedinAuth.logout();
    window.location.href = createPageUrl("Landing");
  };

  // Show public pages without nav
  if (publicPages.includes(currentPageName) || currentPageName === blockedOnlyPage) {
    return <>{children}</>;
  }

  // Show loading state
  if (isLoading) {
    return <>{children}</>;
  }

  // Show authenticated layout
  if (user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
          <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
            <Link to={createPageUrl("Profile")}>
              <Logo />
            </Link>

            <nav className="flex items-center gap-2">
              <Link to={createPageUrl("Review")}>
                <Button 
                  variant={currentPageName === 'Review' ? 'secondary' : 'ghost'} 
                  className="font-medium"
                >
                  <Users className="w-4 h-4 mr-2" />
                  Review
                </Button>
              </Link>
              <Link to={createPageUrl("Profile")}>
                <Button 
                  variant={currentPageName === 'Profile' ? 'secondary' : 'ghost'} 
                  className="font-medium"
                >
                  <User className="w-4 h-4 mr-2" />
                  Profile
                </Button>
              </Link>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="ml-2 p-2">
                    <img 
                      src={user.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'U')}&background=0A66C2&color=fff&size=32`}
                      alt={user.name}
                      className="w-8 h-8 rounded-full object-cover ring-2 ring-gray-100"
                    />
                    <ChevronDown className="w-4 h-4 ml-1 text-gray-400" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </nav>
          </div>
        </header>
        
        <main className="pt-16">
          {children}
        </main>
      </div>
    );
  }

  return <>{children}</>;
}
