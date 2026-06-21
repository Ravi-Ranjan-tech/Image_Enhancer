"use client";

import React from "react";
import { X, Maximize2, Minimize2 } from "lucide-react";
import { BeforeAfterSlider } from "./BeforeAfterSlider";

interface FullscreenModalProps {
  isOpen: boolean;
  onClose: () => void;
  beforeUrl: string;
  afterUrl: string;
  isEnhanced: boolean;
  name: string;
}

export const FullscreenModal: React.FC<FullscreenModalProps> = ({
  isOpen,
  onClose,
  beforeUrl,
  afterUrl,
  isEnhanced,
  name,
}) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-6 right-6 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-all"
      >
        <X className="h-6 w-6" />
      </button>

      {/* Image Container */}
      <div className="relative h-[85vh] w-[90vw] max-w-7xl">
        <div className="absolute -top-12 left-0 right-0 flex items-center justify-between text-white">
          <h3 className="text-xl font-semibold">{name}</h3>
        </div>
        {isEnhanced ? (
          <BeforeAfterSlider beforeUrl={beforeUrl} afterUrl={afterUrl} />
        ) : (
          <img 
            src={beforeUrl}
            alt={name}
            className="h-full w-full object-contain rounded-xl"
            style={{ imageRendering: 'auto' }}
          />
        )}
      </div>
    </div>
  );
};
