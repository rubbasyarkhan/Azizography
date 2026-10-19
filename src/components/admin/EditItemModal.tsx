"use client";

import React, { useState } from "react";
import Image from "next/image";
import { GalleryItem, GalleryCategory } from "@/types/gallery";
import { X, Check, Camera, Trash2 } from "lucide-react";

interface EditItemModalProps {
  item: GalleryItem | null;
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
  if (!item) return null;

  const [title, setTitle] = useState(item.title);
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
  const [tagsString, setTagsString] = useState(item.tags?.join(", ") || "");

  // EXIF
  const [camera, setCamera] = useState(item.exif?.camera || "");
  const [lens, setLens] = useState(item.exif?.lens || "");
  const [iso, setIso] = useState(item.exif?.iso || "");
  const [aperture, setAperture] = useState(item.exif?.aperture || "");
  const [shutter, setShutter] = useState(item.exif?.shutter || "");

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const tags = tagsString
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    onSave(item.id, {
      title,
      seriesOrProject: seriesOrProject.trim() || undefined,
      category,
      artist: artist.trim() || undefined,
      location: location.trim() || undefined,
      year: year.trim() || undefined,
      aspectRatio,
      isFeatured,
      isVisible,
      isIrisItem,
      tags: tags.length > 0 ? tags : undefined,
      exif: {
        camera,
        lens,
        iso,
        aperture,
        shutter,
      },
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 select-none">
      <div className="bg-[#111111] border border-white/20 p-6 sm:p-8 font-mono-brutal text-xs max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
          <div className="flex items-center gap-3">
            <span className="text-[10px] text-red-500 font-bold uppercase tracking-widest">
              // EDIT METADATA
            </span>
            <span className="text-white font-bold">#{item.orderIndex + 1}</span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 border border-white/10 hover:border-white text-neutral-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="flex gap-4 items-center p-3 bg-black border border-white/10">
            <div className="relative w-20 h-20 shrink-0 bg-neutral-900 border border-white/15">
              <Image
                src={item.imageUrl}
                alt={item.title}
                fill
                className="object-cover"
              />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] text-neutral-400 uppercase">Storage Path:</span>
              <p className="text-[11px] text-white truncate font-mono">{item.storagePath}</p>
            </div>
          </div>

          <div>
            <label className="block text-[10px] uppercase text-neutral-400 tracking-wider mb-1">
              Title
            </label>
            <input
              required
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-[#181818] border border-white/10 px-3 py-2 text-white text-xs uppercase focus:outline-none focus:border-white font-bold"
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase text-neutral-400 tracking-wider mb-1">
              Series / Project / Story Name (Appears in Sidebar)
            </label>
            <input
              type="text"
              placeholder="e.g. Netflix x The Four Seasons, Taika Waititi for WIRED..."
              value={seriesOrProject}
              onChange={(e) => setSeriesOrProject(e.target.value)}
              className="w-full bg-[#181818] border border-white/10 px-3 py-2 text-white text-xs focus:outline-none focus:border-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] uppercase text-neutral-400 tracking-wider mb-1">
                Category
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] uppercase text-neutral-400 tracking-wider mb-1">
                Artist / Subject
              </label>
              <input
                type="text"
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
                className="w-full bg-[#181818] border border-white/10 px-3 py-2 text-white text-xs uppercase focus:outline-none focus:border-white"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase text-neutral-400 tracking-wider mb-1">
                Location & Venue
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-[#181818] border border-white/10 px-3 py-2 text-white text-xs uppercase focus:outline-none focus:border-white"
              />
            </div>
          </div>

          <div className="border-t border-white/10 pt-3">
            <span className="text-[10px] text-neutral-400 uppercase tracking-widest block mb-2">
              EXIF Info
            </span>
            <div className="grid grid-cols-3 gap-2">
              <input
                placeholder="Camera"
                value={camera}
                onChange={(e) => setCamera(e.target.value)}
                className="bg-[#181818] border border-white/10 px-2 py-1 text-white text-[11px]"
              />
              <input
                placeholder="Lens"
                value={lens}
                onChange={(e) => setLens(e.target.value)}
                className="bg-[#181818] border border-white/10 px-2 py-1 text-white text-[11px]"
              />
              <input
                placeholder="ISO"
                value={iso}
                onChange={(e) => setIso(e.target.value)}
                className="bg-[#181818] border border-white/10 px-2 py-1 text-white text-[11px]"
              />
            </div>
          </div>

          <div className="flex items-center gap-6 border-t border-white/10 pt-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isVisible}
                onChange={(e) => setIsVisible(e.target.checked)}
                className="accent-red-600"
              />
              <span className="text-[10px] uppercase font-bold text-neutral-300">
                Visible on Live Site
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="accent-red-600"
              />
              <span className="text-[10px] uppercase font-bold text-neutral-300">
                Featured Card
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isIrisItem}
                onChange={(e) => setIsIrisItem(e.target.checked)}
                className="accent-red-600"
              />
              <span className="text-[10px] uppercase font-bold text-red-400">
                ★ Include in Iris Animation
              </span>
            </label>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={() => {
                if (confirm(`Are you sure you want to delete "${item.title}"?`)) {
                  onDelete(item.id);
                  onClose();
                }
              }}
              className="text-red-400 hover:text-red-300 flex items-center gap-1.5 uppercase text-xs"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Asset</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-white/10 hover:border-white text-neutral-400 hover:text-white uppercase text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-white hover:bg-neutral-200 text-black font-bold uppercase text-xs flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Save Changes</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
