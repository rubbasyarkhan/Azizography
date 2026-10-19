"use client";

import React, { useEffect, useState, useRef } from "react";
import gsap from "gsap";
import { Volume2, VolumeX, ArrowRight } from "lucide-react";

interface IntroLoaderProps {
  onComplete: () => void;
  forceShow?: boolean;
}

export default function IntroLoader({ onComplete, forceShow = false }: IntroLoaderProps) {
  const [hasVisited, setHasVisited] = useState<boolean | null>(null);
  const [isAudioMuted, setIsAudioMuted] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const titleContainerRef = useRef<HTMLDivElement>(null);
  const path1Ref = useRef<SVGPathElement>(null);
  const path2Ref = useRef<SVGPathElement>(null);
  const bottomInfoRef = useRef<HTMLDivElement>(null);
  const spinnerRef = useRef<SVGSVGElement>(null);

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

  // Hollywood Exhibit 2026 Animation Sequence
  useEffect(() => {
    if (hasVisited !== false) return;

    // Calculate path lengths for animated calligraphic drawing
    const path1 = path1Ref.current;
    const path2 = path2Ref.current;
    let len1 = 400;
    let len2 = 400;
    if (path1) {
      len1 = path1.getTotalLength();
      gsap.set(path1, { strokeDasharray: len1, strokeDashoffset: len1 });
    }
    if (path2) {
      len2 = path2.getTotalLength();
      gsap.set(path2, { strokeDasharray: len2, strokeDashoffset: len2 });
    }

    const tl = gsap.timeline({
      onComplete: () => {
        handleFinish();
      },
    });

    // 1. Initial State
    gsap.set(".he-word-the", { opacity: 0, y: 15, filter: "blur(8px)" });
    gsap.set(".he-word-aziz", { opacity: 0, y: 20, filter: "blur(12px)" });
    gsap.set(".he-word-archive", { opacity: 0, y: 20, filter: "blur(12px)" });
    gsap.set(".he-word-exhibition", { opacity: 0, scale: 0.94, filter: "blur(16px)" });
    gsap.set(bottomInfoRef.current, { opacity: 0, y: 20 });
    gsap.set(spinnerRef.current, { opacity: 0, scale: 0.8 });

    // 2. Hollywood Exhibit Entrance Choreography
    tl.to(".he-word-the", {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      duration: 1.2,
      ease: "power2.out",
      delay: 0.2,
    })
      .to(
        ".he-word-aziz",
        {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          duration: 1.4,
          ease: "power3.out",
        },
        "-=0.9"
      )
      // Calligraphic SVG stroke draw-in
      .to(
        [path1, path2],
        {
          strokeDashoffset: 0,
          duration: 1.8,
          ease: "power2.inOut",
        },
        "-=1.1"
      )
      .to(
        ".he-word-archive",
        {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          duration: 1.4,
          ease: "power3.out",
        },
        "-=1.2"
      )
      // Grand 'AZIZOGRAPHY' / 'HOLLYWOOD' Colossal Title Reveal
      .to(
        ".he-word-exhibition",
        {
          opacity: 1,
          scale: 1,
          filter: "blur(0px)",
          duration: 1.6,
          ease: "power3.out",
        },
        "-=1.0"
      )
      // Bottom Location & Spinner
      .to(
        bottomInfoRef.current,
        {
          opacity: 1,
          y: 0,
          duration: 1.0,
          ease: "power2.out",
        },
        "-=0.8"
      )
      .to(
        spinnerRef.current,
        {
          opacity: 1,
          scale: 1,
          duration: 0.8,
          ease: "power2.out",
        },
        "-=0.6"
      )
      // Subtle cinematic zoom float
      .to(
        titleContainerRef.current,
        {
          scale: 1.03,
          duration: 2.0,
          ease: "sine.inOut",
        },
        "+=0.2"
      )
      // Seamless Hollywood Exhibit camera forward zoom & dissolve reveal
      .to(
        containerRef.current,
        {
          scale: 1.2,
          opacity: 0,
          filter: "blur(14px)",
          duration: 1.1,
          ease: "power3.inOut",
        },
        "+=0.4"
      );

    return () => {
      tl.kill();
    };
  }, [hasVisited]);

  const handleFinish = () => {
    sessionStorage.setItem("azizography_intro_seen", "true");
    setHasVisited(true);
    onComplete();
  };

  // Keyboard shortcut ESC or Space to skip
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.code === "Space") {
        handleFinish();
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
      onClick={handleFinish}
      className="fixed inset-0 z-50 bg-black text-white flex flex-col justify-between overflow-hidden cursor-pointer select-none"
    >
      {/* Hollywood Exhibit Canvas Noise Overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.045] mix-blend-screen"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Top Controls Bar */}
      <div className="relative z-20 flex items-center justify-between p-6 md:p-10 text-[10px] uppercase font-mono-brutal tracking-[0.25em] text-neutral-400">
        <div className="flex items-center gap-3">
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
          <span>HEARST GALLERIES & AZIZOGRAPHY 2026</span>
        </div>

        <div className="flex items-center gap-6">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsAudioMuted(!isAudioMuted);
            }}
            className="hidden sm:flex items-center gap-2 text-neutral-400 hover:text-white transition-colors"
          >
            {isAudioMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-white" />}
            <span>{isAudioMuted ? "SOUND: OFF" : "SOUND: ON"}</span>
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleFinish();
            }}
            className="flex items-center gap-1.5 px-3 py-1 border border-white/20 hover:border-white text-white hover:bg-white hover:text-black transition-all text-[9px] font-semibold"
          >
            <span>ENTER EXHIBIT [ESC]</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Center Hollywood Exhibit 2026 Core Typography */}
      <div
        ref={titleContainerRef}
        className="relative z-10 my-auto flex flex-col items-center justify-center px-6 sm:px-12 md:px-20 text-center will-change-transform"
      >
        <h1 aria-label="The Aziz Live Photography Exhibition" className="w-full max-w-5xl">
          <div className="flex flex-col items-center">
            {/* Top Tier: -ml-[35%] flex items-start gap-4 (Direct match to Hollywood Exhibit 'THE ELLE') */}
            <div className="-ml-[28%] sm:-ml-[36%] flex items-start gap-3 sm:gap-6">
              <span className="he-word-the mt-[4%] mb-auto font-serif-elegant italic text-base sm:text-2xl md:text-3xl tracking-[0.08em] text-neutral-400">
                THE
              </span>
              <span className="he-word-aziz font-serif-elegant text-4xl sm:text-7xl md:text-8xl lg:text-9xl font-light tracking-[0.08em] uppercase text-white leading-none">
                AZIZ
              </span>
            </div>

            {/* Middle Tier: Calligraphic Animated SVG Stroke & 'ESQUIRE' style secondary */}
            <div className="-mt-[2%] -ml-[8%] sm:-ml-[12%] flex items-center gap-2 sm:gap-4">
              {/* Calligraphic Flourish Script SVG */}
              <div className="w-14 sm:w-24 md:w-32 h-auto flex items-center">
                <svg
                  viewBox="0 0 67 29"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-full h-auto overflow-visible"
                >
                  <path
                    ref={path1Ref}
                    d="M7.94189 16.9922C7.96435 16.8583 8.40999 15.9902 8.47301 15.7714C8.53604 15.5526 8.90033 14.5186 8.44189 13.9922C7.98346 13.4657 7.35388 13.4427 6.6611 13.4606C5.44192 13.4922 4.5438 13.9922 3.85282 14.3638C2.54648 15.0664 1.74647 15.9167 1.42035 16.3483C0.422904 17.6684 -0.251373 18.8292 0.56293 19.6228C0.941895 19.9922 1.92084 19.9916 3.03096 19.6271C3.44189 19.4922 4.08333 19.1198 5.2898 18.3466C6.86501 17.3372 8.25131 16.3553 9.3515 15.5526C10.875 14.441 11.3787 13.9036 11.5205 13.7417C11.7629 13.4649 10.9881 14.4008 9.84993 16.9688C9.22923 18.3693 9.08744 19.6821 9.44189 20.4922C9.91672 21.5773 11.5205 21.6236 11.9419 21.6145C13.0738 21.5901 13.4419 20.9922 16.0315 19.3271C19.2582 17.2525 25.6713 13.3405 28.8899 11.287C32.1084 9.23359 31.9792 9.22266 31.5512 9.45371C31.1231 9.68475 30.4001 10.1581 29.3361 11.1367C28.272 12.1153 26.8887 13.5848 25.9152 14.7004C24.9416 15.816 24.4198 16.5332 23.0885 17.9741C21.7571 19.415 19.6321 21.5579 18.4585 22.767C17.1029 24.1635 16.0817 25.0979 15.6625 25.3448C15.1073 25.6717 17.9618 23.2858 20.1124 21.6145C22.263 19.9431 24.6725 18.2603 26.8395 16.9677C29.0066 15.6751 30.7972 14.3601 31.8035 13.909C32.9068 13.4145 33.281 13.7509 33.4286 13.909C33.6298 14.1246 33.671 14.4922 33.6298 15.2526C33.4879 17.8721 33.1593 18.6985 33.6298 19.4819C33.78 19.732 34.0399 19.8437 34.3325 19.8906C34.7709 19.9609 35.1754 19.8684 36.2886 19.3483C37.2818 18.8842 39.5029 17.9718 40.9419 17.4922C42.4419 16.9922 43.6868 16.8528 44.4419 16.4922C46.2467 15.6303 46.4143 14.6625 46.4143 14.6625C46.4143 14.6625 46.4419 13.4922 45.4419 13.4922C44.9419 13.4922 44.4419 13.4922 43.6868 13.86C43.1903 14.1019 42.5416 14.4191 41.3916 15.3328C40.5444 16.006 39.2837 17.2514 38.4773 18.0576C36.761 19.7737 36.539 20.6507 36.5328 20.8289C36.5297 20.919 36.6461 20.9924 36.7726 21.0304C37.0524 21.1145 37.3769 21.0388 38.3332 20.7145C39.1526 20.4367 40.6157 19.8318 44.438 17.2632C48.2604 14.6946 54.3888 10.1559 58.3192 7.0807C62.2495 4.00553 63.7961 2.53147 64.7005 1.61301C65.6049 0.694543 65.8202 0.376341 65.8783 0.236074C65.9365 0.0958067 65.8311 0.143117 61.6533 4.75398C57.4754 9.36485 49.2284 18.5378 40.6641 28.146"
                    stroke="white"
                    strokeWidth="0.8"
                    strokeLinecap="round"
                    className="drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]"
                  />
                </svg>
              </div>

              <span className="he-word-archive font-serif-elegant text-4xl sm:text-7xl md:text-8xl lg:text-9xl font-light tracking-[0.08em] uppercase text-white leading-none">
                CONCERT
              </span>
            </div>

            {/* Bottom Grand Title: -mt-[2.3%] block font-headline (Direct match to 'HOLLYWOOD') */}
            <div className="w-full -mt-[2.2%] sm:-mt-[2.8%] overflow-hidden">
              <span className="he-word-exhibition block font-serif-elegant text-5xl sm:text-8xl md:text-9xl lg:text-[11.5rem] font-light tracking-[0.07em] uppercase text-white leading-[0.88]">
                EXHIBITION
              </span>
            </div>
          </div>
        </h1>
      </div>

      {/* Bottom Area: Direct match to Hollywood Exhibit 2026 footer */}
      <div
        ref={bottomInfoRef}
        className="relative z-20 flex flex-col items-center justify-center pb-8 sm:pb-12 text-center"
      >
        <div className="flex flex-col items-center gap-6">
          <div className="flex flex-col items-center justify-center font-mono-brutal text-[11px] sm:text-[13px] text-neutral-400 tracking-wider">
            <p>A Photography Exhibition by Aziz</p>
            <p className="text-white font-medium mt-0.5">Live from SoFi Stadium, Red Rocks & Lake Como</p>
          </div>

          {/* Hollywood Exhibit 2026 Exact Animated Spinner */}
          <div className="flex items-center gap-3">
            <svg
              ref={spinnerRef}
              className="animate-spin"
              width="22"
              height="22"
              viewBox="0 0 25 25"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M20.95 11.95C20.8 8.89996 18.95 6.04996 16.2 4.74996C13.2 3.39996 9.54999 3.94996 7.04999 6.04996C4.64999 8.04996 3.54999 11.3 4.24999 14.35C4.89999 17.35 7.24999 19.8 10.2 20.6C13.75 21.6 17 19.9 19 17C17.2 19.4 14.45 21 11.4 20.45C8.34999 19.9 5.84999 17.6 5.14999 14.6C4.39999 11.4 5.89999 8.04996 8.74999 6.39996C11.7 4.69996 15.85 5.34996 17.8 8.24996C18.3 8.94996 18.65 9.79996 18.8 10.65C18.95 11.35 18.9 12.1 19 12.8C19.1 13.45 19.65 14.3 20.4 13.85C21.05 13.45 21 12.6 20.95 11.95C21 12.3 20.95 11.75 20.95 11.95Z"
                fill="white"
              />
            </svg>
            <span className="font-mono-brutal text-[9px] uppercase tracking-[0.25em] text-neutral-500">
              CLICK ANYWHERE TO ENTER
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
