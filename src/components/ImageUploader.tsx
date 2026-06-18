"use client";

import React, { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageUploaderProps {
  onUpload: (files: File[]) => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onUpload }) => {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      onUpload(acceptedFiles);
    },
    [onUpload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".webp"],
    },
    multiple: true,
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        "group relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-zinc-200 bg-white p-12 transition-all hover:border-blue-500 hover:bg-blue-50/50 dark:border-zinc-800 dark:bg-zinc-900/50 dark:hover:border-blue-400 dark:hover:bg-blue-900/10",
        isDragActive && "border-blue-500 bg-blue-50/50 dark:border-blue-400 dark:bg-blue-900/10"
      )}
    >
      <input {...getInputProps()} />
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-blue-600 transition-transform group-hover:scale-110 dark:bg-blue-900/30 dark:text-blue-400">
        <Upload className="h-8 w-8" />
      </div>
      <h3 className="mt-4 text-xl font-semibold text-zinc-900 dark:text-zinc-100">
        Upload your photos
      </h3>
      <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
        Drag and drop your images here, or click to select files
      </p>
      <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">
        Supports JPG, PNG, WEBP (Multiple images allowed)
      </p>
      
      <div className="mt-8 flex gap-4 overflow-hidden opacity-30">
         <ImageIcon className="h-10 w-10 text-zinc-400" />
         <ImageIcon className="h-10 w-10 text-zinc-400" />
         <ImageIcon className="h-10 w-10 text-zinc-400" />
      </div>
    </div>
  );
};
