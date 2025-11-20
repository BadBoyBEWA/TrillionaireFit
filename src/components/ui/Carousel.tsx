'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface CarouselItem {
  src: string;
  title?: string;
  description?: string;
}

interface CarouselProps {
  items: CarouselItem[];
  autoPlay?: boolean;
  interval?: number;
  showDots?: boolean;
  showArrows?: boolean;
}

export function Carousel({ 
  items, 
  autoPlay = true, 
  interval = 5000, 
  showDots = true, 
  showArrows = true 
}: CarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!autoPlay || items.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === items.length - 1 ? 0 : prevIndex + 1
      );
    }, interval);

    return () => clearInterval(timer);
  }, [autoPlay, interval, items.length]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const goToPrevious = () => {
    setCurrentIndex(currentIndex === 0 ? items.length - 1 : currentIndex - 1);
  };

  const goToNext = () => {
    setCurrentIndex(currentIndex === items.length - 1 ? 0 : currentIndex + 1);
  };

  if (items.length === 0) return null;

  return (
    <div className="relative w-full overflow-hidden rounded-2xl bg-zinc-100 border-2 border-gray-600">
      {/* Main Image */}
      <div className="relative aspect-[4/5] w-full">
        <Image
          src={items[currentIndex].src}
          fill
          className="object-cover transition-opacity duration-500"
          priority={currentIndex === 0}
        />
        
        {/* Overlay Content */}
        {(items[currentIndex].title || items[currentIndex].description) && (
          <div className="absolute inset-0 bg-black/20 flex items-end">
            <div className="p-6 text-white">
              {items[currentIndex].title && (
                <h3 className="text-2xl font-bold mb-2">{items[currentIndex].title}</h3>
              )}
              {items[currentIndex].description && (
                <p className="text-lg opacity-90">{items[currentIndex].description}</p>
              )}
            </div>
          </div>
        )}

        {/* Navigation Arrows */}
        {showArrows && items.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-zinc-800 rounded-full p-2 transition-all duration-200 shadow-lg"
              aria-label="Previous image"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={goToNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-zinc-800 rounded-full p-2 transition-all duration-200 shadow-lg"
              aria-label="Next image"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}
      </div>

      {/* Dots Indicator */}
      {showDots && items.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
          {items.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 rounded-full transition-all duration-200 ${
                index === currentIndex 
                  ? 'bg-white scale-125' 
                  : 'bg-white/50 hover:bg-white/75'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
