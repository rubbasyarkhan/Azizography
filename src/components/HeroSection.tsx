"use client";

import React from "react";
import { GalleryCategory } from "@/types/gallery";

interface HeroSectionProps {
  activeCategory: "all" | GalleryCategory;
  onSelectCategory: (category: "all" | GalleryCategory) => void;
  categoryCounts: {
    all: number;
    people?: number;
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
  const categories: { key: "all" | GalleryCategory; label: string }[] = [
    { key: "all", label: "ALL" },
    { key: "people", label: "PEOPLE" },
    { key: "concerts", label: "CONCERTS" },
    { key: "singers", label: "SINGERS" },
    { key: "weddings", label: "WEDDINGS" },
    { key: "events", label: "EVENTS" },
  ];

  return (
    <section className="w-full px-4 sm:px-8 md:px-[60px] pt-8 pb-4">
      {/* 
        Deanie Chen Minimalist Style:
        Clean category selector & unobtrusive search in Pearl White theme
      */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-black/[0.08] pb-4">
        {/* Category Filter Tabs */}
        <div className="flex items-center gap-7 overflow-x-auto no-scrollbar py-1">
          {categories.map((cat) => {
            const isActive = activeCategory === cat.key;
            return (
              <button
                key={cat.key}
                type="button"
                onClick={() => onSelectCategory(cat.key)}
                className={`text-[11px] sm:text-xs font-sans uppercase tracking-[0.2em] whitespace-nowrap transition-colors duration-200 cursor-pointer ${
                  isActive
                    ? "text-black font-black border-b-2 border-black pb-0.5"
                    : "text-neutral-400 hover:text-black font-medium"
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Minimal Search Input */}
        <div className="relative self-end sm:self-auto w-full sm:w-52">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="SEARCH ARCHIVE..."
            className="w-full bg-transparent border-b border-black/20 px-1 py-1 text-xs text-black placeholder:text-neutral-400 focus:outline-none focus:border-black uppercase tracking-wider font-sans transition-colors"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="absolute right-1 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-black text-xs cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
