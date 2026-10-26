"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { GalleryItem } from "@/types/gallery";
import { subscribeToGalleryItems } from "@/lib/gallery-service";
import {
  AboutContent as AboutContentType,
  ClientItem,
  DEFAULT_ABOUT_CONTENT,
  subscribeToAboutContent,
} from "@/lib/about-service";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { AuthProvider } from "@/lib/auth-context";
import { ArrowRight, Sparkles } from "lucide-react";

function AboutContent() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [about, setAbout] = useState<AboutContentType>(DEFAULT_ABOUT_CONTENT);
  const [hoveredClient, setHoveredClient] = useState<ClientItem | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const unsubGallery = subscribeToGalleryItems((data) => {
      setItems(data);
    });
    const unsubAbout = subscribeToAboutContent((data) => {
      setAbout(data);
    });
    return () => {
      try {
        unsubGallery();
      } catch {
        // Safe unsubscription cleanup
      }
      try {
        unsubAbout();
      } catch {
        // Safe unsubscription cleanup
      }
    };
  }, []);

  // Track cursor coordinates for interactive floating hover image
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const portraitItem = useMemo(() => {
    return (
      items.find(
        (i) => i.tags?.some((t) => t.toLowerCase() === "portrait") || i.category === "people"
      ) || items[0]
    );
  }, [items]);

  const displayPortraitUrl = about.portraitImageUrl || portraitItem?.imageUrl;
  const clientList: ClientItem[] = useMemo(() => {
    if (about.clients && about.clients.length > 0) {
      return about.clients;
    }
    return DEFAULT_ABOUT_CONTENT.clients;
  }, [about.clients]);

  return (
    <main className="min-h-screen bg-[#FAF9F6] text-[#0A0A0A] relative">
      {/* Floating Interactive Hover Image Cursor Follower (Desktop / Laptop / Tablet) */}
      <div
        aria-hidden="true"
        className={`fixed pointer-events-none z-50 transition-opacity duration-200 ease-out hidden md:block ${
          hoveredClient && hoveredClient.imageUrl ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"
        }`}
        style={{
          left: `${mousePos.x}px`,
          top: `${mousePos.y}px`,
          transform: `translate3d(${
            typeof window !== "undefined" && mousePos.x > window.innerWidth * 0.65 ? "-110%" : "28px"
          }, ${
            typeof window !== "undefined" && mousePos.y > window.innerHeight * 0.6 ? "-90%" : "-20%"
          }, 0)`,
          transition: "transform 0.12s ease-out, opacity 0.22s ease-out, scale 0.22s ease-out",
        }}
      >
        {hoveredClient && hoveredClient.imageUrl && (
          <div className="w-56 lg:w-64 aspect-[3/4] bg-stone-900 rounded-xl overflow-hidden shadow-2xl border border-white/20 relative">
            <img
              src={hoveredClient.imageUrl}
              alt={hoveredClient.name}
              className="w-full h-full object-cover transition-transform duration-500 scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent flex flex-col justify-end p-4">
              <span className="font-artistic italic text-lg lg:text-xl text-white font-medium leading-tight">
                {hoveredClient.name}
              </span>
              {hoveredClient.category && (
                <span className="font-syne text-[10px] uppercase tracking-wider text-stone-300 mt-1">
                  {hoveredClient.category}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Top Navigation Bar: FULL ARCHIVE, ABOUT, CONTACT */}
      <Navbar items={items} />

      <div className="flex-1 flex flex-col lg:flex-row min-w-0">
        <Sidebar items={items} brandName="Azizography." />

        {/* Main Content Area */}
        <div className="flex-1 w-full min-w-0">
          <div className="w-full max-w-5xl px-6 sm:px-12 lg:px-16 py-12 lg:py-20">
            {/* Top Bio Section with Natural Aspect Ratio Portrait */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-14 items-start pb-16 border-b border-[#DDD6CA]">
              {/* Photographer Portrait */}
              <div className="md:col-span-5">
                <div className="relative w-full overflow-hidden bg-[#EDE8DF] shadow-sm rounded-lg sm:rounded-none">
                  {displayPortraitUrl ? (
                    <img
                      src={displayPortraitUrl}
                      alt="Aziz // Photographer"
                      loading="lazy"
                      decoding="async"
                      className="w-full h-auto block object-cover"
                    />
                  ) : (
                    <div className="w-full aspect-[3/4] bg-[#EDE8DF] flex flex-col items-center justify-center p-8 border border-[#DDD6CA] text-center">
                      <span className="font-artistic text-5xl italic text-[#78716C]">A</span>
                      <span className="text-[10px] font-syne tracking-[0.25em] text-[#78716C] uppercase mt-4">
                        Aziz Archive
                      </span>
                    </div>
                  )}
                </div>
                <span className="text-[10px] font-mono-brutal text-[#78716C] uppercase tracking-[0.25em] mt-3 block">
                  {about.locationBadge || "AZIZ // LOS ANGELES • NYC • All over Karachi"}
                </span>
              </div>

              {/* Artist Bio & Statement */}
              <div className="md:col-span-7 space-y-6">
                <div>
                  <span className="text-[11px] font-syne text-[#78716C] uppercase tracking-[0.28em] block mb-2">
                    BIOGRAPHY & STATEMENT
                  </span>
                  <h2 className="font-artistic text-3xl sm:text-4xl lg:text-5xl font-semibold italic text-[#1C1917] leading-[1.15]">
                    {about.headline || "Documenting live arena energy, intimate backstage honesty, and editorial portraiture."}
                  </h2>
                </div>

                <p className="font-sans text-sm sm:text-[15px] text-[#57534E] leading-relaxed whitespace-pre-line">
                  {about.bioParagraph1 || "Aziz is an editorial, portrait, and live tour photographer based between Los Angeles and New York City. His work bridges the kinetic atmosphere of world-stadium tours with the quiet authenticity of direct-flash portraiture."}
                </p>

                {about.bioParagraph2 && (
                  <p className="font-sans text-sm sm:text-[15px] text-[#57534E] leading-relaxed whitespace-pre-line">
                    {about.bioParagraph2}
                  </p>
                )}

                <div className="pt-4 flex items-center gap-4">
                  <Link
                    href="/contact"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-[#1C1917] hover:bg-[#292524] text-[#FAF7F2] font-syne text-[11px] uppercase tracking-[0.2em] transition-colors shadow-xs"
                  >
                    <span>Inquire / Book Commission</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Selected Clients & Editorial Publications (2 in a Row Grid Layout with Interactive Image Cursor) */}
            <div className="py-16">
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between mb-8 pb-4 border-b border-[#DDD6CA]">
                <div>
                  <span className="text-[11px] font-syne text-[#78716C] uppercase tracking-[0.28em] block mb-1">
                    SELECTED CLIENTS & EDITORIAL PUBLICATIONS
                  </span>

                </div>
                <span className="text-xs font-mono-brutal text-stone-500 mt-1 sm:mt-0">
                  {clientList.length} COMMISSIONS
                </span>
              </div>

              {/* 2 in a Row Grid (Mobile: 1 col, Tablet/Desktop: 2 in a row) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 lg:gap-x-16">
                {clientList.map((client, idx) => (
                  <div
                    key={client.id || idx}
                    onMouseEnter={() => setHoveredClient(client)}
                    onMouseLeave={() => setHoveredClient(null)}
                    className="group relative flex items-center justify-between py-4 sm:py-5 border-b border-[#DDD6CA]/70 cursor-pointer transition-all duration-200 hover:border-[#1C1917]"
                  >
                    <div className="flex items-baseline gap-4 sm:gap-6 min-w-0 pr-3">
                      <span className="font-mono-brutal text-[11px] sm:text-xs text-[#78716C] group-hover:text-[#1C1917] transition-colors shrink-0">
                        {String(idx + 1).padStart(2, "0")}
                      </span>
                      <div className="min-w-0">
                        <h3 className="font-artistic text-xl sm:text-2xl lg:text-3xl font-medium italic text-[#1C1917] group-hover:translate-x-1 transition-all duration-300 truncate">
                          {client.name}
                        </h3>
                        {client.category && (
                          <p className="font-syne text-[10px] sm:text-[11px] text-[#78716C] uppercase tracking-[0.2em] mt-0.5 group-hover:text-[#57534E] transition-colors">
                            {client.category}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Right Side: Mobile Inline Visual & Arrow */}
                    <div className="flex items-center gap-3 shrink-0">
                      {/* Mobile thumbnail when an image is uploaded for this client */}
                      {client.imageUrl && (
                        <div className="md:hidden w-12 h-14 rounded-md overflow-hidden bg-stone-200 border border-[#DDD6CA] shrink-0">
                          <img
                            src={client.imageUrl}
                            alt={client.name}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        </div>
                      )}
                      <ArrowRight className="w-4 h-4 text-[#78716C] group-hover:text-[#1C1917] group-hover:translate-x-1 transition-all duration-300 hidden sm:block" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 100% Full-Width Editorial Footer */}
      <Footer />
    </main>
  );
}

export default function AboutPage() {
  return (
    <AuthProvider>
      <Suspense fallback={null}>
        <AboutContent />
      </Suspense>
    </AuthProvider>
  );
}
