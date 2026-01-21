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
  Star
} from "lucide-react";
import { motion } from "framer-motion";

const BACKEND_API_URL = import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:3001';

// Hexagon component - Favikon-style with gradient borders and soft glow
const ProfileHexagon = ({ user, size = 'md', currentUser }) => {
  const isCurrentUser = currentUser && user.userId === currentUser.id;
  const isPublic = user.isPublic || isCurrentUser;
  
  // All hexagons same size - larger like Favikon
  const s = { width: 140, height: 161, circleSize: 100, borderWidth: 5 };

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
              href={user.photoUrl}
              x="0"
              y="0"
              width="100"
              height="115"
              preserveAspectRatio="xMidYMid slice"
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
  const [searchQuery, setSearchQuery] = useState('');
  const [showAutocomplete, setShowAutocomplete] = useState(false);

  // Get current user on mount
  useEffect(() => {
    const user = linkedinAuth.getCurrentUser();
    setCurrentUser(user);
  }, []);

  // Filter categories based on search
  const filteredCategories = categories.filter(cat => 
    cat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Fetch categories on mount
  useEffect(() => {
    fetchCategories();
  }, []);

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

  const fetchCategories = async () => {
    try {
      setIsLoadingCategories(true);
      const res = await fetch(`${BACKEND_API_URL}/api/leaderboard/categories`);
      const data = await res.json();
      
      if (data.success) {
        setCategories(data.categories);
        // Auto-select first category (prefer ones with users)
        const firstWithUsers = data.categories.find(c => c.userCount > 0);
        if (firstWithUsers) {
          setSelectedCategory(firstWithUsers.key);
        } else if (data.categories.length > 0) {
          setSelectedCategory(data.categories[0].key);
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
        setLeaderboard(data.leaderboard);
      }
    } catch (err) {
      console.error('Failed to fetch leaderboard:', err);
      setError('Failed to load leaderboard');
    } finally {
      setIsLoadingLeaderboard(false);
    }
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
          <Card className="p-8 bg-white border border-gray-200">
            {/* Honeycomb Hexagonal Grid Layout - All same size, wider */}
            <div className="flex flex-col items-center" style={{ paddingBottom: '60px' }}>
              {/* Row 1: #1 (centered) */}
              <div className="flex justify-center" style={{ marginBottom: '-35px', zIndex: 40 }}>
                {leaderboard.filter(u => u.rank === 1).map(user => (
                  <ProfileHexagon key={user.rank} user={user} currentUser={currentUser} />
                ))}
              </div>
              
              {/* Row 2: #2, #3 (touching #1) */}
              <div className="flex justify-center" style={{ gap: '8px', marginBottom: '-35px', zIndex: 30 }}>
                {leaderboard.filter(u => u.rank >= 2 && u.rank <= 3).map(user => (
                  <ProfileHexagon key={user.rank} user={user} currentUser={currentUser} />
                ))}
              </div>
              
              {/* Row 3: #4, #5, #6 (touching row 2) */}
              <div className="flex justify-center" style={{ gap: '8px', marginBottom: '-35px', zIndex: 20 }}>
                {leaderboard.filter(u => u.rank >= 4 && u.rank <= 6).map(user => (
                  <ProfileHexagon key={user.rank} user={user} currentUser={currentUser} />
                ))}
              </div>
              
              {/* Row 4: #7, #8, #9, #10 (touching row 3) */}
              <div className="flex justify-center" style={{ gap: '8px', zIndex: 10 }}>
                {leaderboard.filter(u => u.rank >= 7 && u.rank <= 10).map(user => (
                  <ProfileHexagon key={user.rank} user={user} currentUser={currentUser} />
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
    </div>
  );
}
