"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";
import Image from "next/image";

import { subscribeToIrisItems } from "@/lib/gallery-service";
import { getOptimizedImageUrl } from "@/lib/image-utils";

interface IrisGalleryProps {
  active: boolean;
  onComplete?: () => void;
}

// Fallback iris portraits when no database items exist
const DEFAULT_IRIS_PHOTOS: string[] = [];

export default function IrisGallery({ active, onComplete }: IrisGalleryProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const centerTextRef = useRef<HTMLDivElement>(null);
  const [photoUrls, setPhotoUrls] = useState<string[]>(DEFAULT_IRIS_PHOTOS);

  // Subscribe to dynamic Iris photos from gallery service
  useEffect(() => {
    const unsub = subscribeToIrisItems((items) => {
      const dynamicUrls = items
        .filter((i) => i.isIrisItem)
        .map((i) => getOptimizedImageUrl(i.imageUrl, 280, 60));
      if (dynamicUrls.length > 0) {
        // Ensure at least 20 items by repeating if necessary
        let finalUrls = [...dynamicUrls];
        while (finalUrls.length < 24) {
          finalUrls = [...finalUrls, ...dynamicUrls];
        }
        setPhotoUrls(finalUrls.slice(0, 24));
      } else {
        setPhotoUrls(DEFAULT_IRIS_PHOTOS);
      }
    });
    return () => unsub();
  }, []);
  const [dimensions, setDimensions] = useState({
    rStart: 150,
    rEnd: 490,
    cardW: 88,
    cardH: 120,
  });

  // Responsive sizing based on viewport
  useEffect(() => {
    const updateDimensions = () => {
      const w = window.innerWidth;
      if (w < 640) {
        setDimensions({ rStart: 85, rEnd: 240, cardW: 52, cardH: 72 });
      } else if (w < 1024) {
        setDimensions({ rStart: 120, rEnd: 380, cardW: 70, cardH: 96 });
      } else {
        setDimensions({ rStart: 150, rEnd: 490, cardW: 88, cardH: 120 });
      }
    };
    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  // Pre-calculated initial positions: All cards start in a tight circular cluster
  const initialLayout = useMemo(() => {
    const numCards = photoUrls.length;
    return photoUrls.map((_, i) => {
      const theta = (i * 2 * Math.PI) / numCards;
      const x = Number((Math.cos(theta) * dimensions.rStart).toFixed(2));
      const y = Number((Math.sin(theta) * dimensions.rStart).toFixed(2));
      const bladeTilt = Number((Math.sin(theta) * 14).toFixed(2));
      const zIndex = Math.round((Math.sin(theta) + 1) * 50);
      return { x, y, bladeTilt, zIndex };
    });
  }, [dimensions, photoUrls]);

  // Calm, cinematic expanding iris motion
  useEffect(() => {
    if (!active) return;

    let animFrameId: number;
    const startTime = performance.now();
    const totalDuration = photoUrls.length > 0 ? 4600 : 2200; // 4.6s when iris images present, 2.2s for clean title welcome
    const numCards = photoUrls.length;

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / totalDuration);

      // Gentle, calm angular glide (~21 degrees per second)
      const baseAngle = (elapsed / 1000) * 0.38;

      // Smooth gradual expansion: starts close and blooms wider and wider
      const easeExpand = 1 - Math.pow(1 - progress, 2.0);

      // Radius expands from close to wide
      const currentRadiusX = dimensions.rStart + (dimensions.rEnd - dimensions.rStart) * easeExpand;
      const currentRadiusY = dimensions.rStart + (dimensions.rEnd * 0.74 - dimensions.rStart) * easeExpand;

      // Card scale starts compact and grows to full size
      const cardScale = 0.82 + 0.18 * easeExpand;

      // Subtle tilt keeping portraits right-side-up and easily readable
      const bladeTilt = Math.sin(baseAngle * 1.5) * 8 * (1 - easeExpand * 0.5);

      // Smooth dissolve fade out during the final 700ms
      const fadeProgress = Math.max(0, (elapsed - (totalDuration - 700)) / 700);
      const irisOpacity = 1 - fadeProgress;

      for (let i = 0; i < numCards; i++) {
        const cardEl = cardsRef.current[i];
        if (!cardEl) continue;

        const theta = baseAngle + (i * 2 * Math.PI) / numCards;
        const x = Math.cos(theta) * currentRadiusX;
        const y = Math.sin(theta) * currentRadiusY;

        // Subtle individual tilt keeping portraits upright
        const individualTilt = Math.sin(theta) * 10 * (1 - easeExpand * 0.6) + bladeTilt;

        cardEl.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0px) rotate(${individualTilt.toFixed(1)}deg) scale(${cardScale.toFixed(2)})`;
        cardEl.style.opacity = irisOpacity.toFixed(3);
      }

      // Smoothly sync middle of the iris text opacity and subtle scale
      if (centerTextRef.current) {
        centerTextRef.current.style.opacity = irisOpacity.toFixed(3);
        const textScale = 0.94 + 0.06 * easeExpand;
        centerTextRef.current.style.transform = `scale(${textScale.toFixed(3)})`;
      }

      if (elapsed < totalDuration) {
        animFrameId = requestAnimationFrame(animate);
      } else {
        // Trigger completion callback
        onComplete?.();
      }
    };

    animFrameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animFrameId);
    };
  }, [active, dimensions, onComplete]);

  if (!active) return null;

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 z-30 flex flex-col items-center justify-center overflow-hidden bg-[#000000] select-none pointer-events-none"
    >
      {/* Subtle ambient light bloom in center */}
      <div className="absolute w-[600px] h-[360px] rounded-full bg-white/[0.04] blur-[140px] pointer-events-none" />

      {/* Dead Center Aperture: Artistic Welcome Text in Middle of the Iris */}
      <div
        ref={centerTextRef}
        className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-20 text-center px-4 will-change-[opacity,transform]"
      >
        <div className="max-w-[320px] sm:max-w-md md:max-w-xl flex flex-col items-center justify-center animate-in fade-in zoom-in-95 duration-1000 ease-out">
          <span className="text-[10px] sm:text-[11px] font-syne uppercase tracking-[0.35em] text-neutral-200 mb-2 sm:mb-2.5 font-semibold">
            Capturing Emotions & Stories
          </span>
          <h1 className="font-artistic text-2xl sm:text-4xl md:text-5xl lg:text-6xl text-white font-bold italic tracking-[0.02em] leading-[1.16] drop-shadow-[0_10px_35px_rgba(0,0,0,0.95)]">
            Welcome to the domain of Aziz
          </h1>
          <div className="w-12 sm:w-16 h-[1px] bg-gradient-to-r from-transparent via-white/50 to-transparent mt-3 sm:mt-4" />
        </div>
      </div>

      {/* Orbiting Center Stage */}
      <div className="relative w-0 h-0 flex items-center justify-center z-30">
        {photoUrls.map((url, i) => {
          const init = initialLayout[i] || { x: 0, y: 0, bladeTilt: 0, zIndex: 1 };
          return (
            <div
              key={url + "_" + i}
              ref={(el) => {
                cardsRef.current[i] = el;
              }}
              suppressHydrationWarning
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 will-change-transform"
              style={{
                transform: `translate3d(${init.x}px, ${init.y}px, 0px) rotate(${init.bladeTilt}deg) scale(0.82)`,
                zIndex: init.zIndex,
              }}
            >
              {/* Rounded Portrait Card - Sized for clarity and detail */}
              <div
                className="relative overflow-hidden bg-neutral-900 border border-white/20 shadow-2xl transition-all duration-300"
                style={{
                  width: `${dimensions.cardW}px`,
                  height: `${dimensions.cardH}px`,
                  borderRadius: "16px",
                  boxShadow: "0 20px 40px rgba(0,0,0,0.95), 0 4px 12px rgba(0,0,0,0.6)",
                }}
              >
                <Image
                  src={url}
                  alt="Iris Portrait"
                  fill
                  sizes="180px"
                  className="object-cover pointer-events-none"
                  priority={i < 2}
                />

                {/* Subtle glass gloss overlay */}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-white/10" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
