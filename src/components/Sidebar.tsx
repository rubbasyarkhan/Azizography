"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, ChevronDown } from "lucide-react";
import { GalleryItem } from "@/types/gallery";
import { normalizeCategory, getCategoryDisplayLabel } from "@/lib/filter-utils";
import { getAllCategories, CategoryOption } from "@/lib/category-service";

interface SidebarProps {
  items: GalleryItem[];
  activeFilter?: string;
  onSelectFilter?: (filter: string) => void;
  brandName?: string;
}

interface CategoryGroup {
  key: string;
  label: string;
  count: number;
  series: Array<{ name: string; count: number }>;
}

function Sidebar({
  items,
  activeFilter = "all",
  onSelectFilter,
  brandName = "Azizography.",
}: SidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({});
  const pathname = usePathname();
  const router = useRouter();

  // Group gallery items by category and collect series / projects under each category
  const categoryGroups = useMemo<CategoryGroup[]>(() => {
    const allKnownCats = getAllCategories(items);
    const groupsMap = new Map<string, CategoryGroup>();

    // Initialize with known categories
    for (const cat of allKnownCats) {
      groupsMap.set(cat.key, {
        key: cat.key,
        label: cat.label,
        count: 0,
        series: [],
      });
    }

    // Populate counts and series from visible gallery items
    const seriesPerCategory = new Map<string, Map<string, number>>();

    for (const item of items) {
      if (item.isVisible === false) continue;
      const rawCat = item.category || "people";
      const catKey = normalizeCategory(rawCat);

      if (!groupsMap.has(catKey)) {
        groupsMap.set(catKey, {
          key: catKey,
          label: getCategoryDisplayLabel(rawCat),
          count: 0,
          series: [],
        });
      }

      const grp = groupsMap.get(catKey)!;
      grp.count += 1;

      // Track series/projects belonging to this category
      if (item.seriesOrProject && item.seriesOrProject.trim()) {
        const seriesName = item.seriesOrProject.trim();
        if (!seriesPerCategory.has(catKey)) {
          seriesPerCategory.set(catKey, new Map<string, number>());
        }
        const sMap = seriesPerCategory.get(catKey)!;
        sMap.set(seriesName, (sMap.get(seriesName) || 0) + 1);
      }
    }

    // Attach sorted series to each category
    groupsMap.forEach((grp, catKey) => {
      const sMap = seriesPerCategory.get(catKey);
      if (sMap && sMap.size > 0) {
        grp.series = Array.from(sMap.entries()).map(([name, count]) => ({
          name,
          count,
        }));
      }
    });

    // Only display categories that contain items (or default list if empty archive)
    const result = Array.from(groupsMap.values()).filter(
      (g) => g.count > 0 || items.length === 0
    );

    return result;
  }, [items]);

  // Automatically expand category if active filter matches category or any of its series
  useEffect(() => {
    if (!activeFilter || activeFilter === "all") return;
    const fLower = activeFilter.toLowerCase().trim();
    const fNorm = normalizeCategory(fLower);

    for (const grp of categoryGroups) {
      const catMatches = grp.key === fNorm || grp.label.toLowerCase() === fLower;
      const seriesMatches = grp.series.some(
        (s) => s.name.toLowerCase().trim() === fLower
      );

      if (catMatches || seriesMatches) {
        setOpenCategories((prev) => ({ ...prev, [grp.key]: true }));
      }
    }
  }, [activeFilter, categoryGroups]);

  const toggleCategory = (catKey: string) => {
    setOpenCategories((prev) => ({
      ...prev,
      [catKey]: !prev[catKey],
    }));
  };

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
      {/* Brand Header */}
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

      {/* Separator before categories */}
      <div className="mt-8 pt-6 border-t border-black/[0.06]" />

      {/* Categories Dropdown List with Nested Series / Projects (No Hashtags) */}
      <div className="flex flex-col space-y-3 text-[15.5px] sm:text-[16.5px] font-serif-elegant pb-12">
        {categoryGroups.map((grp) => {
          const filterLower = activeFilter.toLowerCase().trim();
          const grpNorm = grp.key;
          const isCategoryActive =
            pathname === "/" &&
            (filterLower === grpNorm ||
              filterLower === grp.label.toLowerCase() ||
              normalizeCategory(filterLower) === grpNorm);

          const hasSeries = grp.series.length > 0;
          const isOpen = Boolean(openCategories[grp.key]);

          return (
            <div key={grp.key} className="flex flex-col">
              {/* Category Row Header */}
              <div className="flex items-center justify-between group">
                <button
                  type="button"
                  onClick={() => {
                    handleSelectFilter(grp.key);
                    if (hasSeries && !isOpen) {
                      setOpenCategories((prev) => ({ ...prev, [grp.key]: true }));
                    }
                  }}
                  className={`text-left transition-colors duration-150 leading-snug cursor-pointer flex-1 ${
                    isCategoryActive
                      ? "text-neutral-950 font-medium italic underline underline-offset-4 decoration-black/30"
                      : "text-neutral-600 hover:text-neutral-950 font-normal"
                  }`}
                >
                  <span>{grp.label}</span>
                </button>

                {hasSeries && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleCategory(grp.key);
                    }}
                    aria-label={`Toggle ${grp.label} dropdown`}
                    className="p-1 text-neutral-400 hover:text-neutral-900 transition-transform duration-200 cursor-pointer"
                  >
                    <ChevronDown
                      className={`w-4 h-4 transition-transform duration-200 ${
                        isOpen ? "rotate-180 text-neutral-900" : ""
                      }`}
                    />
                  </button>
                )}
              </div>

              {/* Nested Dropdown: Series / Projects in this category */}
              {hasSeries && isOpen && (
                <div className="flex flex-col space-y-1.5 pl-4 pt-2 pb-1 border-l border-black/[0.08] ml-1 mt-1 animate-fade-in">
                  {/* Option to view All in this Category */}
                  <button
                    type="button"
                    onClick={() => handleSelectFilter(grp.key)}
                    className={`text-left text-[13.5px] sm:text-[14px] transition-colors leading-snug cursor-pointer ${
                      isCategoryActive
                        ? "text-neutral-950 font-semibold"
                        : "text-neutral-400 hover:text-neutral-900 font-normal"
                    }`}
                  >
                    <span>All {grp.label}</span>
                  </button>

                  {/* Individual Series / Projects */}
                  {grp.series.map((s) => {
                    const isSeriesActive =
                      pathname === "/" &&
                      filterLower === s.name.toLowerCase().trim();

                    return (
                      <button
                        key={s.name}
                        type="button"
                        onClick={() => handleSelectFilter(s.name)}
                        className={`text-left text-[14px] sm:text-[14.5px] transition-colors leading-snug cursor-pointer ${
                          isSeriesActive
                            ? "text-neutral-950 font-medium italic underline underline-offset-4 decoration-black/30"
                            : "text-neutral-600 hover:text-neutral-950 font-normal"
                        }`}
                      >
                        <span>{s.name}</span>
                        <span className="text-[11px] text-neutral-400 ml-1.5 font-sans">
                          ({s.count})
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
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
