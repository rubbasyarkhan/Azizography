"use client";

import React, { useState, useRef, useEffect } from "react";
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
  ArrowRight,
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

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const lenis = (window as unknown as { __lenis?: { stop: () => void; start: () => void } }).__lenis;
    lenis?.stop();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      lenis?.start();
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  const irisItems = items.filter((i) => i.isIrisItem);
  const displayedItems = filter === "iris-only" ? irisItems : items;

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
        seriesOrProject: newSeries.trim() || "Iris Collection",
        category: "people",
        imageUrl: finalUrl,
        storagePath,
        width: itemWidth,
        height: itemHeight,
        aspectRatio: "portrait",
        isIrisItem: true,
        isVisible: true,
        isFeatured: false,
      });

      // Reset
      setShowUploadForm(false);
      setNewTitle("");
      setNewSeries("");
      setSelectedFile(null);
      setPreviewUrl(null);
      setConversionStats(null);
      setExternalUrl("");
    } catch (err: unknown) {
      const e = err as Error;
      setError(e.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div
      data-lenis-prevent="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 font-admin"
    >
      <div
        data-lenis-prevent="true"
        className="bg-[#FAF7F2] border border-[#DDD6CA] text-[#1C1917] max-w-4xl w-full max-h-[92vh] flex flex-col rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Top Header */}
        <div className="p-6 sm:p-7 border-b border-[#DDD6CA] flex items-center justify-between">
          <div>
            <h3 className="text-xl sm:text-2xl font-bold text-[#1C1917] tracking-tight">
              Iris Opening Aperture
            </h3>
            <p className="text-sm text-stone-600 mt-1">
              Select portraits that revolve in the 24-blade camera aperture on initial visitor load
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onPreviewIris}
              className="flex items-center gap-2 px-3.5 py-2 bg-[#FAF7F2] hover:bg-[#EAE4D9] text-[#1C1917] text-sm font-semibold transition-colors border border-[#DDD6CA] rounded-lg cursor-pointer shadow-xs"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Preview Animation</span>
            </button>

            <button
              onClick={onClose}
              type="button"
              aria-label="Close"
              className="p-2 text-stone-500 hover:text-[#1C1917] hover:bg-[#EAE4D9] rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter Toolbar & Actions */}
        <div className="px-6 py-3 bg-[#F4F0EA] border-b border-[#DDD6CA] flex flex-wrap items-center justify-between gap-3 text-sm">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setFilter("iris-only")}
              className={`px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-colors cursor-pointer ${
                filter === "iris-only"
                  ? "bg-[#1C1917] text-[#FAF7F2] shadow-xs"
                  : "text-stone-600 hover:text-[#1C1917] hover:bg-[#EAE4D9]"
              }`}
            >
              Active in Iris ({irisItems.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter("all")}
              className={`px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-colors cursor-pointer ${
                filter === "all"
                  ? "bg-[#1C1917] text-[#FAF7F2] shadow-xs"
                  : "text-stone-600 hover:text-[#1C1917] hover:bg-[#EAE4D9]"
              }`}
            >
              All Works ({items.length})
            </button>
          </div>

          <button
            type="button"
            onClick={() => setShowUploadForm(!showUploadForm)}
            className="flex items-center gap-2 px-4 py-2 bg-[#1C1917] hover:bg-[#292524] text-[#FAF7F2] text-sm font-semibold transition-colors cursor-pointer rounded-lg shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>{showUploadForm ? "Close Form" : "Upload Dedicated Portrait"}</span>
          </button>
        </div>

        {/* Optional Upload Section */}
        {showUploadForm && (
          <form
            onSubmit={handleUploadSubmit}
            className="p-5 border-b border-[#DDD6CA] bg-[#F4F0EA]/70 space-y-4"
          >
            <span className="text-sm font-bold text-[#1C1917] block">
              Quick Ingest for Iris Aperture
            </span>

            {error && (
              <p className="text-red-700 text-sm font-medium bg-red-50 p-3 border border-red-200 rounded-lg">
                {error}
              </p>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Photograph Title *
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Backstage Session"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-[#DDD6CA] px-3.5 py-2 text-[#1C1917] text-sm focus:outline-none focus:border-[#1C1917] rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Series / Project
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Marie Claire Cover"
                    value={newSeries}
                    onChange={(e) => setNewSeries(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-[#DDD6CA] px-3.5 py-2 text-[#1C1917] text-sm focus:outline-none focus:border-[#1C1917] rounded-lg"
                  />
                </div>
              </div>

              <div className="space-y-3 md:col-span-2">
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Image File (Auto WebP 82%)
                </label>
                <div className="flex gap-3">
                  <div
                    onClick={() => !converting && fileInputRef.current?.click()}
                    className="flex-1 border-2 border-dashed border-[#DDD6CA] hover:border-[#1C1917] p-3.5 text-center cursor-pointer flex flex-col items-center justify-center min-h-[80px] bg-[#FAF7F2] rounded-lg transition-colors"
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
                      <div className="flex items-center gap-2 text-sm text-stone-700">
                        <Loader2 className="w-4 h-4 animate-spin text-[#1C1917]" />
                        <span>Converting to WebP...</span>
                      </div>
                    ) : previewUrl ? (
                      <div className="flex flex-col items-center text-center gap-1">
                        <span className="text-[#1C1917] text-sm font-semibold truncate max-w-[180px]">
                          {selectedFile?.name}
                        </span>
                        {conversionStats && (
                          <span className="text-xs text-stone-500 font-mono">
                            {formatBytes(conversionStats.compressedSize)} (-{conversionStats.compressionRatio}%)
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-sm font-medium text-stone-600">
                        Choose file (auto WebP 82%)
                      </span>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={uploading || converting || (!selectedFile && !externalUrl)}
                    className="px-5 py-2 bg-[#1C1917] hover:bg-[#292524] text-[#FAF7F2] text-sm font-semibold transition-colors disabled:opacity-40 cursor-pointer rounded-lg shrink-0 self-end shadow-sm"
                  >
                    {uploading ? "Saving..." : "Add to Iris"}
                  </button>
                </div>
              </div>
            </div>
          </form>
        )}

        {/* Scrollable Photos Grid */}
        <div
          data-lenis-prevent="true"
          onWheel={(e) => e.stopPropagation()}
          className="flex-1 overflow-y-auto overscroll-contain p-6 sm:p-7"
        >
          {displayedItems.length === 0 ? (
            <div className="py-20 text-center border-2 border-dashed border-[#DDD6CA] rounded-xl">
              <p className="text-sm font-medium text-stone-500">
                {filter === "iris-only"
                  ? "No photographs active in Iris ring"
                  : "No photographs found in archive"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
              {displayedItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleToggleIris(item)}
                  className={`group relative aspect-[3/4] bg-stone-950 transition-all cursor-pointer overflow-hidden rounded-xl ${
                    item.isIrisItem
                      ? "border-2 border-[#1C1917] shadow-md ring-2 ring-stone-900/10"
                      : "border border-[#DDD6CA] opacity-60 hover:opacity-100 hover:border-stone-400"
                  }`}
                >
                  <Image
                    src={item.imageUrl}
                    alt={item.title}
                    fill
                    sizes="180px"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />

                  {/* Iris Indicator Badge */}
                  <div className="absolute top-2 right-2">
                    {item.isIrisItem ? (
                      <span className="flex items-center gap-1 px-2 py-0.5 bg-[#1C1917] text-[#FAF7F2] text-xs font-semibold rounded shadow">
                        <Check className="w-3 h-3" />
                        <span>Iris</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 px-2 py-0.5 bg-[#FAF7F2]/90 text-[#1C1917] text-xs font-semibold rounded group-hover:bg-[#FAF7F2] transition-colors shadow">
                        <Plus className="w-3 h-3" />
                        <span>Add</span>
                      </span>
                    )}
                  </div>

                  {/* Caption */}
                  <div className="absolute bottom-2 left-2 right-2 truncate">
                    <p className="text-xs sm:text-sm font-semibold text-white truncate drop-shadow-sm">
                      {item.title}
                    </p>
                    <p className="text-[11px] text-stone-300 capitalize truncate drop-shadow-sm">
                      {item.category}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Info */}
        <div className="p-4 sm:p-5 bg-[#F4F0EA] border-t border-[#DDD6CA] flex items-center justify-between text-sm text-stone-600 font-medium">
          <span>{irisItems.length} active in Iris ring</span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-[#1C1917] hover:bg-[#292524] text-[#FAF7F2] text-sm font-semibold transition-colors cursor-pointer rounded-lg shadow-sm"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
