import React, { useState, useEffect } from 'react';

const titles = [
  {
    text: "Turn Peer Feedback into Job Offers.",
    audience: "Talent",
    color: "#0A66C2"
  },
  {
    text: "Validate Talent Through Real Peer Insights.",
    audience: "Recruiters",
    color: "#6B7280"
  }
];

export default function TypewriterTitle() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [charIndex, setCharIndex] = useState(0);

  useEffect(() => {
    const currentTitle = titles[currentIndex].text;
    
    const typingSpeed = isDeleting ? 30 : 80;
    const pauseBeforeDelete = 3000;
    const pauseBeforeType = 500;

    if (!isDeleting && charIndex < currentTitle.length) {
      const timeout = setTimeout(() => {
        setDisplayText(currentTitle.slice(0, charIndex + 1));
        setCharIndex(charIndex + 1);
      }, typingSpeed);
      return () => clearTimeout(timeout);
    } else if (!isDeleting && charIndex === currentTitle.length) {
      const timeout = setTimeout(() => {
        setIsDeleting(true);
      }, pauseBeforeDelete);
      return () => clearTimeout(timeout);
    } else if (isDeleting && charIndex > 0) {
      const timeout = setTimeout(() => {
        setDisplayText(currentTitle.slice(0, charIndex - 1));
        setCharIndex(charIndex - 1);
      }, typingSpeed);
      return () => clearTimeout(timeout);
    } else if (isDeleting && charIndex === 0) {
      const timeout = setTimeout(() => {
        setIsDeleting(false);
        setCurrentIndex((currentIndex + 1) % titles.length);
      }, pauseBeforeType);
      return () => clearTimeout(timeout);
    }
  }, [charIndex, isDeleting, currentIndex]);

  return (
    <div className="min-h-[180px] md:min-h-[160px] flex flex-col items-center justify-center">
      <h1 className="text-4xl md:text-6xl font-bold text-gray-900 tracking-tight leading-tight text-center px-4">
        <span 
          style={{ color: titles[currentIndex].color }}
          className="inline-block transition-colors duration-500"
        >
          {displayText}
          <span className="animate-pulse">|</span>
        </span>
      </h1>
      <p className="text-sm md:text-base text-gray-400 mt-4 font-medium tracking-wide">
        FOR {titles[currentIndex].audience.toUpperCase()}
      </p>
    </div>
  );
}
