
import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { mockAuth } from "@/lib/mockAuth";
import { Button } from "@/components/ui/button";
import Logo from "@/components/Logo";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Users, User, LogOut, ChevronDown } from "lucide-react";

const publicPages = ['Landing', 'LinkedInAuth'];

export default function Layout({ children, currentPageName }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const isAuthenticated = await mockAuth.isAuthenticated();
      if (isAuthenticated) {
        const currentUser = await mockAuth.me();
        setUser(currentUser);
      }
      setIsLoading(false);
    };
    checkAuth();
  }, []);

  const handleLogout = () => {
    mockAuth.logout(createPageUrl("Landing"));
  };

  // Show public pages without nav
  if (publicPages.includes(currentPageName)) {
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
                      src={user.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.full_name || 'U')}&background=0A66C2&color=fff&size=32`}
                      alt={user.full_name}
                      className="w-8 h-8 rounded-lg object-cover"
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
