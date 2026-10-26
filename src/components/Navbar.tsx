"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  Menu,
  X,
  ArrowRight,
  Layers,
  Plus,
  Sliders,
  LogOut,
  ChevronDown,
} from "lucide-react";
import { CategoryDefinition, GalleryItem } from "@/types/gallery";
import { getCategories, subscribeToCategories, healCategoriesWithItems } from "@/lib/category-service";
import { normalizeCategory } from "@/lib/filter-utils";
import { useAuth } from "@/lib/auth-context";

interface NavbarProps {
  items?: GalleryItem[];
  onOpenUploader?: () => void;
  onOpenCategoryStudio?: () => void;
  activeCategorySlug?: string;
}

export default function Navbar({
  items = [],
  onOpenUploader,
  onOpenCategoryStudio,
  activeCategorySlug,
}: NavbarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user, logout } = useAuth();
  const isAdmin = Boolean(user);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categories, setCategories] = useState<CategoryDefinition[]>(() =>
    getCategories(items)
  );

  useEffect(() => {
    const unsub = subscribeToCategories((cats) => {
      setCategories(healCategoriesWithItems(cats, items));
    });
    return () => {
      try {
        unsub();
      } catch (e) {
        console.warn("Navbar categories unsubscribe error:", e);
      }
    };
  }, [items]);

  const activeCategories = healCategoriesWithItems(categories, items);

  const currentCategoryParam = searchParams.get("category") || activeCategorySlug || "";

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname, searchParams]);

  return (
    <header className="sticky top-0 z-40 w-full bg-[#FAF9F6]/95 backdrop-blur-md border-b border-[#DDD6CA]/70 text-[#1C1917] transition-all">
      <div className="max-w-7xl mx-auto px-6 sm:px-10 h-16 sm:h-20 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group shrink-0">
          <span className="font-serif text-xl sm:text-2xl font-bold tracking-wider uppercase text-[#1C1917] group-hover:text-stone-600 transition-colors">
            AZIZOGRAPHY
          </span>
          <span className="text-xs text-stone-500 font-mono tracking-widest uppercase">
            / STUDIO
          </span>
        </Link>

        {/* Desktop Primary Navigation: ONLY FULL ARCHIVE, ABOUT, CONTACT */}
        <nav className="hidden md:flex items-center gap-7 lg:gap-9 text-xs font-mono uppercase tracking-[0.2em]">
          <Link
            href="/gallery"
            className={`transition-colors py-1 ${
              pathname === "/gallery"
                ? "text-[#1C1917] font-bold border-b-2 border-[#1C1917]"
                : "text-stone-600 hover:text-[#1C1917] font-medium"
            }`}
          >
            FULL ARCHIVE
          </Link>

          <Link
            href="/about"
            className={`transition-colors py-1 ${
              pathname === "/about"
                ? "text-[#1C1917] font-bold border-b-2 border-[#1C1917]"
                : "text-stone-600 hover:text-[#1C1917] font-medium"
            }`}
          >
            ABOUT
          </Link>

          <Link
            href="/contact"
            className={`transition-colors py-1 ${
              pathname === "/contact"
                ? "text-[#1C1917] font-bold border-b-2 border-[#1C1917]"
                : "text-stone-600 hover:text-[#1C1917] font-medium"
            }`}
          >
            CONTACT
          </Link>
        </nav>

        {/* Right Action Buttons */}
        <div className="hidden sm:flex items-center gap-3 shrink-0">
          {isAdmin ? (
            <div className="flex items-center gap-2">
              {onOpenUploader && (
                <button
                  type="button"
                  onClick={onOpenUploader}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1C1917] text-[#FAF7F2] hover:bg-stone-800 text-[11px] font-mono uppercase tracking-wider rounded-lg transition-colors cursor-pointer shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Upload</span>
                </button>
              )}

              {onOpenCategoryStudio && (
                <button
                  type="button"
                  onClick={onOpenCategoryStudio}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F4F0EA] border border-[#DDD6CA] text-stone-700 hover:text-black text-[11px] font-mono uppercase tracking-wider rounded-lg cursor-pointer"
                >
                  <Layers className="w-3.5 h-3.5 text-stone-600" />
                  <span>Categories</span>
                </button>
              )}

              <Link
                href="/admin/dashboard"
                className="flex items-center gap-1 px-2.5 py-1.5 text-stone-600 hover:text-black text-xs font-mono uppercase"
                title="Admin Dashboard"
              >
                <Sliders className="w-3.5 h-3.5" />
              </Link>

              <button
                type="button"
                onClick={logout}
                className="p-1.5 text-stone-500 hover:text-red-700 rounded-md cursor-pointer"
                title="Logout"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <Link
              href="/gallery"
              className="flex items-center gap-1.5 px-4 py-2 bg-[#1C1917] text-[#FAF7F2] hover:bg-stone-800 text-xs font-mono uppercase tracking-widest rounded-full transition-all shadow-xs"
            >
              <span>Explore Gallery</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>

        {/* Mobile Hamburger Toggle Button */}
        <div className="flex md:hidden items-center gap-2">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-stone-700 hover:text-[#1C1917] hover:bg-[#EAE4D9]/60 rounded-lg transition-colors cursor-pointer"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#DDD6CA] bg-[#FAF7F2] px-6 py-6 space-y-4 animate-in fade-in duration-200">
          <nav className="flex flex-col space-y-3 font-mono text-xs uppercase tracking-[0.2em]">
            <Link
              href="/gallery"
              className={`py-2 border-b border-[#DDD6CA]/40 ${
                pathname === "/gallery" ? "font-bold text-[#1C1917]" : "text-stone-600"
              }`}
            >
              FULL ARCHIVE
            </Link>

            <Link
              href="/about"
              className={`py-2 border-b border-[#DDD6CA]/40 ${
                pathname === "/about" ? "font-bold text-[#1C1917]" : "text-stone-600"
              }`}
            >
              ABOUT
            </Link>

            <Link
              href="/contact"
              className={`py-2 border-b border-[#DDD6CA]/40 ${
                pathname === "/contact" ? "font-bold text-[#1C1917]" : "text-stone-600"
              }`}
            >
              CONTACT
            </Link>

            {isAdmin && (
              <div className="pt-3 flex flex-col gap-2 border-t border-[#DDD6CA]">
                <Link
                  href="/admin/dashboard"
                  className="py-1.5 text-stone-700 font-semibold"
                >
                  Admin Dashboard
                </Link>
                <button
                  type="button"
                  onClick={logout}
                  className="text-left text-red-600 font-semibold py-1"
                >
                  Sign Out
                </button>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
