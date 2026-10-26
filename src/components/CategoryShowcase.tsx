"use client";

import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { GalleryItem, CategoryDefinition } from "@/types/gallery";
import {
  subscribeToCategories,
  getCategories,
  healCategoriesWithItems,
  SEED_CATEGORIES,
} from "@/lib/category-service";
import { normalizeCategory } from "@/lib/filter-utils";
import { ArrowRight, Layers } from "lucide-react";

interface CategoryShowcaseProps {
  items: GalleryItem[];
  onOpenLightbox?: (item: GalleryItem) => void;
  isAdmin?: boolean;
  onOpenCategoryStudio?: () => void;
  onOpenUploader?: () => void;
}

function getShowcaseDimensions() {
  if (typeof window === "undefined") {
    return {
      rStart: 150,
      rEnd: 490,
      targetCardW: 340,
      targetCardH: 420,
      cylRadius: 680,
    };
  }
  const w = window.innerWidth;
  if (w < 640) {
    return {
      rStart: 85,
      rEnd: 240,
      targetCardW: 220,
      targetCardH: 280,
      cylRadius: 360,
    };
  } else if (w < 1024) {
    return {
      rStart: 120,
      rEnd: 380,
      targetCardW: 280,
      targetCardH: 350,
      cylRadius: 520,
    };
  } else {
    return {
      rStart: 150,
      rEnd: 490,
      targetCardW: 340,
      targetCardH: 420,
      cylRadius: 680,
    };
  }
}

