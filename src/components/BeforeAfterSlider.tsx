"use client";

import React, { useState, useRef, useEffect } from "react";

interface BeforeAfterSliderProps {
  beforeUrl: string;
  afterUrl: string;
}

export const BeforeAfterSlider: React.FC<BeforeAfterSliderProps> = ({
  beforeUrl,
  afterUrl,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);

  const handleMouseDown = () => setIsDragging(true);
  const handleMouseUp = () => setIsDragging(false);
  const handleMouseLeave = () => setIsDragging(false);

  const handleMove = (clientX: number) => {
    if (!isDragging && !containerRef.current) return;

    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    let newPosition = ((clientX - rect.left) / rect.width) * 100;
    newPosition = Math.max(0, Math.min(100, newPosition));
    setSliderPosition(newPosition);
  };

  const handleMouseMove = (e: React.MouseEvent) => handleMove(e.clientX);
  const handleTouchMove = (e: React.TouchEvent) => handleMove(e.touches[0].clientX);

  return (
    <div
      ref={containerRef}
      className="relative h-full w-full select-none overflow-hidden"
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onMouseMove={isDragging ? handleMouseMove : undefined}
      onTouchEnd={handleMouseUp}
      onTouchMove={isDragging ? handleTouchMove : undefined}
    >
      {/* After Image (Bottom Layer - Enhanced) */}
      <div className="absolute inset-0">
        <img
          src={afterUrl}
          alt="After - Enhanced"
          className="h-full w-full object-cover"
        />
        <div className="absolute bottom-4 right-4 rounded-full bg-white/90 px-4 py-1.5 text-[11px] font-extrabold text-blue-600 shadow-md">
          AFTER
        </div>
      </div>

      {/* Before Image (Top Layer - Original) */}
      <div
        className="absolute inset-0 overflow-hidden border-r-4 border-white shadow-2xl"
        style={{ width: `${sliderPosition}%` }}
      >
        <img
          src={beforeUrl}
          alt="Before - Original"
          className="h-full w-full object-cover"
          style={{ width: `${100 / (sliderPosition / 100)}%`, maxWidth: "none" }}
        />
        <div className="absolute bottom-4 left-4 rounded-full bg-zinc-900/90 px-4 py-1.5 text-[11px] font-extrabold text-white shadow-md">
          BEFORE
        </div>
      </div>

      {/* Slider Line & Handle - Draggable */}
      <div
        className="absolute top-0 bottom-0 flex items-center cursor-ew-resize"
        style={{ left: `${sliderPosition}%` }}
      >
        {/* Vertical Line */}
        <div className="absolute h-full w-1 bg-white shadow-[0_0_15px_rgba(0,0,0,0.5)]" />
        
        {/* Central Circle Handle - Draggable */}
        <div 
          className="relative z-10 flex h-14 w-14 -ml-7 items-center justify-center rounded-full bg-white shadow-2xl"
          onMouseDown={handleMouseDown}
          onTouchStart={handleMouseDown}
        >
          <div className="flex items-center justify-center">
            <svg className="h-6 w-6 text-zinc-800 -ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 18l-6-6 6-6" />
            </svg>
            <svg className="h-6 w-6 text-zinc-800 -mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 18l6-6-6-6" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};
