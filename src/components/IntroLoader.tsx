"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import gsap from "gsap";
import IrisGallery, { IrisCategoryPhoto } from "./IrisGallery";
import { ArrowRight } from "lucide-react";

const INTRO_SHOWN_KEY = "azizography_intro_seen_v3";

interface IntroLoaderProps {
  onComplete: () => void;
  forceShow?: boolean;
  categoryPhotos?: IrisCategoryPhoto[];
  activeCategoryDescription?: string;
}

export default function IntroLoader({
  onComplete,
  forceShow = false,
  categoryPhotos = [],
  activeCategoryDescription,
}: IntroLoaderProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const isFinishedRef = useRef(false);

  useEffect(() => {
    setMounted(true);
    // If already seen in this session, immediately complete to prevent double-play
    if (typeof window !== "undefined" && !forceShow) {
      try {
        if (sessionStorage.getItem(INTRO_SHOWN_KEY) === "true") {
          isFinishedRef.current = true;
          setIsVisible(false);
          onComplete();
          return;
        }
      } catch {
        // fallback
      }
    }

    const container = containerRef.current;
    return () => {
      if (container) {
        gsap.killTweensOf(container);
      }
    };
  }, [forceShow, onComplete]);

  const finish = useCallback(() => {
    if (isFinishedRef.current) return;
    isFinishedRef.current = true;
    try {
      sessionStorage.setItem(INTRO_SHOWN_KEY, "true");
    } catch {
      // ignore
    }
    setIsVisible(false);
    onComplete();
  }, [onComplete]);

  // When forceShow is triggered (e.g. from admin Preview Iris), re-enable the loader
  useEffect(() => {
    if (forceShow) {
      isFinishedRef.current = false;
      setIsVisible(true);
      if (containerRef.current) {
        gsap.set(containerRef.current, { opacity: 1, scale: 1, filter: "none" });
        containerRef.current.style.pointerEvents = "auto";
        containerRef.current.style.backgroundColor = "#000000";
      }
    }
  }, [forceShow]);

  const [skipBtnLight, setSkipBtnLight] = useState(false);

  // Handle smooth background shift from deep black to warm editorial cream
  const handleMorphProgress = useCallback((m: number) => {
    if (containerRef.current) {
      containerRef.current.style.backgroundColor = `rgb(${Math.round(250 * m)}, ${Math.round(249 * m)}, ${Math.round(246 * m)})`;
    }
    if (m > 0.45) {
      setSkipBtnLight(true);
    }
  }, []);

  const handleIrisComplete = useCallback(() => {
    if (!containerRef.current) {
      finish();
      return;
    }
    containerRef.current.style.pointerEvents = "none";
    gsap.to(containerRef.current, {
      opacity: 0,
      duration: 0.2,
      ease: "power2.out",
      onComplete: finish,
    });
  }, [finish]);

  const handleSkip = useCallback(() => {
    if (containerRef.current) {
      containerRef.current.style.pointerEvents = "none";
      gsap.to(containerRef.current, {
        opacity: 0,
        duration: 0.25,
        ease: "power2.out",
        onComplete: finish,
      });
    } else {
      finish();
    }
  }, [finish]);

  // Keyboard shortcut ESC to skip loading animation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.code === "Space") {
        handleSkip();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleSkip]);

  if (!isVisible) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      suppressHydrationWarning
      className="fixed inset-0 z-50 text-white flex flex-col justify-between overflow-hidden select-none will-change-[background-color,opacity]"
      style={{ backgroundColor: "#000000" }}
    >
      {/* Top Minimal Navigation Bar */}
      <div className="relative z-40 w-screen flex items-center justify-end p-6 sm:p-10 text-[10px] uppercase font-mono-brutal tracking-[0.25em]">
        <button
          type="button"
          onClick={handleSkip}
          className={`flex items-center gap-1.5 px-3 py-1.5 border transition-all text-[9px] font-semibold tracking-widest uppercase cursor-pointer rounded-full ${
            skipBtnLight
              ? "border-[#DDD6CA] text-[#1C1917] hover:bg-[#1C1917] hover:text-[#FAF7F2]"
              : "border-white/20 hover:border-white text-white hover:bg-white hover:text-black"
          }`}
        >
          <span>ENTER SITE [ESC]</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      {/* Iris Gallery: Mounts only on client to eliminate SSR hydration mismatch */}
      {mounted && (
        <IrisGallery
          active={true}
          onMorphProgress={handleMorphProgress}
          onComplete={handleIrisComplete}
          categoryPhotos={categoryPhotos}
          activeCategoryDescription={activeCategoryDescription}
        />
      )}

      {/* Clean bottom spacer for perfect vertical balance */}
      <div className="relative z-40 p-6 sm:p-10 pointer-events-none opacity-0 select-none" aria-hidden="true">
        <span className="text-[10px]">SPACER</span>
      </div>
    </div>
  );
}
