import React, { useRef, useEffect, useState } from 'react';

export default function VideoDemo() {
  const videoRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            video.play().catch(err => console.log('Video autoplay prevented:', err));
          } else {
            video.pause();
          }
        });
      },
      {
        threshold: 0.5, // Play when 50% visible
      }
    );

    observer.observe(video);

    return () => {
      if (video) {
        observer.unobserve(video);
      }
    };
  }, []);

  return (
    <section className="py-8 md:py-12 lg:py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-6 md:mb-8 lg:mb-12">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 md:mb-4 px-2">
            See How It Works
          </h2>
          <p className="text-base md:text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto px-4">
            Watch how Estimate helps you discover your professional reputation through anonymous peer reviews
          </p>
        </div>

        <div className="relative rounded-xl md:rounded-2xl overflow-hidden shadow-xl md:shadow-2xl border border-gray-200">
          <video
            ref={videoRef}
            className="w-full h-auto"
            loop
            muted
            playsInline
            preload="metadata"
            poster="/videos/estimate-demo-poster.jpg"
          >
            <source src="/videos/new_estimate_video_1.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      </div>
    </section>
  );
}
