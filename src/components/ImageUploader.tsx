"use client";

import React, { useCallback, useState } from "react";
import { useDropzone, type FileRejection } from "react-dropzone";
import { Upload, Image as ImageIcon, AlertCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export const MAX_IMAGES = 50;
export const MAX_FILE_SIZE_MB = 20;
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

interface ImageUploaderProps {
  onUpload: (files: File[]) => void;
  currentImageCount: number;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onUpload, currentImageCount }) => {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const remainingSlots = MAX_IMAGES - currentImageCount;

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
      setError(null);
      setSuccess(null);

      if (rejectedFiles && rejectedFiles.length > 0) {
        const tooBigFiles = rejectedFiles.filter((f) => f.file.size > MAX_FILE_SIZE_BYTES);
        if (tooBigFiles.length > 0) {
          setError(`${tooBigFiles.length} file(s) exceed the ${MAX_FILE_SIZE_MB}MB size limit.`);
          return;
        }
      }

      if (acceptedFiles.length === 0) {
        return;
      }

      const totalAfterUpload = currentImageCount + acceptedFiles.length;
      if (totalAfterUpload > MAX_IMAGES) {
        if (remainingSlots <= 0) {
          setError(`Maximum limit of ${MAX_IMAGES} images reached. Please delete some images first.`);
        } else {
          const canUpload = acceptedFiles.slice(0, remainingSlots);
          setError(`Only ${remainingSlots} more image(s) can be uploaded. Processing ${canUpload.length} image(s).`);
          onUpload(canUpload);
          setSuccess(`${canUpload.length} image(s) uploaded successfully!`);
        }
        return;
      }

      const validFiles = acceptedFiles.filter((file) => file.size <= MAX_FILE_SIZE_BYTES);
      if (validFiles.length !== acceptedFiles.length) {
        setError(`Some files exceed the ${MAX_FILE_SIZE_MB}MB limit. Only ${validFiles.length} valid file(s) uploaded.`);
      }

      if (validFiles.length > 0) {
        onUpload(validFiles);
        setSuccess(`${validFiles.length} image(s) uploaded successfully!`);
        setTimeout(() => setSuccess(null), 3000);
      }
    },
    [onUpload, currentImageCount, remainingSlots]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".webp"],
    },
    multiple: true,
    maxSize: MAX_FILE_SIZE_BYTES,
  });

  const usedPercent = Math.min((currentImageCount / MAX_IMAGES) * 100, 100);
  const isNearLimit = usedPercent >= 80;
  const isFull = remainingSlots <= 0;

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={cn(
          "group relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed bg-white p-12 transition-all",
          !isFull && "hover:border-blue-500 hover:bg-blue-50/50 dark:hover:border-blue-400 dark:hover:bg-blue-900/10",
          isDragActive && !isFull && "border-blue-500 bg-blue-50/50 dark:border-blue-400 dark:bg-blue-900/10",
          isFull ? "border-red-300 opacity-60 cursor-not-allowed dark:border-red-900" : 
            isNearLimit ? "border-amber-300 dark:border-amber-800" : 
              "border-zinc-200 dark:border-zinc-800",
          "dark:bg-zinc-900/50"
        )}
      >
        <input {...getInputProps()} disabled={isFull} />
        <div className={cn(
          "flex h-16 w-16 items-center justify-center rounded-full transition-transform",
          !isFull && "group-hover:scale-110",
          isFull ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400" :
            isNearLimit ? "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400" :
              "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
        )}>
          <Upload className="h-8 w-8" />
        </div>
        <h3 className={cn(
          "mt-4 text-xl font-semibold",
          isFull ? "text-red-600 dark:text-red-400" : 
            isNearLimit ? "text-amber-600 dark:text-amber-400" :
              "text-zinc-900 dark:text-zinc-100"
        )}>
          {isFull ? "Upload limit reached" : "Upload your photos"}
        </h3>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          {isFull 
            ? `Maximum ${MAX_IMAGES} images allowed. Delete some images to continue.`
            : "Drag and drop your images here, or click to select files"}
        </p>
        <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">
          Supports JPG, PNG, WEBP | Max {MAX_FILE_SIZE_MB}MB per image | {remainingSlots} slot(s) remaining
        </p>
        
        <div className="mt-8 flex gap-4 overflow-hidden opacity-30">
           <ImageIcon className="h-10 w-10 text-zinc-400" />
           <ImageIcon className="h-10 w-10 text-zinc-400" />
           <ImageIcon className="h-10 w-10 text-zinc-400" />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-zinc-500 dark:text-zinc-400">
            Storage usage ({currentImageCount}/{MAX_IMAGES})
          </span>
          <span className={cn(
            "font-semibold",
            isFull ? "text-red-500" : isNearLimit ? "text-amber-500" : "text-blue-500"
          )}>
            {Math.round(usedPercent)}%
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
          <div 
            className={cn(
              "h-full rounded-full transition-all duration-500",
              isFull ? "bg-red-500" : isNearLimit ? "bg-amber-500" : "bg-blue-500"
            )}
            style={{ width: `${usedPercent}%` }}
          />
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-900/20">
          <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-500 mt-0.5" />
          <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
        </div>
      )}

      {success && !error && (
        <div className="flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-4 dark:border-green-900/50 dark:bg-green-900/20">
          <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-green-500 mt-0.5" />
          <p className="text-sm text-green-700 dark:text-green-300">{success}</p>
        </div>
      )}
    </div>
  );
};
