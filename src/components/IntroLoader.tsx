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
  const [isVisible, setIsVisible] = useState(true);
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // When forceShow is triggered, re-enable the loader
  useEffect(() => {
    if (forceShow) {
      setIsVisible(true);
      if (containerRef.current) {
        gsap.set(containerRef.current, { opacity: 1, scale: 1, filter: "blur(0px)" });
        containerRef.current.style.pointerEvents = "auto";
      }
    }
  }, [forceShow]);

  // Handle smooth transition from Iris Animation into the Home Page
  const handleIrisComplete = () => {
    if (!containerRef.current) {
      finish();
      return;
    }

    containerRef.current.style.pointerEvents = "none";

    gsap.to(containerRef.current, {
      opacity: 0,
      scale: 1.03,
      filter: "blur(10px)",
      duration: 1.0,
      ease: "power2.inOut",
      onComplete: finish,
    });
  };

  const finish = () => {
    setIsVisible(false);
    onComplete();
  };

  const handleSkip = () => {
    if (containerRef.current) {
      containerRef.current.style.pointerEvents = "none";
      gsap.to(containerRef.current, {
        opacity: 0,
        duration: 0.35,
        ease: "power2.out",
        onComplete: finish,
      });
    } else {
      finish();
    }
  };

  // Keyboard shortcut ESC to skip loading animation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.code === "Space") {
        handleSkip();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  if (!isVisible) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 bg-[#000000] text-white flex flex-col justify-between overflow-hidden select-none will-change-[opacity,transform,filter]"
    >
      {/* Top Minimal Navigation Bar */}
      <div className="relative z-40 w-screen flex items-center justify-end p-6 sm:p-10 text-[10px] uppercase font-mono-brutal tracking-[0.25em] text-neutral-400">
        <button
          type="button"
          onClick={handleSkip}
          className="flex items-center gap-1.5 px-3 py-1.5 border border-white/20 hover:border-white text-white hover:bg-white hover:text-black transition-all text-[9px] font-semibold tracking-widest uppercase cursor-pointer"
        >
          <span>ENTER SITE [ESC]</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      {/* Iris Gallery: Mounts only on client to eliminate SSR hydration mismatch */}
      {mounted && <IrisGallery active={true} onComplete={handleIrisComplete} />}

      {/* Clean bottom spacer for perfect vertical balance */}
      <div className="relative z-40 p-6 sm:p-10 pointer-events-none opacity-0 select-none" aria-hidden="true">
        <span className="text-[10px]">SPACER</span>
      </div>
    </div>
  );
}
