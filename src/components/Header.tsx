"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Lock, Menu, X, Sparkles } from "lucide-react";

interface HeaderProps {
  onReplayIntro?: () => void;
  onOpenBooking?: () => void;
  activeCategory?: string;
  onSelectCategory?: (category: any) => void;
}

export default function Header({
  onReplayIntro,
  onOpenBooking,
  activeCategory,
  onSelectCategory,
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const navItems = [
    { label: "LIVE", href: "/live", category: "concerts" },
    { label: "PEOPLE", href: "/people", category: "people" },
    { label: "SINGERS", href: "#", category: "singers" },
    { label: "WEDDINGS", href: "#", category: "weddings" },
    { label: "ALL", href: "/", category: "all" },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-[#FAF9F6]/90 backdrop-blur-md transition-all border-b border-black/[0.06]">
      <div className="w-full px-4 sm:px-8 md:px-[60px] h-20 flex items-center justify-between">
        {/* Brand Logo - Deanie Chen style: Bold uppercase text with period */}
        <Link
          href="/"
          className="group flex items-center gap-1.5 focus:outline-none"
        >
          <span className="font-sans font-black text-xl sm:text-2xl tracking-[0.14em] text-black uppercase group-hover:opacity-75 transition-opacity">
            AZIZOGRAPHY.
          </span>
        </Link>

        {/* Desktop Navigation - Exact match to Deanie Chen typography and spacing (Pearl White Light Theme) */}
        <nav className="hidden md:flex items-center gap-7 lg:gap-9 text-[11px] sm:text-[12px] uppercase font-sans tracking-[0.18em]">
          {navItems.map((item) => {
            const isActive =
              (item.category === "all" && activeCategory === "all" && pathname === "/") ||
              (item.category !== "all" && activeCategory === item.category);

            return (
              <button
                key={item.label}
                type="button"
                onClick={() => {
                  if (onSelectCategory) {
                    onSelectCategory(item.category);
                  }
                }}
                className={`transition-colors duration-200 cursor-pointer ${
                  isActive
                    ? "text-black font-black underline underline-offset-4 decoration-black"
                    : "text-neutral-500 hover:text-black"
                }`}
              >
                {item.label}
              </button>
            );
          })}

          <a
            href="#about"
            className="text-neutral-500 hover:text-black transition-colors duration-200 cursor-pointer"
          >
            ABOUT
          </a>

          {onOpenBooking ? (
            <button
              type="button"
              onClick={onOpenBooking}
              className="text-neutral-500 hover:text-black transition-colors duration-200 cursor-pointer"
            >
              CONTACT
            </button>
          ) : (
            <a
              href="#contact"
              className="text-neutral-500 hover:text-black transition-colors duration-200 cursor-pointer"
            >
              CONTACT
            </a>
          )}

          {/* Intro Replay Button */}
          {onReplayIntro && (
            <button
              type="button"
              onClick={onReplayIntro}
              title="Replay Iris Gallery Intro"
              className="flex items-center gap-1 text-[10px] text-neutral-500 hover:text-black tracking-widest uppercase transition-colors cursor-pointer pl-3 border-l border-black/10"
            >
              <Sparkles className="w-3 h-3 text-red-600" />
              <span>IRIS INTRO</span>
            </button>
          )}

          {/* Admin Login Link */}
          <Link
            href="/admin"
            title="Admin Portal"
            className="text-neutral-500 hover:text-black transition-colors flex items-center gap-1 pl-1"
          >
            <Lock className="w-3.5 h-3.5" />
            <span className="text-[10px] tracking-widest font-mono">ADMIN</span>
          </Link>
        </nav>

        {/* Mobile Navigation Trigger */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-neutral-800 hover:text-black"
          aria-label="Toggle Navigation"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#FAF9F6] border-b border-black/10 px-6 py-8 flex flex-col gap-6 text-sm uppercase font-sans tracking-[0.2em]">
          {navItems.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                if (onSelectCategory) {
                  onSelectCategory(item.category);
                }
              }}
              className={`text-left py-1 transition-colors ${
                activeCategory === item.category ? "text-black font-bold" : "text-neutral-500 hover:text-black"
              }`}
            >
              {item.label}
            </button>
          ))}

          <a
            href="#about"
            onClick={() => setMobileMenuOpen(false)}
            className="text-neutral-500 hover:text-black py-1"
          >
            ABOUT
          </a>

          <a
            href="#contact"
            onClick={() => setMobileMenuOpen(false)}
            className="text-neutral-500 hover:text-black py-1"
          >
            CONTACT
          </a>

          <div className="pt-4 border-t border-black/10 flex items-center justify-between text-xs text-neutral-600">
            {onReplayIntro && (
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onReplayIntro();
                }}
                className="flex items-center gap-2 hover:text-black"
              >
                <Sparkles className="w-3.5 h-3.5 text-red-600" />
                <span>REPLAY IRIS INTRO</span>
              </button>
            )}

            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-1.5 hover:text-black"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>ADMIN PORTAL</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
