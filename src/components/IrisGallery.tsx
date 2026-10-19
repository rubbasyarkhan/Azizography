"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";

interface IrisGalleryProps {
  active: boolean;
  onComplete?: () => void;
}

// 24 high-fashion editorial portraits matching the screenshot
const IRIS_PHOTOS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?q=80&w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?q=80&w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?q=80&w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1548142813-c348350df52b?q=80&w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?q=80&w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1528892952291-009c663ce843?q=80&w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1534751516642-a171edd2521d?q=80&w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?q=80&w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?q=80&w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=600&auto=format&fit=crop",
];

export default function IrisGallery({ active, onComplete }: IrisGalleryProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const animFrameIdRef = useRef<number | null>(null);
  const baseAngleRef = useRef(0);
  const [dimensions, setDimensions] = useState({ rx: 440, ry: 190, cardW: 78, cardH: 104 });

  // Responsive oval dimensions
  useEffect(() => {
    const updateDimensions = () => {
      const w = window.innerWidth;
      if (w < 640) {
        setDimensions({ rx: 165, ry: 85, cardW: 46, cardH: 62 });
      } else if (w < 1024) {
        setDimensions({ rx: 310, ry: 140, cardW: 64, cardH: 86 });
      } else {
        setDimensions({ rx: 450, ry: 195, cardW: 78, cardH: 104 });
      }
    };
    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  // Kinetic circling & Iris morph animation
  useEffect(() => {
    if (!active) return;

    const startTime = performance.now();
    const totalDuration = 3400; // Duration of active animation before initiating exit fade

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / totalDuration);

      // Smooth constant angular rotation
      const speed = 0.0075 + progress * 0.004;
      baseAngleRef.current += speed;

      // Iris morph starts smoothly at 1000ms
      const morphProgress = Math.max(0, Math.min(1, (elapsed - 1000) / 1400));
      // Buttery smooth ease-in-out
      const easedMorph = morphProgress < 0.5 
        ? 2 * morphProgress * morphProgress 
        : 1 - Math.pow(-2 * morphProgress + 2, 2) / 2;

      // Interpolate oval radii into circular iris radius
      const targetCircleR = dimensions.rx * 0.62;
      const currentRx = dimensions.rx * (1 - easedMorph) + targetCircleR * easedMorph;
      const currentRy = dimensions.ry * (1 - easedMorph) + targetCircleR * easedMorph;

      const numCards = IRIS_PHOTOS.length;

      for (let i = 0; i < numCards; i++) {
        const cardEl = cardsRef.current[i];
        if (!cardEl) continue;

        // Angle around the oval
        const theta = baseAngleRef.current + (i * 2 * Math.PI) / numCards;
        const x = Math.cos(theta) * currentRx;
        const y = Math.sin(theta) * currentRy;

        // Tangential tilt into iris aperture blades
        const bladeTilt = easedMorph * ((theta * 180) / Math.PI + 35);

        // Z-Index layering based on Y elevation
        const zIndex = Math.round((Math.sin(theta) + 1) * 50);

        cardEl.style.transform = `translate3d(${x}px, ${y}px, 0px) rotate(${bladeTilt}deg)`;
        cardEl.style.zIndex = String(zIndex);
      }

      if (elapsed < totalDuration) {
        animFrameIdRef.current = requestAnimationFrame(animate);
      } else {
        // Trigger completion callback
        onComplete?.();
      }
    };

    animFrameIdRef.current = requestAnimationFrame(animate);

    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, [active, dimensions, onComplete]);

  if (!active) return null;

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 z-30 flex flex-col items-center justify-center overflow-hidden bg-[#070707] select-none pointer-events-none"
    >
      {/* Subtle background ambient glow */}
      <div className="absolute w-[600px] h-[340px] rounded-full bg-white/[0.02] blur-[100px] pointer-events-none" />

      {/* Title & Subtitle Requested by User */}
      <div className="absolute top-12 sm:top-20 z-40 text-center flex flex-col items-center gap-2">
        <h2 className="font-serif-elegant text-3xl sm:text-4xl md:text-5xl font-light text-white tracking-[0.06em] uppercase">
          Iris Gallery
        </h2>
        <p className="font-mono-brutal text-[11px] sm:text-xs text-neutral-400 tracking-widest uppercase">
          An oval of photos that turns into an iris
        </p>
      </div>

      {/* Orbiting Center Stage */}
      <div className="relative w-0 h-0 flex items-center justify-center">
        {IRIS_PHOTOS.map((url, i) => (
          <div
            key={i}
            ref={(el) => {
              cardsRef.current[i] = el;
            }}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 will-change-transform"
          >
            {/* Rounded Portrait Card matching the screenshot */}
            <div
              className="relative overflow-hidden bg-neutral-900 border border-white/20 shadow-2xl transition-all duration-300"
              style={{
                width: `${dimensions.cardW}px`,
                height: `${dimensions.cardH}px`,
                borderRadius: "18px",
                boxShadow: "0 16px 32px rgba(0,0,0,0.85), 0 4px 10px rgba(0,0,0,0.5)",
              }}
            >
              <Image
                src={url}
                alt="Iris Portrait"
                fill
                sizes="120px"
                className="object-cover"
                priority
              />

              {/* Glass sheen highlight */}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-white/10" />
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Minimal Indicator */}
      <div className="absolute bottom-10 sm:bottom-14 z-40 flex items-center gap-2 font-mono-brutal text-[10px] uppercase tracking-[0.25em] text-neutral-500">
        <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-ping" />
        <span>CIRCLING ORBIT // APERTURE DIAPHRAGM</span>
      </div>
    </div>
  );
}
