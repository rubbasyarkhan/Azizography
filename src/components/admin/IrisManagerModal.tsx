"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import { GalleryItem } from "@/types/gallery";
import {
  updateGalleryItem,
  createGalleryItem,
  uploadImageFile,
} from "@/lib/gallery-service";
import {
  convertAndCompressToWebP,
  formatBytes,
  WebPConversionResult,
} from "@/lib/image-utils";
import {
  X,
  Sparkles,
  Upload,
  Check,
  Plus,
  Play,
  Loader2,
  Image as ImageIcon,
  CheckCircle2,
} from "lucide-react";

interface IrisManagerModalProps {
  items: GalleryItem[];
  onClose: () => void;
  onPreviewIris: () => void;
}

export default function IrisManagerModal({
  items,
  onClose,
  onPreviewIris,
}: IrisManagerModalProps) {
  const [filter, setFilter] = useState<"all" | "iris-only">("iris-only");
  const [uploading, setUploading] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newSeries, setNewSeries] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [conversionStats, setConversionStats] = useState<WebPConversionResult | null>(null);
  const [converting, setConverting] = useState(false);
  const [externalUrl, setExternalUrl] = useState("");
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const irisItems = items.filter((i) => i.isIrisItem);
  const displayedItems =
    filter === "iris-only" ? irisItems : items;

  const handleToggleIris = async (item: GalleryItem) => {
    const nextVal = !item.isIrisItem;
    await updateGalleryItem(item.id, { isIrisItem: nextVal });
  };

  const handleFileSelect = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file (JPEG, PNG, WebP, etc.).");
      return;
    }
    setError(null);
    setConverting(true);
    try {
      const result = await convertAndCompressToWebP(file, {
        maxWidth: 1920,
        maxHeight: 1920,
        quality: 0.82,
      });
      setSelectedFile(result.file);
      setPreviewUrl(result.dataUrl);
      setConversionStats(result);
    } catch (err: unknown) {
      console.warn("Iris WebP conversion error:", err);
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setConversionStats(null);
    } finally {
      setConverting(false);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      setError("Please enter a title for the photograph.");
      return;
    }
    if (!selectedFile && !externalUrl.trim()) {
      setError("Please provide an image file or URL.");
      return;
    }

    setUploading(true);
    setError(null);

    try {
      let finalUrl = "";
      let storagePath = "";
      let itemWidth = conversionStats?.width;
      let itemHeight = conversionStats?.height;

      if (selectedFile) {
        const res = await uploadImageFile(selectedFile);
        finalUrl = res.imageUrl;
        storagePath = res.storagePath;
        if (res.width) itemWidth = res.width;
        if (res.height) itemHeight = res.height;
      } else {
        finalUrl = externalUrl.trim();
        storagePath = "iris-external";
      }

      await createGalleryItem({
        title: newTitle.trim(),
        seriesOrProject: newSeries.trim() || "Iris Exhibition",
        category: "people",
        imageUrl: finalUrl,
        storagePath,
        width: itemWidth,
        height: itemHeight,
        blurDataUrl: conversionStats?.blurDataUrl,
        isFeatured: true,
        isVisible: true,
        isIrisItem: true, // Automatically active in Iris!
        aspectRatio: "portrait",
      });

      // Reset form
      setNewTitle("");
      setNewSeries("");
      setSelectedFile(null);
      setPreviewUrl(null);
      setConversionStats(null);
      setExternalUrl("");
      setShowUploadForm(false);
    } catch (err: unknown) {
      const e = err as Error;
      setError(e.message || "Failed to upload image.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 select-none">
      <div className="bg-[#111111] border border-white/20 w-full max-w-4xl max-h-[90vh] flex flex-col font-sans text-xs text-neutral-200 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10 bg-black/40">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center border border-white/20 text-white">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="font-sans font-bold text-base sm:text-lg text-white uppercase tracking-wider">
                Iris Loading Animation Photos
              </h2>
              <p className="text-[11px] text-neutral-400">
                {irisItems.length} photos active in circular iris loading sequence
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onPreviewIris}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-black font-semibold text-[11px] uppercase tracking-wider hover:bg-neutral-200 transition-colors cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-black" />
              <span>Preview Animation</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-white border border-white/10 hover:border-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Toolbar & Filter */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 border-b border-white/10 bg-neutral-900/40">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setFilter("iris-only")}
              className={`px-3 py-1 text-[11px] uppercase tracking-wider transition-colors cursor-pointer ${
                filter === "iris-only"
                  ? "bg-white text-black font-bold"
                  : "bg-white/5 text-neutral-400 hover:text-white"
              }`}
            >
              Iris Active ({irisItems.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter("all")}
              className={`px-3 py-1 text-[11px] uppercase tracking-wider transition-colors cursor-pointer ${
                filter === "all"
                  ? "bg-white text-black font-bold"
                  : "bg-white/5 text-neutral-400 hover:text-white"
              }`}
            >
              All Portfolio Photos ({items.length})
            </button>
          </div>

          <button
            type="button"
            onClick={() => setShowUploadForm(!showUploadForm)}
            className="flex items-center gap-1.5 px-3 py-1 text-[11px] bg-red-600 hover:bg-red-500 text-white font-bold uppercase tracking-wider transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{showUploadForm ? "Close Uploader" : "Upload New Iris Photo"}</span>
          </button>
        </div>

        {/* Optional Upload Section */}
        {showUploadForm && (
          <form
            onSubmit={handleUploadSubmit}
            className="p-5 border-b border-white/10 bg-neutral-950 space-y-4"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-white font-bold uppercase tracking-wider">
                Upload New Photograph for Iris Animation
              </span>
            </div>

            {error && (
              <p className="text-red-400 text-[11px] bg-red-950/40 p-2 border border-red-500/30">
                {error}
              </p>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] uppercase text-neutral-400 tracking-wider mb-1">
                    Title
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Backstage Session"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full bg-[#181818] border border-white/10 px-3 py-2 text-white text-xs uppercase focus:outline-none focus:border-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase text-neutral-400 tracking-wider mb-1">
                    Series / Project Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Netflix x The Four Seasons"
                    value={newSeries}
                    onChange={(e) => setNewSeries(e.target.value)}
                    className="w-full bg-[#181818] border border-white/10 px-3 py-2 text-white text-xs focus:outline-none focus:border-white"
                  />
                </div>
              </div>

              <div className="space-y-3 md:col-span-2">
                <label className="block text-[10px] uppercase text-neutral-400 tracking-wider mb-1">
                  Photo File or URL
                </label>
                <div className="flex gap-3">
                  <div
                    onClick={() => !converting && fileInputRef.current?.click()}
                    className="flex-1 border border-dashed border-white/20 hover:border-white p-3 text-center cursor-pointer flex flex-col items-center justify-center min-h-[90px] bg-neutral-900/50"
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        e.target.files?.[0] && handleFileSelect(e.target.files[0])
                      }
                      className="hidden"
                    />
                    {converting ? (
                      <div className="flex flex-col items-center gap-1.5 py-1">
                        <Loader2 className="w-4 h-4 text-red-500 animate-spin" />
                        <span className="text-[10px] text-neutral-300 font-mono">
                          Converting to WebP...
                        </span>
                      </div>
                    ) : previewUrl ? (
                      <div className="flex flex-col items-center text-center gap-1">
                        <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-[10px] uppercase">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>WebP Ready</span>
                        </div>
                        {conversionStats ? (
                          <div className="text-[9px] text-neutral-400 font-mono">
                            <span>{formatBytes(conversionStats.originalSize)}</span>
                            <span className="text-emerald-400 font-bold"> → {formatBytes(conversionStats.compressedSize)}</span>
                            <span className="text-emerald-400"> (-{conversionStats.compressionRatio}%)</span>
                          </div>
                        ) : (
                          <span className="text-white text-[11px] truncate max-w-[150px]">
                            {selectedFile?.name}
                          </span>
                        )}
                      </div>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 text-neutral-400 mb-1" />
                        <span className="text-[10px] text-neutral-400 uppercase tracking-wider">
                          Upload file (Auto WebP & compress)
                        </span>
                      </>
                    )}
                  </div>

                  <div className="flex-1 flex flex-col justify-between">
                    <input
                      type="url"
                      placeholder="Or paste image URL (Unsplash/CDN)..."
                      value={externalUrl}
                      onChange={(e) => {
                        setExternalUrl(e.target.value);
                        if (e.target.value) setSelectedFile(null);
                      }}
                      className="w-full bg-[#181818] border border-white/10 px-3 py-2 text-white text-xs focus:outline-none focus:border-white"
                    />
                    <button
                      type="submit"
                      disabled={uploading}
                      className="w-full mt-2 py-2 bg-white hover:bg-neutral-200 text-black font-bold uppercase text-[11px] tracking-wider flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      {uploading ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Ingesting...</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Add to Iris</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </form>
        )}

        {/* Photos Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {displayedItems.map((item) => {
              const active = Boolean(item.isIrisItem);
              return (
                <div
                  key={item.id}
                  className={`group relative flex flex-col border transition-all ${
                    active
                      ? "border-white/50 bg-white/[0.05]"
                      : "border-white/10 bg-black/40 opacity-60 hover:opacity-100"
                  }`}
                >
                  {/* Photo thumbnail */}
                  <div className="relative aspect-[3/4] w-full overflow-hidden bg-neutral-900">
                    <Image
                      src={item.imageUrl}
                      alt={item.title}
                      fill
                      sizes="160px"
                      className="object-cover"
                    />
                    {active && (
                      <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 bg-red-600 text-white font-mono text-[9px] uppercase tracking-wider font-bold">
                        Iris
                      </div>
                    )}
                  </div>

                  {/* Caption & Toggle Button */}
                  <div className="p-2 flex flex-col justify-between flex-1 gap-2">
                    <div className="truncate">
                      <p className="text-[11px] text-white font-medium truncate uppercase">
                        {item.title}
                      </p>
                      {item.seriesOrProject && (
                        <p className="text-[9px] text-neutral-400 truncate">
                          {item.seriesOrProject}
                        </p>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleToggleIris(item)}
                      className={`w-full py-1 text-[10px] uppercase font-bold tracking-wider transition-colors cursor-pointer ${
                        active
                          ? "bg-red-950/60 text-red-300 hover:bg-red-900/60 border border-red-500/30"
                          : "bg-white/10 text-white hover:bg-white/20 border border-white/20"
                      }`}
                    >
                      {active ? "Remove" : "+ Add to Iris"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {displayedItems.length === 0 && (
            <div className="py-20 text-center text-neutral-500 font-mono text-xs uppercase">
              No photos currently selected. Click &quot;All Portfolio Photos&quot; to add photos to Iris.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 flex items-center justify-between bg-black/40 text-[11px] text-neutral-400">
          <span>
            {irisItems.length} photos active • Iris animates smoothly using these curated images
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-white text-black font-semibold uppercase tracking-wider hover:bg-neutral-200 transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
