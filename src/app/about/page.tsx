"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { GalleryItem } from "@/types/gallery";
import { subscribeToGalleryItems } from "@/lib/gallery-service";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import SmoothScroll from "@/components/SmoothScroll";
import { AuthProvider } from "@/lib/auth-context";
import { ArrowRight } from "lucide-react";

function AboutContent() {
  const [items, setItems] = useState<GalleryItem[]>([]);

  useEffect(() => {
    const unsub = subscribeToGalleryItems((data) => {
      setItems(data);
    });
    return () => unsub();
  }, []);

  const clients = [
    "VOGUE",
    "ROLLING STONE",
    "GQ MAGAZINE",
    "WIRED",
    "NETFLIX",
    "MARIE CLAIRE",
    "FAST COMPANY",
    "BILLBOARD",
    "DEADLINE",
    "UNIVERSAL MUSIC GROUP",
    "LEICA ARCHIVE",
    "COACHELLA",
    "SONY MUSIC",
    "MET GALA NOIR",
    "SOFI STADIUM",
  ];

  const exhibitions = [
    {
      year: "2025",
      title: "Echoes of Arena Tour",
      venue: "Milk Studios // New York City",
      type: "Solo Exhibition",
    },
    {
      year: "2024",
      title: "After Hours Solo Archive",
      venue: "Leica Gallery // Los Angeles",
      type: "Curated Showcase",
    },
    {
      year: "2024",
      title: "International Photography Awards",
      venue: "1st Place Winner // Live Music & Editorial",
      type: "Honor",
    },
    {
      year: "2023",
      title: "American Photography 39",
      venue: "Annual Selected Winner // Portraiture",
      type: "Annual Archive",
    },
  ];

  return (
    <SmoothScroll>
      <main className="min-h-screen bg-[#FAF9F6] text-[#0A0A0A]">
        <div className="flex flex-col lg:flex-row min-h-screen">
          {/* Editorial Left Sidebar (Jessica Chou Style) */}
          <Sidebar items={items} />

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col min-w-0">
            <div className="w-full px-6 sm:px-12 lg:px-20 py-12 lg:py-20 max-w-5xl">
              {/* Top Bio Section with Natural Aspect Ratio Portrait */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-14 items-start pb-16 border-b border-black/[0.08]">
                {/* Photographer Portrait - Raw natural vertical presentation */}
                <div className="md:col-span-5">
                  <div className="relative w-full overflow-hidden bg-neutral-200 shadow-sm">
                    <img
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=75&w=800&auto=format&fit=crop"
                      alt="Aziz // Photographer"
                      loading="lazy"
                      decoding="async"
                      className="w-full h-auto block object-cover"
                    />
                  </div>
                  <span className="text-[10px] font-mono-brutal text-neutral-400 uppercase tracking-[0.25em] mt-3 block">
                    AZIZ // LOS ANGELES • NYC • WORLDWIDE
                  </span>
                </div>

                {/* Artist Bio & Statement */}
                <div className="md:col-span-7 space-y-6">
                  <div>
                    <span className="text-[11px] font-syne text-neutral-400 uppercase tracking-[0.28em] block mb-2">
                      BIOGRAPHY & STATEMENT
                    </span>
                    <h2 className="font-artistic text-3xl sm:text-4xl lg:text-5xl font-normal italic text-neutral-950 leading-[1.15]">
                      Documenting live arena energy, intimate backstage honesty, and editorial portraiture.
                    </h2>
                  </div>

                  <p className="font-sans text-sm sm:text-[15px] text-neutral-600 leading-relaxed">
                    Aziz is an editorial, portrait, and live tour photographer based between Los Angeles and New York City. His work bridges the kinetic atmosphere of world-stadium tours with the quiet authenticity of direct-flash portraiture.
                  </p>

                  <p className="font-sans text-sm sm:text-[15px] text-neutral-600 leading-relaxed">
                    Capturing high-profile editorial assignments for WIRED, Marie Claire, Netflix, and Fast Company, as well as official tour photography for leading global musical artists, Aziz prioritizes raw visual truth and natural geometry over digital artifice.
                  </p>

                  <div className="pt-4 flex items-center gap-4">
                    <Link
                      href="/contact"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-neutral-950 hover:bg-neutral-800 text-white font-syne text-[11px] uppercase tracking-[0.2em] transition-colors"
                    >
                      <span>Inquire / Book Commission</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>

              {/* Selected Clients Roster */}
              <div className="py-16 border-b border-black/[0.08]">
                <span className="text-[11px] font-syne text-neutral-400 uppercase tracking-[0.28em] block mb-6">
                  SELECTED CLIENTS & EDITORIAL PUBLICATIONS
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-y-4 gap-x-8 text-xs sm:text-[13px] font-syne tracking-[0.18em] text-neutral-800 uppercase font-medium">
                  {clients.map((c) => (
                    <div key={c} className="hover:text-black transition-colors">
                      {c}
                    </div>
                  ))}
                </div>
              </div>

              {/* Exhibitions & Recognition */}
              <div className="py-16">
                <span className="text-[11px] font-syne text-neutral-400 uppercase tracking-[0.28em] block mb-6">
                  EXHIBITIONS & RECOGNITION
                </span>
                <div className="space-y-6">
                  {exhibitions.map((ex, i) => (
                    <div
                      key={i}
                      className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 pb-4 border-b border-black/[0.05]"
                    >
                      <div className="flex items-baseline gap-4">
                        <span className="font-mono-brutal text-xs text-neutral-400 w-12 shrink-0">
                          {ex.year}
                        </span>
                        <div>
                          <h4 className="font-artistic text-base sm:text-lg font-normal italic text-neutral-950">
                            {ex.title}
                          </h4>
                          <p className="font-serif text-xs sm:text-[13px] text-neutral-500">
                            {ex.venue}
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono-brutal uppercase tracking-[0.2em] text-neutral-400 sm:text-right">
                        {ex.type}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <Footer />
          </div>
        </div>
      </main>
    </SmoothScroll>
  );
}

export default function AboutPage() {
  return (
    <AuthProvider>
      <AboutContent />
    </AuthProvider>
  );
}
