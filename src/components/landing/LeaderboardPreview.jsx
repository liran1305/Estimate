import React from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from "@/utils";
import { Trophy, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function LeaderboardPreview() {
  const navigate = useNavigate();

  return (
    <section className="py-12 md:py-20 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center">
          {/* Left side - Hook text */}
          <div className="space-y-4 md:space-y-6 order-2 lg:order-1">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-blue-50 rounded-full">
              <Trophy className="w-4 h-4 md:w-5 md:h-5 text-blue-600" />
              <span className="text-xs md:text-sm font-medium text-blue-600">Leaderboard</span>
            </div>
            
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
              See Where You Stand Among Your Peers
            </h2>
            
            <p className="text-base md:text-xl text-gray-600 leading-relaxed">
              Discover Israel's highest-rated professionals ranked by anonymous peer reviews. 
              Compare your skills, unlock your score, and see how you measure up against colleagues 
              who've actually worked with you.
            </p>

            <div className="space-y-3 md:space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-blue-600"></div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm md:text-base">Anonymous Rankings</h3>
                  <p className="text-gray-600 text-sm md:text-base">Based on real feedback from colleagues you've worked with</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-blue-600"></div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm md:text-base">Filter by Role</h3>
                  <p className="text-gray-600 text-sm md:text-base">See top performers in your specific field or position</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-blue-600"></div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm md:text-base">Unlock Your Position</h3>
                  <p className="text-gray-600 text-sm md:text-base">Give 3 reviews to see where you rank</p>
                </div>
              </div>
            </div>

            <div className="pt-2 md:pt-4">
              <Button 
                onClick={() => {
                  if (window.dataLayer) {
                    window.dataLayer.push({
                      event: 'explore_leaderboard_click',
                      source: 'landing_page'
                    });
                  }
                  navigate(createPageUrl("LinkedInAuth"));
                }}
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-5 md:px-8 md:py-6 text-base md:text-lg w-full sm:w-auto"
              >
                Explore Leaderboard
                <ArrowRight className="w-4 h-4 md:w-5 md:h-5 ml-2" />
              </Button>
            </div>
          </div>

          {/* Right side - Leaderboard preview image */}
          <div className="relative order-1 lg:order-2">
            <div className="relative rounded-xl md:rounded-2xl overflow-hidden shadow-xl md:shadow-2xl border border-gray-200">
              <img 
                src="/leaderboard-preview.png" 
                alt="Leaderboard Preview - Israel's Highest-Rated Professionals"
                className="w-full h-auto"
              />
              {/* Overlay gradient for depth */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent pointer-events-none"></div>
            </div>
            
            {/* Floating badge - hidden on small mobile, repositioned on larger screens */}
            <div className="hidden sm:block absolute -top-3 -right-3 md:-top-4 md:-right-4 bg-white rounded-lg md:rounded-xl shadow-lg p-2.5 md:p-4 border border-gray-100">
              <div className="flex items-center gap-2 md:gap-3">
                <div className="w-9 h-9 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                  <Trophy className="w-4 h-4 md:w-6 md:h-6 text-white" />
                </div>
                <div>
                  <div className="text-lg md:text-2xl font-bold text-gray-900">Top 10</div>
                  <div className="text-xs md:text-sm text-gray-600">Product Managers</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
