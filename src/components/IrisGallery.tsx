"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";
import Image from "next/image";

import { subscribeToIrisItems, getIrisItems } from "@/lib/gallery-service";
import { getOptimizedImageUrl } from "@/lib/image-utils";

export interface IrisCategoryPhoto {
  src: string;
  title?: string;
  subtitle?: string;
}

interface IrisGalleryProps {
  active: boolean;
  onComplete?: () => void;
  onMorphProgress?: (progress: number) => void;
  categoryPhotos?: IrisCategoryPhoto[];
  activeCategoryDescription?: string;
}

export default function IrisGallery({
  active,
  onComplete,
  onMorphProgress,
  categoryPhotos = [],
  activeCategoryDescription,
}: IrisGalleryProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const centerTextRef = useRef<HTMLDivElement>(null);
  const topHeadingRef = useRef<HTMLDivElement>(null);

  const onMorphProgressRef = useRef(onMorphProgress);
  onMorphProgressRef.current = onMorphProgress;

  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  // Subscribe to dynamic Iris photos from gallery service
  const [irisUrls, setIrisUrls] = useState<string[]>(() => {
    try {
      const iris = getIrisItems();
      const dynamicUrls = iris
        .filter((i) => i.isIrisItem && i.imageUrl)
        .map((i) => getOptimizedImageUrl(i.imageUrl, 460, 75))
        .filter(Boolean);
      if (dynamicUrls.length > 0) {
        return dynamicUrls;
      }
    } catch {
      // fallback
    }
    return [];
  });

  useEffect(() => {
    const unsub = subscribeToIrisItems((items) => {
      const dynamicUrls = items
        .filter((i) => i.isIrisItem && i.imageUrl)
        .map((i) => getOptimizedImageUrl(i.imageUrl, 460, 75))
        .filter(Boolean);
      if (dynamicUrls.length > 0) {
        setIrisUrls(dynamicUrls);
      }
    });
    return () => {
      try {
        unsub();
      } catch {
        // Safe unsubscription cleanup
      }
    };
  }, []);

  // Responsive dimensions for Iris aperture and target 3D Cylinder
  const [dimensions, setDimensions] = useState({
    rStart: 150,
    rEnd: 490,
    cardW: 88,
    cardH: 120,
    targetCardW: 460,
    targetCardH: 390,
    cylRadius: 650,
  });

  const dimensionsRef = useRef(dimensions);
  dimensionsRef.current = dimensions;

  useEffect(() => {
    const updateDimensions = () => {
      const w = window.innerWidth;
      let nextDims;
      if (w < 640) {
        nextDims = {
          rStart: 85,
          rEnd: 240,
          cardW: 52,
          cardH: 72,
          targetCardW: 300,
          targetCardH: 254,
          cylRadius: 360,
        };
      } else if (w < 1024) {
        nextDims = {
          rStart: 120,
          rEnd: 380,
          cardW: 70,
          cardH: 96,
          targetCardW: 380,
          targetCardH: 322,
          cylRadius: 500,
        };
      } else {
        nextDims = {
          rStart: 150,
          rEnd: 490,
          cardW: 88,
          cardH: 120,
          targetCardW: 460,
          targetCardH: 390,
          cylRadius: 650,
        };
      }
      setDimensions(nextDims);
      dimensionsRef.current = nextDims;
    };
    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  // Card photos matching the active category photographs
  const cardPhotos = useMemo(() => {
    const pool =
      categoryPhotos.length > 0
        ? categoryPhotos.map((c) => c.src)
        : irisUrls.length > 0
        ? irisUrls
        : [];

    if (pool.length === 0) return [];

    const list: string[] = [];
    while (list.length < 24) {
      list.push(...pool);
    }
    return list.slice(0, 24);
  }, [categoryPhotos, irisUrls]);

  // Initial aperture layout in tight concentric circle
  const initialLayout = useMemo(() => {
    const numCards = cardPhotos.length;
    return cardPhotos.map((_, i) => {
      const theta = (i * 2 * Math.PI) / numCards;
      const x = Number((Math.cos(theta) * dimensions.rStart).toFixed(2));
      const y = Number((Math.sin(theta) * dimensions.rStart).toFixed(2));
      const bladeTilt = Number((Math.sin(theta) * 14).toFixed(2));
      const zIndex = Math.round((Math.sin(theta) + 1) * 50);
      return { x, y, bladeTilt, zIndex };
    });
  }, [dimensions, cardPhotos]);

  // Cinematic iris expansion morphing directly into the 3D Category Cylinder
  useEffect(() => {
    if (!active) return;

    let animFrameId: number;
    let completed = false;
    const startTime = performance.now();
    const totalDuration = 4200; // 4.2s full cinematic morph sequence

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / totalDuration);
      const dims = dimensionsRef.current;

      // Base angular rotation
      const baseAngle = (elapsed / 1000) * 0.38;

      // Phase 1: Aperture expands outward in iris circle (0 to 2000ms)
      const irisProgress = Math.min(1, elapsed / 2200);
      const easeExpand = 1 - Math.pow(1 - irisProgress, 2.2);

      // Phase 2: Smooth 3D morph into the horizontal Cylinder (2000ms to 4200ms)
      const rawMorph = Math.max(0, Math.min(1, (elapsed - 2000) / 2200));
      // Smooth cubic ease
      const m =
        rawMorph < 0.5
          ? 4 * rawMorph * rawMorph * rawMorph
          : 1 - Math.pow(-2 * rawMorph + 2, 3) / 2;

      if (m > 0) {
        onMorphProgressRef.current?.(m);
      }

      // Radius in 2D Iris
      const currentRadiusX = dims.rStart + (dims.rEnd - dims.rStart) * easeExpand;
      const currentRadiusY = dims.rStart + (dims.rEnd * 0.74 - dims.rStart) * easeExpand;

      // Target cylinder radius and card dimensions
      const cylRadius = dims.cylRadius || 650;
      const targetCardW = dims.targetCardW || 460;
      const targetCardH = dims.targetCardH || 390;

      // Card scale & dimensions interpolating during 3D morph
      const cardW = (1 - m) * dims.cardW + m * targetCardW;
      const cardH = (1 - m) * dims.cardH + m * targetCardH;

      // Subtle blade tilt in 2D iris
      const bladeTilt = Math.sin(baseAngle * 1.5) * 8 * (1 - easeExpand * 0.5);

      const currentCards = cardsRef.current;
      const numCards = currentCards.length;

      for (let i = 0; i < numCards; i++) {
        const cardEl = currentCards[i];
        if (!cardEl) continue;

        const theta = baseAngle + (i * 2 * Math.PI) / numCards;

        // 2D Iris coordinates
        const xIris = Math.cos(theta) * currentRadiusX;
        const yIris = Math.sin(theta) * currentRadiusY;
        const zIris = 0;
        const rotXIris = 0;
        const rotYIris = 0;
        const rotZIris = Math.sin(theta) * 10 * (1 - easeExpand * 0.6) + bladeTilt;

        // 3D Cylinder coordinates
        const xCyl = Math.sin(theta) * cylRadius;
        const yCyl = 0;
        const zCyl = Math.cos(theta) * cylRadius - cylRadius;
        const rotXCyl = -5;
        const rotYCyl = -(theta * 180) / Math.PI;
        const rotZCyl = 0;

        // Blended 3D position
        const x = (1 - m) * xIris + m * xCyl;
        const y = (1 - m) * yIris + m * yCyl;
        const z = (1 - m) * zIris + m * zCyl;
        const rotX = (1 - m) * rotXIris + m * rotXCyl;
        const rotY = (1 - m) * rotYIris + m * rotYCyl;
        const rotZ = (1 - m) * rotZIris + m * rotZCyl;

        cardEl.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, ${z.toFixed(1)}px) rotateX(${rotX.toFixed(1)}deg) rotateY(${rotY.toFixed(1)}deg) rotateZ(${rotZ.toFixed(1)}deg)`;
        cardEl.style.width = `${cardW.toFixed(0)}px`;
        cardEl.style.height = `${cardH.toFixed(0)}px`;
        cardEl.style.zIndex = `${Math.round(100 + z)}`;
      }

      // Center welcome text fades out smoothly as morph begins
      if (centerTextRef.current) {
        centerTextRef.current.style.opacity = Math.max(0, 1 - m * 2.8).toFixed(3);
        const textScale = 0.94 + 0.06 * easeExpand + m * 0.1;
        centerTextRef.current.style.transform = `scale(${textScale.toFixed(3)})`;
      }

      // Top 2-line heading reveals smoothly as cards settle into cylinder
      if (topHeadingRef.current) {
        if (m > 0.45) {
          const headOpacity = Math.min(1, (m - 0.45) / 0.55);
          topHeadingRef.current.style.opacity = headOpacity.toFixed(3);
          topHeadingRef.current.style.transform = `translateY(${((1 - headOpacity) * -16).toFixed(1)}px)`;
        } else {
          topHeadingRef.current.style.opacity = "0";
        }
      }

      // Background color shifts from camera black to rich cream #FAF9F6
      if (containerRef.current) {
        containerRef.current.style.backgroundColor = `rgb(${Math.round(250 * m)}, ${Math.round(249 * m)}, ${Math.round(246 * m)})`;
      }

      if (elapsed < totalDuration) {
        animFrameId = requestAnimationFrame(animate);
      } else if (!completed) {
        completed = true;
        onCompleteRef.current?.();
      }
    };

    animFrameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animFrameId);
    };
  }, [active]);

  if (!active) return null;

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 z-30 flex flex-col items-center justify-center overflow-hidden select-none pointer-events-none"
      style={{
        perspective: "1800px",
        backgroundColor: "#000000",
      }}
    >
      {/* Subtle ambient light bloom in center */}
      <div className="absolute w-[600px] h-[360px] rounded-full bg-white/[0.04] blur-[140px] pointer-events-none" />

      {/* Two-Line Classical Heading that fades in as cards arrange into the cylinder */}
      <div
        ref={topHeadingRef}
        className="absolute top-8 sm:top-12 inset-x-0 z-40 flex flex-col items-center justify-center pointer-events-none text-center px-4 will-change-[opacity,transform]"
        style={{ opacity: 0, transform: "translateY(-16px)" }}
      >
        <div className="max-w-3xl mx-auto space-y-1.5 pt-1">
          <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl font-normal tracking-tight text-[#1C1917] leading-none">
            Archive &amp; Collections
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 max-w-lg mx-auto font-sans leading-relaxed">
            {activeCategoryDescription ||
              "Curated ceremonial monographs, arena performances, and raw artistic portraiture."}
          </p>
        </div>
      </div>

      {/* Dead Center Aperture: Artistic Welcome Text in Middle of the Iris */}
      <div
        ref={centerTextRef}
        className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-20 text-center px-4 will-change-[opacity,transform]"
      >
        <div className="max-w-[320px] sm:max-w-md md:max-w-xl flex flex-col items-center justify-center animate-in fade-in zoom-in-95 duration-1000 ease-out">
          <span className="text-[10px] sm:text-[11px] font-syne uppercase tracking-[0.35em] text-neutral-200 mb-2 sm:mb-2.5 font-semibold">
            Capturing Emotions &amp; Stories
          </span>
          <h1 className="font-artistic text-2xl sm:text-4xl md:text-5xl lg:text-6xl text-white font-bold italic tracking-[0.02em] leading-[1.16] drop-shadow-[0_10px_35px_rgba(0,0,0,0.95)]">
            Welcome to the domain of Aziz
          </h1>
          <div className="w-12 sm:w-16 h-[1px] bg-gradient-to-r from-transparent via-white/50 to-transparent mt-3 sm:mt-4" />
        </div>
      </div>

      {/* Orbiting Center Stage in 3D */}
      <div
        className="relative w-0 h-0 flex items-center justify-center z-30"
        style={{ transformStyle: "preserve-3d" }}
      >
        {cardPhotos.map((url, i) => {
          const init = initialLayout[i] || { x: 0, y: 0, bladeTilt: 0, zIndex: 1 };
          return (
            <div
              key={url + "_" + i}
              ref={(el) => {
                cardsRef.current[i] = el;
              }}
              suppressHydrationWarning
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-2xl overflow-hidden shadow-2xl will-change-transform bg-neutral-900 border border-white/20"
              style={{
                width: `${dimensions.cardW}px`,
                height: `${dimensions.cardH}px`,
                transform: `translate3d(${init.x}px, ${init.y}px, 0px) rotate(${init.bladeTilt}deg) scale(0.82)`,
                zIndex: init.zIndex,
              }}
            >
              <Image
                src={url}
                alt="Portfolio Archive"
                fill
                sizes="(max-width: 768px) 340px, 460px"
                className="object-cover pointer-events-none"
                priority={i < 4}
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-white/10" />
            </div>
          );
        })}
      </div>
    </div>
  );
}
