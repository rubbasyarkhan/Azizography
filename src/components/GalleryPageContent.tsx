"use client";

import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { GalleryItem, CategoryDefinition } from "@/types/gallery";
import {
  subscribeToGalleryItems,
  syncGalleryItemsOrder,
  updateGalleryItem,
  deleteGalleryItem,
} from "@/lib/gallery-service";
import { INITIAL_GALLERY_ITEMS } from "@/lib/seed-data";
import {
  getCategories,
  subscribeToCategories,
  healCategoriesWithItems,
} from "@/lib/category-service";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import GalleryGrid from "@/components/GalleryGrid";
import LightboxModal from "@/components/LightboxModal";
import Footer from "@/components/Footer";
import ImageUploader from "@/components/admin/ImageUploader";
import EditItemModal from "@/components/admin/EditItemModal";
import IrisManagerModal from "@/components/admin/IrisManagerModal";
import CategoryManagerModal from "@/components/admin/CategoryManagerModal";
import { useAuth } from "@/lib/auth-context";
import { normalizeCategory, getCategoryDisplayLabel } from "@/lib/filter-utils";
import {
  Plus,
  Sparkles,
  CheckCircle2,
  LogOut,
  Sliders,
  Layers,
  X,
} from "lucide-react";

interface GalleryPageContentProps {
  initialFilter?: string;
  showBackToCategories?: boolean;
}

