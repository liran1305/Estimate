import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { linkedinAuth } from "@/lib/linkedinAuth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Trophy, 
  Lock, 
  Users, 
  ChevronRight,
  Linkedin,
  Star,
  Share2,
  Download,
  Copy
} from "lucide-react";
import { motion } from "framer-motion";
import html2canvas from 'html2canvas';

const BACKEND_API_URL = import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:3001';

// Hexagon component - Favikon-style with gradient borders and soft glow
const ProfileHexagon = ({ user, size = 'md', currentUser, isMobile = false }) => {
  // Use isCurrentUser from backend OR check userId match
  const isCurrentUser = user.isCurrentUser || (currentUser && user.userId === currentUser.id);
  const isPublic = user.isPublic || isCurrentUser;
  
  // Use photo URL from backend, or fallback to currentUser's picture from localStorage
  const imageUrl = user.photoUrl || (isCurrentUser && currentUser?.picture) || null;
  
  // Responsive hexagon sizes - smaller on mobile
  const s = isMobile 
    ? { width: 80, height: 92, circleSize: 60, borderWidth: 3 }
    : { width: 140, height: 161, circleSize: 100, borderWidth: 5 };

  // Gradient colors - vibrant like Favikon
  const getGradient = () => {
    if (isCurrentUser) {
      return 'linear-gradient(135deg, #0A66C2 0%, #0ea5e9 100%)'; // Blue gradient for current user
    }
    if (user.rank <= 3) {
      return 'linear-gradient(135deg, #ec4899 0%, #f97316 100%)'; // Pink to orange gradient for top 3
    }
    return 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)'; // Gray gradient for others
  };

  const gradient = getGradient();
  const glowColor = isCurrentUser ? '#0A66C2' : (user.rank <= 3 ? '#ec4899' : '#9ca3af');

  const [gradientStart, gradientEnd] = isCurrentUser
    ? ['#0A66C2', '#0ea5e9']
    : (user.rank <= 3 ? ['#ec4899', '#f97316'] : ['#9ca3af', '#6b7280']);

  const clipId = `hex-clip-${user.rank}-${isCurrentUser ? 'me' : 'u'}`;
  const gradId = `hex-grad-${user.rank}-${isCurrentUser ? 'me' : 'u'}`;

  // Rounded-hex path (Favikon-style). ViewBox is 100x115.
  // Straight lines with rounded corners.
  const HEX_PATH_D = 'M 44 8 Q 50 4 56 8 L 88 26 Q 96 30 96 38 L 96 77 Q 96 85 88 89 L 56 107 Q 50 111 44 107 L 12 89 Q 4 85 4 77 L 4 38 Q 4 30 12 26 L 44 8 Z';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: user.rank * 0.02 }}
      className="relative flex flex-col items-center"
      style={{ width: s.width, height: s.height }}
    >
      <svg
        width={s.width}
        height={s.height}
        viewBox="0 0 100 115"
        className="absolute"
        style={{
          filter: `drop-shadow(0 0 ${user.rank <= 3 || isCurrentUser ? '12px' : '6px'} ${glowColor}40)`
        }}
      >
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={gradientStart} />
            <stop offset="100%" stopColor={gradientEnd} />
          </linearGradient>
          <clipPath id={clipId} clipPathUnits="userSpaceOnUse">
            <path d={HEX_PATH_D} />
          </clipPath>
        </defs>

        {/* Content clipped to hex shape */}
        <g clipPath={`url(#${clipId})`}>
          {isPublic && user.photoUrl ? (
            <image
              href={imageUrl}
              x="0"
              y="0"
              width="100"
              height="115"
              preserveAspectRatio="xMidYMid slice"
              crossOrigin="anonymous"
            />
          ) : (
            <>
              {/* Blurred realistic fake profile for private profiles */}
              {/* Uses local fake profile images - randomly selected based on rank */}
              <image
                href={`/images/fake-profile-images/download (${((user.rank - 1) % 10) + 1}).png`}
                x="0"
                y="0"
                width="100"
                height="115"
                preserveAspectRatio="xMidYMid slice"
                style={{ filter: 'blur(8px)' }}
              />
              {/* Dark overlay */}
              <rect x="0" y="0" width="100" height="115" fill="rgba(0,0,0,0.3)" />
            </>
          )}

          {(!isPublic || !user.photoUrl) && (
            <foreignObject x="0" y="0" width="100" height="115">
              <div
                xmlns="http://www.w3.org/1999/xhtml"
                style={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <div xmlns="http://www.w3.org/1999/xhtml" style={{ marginTop: '4px' }}>
                  <Lock style={{ width: '26px', height: '26px', color: '#ffffff' }} />
                </div>
              </div>
            </foreignObject>
          )}
        </g>

        {/* Border stroke */}
        <path
          d={HEX_PATH_D}
          fill="none"
          stroke={`url(#${gradId})`}
          strokeWidth={8}
          strokeLinejoin="round"
        />

        {/* Bottom Badge (Rank) - Round shape */}
        <circle
          cx="50"
          cy="100"
          r="10"
          fill="white"
        />
        <text
          x="50"
          y="103"
          textAnchor="middle"
          fontSize="8"
          fontWeight="800"
          fill="#374151"
        >
          #{user.rank}
        </text>
      </svg>
    </motion.div>
  );
};

