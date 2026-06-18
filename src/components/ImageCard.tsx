"use client";

import React, { useState } from "react";
import { Edit2, Download, Trash2, Wand2, CheckCircle2, Maximize2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { BeforeAfterSlider } from "./BeforeAfterSlider";
import { FullscreenModal } from "./FullscreenModal";

interface ImageCardProps {
  id: string;
  url: string;
  originalUrl: string;
  name: string;
  isEnhanced: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onEnhance: () => void;
  onDownload: () => void;
}

export const ImageCard: React.FC<ImageCardProps> = ({
  url,
  originalUrl,
  name,
  isEnhanced,
  onEdit,
  onDelete,
  onEnhance,
  onDownload,
}) => {
  const [isFullscreenOpen, setIsFullscreenOpen] = useState(false);

  return (
    <>
      <div className="group relative overflow-hidden rounded-2xl bg-white dark:bg-zinc-900 shadow-sm transition-all hover:shadow-xl">
        {/* Image/Comparison Area */}
        <div className="relative aspect-[4/3] overflow-hidden">
          {isEnhanced ? (
            <BeforeAfterSlider beforeUrl={originalUrl} afterUrl={url} />
          ) : (
            <img
              src={url}
              alt={name}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          )}
          
          {/* Enhanced Badge */}
          {isEnhanced && (
            <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full bg-green-600 px-3 py-1 text-[11px] font-bold text-white shadow-md">
              <CheckCircle2 className="h-3.5 w-3.5" />
              ENHANCED
            </div>
          )}

          {/* Fullscreen Button */}
          <button
            onClick={() => setIsFullscreenOpen(true)}
            className="absolute top-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm hover:bg-black/70 transition-all"
          >
            <Maximize2 className="h-4.5 w-4.5" />
          </button>
        </div>

        {/* Card Footer with Controls */}
        <div className="flex flex-col gap-3 p-3">
          {/* Image Name & Delete */}
          <div className="flex items-center justify-between">
            <p className="max-w-[70%] truncate text-sm font-semibold text-zinc-800 dark:text-zinc-200">
              {name}
            </p>
            <button
              onClick={onDelete}
              className="p-1.5 text-zinc-400 transition-colors hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full"
              title="Delete"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>

          {/* Control Buttons */}
          <div className="grid grid-cols-3 gap-2">
            {/* Auto Enhance Button */}
            {!isEnhanced && (
              <button
                onClick={onEnhance}
                className="flex items-center justify-center gap-1.5 rounded-xl bg-blue-600 px-3 py-2.5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-blue-500 hover:shadow-md active:scale-95"
              >
                <Wand2 className="h-3.5 w-3.5" />
                Enhance
              </button>
            )}

            {/* Manual Edit Button */}
            <button
              onClick={onEdit}
              className={cn(
                "flex items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-xs font-semibold shadow-sm transition-all hover:shadow-md active:scale-95",
                isEnhanced 
                  ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-500 hover:to-indigo-500" 
                  : "bg-zinc-200 text-zinc-800 hover:bg-zinc-300 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
              )}
            >
              <Edit2 className="h-3.5 w-3.5" />
              Edit
            </button>

            {/* Download Button */}
            <button
              onClick={onDownload}
              className="flex items-center justify-center gap-1.5 rounded-xl bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-700 dark:hover:bg-zinc-600 px-3 py-2.5 text-xs font-semibold shadow-sm transition-all hover:shadow-md active:scale-95"
            >
              <Download className="h-3.5 w-3.5" />
              Save
            </button>
          </div>
        </div>
      </div>

      {/* Fullscreen Modal */}
      <FullscreenModal
        isOpen={isFullscreenOpen}
        onClose={() => setIsFullscreenOpen(false)}
        beforeUrl={originalUrl}
        afterUrl={url}
        isEnhanced={isEnhanced}
        name={name}
      />
    </>
  );
};