export default function GalleryPageContent({
  initialFilter,
  showBackToCategories = true,
}: GalleryPageContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, logout } = useAuth();
  const isAdmin = Boolean(user);

  const [items, setItems] = useState<GalleryItem[]>(INITIAL_GALLERY_ITEMS);
  const [categories, setCategories] = useState<CategoryDefinition[]>(() =>
    getCategories(INITIAL_GALLERY_ITEMS)
  );

  const activeCategoryParam = searchParams.get("category") || searchParams.get("filter") || "";
  const activeSubParam = searchParams.get("sub") || "";

  // Active filter states
  const [selectedCategory, setSelectedCategory] = useState<string>(
    activeCategoryParam || initialFilter || "all"
  );
  const [selectedSub, setSelectedSub] = useState<string>(activeSubParam || "all");
  const [selectedLightboxItem, setSelectedLightboxItem] = useState<GalleryItem | null>(null);

  // Sync with searchParams
  useEffect(() => {
    const c = searchParams.get("category") || searchParams.get("filter");
    const s = searchParams.get("sub");
    if (c) {
      setSelectedCategory(c);
    } else if (initialFilter) {
      setSelectedCategory(initialFilter);
    } else {
      setSelectedCategory("all");
    }
    if (s) {
      setSelectedSub(s);
    } else {
      setSelectedSub("all");
    }
  }, [searchParams, initialFilter]);

  // In-situ Admin States
  const [dragEnabled, setDragEnabled] = useState(true);
  const [showUploader, setShowUploader] = useState(false);
  const [showIrisManager, setShowIrisManager] = useState(false);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Subscribe to live gallery items
  useEffect(() => {
    const unsubscribe = subscribeToGalleryItems((data) => {
      setItems(data);
    });
    return () => {
      try {
        unsubscribe();
      } catch (e) {
        console.warn("Gallery items unsubscribe error:", e);
      }
    };
  }, []);

  // Subscribe to live categories taxonomy
  useEffect(() => {
    const unsub = subscribeToCategories((cats) => {
      setCategories(healCategoriesWithItems(cats, items));
    });
    return () => {
      try {
        unsub();
      } catch (e) {
        console.warn("Gallery categories unsubscribe error:", e);
      }
    };
  }, [items]);

  const activeCategories = useMemo(
    () => healCategoriesWithItems(categories, items),
    [categories, items]
  );

  // Active Category Definition
  const activeCategoryDef = useMemo(() => {
    if (!selectedCategory || selectedCategory === "all") return null;
    return (
      activeCategories.find(
        (c) =>
          normalizeCategory(c.slug) === normalizeCategory(selectedCategory) ||
          normalizeCategory(c.name) === normalizeCategory(selectedCategory)
      ) || null
    );
  }, [activeCategories, selectedCategory]);

  // Filter items dynamically: by category, and by subcategory if specified
  const filteredItems = useMemo(() => {
    return items
      .filter((item) => item.isVisible !== false)
      .filter((item) => {
        // If viewing all
        if (!selectedCategory || selectedCategory === "all") {
          return true;
        }

        if (selectedCategory === "iris") {
          return Boolean(item.isIrisItem);
        }

        const normTarget = normalizeCategory(selectedCategory);
        const normItemCat = normalizeCategory(item.category || "");
        const rawTarget = selectedCategory.toLowerCase().trim();
        const rawItemCat = (item.category || "").toLowerCase().trim();

        const matchesCat =
          normItemCat === normTarget ||
          rawItemCat === rawTarget ||
          normItemCat.includes(normTarget) ||
          normTarget.includes(normItemCat);

        if (!matchesCat) return false;

        // Subcategory check
        if (selectedSub && selectedSub !== "all") {
          const itemSub = (item.subcategory || item.seriesOrProject || "").toLowerCase().trim();
          const targetSub = selectedSub.toLowerCase().trim();
          const matchesSub =
            itemSub === targetSub ||
            itemSub.includes(targetSub) ||
            targetSub.includes(itemSub);
          if (!matchesSub) return false;
        }

        return true;
      });
  }, [items, selectedCategory, selectedSub]);

  const showToast = useCallback((msg: string) => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    setToastMessage(msg);
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    };
  }, []);

  // Reorder handler for live Drag & Drop
  const handleReorder = useCallback(
    async (newFilteredItems: GalleryItem[]) => {
      if (selectedCategory === "all") {
        setItems(newFilteredItems);
        await syncGalleryItemsOrder(newFilteredItems);
        showToast("Live gallery order updated & synced!");
      } else {
        const newIds = new Set(newFilteredItems.map((n) => n.id));
        const nonFiltered = items.filter((i) => !newIds.has(i.id));
        const combined = [...newFilteredItems, ...nonFiltered];
        setItems(combined);
        await syncGalleryItemsOrder(combined);
        showToast("Category order updated & synced!");
      }
    },
    [items, selectedCategory, showToast]
  );

  const handleDeleteItem = useCallback(
    async (id: string) => {
      try {
        await deleteGalleryItem(id);
        setItems((prev) => prev.filter((i) => i.id !== id));
        if (editingItem?.id === id) setEditingItem(null);
        showToast("Photograph removed from archive.");
      } catch (err) {
        console.error("Failed to delete item:", err);
      }
    },
    [editingItem, showToast]
  );

  const handleSaveEdit = useCallback(
    async (id: string, updates: Partial<GalleryItem>) => {
      try {
        await updateGalleryItem(id, updates);
        setItems((prev) =>
          prev.map((i) => (i.id === id ? { ...i, ...updates } : i))
        );
        setEditingItem(null);
        showToast("Changes published to gallery.");
      } catch (err) {
        console.error("Failed to update item:", err);
      }
    },
    [showToast]
  );

  const handleToggleIris = useCallback(
    async (item: GalleryItem) => {
      const nextVal = !item.isIrisItem;
      try {
        await updateGalleryItem(item.id, { isIrisItem: nextVal });
        setItems((prev) =>
          prev.map((i) => (i.id === item.id ? { ...i, isIrisItem: nextVal } : i))
        );
        showToast(
          nextVal
            ? "Assigned photograph to Iris aperture blades!"
            : "Photograph removed from Iris blades."
        );
      } catch (err) {
        console.error("Failed to toggle iris status:", err);
      }
    },
    [showToast]
  );

  const handleOpenLightbox = useCallback((item: GalleryItem) => {
    setSelectedLightboxItem(item);
  }, []);

  const handleCloseLightbox = useCallback(() => {
    setSelectedLightboxItem(null);
  }, []);

  const handleSelectCategory = (catSlug: string) => {
    if (catSlug === "all") {
      router.push("/gallery");
    } else {
      router.push(`/gallery?category=${encodeURIComponent(catSlug)}`);
    }
  };

  const handleSelectSub = (sub: string) => {
    if (sub === "all") {
      router.push(`/gallery?category=${encodeURIComponent(selectedCategory)}`);
    } else {
      router.push(
        `/gallery?category=${encodeURIComponent(selectedCategory)}&sub=${encodeURIComponent(sub)}`
      );
    }
  };

  return (
    <main suppressHydrationWarning className="relative min-h-screen bg-[#FAF9F6] text-[#0A0A0A] flex flex-col">
      {/* Top Navigation Bar: FULL ARCHIVE, ABOUT, CONTACT */}
      <Navbar
        items={items}
        onOpenUploader={() => setShowUploader(true)}
        onOpenCategoryStudio={() => setShowCategoryManager(true)}
      />

      {/* In-Situ Admin Floating Control Bar (Only rendered for authenticated admin) */}
      {isAdmin && (
        <aside
          aria-label="In-situ Admin Controls"
          className="sticky top-0 z-50 w-full bg-[#F4F0EA]/95 backdrop-blur-md text-[#1C1917] border-b border-[#DDD6CA] px-5 sm:px-8 py-2.5 flex flex-wrap items-center justify-between gap-3 text-sm font-admin shadow-xs"
        >
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs font-mono font-bold tracking-wider text-[#1C1917]">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
              <span>STUDIO ACTIVE</span>
            </div>
            <span className="text-[#DDD6CA] hidden sm:inline">|</span>
            <span className="text-stone-600 text-xs sm:text-sm hidden sm:inline">
              Drag photos on live grid to sequence
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCategoryManager(true)}
              className="px-3.5 py-1.5 bg-[#FAF7F2] hover:bg-[#EAE4D9] text-[#1C1917] border border-[#DDD6CA] text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Layers className="w-3.5 h-3.5 text-stone-700" />
              <span>Categories</span>
            </button>

            <Link
              href="/admin/dashboard"
              className="px-3.5 py-1.5 bg-[#FAF7F2] hover:bg-[#EAE4D9] text-[#1C1917] border border-[#DDD6CA] text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <Sliders className="w-3.5 h-3.5 text-stone-700" />
              <span>Studio</span>
            </Link>

            <button
              onClick={() => setShowIrisManager(true)}
              className="px-3.5 py-1.5 bg-[#FAF7F2] hover:bg-[#EAE4D9] text-[#1C1917] border border-[#DDD6CA] text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-stone-700" />
              <span>Iris ({items.filter((i) => i.isIrisItem).length})</span>
            </button>

            <button
              onClick={() => setShowUploader(true)}
              className="px-4 py-1.5 bg-[#1C1917] hover:bg-stone-800 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Photo</span>
            </button>

            <button
              onClick={logout}
              title="Sign out of Studio"
              className="p-1.5 text-stone-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </aside>
      )}

      {/* Floating In-Situ Notification Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 bg-[#1C1917] text-[#FAF7F2] rounded-xl shadow-xl text-xs sm:text-sm font-admin animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Layout with Sticky Left Sidebar */}
      <div className="flex-1 flex flex-col lg:flex-row min-w-0">
        {/* Sticky Left Editorial Sidebar with Categories & Subcategories */}
        <Sidebar
          items={items}
          activeCategory={selectedCategory}
          activeSub={selectedSub}
          onSelectCategory={(cat) => handleSelectCategory(cat)}
          onSelectSub={(cat, sub) => handleSelectSub(sub)}
          brandName="Azizography."
        />

        {/* Right Gallery Portfolio Content Area */}
        <div className="flex-1 w-full overflow-x-hidden min-w-0">
          <div>
            {/* Minimal Filter Status Header (Only visible when a category is selected - NO top pills!) */}
            {selectedCategory !== "all" && (
              <div className="pt-8 sm:pt-10 px-6 sm:px-12 pb-4 border-b border-[#DDD6CA]/60 flex items-center justify-between flex-wrap gap-4">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-stone-400 block mb-1">
                    COLLECTION ARCHIVE
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#1C1917]">
                    {activeCategoryDef ? activeCategoryDef.name : getCategoryDisplayLabel(selectedCategory)}
                    {selectedSub !== "all" && (
                      <span className="text-stone-500 font-normal italic text-lg sm:text-xl ml-2 font-serif">
                        / {selectedSub}
                      </span>
                    )}
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={() => handleSelectCategory("all")}
                  className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-stone-500 hover:text-black transition-colors cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Clear Filter ({items.filter((i) => i.isVisible !== false).length})</span>
                </button>
              </div>
            )}

            {/* Gallery Grid Section */}
            <section className="py-8 sm:py-12 px-4 sm:px-8 md:px-12">
              {filteredItems.length === 0 ? (
                <div className="py-24 text-center space-y-4">
                  <h3 className="font-serif text-2xl text-stone-800">
                    No photographs in this collection yet
                  </h3>
                  <p className="text-xs text-stone-500 font-mono">
                    Use the Curator Studio or Upload button to publish photographs to this collection.
                  </p>
                  <div className="flex items-center justify-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => handleSelectCategory("all")}
                      className="px-4 py-2 bg-[#1C1917] text-[#FAF7F2] rounded-full text-xs font-mono uppercase tracking-wider hover:bg-stone-800 transition-colors cursor-pointer"
                    >
                      View Full Archive
                    </button>
                    {isAdmin && (
                      <button
                        type="button"
                        onClick={() => setShowUploader(true)}
                        className="px-4 py-2 bg-[#F4F0EA] border border-[#DDD6CA] text-stone-800 rounded-full text-xs font-mono uppercase tracking-wider hover:bg-[#EAE4D9] transition-colors cursor-pointer"
                      >
                        + Upload Photograph
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <GalleryGrid
                  items={filteredItems}
                  isAdmin={Boolean(isAdmin && dragEnabled)}
                  onReorder={handleReorder}
                  onEditItem={(item) => setEditingItem(item)}
                  onDeleteItem={handleDeleteItem}
                  onToggleIris={handleToggleIris}
                  onOpenLightbox={handleOpenLightbox}
                />
              )}
            </section>
          </div>
        </div>
      </div>

      {/* 100% Full-Width Editorial Footer across entire screen */}
      <Footer />

      {/* Lightbox Modal */}
      {selectedLightboxItem && (
        <LightboxModal
          item={selectedLightboxItem}
          items={filteredItems}
          onClose={handleCloseLightbox}
          onSelect={handleOpenLightbox}
        />
      )}

      {/* Admin Image Uploader Modal */}
      {showUploader && (
        <ImageUploader
          onSuccess={() => {
            setShowUploader(false);
            showToast("Photograph published to portfolio!");
          }}
          onCancel={() => setShowUploader(false)}
        />
      )}

      {/* Admin Edit Modal */}
      {editingItem && (
        <EditItemModal
          item={editingItem}
          onClose={() => setEditingItem(null)}
          onSave={handleSaveEdit}
          onDelete={handleDeleteItem}
        />
      )}

      {/* Admin Iris Manager Modal */}
      {showIrisManager && (
        <IrisManagerModal
          items={items}
          onClose={() => setShowIrisManager(false)}
          onPreviewIris={() => setShowIrisManager(false)}
        />
      )}

      {/* Admin Category Studio Modal */}
      {showCategoryManager && (
        <CategoryManagerModal onClose={() => setShowCategoryManager(false)} />
      )}
    </main>
  );
}