// Score color based on value
const getScoreColor = (score) => {
  const s = parseFloat(score);
  if (s >= 9) return 'text-emerald-600';
  if (s >= 8) return 'text-green-600';
  if (s >= 7) return 'text-lime-600';
  if (s >= 6) return 'text-yellow-600';
  return 'text-orange-600';
};

// Get border color for rank
const getRankBorderColor = (rank, isCurrentUser) => {
  if (isCurrentUser) return 'ring-4 ring-[#0A66C2] ring-offset-2';
  if (rank === 1) return 'ring-4 ring-amber-400';
  if (rank === 2) return 'ring-4 ring-gray-400';
  if (rank === 3) return 'ring-4 ring-amber-600';
  return 'ring-2 ring-gray-200';
};

export default function Leaderboard() {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [isLoadingLeaderboard, setIsLoadingLeaderboard] = useState(false);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [userPosition, setUserPosition] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareImage, setShareImage] = useState(null);
  const [shareText, setShareText] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [hasFetchedCategories, setHasFetchedCategories] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);

  // Track window resize for responsive hexagons
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Get current user, their position, and then fetch categories
  useEffect(() => {
    const initLeaderboard = async () => {
      const user = linkedinAuth.getCurrentUser();
      setCurrentUser(user);
      
      let position = null;
      
      // Fetch user's position from backend if logged in
      if (user?.linkedinProfileId) {
        try {
          const res = await fetch(`${BACKEND_API_URL}/api/colleagues/profile/${user.linkedinProfileId}/colleagues`);
          const data = await res.json();
          if (data.success && data.profile?.position) {
            position = data.profile.position;
            setUserPosition(position);
          }
        } catch (err) {
          console.error('Failed to fetch user position:', err);
        }
      }
      
      // Now fetch categories with the position we just got
      await fetchCategoriesWithPosition(position);
    };
    
    initLeaderboard();
  }, []);

  // Filter categories based on search
  const filteredCategories = categories.filter(cat => 
    cat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Fetch leaderboard when category changes
  useEffect(() => {
    if (selectedCategory) {
      fetchLeaderboard(selectedCategory);
    }
  }, [selectedCategory]);

  // Set search query when category is auto-selected
  useEffect(() => {
    if (selectedCategory && categories.length > 0 && !searchQuery) {
      const category = categories.find(c => c.key === selectedCategory);
      if (category) {
        setSearchQuery(category.name);
      }
    }
  }, [selectedCategory, categories]);

  // Close autocomplete when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.autocomplete-container')) {
        setShowAutocomplete(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchCategoriesWithPosition = async (position) => {
    try {
      setIsLoadingCategories(true);
      const res = await fetch(`${BACKEND_API_URL}/api/leaderboard/categories`);
      const data = await res.json();
      
      if (data.success) {
        setCategories(data.categories);
        
        // Try to match user's position to a category
        let selectedCat = null;
        
        if (position) {
          console.log('User position:', position);
          // Normalize user's position and find matching category
          const lowerPos = position.toLowerCase();
          
          // Try exact match first
          selectedCat = data.categories.find(c => {
            const catName = c.name.toLowerCase();
            return catName === lowerPos;
          });
          
          // Try to find the most specific match (longest category name that matches)
          if (!selectedCat) {
            const matchingCategories = data.categories.filter(c => {
              const catName = c.name.toLowerCase();
              // Check if the full category name appears in the position
              return lowerPos.includes(catName);
            });
            
            // Sort by name length (longest = most specific) and pick the first
            if (matchingCategories.length > 0) {
              matchingCategories.sort((a, b) => b.name.length - a.name.length);
              selectedCat = matchingCategories[0];
            }
          }
          
          // Fallback: check individual significant words (but prioritize multi-word matches)
          if (!selectedCat) {
            selectedCat = data.categories.find(c => {
              const catName = c.name.toLowerCase();
              const posWords = lowerPos.split(/[\s|,]+/);
              const catWords = catName.split(' ');
              
              // Require at least 2 words to match, or the full category name
              const matchingWords = catWords.filter(cw => 
                posWords.some(pw => pw.includes(cw) || cw.includes(pw)) && cw.length > 3
              );
              
              return matchingWords.length >= Math.min(2, catWords.length);
            });
          }
          
          console.log('Matched category:', selectedCat?.name || 'none');
        }
        
        // Fallback: select first category with users
        if (!selectedCat) {
          selectedCat = data.categories.find(c => c.userCount > 0);
          console.log('Using fallback category:', selectedCat?.name);
        }
        
        // Final fallback: first category
        if (!selectedCat && data.categories.length > 0) {
          selectedCat = data.categories[0];
        }
        
        if (selectedCat) {
          setSelectedCategory(selectedCat.key);
        }
      }
    } catch (err) {
      console.error('Failed to fetch categories:', err);
      setError('Failed to load categories');
    } finally {
      setIsLoadingCategories(false);
    }
  };

  const fetchLeaderboard = async (categoryKey) => {
    try {
      setIsLoadingLeaderboard(true);
      const userId = currentUser?.id || '';
      const res = await fetch(`${BACKEND_API_URL}/api/leaderboard/${categoryKey}?limit=50&currentUserId=${userId}`);
      const data = await res.json();
      
      if (data.success) {
        // Debug: Log current user's leaderboard entry
        const myEntry = data.leaderboard.find(u => u.isCurrentUser);
        console.log('My leaderboard entry:', myEntry);
        console.log('Current user ID:', userId);
        
        // Enhance current user's entry with photo from localStorage if missing
        const enhancedLeaderboard = data.leaderboard.map(entry => {
          if (entry.isCurrentUser && !entry.photoUrl && currentUser?.picture) {
            return { ...entry, photoUrl: currentUser.picture };
          }
          return entry;
        });
        
        setLeaderboard(enhancedLeaderboard);
      }
    } catch (err) {
      console.error('Failed to fetch leaderboard:', err);
      setError('Failed to load leaderboard');
    } finally {
      setIsLoadingLeaderboard(false);
    }
  };

  const handleSharePosition = async () => {
    const userPosition = leaderboard.find(u => u.userId === currentUser?.id);
    if (!userPosition) return;

    // Generate share text first
    const percentile = Math.round((1 - (userPosition.rank - 1) / 10) * 100);
    const text = `🎯 Ranked #${userPosition.rank} among ${selectedCategoryData?.name || 'professionals'} on Estimate!

Based on anonymous peer reviews from colleagues I've worked with, I'm in the top ${percentile}% of ${selectedCategoryData?.name || 'my field'}.

My score: ${userPosition.score}/10 ⭐

Estimate uses anonymous peer feedback to help professionals understand their true market value. No politics, just honest colleague reviews.

Check out your ranking: estimatenow.io

#${selectedCategoryData?.name?.replace(/\s+/g, '')} #PeerReview #CareerGrowth #ProfessionalDevelopment`;

    setShareText(text);

    // Wait for all images to load before capturing screenshot
    const leaderboardElement = document.getElementById('leaderboard-hexagons');
    if (leaderboardElement) {
      try {
        // Wait for all images in the leaderboard to load
        const images = leaderboardElement.querySelectorAll('image');
        await Promise.all(
          Array.from(images).map(img => {
            return new Promise((resolve) => {
              if (img.href && img.href.baseVal) {
                const image = new Image();
                image.crossOrigin = 'anonymous';
                image.onload = () => resolve();
                image.onerror = () => resolve(); // Resolve even on error to not block
                image.src = img.href.baseVal;
              } else {
                resolve();
              }
            });
          })
        );

        // Add small delay to ensure rendering is complete
        await new Promise(resolve => setTimeout(resolve, 500));

        const canvas = await html2canvas(leaderboardElement, {
          backgroundColor: '#ffffff',
          scale: 2,
          logging: false,
          allowTaint: true
        });
        const imageDataUrl = canvas.toDataURL('image/png');
        setShareImage(imageDataUrl);
      } catch (err) {
        console.error('Failed to capture screenshot:', err);
      }
    }

    // Open modal after screenshot is captured
    setShowShareModal(true);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareText);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const downloadImage = () => {
    if (shareImage) {
      const link = document.createElement('a');
      link.download = 'my-leaderboard-position.png';
      link.href = shareImage;
      link.click();
    }
  };

  const shareOnLinkedIn = () => {
    // LinkedIn share URL with pre-filled text
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent('https://estimatenow.io')}`;
    window.open(linkedInUrl, '_blank', 'width=600,height=600');
    
    // Copy text to clipboard so user can paste it
    copyToClipboard();
  };

  const selectedCategoryData = categories.find(c => c.key === selectedCategory);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* Two Column Layout: Sidebar + Main Content */}
        <div className="flex flex-col lg:flex-row gap-6">
          
          {/* Left Sidebar - Filter and Title */}
          <div className="lg:w-80 flex-shrink-0">
            {/* Hero Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-orange-50 to-pink-50 rounded-full mb-4">
              <Trophy className="w-4 h-4 text-orange-500" />
              Top Performers
            </div>
            
            {/* Main Title */}
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Israel's Highest-Rated Professionals
            </h1>
            <p className="text-sm text-gray-600 mb-6">
              Discover top talent ranked by anonymous peer reviews from colleagues who've actually worked with them.
            </p>

            {/* Search Filter */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Role</label>
              {isLoadingCategories ? (
                <Skeleton className="h-10 w-full rounded-lg" />
              ) : (
                <div className="relative autocomplete-container">
                  <input
                    type="text"
                    placeholder="Search for a role..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setShowAutocomplete(true);
                    }}
                    onFocus={() => setShowAutocomplete(true)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0A66C2] focus:border-[#0A66C2] bg-white"
                  />
                  
                  {/* Autocomplete Dropdown */}
                  {showAutocomplete && searchQuery && filteredCategories.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {filteredCategories.map(category => (
                        <button
                          key={category.key}
                          onClick={() => {
                            setSelectedCategory(category.key);
                            setSearchQuery(category.name);
                            setShowAutocomplete(false);
                          }}
                          className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center justify-between"
                        >
                          <span className="text-gray-900">{category.name}</span>
                          {category.userCount > 0 && (
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                              {category.userCount}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                  
                  {/* Show all categories when no search */}
                  {showAutocomplete && !searchQuery && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {categories.map(category => (
                        <button
                          key={category.key}
                          onClick={() => {
                            setSelectedCategory(category.key);
                            setSearchQuery(category.name);
                            setShowAutocomplete(false);
                          }}
                          className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center justify-between ${
                            selectedCategory === category.key ? 'bg-[#0A66C2]/5 text-[#0A66C2]' : 'text-gray-900'
                          }`}
                        >
                          <span>{category.name}</span>
                          {category.userCount > 0 && (
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                              {category.userCount}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Category Title */}
            {selectedCategoryData && (
              <div className="mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                  Top {selectedCategoryData.displayName}s
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Ranked by peer review scores
                  {selectedCategoryData.categoryName && (
                    <span className="text-gray-400 block mt-1">{selectedCategoryData.categoryName}</span>
                  )}
                </p>
              </div>
            )}
          </div>

          {/* Main Content - Pyramid Grid */}
          <div className="flex-1">

        {isLoadingLeaderboard ? (
          <div className="flex justify-center py-12">
            <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(4, 80px)' }}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => (
                <Skeleton key={i} className="w-20 h-20 rounded-full" />
              ))}
            </div>
          </div>
        ) : leaderboard.length === 0 ? (
          <Card className="p-12 text-center">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No rankings yet</h3>
            <p className="text-gray-500 mb-6">
              Be the first to get reviewed and appear on this leaderboard!
            </p>
            <Link to={createPageUrl("LinkedInAuth")}>
              <Button className="bg-[#0A66C2] hover:bg-[#004182] text-white">
                Get Started
              </Button>
            </Link>
          </Card>
        ) : (
          <Card className="p-4 sm:p-8 bg-white border border-gray-200">
            {/* Honeycomb Hexagonal Grid Layout - Responsive */}
            <div id="leaderboard-hexagons" className="flex flex-col items-center" style={{ paddingBottom: isMobile ? '30px' : '60px' }}>
              {/* Row 1: #1 (centered) */}
              <div className="flex justify-center" style={{ marginBottom: isMobile ? '-20px' : '-35px', zIndex: 40 }}>
                {leaderboard.filter(u => u.rank === 1).map(user => (
                  <ProfileHexagon key={user.rank} user={user} currentUser={currentUser} isMobile={isMobile} />
                ))}
              </div>
              
              {/* Row 2: #2, #3 (touching #1) */}
              <div className="flex justify-center" style={{ gap: isMobile ? '4px' : '8px', marginBottom: isMobile ? '-20px' : '-35px', zIndex: 30 }}>
                {leaderboard.filter(u => u.rank >= 2 && u.rank <= 3).map(user => (
                  <ProfileHexagon key={user.rank} user={user} currentUser={currentUser} isMobile={isMobile} />
                ))}
              </div>
              
              {/* Row 3: #4, #5, #6 (touching row 2) */}
              <div className="flex justify-center" style={{ gap: isMobile ? '4px' : '8px', marginBottom: isMobile ? '-20px' : '-35px', zIndex: 20 }}>
                {leaderboard.filter(u => u.rank >= 4 && u.rank <= 6).map(user => (
                  <ProfileHexagon key={user.rank} user={user} currentUser={currentUser} isMobile={isMobile} />
                ))}
              </div>
              
              {/* Row 4: #7, #8, #9, #10 (touching row 3) */}
              <div className="flex justify-center" style={{ gap: isMobile ? '4px' : '8px', zIndex: 10 }}>
                {leaderboard.filter(u => u.rank >= 7 && u.rank <= 10).map(user => (
                  <ProfileHexagon key={user.rank} user={user} currentUser={currentUser} isMobile={isMobile} />
                ))}
              </div>
            </div>

            {/* Legend */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-pink-500"></div>
                  <span>#1 Top Performer</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#0A66C2]"></div>
                  <span>Your Position</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-gray-400"></div>
                  <span>Private Profile</span>
                </div>
              </div>
            </div>

            {/* Share Button - Disabled until user has enough reviews */}
            {currentUser && leaderboard.some(u => u.userId === currentUser.id) && (
              <div className="mt-6 flex justify-center">
                <div title="You don't have enough reviews to share your position yet">
                  <Button 
                    disabled
                    className="bg-gray-400 text-white cursor-not-allowed opacity-60"
                    size="lg"
                  >
                    <Share2 className="w-5 h-5 mr-2" />
                    Share Your Position
                  </Button>
                </div>
              </div>
            )}
          </Card>
        )}

          {/* CTA Section - Only show if user is not in top 10 */}
          {currentUser && !leaderboard.some(u => u.userId === currentUser.id) && (
            <Card className="mt-12 p-8 bg-gradient-to-br from-[#0A66C2]/5 to-[#0A66C2]/10 border-[#0A66C2]/20">
              <div className="text-center">
                <Trophy className="w-12 h-12 text-[#0A66C2] mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Want to be on this list?
                </h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  Get reviewed by your colleagues and unlock your professional score. 
                  Share it with recruiters to stand out.
                </p>
                <Link to={createPageUrl("LinkedInAuth")}>
                  <Button size="lg" className="bg-[#0A66C2] hover:bg-[#004182] text-white">
                    <Linkedin className="w-5 h-5 mr-2" />
                    Get Your Score
                    <ChevronRight className="w-5 h-5 ml-1" />
                  </Button>
                </Link>
              </div>
            </Card>
          )}

          </div>
          {/* End Main Content */}
        </div>
        {/* End Two Column Layout */}
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowShareModal(false)}>
          <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold text-gray-900">Share Your Position</h3>
                <Button variant="ghost" size="sm" onClick={() => setShowShareModal(false)}>✕</Button>
              </div>

              {/* Screenshot Preview */}
              {shareImage && (
                <div className="mb-6 border border-gray-200 rounded-lg overflow-hidden">
                  <img src={shareImage} alt="Leaderboard Position" className="w-full" />
                </div>
              )}

              {/* Editable Share Text */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Share Text (editable)
                </label>
                <textarea
                  value={shareText}
                  onChange={(e) => setShareText(e.target.value)}
                  className="w-full h-64 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A66C2] focus:border-transparent"
                  placeholder="Edit your share text..."
                />
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                {/* Primary: Share on LinkedIn */}
                <Button onClick={shareOnLinkedIn} className="w-full bg-[#0A66C2] hover:bg-[#004182] text-white" size="lg">
                  <Linkedin className="w-5 h-5 mr-2" />
                  Share on LinkedIn
                </Button>
                
                {/* Secondary: Copy and Download */}
                <div className="flex gap-3">
                  <Button onClick={copyToClipboard} variant="outline" className="flex-1">
                    <Copy className="w-4 h-4 mr-2" />
                    {isCopied ? 'Copied!' : 'Copy Text'}
                  </Button>
                  <Button onClick={downloadImage} variant="outline" className="flex-1">
                    <Download className="w-4 h-4 mr-2" />
                    Download Image
                  </Button>
                </div>
              </div>

              <p className="mt-4 text-sm text-gray-500 text-center">
                Click "Share on LinkedIn" to post directly, or copy text and download image for other platforms
              </p>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
