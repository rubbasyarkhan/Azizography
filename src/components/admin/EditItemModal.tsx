"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { GalleryItem, GalleryCategory } from "@/types/gallery";
import {
  X,
  Trash2,
} from "lucide-react";
import InstagramIcon from "@/components/icons/InstagramIcon";

interface EditItemModalProps {
  item: GalleryItem;
  onClose: () => void;
  onSave: (id: string, updates: Partial<GalleryItem>) => void;
  onDelete: (id: string) => void;
}

export default function EditItemModal({
  item,
  onClose,
  onSave,
  onDelete,
}: EditItemModalProps) {
  const [title, setTitle] = useState(item.title);
  const [description, setDescription] = useState(item.description || "");
  const [seriesOrProject, setSeriesOrProject] = useState(item.seriesOrProject || "");
  const [category, setCategory] = useState<GalleryCategory>(item.category);
  const [artist, setArtist] = useState(item.artist || "");
  const [location, setLocation] = useState(item.location || "");
  const [year, setYear] = useState(item.year || "");
  const [aspectRatio, setAspectRatio] = useState<"portrait" | "landscape" | "square" | "tall">(
    item.aspectRatio || "portrait"
  );
  const [isFeatured, setIsFeatured] = useState(item.isFeatured);
  const [isVisible, setIsVisible] = useState(item.isVisible);
  const [isIrisItem, setIsIrisItem] = useState(Boolean(item.isIrisItem));
  const [isFooterTrailItem, setIsFooterTrailItem] = useState(Boolean(item.isFooterTrailItem));
  const [tagsString, setTagsString] = useState(item.tags?.join(", ") || "");
  const [instagramUrl, setInstagramUrl] = useState(item.instagramUrl || "");

  // EXIF
  const [camera, setCamera] = useState(item.exif?.camera || "");
  const [lens, setLens] = useState(item.exif?.lens || "");
  const [iso, setIso] = useState(item.exif?.iso || "");
  const [aperture, setAperture] = useState(item.exif?.aperture || "");
  const [shutter, setShutter] = useState(item.exif?.shutter || "");

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

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const tags = tagsString
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const cleanTitle = title.trim() || item.seriesOrProject || "Untitled Photograph";

    const cleanExif: Record<string, string> = {};
    if (camera.trim()) cleanExif.camera = camera.trim();
    if (lens.trim()) cleanExif.lens = lens.trim();
    if (iso.trim()) cleanExif.iso = iso.trim();
    if (aperture.trim()) cleanExif.aperture = aperture.trim();
    if (shutter.trim()) cleanExif.shutter = shutter.trim();
    const hasExif = Object.keys(cleanExif).length > 0;

    onSave(item.id, {
      title: cleanTitle,
      description: description.trim() || undefined,
      seriesOrProject: seriesOrProject.trim() || undefined,
      category: category || "people",
      artist: artist.trim() || undefined,
      location: location.trim() || undefined,
      year: year.trim() || undefined,
      aspectRatio,
      instagramUrl: instagramUrl.trim() || undefined,
      isFeatured,
      isVisible,
      isIrisItem,
      isFooterTrailItem,
      tags: tags.length > 0 ? tags : undefined,
      exif: hasExif ? cleanExif : undefined,
    });
    onClose();
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
        onWheel={(e) => e.stopPropagation()}
        className="bg-[#FAF7F2] border border-[#DDD6CA] p-6 sm:p-8 text-[#1C1917] max-w-2xl w-full max-h-[92vh] overflow-y-auto overscroll-contain rounded-2xl shadow-2xl"
      >
        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#DDD6CA] mb-5">
          <div>
            <h3 className="text-xl sm:text-2xl font-bold text-[#1C1917] tracking-tight">
              Edit Photograph
            </h3>
            <p className="text-sm text-stone-600 mt-0.5">
              Update metadata, exhibition category, and EXIF specs
            </p>
          </div>

          <button
            onClick={onClose}
            type="button"
            aria-label="Close"
            className="p-2 text-stone-500 hover:text-[#1C1917] hover:bg-[#EAE4D9] rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          {/* Visual Preview Banner */}
          <div className="flex items-center gap-4 p-3.5 bg-[#F4F0EA] border border-[#DDD6CA] rounded-xl">
            <div className="relative w-14 h-16 shrink-0 bg-stone-900 border border-[#DDD6CA] overflow-hidden rounded-md">
              <Image
                src={item.imageUrl}
                alt={item.title}
                fill
                sizes="80px"
                className="object-cover"
              />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-xs text-stone-500 font-mono block">
                ORDER #{item.orderIndex + 1}
              </span>
              <h4 className="text-sm sm:text-base font-semibold text-[#1C1917] truncate">
                {item.title}
              </h4>
              <p className="text-xs text-stone-600 truncate">
                {item.seriesOrProject || item.artist || "Independent Artwork"}
              </p>
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-stone-800 mb-1.5 flex items-center justify-between">
                <span>Photograph Title</span>
                <span className="text-xs text-stone-500 font-normal">Optional</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. After Hours Arena Tour"
                className="w-full bg-[#F4F0EA] border border-[#DDD6CA] px-3.5 py-2.5 text-[#1C1917] text-sm sm:text-base rounded-lg focus:outline-none focus:border-[#1C1917] transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-stone-800 mb-1.5 flex items-center justify-between">
                <span>Series / Project / Story (Appears in Portfolio Sidebar)</span>
                <span className="text-xs text-stone-500 font-normal">Optional</span>
              </label>
              <input
                type="text"
                value={seriesOrProject}
                onChange={(e) => setSeriesOrProject(e.target.value)}
                placeholder="e.g. Jessica Chastain for Marie Claire, Coachella Midnight"
                className="w-full bg-[#F4F0EA] border border-[#DDD6CA] px-3.5 py-2.5 text-[#1C1917] placeholder:text-stone-400 text-sm sm:text-base rounded-lg focus:outline-none focus:border-[#1C1917] transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-stone-800 mb-1.5 flex items-center justify-between">
                <span>Description / Editorial Notes</span>
                <span className="text-xs text-stone-500 font-normal">Optional</span>
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Additional context, notes, or caption..."
                className="w-full bg-[#F4F0EA] border border-[#DDD6CA] px-3.5 py-2.5 text-[#1C1917] placeholder:text-stone-400 text-sm sm:text-base rounded-lg focus:outline-none focus:border-[#1C1917] transition-colors resize-none"
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
                className="w-full bg-[#F4F0EA] border border-[#DDD6CA] px-3.5 py-2.5 text-[#1C1917] placeholder:text-stone-400 text-sm sm:text-base rounded-lg focus:outline-none focus:border-[#1C1917] transition-colors"
              />
              <p className="text-xs text-stone-500 mt-1">
                When provided, visitors will see &quot;Like on Instagram ↗&quot; next to the photo description.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-sm font-semibold text-stone-800 mb-1.5 flex items-center justify-between">
                  <span>Category</span>
                  <span className="text-xs text-stone-500 font-normal">Optional</span>
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
                <label className="block text-sm font-semibold text-stone-800 mb-1.5 flex items-center justify-between">
                  <span>Aspect Ratio</span>
                  <span className="text-xs text-stone-500 font-normal">Optional</span>
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
                <label className="block text-sm font-semibold text-stone-800 mb-1.5 flex items-center justify-between">
                  <span>Artist / Subject</span>
                  <span className="text-xs text-stone-500 font-normal">Optional</span>
                </label>
                <input
                  type="text"
                  value={artist}
                  onChange={(e) => setArtist(e.target.value)}
                  placeholder="e.g. Billie Eilish"
                  className="w-full bg-[#F4F0EA] border border-[#DDD6CA] px-3 py-2 text-[#1C1917] placeholder:text-stone-400 text-sm rounded-lg focus:outline-none focus:border-[#1C1917] transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-stone-800 mb-1.5 flex items-center justify-between">
                  <span>Location</span>
                  <span className="text-xs text-stone-500 font-normal">Optional</span>
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. SoFi Stadium, LA"
                  className="w-full bg-[#F4F0EA] border border-[#DDD6CA] px-3 py-2 text-[#1C1917] placeholder:text-stone-400 text-sm rounded-lg focus:outline-none focus:border-[#1C1917] transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-stone-800 mb-1.5 flex items-center justify-between">
                  <span>Year</span>
                  <span className="text-xs text-stone-500 font-normal">Optional</span>
                </label>
                <input
                  type="text"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  placeholder="2026"
                  className="w-full bg-[#F4F0EA] border border-[#DDD6CA] px-3 py-2 text-[#1C1917] placeholder:text-stone-400 text-sm rounded-lg focus:outline-none focus:border-[#1C1917] transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-stone-800 mb-1.5 flex items-center justify-between">
                <span>Tags (comma separated)</span>
                <span className="text-xs text-stone-500 font-normal">Optional</span>
              </label>
              <input
                type="text"
                value={tagsString}
                onChange={(e) => setTagsString(e.target.value)}
                placeholder="Editorial, Tour, Leica, Direct Flash"
                className="w-full bg-[#F4F0EA] border border-[#DDD6CA] px-3.5 py-2.5 text-[#1C1917] placeholder:text-stone-400 text-sm sm:text-base rounded-lg focus:outline-none focus:border-[#1C1917] transition-colors"
              />
            </div>

            {/* Visibility & Curation Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
              <label className="flex items-center gap-3 p-3 bg-[#F4F0EA] border border-[#DDD6CA] rounded-xl cursor-pointer hover:border-stone-400 hover:bg-[#EAE4D9]/80 transition-colors">
                <input
                  type="checkbox"
                  checked={isVisible}
                  onChange={(e) => setIsVisible(e.target.checked)}
                  className="w-4 h-4 accent-stone-900 rounded cursor-pointer"
                />
                <div>
                  <span className="font-semibold text-sm text-[#1C1917] block">
                    Public
                  </span>
                  <span className="text-xs text-stone-600">
                    Live site
                  </span>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 bg-[#F4F0EA] border border-[#DDD6CA] rounded-xl cursor-pointer hover:border-stone-400 hover:bg-[#EAE4D9]/80 transition-colors">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="w-4 h-4 accent-stone-900 rounded cursor-pointer"
                />
                <div>
                  <span className="font-semibold text-sm text-[#1C1917] block">
                    Featured
                  </span>
                  <span className="text-xs text-stone-600">
                    Hero highlight
                  </span>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 bg-[#F4F0EA] border border-[#DDD6CA] rounded-xl cursor-pointer hover:border-stone-400 hover:bg-[#EAE4D9]/80 transition-colors">
                <input
                  type="checkbox"
                  checked={isIrisItem}
                  onChange={(e) => setIsIrisItem(e.target.checked)}
                  className="w-4 h-4 accent-stone-900 rounded cursor-pointer"
                />
                <div>
                  <span className="font-semibold text-sm text-[#1C1917] block">
                    Iris Intro
                  </span>
                  <span className="text-xs text-stone-600">
                    Aperture ring
                  </span>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 bg-[#F4F0EA] border border-[#DDD6CA] rounded-xl cursor-pointer hover:border-stone-400 hover:bg-[#EAE4D9]/80 transition-colors">
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
                    Cursor animation
                  </span>
                </div>
              </label>
            </div>

            {/* EXIF Camera Specs */}
            <div className="pt-1">
              <span className="block text-sm font-semibold text-stone-800 mb-2">
                Camera & Lens Technical EXIF (Optional)
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 p-3.5 bg-[#F4F0EA] border border-[#DDD6CA] rounded-xl">
                <div className="col-span-2 sm:col-span-2">
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Camera
                  </label>
                  <input
                    type="text"
                    value={camera}
                    onChange={(e) => setCamera(e.target.value)}
                    placeholder="Leica M11"
                    className="w-full bg-[#FAF7F2] border border-[#DDD6CA] px-2.5 py-1.5 text-[#1C1917] text-sm rounded-md focus:outline-none focus:border-[#1C1917]"
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
                    placeholder="50mm f/0.95"
                    className="w-full bg-[#FAF7F2] border border-[#DDD6CA] px-2.5 py-1.5 text-[#1C1917] text-sm rounded-md focus:outline-none focus:border-[#1C1917]"
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
                    className="w-full bg-[#FAF7F2] border border-[#DDD6CA] px-2.5 py-1.5 text-[#1C1917] text-sm rounded-md focus:outline-none focus:border-[#1C1917]"
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
                    placeholder="f/1.2"
                    className="w-full bg-[#FAF7F2] border border-[#DDD6CA] px-2.5 py-1.5 text-[#1C1917] text-sm rounded-md focus:outline-none focus:border-[#1C1917]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-5 border-t border-[#DDD6CA]">
            <button
              type="button"
              onClick={() => {
                if (confirm(`Permanently delete "${item.title}" from the portfolio?`)) {
                  onDelete(item.id);
                  onClose();
                }
              }}
              className="flex items-center gap-1.5 px-3 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 text-sm font-semibold rounded-lg transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete Photo</span>
            </button>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-stone-600 hover:text-[#1C1917] text-sm sm:text-base font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="px-6 py-2 bg-[#1C1917] hover:bg-[#292524] text-[#FAF7F2] text-sm sm:text-base font-semibold transition-colors cursor-pointer rounded-lg shadow-sm"
              >
                Save Changes
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
