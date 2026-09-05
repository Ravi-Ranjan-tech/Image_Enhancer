"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Download, 
  Trash2, 
  Zap, 
  Sparkles,
  Layers,
  Image as ImageIcon,
  Loader2,
  Moon,
  Sun,
  Clock,
  AlertTriangle,
  RefreshCw
} from "lucide-react";
import { ImageUploader, MAX_IMAGES, MAX_FILE_SIZE_MB, MAX_FILE_SIZE_BYTES } from "@/components/ImageUploader";
import { ImageCard } from "@/components/ImageCard";
import { ImageEditor } from "@/components/ImageEditor";
import { cn } from "@/lib/utils";
import JSZip from "jszip";

const SESSION_DURATION_MINUTES = 30;
const SESSION_DURATION_SECONDS = SESSION_DURATION_MINUTES * 60;

interface ImageData {
  id: string;
  url: string;
  originalUrl: string;
  name: string;
  isEnhanced: boolean;
  isProcessing: boolean;
  blobUrls: string[];
}

export default function Home() {
  const [images, setImages] = useState<ImageData[]>([]);
  const [editingImageId, setEditingImageId] = useState<string | null>(null);
  const [isEnhancingAll, setIsEnhancingAll] = useState(false);
  const [isDownloadingAll, setIsDownloadingAll] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number>(SESSION_DURATION_SECONDS);
  const [sessionWarning, setSessionWarning] = useState<boolean>(false);
  const [sessionExpired, setSessionExpired] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Check system preference
  useEffect(() => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsDarkMode(prefersDark);
    if (prefersDark) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  useEffect(() => {
    if (sessionExpired) return;
    
    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          setSessionExpired(true);
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        
        if (prev === 300) {
          setSessionWarning(true);
        }
        
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [sessionExpired]);

  const resetSession = () => {
    setSessionExpired(false);
    setSessionWarning(false);
    setTimeRemaining(SESSION_DURATION_SECONDS);
    clearAllImages();
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const revokeBlobUrls = (blobUrls: string[]) => {
    blobUrls.forEach((url) => {
      try {
        if (url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      } catch (e) {
        console.error('Error revoking URL:', e);
      }
    });
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    if (!isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const validateAndUploadFiles = (files: File[]): File[] => {
    setUploadError(null);
    
    const validFiles: File[] = [];
    const tooLarge: File[] = [];
    
    files.forEach((file) => {
      if (file.size > MAX_FILE_SIZE_BYTES) {
        tooLarge.push(file);
      } else {
        validFiles.push(file);
      }
    });

    if (tooLarge.length > 0) {
      setUploadError(`${tooLarge.length} file(s) skipped - exceeding ${MAX_FILE_SIZE_MB}MB size limit.`);
    }

    const remainingSlots = MAX_IMAGES - images.length;
    if (validFiles.length > remainingSlots) {
      const truncated = validFiles.slice(0, remainingSlots);
      if (remainingSlots === 0) {
        setUploadError(`Maximum ${MAX_IMAGES} images allowed. No new images added.`);
        return [];
      }
      setUploadError(`Only ${remainingSlots} slot(s) available. Only ${truncated.length} of ${validFiles.length} image(s) will be added.`);
      return truncated;
    }

    return validFiles;
  };

  const handleUpload = (files: File[]) => {
    if (sessionExpired) {
      setUploadError('Session expired. Please reset to continue.');
      return;
    }

    const validFiles = validateAndUploadFiles(files);
    if (validFiles.length === 0) return;

    const newImages: ImageData[] = validFiles.map((file) => {
      const url = URL.createObjectURL(file);
      return {
        id: Math.random().toString(36).substring(7),
        url,
        originalUrl: url,
        name: file.name,
        isEnhanced: false,
        isProcessing: false,
        blobUrls: [url],
      };
    });
    setImages((prev) => [...prev, ...newImages]);
  };

  const deleteImage = (id: string) => {
    setImages((prev) => {
      const img = prev.find((i) => i.id === id);
      if (img) {
        revokeBlobUrls(img.blobUrls);
      }
      return prev.filter((img) => img.id !== id);
    });
  };

  const clearAllImages = () => {
    setImages((prev) => {
      prev.forEach((img) => revokeBlobUrls(img.blobUrls));
      return [];
    });
  };

  const enhanceImage = async (id: string) => {
    if (sessionExpired) return;
    
    setImages((prev) =>
      prev.map((img) => (img.id === id ? { ...img, isProcessing: true } : img))
    );

    const image = images.find((img) => img.id === id);
    if (!image) return;

    try {
      await new Promise((resolve) => setTimeout(resolve, 3000));

      const enhancedUrl = await performAutoEnhance(image.url);

      setImages((prev) =>
        prev.map((img) =>
          img.id === id
            ? { 
                ...img, 
                url: enhancedUrl, 
                isEnhanced: true, 
                isProcessing: false,
                blobUrls: [...img.blobUrls, enhancedUrl].filter(u => u.startsWith('blob:'))
              }
            : img
        )
      );
    } catch (error) {
      console.error("Enhancement failed:", error);
      setImages((prev) =>
        prev.map((img) =>
          img.id === id ? { ...img, isProcessing: false } : img
        )
      );
    }
  };

  // Noticeable but still natural sharpening
  const applyEffectiveSharpen = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    const output = new Uint8ClampedArray(data);
    
    // Noticeable but gentle 3x3 kernel
    const kernel = [
      0, -0.2, 0,
      -0.2, 1.8, -0.2,
      0, -0.2, 0
    ];
    
    const kWidth = 3;
    const kHalf = Math.floor(kWidth / 2);
    
    for (let y = kHalf; y < height - kHalf; y++) {
      for (let x = kHalf; x < width - kHalf; x++) {
        let r = 0, g = 0, b = 0;
        
        for (let ky = 0; ky < kWidth; ky++) {
          for (let kx = 0; kx < kWidth; kx++) {
            const px = x + kx - kHalf;
            const py = y + ky - kHalf;
            const idx = (py * width + px) * 4;
            const weight = kernel[ky * kWidth + kx];
            
            r += data[idx] * weight;
            g += data[idx + 1] * weight;
            b += data[idx + 2] * weight;
          }
        }
        
        const outputIdx = (y * width + x) * 4;
        output[outputIdx] = Math.max(0, Math.min(255, r));
        output[outputIdx + 1] = Math.max(0, Math.min(255, g));
        output[outputIdx + 2] = Math.max(0, Math.min(255, b));
      }
    }
    
    ctx.putImageData(new ImageData(output, width, height), 0, 0);
  };

  const performAutoEnhance = (url: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      
      const timeoutId = setTimeout(() => {
        reject(new Error("Image load timeout"));
      }, 20000);
      
      img.onload = () => {
        clearTimeout(timeoutId);
        try {
          // Step 1: 2x upscaling
          const scaleFactor = 2;
          const originalWidth = img.width;
          const originalHeight = img.height;
          const upscaledWidth = originalWidth * scaleFactor;
          const upscaledHeight = originalHeight * scaleFactor;
          
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          if (!ctx) return resolve(url);
          
          canvas.width = upscaledWidth;
          canvas.height = upscaledHeight;
          
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = "high";

          // Step 2: Draw upscaled
          ctx.drawImage(img, 0, 0, upscaledWidth, upscaledHeight);
          
          // Step 3: Noticeable but natural filters
          ctx.filter = "contrast(1.12) brightness(1.05) saturate(1.1)";
          ctx.drawImage(canvas, 0, 0, upscaledWidth, upscaledHeight);
          
          // Step 4: Effective sharpening
          ctx.filter = "none";
          applyEffectiveSharpen(ctx, upscaledWidth, upscaledHeight);
          
          // Save at max quality
          resolve(canvas.toDataURL("image/jpeg", 1.0));
        } catch (error) {
          console.error("Canvas error:", error);
          resolve(url);
        }
      };
      
      img.onerror = () => {
        clearTimeout(timeoutId);
        console.error("Image failed to load");
        resolve(url);
      };
      
      img.src = url;
    });
  };

  const enhanceAll = async () => {
    if (images.length === 0 || sessionExpired) return;
    setIsEnhancingAll(true);
    
    for (const img of images) {
      if (!img.isEnhanced) {
        await enhanceImage(img.id);
      }
    }
    
    setIsEnhancingAll(false);
  };

  // Helper function to convert URL (blob or data URL) to blob - more robust!
  const urlToBlob = (url: string): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      // If it's a data URL, parse it directly
      if (url.startsWith('data:')) {
        try {
          const arr = url.split(',');
          const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
          const bstr = atob(arr[1]);
          let n = bstr.length;
          const u8arr = new Uint8Array(n);
          while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
          }
          resolve(new Blob([u8arr], { type: mime }));
        } catch (e) {
          reject(e);
        }
      } else {
        // If it's a blob URL, fetch it
        fetch(url)
          .then(response => response.blob())
          .then(resolve)
          .catch(reject);
      }
    });
  };

  const downloadSingleImage = async (img: ImageData) => {
    try {
      const blob = await urlToBlob(img.url);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `enhanced_${img.name}`;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      // Revoke the URL after a longer timeout
      setTimeout(() => URL.revokeObjectURL(url), 5000);
    } catch (error) {
      console.error('Single download failed:', error);
      alert('Failed to download image. Check console for details.');
    }
  };

  // Helper to let the browser breathe
  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const downloadAll = async () => {
    console.log('downloadAll called!');
    console.log('Number of images:', images.length);
    if (images.length === 0) {
      console.log('No images to download');
      return;
    }

    setIsDownloadingAll(true);
    setDownloadProgress(0);

    try {
      console.log('Initializing JSZip...');
      const zip = new JSZip();

      // Process each image with small delays
      console.log('Starting to add images to zip...');
      for (let i = 0; i < images.length; i++) {
        const img = images[i];
        console.log(`Processing image ${i + 1}/${images.length}: ${img.name}`);
        
        // Update progress
        setDownloadProgress(Math.floor((i / images.length) * 50));
        
        try {
          const blob = await urlToBlob(img.url);
          zip.file(`enhanced_${img.name}`, blob);
          console.log(`Successfully added ${img.name} to zip`);
        } catch (err) {
          console.error(`Failed to add ${img.name} to zip:`, err);
        }

        // Let the browser render every 5 images
        if (i % 5 === 4) {
          await sleep(10);
        }
      }

      console.log('Generating zip...');
      const content = await zip.generateAsync({ type: "blob" }, (metadata) => {
        const progress = 50 + Math.floor(metadata.percent / 2);
        setDownloadProgress(progress);
        console.log(`Zip generation progress: ${metadata.percent.toFixed(0)}%`);
      });

      setDownloadProgress(100);
      console.log('Zip generated, size:', content.size, 'bytes');

      const url = URL.createObjectURL(content);
      const link = document.createElement("a");
      link.href = url;
      link.download = "enhanced_photos.zip";
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Keep URL valid for 10 seconds
      setTimeout(() => {
        console.log('Revoking URL...');
        URL.revokeObjectURL(url);
      }, 10000);
      
      console.log('Download initiated!');
    } catch (error) {
      console.error('Zip download failed completely:', error);
      alert('Failed to create zip! Error: ' + (error as Error).message);
    } finally {
      // Reset states after a brief delay
      await sleep(1000);
      setIsDownloadingAll(false);
      setDownloadProgress(0);
    }
  };

  const saveManualEdit = (id: string, newUrl: string) => {
    setImages((prev) =>
      prev.map((img) =>
        img.id === id ? { 
          ...img, 
          url: newUrl, 
          isEnhanced: true,
          blobUrls: [...img.blobUrls, newUrl].filter(u => u.startsWith('blob:'))
        } : img
      )
    );
    setEditingImageId(null);
  };

  const editingImage = images.find((img) => img.id === editingImageId);

  return (
    <main className={cn(
      "min-h-screen transition-colors duration-300",
      isDarkMode ? "bg-zinc-950 text-white" : "bg-zinc-50 text-zinc-900"
    )}>
      {/* Session Expired Overlay */}
      <AnimatePresence>
        {sessionExpired && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="max-w-md w-full rounded-3xl bg-white dark:bg-zinc-900 p-8 shadow-2xl text-center"
            >
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 mb-6">
                <AlertTriangle className="h-10 w-10" />
              </div>
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">
                Session Time Expired
              </h2>
              <p className="text-zinc-500 dark:text-zinc-400 mb-8">
                Your {SESSION_DURATION_MINUTES}-minute session has ended. Reset the timer to continue using the app and ensure system stability.
              </p>
              <button
                onClick={resetSession}
                className="flex items-center justify-center gap-2 w-full rounded-2xl bg-blue-600 px-6 py-4 text-base font-semibold text-white shadow-lg shadow-blue-500/30 transition-all hover:bg-blue-500 hover:scale-[1.02]"
              >
                <RefreshCw className="h-5 w-5" />
                Reset Session & Start Fresh
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Session Warning Banner */}
      <AnimatePresence>
        {sessionWarning && !sessionExpired && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            className="fixed top-0 left-0 right-0 z-50 bg-amber-500 text-white px-4 py-3 shadow-lg"
          >
            <div className="mx-auto max-w-7xl flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 flex-shrink-0" />
                <p className="text-sm font-medium">
                  Warning: Less than 5 minutes remaining! Please save your work or reset the session.
                </p>
              </div>
              <button
                onClick={resetSession}
                className="flex items-center gap-2 flex-shrink-0 rounded-full bg-white/20 px-4 py-2 text-xs font-semibold hover:bg-white/30 transition-all"
              >
                <RefreshCw className="h-4 w-4" />
                Reset Timer
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className={cn(
        "sticky top-0 z-40 border-b backdrop-blur-md transition-colors duration-300",
        sessionWarning && !sessionExpired && "pt-12",
        isDarkMode 
          ? "border-zinc-800 bg-zinc-950/80" 
          : "border-zinc-200 bg-white/80"
      )}>
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8 gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-500/30">
              <Sparkles className="h-6 w-6" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">
              AI Enhancer <span className="text-blue-600">Pro</span>
            </h1>
          </div>
          
          <div className="flex items-center gap-3 flex-wrap">
            {/* Session Timer */}
            <div className={cn(
              "flex items-center gap-2 rounded-full px-4 py-2 border transition-all",
              sessionExpired 
                ? "bg-red-100 border-red-300 text-red-700 dark:bg-red-900/30 dark:border-red-800 dark:text-red-300"
                : timeRemaining <= 300 
                  ? "bg-amber-100 border-amber-300 text-amber-700 dark:bg-amber-900/30 dark:border-amber-800 dark:text-amber-300 animate-pulse"
                  : isDarkMode
                    ? "bg-zinc-800 border-zinc-700 text-zinc-200"
                    : "bg-zinc-50 border-zinc-200 text-zinc-700"
            )}>
              <Clock className={cn(
                "h-4 w-4",
                timeRemaining <= 300 && !sessionExpired ? "animate-pulse" : ""
              )} />
              <span className="text-sm font-mono font-bold tabular-nums">
                {formatTime(timeRemaining)}
              </span>
            </div>

            {/* Image Counter */}
            <div className={cn(
              "flex items-center gap-2 rounded-full px-4 py-2 border text-sm font-semibold",
              images.length >= MAX_IMAGES
                ? "bg-red-100 border-red-300 text-red-700 dark:bg-red-900/30 dark:border-red-800 dark:text-red-300"
                : images.length >= MAX_IMAGES * 0.8
                  ? "bg-amber-100 border-amber-300 text-amber-700 dark:bg-amber-900/30 dark:border-amber-800 dark:text-amber-300"
                  : isDarkMode
                    ? "bg-zinc-800 border-zinc-700 text-zinc-200"
                    : "bg-zinc-50 border-zinc-200 text-zinc-700"
            )}>
              <ImageIcon className="h-4 w-4" />
              <span>{images.length}/{MAX_IMAGES}</span>
            </div>

            {/* Theme Toggle */}
            <button
              onClick={toggleDarkMode}
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-full transition-all hover:scale-110",
                isDarkMode ? "bg-zinc-800 text-yellow-400 hover:bg-zinc-700" : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
              )}
              title="Toggle theme"
            >
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            {/* Reset Session */}
            <button
              onClick={resetSession}
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-full transition-all hover:scale-110",
                isDarkMode ? "bg-zinc-800 text-blue-400 hover:bg-zinc-700" : "bg-zinc-100 text-blue-600 hover:bg-zinc-200"
              )}
              title="Reset session timer & clear all"
            >
              <RefreshCw className="h-5 w-5" />
            </button>

            {images.length > 0 && (
              <>
                <button
                  onClick={enhanceAll}
                  disabled={isEnhancingAll || isDownloadingAll || sessionExpired}
                  className="flex items-center gap-2 rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isEnhancingAll ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Zap className="h-4 w-4" />
                  )}
                  Auto Enhance All
                </button>
                
                {/* Download All Section */}
                <div className="flex flex-col items-end gap-1">
                  <button
                    onClick={downloadAll}
                    disabled={isDownloadingAll || isEnhancingAll || sessionExpired}
                    className={cn(
                      "flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold shadow-lg transition-all",
                      isDarkMode 
                        ? "bg-zinc-800 text-white hover:bg-zinc-700" 
                        : "bg-zinc-900 text-white hover:bg-zinc-800",
                      "disabled:opacity-50 disabled:cursor-not-allowed"
                    )}
                  >
                    {isDownloadingAll ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4" />
                    )}
                    {isDownloadingAll ? `Processing ${downloadProgress}%` : "Download All"}
                  </button>
                  
                  {/* Progress Bar */}
                  {isDownloadingAll && (
                    <div className={cn(
                      "w-40 h-2 rounded-full overflow-hidden",
                      isDarkMode ? "bg-zinc-700" : "bg-zinc-200"
                    )}>
                      <div 
                        className="h-full bg-blue-500 transition-all duration-200"
                        style={{ width: `${downloadProgress}%` }}
                      />
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      {images.length === 0 && (
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden py-20 lg:py-32"
        >
          <div className="absolute left-1/2 top-0 -z-10 h-[1000px] w-[1000px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/5 blur-[120px]" />
          <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
            <h2 className={cn(
              "text-4xl font-extrabold tracking-tight sm:text-6xl",
              isDarkMode ? "text-white" : "text-zinc-900"
            )}>
              Bring your photos <br />
              <span className="bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">
                back to life with AI
              </span>
            </h2>
            <p className={cn(
              "mx-auto mt-6 max-w-2xl text-lg",
              isDarkMode ? "text-zinc-400" : "text-zinc-600"
            )}>
              Transform low-quality images into stunning high-definition masterpieces. 
              Upload multiple photos and let our advanced AI handle the rest.
            </p>
            
            <div className="mx-auto mt-16 max-w-3xl">
              <ImageUploader onUpload={handleUpload} currentImageCount={images.length} />
              
              {uploadError && (
                <div className="mt-4 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-900/20">
                  <AlertTriangle className="h-5 w-5 flex-shrink-0 text-red-500 mt-0.5" />
                  <p className="text-sm text-red-700 dark:text-red-300">{uploadError}</p>
                </div>
              )}
            </div>

            <div className="mt-20 grid grid-cols-1 gap-8 sm:grid-cols-3">
              <FeatureItem icon={<Zap className="h-6 w-6" />} title="Instant Upscaling" description="Increase resolution and clarity in seconds." isDark={isDarkMode} />
              <FeatureItem icon={<Layers className="h-6 w-6" />} title="Batch Processing" description="Enhance hundreds of photos in one click." isDark={isDarkMode} />
              <FeatureItem icon={<Sparkles className="h-6 w-6" />} title="AI Restoration" description="Fix blur, noise, and faded colors automatically." isDark={isDarkMode} />
            </div>
          </div>
        </motion.section>
      )}

      {/* Workspace Section */}
      {images.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
            <div>
              <h3 className={cn(
                "text-2xl font-bold",
                isDarkMode ? "text-white" : "text-zinc-900"
              )}>
                Your Workspace
              </h3>
              <p className={cn(
                "text-sm",
                isDarkMode ? "text-zinc-400" : "text-zinc-500"
              )}>
                Manage and enhance your uploaded photos ({images.length}/{MAX_IMAGES})
              </p>
            </div>
            <button 
              onClick={clearAllImages}
              className="flex items-center gap-2 text-sm font-medium text-red-500 hover:text-red-600"
            >
              <Trash2 className="h-4 w-4" />
              Clear All
            </button>
          </div>

          {uploadError && (
            <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-900/20">
              <AlertTriangle className="h-5 w-5 flex-shrink-0 text-red-500 mt-0.5" />
              <div>
                <p className="text-sm text-red-700 dark:text-red-300">{uploadError}</p>
                <button 
                  onClick={() => setUploadError(null)}
                  className="mt-1 text-xs text-red-500 hover:underline"
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}

          <motion.div 
            layout
            className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          >
            <AnimatePresence>
              {images.map((img) => (
                <motion.div
                  key={img.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="relative"
                >
                  {img.isProcessing && (
                    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-2xl bg-black/60 backdrop-blur-sm">
                      <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                      <p className="mt-2 text-sm font-medium text-white">Enhancing...</p>
                    </div>
                  )}
                  <ImageCard
                    id={img.id}
                    url={img.url}
                    originalUrl={img.originalUrl}
                    name={img.name}
                    isEnhanced={img.isEnhanced}
                    onEdit={() => setEditingImageId(img.id)}
                    onDelete={() => deleteImage(img.id)}
                    onEnhance={() => enhanceImage(img.id)}
                    onDownload={() => downloadSingleImage(img)}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
            
            {/* Add More Button */}
            {images.length < MAX_IMAGES && !sessionExpired && (
              <motion.div 
                layout
                className={cn(
                  "flex aspect-[4/3] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed transition-all hover:border-blue-500",
                  isDarkMode 
                    ? "border-zinc-800 bg-zinc-900/50 hover:bg-blue-900/10" 
                    : "border-zinc-200 bg-white hover:bg-blue-50/50"
                )}
                onClick={() => document.getElementById("hidden-upload")?.click()}
              >
                <div className={cn(
                  "flex h-12 w-12 items-center justify-center rounded-full",
                  isDarkMode ? "bg-zinc-800 text-zinc-400" : "bg-zinc-100 text-zinc-400"
                )}>
                  <ImageIcon className="h-6 w-6" />
                </div>
                <p className={cn(
                  "mt-2 text-sm font-medium",
                  isDarkMode ? "text-zinc-400" : "text-zinc-500"
                )}>
                  Add More Photos
                </p>
                <p className="mt-1 text-xs text-zinc-400">
                  {MAX_IMAGES - images.length} slot(s) left
                </p>
                <input 
                  id="hidden-upload"
                  type="file" 
                  multiple 
                  accept="image/*" 
                  className="hidden" 
                  onChange={(e) => {
                    if (e.target.files) {
                      handleUpload(Array.from(e.target.files));
                      e.target.value = '';
                    }
                  }}
                />
              </motion.div>
            )}
          </motion.div>
        </section>
      )}

      {/* Editor Modal */}
      <AnimatePresence>
        {editingImageId && editingImage && (
          <ImageEditor
            key="editor-modal"
            imageUrl={editingImage.originalUrl}
            onSave={(newUrl) => saveManualEdit(editingImage.id, newUrl)}
            onClose={() => setEditingImageId(null)}
          />
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className={cn(
        "mt-auto border-t py-12 transition-colors duration-300",
        isDarkMode ? "border-zinc-800 bg-zinc-950" : "border-zinc-200 bg-white"
      )}>
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <div className="flex items-center justify-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-600" />
            <span className={cn("font-bold", isDarkMode ? "text-white" : "text-zinc-900")}>
              AI Enhancer Pro
            </span>
          </div>
          <p className={cn("mt-4 text-sm", isDarkMode ? "text-zinc-500" : "text-zinc-500")}>
            Powered by advanced neural networks for stunning visual quality.
          </p>
          <div className="mt-8 flex justify-center gap-6 text-sm">
            <a href="#" className="text-zinc-400 hover:text-blue-500">Privacy Policy</a>
            <a href="#" className="text-zinc-400 hover:text-blue-500">Terms of Service</a>
            <a href="#" className="text-zinc-400 hover:text-blue-500">Contact Us</a>
          </div>
        </div>
      </footer>
    </main>
  );
}

function FeatureItem({ icon, title, description, isDark }: { icon: React.ReactNode, title: string, description: string, isDark: boolean }) {
  return (
    <div className="flex flex-col items-center p-6 text-center">
      <div className={cn(
        "flex h-12 w-12 items-center justify-center rounded-2xl",
        isDark 
          ? "bg-blue-900/30 text-blue-400" 
          : "bg-blue-100 text-blue-600"
      )}>
        {icon}
      </div>
      <h4 className={cn("mt-4 text-lg font-bold", isDark ? "text-white" : "text-zinc-900")}>
        {title}
      </h4>
      <p className={cn("mt-2 text-sm", isDark ? "text-zinc-400" : "text-zinc-600")}>
        {description}
      </p>
    </div>
  );
}
