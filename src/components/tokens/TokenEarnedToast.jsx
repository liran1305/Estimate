import React, { useEffect, useState } from 'react';
import { Ticket, X } from 'lucide-react';

/**
 * TokenEarnedToast - Celebratory toast when user earns a new token
 */
export default function TokenEarnedToast({ 
  isVisible, 
  tokensAvailable, 
  onClose,
  onUseToken 
}) {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setIsAnimating(true);
      // Auto-close after 8 seconds
      const timer = setTimeout(() => {
        onClose();
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-slide-up">
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl shadow-2xl p-4 max-w-sm">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 p-1 text-white/70 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Content */}
        <div className="flex items-start gap-3">
          {/* Animated ticket icon */}
          <div className={`p-3 bg-white/20 rounded-xl ${isAnimating ? 'animate-bounce' : ''}`}>
            <Ticket className="w-8 h-8 text-white" />
          </div>

          <div className="flex-1">
            <h3 className="text-white font-bold text-lg mb-1">
              🎉 You earned a Request Token!
            </h3>
            <p className="text-white/90 text-sm mb-3">
              You now have <span className="font-bold">{tokensAvailable}</span> token{tokensAvailable !== 1 ? 's' : ''}.
              Invite a colleague to review you directly!
            </p>

            <div className="flex gap-2">
              <button
                onClick={onUseToken}
                className="flex-1 py-2 px-3 bg-white text-amber-600 rounded-lg font-medium hover:bg-amber-50 transition-colors text-sm"
              >
                Use Token Now
              </button>
              <button
                onClick={onClose}
                className="py-2 px-3 bg-white/20 text-white rounded-lg font-medium hover:bg-white/30 transition-colors text-sm"
              >
                Later
              </button>
            </div>
          </div>
        </div>

        {/* Confetti effect (CSS-only) */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 rounded-full animate-confetti"
              style={{
                left: `${Math.random() * 100}%`,
                top: '-10px',
                backgroundColor: ['#fff', '#fbbf24', '#f97316', '#fef3c7'][i % 4],
                animationDelay: `${Math.random() * 0.5}s`,
                animationDuration: `${1 + Math.random()}s`
              }}
            />
          ))}
        </div>
      </div>

      {/* Add keyframes via style tag */}
      <style>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        
        @keyframes confetti {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(200px) rotate(720deg);
            opacity: 0;
          }
        }
        
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
        
        .animate-confetti {
          animation: confetti 1.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
