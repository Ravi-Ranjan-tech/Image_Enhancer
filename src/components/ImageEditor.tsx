"use client";

import React, { useState, useEffect, useRef } from "react";
import { X, Check, RotateCcw, Sliders, Wand2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface EditingFilters {
  brightness: number;
  contrast: number;
  saturation: number;
  sharpness: number;
  blur: number;
}

interface ImageEditorProps {
  imageUrl: string;
  onSave: (newImageUrl: string) => void;
  onClose: () => void;
}

export const ImageEditor: React.FC<ImageEditorProps> = ({ imageUrl, onSave, onClose }) => {
  const [filters, setFilters] = useState<EditingFilters>({
    brightness: 100,
    contrast: 100,
    saturation: 100,
    sharpness: 0,
    blur: 0,
  });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageUrl;
    img.onload = () => {
      imageRef.current = img;
      applyFilters();
    };
  }, [imageUrl]);

  const applyFilters = () => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = img.width;
    canvas.height = img.height;
    
    // High-quality canvas settings
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    ctx.filter = `
      brightness(${filters.brightness}%)
      contrast(${filters.contrast}%)
      saturate(${filters.saturation}%)
      blur(${filters.blur}px)
    `;

    ctx.drawImage(img, 0, 0);
  };

  useEffect(() => {
    applyFilters();
  }, [filters]);

  const handleReset = () => {
    setFilters({
      brightness: 100,
      contrast: 100,
      saturation: 100,
      sharpness: 0,
      blur: 0,
    });
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      onSave(canvas.toDataURL("image/jpeg", 1.0)); // Maximum quality!
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col bg-black/90 backdrop-blur-sm lg:flex-row"
    >
      {/* Header (Mobile) */}
      <div className="flex items-center justify-between border-b border-zinc-800 p-4 lg:hidden">
        <button onClick={onClose} className="text-white">
          <X className="h-6 w-6" />
        </button>
        <h2 className="text-lg font-semibold text-white">Edit Image</h2>
        <button onClick={handleSave} className="text-blue-500">
          <Check className="h-6 w-6" />
        </button>
      </div>

      {/* Main Canvas Area */}
      <div className="relative flex flex-1 items-center justify-center overflow-hidden p-4 lg:p-12">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="relative h-full w-full overflow-auto"
        >
          <canvas
            ref={canvasRef}
            className="mx-auto max-h-full max-w-full rounded-xl shadow-2xl transition-all duration-300"
            style={{ imageRendering: 'auto' }}
          />
        </motion.div>
      </div>

      {/* Sidebar Controls */}
      <motion.div 
        initial={{ x: 20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex h-auto w-full flex-col bg-zinc-950 p-6 lg:h-full lg:w-96 lg:border-l lg:border-zinc-800"
      >
        <div className="hidden items-center justify-between lg:mb-8 lg:flex">
          <h2 className="text-xl font-bold text-white">Manual Edit</h2>
          <div className="flex gap-2">
            <button
              onClick={handleReset}
              className="rounded-full p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white"
              title="Reset"
            >
              <RotateCcw className="h-5 w-5" />
            </button>
            <button
              onClick={onClose}
              className="rounded-full p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="space-y-6 overflow-y-auto">
          <FilterSlider
            label="Brightness"
            value={filters.brightness}
            min={0}
            max={200}
            onChange={(v) => setFilters({ ...filters, brightness: v })}
          />
          <FilterSlider
            label="Contrast"
            value={filters.contrast}
            min={0}
            max={200}
            onChange={(v) => setFilters({ ...filters, contrast: v })}
          />
          <FilterSlider
            label="Saturation"
            value={filters.saturation}
            min={0}
            max={200}
            onChange={(v) => setFilters({ ...filters, saturation: v })}
          />
          <FilterSlider
            label="Blur"
            value={filters.blur}
            min={0}
            max={10}
            onChange={(v) => setFilters({ ...filters, blur: v })}
          />
        </div>

        <div className="mt-auto hidden gap-4 lg:flex lg:pt-8">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl bg-zinc-800 py-3 font-semibold text-white transition-colors hover:bg-zinc-700"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 rounded-xl bg-blue-600 py-3 font-semibold text-white transition-colors hover:bg-blue-500"
          >
            Save Changes
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

interface FilterSliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}

const FilterSlider: React.FC<FilterSliderProps> = ({ label, value, min, max, onChange }) => {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm font-medium">
        <span className="text-zinc-400">{label}</span>
        <span className="text-blue-400">{value}%</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-zinc-800 accent-blue-500"
      />
    </div>
  );
};
