"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import { GalleryCategory } from "@/types/gallery";
import { uploadImageFile, createGalleryItem } from "@/lib/gallery-service";
import {
  convertAndCompressToWebP,
  formatBytes,
  WebPConversionResult,
} from "@/lib/image-utils";
import {
  Upload,
  X,
  CheckCircle2,
  Loader2,
  Sparkles,
  Sliders,
  ArrowRight,
  ArrowLeft,
  Copy,
  Bookmark,
  ExternalLink,
  HelpCircle,
} from "lucide-react";
import InstagramIcon from "@/components/icons/InstagramIcon";

interface ImageUploaderProps {
  onSuccess: () => void;
  onCancel: () => void;
  initialImportData?: {
    imageUrl?: string;
    postUrl?: string;
    caption?: string;
  } | null;
}

export default function ImageUploader({
  onSuccess,
  onCancel,
  initialImportData,
}: ImageUploaderProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [conversionStats, setConversionStats] = useState<WebPConversionResult | null>(null);
  const [converting, setConverting] = useState(false);
  const [externalUrl, setExternalUrl] = useState<string>("");
  const [useExternalUrl, setUseExternalUrl] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showExifFields, setShowExifFields] = useState(false);

  // Form Fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<GalleryCategory>("people");
  const [artist, setArtist] = useState("");
  const [location, setLocation] = useState("");
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [aspectRatio, setAspectRatio] = useState<"portrait" | "landscape" | "square" | "tall">("portrait");
  const [seriesOrProject, setSeriesOrProject] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [isIrisItem, setIsIrisItem] = useState(false);
  const [isFooterTrailItem, setIsFooterTrailItem] = useState(false);
  const [tagsString, setTagsString] = useState("");
  const [instagramUrl, setInstagramUrl] = useState("");

  // EXIF
  const [camera, setCamera] = useState("Sony A1");
  const [lens, setLens] = useState("FE 24-70mm f/2.8 GM II");
  const [iso, setIso] = useState("1600");
  const [aperture, setAperture] = useState("f/2.8");
  const [shutter, setShutter] = useState("1/500s");

  // Instagram Ingest State
  const [instagramInputUrl, setInstagramInputUrl] = useState("");
  const [fetchingInstagram, setFetchingInstagram] = useState(false);
  const [instagramNotice, setInstagramNotice] = useState<string | null>(null);
  const [bookmarkletCode, setBookmarkletCode] = useState<string>("");
  const [copiedBookmarklet, setCopiedBookmarklet] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const bookmarkletLinkRef = useRef<HTMLAnchorElement>(null);

  // Generate dynamic bookmarklet pointing to the current host (localhost in dev, domain in prod)
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const origin = window.location.origin;
      const code = `javascript:(function(){try{document.querySelectorAll('div._aagw').forEach(function(el){el.remove();});var imgs=Array.from(document.querySelectorAll('article img[src],div[role="dialog"] img[src],main img[src]')).filter(function(img){var s=img.src||'';return(s.includes('cdninstagram')||s.includes('fbcdn'))&&!s.includes('s150x150')&&!s.includes('s320x320')&&!s.includes('/rsrc.php/');});if(!imgs.length){alert('Azizography: Open an Instagram post modal or page first!');return;}var t=imgs[0],u=t.src;if(t.srcset){var p=t.srcset.split(',').map(function(s){return s.trim().split(' ');});if(p.length)u=p[p.length-1][0];}var c='';var h=document.querySelector('h1');if(h&&h.innerText){c=h.innerText;}else{var a=t.getAttribute('alt')||'';if(a&&!a.startsWith('Photo by')&&!a.startsWith('May be'))c=a;}var m=window.location.href.match(/(https:\\/\\/(?:www\\.)?instagram\\.com\\/(?:p|reel)\\/[a-zA-Z0-9_-]+)/);var pUrl=m?m[1]+'/':window.location.href.split('?')[0];window.open('${origin}/admin/dashboard?import_img='+encodeURIComponent(u)+'&import_post='+encodeURIComponent(pUrl)+'&import_caption='+encodeURIComponent(c),'_blank');}catch(e){alert('Azizography Importer Error: '+e.message);}})();`;
      setBookmarkletCode(code);
    }
  }, []);

  // Attach href directly via DOM element to avoid React's JSX javascript: protocol security check
  React.useEffect(() => {
    if (bookmarkletLinkRef.current && bookmarkletCode) {
      bookmarkletLinkRef.current.setAttribute("href", bookmarkletCode);
    }
  }, [bookmarkletCode]);

  // Handle incoming data from Bookmarklet redirect or parent prop
  React.useEffect(() => {
    if (initialImportData?.imageUrl) {
      if (initialImportData.postUrl) {
        setInstagramUrl(initialImportData.postUrl);
      }
      if (initialImportData.caption) {
        setDescription(initialImportData.caption);
        if (!title) {
          const firstLine = initialImportData.caption.split("\n")[0].replace(/#\w+/g, "").trim().slice(0, 45);
          if (firstLine) setTitle(firstLine);
        }
      }
      setInstagramInputUrl(initialImportData.imageUrl);
      handleInstagramImport(initialImportData.imageUrl, initialImportData.postUrl, initialImportData.caption);
    }
  }, [initialImportData]);

  const handleFileSelect = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file (JPEG, PNG, WebP, AVIF, TIFF, etc.).");
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
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setConversionStats(null);
    } finally {
      setConverting(false);
    }
  };

  const handleInstagramImport = async (
    urlToFetch?: string,
    explicitPostUrl?: string,
    explicitCaption?: string
  ) => {
    const targetUrl = (urlToFetch || instagramInputUrl).trim();
    if (!targetUrl) return;

    setFetchingInstagram(true);
    setError(null);
    setInstagramNotice(null);

    try {
      const res = await fetch("/api/admin/instagram-import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: targetUrl,
          postUrl: explicitPostUrl || instagramUrl || undefined,
        }),
      });

      const data = await res.json();

      if (data.success && data.dataUrl) {
        const blob = await fetch(data.dataUrl).then((r) => r.blob());
        const file = new File([blob], `instagram_${Date.now()}.jpg`, { type: blob.type || "image/jpeg" });

        await handleFileSelect(file);

        if (data.instagramUrl || explicitPostUrl) {
          setInstagramUrl(data.instagramUrl || explicitPostUrl || "");
        }
        const cap = explicitCaption || data.caption;
        if (cap) {
          setDescription((prev) => prev || cap);
          setTitle((prev) => {
            if (prev) return prev;
            const cleanTitle = cap.split("\n")[0].replace(/#\w+/g, "").trim().slice(0, 45);
            return cleanTitle || "Untitled";
          });
        }
        setInstagramNotice("✨ Instagram photo imported and optimized to WebP! Review your title and details below.");
      } else if (data.requiresDirectImage) {
        if (data.instagramUrl || explicitPostUrl) {
          setInstagramUrl(data.instagramUrl || explicitPostUrl || "");
        }
        setInstagramNotice(data.message);
      } else {
        setError(data.message || "Could not import from Instagram. Try copying the image directly.");
      }
    } catch (err: unknown) {
      const e = err as Error;
      setError(e.message || "Failed to fetch from Instagram.");
    } finally {
      setFetchingInstagram(false);
    }
  };

  React.useEffect(() => {
    const onPaste = async (e: ClipboardEvent) => {
      // 1. Check if user pasted an image file from clipboard (e.g. copied from Instagram)
      if (e.clipboardData?.items) {
        for (const item of Array.from(e.clipboardData.items)) {
          if (item.type.startsWith("image/")) {
            const file = item.getAsFile();
            if (file) {
              e.preventDefault();
              await handleFileSelect(file);
              return;
            }
          }
        }
      }

      // 2. Check if user pasted an Instagram URL
      const text = e.clipboardData?.getData("text")?.trim();
      if (text && (text.includes("instagram.com") || text.includes("cdninstagram.com"))) {
        const activeTag = document.activeElement?.tagName?.toLowerCase();
        if (activeTag !== "input" && activeTag !== "textarea") {
          e.preventDefault();
          setInstagramInputUrl(text);
          handleInstagramImport(text);
        }
      }
    };

    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [description]);

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
      setError("Please enter a title for the photograph.");
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
        description: description.trim() || undefined,
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
        isFooterTrailItem,
        artist: artist.trim() || undefined,
        location: location.trim() || undefined,
        year: year.trim() || undefined,
        aspectRatio,
        instagramUrl: instagramUrl.trim() || undefined,
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
    <div className="bg-[#FAF7F2] border border-[#DDD6CA] p-6 sm:p-8 text-[#1C1917] rounded-2xl shadow-xs font-admin">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#DDD6CA] mb-6">
        <div>
          <h3 className="text-xl sm:text-2xl font-bold text-[#1C1917] tracking-tight">
            Add Photograph
          </h3>
          <p className="text-sm text-stone-600 mt-1">
            Auto-compresses to WebP 82% before publishing to the archive
          </p>
        </div>

        <button
          onClick={onCancel}
          type="button"
          aria-label="Close"
          className="p-2 text-stone-500 hover:text-[#1C1917] hover:bg-[#EAE4D9] rounded-lg transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-sm font-medium rounded-lg">
          {error}
        </div>
      )}

      {/* Instagram Fast Ingest Card */}
      <div className="mb-6 p-4 sm:p-5 bg-gradient-to-br from-pink-50/80 via-[#FAF7F2] to-purple-50/60 border border-pink-200/90 rounded-2xl shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-pink-200/50">
          <div className="flex items-center gap-2">
            <InstagramIcon className="w-5 h-5 text-pink-600 shrink-0" />
            <div>
              <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-stone-900 font-sans block">
                Instagram Direct Importer
              </span>
              <span className="text-[11px] text-stone-500 font-sans">
                Permanent WebP pipeline &bull; No manual image re-downloads needed
              </span>
            </div>
          </div>
          <span className="text-[11px] font-mono text-stone-600 bg-white/80 px-2.5 py-1 rounded-full border border-pink-200 shadow-xs">
            Ctrl+V Image Supported
          </span>
        </div>

        {/* Option A: 1-Click Browser Bookmarklet (Recommended) */}
        <div className="p-3.5 bg-white/90 border border-pink-100 rounded-xl space-y-2.5 shadow-2xs">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <span className="px-2 py-0.5 bg-pink-600 text-white text-[10px] font-bold uppercase tracking-wide rounded">
                Recommended &bull; 1-Click
              </span>
              <span className="text-xs font-bold text-stone-900">
                Instagram Importer Bookmarklet
              </span>
            </div>

            {bookmarkletCode && (
              <button
                type="button"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(bookmarkletCode);
                    setCopiedBookmarklet(true);
                    setTimeout(() => setCopiedBookmarklet(false), 2500);
                  } catch {
                    alert("Could not copy to clipboard. Drag the button directly to your bookmarks bar.");
                  }
                }}
                className="text-[11px] font-semibold text-stone-600 hover:text-stone-900 flex items-center gap-1 transition-colors cursor-pointer"
              >
                {copiedBookmarklet ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700">Script Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Bookmarklet Code</span>
                  </>
                )}
              </button>
            )}
          </div>

          <p className="text-xs text-stone-600 leading-relaxed">
            Instagram blocks outside servers from opening post links. To import with 1 click, drag this button to your browser bookmarks bar once:
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            {bookmarkletCode ? (
              <a
                ref={bookmarkletLinkRef}
                onClick={(e) => {
                  // If clicked inside the admin panel, explain how to use it
                  e.preventDefault();
                  alert(
                    "👉 Drag this button up to your browser Bookmarks Bar (Ctrl+Shift+B to show bookmarks bar).\n\nThen whenever you view any of your photos on Instagram, just click that bookmark! It will automatically load the high-res photo and caption into this uploader."
                  );
                }}
                title="Drag to your Bookmarks Bar!"
                className="px-3.5 py-1.5 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-sans text-xs font-bold rounded-lg shadow-xs flex items-center gap-1.5 cursor-grab active:cursor-grabbing select-none"
              >
                <Bookmark className="w-3.5 h-3.5 fill-current" />
                <span>📸 Import to Azizography</span>
              </a>
            ) : null}

            <span className="text-[11px] text-stone-500 italic">
              (Drag button to bookmarks bar &rarr; Open Instagram post &rarr; Click bookmark)
            </span>
          </div>
        </div>

        {/* Option B: Direct URL or Image Address Ingest */}
        <div className="space-y-1.5">
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone-700">
            Or Paste Image Address / Post CDN Link:
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={instagramInputUrl}
              onChange={(e) => setInstagramInputUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleInstagramImport();
                }
              }}
              placeholder="https://scontent...cdninstagram.com/... or direct image link"
              className="flex-1 px-3.5 py-2 text-xs sm:text-sm bg-white border border-[#DDD6CA] focus:border-pink-500 focus:outline-none rounded-lg text-stone-900 placeholder:text-stone-400 font-mono"
            />
            <button
              type="button"
              disabled={fetchingInstagram || !instagramInputUrl.trim()}
              onClick={() => handleInstagramImport()}
              className="px-4 py-2 bg-[#1C1917] hover:bg-stone-800 disabled:opacity-50 text-white font-sans text-xs sm:text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0 shadow-xs"
            >
              {fetchingInstagram ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Importing...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Fetch Image</span>
                </>
              )}
            </button>
          </div>
        </div>

        {instagramNotice && (
          <div className="p-3 bg-white/95 border border-pink-200 rounded-xl text-xs font-sans text-stone-800 leading-relaxed flex items-start gap-2 shadow-xs">
            <Sparkles className="w-4 h-4 text-pink-600 shrink-0 mt-0.5" />
            <span>{instagramNotice}</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Dropzone & Preview Row */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Media Drop & WebP Stats */}
          <div className="lg:col-span-5 space-y-4">
            {converting ? (
              <div className="w-full h-72 sm:h-80 border-2 border-dashed border-[#DDD6CA] bg-[#F4F0EA] flex flex-col items-center justify-center p-6 text-center rounded-xl">
                <Loader2 className="w-8 h-8 text-[#1C1917] animate-spin mb-3" />
                <span className="font-semibold text-[#1C1917] text-base block mb-1">
                  Optimizing image...
                </span>
                <span className="text-sm text-stone-500 font-mono">
                  Converting to high-efficiency WebP
                </span>
              </div>
            ) : !previewUrl && !externalUrl ? (
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-72 sm:h-80 border-2 border-dashed border-[#DDD6CA] hover:border-[#1C1917] bg-[#F4F0EA]/70 hover:bg-[#EAE4D9]/80 flex flex-col items-center justify-center cursor-pointer p-6 text-center transition-all group rounded-xl"
              >
                <div className="w-12 h-12 rounded-full bg-[#FAF7F2] border border-[#DDD6CA] flex items-center justify-center mb-3 text-stone-800 shadow-xs group-hover:scale-105 transition-transform">
                  <Upload className="w-5 h-5" />
                </div>
                <span className="font-bold text-[#1C1917] text-base block mb-1">
                  Choose image or drag file here
                </span>
                <span className="text-xs sm:text-sm text-stone-500 max-w-[260px] leading-relaxed">
                  JPEG, PNG, HEIC, TIFF (auto-converted to WebP)
                </span>
                <span className="mt-4 px-4 py-2 bg-[#1C1917] text-[#FAF7F2] text-xs sm:text-sm font-semibold rounded-lg group-hover:bg-[#292524] transition-colors shadow-xs">
                  Browse files
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
              <div className="space-y-4">
                <div className="relative w-full h-72 sm:h-80 bg-stone-950 border border-[#DDD6CA] overflow-hidden rounded-xl group shadow-inner">
                  <Image
                    src={previewUrl || externalUrl}
                    alt="Preview"
                    fill
                    className="object-contain"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedFile(null);
                        setPreviewUrl(null);
                        setConversionStats(null);
                        setExternalUrl("");
                      }}
                      className="px-4 py-2 bg-[#FAF7F2] text-[#1C1917] hover:bg-[#EAE4D9] text-sm font-semibold rounded-lg transition-colors cursor-pointer shadow-md"
                    >
                      Remove & Replace
                    </button>
                  </div>
                </div>

                {/* Compression Statistics */}
                {conversionStats && (
                  <div className="p-4 bg-[#F4F0EA] border border-[#DDD6CA] rounded-xl text-sm font-mono text-stone-800">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-stone-600 font-sans font-medium">WebP Compression</span>
                      <span className="text-emerald-700 font-bold font-sans">
                        -{conversionStats.compressionRatio}% smaller
                      </span>
                    </div>
                    <div className="text-xs text-stone-600 space-y-1">
                      <div>File size: <span className="line-through text-stone-400">{formatBytes(conversionStats.originalSize)}</span> → <span className="font-bold text-[#1C1917]">{formatBytes(conversionStats.compressedSize)}</span></div>
                      <div>Render bounds: {conversionStats.width} × {conversionStats.height} px</div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Direct URL input alternative */}
            <div>
              <button
                type="button"
                onClick={() => setUseExternalUrl(!useExternalUrl)}
                className="text-sm font-medium text-stone-600 hover:text-[#1C1917] transition-colors inline-flex items-center gap-1.5 cursor-pointer"
              >
                {useExternalUrl ? (
                  <>
                    <ArrowLeft className="w-4 h-4" />
                    <span>Upload local image file instead</span>
                  </>
                ) : (
                  <>
                    <span>Or link external image URL</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {useExternalUrl && (
                <input
                  type="url"
                  placeholder="https://..."
                  value={externalUrl}
                  onChange={(e) => setExternalUrl(e.target.value)}
                  className="w-full mt-2.5 bg-[#F4F0EA] border border-[#DDD6CA] px-4 py-2.5 text-[#1C1917] placeholder:text-stone-400 text-sm sm:text-base focus:outline-none focus:border-[#1C1917] rounded-lg transition-colors"
                />
              )}
            </div>
          </div>

          {/* Right Column: Metadata Fields */}
          <div className="lg:col-span-7 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-stone-800 mb-1.5">
                Photograph Title *
              </label>
              <input
                required
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. After Hours Arena Tour"
                className="w-full bg-[#F4F0EA] border border-[#DDD6CA] px-4 py-2.5 text-[#1C1917] placeholder:text-stone-400 text-sm sm:text-base focus:outline-none focus:border-[#1C1917] rounded-lg transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-stone-800 mb-1.5">
                Series / Project / Story (Appears in Public Sidebar)
              </label>
              <input
                type="text"
                value={seriesOrProject}
                onChange={(e) => setSeriesOrProject(e.target.value)}
                placeholder="e.g. Jessica Chastain for Marie Claire, Coachella Midnight"
                className="w-full bg-[#F4F0EA] border border-[#DDD6CA] px-4 py-2.5 text-[#1C1917] placeholder:text-stone-400 text-sm sm:text-base focus:outline-none focus:border-[#1C1917] rounded-lg transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-stone-800 mb-1.5">
                Description / Editorial Notes
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Additional context, notes, or caption..."
                className="w-full bg-[#F4F0EA] border border-[#DDD6CA] px-4 py-2.5 text-[#1C1917] placeholder:text-stone-400 text-sm sm:text-base focus:outline-none focus:border-[#1C1917] rounded-lg transition-colors resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-stone-800 mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <InstagramIcon className="w-4 h-4 text-pink-600" />
                  Instagram Post Link
                </span>
                <span className="text-xs text-stone-500 font-normal">Optional</span>
              </label>
              <input
                type="url"
                value={instagramUrl}
                onChange={(e) => setInstagramUrl(e.target.value)}
                placeholder="https://www.instagram.com/p/..."
                className="w-full bg-[#F4F0EA] border border-[#DDD6CA] px-4 py-2.5 text-[#1C1917] placeholder:text-stone-400 text-sm sm:text-base focus:outline-none focus:border-[#1C1917] rounded-lg transition-colors"
              />
              <p className="text-xs text-stone-500 mt-1">
                Allows visitors to click &quot;Like on Instagram ↗&quot; to open the post directly in a new tab.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-stone-800 mb-1.5">
                  Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as GalleryCategory)}
                  className="w-full bg-[#F4F0EA] border border-[#DDD6CA] px-3.5 py-2.5 text-[#1C1917] text-sm sm:text-base focus:outline-none focus:border-[#1C1917] rounded-lg transition-colors cursor-pointer"
                >
                  <option value="people">Portraits & People</option>
                  <option value="concerts">Live & Concerts</option>
                  <option value="singers">Vocalists & Singers</option>
                  <option value="weddings">Weddings & Ceremonies</option>
                  <option value="events">Festivals & Events</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-stone-800 mb-1.5">
                  Aspect Ratio
                </label>
                <select
                  value={aspectRatio}
                  onChange={(e) =>
                    setAspectRatio(e.target.value as "portrait" | "landscape" | "square" | "tall")
                  }
                  className="w-full bg-[#F4F0EA] border border-[#DDD6CA] px-3.5 py-2.5 text-[#1C1917] text-sm sm:text-base focus:outline-none focus:border-[#1C1917] rounded-lg transition-colors cursor-pointer"
                >
                  <option value="portrait">Portrait (3:4)</option>
                  <option value="landscape">Landscape (16:9)</option>
                  <option value="square">Square (1:1)</option>
                  <option value="tall">Tall / Mobile (9:16)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-semibold text-stone-800 mb-1.5">
                  Artist / Subject
                </label>
                <input
                  type="text"
                  value={artist}
                  onChange={(e) => setArtist(e.target.value)}
                  placeholder="e.g. The Weeknd"
                  className="w-full bg-[#F4F0EA] border border-[#DDD6CA] px-3 py-2 text-[#1C1917] placeholder:text-stone-400 text-sm focus:outline-none focus:border-[#1C1917] rounded-lg transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-stone-800 mb-1.5">
                  Location
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. SoFi Stadium, LA"
                  className="w-full bg-[#F4F0EA] border border-[#DDD6CA] px-3 py-2 text-[#1C1917] placeholder:text-stone-400 text-sm focus:outline-none focus:border-[#1C1917] rounded-lg transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-stone-800 mb-1.5">
                  Year
                </label>
                <input
                  type="text"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  placeholder="2026"
                  className="w-full bg-[#F4F0EA] border border-[#DDD6CA] px-3 py-2 text-[#1C1917] placeholder:text-stone-400 text-sm focus:outline-none focus:border-[#1C1917] rounded-lg transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-stone-800 mb-1.5">
                Tags (comma separated)
              </label>
              <input
                type="text"
                value={tagsString}
                onChange={(e) => setTagsString(e.target.value)}
                placeholder="Editorial, Tour, Leica, Direct Flash"
                className="w-full bg-[#F4F0EA] border border-[#DDD6CA] px-4 py-2.5 text-[#1C1917] placeholder:text-stone-400 text-sm sm:text-base focus:outline-none focus:border-[#1C1917] rounded-lg transition-colors"
              />
            </div>

            {/* Feature, Iris & Footer Trail Toggles */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <label className="flex items-center gap-3 p-3.5 bg-[#F4F0EA] border border-[#DDD6CA] rounded-xl cursor-pointer hover:border-stone-400 hover:bg-[#EAE4D9]/80 transition-colors">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="w-4 h-4 accent-stone-900 rounded cursor-pointer"
                />
                <div>
                  <span className="font-semibold text-sm text-[#1C1917] block">
                    Featured Hero
                  </span>
                  <span className="text-xs text-stone-600">
                    Lead highlight in portfolio
                  </span>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3.5 bg-[#F4F0EA] border border-[#DDD6CA] rounded-xl cursor-pointer hover:border-stone-400 hover:bg-[#EAE4D9]/80 transition-colors">
                <input
                  type="checkbox"
                  checked={isIrisItem}
                  onChange={(e) => setIsIrisItem(e.target.checked)}
                  className="w-4 h-4 accent-stone-900 rounded cursor-pointer"
                />
                <div>
                  <span className="font-semibold text-sm text-[#1C1917] block">
                    Iris Aperture Ring
                  </span>
                  <span className="text-xs text-stone-600">
                    Intro sequence
                  </span>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3.5 bg-[#F4F0EA] border border-[#DDD6CA] rounded-xl cursor-pointer hover:border-stone-400 hover:bg-[#EAE4D9]/80 transition-colors">
                <input
                  type="checkbox"
                  checked={isFooterTrailItem}
                  onChange={(e) => setIsFooterTrailItem(e.target.checked)}
                  className="w-4 h-4 accent-stone-900 rounded cursor-pointer"
                />
                <div>
                  <span className="font-semibold text-sm text-[#1C1917] block">
                    Footer Trail
                  </span>
                  <span className="text-xs text-stone-600">
                    Mouse cursor trail
                  </span>
                </div>
              </label>
            </div>

            {/* Collapsible EXIF Camera Specs */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowExifFields(!showExifFields)}
                className="flex items-center gap-2 text-sm font-semibold text-stone-700 hover:text-[#1C1917] transition-colors cursor-pointer"
              >
                <Sliders className="w-4 h-4" />
                <span>{showExifFields ? "Hide Camera Specs" : "Add Camera & Lens Specs (Optional)"}</span>
              </button>

              {showExifFields && (
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-3 p-4 bg-[#F4F0EA] border border-[#DDD6CA] rounded-xl">
                  <div className="col-span-2 sm:col-span-2">
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Camera Body
                    </label>
                    <input
                      type="text"
                      value={camera}
                      onChange={(e) => setCamera(e.target.value)}
                      placeholder="Sony A1 / Leica M11"
                      className="w-full bg-[#FAF7F2] border border-[#DDD6CA] px-3 py-1.5 text-[#1C1917] text-sm rounded-lg focus:outline-none focus:border-[#1C1917]"
                    />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Lens
                    </label>
                    <input
                      type="text"
                      value={lens}
                      onChange={(e) => setLens(e.target.value)}
                      placeholder="50mm f/1.2"
                      className="w-full bg-[#FAF7F2] border border-[#DDD6CA] px-3 py-1.5 text-[#1C1917] text-sm rounded-lg focus:outline-none focus:border-[#1C1917]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      ISO
                    </label>
                    <input
                      type="text"
                      value={iso}
                      onChange={(e) => setIso(e.target.value)}
                      placeholder="800"
                      className="w-full bg-[#FAF7F2] border border-[#DDD6CA] px-3 py-1.5 text-[#1C1917] text-sm rounded-lg focus:outline-none focus:border-[#1C1917]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Aperture
                    </label>
                    <input
                      type="text"
                      value={aperture}
                      onChange={(e) => setAperture(e.target.value)}
                      placeholder="f/2.8"
                      className="w-full bg-[#FAF7F2] border border-[#DDD6CA] px-3 py-1.5 text-[#1C1917] text-sm rounded-lg focus:outline-none focus:border-[#1C1917]"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-5 border-t border-[#DDD6CA]">
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 text-stone-600 hover:text-[#1C1917] text-sm sm:text-base font-semibold transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={uploading || converting}
            className="px-6 py-2.5 bg-[#1C1917] hover:bg-[#292524] text-[#FAF7F2] text-sm sm:text-base font-semibold transition-colors disabled:opacity-50 cursor-pointer rounded-lg shadow-sm"
          >
            {uploading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-[#FAF7F2]" />
                <span>Publishing to Archive...</span>
              </span>
            ) : (
              <span>Publish Photograph</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