export default function CategoryShowcase({
  items,
  onOpenLightbox,
  isAdmin = false,
  onOpenCategoryStudio,
}: CategoryShowcaseProps) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const centerTextRef = useRef<HTMLDivElement>(null);
  const topUIRef = useRef<HTMLDivElement>(null);
  const skipBtnRef = useRef<HTMLDivElement>(null);

  // Dynamic Categories from Firestore / localStorage & real gallery items
  const [categories, setCategories] = useState<CategoryDefinition[]>(() =>
    getCategories(items)
  );

  // Unified categories derived from both configured categories and actual items in archive
  const unifiedCategories = useMemo<CategoryDefinition[]>(() => {
    return healCategoriesWithItems(categories, items);
  }, [categories, items]);

  const [selectedCatSlug, setSelectedCatSlug] = useState<string>(() => {
    const initialCats = healCategoriesWithItems(getCategories(items), items);
    return initialCats[0]?.slug || "people";
  });
  const [selectedSub, setSelectedSub] = useState<string>("all");

  useEffect(() => {
    const unsub = subscribeToCategories((cats) => {
      setCategories((prev) => {
        if (JSON.stringify(prev) === JSON.stringify(cats)) return prev;
        return cats;
      });
    });
    return () => {
      try {
        unsub();
      } catch (e) {
        console.warn("CategoryShowcase unsub warning:", e);
      }
    };
  }, []);

  // Sync selected category slug to first active category if current is invalid
  useEffect(() => {
    if (unifiedCategories.length > 0) {
      if (!selectedCatSlug || !unifiedCategories.some((c) => c.slug === selectedCatSlug)) {
        setSelectedCatSlug(unifiedCategories[0].slug);
      }
    }
  }, [unifiedCategories, selectedCatSlug]);

  const activeCategory = useMemo(() => {
    if (!unifiedCategories.length) return null;
    return (
      unifiedCategories.find(
        (c) =>
          c.slug === selectedCatSlug ||
          normalizeCategory(c.name) === normalizeCategory(selectedCatSlug)
      ) || unifiedCategories[0]
    );
  }, [unifiedCategories, selectedCatSlug]);

  const availableSubcategories = useMemo(() => {
    return activeCategory?.subcategories || [];
  }, [activeCategory]);

  // Sync selected subcategory if current subcategory was deleted
  useEffect(() => {
    if (
      selectedSub !== "all" &&
      !availableSubcategories.some((s) => s.toLowerCase() === selectedSub.toLowerCase())
    ) {
      setSelectedSub("all");
    }
  }, [availableSubcategories, selectedSub]);

  // Filter items matching selected category & subcategory
  const filteredCategoryItems = useMemo(() => {
    if (!activeCategory) return [];

    const catSlug = activeCategory.slug;
    const catNameLower = activeCategory.name.toLowerCase();

    return items.filter((item) => {
      if (item.isVisible === false || !item.imageUrl) return false;

      const rawCat = (item.category || "").toLowerCase().trim();
      const normCat = normalizeCategory(item.category);
      const matchesCat =
        normCat === catSlug ||
        rawCat === catNameLower ||
        normalizeCategory(rawCat) === normalizeCategory(catSlug);

      if (!matchesCat) return false;

      if (selectedSub === "all") return true;

      const itemSub = (item.subcategory || item.seriesOrProject || "").toLowerCase().trim();
      const targetSub = selectedSub.toLowerCase().trim();

      return itemSub === targetSub || itemSub.includes(targetSub) || targetSub.includes(itemSub);
    });
  }, [items, activeCategory, selectedSub]);

  // 20 Cylinder Card Items (cycling available items or graceful fallback)
  const displayCards = useMemo(() => {
    if (filteredCategoryItems.length > 0) {
      // Prioritize items marked for Iris aperture blades
      const sorted = [...filteredCategoryItems].sort((a, b) => {
        if (a.isIrisItem && !b.isIrisItem) return -1;
        if (!a.isIrisItem && b.isIrisItem) return 1;
        return (a.orderIndex ?? 0) - (b.orderIndex ?? 0);
      });

      const list: GalleryItem[] = [];
      while (list.length < 20) {
        list.push(...sorted);
      }
      return list.slice(0, 20);
    }

    // If active category has no items yet, cycle any available gallery photographs
    if (items.length > 0) {
      const available = items.filter((i) => i.isVisible !== false && i.imageUrl);
      if (available.length > 0) {
        const sorted = [...available].sort((a, b) => {
          if (a.isIrisItem && !b.isIrisItem) return -1;
          if (!a.isIrisItem && b.isIrisItem) return 1;
          return (a.orderIndex ?? 0) - (b.orderIndex ?? 0);
        });
        const list: GalleryItem[] = [];
        while (list.length < 20) {
          list.push(...sorted);
        }
        return list.slice(0, 20);
      }
    }

    return [];
  }, [filteredCategoryItems, items]);

  // Responsive Dimensions: Cards are portrait format matching the iris blades
  const [dimensions, setDimensions] = useState(getShowcaseDimensions);
  const dimensionsRef = useRef(dimensions);
  dimensionsRef.current = dimensions;

  useEffect(() => {
    const handleResize = () => {
      const nextDims = getShowcaseDimensions();
      setDimensions((prev) => {
        if (
          prev.targetCardW === nextDims.targetCardW &&
          prev.targetCardH === nextDims.targetCardH &&
          prev.cylRadius === nextDims.cylRadius &&
          prev.rStart === nextDims.rStart &&
          prev.rEnd === nextDims.rEnd
        ) {
          return prev;
        }
        dimensionsRef.current = nextDims;
        return nextDims;
      });
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Smooth interaction & physics state (stored in refs for 120fps GPU performance)
  const angleRef = useRef(0);
  const isDraggingRef = useRef(false);
  const hasDraggedRef = useRef(false);
  const dragStartXRef = useRef(0);
  const lastAngleRef = useRef(0);
  const velocityRef = useRef(0);
  const isHoveredRef = useRef(false);
  const introCompleteRef = useRef(false);

  // Skip / Fast-forward Iris Intro
  const handleSkipIntro = useCallback(() => {
    introCompleteRef.current = true;
    if (centerTextRef.current) centerTextRef.current.style.opacity = "0";
    if (skipBtnRef.current) {
      skipBtnRef.current.style.opacity = "0";
      skipBtnRef.current.style.pointerEvents = "none";
    }
    if (topUIRef.current) {
      topUIRef.current.style.opacity = "1";
      topUIRef.current.style.transform = "translateY(0px)";
      topUIRef.current.style.pointerEvents = "auto";
    }
    if (containerRef.current) {
      containerRef.current.style.backgroundColor = "rgb(250, 249, 246)";
    }
  }, []);

  // Keyboard shortcut ESC / Space to skip intro
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!introCompleteRef.current && (e.key === "Escape" || e.code === "Space")) {
        handleSkipIntro();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleSkipIntro]);

  // Continuous, Butter-Smooth 120fps Animation Loop (Zero layout thrashing, pure GPU matrix)
  useEffect(() => {
    let animFrameId: number;
    let startTime: number | null = null;
    let lastTime = 0;
    const totalApertureDuration = 2000; // 0 to 2000ms: pure 2D iris camera aperture blooming
    const totalMorphDuration = 2000;    // 2000ms to 4000ms: smooth morph into 3D cylinder
    const totalIntroDuration = totalApertureDuration + totalMorphDuration; // 4000ms
    const numCards = 20;

    const animate = (now: number) => {
      if (startTime === null) {
        startTime = now;
        lastTime = now;
      }
      const dt = Math.min(32, now - lastTime) / 1000;
      lastTime = now;
      const dims = dimensionsRef.current;
      const currentCards = cardsRef.current;

      const scaleBase = dims.targetCardW > 300 ? 0.26 : 0.24;

      let easeExpand = 1;
      let m = 1;

      if (!introCompleteRef.current) {
        const elapsed = Math.max(0, now - startTime);

        // Base continuous angular rotation (~21 deg/sec)
        const baseAngle = (elapsed / 1000) * 0.38;
        angleRef.current = baseAngle;

        // Phase 1: Pure 2D Iris aperture expansion (0 to 2000ms)
        const irisProgress = Math.min(1, elapsed / totalApertureDuration);
        easeExpand = 1 - Math.pow(1 - irisProgress, 2.2);

        // Phase 2: Smooth 3D morph into the horizontal Cylinder (2000ms to 4000ms)
        const rawMorph = Math.max(0, Math.min(1, (elapsed - totalApertureDuration) / totalMorphDuration));
        // Hermite smoothstep (zero initial jerk and zero terminal jerk: dm/dt = 0 at boundaries)
        m = rawMorph * rawMorph * (3 - 2 * rawMorph);

        // Center welcome text dissolves out smoothly
        if (centerTextRef.current) {
          const textOpacity = Math.max(0, 1 - m * 2.8);
          centerTextRef.current.style.opacity = textOpacity.toFixed(3);
          const textScale = 0.94 + 0.06 * easeExpand + m * 0.08;
          centerTextRef.current.style.transform = `scale(${textScale.toFixed(3)})`;
        }

        // Top UI (Navbar + 2-Line Heading + Category Pills) glides down
        if (topUIRef.current) {
          if (m > 0.35) {
            const uiProgress = (m - 0.35) / 0.65;
            topUIRef.current.style.opacity = uiProgress.toFixed(3);
            topUIRef.current.style.transform = `translateY(${((1 - uiProgress) * -16).toFixed(1)}px)`;
            topUIRef.current.style.pointerEvents = uiProgress > 0.8 ? "auto" : "none";
          } else {
            topUIRef.current.style.opacity = "0";
            topUIRef.current.style.pointerEvents = "none";
          }
        }

        // Skip button dissolves out as morph completes
        if (skipBtnRef.current) {
          if (m > 0.3) {
            const btnOpacity = Math.max(0, 1 - (m - 0.3) / 0.5);
            skipBtnRef.current.style.opacity = btnOpacity.toFixed(3);
            skipBtnRef.current.style.pointerEvents = btnOpacity > 0.1 ? "auto" : "none";
          } else {
            skipBtnRef.current.style.opacity = "1";
            skipBtnRef.current.style.pointerEvents = "auto";
          }
        }

        // Background color shifts from camera dark to rich cream #FAF9F6
        if (containerRef.current) {
          const r = Math.round(250 * m);
          const g = Math.round(249 * m);
          const b = Math.round(246 * m);
          containerRef.current.style.backgroundColor = `rgb(${r}, ${g}, ${b})`;
        }

        if (elapsed >= totalIntroDuration) {
          introCompleteRef.current = true;
        }
      } else {
        // Settled phase: continuous, butter-smooth autonomous rotation on its own + drag momentum
        easeExpand = 1;
        m = 1;

        if (isDraggingRef.current) {
          // controlled directly by user pointer drag
        } else {
          // Cards move continuously on their own at a steady, elegant rate (~11.5 deg/sec)
          angleRef.current += 0.20 * dt;

          // Plus smooth flick inertia decay if user dragged and released
          if (Math.abs(velocityRef.current) > 0.0001) {
            angleRef.current += velocityRef.current;
            velocityRef.current *= 0.93;
          }
        }
      }

      // Radius in 2D Iris aperture
      const currentRadiusX = dims.rStart + (dims.rEnd - dims.rStart) * easeExpand;
      const currentRadiusY = dims.rStart + (dims.rEnd * 0.74 - dims.rStart) * easeExpand;

      // Target 3D Cylinder geometry
      const cylRadius = dims.cylRadius || 680;
      const bladeTilt = Math.sin(angleRef.current * 1.5) * 8 * (1 - easeExpand * 0.5);

      // GPU scale smoothly interpolates from compact iris aperture card to full size
      const scaleIris = scaleBase + 0.08 * easeExpand;
      const scale = (1 - m) * scaleIris + m * 1.0;

      for (let i = 0; i < numCards; i++) {
        const cardEl = currentCards[i];
        if (!cardEl) continue;

        const theta = angleRef.current + (i * 2 * Math.PI) / numCards;

        // 2D Iris coordinates (completely flat to screen, z=0, rotX=0, rotY=0)
        const xIris = Math.cos(theta) * currentRadiusX;
        const yIris = Math.sin(theta) * currentRadiusY;
        const zIris = 0;
        const rotXIris = 0;
        const rotYIris = 0;
        const rotZIris = Math.sin(theta) * 10 * (1 - easeExpand * 0.6) + bladeTilt;

        // 3D Cylinder coordinates (curving into horizontal circle arc)
        const xCyl = Math.sin(theta) * cylRadius;
        const yCyl = 0;
        const zCyl = Math.cos(theta) * cylRadius - cylRadius;
        const rotXCyl = -4;
        const rotYCyl = -(theta * 180) / Math.PI;
        const rotZCyl = 0;

        // Smooth Hermite blend between 2D Iris and 3D Cylinder
        const x = (1 - m) * xIris + m * xCyl;
        const y = (1 - m) * yIris + m * yCyl;
        const z = (1 - m) * zIris + m * zCyl;
        const rotX = (1 - m) * rotXIris + m * rotXCyl;
        const rotY = (1 - m) * rotYIris + m * rotYCyl;
        const rotZ = (1 - m) * rotZIris + m * rotZCyl;

        // Pure GPU compositor matrix (ZERO reflow, locked 120fps)
        cardEl.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, ${z.toFixed(1)}px) rotateX(${rotX.toFixed(1)}deg) rotateY(${rotY.toFixed(1)}deg) rotateZ(${rotZ.toFixed(1)}deg) scale(${scale.toFixed(3)})`;
        cardEl.style.zIndex = `${Math.round(100 + z)}`;
      }

      animFrameId = requestAnimationFrame(animate);
    };

    // Execute immediately on mount to establish the initial closed aperture transforms with zero delay
    animate(performance.now());
    animFrameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animFrameId);
    };
  }, []);

  // Pointer drag controls to spin the cylinder with click-and-drag
  const handlePointerDown = (e: React.PointerEvent) => {
    if (!introCompleteRef.current) return;
    isDraggingRef.current = true;
    hasDraggedRef.current = false;
    dragStartXRef.current = e.clientX;
    lastAngleRef.current = angleRef.current;
    velocityRef.current = 0;
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    const deltaX = e.clientX - dragStartXRef.current;
    if (Math.abs(deltaX) > 4) {
      hasDraggedRef.current = true;
    }
    const nextAngle = lastAngleRef.current + deltaX * 0.0032;
    velocityRef.current = (nextAngle - angleRef.current) * 0.45;
    angleRef.current = nextAngle;
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
  };

  const handleCardClick = (item: GalleryItem) => {
    if (hasDraggedRef.current) return;
    const targetCat = activeCategory?.slug || normalizeCategory(item.category || "people");
    const subParam =
      selectedSub !== "all"
        ? `&sub=${encodeURIComponent(selectedSub)}`
        : item.subcategory
        ? `&sub=${encodeURIComponent(item.subcategory)}`
        : "";
    router.push(`/gallery?category=${encodeURIComponent(targetCat)}${subParam}`);
  };

  return (
    <section
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      className="relative w-full min-h-screen flex flex-col justify-between overflow-hidden select-none cursor-grab active:cursor-grabbing"
      style={{
        perspective: "1800px",
        backgroundColor: "#000000",
      }}
    >
      {/* Subtle ambient light bloom in center */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[450px] bg-white/[0.04] rounded-full blur-[140px] pointer-events-none" />

      {/* Skip button during intro */}
      <div
        ref={skipBtnRef}
        className="absolute top-6 right-6 sm:top-8 sm:right-10 z-50 pointer-events-auto"
      >
        <button
          type="button"
          onClick={handleSkipIntro}
          className="flex items-center gap-1.5 px-3 py-1.5 border border-white/20 hover:border-white text-white hover:bg-white hover:text-black rounded-full text-[9px] font-mono uppercase tracking-widest transition-all cursor-pointer shadow-sm"
        >
          <span>ENTER SITE [ESC]</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      {/* Dead Center Aperture: Welcome Text in Middle of the Iris */}
      <div
        ref={centerTextRef}
        className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-20 text-center px-4 will-change-[opacity,transform]"
      >
        <div className="max-w-[320px] sm:max-w-md md:max-w-xl flex flex-col items-center justify-center animate-in fade-in zoom-in-95 duration-1000 ease-out">
          <span className="text-[10px] sm:text-[11px] font-syne uppercase tracking-[0.35em] text-neutral-200 mb-2 sm:mb-2.5 font-semibold">
            Capturing Emotions &amp; Stories
          </span>
          <h1 className="font-artistic text-2xl sm:text-4xl md:text-5xl lg:text-6xl text-white font-bold italic tracking-[0.02em] leading-[1.16] drop-shadow-[0_10px_35px_rgba(0,0,0,0.95)]">
            Welcome to the domain of Aziz
          </h1>
          <div className="w-12 sm:w-16 h-[1px] bg-gradient-to-r from-transparent via-white/50 to-transparent mt-3 sm:mt-4" />
        </div>
      </div>

      {/* Top Editorial UI: Navbar + Two-Line Heading + Category & Subcategory Buttons */}
      <div
        ref={topUIRef}
        className="relative z-40 w-full max-w-7xl mx-auto px-6 sm:px-12 pt-6 pb-2 flex flex-col items-center text-center space-y-3 pointer-events-none will-change-[opacity,transform]"
        style={{ opacity: 0, transform: "translateY(-16px)" }}
      >
        {/* Top Navbar */}
        <header className="w-full flex items-center justify-between pb-2 border-b border-[#DDD6CA]/60 pointer-events-auto">
          <Link href="/" className="flex items-center gap-2.5 group">
            <span className="font-serif text-xl sm:text-2xl font-bold tracking-wider uppercase text-[#1C1917] group-hover:text-stone-600 transition-colors">
              AZIZOGRAPHY
            </span>
            <span className="text-xs text-stone-500 font-mono tracking-widest uppercase">
              / STUDIO
            </span>
          </Link>

          <div className="flex items-center gap-5 sm:gap-8 text-xs font-mono uppercase tracking-[0.2em]">
            <Link
              href="/gallery"
              className="text-stone-700 hover:text-[#1C1917] transition-colors font-medium hover:underline underline-offset-4"
            >
              FULL ARCHIVE
            </Link>
            <Link
              href="/about"
              className="text-stone-700 hover:text-[#1C1917] transition-colors font-medium hover:underline underline-offset-4"
            >
              ABOUT
            </Link>
            <Link
              href="/contact"
              className="text-stone-700 hover:text-[#1C1917] transition-colors font-medium hover:underline underline-offset-4"
            >
              CONTACT
            </Link>
            {isAdmin && (
              <button
                type="button"
                onClick={onOpenCategoryStudio}
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-[#F4F0EA] border border-[#DDD6CA] text-stone-700 hover:text-black text-[11px] font-mono uppercase rounded-full cursor-pointer"
              >
                <Layers className="w-3.5 h-3.5 text-stone-600" />
                <span>Category Studio</span>
              </button>
            )}
          </div>
        </header>

        {/* Two-Line Classical Editorial Heading */}
        <div className="max-w-3xl mx-auto space-y-1 pt-1 pointer-events-auto">
          <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl font-normal tracking-tight text-[#1C1917] leading-none">
            Archive &amp; Collections
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 max-w-lg mx-auto font-sans leading-relaxed">
            {activeCategory?.description ||
              "Curated ceremonial monographs, arena performances, and raw artistic portraiture."}
          </p>
        </div>

        {/* Dynamic Category Selector Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-1 pointer-events-auto">
          {unifiedCategories.map((cat) => {
            const isSelected =
              activeCategory?.slug === cat.slug ||
              normalizeCategory(activeCategory?.name) === normalizeCategory(cat.name);

            return (
              <button
                key={cat.id || cat.slug}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedCatSlug(cat.slug);
                  setSelectedSub("all");
                }}
                className={`px-6 py-2 rounded-full text-xs sm:text-sm font-semibold tracking-wide transition-all cursor-pointer ${
                  isSelected
                    ? "bg-[#1C1917] text-[#FAF7F2] shadow-sm scale-105"
                    : "bg-[#F4F0EA] border border-[#DDD6CA] text-stone-700 hover:border-stone-400 hover:text-black"
                }`}
              >
                {cat.name}
              </button>
            );
          })}

          {isAdmin && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenCategoryStudio?.();
              }}
              className="px-3.5 py-1.5 border border-dashed border-stone-400 text-stone-600 hover:text-[#1C1917] hover:border-stone-700 rounded-full text-xs font-mono transition-colors cursor-pointer"
              title="Add or Edit Categories"
            >
              + Category
            </button>
          )}
        </div>

        {/* Subcategory Pills Row (Under active category) */}
        {availableSubcategories.length > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-1.5 pt-0.5 pointer-events-auto">
            <span className="text-[11px] font-mono text-stone-400 uppercase tracking-wider mr-1">
              Subseries:
            </span>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedSub("all");
              }}
              className={`px-3.5 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                selectedSub === "all"
                  ? "bg-stone-300 text-stone-900 font-semibold"
                  : "bg-transparent text-stone-600 hover:bg-stone-200/60"
              }`}
            >
              All {activeCategory?.name}
            </button>

            {availableSubcategories.map((sub, sIdx) => {
              const isSubActive = selectedSub.toLowerCase() === sub.toLowerCase();
              return (
                <button
                  key={sIdx}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedSub(sub);
                  }}
                  className={`px-3.5 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                    isSubActive
                      ? "bg-stone-800 text-white font-semibold"
                      : "bg-[#F4F0EA] border border-[#DDD6CA] text-stone-700 hover:border-stone-400 hover:text-black"
                  }`}
                >
                  {sub}
                </button>
              );
            })}
          </div>
        )}

        {/* Direct Link to View Category in Gallery */}
        <div className="pt-1.5 pointer-events-auto">
          <Link
            href={`/gallery?category=${encodeURIComponent(activeCategory?.slug || "people")}${
              selectedSub !== "all" ? `&sub=${encodeURIComponent(selectedSub)}` : ""
            }`}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#1C1917] hover:bg-stone-800 text-[#FAF7F2] text-xs font-mono uppercase tracking-wider transition-all shadow-xs group cursor-pointer"
          >
            <span>
              View {activeCategory?.name || "Collection"} in Gallery
              {filteredCategoryItems.length > 0 ? ` (${filteredCategoryItems.length} Photos)` : ""}
            </span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>

      {/* 3D Center Stage: Cards morph in one swift, continuous motion from Iris aperture directly into the 3D Cylinder */}
      <div
        ref={stageRef}
        className="relative flex-1 w-full flex items-center justify-center pointer-events-none my-auto"
        style={{ transformStyle: "preserve-3d" }}
      >
        {displayCards.length === 0 ? (
          <div className="relative z-20 flex flex-col items-center justify-center text-center px-6 py-20 pointer-events-auto">
            <span className="text-[11px] font-mono tracking-[0.3em] text-stone-400 uppercase mb-3">
              No Photographs in Collection
            </span>
            <p className="text-xs text-stone-500 max-w-sm mb-6 leading-relaxed">
              Photographs uploaded via the Curator Studio will appear here in dynamic 3D.
            </p>
            <Link
              href="/admin/dashboard"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-mono uppercase tracking-[0.2em] bg-white text-black hover:bg-stone-200 rounded-full transition-all"
            >
              <span>Curator Studio</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <div
            className="relative w-0 h-0 flex items-center justify-center"
            style={{ transformStyle: "preserve-3d" }}
          >
          {displayCards.map((item, i) => {
            return (
              <div
                key={i}
                ref={(el) => {
                  cardsRef.current[i] = el;
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleCardClick(item as GalleryItem);
                }}
                suppressHydrationWarning
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-2xl overflow-hidden shadow-2xl will-change-transform bg-neutral-900 border border-white/20 cursor-pointer pointer-events-auto group"
                style={{
                  width: `${dimensions.targetCardW}px`,
                  height: `${dimensions.targetCardH}px`,
                  transformStyle: "preserve-3d",
                  backfaceVisibility: "hidden",
                }}
              >
                <Image
                  src={item.imageUrl}
                  alt={item.title || "Archival Photograph"}
                  fill
                  sizes="(max-width: 768px) 260px, 400px"
                  className="object-cover pointer-events-none transition-transform duration-500 group-hover:scale-105"
                  priority={i < 8}
                />

                {/* Subtle vignette gloss */}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-white/10" />

                {/* Clean Editorial Museum Title on Hover */}
                <div className="pointer-events-none absolute bottom-0 inset-x-0 p-3 sm:p-4 bg-gradient-to-t from-black/90 via-black/50 to-transparent text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-300 block truncate">
                    {item.subcategory || activeCategory?.name}
                  </span>
                  <span className="text-xs sm:text-sm font-semibold truncate block">
                    {item.title}
                  </span>
                  <div className="flex items-center gap-1.5 text-[11px] font-mono text-stone-300 pt-1">
                    <span>View Gallery</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        )}
      </div>

      {/* Scroll Down to Editorial Footer Indicator */}
      <div className="relative z-30 w-full py-4 text-center pointer-events-auto flex items-center justify-center">
        <a
          href="#footer"
          onClick={(e) => {
            e.preventDefault();
            const footerEl = document.querySelector("footer");
            if (footerEl) {
              footerEl.scrollIntoView({ behavior: "smooth" });
            }
          }}
          className="group inline-flex items-center gap-2 text-[10px] sm:text-[11px] font-mono uppercase tracking-[0.22em] text-stone-400 hover:text-stone-200 transition-colors cursor-pointer"
        >
          <span>Scroll to Contact &amp; Studio</span>
          <span className="group-hover:translate-y-0.5 transition-transform duration-200 text-stone-500 group-hover:text-stone-300">
            ↓
          </span>
        </a>
      </div>
    </section>
  );
}
