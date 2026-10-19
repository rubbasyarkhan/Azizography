"use client";

import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import { Volume2, VolumeX, ArrowRight } from "lucide-react";

interface IntroLoaderProps {
  onComplete: () => void;
  forceShow?: boolean;
}

export default function IntroLoader({ onComplete, forceShow = false }: IntroLoaderProps) {
  const [hasVisited, setHasVisited] = useState<boolean | null>(null);
  const [progress, setProgress] = useState(0);
  const [isAudioMuted, setIsAudioMuted] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const text1Ref = useRef<HTMLHeadingElement>(null);
  const text2Ref = useRef<HTMLParagraphElement>(null);
  const counterRef = useRef<HTMLDivElement>(null);
  const curtainLeftRef = useRef<HTMLDivElement>(null);
  const curtainRightRef = useRef<HTMLDivElement>(null);

  // Check sessionStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const visited = sessionStorage.getItem("azizography_intro_seen");
      if (visited && !forceShow) {
        setHasVisited(true);
        onComplete();
      } else {
        setHasVisited(false);
      }
    }
  }, [forceShow, onComplete]);

  // GSAP animation timeline
  useEffect(() => {
    if (hasVisited !== false) return;

    // Progress counter 0 to 100
    const progressObj = { value: 0 };
    const counterTween = gsap.to(progressObj, {
      value: 100,
      duration: 3.2,
      ease: "power2.inOut",
      onUpdate: () => {
        setProgress(Math.floor(progressObj.value));
      },
    });

    const tl = gsap.timeline({
      onComplete: () => {
        finishIntro();
      },
    });

    // Kinetic typography sequences
    tl.fromTo(
      ".intro-title-line",
      {
        y: 80,
        opacity: 0,
        skewY: 6,
      },
      {
        y: 0,
        opacity: 1,
        skewY: 0,
        duration: 0.9,
        stagger: 0.12,
        ease: "power3.out",
        delay: 0.2,
      }
    )
      .fromTo(
        ".intro-sub-line",
        {
          opacity: 0,
          letterSpacing: "0.4em",
          y: 20,
        },
        {
          opacity: 0.8,
          letterSpacing: "0.2em",
          y: 0,
          duration: 0.8,
          ease: "power2.out",
        },
        "-=0.4"
      )
      .to(".intro-glitch-layer", {
        opacity: 0.25,
        duration: 0.1,
        repeat: 3,
        yoyo: true,
        ease: "rough",
      })
      .to(
        [text1Ref.current, text2Ref.current, counterRef.current],
        {
          opacity: 0,
          scale: 1.08,
          filter: "blur(8px)",
          duration: 0.6,
          ease: "power2.in",
          delay: 0.8,
        }
      )
      // Curtain Split reveal matching Hollywood Exhibit 2026
      .to(
        curtainLeftRef.current,
        {
          xPercent: -100,
          duration: 1.1,
          ease: "power4.inOut",
        },
        "curtain"
      )
      .to(
        curtainRightRef.current,
        {
          xPercent: 100,
          duration: 1.1,
          ease: "power4.inOut",
        },
        "curtain"
      );

    return () => {
      counterTween.kill();
      tl.kill();
    };
  }, [hasVisited]);

  const finishIntro = () => {
    sessionStorage.setItem("azizography_intro_seen", "true");
    setHasVisited(true);
    onComplete();
  };

  const handleSkip = () => {
    finishIntro();
  };

  // Keyboard shortcut ESC to skip
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
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
      className="fixed inset-0 z-50 overflow-hidden bg-[#070707] text-[#f5f5f7] flex flex-col justify-between p-6 md:p-12 select-none"
    >
      {/* Split Curtain for exit wipe */}
      <div
        ref={curtainLeftRef}
        className="pointer-events-none absolute inset-y-0 left-0 w-1/2 bg-[#070707] border-r border-white/10 z-40"
      />
      <div
        ref={curtainRightRef}
        className="pointer-events-none absolute inset-y-0 right-0 w-1/2 bg-[#070707] border-l border-white/10 z-40"
      />

      {/* Cinematic subtle grid backdrop */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.15),rgba(255,255,255,0))]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem]" />

      {/* Top Bar: Hollywood Exhibit style metadata */}
      <div className="relative z-30 flex items-center justify-between text-[11px] tracking-[0.25em] uppercase text-neutral-400 font-mono-brutal">
        <div className="flex items-center gap-3">
          <span className="inline-block w-2 h-2 rounded-full bg-red-600 animate-ping" />
          <span>AZIZOGRAPHY // EXHIBIT ARCHIVE 2026</span>
        </div>

        <div className="flex items-center gap-6">
          <button
            onClick={() => setIsAudioMuted(!isAudioMuted)}
            className="hidden sm:flex items-center gap-2 hover:text-white transition-colors"
          >
            {isAudioMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-red-500" />}
            <span>{isAudioMuted ? "SOUND: OFF" : "SOUND: ON"}</span>
          </button>

          <button
            onClick={handleSkip}
            className="group flex items-center gap-1.5 px-3 py-1.5 border border-white/20 hover:border-white text-white hover:bg-white hover:text-black transition-all duration-300 rounded-none text-[10px] font-semibold"
          >
            <span>SKIP INTRO [ESC]</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>

      {/* Main Kinetic Center Reveal */}
      <div className="relative z-30 my-auto text-center max-w-5xl mx-auto px-4">
        {/* Hollywood Exhibit 2026 Subtitle */}
        <p
          ref={text2Ref}
          className="intro-sub-line text-xs sm:text-sm md:text-base font-serif-elegant italic tracking-[0.2em] text-neutral-400 mb-6 uppercase"
        >
          A Visual Odyssey Through Sound, Strobe & Holy Matrimony
        </p>

        {/* Brutalist Hero Display Title */}
        <div className="overflow-hidden">
          <h1
            ref={text1Ref}
            className="intro-title-line font-display text-4xl sm:text-6xl md:text-8xl lg:text-9xl font-extrabold tracking-tighter uppercase leading-[0.88] text-white"
          >
            AZIZOGRAPHY
          </h1>
        </div>

        <div className="overflow-hidden mt-3">
          <p className="intro-title-line font-display text-lg sm:text-2xl md:text-3xl font-bold tracking-tight text-neutral-300 uppercase">
            LIVE CONCERTS <span className="text-red-500 mx-2">/</span> SINGERS <span className="text-red-500 mx-2">/</span> CEREMONIES
          </p>
        </div>

        {/* Ambient Glitch / Scanline effect layer */}
        <div className="intro-glitch-layer pointer-events-none absolute inset-0 bg-white/5 opacity-0 mix-blend-overlay" />
      </div>

      {/* Bottom Status & Kinetic Loading Progress Counter */}
      <div
        ref={counterRef}
        className="relative z-30 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 font-mono-brutal text-xs border-t border-white/10 pt-4"
      >
        <div className="flex flex-col gap-1 text-neutral-500">
          <div className="flex items-center gap-2">
            <span className="text-white font-medium">CURATED REEL:</span>
            <span>LOS ANGELES / NYC / TOKYO / BERLIN</span>
          </div>
          <div className="text-[10px] tracking-wider text-neutral-400">
            INSPIRATION: DEANIE CHEN & HOLLYWOOD EXHIBIT 2026
          </div>
        </div>

        {/* Dynamic Numerical Counter */}
        <div className="flex items-baseline gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <span className="text-neutral-500 uppercase tracking-widest text-[10px]">INITIALIZING STREAM</span>
          <div className="flex items-center gap-2">
            <span className="font-display text-3xl sm:text-5xl font-bold text-white tracking-tighter tabular-nums">
              {String(progress).padStart(3, "0")}
            </span>
            <span className="text-red-500 font-bold text-sm">%</span>
          </div>
        </div>
      </div>

      {/* Loading bar along bottom border */}
      <div className="absolute bottom-0 left-0 h-[2px] bg-red-600 transition-all duration-75 z-40" style={{ width: `${progress}%` }} />
    </div>
  );
}
