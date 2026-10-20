"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X } from "lucide-react";
import { GalleryItem } from "@/types/gallery";
import {
  CATEGORY_DISPLAY_LABELS,
  normalizeCategory,
  getCategoryDisplayLabel,
} from "@/lib/filter-utils";

interface SidebarProps {
  items: GalleryItem[];
  activeFilter?: string;
  onSelectFilter?: (filter: string) => void;
  brandName?: string;
}

function Sidebar({
  items,
  activeFilter = "all",
  onSelectFilter,
  brandName = "Azizography.",
}: SidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // Extract dynamic categories, series, and tags from live gallery items
  const dynamicSections = React.useMemo(() => {
    const list: { label: string; filterValue: string; count: number }[] = [];
    const seen = new Set<string>();

    // 1. Core Category counts
    const categoryCounts: Record<string, number> = {};
    for (const itm of items) {
      if (itm.category) {
        const norm = normalizeCategory(itm.category);
        categoryCounts[norm] = (categoryCounts[norm] || 0) + 1;
      }
    }

    // Include primary categories that have items, or key portfolio sections
    const standardCategories = ["people", "concerts", "singers", "weddings", "events"];
    for (const cat of standardCategories) {
      const count = categoryCounts[cat] || 0;
      if (count > 0 || items.length === 0) {
        const label = CATEGORY_DISPLAY_LABELS[cat] || cat;
        seen.add(cat.toLowerCase());
        seen.add(label.toLowerCase());
        list.push({ label, filterValue: cat, count });
      }
    }

    // 2. Series / Projects
    const seriesCounts = new Map<string, { label: string; count: number }>();
    for (const itm of items) {
      if (itm.seriesOrProject && itm.seriesOrProject.trim()) {
        const val = itm.seriesOrProject.trim();
        const key = val.toLowerCase();
        if (!seen.has(key)) {
          const existing = seriesCounts.get(key);
          if (existing) {
            existing.count++;
          } else {
            seriesCounts.set(key, { label: val, count: 1 });
          }
        }
      }
    }

    seriesCounts.forEach((val, key) => {
      seen.add(key);
      list.push({ label: val.label, filterValue: val.label, count: val.count });
    });

    // 3. Distinct Tags (e.g. "testing", "tesying description")
    const tagCounts = new Map<string, { label: string; count: number }>();
    for (const itm of items) {
      if (itm.tags && Array.isArray(itm.tags)) {
        for (const tag of itm.tags) {
          const val = tag.trim();
          const key = val.toLowerCase();
          if (!seen.has(key) && !seen.has(normalizeCategory(key))) {
            const existing = tagCounts.get(key);
            if (existing) {
              existing.count++;
            } else {
              tagCounts.set(key, { label: val, count: 1 });
            }
          }
        }
      }
    }

    tagCounts.forEach((val, key) => {
      seen.add(key);
      list.push({ label: val.label, filterValue: val.label, count: val.count });
    });

    return list;
  }, [items]);

  const handleSelectFilter = (filterVal: string) => {
    setMobileOpen(false);
    if (pathname === "/") {
      onSelectFilter?.(filterVal);
      if (typeof window !== "undefined") {
        const url = filterVal === "all" ? "/" : `/?filter=${encodeURIComponent(filterVal)}`;
        window.history.pushState(null, "", url);
      }
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      router.push(filterVal === "all" ? "/" : `/?filter=${encodeURIComponent(filterVal)}`);
    }
  };

  const isOverviewActive = pathname === "/" && activeFilter === "all";
  const isAboutActive = pathname === "/about";
  const isContactActive = pathname === "/contact";

  const sidebarContent = (
    <div className="flex flex-col min-h-full py-8 md:py-14 px-6 md:px-10 text-neutral-900 select-none">
      {/* Brand Header - Exact style from reference (Jessica Chou / Azizography) */}
      <div className="mb-8 md:mb-10">
        <Link
          href="/"
          onClick={(e) => {
            if (pathname === "/") {
              e.preventDefault();
              handleSelectFilter("all");
            }
          }}
          className="inline-block group"
        >
          <h1 className="font-artistic font-semibold text-3xl sm:text-[36px] tracking-[0.02em] text-neutral-950 group-hover:opacity-75 transition-opacity leading-none">
            {brandName}
          </h1>
        </Link>
      </div>

      {/* Top Core Navigation: Overview, About, Contact */}
      <div className="flex flex-col space-y-2 text-[12.5px] sm:text-[13px] font-syne tracking-[0.18em] uppercase">
        <Link
          href="/"
          onClick={(e) => {
            if (pathname === "/") {
              e.preventDefault();
              handleSelectFilter("all");
            }
          }}
          className={`text-left transition-colors duration-150 ${
            isOverviewActive
              ? "text-neutral-950 font-bold"
              : "text-neutral-400 hover:text-neutral-950 font-medium"
          }`}
        >
          Overview
        </Link>

        <Link
          href="/about"
          onClick={() => setMobileOpen(false)}
          className={`text-left transition-colors duration-150 ${
            isAboutActive
              ? "text-neutral-950 font-bold"
              : "text-neutral-400 hover:text-neutral-950 font-medium"
          }`}
        >
          About
        </Link>

        <Link
          href="/contact"
          onClick={() => setMobileOpen(false)}
          className={`text-left transition-colors duration-150 ${
            isContactActive
              ? "text-neutral-950 font-bold"
              : "text-neutral-400 hover:text-neutral-950 font-medium"
          }`}
        >
          Contact
        </Link>
      </div>

      {/* Separator spacing before editorial projects list */}
      <div className="mt-8 pt-6 border-t border-black/[0.06]" />

      {/* Dynamic Editorial Series / Categories List */}
      <div className="flex flex-col space-y-2.5 text-[15.5px] sm:text-[16.5px] font-serif-elegant pb-12">
        {dynamicSections.map((sec) => {
          const filterLower = activeFilter.toLowerCase().trim();
          const secFilterLower = sec.filterValue.toLowerCase().trim();
          const isActive =
            pathname === "/" &&
            (filterLower === secFilterLower ||
              normalizeCategory(filterLower) === normalizeCategory(secFilterLower));
          return (
            <button
              key={sec.filterValue}
              type="button"
              onClick={() => handleSelectFilter(sec.filterValue)}
              className={`text-left transition-colors duration-150 leading-snug cursor-pointer ${
                isActive
                  ? "text-neutral-950 font-medium italic underline underline-offset-4 decoration-black/30"
                  : "text-neutral-600 hover:text-neutral-950 font-normal"
              }`}
            >
              {sec.label}
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="lg:hidden sticky top-0 z-40 w-full bg-[#FAF9F6]/95 backdrop-blur-md px-6 py-4 flex items-center justify-between border-b border-black/[0.06]">
        <Link
          href="/"
          onClick={(e) => {
            if (pathname === "/") {
              e.preventDefault();
              handleSelectFilter("all");
            }
          }}
          className="font-artistic font-semibold text-2xl tracking-[0.02em] text-neutral-950"
        >
          {brandName}
        </Link>
        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-1.5 text-neutral-800 hover:text-black focus:outline-none"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div data-lenis-prevent="true" className="lg:hidden fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex justify-start">
          <div data-lenis-prevent="true" className="relative w-4/5 max-w-xs h-full bg-[#FAF9F6] shadow-2xl overflow-y-auto overscroll-contain">
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="absolute top-5 right-5 p-2 text-neutral-600 hover:text-black"
            >
              <X className="w-5 h-5" />
            </button>
            {sidebarContent}
          </div>
          <div
            className="flex-1 h-full"
            onClick={() => setMobileOpen(false)}
          />
        </div>
      )}

      {/* Desktop Sticky Left Sidebar */}
      <aside className="hidden lg:block w-[280px] xl:w-[320px] shrink-0 h-screen sticky top-0 bg-[#FAF9F6] overflow-y-auto overflow-x-hidden border-r border-black/[0.05] [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {sidebarContent}
      </aside>
    </>
  );
}

export default React.memo(Sidebar);
