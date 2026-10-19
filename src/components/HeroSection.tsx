"use client";

import React from "react";
import { motion } from "framer-motion";
import { Camera, Flame, Music, Heart, Sparkles, ArrowDown } from "lucide-react";
import { GalleryCategory } from "@/types/gallery";

interface HeroSectionProps {
  activeCategory: "all" | GalleryCategory;
  onSelectCategory: (category: "all" | GalleryCategory) => void;
  categoryCounts: {
    all: number;
    events: number;
    concerts: number;
    singers: number;
    weddings: number;
  };
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export default function HeroSection({
  activeCategory,
  onSelectCategory,
  categoryCounts,
  searchQuery,
  onSearchChange,
}: HeroSectionProps) {
  const clients = [
    "THE WEEKND",
    "DUA LIPA",
    "ROLLING LOUD",
    "COACHELLA",
    "MET GALA NOIR",
    "BILLIE EILISH",
    "RED ROCKS",
    "VOGUE WEDDINGS",
    "BRIXTON ACADEMY",
    "LAKE COMO CEREMONIES",
    "LEICA M11 ARCHIVE",
  ];

  return (
    <section className="relative w-full pt-12 pb-8 border-b border-white/10 overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-red-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 md:px-8">
        {/* Top brutalist metadata breadcrumb */}
        <div className="flex flex-wrap items-center justify-between gap-4 text-[11px] font-mono-brutal text-neutral-400 uppercase tracking-widest pb-6 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="text-white font-bold">AZIZ VISUAL ARCHIVE</span>
            <span className="text-neutral-600">/</span>
            <span>VOL. 2026</span>
          </div>

          <div className="flex items-center gap-6">
            <span>BASED IN NYC & LOS ANGELES</span>
            <span className="hidden sm:inline text-neutral-600">|</span>
            <span className="hidden sm:inline">WORLDWIDE ON ASSIGNMENT</span>
          </div>
        </div>

        {/* Main Brutalist Giant Hero Title (Inspired by Deanie Chen 'LIVE') */}
        <div className="pt-8 pb-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <p className="text-xs sm:text-sm font-serif-elegant italic tracking-[0.25em] text-neutral-400 uppercase mb-2">
              Raw Stage Energy • Vocal Solos • Timeless Vows
            </p>
            <h1 className="font-display text-5xl sm:text-7xl md:text-9xl lg:text-[11rem] font-extrabold uppercase tracking-tighter text-white leading-[0.85] selection:bg-red-600 selection:text-white">
              LIVE<span className="text-red-600">.</span>
            </h1>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-6 items-end">
            <div className="md:col-span-7">
              <p className="font-mono-brutal text-xs sm:text-sm text-neutral-300 max-w-xl leading-relaxed">
                Capturing the unfiltered friction of live stadium stages, sweat-soaked mic drops, 
                neon-drenched festivals, and high-fashion editorial ceremonies. Every frame is treated 
                like a high-contrast vinyl record cover.
              </p>
            </div>

            {/* Quick stats counter */}
            <div className="md:col-span-5 flex items-center justify-between md:justify-end gap-6 sm:gap-10 font-mono-brutal text-xs border-t md:border-t-0 border-white/10 pt-4 md:pt-0">
              <div>
                <div className="font-display text-2xl sm:text-3xl font-black text-white">240+</div>
                <div className="text-[10px] uppercase text-neutral-500 tracking-wider">Shows Shot</div>
              </div>
              <div className="w-px h-8 bg-white/10" />
              <div>
                <div className="font-display text-2xl sm:text-3xl font-black text-white">48+</div>
                <div className="text-[10px] uppercase text-neutral-500 tracking-wider">Tours & Galas</div>
              </div>
              <div className="w-px h-8 bg-white/10" />
              <div>
                <div className="font-display text-2xl sm:text-3xl font-black text-red-500">100%</div>
                <div className="text-[10px] uppercase text-neutral-500 tracking-wider">Analog Spirit</div>
              </div>
            </div>
          </div>
        </div>

        {/* Client Roster Marquee Ticker */}
        <div className="relative w-full overflow-hidden border-y border-white/10 py-3 bg-white/[0.02]">
          <div className="animate-marquee flex items-center gap-12 font-mono-brutal text-[11px] text-neutral-400 uppercase tracking-widest">
            {clients.concat(clients).map((client, idx) => (
              <span key={idx} className="flex items-center gap-12 shrink-0">
                <span className="hover:text-white transition-colors">{client}</span>
                <span className="text-red-600 font-bold">•</span>
              </span>
            ))}
          </div>
        </div>

        {/* Category Filter Controls & Search */}
        <div id="categories" className="pt-8 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 font-mono-brutal text-xs">
          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => onSelectCategory("all")}
              className={`px-4 py-2 border uppercase tracking-wider transition-all duration-200 flex items-center gap-2 ${
                activeCategory === "all"
                  ? "bg-white text-black border-white font-bold"
                  : "bg-transparent text-neutral-400 border-white/10 hover:border-white/30 hover:text-white"
              }`}
            >
              <span>ALL ARCHIVES</span>
              <span className={`text-[10px] px-1.5 py-0.2 ${
                activeCategory === "all" ? "bg-black text-white" : "bg-white/10 text-neutral-300"
              }`}>
                {categoryCounts.all}
              </span>
            </button>

            <button
              onClick={() => onSelectCategory("concerts")}
              className={`px-4 py-2 border uppercase tracking-wider transition-all duration-200 flex items-center gap-2 ${
                activeCategory === "concerts"
                  ? "bg-white text-black border-white font-bold"
                  : "bg-transparent text-neutral-400 border-white/10 hover:border-white/30 hover:text-white"
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-red-500" />
              <span>CONCERTS</span>
              <span className={`text-[10px] px-1.5 py-0.2 ${
                activeCategory === "concerts" ? "bg-black text-white" : "bg-white/10 text-neutral-300"
              }`}>
                {categoryCounts.concerts}
              </span>
            </button>

            <button
              onClick={() => onSelectCategory("singers")}
              className={`px-4 py-2 border uppercase tracking-wider transition-all duration-200 flex items-center gap-2 ${
                activeCategory === "singers"
                  ? "bg-white text-black border-white font-bold"
                  : "bg-transparent text-neutral-400 border-white/10 hover:border-white/30 hover:text-white"
              }`}
            >
              <Music className="w-3.5 h-3.5 text-purple-400" />
              <span>SINGERS</span>
              <span className={`text-[10px] px-1.5 py-0.2 ${
                activeCategory === "singers" ? "bg-black text-white" : "bg-white/10 text-neutral-300"
              }`}>
                {categoryCounts.singers}
              </span>
            </button>

            <button
              onClick={() => onSelectCategory("weddings")}
              className={`px-4 py-2 border uppercase tracking-wider transition-all duration-200 flex items-center gap-2 ${
                activeCategory === "weddings"
                  ? "bg-white text-black border-white font-bold"
                  : "bg-transparent text-neutral-400 border-white/10 hover:border-white/30 hover:text-white"
              }`}
            >
              <Heart className="w-3.5 h-3.5 text-amber-300" />
              <span>WEDDINGS</span>
              <span className={`text-[10px] px-1.5 py-0.2 ${
                activeCategory === "weddings" ? "bg-black text-white" : "bg-white/10 text-neutral-300"
              }`}>
                {categoryCounts.weddings}
              </span>
            </button>

            <button
              onClick={() => onSelectCategory("events")}
              className={`px-4 py-2 border uppercase tracking-wider transition-all duration-200 flex items-center gap-2 ${
                activeCategory === "events"
                  ? "bg-white text-black border-white font-bold"
                  : "bg-transparent text-neutral-400 border-white/10 hover:border-white/30 hover:text-white"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>EVENTS</span>
              <span className={`text-[10px] px-1.5 py-0.2 ${
                activeCategory === "events" ? "bg-black text-white" : "bg-white/10 text-neutral-300"
              }`}>
                {categoryCounts.events}
              </span>
            </button>
          </div>

          {/* Quick Search */}
          <div className="relative min-w-[220px]">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="SEARCH BY ARTIST / VENUE..."
              className="w-full bg-[#121212] border border-white/15 px-3 py-2 text-white placeholder:text-neutral-600 focus:outline-none focus:border-white text-xs font-mono-brutal uppercase tracking-wider"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white text-xs"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
