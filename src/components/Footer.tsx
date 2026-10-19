"use client";

import React from "react";
import Link from "next/link";
import { ArrowUp, Lock } from "lucide-react";

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="w-full bg-[#FAF9F6] border-t border-black/[0.08] text-xs py-14 px-4 sm:px-8 md:px-[60px]">
      <div className="w-full flex flex-col md:flex-row items-start md:items-center justify-between gap-8 pb-10 border-b border-black/[0.08]">
        <div>
          <div className="font-artistic text-2xl sm:text-3xl font-normal text-black tracking-wide">
            AZIZOGRAPHY.
          </div>
          <p className="font-syne text-[11px] text-neutral-400 mt-1 uppercase tracking-[0.2em]">
            CONCERT, PEOPLE & EDITORIAL PHOTOGRAPHY // LOS ANGELES • NYC • WORLDWIDE
          </p>
        </div>

        <button
          type="button"
          onClick={scrollToTop}
          className="flex items-center gap-2 text-xs font-syne uppercase tracking-[0.2em] text-neutral-400 hover:text-black transition-colors cursor-pointer"
        >
          <span>BACK TO TOP</span>
          <ArrowUp className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="w-full pt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 font-syne text-[10px] text-neutral-400 uppercase tracking-[0.22em]">
        <div className="flex items-center gap-6">
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noreferrer"
            className="hover:text-black transition-colors"
          >
            INSTAGRAM
          </a>
          <a
            href="https://twitter.com"
            target="_blank"
            rel="noreferrer"
            className="hover:text-black transition-colors"
          >
            TWITTER / X
          </a>
          <a
            href="mailto:inquiries@azizography.com"
            className="hover:text-black transition-colors"
          >
            EMAIL
          </a>
          <Link
            href="/admin"
            className="hover:text-black transition-colors flex items-center gap-1"
          >
            <Lock className="w-3 h-3" />
            <span>ADMIN</span>
          </Link>
        </div>

        <div>
          © {new Date().getFullYear()} AZIZOGRAPHY. ALL RIGHTS RESERVED.
        </div>
      </div>
    </footer>
  );
}
