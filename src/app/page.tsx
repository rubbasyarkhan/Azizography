"use client";

import React, { useState, useEffect, useMemo, useCallback, useRef, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { GalleryItem } from "@/types/gallery";
import {
  subscribeToGalleryItems,
  syncGalleryItemsOrder,
  updateGalleryItem,
  deleteGalleryItem,
} from "@/lib/gallery-service";
import { INITIAL_GALLERY_ITEMS } from "@/lib/seed-data";
import IntroLoader from "@/components/IntroLoader";
import Sidebar from "@/components/Sidebar";
import GalleryGrid from "@/components/GalleryGrid";
import LightboxModal from "@/components/LightboxModal";
import Footer from "@/components/Footer";
import ImageUploader from "@/components/admin/ImageUploader";
import EditItemModal from "@/components/admin/EditItemModal";
import IrisManagerModal from "@/components/admin/IrisManagerModal";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import { itemMatchesFilter, getCategoryDisplayLabel } from "@/lib/filter-utils";
import {
  Plus,
  Sparkles,
  CheckCircle2,
  LogOut,
  ArrowRight,
  Eye,
  Sliders,
  BookOpen,
} from "lucide-react";

interface HomePageProps {
  initialFilter?: string;
}

function HomeContent({ initialFilter }: HomePageProps) {
  const { user, logout } = useAuth();
  const isAdmin = Boolean(user);
  const searchParams = useSearchParams();

  const [items, setItems] = useState<GalleryItem[]>(INITIAL_GALLERY_ITEMS);
  const [activeFilter, setActiveFilter] = useState<string>(initialFilter || "all");
  const [selectedLightboxItem, setSelectedLightboxItem] = useState<GalleryItem | null>(null);
  const [forceShowIntro, setForceShowIntro] = useState(false);
  const [introFinished, setIntroFinished] = useState(false);

  // Sync with ?filter=... URL parameter if navigated from another page
  useEffect(() => {
    const f = searchParams.get("filter");
    if (f) {
      setActiveFilter(f);
    } else if (initialFilter) {
      setActiveFilter(initialFilter);
    } else {
      setActiveFilter("all");
    }
  }, [searchParams, initialFilter]);

  // In-situ Admin States
  const [dragEnabled, setDragEnabled] = useState(true);
  const [showUploader, setShowUploader] = useState(false);
  const [showIrisManager, setShowIrisManager] = useState(false);
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Subscribe to live gallery items
  useEffect(() => {
    const unsubscribe = subscribeToGalleryItems((data) => {
      setItems(data);
    });
    return () => unsubscribe();
  }, []);

  // Filter items dynamically by series, category, artist, description, or tags
  const filteredItems = useMemo(() => {
    return items
      .filter((item) => item.isVisible !== false)
      .filter((item) => itemMatchesFilter(item, activeFilter));
  }, [items, activeFilter]);

  const showToast = useCallback((msg: string) => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    setToastMessage(msg);
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  }, []);

  // Clean up toast timer on unmount
  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    };
  }, []);

  // Reorder handler for live Drag & Drop with O(N) splicing
  const handleReorder = useCallback(async (newFilteredItems: GalleryItem[]) => {
    if (activeFilter === "all") {
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
  }, [activeFilter, items, showToast]);

  const handleToggleIris = useCallback(async (item: GalleryItem) => {
    const nextVal = !item.isIrisItem;
    await updateGalleryItem(item.id, { isIrisItem: nextVal });
    showToast(nextVal ? "Photo added to Iris Animation" : "Photo removed from Iris Animation");
  }, [showToast]);

  const handleDeleteItem = useCallback(async (id: string) => {
    const itemToDelete = items.find((i) => i.id === id);
    const itemTitle = itemToDelete?.title || "this photograph";
    if (confirm(`Permanently delete "${itemTitle}"? This will remove the photograph and its media files.`)) {
      setItems((prev) => prev.filter((i) => i.id !== id));
      await deleteGalleryItem(id, itemToDelete);
      showToast("Photograph permanently deleted");
    }
  }, [items, showToast]);

  const handleSaveEdit = useCallback(async (id: string, updates: Partial<GalleryItem>) => {
    await updateGalleryItem(id, updates);
    showToast("Photo details updated!");
    setEditingItem(null);
  }, [showToast]);

  const handleReplayIntro = useCallback(() => {
    setForceShowIntro(true);
    setIntroFinished(false);
  }, []);

  const handleOpenLightbox = useCallback((item: GalleryItem) => {
    setSelectedLightboxItem(item);
  }, []);

  const handleCloseLightbox = useCallback(() => {
    setSelectedLightboxItem(null);
  }, []);

  return (
    <main className="relative min-h-screen bg-[#FAF9F6] text-[#0A0A0A]">
        {/* Cinematic Intro Animation on Page Load (Solid Black background, expanding iris, smooth dissolve) */}
        <IntroLoader
          forceShow={forceShowIntro}
          onComplete={() => {
            setIntroFinished(true);
            setForceShowIntro(false);
          }}
        />

        {/* In-Situ Admin Floating Control Bar (Only rendered for authenticated admin) */}
        {isAdmin && (
          <aside aria-label="In-situ Admin Controls" className="sticky top-0 z-50 w-full bg-[#F4F0EA]/95 backdrop-blur-md text-[#1C1917] border-b border-[#DDD6CA] px-5 sm:px-8 py-2.5 flex flex-wrap items-center justify-between gap-3 text-sm font-admin shadow-xs">
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
              <Link
                href="/admin/dashboard"
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#FAF7F2] hover:bg-[#EAE4D9] text-[#1C1917] border border-[#DDD6CA] text-xs sm:text-sm font-semibold rounded-lg transition-colors shadow-xs"
              >
                <Sliders className="w-3.5 h-3.5 text-stone-600" />
                <span>Dashboard</span>
              </Link>

              <Link
                href="/admin/guide"
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#FAF7F2] hover:bg-[#EAE4D9] text-[#1C1917] border border-[#DDD6CA] text-xs sm:text-sm font-semibold rounded-lg transition-colors shadow-xs"
              >
                <BookOpen className="w-3.5 h-3.5 text-stone-600" />
                <span>Guide</span>
              </Link>

              <button
                type="button"
                onClick={() => setShowUploader(true)}
                className="flex items-center gap-1.5 px-4 py-1.5 bg-[#1C1917] hover:bg-[#292524] text-[#FAF7F2] text-xs sm:text-sm font-semibold rounded-lg transition-colors cursor-pointer shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Upload</span>
              </button>

              <button
                type="button"
                onClick={() => setShowIrisManager(true)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#FAF7F2] hover:bg-[#EAE4D9] text-[#1C1917] border border-[#DDD6CA] text-xs sm:text-sm font-semibold rounded-lg transition-colors cursor-pointer shadow-xs"
              >
                <Sparkles className="w-3.5 h-3.5 text-stone-600" />
                <span>Iris ({items.filter((i) => i.isIrisItem).length})</span>
              </button>

              <button
                type="button"
                onClick={() => setDragEnabled(!dragEnabled)}
                className={`px-3.5 py-1.5 text-xs sm:text-sm border rounded-lg transition-colors cursor-pointer ${
                  dragEnabled
                    ? "bg-[#1C1917] text-[#FAF7F2] border-[#1C1917] font-semibold shadow-xs"
                    : "bg-[#FAF7F2] hover:bg-[#EAE4D9] text-stone-700 border-[#DDD6CA] font-medium shadow-xs"
                }`}
              >
                Reorder: {dragEnabled ? "ON" : "OFF"}
              </button>

              <button
                type="button"
                onClick={logout}
                className="text-stone-600 hover:text-[#1C1917] text-xs sm:text-sm font-semibold px-3 py-1.5 transition-colors cursor-pointer hover:bg-[#EAE4D9] rounded-lg"
              >
                Logout
              </button>
            </div>
          </aside>
        )}

        {/* Live Toast Confirmation Notification */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 bg-[#1C1917] text-[#FAF7F2] border border-stone-800 px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 text-sm font-medium animate-in fade-in slide-in-from-bottom-3 duration-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Main Editorial Portfolio (Sidebar + Raw Sized Gallery Grid) */}
        <div className="relative z-10 flex flex-col lg:flex-row min-h-screen">
          {/* Left Editorial Fixed/Sticky Sidebar (Matching Jessica Chou Reference) */}
          <Sidebar
            items={items}
            activeFilter={activeFilter}
            onSelectFilter={(f) => setActiveFilter(f)}
            brandName="Azizography."
          />

          {/* Right Main Gallery Area */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Filter Title Header (When filtered by specific series, tag, or category) */}
            {activeFilter !== "all" && (
              <div className="px-6 sm:px-10 lg:px-14 pt-8 pb-2 flex items-baseline justify-between">
                <div>
                  <span className="text-[10px] sm:text-[11px] font-sans uppercase tracking-[0.22em] text-[#78716C] block mb-1">
                    EXHIBITION / FILTER
                  </span>
                  <h2 className="font-sans text-xl sm:text-2xl font-medium tracking-tight text-[#1C1917]">
                    {getCategoryDisplayLabel(activeFilter)}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setActiveFilter("all");
                    if (typeof window !== "undefined") {
                      window.history.pushState(null, "", "/");
                    }
                  }}
                  className="text-xs text-[#78716C] hover:text-[#1C1917] uppercase tracking-wider underline underline-offset-4 cursor-pointer"
                >
                  Show All Work ({items.length})
                </button>
              </div>
            )}

            {/* Raw Natural Sized Gallery Grid with In-Situ Drag & Drop */}
            <GalleryGrid
              items={filteredItems}
              onOpenLightbox={handleOpenLightbox}
              isAdmin={Boolean(isAdmin && dragEnabled)}
              onReorder={handleReorder}
              onEditItem={(item) => setEditingItem(item)}
              onDeleteItem={handleDeleteItem}
              onToggleIris={handleToggleIris}
            />
          </div>
        </div>

        {/* Full-Width & Section-Height Footer */}
        <Footer />

        {/* Full-Screen Lightbox Modal */}
        <LightboxModal
          item={selectedLightboxItem}
          items={filteredItems}
          onClose={handleCloseLightbox}
          onSelect={handleOpenLightbox}
        />

        {/* In-Situ Admin Upload Modal */}
        {showUploader && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="w-full max-w-4xl max-h-[92vh] overflow-y-auto">
              <ImageUploader
                onSuccess={() => {
                  setShowUploader(false);
                  showToast("New photo ingested & live on portfolio!");
                }}
                onCancel={() => setShowUploader(false)}
              />
            </div>
          </div>
        )}

        {/* In-Situ Admin Iris Manager Modal */}
        {showIrisManager && (
          <IrisManagerModal
            items={items}
            onClose={() => setShowIrisManager(false)}
            onPreviewIris={() => {
              setShowIrisManager(false);
              handleReplayIntro();
            }}
          />
        )}

        {/* In-Situ Admin Edit Photo Modal */}
        {editingItem && (
          <EditItemModal
            item={editingItem}
            onClose={() => setEditingItem(null)}
            onSave={handleSaveEdit}
            onDelete={handleDeleteItem}
          />
        )}
      </main>
  );
}

export default function HomePage({ initialFilter }: HomePageProps) {
  return (
    <AuthProvider>
      <Suspense fallback={null}>
        <HomeContent initialFilter={initialFilter} />
      </Suspense>
    </AuthProvider>
  );
}
