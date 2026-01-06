import React from 'react';

export default function Logo({ className = "h-8" }) {
  return (
    <img 
      src="/images/Estimate_logo.png" 
      alt="Estimate" 
      className={className}
    />
  );
}
