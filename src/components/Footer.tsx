"use client";

import React from "react";
import { ArrowUp } from "lucide-react";

export default function Footer() {
  const scrollToTop = () => {
    if (typeof window !== "undefined") {
      const lenis = (window as unknown as { __lenis?: { scrollTo: (target: number | string) => void } }).__lenis;
      if (lenis && typeof lenis.scrollTo === "function") {
        lenis.scrollTo(0);
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
  };

  const metadataSpecs = [
    {
      label: "Base",
      content: <span>Karachi, Pakistan</span>,
    },
    {
      label: "Practice",
      content: (
        <span>
          Concert Photography · Editorial Portraits · Street Photography · Brand Shoots
        </span>
      ),
    },
    {
      label: "Phone",
      content: (
        <a
          href="tel:+923112494768"
          className="hover:text-neutral-400 transition-colors"
        >
          +92 311 2494768
        </a>
      ),
    },
    {
      label: "Email",
      content: (
        <a
          href="mailto:azizfaiq18@gmail.com"
          className="hover:text-neutral-400 transition-colors"
        >
          azizfaiq18@gmail.com
        </a>
      ),
    },
    {
      label: "Instagram",
      content: (
        <a
          href="https://www.instagram.com/faiq.aziz321?obrf=dmNuMWF0YXBkNW84"
          target="_blank"
          rel="noreferrer"
          className="hover:text-neutral-400 transition-colors"
        >
          @faiq.aziz321
        </a>
      ),
    },
  ];

  return (
    <footer className="relative w-full min-h-screen bg-[#0A0A0A] text-[#FAF9F6] flex flex-col justify-between pt-16 sm:pt-20 pb-10 sm:pb-14 px-6 sm:px-12 md:px-16 lg:px-24 selection:bg-white selection:text-black border-t border-neutral-900 overflow-hidden">
      {/* Foreground Content */}
      <div className="relative z-20 flex flex-col justify-between flex-1 pointer-events-auto">
        {/* Top Metadata Spec Table with Clean Minimalist Editorial Styling */}
        <div className="w-full border-t border-b border-neutral-800 divide-y divide-neutral-900">
          {metadataSpecs.map((spec) => (
            <div
              key={spec.label}
              className="grid grid-cols-12 py-4 sm:py-5 gap-4 items-baseline"
            >
              <div className="col-span-4 sm:col-span-3 md:col-span-2 text-[#FAF9F6] font-sans font-medium text-xs sm:text-sm uppercase tracking-[0.2em]">
                {spec.label}
              </div>
              <div className="col-span-8 sm:col-span-9 md:col-span-10 text-[#FAF9F6] font-sans font-normal text-sm sm:text-base md:text-lg tracking-wide leading-relaxed">
                {spec.content}
              </div>
            </div>
          ))}
        </div>

        {/* Editorial Hero CTA with Cursive Subtitle & Decreased Size */}
        <div className="my-auto py-12 sm:py-16 md:py-20 flex flex-col items-center justify-center text-center">
          <p className="font-artistic-cursive text-xl sm:text-2xl md:text-3xl lg:text-4xl text-[#FAF9F6] tracking-wide mb-3 sm:mb-5 text-center">
            Let me preserve the moment so you can relive it
          </p>

          <a
            href="mailto:azizfaiq18@gmail.com"
            className="group inline-flex items-center justify-center gap-4 sm:gap-6 border-b border-neutral-700 pb-4 sm:pb-6 focus:outline-none transition-colors"
          >
            <span className="font-playfair text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-[#FAF9F6] tracking-tight group-hover:text-neutral-300 transition-colors duration-300 leading-tight">
              Hello — Get in touch !
            </span>
            <span className="text-[#FAF9F6] group-hover:text-neutral-300 transition-transform duration-300 group-hover:translate-x-2 group-hover:-translate-y-2 shrink-0">
              <svg
                className="w-7 h-7 sm:w-9 sm:h-9 md:w-11 md:h-11"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="7" y1="17" x2="17" y2="7" />
                <polyline points="7 7 17 7 17 17" />
              </svg>
            </span>
          </a>
        </div>

        {/* Bottom Sub-bar with #FAF9F6 Website Background Color & High Opacity */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 font-syne text-xs sm:text-[13px] text-[#FAF9F6] uppercase tracking-[0.22em] pt-6 border-t border-neutral-800">
          <div className="flex flex-wrap items-center gap-6">
            <a
              href="https://www.instagram.com/faiq.aziz321?obrf=dmNuMWF0YXBkNW84"
              target="_blank"
              rel="noreferrer"
              className="hover:text-white transition-colors"
            >
              INSTAGRAM
            </a>
            <a
              href="mailto:azizfaiq18@gmail.com"
              className="hover:text-white transition-colors"
            >
              EMAIL
            </a>
            <a
              href="tel:+923112494768"
              className="hover:text-white transition-colors"
            >
              +92 311 2494768
            </a>
          </div>

          <div className="flex items-center justify-between w-full sm:w-auto gap-8 text-[#FAF9F6]">
            <div className="font-semibold">
              © {new Date().getFullYear()} AZIZOGRAPHY. ALL RIGHTS RESERVED.
            </div>
            <button
              type="button"
              onClick={scrollToTop}
              className="flex items-center gap-2 text-[#FAF9F6] hover:text-white transition-colors cursor-pointer font-semibold"
            >
              <span>BACK TO TOP</span>
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
