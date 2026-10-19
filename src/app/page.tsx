"use client";

import React, { useState, useEffect, useMemo } from "react";
import { GalleryItem, GalleryCategory } from "@/types/gallery";
import { subscribeToGalleryItems } from "@/lib/gallery-service";
import IntroLoader from "@/components/IntroLoader";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import GalleryGrid from "@/components/GalleryGrid";
import LightboxModal from "@/components/LightboxModal";
import AboutSection from "@/components/AboutSection";
import Footer from "@/components/Footer";
import SmoothScroll from "@/components/SmoothScroll";
import { AuthProvider } from "@/lib/auth-context";

export default function HomePage() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<"all" | GalleryCategory>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLightboxItem, setSelectedLightboxItem] = useState<GalleryItem | null>(null);
  const [forceShowIntro, setForceShowIntro] = useState(false);
  const [introFinished, setIntroFinished] = useState(false);

  // Subscribe to live gallery items
  useEffect(() => {
    const unsubscribe = subscribeToGalleryItems((data) => {
      setItems(data);
    });
    return () => unsubscribe();
  }, []);

  // Filter items
  const filteredItems = useMemo(() => {
    return items
      .filter((item) => item.isVisible !== false)
      .filter((item) => {
        if (activeCategory === "all") return true;
        return item.category === activeCategory;
      })
      .filter((item) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
          item.title.toLowerCase().includes(q) ||
          (item.artist && item.artist.toLowerCase().includes(q)) ||
          (item.location && item.location.toLowerCase().includes(q)) ||
          (item.tags && item.tags.some((t) => t.toLowerCase().includes(q)))
        );
      });
  }, [items, activeCategory, searchQuery]);

  // Compute category counts
  const categoryCounts = useMemo(() => {
    const visible = items.filter((i) => i.isVisible !== false);
    return {
      all: visible.length,
      concerts: visible.filter((i) => i.category === "concerts").length,
      singers: visible.filter((i) => i.category === "singers").length,
      weddings: visible.filter((i) => i.category === "weddings").length,
      events: visible.filter((i) => i.category === "events").length,
    };
  }, [items]);

  const handleReplayIntro = () => {
    setForceShowIntro(true);
    setIntroFinished(false);
  };

  return (
    <AuthProvider>
      <SmoothScroll>
        <main className="relative min-h-screen bg-[#070707] text-[#f5f5f7]">
          {/* Cinematic Intro Animation */}
          <IntroLoader
            forceShow={forceShowIntro}
            onComplete={() => {
              setIntroFinished(true);
              setForceShowIntro(false);
            }}
          />

          {/* Main Visuals Showcase */}
          <div className="relative z-10 flex flex-col min-h-screen">
            <Header
              onReplayIntro={handleReplayIntro}
            />

            <HeroSection
              activeCategory={activeCategory}
              onSelectCategory={setActiveCategory}
              categoryCounts={categoryCounts}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            />

            <GalleryGrid
              items={filteredItems}
              onOpenLightbox={(item) => setSelectedLightboxItem(item)}
            />

            <AboutSection />

            <Footer />
          </div>

          {/* Lightbox Modal */}
          <LightboxModal
            item={selectedLightboxItem}
            items={filteredItems}
            onClose={() => setSelectedLightboxItem(null)}
            onSelect={(item) => setSelectedLightboxItem(item)}
          />
        </main>
      </SmoothScroll>
    </AuthProvider>
  );
}
