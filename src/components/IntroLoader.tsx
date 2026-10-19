"use client";

import React, { useEffect, useState, useRef } from "react";
import gsap from "gsap";
import IrisGallery from "./IrisGallery";
import { ArrowRight } from "lucide-react";

interface IntroLoaderProps {
  onComplete: () => void;
  forceShow?: boolean;
}

export default function IntroLoader({ onComplete, forceShow = false }: IntroLoaderProps) {
  const [hasVisited, setHasVisited] = useState<boolean | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  // Check sessionStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const visited = sessionStorage.getItem("azizography_iris_seen");
      if (visited && !forceShow) {
        setHasVisited(true);
        onComplete();
      } else {
        setHasVisited(false);
      }
    }
  }, [forceShow, onComplete]);

  // Smooth entrance fade-in
  useEffect(() => {
    if (hasVisited !== false) return;

    if (containerRef.current) {
      gsap.fromTo(
        containerRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.8, ease: "power2.out" }
      );
    }
  }, [hasVisited]);

  // Ultra-smooth exit fade transition into the live home page
  const handleIrisComplete = () => {
    if (!containerRef.current) {
      finish();
      return;
    }

    gsap.to(containerRef.current, {
      opacity: 0,
      scale: 1.04,
      filter: "blur(12px)",
      duration: 1.2,
      ease: "power2.inOut",
      onComplete: finish,
    });
  };

  const finish = () => {
    sessionStorage.setItem("azizography_iris_seen", "true");
    setHasVisited(true);
    onComplete();
  };

  const handleSkip = () => {
    timelineRef.current?.kill();
    if (containerRef.current) {
      gsap.to(containerRef.current, {
        opacity: 0,
        duration: 0.4,
        ease: "power2.out",
        onComplete: finish,
      });
    } else {
      finish();
    }
  };

  // Keyboard shortcut ESC to skip
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.code === "Space") {
        handleSkip();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  if (hasVisited === null || hasVisited === true) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 bg-[#070707] text-white flex flex-col justify-between overflow-hidden select-none will-change-[opacity,transform,filter]"
    >
      {/* Top Bar with Minimal Indicator and Skip Control */}
      <div className="relative z-40 flex items-center justify-between p-6 sm:p-10 text-[10px] uppercase font-mono-brutal tracking-[0.25em] text-neutral-400">
        <div className="flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
          <span>AZIZOGRAPHY // IRIS GALLERY</span>
        </div>

        <button
          type="button"
          onClick={handleSkip}
          className="flex items-center gap-1.5 px-3 py-1.5 border border-white/20 hover:border-white text-white hover:bg-white hover:text-black transition-all text-[9px] font-semibold tracking-widest uppercase"
        >
          <span>ENTER SITE [ESC]</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      {/* Iris Gallery: Oval of photos circling around and morphing into an iris */}
      <IrisGallery active={true} onComplete={handleIrisComplete} />
    </div>
  );
}
