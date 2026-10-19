"use client";

import React from "react";
import Link from "next/link";
import { ArrowUp, Lock, Music2, Globe, Disc, Mail } from "lucide-react";

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="w-full bg-[#050505] border-t border-white/10 font-mono-brutal text-xs py-16">
      <div className="max-w-7xl mx-auto px-4 md:px-8 space-y-12">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-8 pb-12 border-b border-white/10">
          <div>
            <span className="text-[10px] text-red-500 font-bold uppercase tracking-widest block mb-2">
              // AZIZOGRAPHY ARCHIVE
            </span>
            <div className="font-display text-4xl sm:text-6xl font-black text-white uppercase tracking-tighter">
              CAPTURE THE THUNDER.
            </div>
            <p className="text-neutral-400 mt-2 text-xs">
              Concert, Singer, and Wedding Visuals. Available for global travel.
            </p>
          </div>

          <button
            onClick={scrollToTop}
            className="flex items-center gap-2 px-4 py-2 border border-white/20 hover:border-white text-neutral-300 hover:text-white transition-all uppercase tracking-wider"
          >
            <span>BACK TO TOP</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 text-[11px] uppercase tracking-wider text-neutral-400">
          <div>
            <h4 className="text-white font-bold mb-3 tracking-widest">Connect</h4>
            <ul className="space-y-2">
              <li>
                <a href="https://instagram.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
                  Instagram // @azizography
                </a>
              </li>
              <li>
                <a href="https://twitter.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
                  Twitter // X
                </a>
              </li>
              <li>
                <a href="https://spotify.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
                  Tour Playlists
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-3 tracking-widest">Categories</h4>
            <ul className="space-y-2">
              <li><a href="#categories" className="hover:text-white">Events & Festivals</a></li>
              <li><a href="#categories" className="hover:text-white">Singer Spotlight</a></li>
              <li><a href="#categories" className="hover:text-white">Weddings & Vows</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-3 tracking-widest">Tech Spec</h4>
            <ul className="space-y-2 text-neutral-500">
              <li>Next.js App Router</li>
              <li>Firebase Storage & DB</li>
              <li>GSAP & Framer Motion</li>
              <li>dnd-kit Canvas</li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-3 tracking-widest">Administration</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/admin"
                  className="inline-flex items-center gap-1.5 text-red-400 hover:text-red-300 font-bold"
                >
                  <Lock className="w-3 h-3" />
                  <span>Admin Portal</span>
                </Link>
              </li>
              <li className="text-[10px] text-neutral-500 lowercase">
                admin@azizograhy.com
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] text-neutral-500 uppercase tracking-widest">
          <div>© {new Date().getFullYear()} AZIZOGRAPHY. ALL RIGHTS RESERVED.</div>
          <div>HOLLYWOOD EXHIBIT 2026 // DEANIE CHEN ARCHIVE TRIBUTE</div>
        </div>
      </div>
    </footer>
  );
}
