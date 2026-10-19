"use client";

import React, { useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { GalleryItem } from "@/types/gallery";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Camera,
  Calendar,
  MapPin,
  Tag,
  Maximize2,
  ExternalLink,
} from "lucide-react";

interface LightboxModalProps {
  item: GalleryItem | null;
  items: GalleryItem[];
  onClose: () => void;
  onSelect: (item: GalleryItem) => void;
}

export default function LightboxModal({
  item,
  items,
  onClose,
  onSelect,
}: LightboxModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!item) return;
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "ArrowLeft") handlePrev();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [item, items]);

  if (!item) return null;

  const currentIndex = items.findIndex((i) => i.id === item.id);

  const handleNext = () => {
    if (items.length <= 1) return;
    const nextIdx = (currentIndex + 1) % items.length;
    onSelect(items[nextIdx]);
  };

  const handlePrev = () => {
    if (items.length <= 1) return;
    const prevIdx = (currentIndex - 1 + items.length) % items.length;
    onSelect(items[prevIdx]);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-xl p-4 md:p-8 select-none"
      >
        {/* Top Control Bar */}
        <div className="absolute top-4 left-4 right-4 z-50 flex items-center justify-between text-xs font-mono-brutal text-neutral-400">
          <div className="flex items-center gap-3">
            <span className="text-white font-bold tracking-widest uppercase">
              AZIZOGRAPHY // LIGHTBOX
            </span>
            <span className="text-neutral-500">|</span>
            <span className="text-red-500 font-bold uppercase tracking-wider">
              {item.category}
            </span>
            <span className="hidden sm:inline text-neutral-600">
              [{currentIndex + 1} / {items.length}]
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.open(item.imageUrl, "_blank")}
              title="Open full resolution in new tab"
              className="p-2 border border-white/10 hover:border-white/40 text-neutral-300 hover:text-white transition-all bg-neutral-900/60"
            >
              <ExternalLink className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              title="Close [ESC]"
              className="flex items-center gap-1.5 px-3 py-1.5 border border-white/20 hover:border-white bg-white/5 hover:bg-white text-white hover:text-black transition-all"
            >
              <X className="w-4 h-4" />
              <span className="text-[11px] font-bold uppercase tracking-wider">CLOSE</span>
            </button>
          </div>
        </div>

        {/* Navigation arrows */}
        {items.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              aria-label="Previous Image"
              className="absolute left-4 top-1/2 -translate-y-1/2 z-40 p-3 md:p-4 bg-black/60 hover:bg-white hover:text-black border border-white/10 hover:border-white text-white transition-all duration-200"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <button
              onClick={handleNext}
              aria-label="Next Image"
              className="absolute right-4 top-1/2 -translate-y-1/2 z-40 p-3 md:p-4 bg-black/60 hover:bg-white hover:text-black border border-white/10 hover:border-white text-white transition-all duration-200"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}

        {/* Center Stage: Image & Metadata Split View */}
        <div className="relative w-full max-w-7xl max-h-[88vh] flex flex-col lg:flex-row items-center justify-center gap-6 mt-10">
          {/* Main Visual */}
          <div className="relative flex-1 w-full h-[55vh] lg:h-[80vh] flex items-center justify-center overflow-hidden bg-neutral-950/80 border border-white/10">
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="relative w-full h-full"
            >
              <Image
                src={item.imageUrl}
                alt={item.title}
                fill
                sizes="(max-width: 1200px) 100vw, 80vw"
                className="object-contain p-2"
                priority
              />
            </motion.div>
          </div>

          {/* Brutalist Metadata Drawer */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-full lg:w-80 shrink-0 bg-[#0d0d0d] border border-white/10 p-6 flex flex-col justify-between font-mono-brutal text-xs max-h-[80vh] overflow-y-auto"
          >
            <div className="space-y-6">
              <div>
                <span className="text-[10px] text-red-500 font-bold uppercase tracking-widest block mb-1">
                  // {item.category}
                </span>
                <h2 className="font-display text-2xl font-black uppercase text-white tracking-tight leading-tight">
                  {item.title}
                </h2>
                {item.artist && (
                  <p className="text-neutral-400 font-serif-elegant italic text-base mt-1">
                    Featured: {item.artist}
                  </p>
                )}
              </div>

              {/* Geographic / Time Data */}
              <div className="space-y-2 border-t border-white/10 pt-4">
                {item.location && (
                  <div className="flex items-center gap-2 text-neutral-300">
                    <MapPin className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
                    <span>{item.location}</span>
                  </div>
                )}
                {item.year && (
                  <div className="flex items-center gap-2 text-neutral-300">
                    <Calendar className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
                    <span>Captured in {item.year}</span>
                  </div>
                )}
              </div>

              {/* EXIF Data Panel */}
              {item.exif && (
                <div className="border-t border-white/10 pt-4 space-y-2">
                  <div className="flex items-center gap-2 text-white font-bold text-[11px] uppercase tracking-wider">
                    <Camera className="w-3.5 h-3.5 text-red-500" />
                    <span>Camera & Lens EXIF</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-neutral-400">
                    {item.exif.camera && (
                      <div className="col-span-2">
                        <span className="text-neutral-500 block text-[9px] uppercase">Body</span>
                        <span className="text-neutral-200">{item.exif.camera}</span>
                      </div>
                    )}
                    {item.exif.lens && (
                      <div className="col-span-2">
                        <span className="text-neutral-500 block text-[9px] uppercase">Glass</span>
                        <span className="text-neutral-200">{item.exif.lens}</span>
                      </div>
                    )}
                    {item.exif.aperture && (
                      <div>
                        <span className="text-neutral-500 block text-[9px] uppercase">Aperture</span>
                        <span className="text-neutral-200">{item.exif.aperture}</span>
                      </div>
                    )}
                    {item.exif.shutter && (
                      <div>
                        <span className="text-neutral-500 block text-[9px] uppercase">Shutter</span>
                        <span className="text-neutral-200">{item.exif.shutter}</span>
                      </div>
                    )}
                    {item.exif.iso && (
                      <div>
                        <span className="text-neutral-500 block text-[9px] uppercase">ISO</span>
                        <span className="text-neutral-200">{item.exif.iso}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Tags */}
              {item.tags && item.tags.length > 0 && (
                <div className="border-t border-white/10 pt-4">
                  <span className="text-[10px] text-neutral-500 uppercase tracking-widest block mb-2">
                    Visual Tags
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {item.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 bg-white/5 border border-white/10 text-[10px] text-neutral-300 font-mono-brutal"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-8 pt-4 border-t border-white/10 flex items-center justify-between text-[10px] text-neutral-500">
              <span>ORDER POS: #{item.orderIndex + 1}</span>
              <span>AZIZOGRAPHY ARCHIVE</span>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
