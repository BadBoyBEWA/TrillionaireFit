'use client';

import React from 'react';

interface MarqueeProps {
  children: React.ReactNode;
  speed?: number; // Animation speed in seconds
  direction?: 'left' | 'right';
  pauseOnHover?: boolean;
  className?: string;
}

export default function Marquee({ 
  children, 
  speed = 10, 
  direction = 'left',
  pauseOnHover = true,
  className = ''
}: MarqueeProps) {
  return (
    <div className={`overflow-hidden whitespace-nowrap ${className}`}>
      <div 
        className={`inline-block animate-marquee ${pauseOnHover ? 'hover:pause' : ''}`}
        style={{
          animationDuration: `${speed}s`,
          animationDirection: direction === 'right' ? 'reverse' : 'normal'
        }}
      >
        <div className="inline-block">
          {children}
        </div>
        <div className="inline-block ml-8">
          {children}
        </div>
      </div>
    </div>
  );
}

// Example usage components
export function MarqueeText({ text, className = '' }: { text: string; className?: string }) {
  return (
    <Marquee speed={50} className={className}>
      <span className="italic">{text}</span>
    </Marquee>
  );
}

export function MarqueeLogos({ logos, className = '' }: { logos: string[]; className?: string }) {
  return (
    <Marquee speed={25} className={className}>
      <div className="flex items-center space-x-8">
        {logos.map((logo, index) => (
          <div key={index} className="flex-shrink-0">
            <img 
              src={logo} 
              alt={`Logo ${index + 1}`}
              className="h-12 w-auto opacity-60 hover:opacity-100 transition-opacity"
            />
          </div>
        ))}
      </div>
    </Marquee>
  );
}

export function MarqueeAnnouncement({ 
  announcements, 
  className = '' 
}: { 
  announcements: string[]; 
  className?: string 
}) {
  return (
    <Marquee speed={30} className={className}>
      <div className="flex items-center space-x-12">
        {announcements.map((announcement, index) => (
          <div key={index} className="flex-shrink-0">
            <span className="text-sm text-gray-600 bg-gray-100 px-4 py-2 rounded-full">
              {announcement}
            </span>
          </div>
        ))}
      </div>
    </Marquee>
  );
}
