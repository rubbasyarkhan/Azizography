"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import { GalleryItem, GalleryCategory } from "@/types/gallery";
import { uploadImageFile, createGalleryItem } from "@/lib/gallery-service";
import {
  convertAndCompressToWebP,
  formatBytes,
  WebPConversionResult,
} from "@/lib/image-utils";
import {
  Upload,
  Image as ImageIcon,
  X,
  CheckCircle2,
  Camera,
  Loader2,
  Sparkles,
} from "lucide-react";

interface ImageUploaderProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export default function ImageUploader({ onSuccess, onCancel }: ImageUploaderProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [conversionStats, setConversionStats] = useState<WebPConversionResult | null>(null);
  const [converting, setConverting] = useState(false);
  const [externalUrl, setExternalUrl] = useState<string>("");
  const [useExternalUrl, setUseExternalUrl] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form Fields
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<GalleryCategory>("concerts");
  const [artist, setArtist] = useState("");
  const [location, setLocation] = useState("");
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [aspectRatio, setAspectRatio] = useState<"portrait" | "landscape" | "square" | "tall">("portrait");
  const [seriesOrProject, setSeriesOrProject] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [isIrisItem, setIsIrisItem] = useState(false);
  const [tagsString, setTagsString] = useState("");

  // EXIF
  const [camera, setCamera] = useState("Sony A1");
  const [lens, setLens] = useState("FE 24-70mm f/2.8 GM II");
  const [iso, setIso] = useState("1600");
  const [aperture, setAperture] = useState("f/2.8");
  const [shutter, setShutter] = useState("1/500s");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file (JPEG, PNG, WebP, AVIF, TIFF, etc.).");
      return;
    }
    setError(null);
    setConverting(true);

    try {
      // Convert any uploaded image format to optimized WebP and compress
      const result = await convertAndCompressToWebP(file, {
        maxWidth: 1920,
        maxHeight: 1920,
        quality: 0.82,
      });

      setSelectedFile(result.file);
      setPreviewUrl(result.dataUrl);
      setConversionStats(result);

      // Auto-detect optimal aspect ratio based on natural image dimensions
      const ratio = result.width / result.height;
      if (ratio > 1.25) {
        setAspectRatio("landscape");
      } else if (ratio < 0.65) {
        setAspectRatio("tall");
      } else if (ratio >= 0.88 && ratio <= 1.12) {
        setAspectRatio("square");
      } else {
        setAspectRatio("portrait");
      }
    } catch (err: unknown) {
      console.warn("Client WebP conversion fallback:", err);
      // Fallback
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setConversionStats(null);
    } finally {
      setConverting(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Please enter a title for the image.");
      return;
    }

    if (!selectedFile && !externalUrl.trim()) {
      setError("Please upload an image file or provide an image URL.");
      return;
    }

    setUploading(true);
    setError(null);

    try {
      let finalImageUrl = "";
      let finalStoragePath = "";
      let itemWidth = conversionStats?.width;
      let itemHeight = conversionStats?.height;

      if (selectedFile) {
        const uploadResult = await uploadImageFile(selectedFile);
        finalImageUrl = uploadResult.imageUrl;
        finalStoragePath = uploadResult.storagePath;
        if (uploadResult.width) itemWidth = uploadResult.width;
        if (uploadResult.height) itemHeight = uploadResult.height;
      } else {
        finalImageUrl = externalUrl.trim();
        finalStoragePath = "external-url";
      }

      const tags = tagsString
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      await createGalleryItem({
        title: title.trim(),
        seriesOrProject: seriesOrProject.trim() || undefined,
        category,
        imageUrl: finalImageUrl,
        storagePath: finalStoragePath,
        width: itemWidth,
        height: itemHeight,
        blurDataUrl: conversionStats?.blurDataUrl,
        isFeatured,
        isVisible: true,
        isIrisItem,
        artist: artist.trim() || undefined,
        location: location.trim() || undefined,
        year: year.trim() || undefined,
        aspectRatio,
        exif: {
          camera,
          lens,
          iso,
          aperture,
          shutter,
        },
        tags: tags.length > 0 ? tags : undefined,
      });

      onSuccess();
    } catch (err: unknown) {
      const e = err as Error;
      setError(e.message || "Failed to upload image. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-[#111111] border border-white/20 p-6 sm:p-8 font-mono-brutal text-xs max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
        <div>
          <span className="text-[10px] text-red-500 font-bold uppercase tracking-widest block mb-1">
            // NEW ASSET INGESTION
          </span>
          <h3 className="font-display text-2xl font-bold uppercase text-white">
            UPLOAD & INDEX IMAGE
          </h3>
        </div>

        <button
          onClick={onCancel}
          className="p-2 border border-white/10 hover:border-white text-neutral-400 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {error && (
        <div className="mb-6 p-3 bg-red-950/40 border border-red-500 text-red-400 text-xs">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Dropzone & Preview Row */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-6">
            {converting ? (
              <div className="w-full h-64 border-2 border-dashed border-red-500/50 bg-[#151515] flex flex-col items-center justify-center p-6 text-center">
                <Loader2 className="w-8 h-8 text-red-500 animate-spin mb-3" />
                <span className="font-bold text-white uppercase tracking-wider block mb-1">
                  CONVERTING TO WEBP & COMPRESSING...
                </span>
                <span className="text-[10px] text-neutral-400 uppercase tracking-widest">
                  Auto-optimizing dimensions & format
                </span>
              </div>
            ) : !previewUrl && !externalUrl ? (
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-64 border-2 border-dashed border-white/20 hover:border-white bg-[#151515] flex flex-col items-center justify-center cursor-pointer p-6 text-center transition-all group"
              >
                <Upload className="w-8 h-8 text-neutral-400 group-hover:text-white group-hover:scale-110 transition-all mb-3" />
                <span className="font-bold text-white uppercase tracking-wider block mb-1">
                  DROP ANY IMAGE HERE
                </span>
                <span className="text-[10px] text-neutral-500 uppercase">
                  JPEG, PNG, HEIC, TIFF, AVIF → AUTO-CONVERT TO WEBP & COMPRESS
                </span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files?.[0]) handleFileSelect(e.target.files[0]);
                  }}
                  className="hidden"
                />
              </div>
            ) : (
              <div className="space-y-2">
                <div className="relative w-full h-64 bg-black border border-white/20 overflow-hidden">
                  <Image
                    src={previewUrl || externalUrl}
                    alt="Preview"
                    fill
                    className="object-contain"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFile(null);
                      setPreviewUrl(null);
                      setConversionStats(null);
                      setExternalUrl("");
                    }}
                    className="absolute top-2 right-2 p-1.5 bg-black/80 text-white border border-white/20 hover:bg-red-600 transition-colors cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* WebP Compression Statistics Metric Card */}
                {conversionStats && (
                  <div className="p-2.5 bg-black/80 border border-emerald-500/40 text-emerald-300">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[10px] text-emerald-400">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        CONVERTED TO WEBP (COMPRESSED)
                      </span>
                      <span className="text-[9px] bg-emerald-500/20 text-emerald-300 font-bold px-1.5 py-0.5 border border-emerald-500/40 uppercase">
                        -{conversionStats.compressionRatio}% SIZE REDUCED
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-[10px] pt-1.5 border-t border-emerald-500/20 text-neutral-300">
                      <div>
                        <span className="text-neutral-500 block text-[9px] uppercase">Original:</span>
                        <span className="font-mono">{formatBytes(conversionStats.originalSize)}</span>
                      </div>
                      <div>
                        <span className="text-neutral-500 block text-[9px] uppercase">WebP:</span>
                        <span className="font-mono text-emerald-400 font-bold">
                          {formatBytes(conversionStats.compressedSize)}
                        </span>
                      </div>
                      <div>
                        <span className="text-neutral-500 block text-[9px] uppercase">Dims:</span>
                        <span className="font-mono">
                          {conversionStats.width}×{conversionStats.height}px
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Alternative External URL toggle */}
            <div className="mt-3">
              <button
                type="button"
                onClick={() => setUseExternalUrl(!useExternalUrl)}
                className="text-[10px] text-neutral-400 hover:text-white uppercase tracking-wider underline"
              >
                {useExternalUrl ? "← Switch to file upload" : "Or use direct image URL →"}
              </button>

              {useExternalUrl && (
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={externalUrl}
                  onChange={(e) => setExternalUrl(e.target.value)}
                  className="w-full mt-2 bg-[#181818] border border-white/10 px-3 py-2 text-white placeholder:text-neutral-600 text-xs focus:outline-none focus:border-white"
                />
              )}
            </div>
          </div>

          {/* Core Metadata Fields */}
          <div className="md:col-span-6 space-y-4">
            <div>
              <label className="block text-[10px] uppercase text-neutral-400 tracking-wider mb-1">
                Visual Title *
              </label>
              <input
                required
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="E.G. RED ROCKS ENCORE SOLITUDE"
                className="w-full bg-[#181818] border border-white/10 px-3 py-2 text-white placeholder:text-neutral-600 text-xs uppercase focus:outline-none focus:border-white font-bold"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase text-neutral-400 tracking-wider mb-1">
                Series / Project / Story (Appears in Sidebar)
              </label>
              <input
                type="text"
                value={seriesOrProject}
                onChange={(e) => setSeriesOrProject(e.target.value)}
                placeholder="E.G. Netflix x The Four Seasons, Taika Waititi for WIRED..."
                className="w-full bg-[#181818] border border-white/10 px-3 py-2 text-white placeholder:text-neutral-600 text-xs focus:outline-none focus:border-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] uppercase text-neutral-400 tracking-wider mb-1">
                  Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as GalleryCategory)}
                  className="w-full bg-[#181818] border border-white/10 px-3 py-2 text-white text-xs uppercase focus:outline-none focus:border-white"
                >
                  <option value="people">People / Editorial</option>
                  <option value="concerts">Concerts</option>
                  <option value="singers">Singers</option>
                  <option value="weddings">Weddings</option>
                  <option value="events">Events</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] uppercase text-neutral-400 tracking-wider mb-1">
                  Aspect Ratio
                </label>
                <select
                  value={aspectRatio}
                  onChange={(e) => setAspectRatio(e.target.value as "portrait" | "landscape" | "square" | "tall")}
                  className="w-full bg-[#181818] border border-white/10 px-3 py-2 text-white text-xs uppercase focus:outline-none focus:border-white"
                >
                  <option value="portrait">Portrait (3:4)</option>
                  <option value="tall">Tall (9:16)</option>
                  <option value="landscape">Landscape (16:9)</option>
                  <option value="square">Square (1:1)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[10px] uppercase text-neutral-400 tracking-wider mb-1">
                Artist / Couple / Subject
              </label>
              <input
                type="text"
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
                placeholder="E.G. Dua Lipa / Eleanor & Julian"
                className="w-full bg-[#181818] border border-white/10 px-3 py-2 text-white placeholder:text-neutral-600 text-xs uppercase focus:outline-none focus:border-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] uppercase text-neutral-400 tracking-wider mb-1">
                  Location / Venue
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="E.G. Red Rocks, CO"
                  className="w-full bg-[#181818] border border-white/10 px-3 py-2 text-white placeholder:text-neutral-600 text-xs uppercase focus:outline-none focus:border-white"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase text-neutral-400 tracking-wider mb-1">
                  Year
                </label>
                <input
                  type="text"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  placeholder="2026"
                  className="w-full bg-[#181818] border border-white/10 px-3 py-2 text-white placeholder:text-neutral-600 text-xs uppercase focus:outline-none focus:border-white"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Camera EXIF Details */}
        <div className="border-t border-white/10 pt-4">
          <div className="flex items-center gap-2 text-white font-bold uppercase tracking-wider text-[11px] mb-3">
            <Camera className="w-3.5 h-3.5 text-red-500" />
            <span>EXIF Camera & Settings Metadata</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div>
              <label className="block text-[9px] uppercase text-neutral-400 tracking-wider mb-1">Body</label>
              <input
                type="text"
                value={camera}
                onChange={(e) => setCamera(e.target.value)}
                className="w-full bg-[#181818] border border-white/10 px-2.5 py-1.5 text-white text-[11px] focus:outline-none focus:border-white"
              />
            </div>
            <div>
              <label className="block text-[9px] uppercase text-neutral-400 tracking-wider mb-1">Glass</label>
              <input
                type="text"
                value={lens}
                onChange={(e) => setLens(e.target.value)}
                className="w-full bg-[#181818] border border-white/10 px-2.5 py-1.5 text-white text-[11px] focus:outline-none focus:border-white"
              />
            </div>
            <div>
              <label className="block text-[9px] uppercase text-neutral-400 tracking-wider mb-1">ISO</label>
              <input
                type="text"
                value={iso}
                onChange={(e) => setIso(e.target.value)}
                className="w-full bg-[#181818] border border-white/10 px-2.5 py-1.5 text-white text-[11px] focus:outline-none focus:border-white"
              />
            </div>
            <div>
              <label className="block text-[9px] uppercase text-neutral-400 tracking-wider mb-1">Aperture</label>
              <input
                type="text"
                value={aperture}
                onChange={(e) => setAperture(e.target.value)}
                className="w-full bg-[#181818] border border-white/10 px-2.5 py-1.5 text-white text-[11px] focus:outline-none focus:border-white"
              />
            </div>
            <div>
              <label className="block text-[9px] uppercase text-neutral-400 tracking-wider mb-1">Shutter</label>
              <input
                type="text"
                value={shutter}
                onChange={(e) => setShutter(e.target.value)}
                className="w-full bg-[#181818] border border-white/10 px-2.5 py-1.5 text-white text-[11px] focus:outline-none focus:border-white"
              />
            </div>
          </div>
        </div>

        {/* Tags and Featured toggle */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 border-t border-white/10 pt-4">
          <div className="sm:col-span-8">
            <label className="block text-[10px] uppercase text-neutral-400 tracking-wider mb-1">
              Visual Tags (comma-separated)
            </label>
            <input
              type="text"
              value={tagsString}
              onChange={(e) => setTagsString(e.target.value)}
              placeholder="Pyro, Arena, Red Wash, Vocalist"
              className="w-full bg-[#181818] border border-white/10 px-3 py-2 text-white placeholder:text-neutral-600 text-xs focus:outline-none focus:border-white"
            />
          </div>

          <div className="sm:col-span-4 flex flex-col gap-2 justify-end">
            <label className="flex items-center gap-2 cursor-pointer p-2 border border-white/10 bg-[#181818] w-full">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="accent-red-600 w-4 h-4"
              />
              <span className="text-[10px] uppercase font-bold text-neutral-300">
                Feature on Hero
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer p-2 border border-white/10 bg-[#181818] w-full">
              <input
                type="checkbox"
                checked={isIrisItem}
                onChange={(e) => setIsIrisItem(e.target.checked)}
                className="accent-red-600 w-4 h-4"
              />
              <span className="text-[10px] uppercase font-bold text-red-400">
                ★ Include in Iris Animation
              </span>
            </label>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
          <button
            type="button"
            onClick={onCancel}
            disabled={uploading}
            className="px-4 py-2.5 border border-white/10 hover:border-white text-neutral-400 hover:text-white uppercase tracking-wider text-xs"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={uploading}
            className="px-6 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold uppercase tracking-widest text-xs flex items-center gap-2 disabled:opacity-50 transition-colors"
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>INDEXING ASSET...</span>
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                <span>SAVE & PUBLISH TO LIVE GALLERY</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
