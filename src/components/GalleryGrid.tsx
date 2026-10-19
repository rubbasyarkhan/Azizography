"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { GalleryItem } from "@/types/gallery";
import { Maximize2, MapPin, Calendar, Camera } from "lucide-react";

interface GalleryGridProps {
  items: GalleryItem[];
  onOpenLightbox: (item: GalleryItem) => void;
}

export default function GalleryGrid({ items, onOpenLightbox }: GalleryGridProps) {
  if (items.length === 0) {
    return (
      <div className="w-full py-24 text-center border-b border-white/10">
        <p className="font-mono-brutal text-sm text-neutral-500 uppercase tracking-widest">
          // NO ARCHIVE ENTRIES FOUND IN THIS CATEGORY //
        </p>
      </div>
    );
  }

  // Helper for dynamic card height / aspect ratio classes in brutalist masonry
  const getAspectRatioClass = (aspect?: string, index?: number) => {
    if (aspect === "tall") return "aspect-[9/16]";
    if (aspect === "portrait") return "aspect-[3/4]";
    if (aspect === "landscape") return "aspect-[16/10]";
    if (aspect === "square") return "aspect-square";
    // Default rhythm based on index
    if (index !== undefined) {
      if (index % 5 === 0) return "aspect-[3/4] md:row-span-2";
      if (index % 5 === 2) return "aspect-[16/10] md:col-span-2";
      if (index % 5 === 3) return "aspect-square";
    }
    return "aspect-[4/5]";
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 md:px-8 py-10">
      {/* Brutalist Masonry / Modular Grid */}
      <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
        {items.map((item, index) => {
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: (index % 4) * 0.1 }}
              onClick={() => onOpenLightbox(item)}
              className="group relative cursor-pointer overflow-hidden bg-[#111111] border border-white/10 hover:border-white/50 transition-all duration-300 break-inside-avoid"
            >
              {/* Image Container with high contrast styling */}
              <div className={`relative w-full overflow-hidden ${getAspectRatioClass(item.aspectRatio, index)}`}>
                <Image
                  src={item.imageUrl}
                  alt={item.title}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-105 filter grayscale contrast-125 group-hover:grayscale-0 group-hover:contrast-105"
                  loading={index < 4 ? "eager" : "lazy"}
                />

                {/* Film grain vignette on hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-60 group-hover:opacity-90 transition-opacity duration-300" />

                {/* Top Corner Badge: Order Index & Category */}
                <div className="absolute top-3 left-3 right-3 flex items-center justify-between text-[10px] font-mono-brutal uppercase tracking-widest z-10">
                  <span className="px-2 py-0.5 bg-black/80 backdrop-blur-sm border border-white/15 text-neutral-300">
                    #{String(item.orderIndex + 1).padStart(2, "0")}
                  </span>
                  
                  <span className="px-2 py-0.5 bg-red-600/90 text-white font-bold tracking-wider">
                    {item.category}
                  </span>
                </div>

                {/* Expand icon pill on hover */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 scale-90 group-hover:scale-100 z-10 pointer-events-none">
                  <div className="w-12 h-12 rounded-none bg-black/80 backdrop-blur-md border border-white flex items-center justify-center text-white shadow-2xl">
                    <Maximize2 className="w-5 h-5" />
                  </div>
                </div>

                {/* Bottom Information Drawer */}
                <div className="absolute bottom-0 inset-x-0 p-4 md:p-5 z-10 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                  {item.artist && (
                    <span className="text-[11px] font-serif-elegant italic text-neutral-300 block mb-0.5">
                      {item.artist}
                    </span>
                  )}
                  
                  <h3 className="font-display text-lg md:text-xl font-bold uppercase tracking-tight text-white leading-tight">
                    {item.title}
                  </h3>

                  {/* Metadata Row: Location & Year */}
                  <div className="flex items-center gap-4 text-[10px] font-mono-brutal text-neutral-400 mt-2 pt-2 border-t border-white/10 opacity-80 group-hover:opacity-100">
                    {item.location && (
                      <span className="flex items-center gap-1 truncate">
                        <MapPin className="w-3 h-3 text-red-500 shrink-0" />
                        <span className="truncate">{item.location}</span>
                      </span>
                    )}
                    {item.year && (
                      <span className="shrink-0 text-neutral-500 font-bold">
                        {item.year}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
