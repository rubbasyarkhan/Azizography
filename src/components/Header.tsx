"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Camera, Lock, Menu, X, ArrowUpRight, Sparkles } from "lucide-react";

interface HeaderProps {
  onReplayIntro?: () => void;
  onOpenBooking?: () => void;
}

export default function Header({ onReplayIntro, onOpenBooking }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const isHome = pathname === "/" || pathname === "/live";

  return (
    <header className="sticky top-0 z-40 w-full bg-[#070707]/90 backdrop-blur-md border-b border-white/10 font-mono-brutal text-xs transition-all">
      <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
        {/* Logo / Brand */}
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-2 group"
          >
            <div className="w-3 h-3 bg-red-600 group-hover:scale-125 transition-transform duration-300" />
            <span className="font-display text-lg md:text-xl font-black tracking-tight text-white uppercase group-hover:tracking-wider transition-all duration-300">
              AZIZOGRAPHY
            </span>
          </Link>
          <span className="hidden lg:inline text-[10px] text-neutral-500 uppercase tracking-widest pl-3 border-l border-white/10">
            LIVE CONCERTS & CEREMONIES
          </span>
        </div>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-8 text-[11px] uppercase tracking-wider text-neutral-400">
          <Link
            href="/"
            className={`transition-colors hover:text-white ${
              pathname === "/" ? "text-white font-bold" : ""
            }`}
          >
            01. Live Portfolio
          </Link>
          <a
            href="#categories"
            className="transition-colors hover:text-white"
          >
            02. Categories
          </a>
          <a
            href="#about"
            className="transition-colors hover:text-white"
          >
            03. About / Clients
          </a>
          {onOpenBooking ? (
            <button
              onClick={onOpenBooking}
              className="transition-colors hover:text-white text-left"
            >
              04. Inquire
            </button>
          ) : (
            <a
              href="#contact"
              className="transition-colors hover:text-white"
            >
              04. Inquire
            </a>
          )}
        </nav>

        {/* Actions / Admin & Replay */}
        <div className="hidden sm:flex items-center gap-3">
          {onReplayIntro && (
            <button
              onClick={onReplayIntro}
              title="Replay Hollywood Exhibit 2026 Intro"
              className="px-2.5 py-1 text-[10px] uppercase tracking-widest text-neutral-400 hover:text-white border border-white/10 hover:border-white/30 transition-all flex items-center gap-1.5"
            >
              <Sparkles className="w-3 h-3 text-red-500" />
              <span>Intro</span>
            </button>
          )}

          <Link
            href="/admin"
            className="flex items-center gap-1.5 px-3 py-1.5 border border-white/20 hover:border-white text-white hover:bg-white hover:text-black transition-all duration-300 text-[10px] font-bold uppercase tracking-widest"
          >
            <Lock className="w-3 h-3 text-red-500" />
            <span>Admin Portal</span>
          </Link>
        </div>

        {/* Mobile menu trigger */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-neutral-400 hover:text-white border border-white/10"
          aria-label="Toggle Navigation"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-white/10 bg-[#070707] px-6 py-6 flex flex-col gap-4 text-sm uppercase tracking-wider">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="py-2 text-white hover:text-red-500 transition-colors"
          >
            01. Live Portfolio
          </Link>
          <a
            href="#categories"
            onClick={() => setMobileMenuOpen(false)}
            className="py-2 text-neutral-300 hover:text-white transition-colors"
          >
            02. Categories
          </a>
          <a
            href="#about"
            onClick={() => setMobileMenuOpen(false)}
            className="py-2 text-neutral-300 hover:text-white transition-colors"
          >
            03. About / Clients
          </a>
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onOpenBooking?.();
            }}
            className="py-2 text-left text-neutral-300 hover:text-white transition-colors"
          >
            04. Inquire / Booking
          </button>

          <div className="pt-4 border-t border-white/10 flex flex-col gap-3">
            {onReplayIntro && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onReplayIntro();
                }}
                className="flex items-center justify-between py-2 text-xs text-neutral-400"
              >
                <span>Replay Cinematic Intro</span>
                <Sparkles className="w-3.5 h-3.5 text-red-500" />
              </button>
            )}

            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between p-3 border border-red-500/40 text-red-400 hover:bg-red-500/10 text-xs font-bold uppercase tracking-widest"
            >
              <span>Admin Portal Login</span>
              <Lock className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
