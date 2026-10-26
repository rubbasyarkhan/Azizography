"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, ChevronDown } from "lucide-react";
import { GalleryItem } from "@/types/gallery";
import { normalizeCategory, getCategoryDisplayLabel } from "@/lib/filter-utils";
import { getAllCategories } from "@/lib/category-service";

interface SidebarProps {
  items: GalleryItem[];
  activeFilter?: string;
  activeCategory?: string;
  activeSub?: string;
  onSelectCategory?: (category: string) => void;
  onSelectSub?: (category: string, sub: string) => void;
  onSelectFilter?: (filter: string) => void;
  brandName?: string;
}

interface CategoryGroup {
  key: string;
  label: string;
  count: number;
  subcategories: Array<{ name: string; count: number }>;
}

function Sidebar({
  items,
  activeFilter = "all",
  activeCategory,
  activeSub,
  onSelectCategory,
  onSelectSub,
  onSelectFilter,
  brandName = "Azizography.",
}: SidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({});
  const pathname = usePathname();
  const router = useRouter();

  // Current active category key & subcategory name (supporting both new props and legacy activeFilter)
  const effectiveCategory = activeCategory || (activeFilter !== "all" ? activeFilter : "");
  const effectiveSub = activeSub || "";

  // Group gallery items strictly by registered DB categories & subcategories
  const categoryGroups = useMemo<CategoryGroup[]>(() => {
    const allKnownCats = getAllCategories(items);
    const groupsMap = new Map<string, CategoryGroup>();

    // 1. Initialize strictly with registered DB categories
    for (const cat of allKnownCats) {
      const subList = (cat.subcategories || []).map((subName) => ({
        name: subName,
        count: 0,
      }));

      groupsMap.set(cat.key, {
        key: cat.key,
        label: cat.label,
        count: 0,
        subcategories: subList,
      });
    }

    // 2. Tally items and counts strictly for registered categories & subcategories
    for (const item of items) {
      if (item.isVisible === false) continue;
      const rawCat = item.category || "people";
      const catKey = normalizeCategory(rawCat);

      const grp = groupsMap.get(catKey);
      if (!grp) continue;

      grp.count += 1;

      const itemSub = (item.subcategory || item.seriesOrProject || "").trim().toLowerCase();
      if (itemSub) {
        const subEntry = grp.subcategories.find(
          (s) => s.name.trim().toLowerCase() === itemSub
        );
        if (subEntry) {
          subEntry.count += 1;
        }
      }
    }

    return Array.from(groupsMap.values());
  }, [items]);

  // Automatically expand category if active category or subcategory matches
  useEffect(() => {
    if (!effectiveCategory || effectiveCategory === "all") return;
    const catNorm = normalizeCategory(effectiveCategory);

    for (const grp of categoryGroups) {
      const catMatches =
        grp.key === catNorm ||
        normalizeCategory(grp.label) === catNorm;

      const subMatches = grp.subcategories.some((s) => {
        const sLower = s.name.toLowerCase().trim();
        const curLower = effectiveSub.toLowerCase().trim();
        return sLower === curLower || sLower === catNorm;
      });

      if (catMatches || subMatches) {
        setOpenCategories((prev) => ({ ...prev, [grp.key]: true }));
      }
    }
  }, [effectiveCategory, effectiveSub, categoryGroups]);

  const toggleCategory = (catKey: string) => {
    setOpenCategories((prev) => ({
      ...prev,
      [catKey]: !prev[catKey],
    }));
  };

  const handleCategoryClick = (catKey: string) => {
    setMobileOpen(false);
    if (onSelectCategory) {
      onSelectCategory(catKey);
    } else if (onSelectFilter) {
      onSelectFilter(catKey);
    } else {
      router.push(`/gallery?category=${encodeURIComponent(catKey)}`);
    }
  };

  const handleSubClick = (catKey: string, subName: string) => {
    setMobileOpen(false);
    if (onSelectSub) {
      onSelectSub(catKey, subName);
    } else if (onSelectFilter) {
      onSelectFilter(subName);
    } else {
      router.push(
        `/gallery?category=${encodeURIComponent(catKey)}&sub=${encodeURIComponent(subName)}`
      );
    }
  };

  const isCategorySelected = (grpKey: string) => {
    if (effectiveSub && effectiveSub !== "all") return false;
    const current = effectiveCategory.toLowerCase().trim();
    const target = grpKey.toLowerCase().trim();
    return (
      current === target ||
      normalizeCategory(current) === normalizeCategory(target)
    );
  };

  const isSubSelected = (subName: string) => {
    const currentSub = effectiveSub.toLowerCase().trim();
    const targetSub = subName.toLowerCase().trim();
    return currentSub === targetSub || currentSub.includes(targetSub) || targetSub.includes(currentSub);
  };

  const sidebarContent = (
    <div className="flex flex-col min-h-full py-6 md:py-8 px-6 md:px-10 text-neutral-900 select-none">
      {/* Dynamic Categories & Subcategories List */}
      <div className="flex flex-col space-y-3.5 text-[15.5px] sm:text-[16.5px] font-serif-elegant pb-12">
        <span className="text-[10px] font-syne tracking-[0.22em] text-neutral-400 uppercase font-semibold block mb-1">
          Collections
        </span>

        {categoryGroups.map((grp) => {
          const isCatActive = isCategorySelected(grp.key);
          const hasSubs = grp.subcategories.length > 0;
          const isOpen = Boolean(openCategories[grp.key]);

          return (
            <div key={grp.key} className="flex flex-col">
              {/* Category Row Header */}
              <div className="flex items-center justify-between group">
                <button
                  type="button"
                  onClick={() => {
                    handleCategoryClick(grp.key);
                    if (hasSubs && !isOpen) {
                      setOpenCategories((prev) => ({ ...prev, [grp.key]: true }));
                    }
                  }}
                  className={`text-left transition-colors duration-150 leading-snug cursor-pointer flex-1 flex items-baseline justify-between pr-2 ${
                    isCatActive
                      ? "text-neutral-950 font-semibold italic underline underline-offset-4 decoration-black/40"
                      : "text-neutral-600 hover:text-neutral-950 font-normal"
                  }`}
                >
                  <span>{grp.label}</span>
                  <span className="text-[11px] font-mono text-neutral-400">
                    ({grp.count})
                  </span>
                </button>

                {hasSubs && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleCategory(grp.key);
                    }}
                    aria-label={`Toggle ${grp.label} subcategories`}
                    className="p-1 text-neutral-400 hover:text-neutral-900 transition-transform duration-200 cursor-pointer"
                  >
                    <ChevronDown
                      className={`w-3.5 h-3.5 transition-transform duration-200 ${
                        isOpen ? "rotate-180 text-neutral-900" : ""
                      }`}
                    />
                  </button>
                )}
              </div>

              {/* Nested Subcategories List */}
              {hasSubs && isOpen && (
                <div className="flex flex-col space-y-1.5 pl-3.5 pt-2 pb-1 border-l border-black/[0.08] ml-1 mt-1 animate-fade-in">
                  {/* View All in Category */}
                  <button
                    type="button"
                    onClick={() => handleCategoryClick(grp.key)}
                    className={`text-left text-[13px] sm:text-[13.5px] transition-colors leading-snug cursor-pointer ${
                      isCatActive
                        ? "text-neutral-950 font-semibold underline underline-offset-2"
                        : "text-neutral-400 hover:text-neutral-900 font-normal"
                    }`}
                  >
                    <span>All {grp.label}</span>
                  </button>

                  {/* Individual Subcategories */}
                  {grp.subcategories.map((sub) => {
                    const isSubActive = isSubSelected(sub.name);

                    return (
                      <button
                        key={sub.name}
                        type="button"
                        onClick={() => handleSubClick(grp.key, sub.name)}
                        className={`text-left text-[13.5px] sm:text-[14px] transition-colors leading-snug cursor-pointer flex items-baseline justify-between pr-2 ${
                          isSubActive
                            ? "text-neutral-950 font-medium italic underline underline-offset-4 decoration-black/40"
                            : "text-neutral-600 hover:text-neutral-950 font-normal"
                        }`}
                      >
                        <span className="truncate">{sub.name}</span>
                        <span className="text-[11px] font-mono text-neutral-400 shrink-0 ml-1.5">
                          ({sub.count})
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
      {/* Mobile Collections Trigger (compact under Navbar) */}
      <div className="lg:hidden w-full bg-[#FAF9F6] px-5 py-2.5 flex items-center justify-between border-b border-[#DDD6CA]/60 text-xs font-mono">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="flex items-center gap-2 px-3 py-1.5 bg-[#F4F0EA] border border-[#DDD6CA] text-stone-800 rounded-full font-semibold uppercase tracking-wider text-[11px] cursor-pointer hover:bg-[#EAE4D9]"
        >
          <span>Collections ({categoryGroups.length})</span>
          <ChevronDown className="w-3.5 h-3.5 text-stone-600" />
        </button>
        {effectiveCategory && effectiveCategory !== "all" && (
          <span className="text-stone-500 font-mono text-[11px] uppercase tracking-wider truncate max-w-[160px]">
            {effectiveCategory} {effectiveSub && effectiveSub !== "all" ? `· ${effectiveSub}` : ""}
          </span>
        )}
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div data-lenis-prevent="true" className="lg:hidden fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex justify-start">
          <div data-lenis-prevent="true" className="relative w-4/5 max-w-xs h-full bg-[#FAF9F6] shadow-2xl overflow-y-auto overscroll-contain">
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="absolute top-5 right-5 p-2 text-neutral-600 hover:text-black cursor-pointer"
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

      {/* Desktop Sticky Left Sidebar (Below sticky top Navbar) */}
      <aside className="hidden lg:block w-[280px] xl:w-[320px] shrink-0 sticky top-16 sm:top-20 h-[calc(100vh-4rem)] sm:h-[calc(100vh-5rem)] bg-[#FAF9F6] overflow-y-auto overflow-x-hidden border-r border-black/[0.05] [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {sidebarContent}
      </aside>
    </>
  );
}

export default React.memo(Sidebar);
