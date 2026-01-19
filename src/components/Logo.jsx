import React from 'react';

export default function Logo({ className = "h-8" }) {
  return (
    <>
      {/* Mobile: Show icon only */}
      <img 
        src="/favicons/estimate-favicon-512.png" 
        alt="Estimate" 
        className={`md:hidden ${className}`}
      />
      {/* Desktop: Show full logo */}
      <img 
        src="/images/Estimate_logo_LIGHT_00000.png" 
        alt="Estimate" 
        className={`hidden md:block ${className}`}
      />
    </>
  );
}
