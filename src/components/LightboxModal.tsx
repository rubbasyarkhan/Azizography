"use client";

import React, { useState, useMemo, useEffect } from "react";
import { GalleryItem } from "@/types/gallery";
import { getOptimizedImageUrl } from "@/lib/image-utils";
import FlexCarousel from "./FlexCarousel";
import { X, ArrowUpRight } from "lucide-react";
import InstagramIcon from "@/components/icons/InstagramIcon";

interface LightboxModalProps {
  item: GalleryItem | null;
  items: GalleryItem[];
  onClose: () => void;
  onSelect?: (item: GalleryItem) => void;
}

export default function LightboxModal({
  item,
  items,
  onClose,
  onSelect,
}: LightboxModalProps) {
  const [carouselReady, setCarouselReady] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    if (!item) {
      setCarouselReady(false);
      return;
    }

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const lenis = (window as unknown as { __lenis?: { stop: () => void; start: () => void } }).__lenis;
    lenis?.stop();

    return () => {
      document.body.style.overflow = originalOverflow;
      lenis?.start();
    };
  }, [item]);

  const initialIndex = useMemo(() => {
    if (!item) return 0;
    const idx = items.findIndex((i) => i.id === item.id);
    return idx >= 0 ? idx : 0;
  }, [item, items]);

  // Map gallery items into FlexCarousel items format with precomputed true aspects
  const carouselItems = useMemo(() => {
    return items.map((itm) => {
      let aspect = 0.75;
      if (itm.width && itm.height) {
        aspect = itm.width / itm.height;
      } else if (itm.aspectRatio === "landscape") {
        aspect = 1.5;
      } else if (itm.aspectRatio === "square") {
        aspect = 1.0;
      } else if (itm.aspectRatio === "tall") {
        aspect = 0.5625;
      } else if (itm.aspectRatio === "portrait") {
        aspect = 0.75;
      }

      return {
        src: getOptimizedImageUrl(itm.imageUrl, 1600, 85),
        alt: itm.title,
        title: itm.title,
        subtitle: itm.description || itm.seriesOrProject || itm.artist || itm.location || "",
        aspect,
        width: itm.width || (aspect > 1 ? 1600 : 1200),
        height: itm.height || (aspect > 1 ? 1067 : 1600),
        instagramUrl: itm.instagramUrl,
      };
    });
  }, [items]);

  if (!item) return null;

  return (
    <div
      data-lenis-prevent="true"
      className="fixed inset-0 z-50 flex flex-col bg-[#070707]/98 backdrop-blur-2xl select-none animate-in fade-in duration-150"
    >
      {/* Sleek Minimal Top Bar */}
      <div className="relative z-40 w-full px-6 py-4 flex items-center justify-between border-b border-white/[0.08] bg-black/40">
        <div className="flex items-center gap-3">
          <span className="font-syne font-medium text-xs sm:text-sm tracking-[0.22em] text-white uppercase">
            AZIZOGRAPHY // CAROUSEL
          </span>
          <span className="text-neutral-500 hidden sm:inline">•</span>
          <span className="text-neutral-400 font-syne text-xs hidden sm:inline tracking-wider">
            Drag, scroll or click card to expand
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white text-white hover:text-black font-syne text-[11px] uppercase tracking-widest font-semibold transition-all cursor-pointer border border-white/20 rounded"
          >
            <X className="w-4 h-4" />
            <span>CLOSE [ESC]</span>
          </button>
        </div>
      </div>

      {/* Main Stage: Instant Hero Preview + Interactive WebGL FlexCarousel */}
      <div className="flex-1 w-full h-full relative overflow-hidden flex items-center justify-center">
        {/* Instant 0ms Zero-Latency Hero Preview (Eliminates empty skeleton/canvas delay) */}
        <div
          className={`absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-20 transition-opacity duration-300 ${
            carouselReady ? "opacity-0 invisible" : "opacity-100 visible"
          }`}
          aria-hidden={carouselReady}
        >
          <div className="relative flex flex-col items-center justify-center max-w-[90vw] max-h-[75vh]">
            <img
              src={getOptimizedImageUrl(item.imageUrl, 1400, 80)}
              alt={item.title}
              decoding="sync"
              fetchPriority="high"
              className="max-h-[62vh] max-w-[85vw] object-contain shadow-2xl rounded"
            />
            <div className="mt-4 text-center">
              <h2 className="font-artistic text-xl sm:text-2xl italic text-white/95 font-normal tracking-wide">
                {item.title}
              </h2>
              {(item.seriesOrProject || item.description || item.artist) && (
                <p className="font-syne text-[11px] uppercase tracking-[0.22em] text-neutral-400 mt-1">
                  {item.seriesOrProject || item.description || item.artist}
                </p>
              )}
              {item.instagramUrl && (
                <div className="mt-2.5">
                  <a
                    href={item.instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-sans text-pink-300 hover:text-white underline underline-offset-4"
                  >
                    <InstagramIcon className="w-3.5 h-3.5 text-pink-400" />
                    <span>Like on Instagram</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Fullscreen Interactive WebGL FlexCarousel */}
        <div
          className={`w-full h-full relative transition-opacity duration-300 ${
            carouselReady ? "opacity-100" : "opacity-0"
          }`}
        >
          <FlexCarousel
            items={carouselItems}
            initialIndex={initialIndex}
            preset="gallery"
            intro="none"
            cardHeight={0.65}
            gap={20}
            radius={4}
            fit="natural"
            squeeze={0}
            tilt={0}
            bend={0.16}
            dispersion={0}
            focusOnClick={true}
            captions={true}
            captureWheel={true}
            onReady={() => setCarouselReady(true)}
            onChange={(index: number) => {
              if (items[index] && onSelect && items[index].id !== item.id) {
                onSelect(items[index]);
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}
