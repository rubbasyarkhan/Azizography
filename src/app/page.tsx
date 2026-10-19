"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
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
import SmoothScroll from "@/components/SmoothScroll";
import ImageUploader from "@/components/admin/ImageUploader";
import EditItemModal from "@/components/admin/EditItemModal";
import IrisManagerModal from "@/components/admin/IrisManagerModal";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import {
  Plus,
  Sparkles,
  CheckCircle2,
  LogOut,
  ArrowRight,
  Eye,
  Sliders,
} from "lucide-react";

function HomeContent() {
  const { user, logout } = useAuth();
  const isAdmin = Boolean(user);
  const searchParams = useSearchParams();

  const [items, setItems] = useState<GalleryItem[]>(INITIAL_GALLERY_ITEMS);
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [selectedLightboxItem, setSelectedLightboxItem] = useState<GalleryItem | null>(null);
  const [forceShowIntro, setForceShowIntro] = useState(false);
  const [introFinished, setIntroFinished] = useState(false);

  // Sync with ?filter=... URL parameter if navigated from another page
  useEffect(() => {
    const f = searchParams.get("filter");
    if (f) {
      setActiveFilter(f);
    }
  }, [searchParams]);

  // In-situ Admin States
  const [dragEnabled, setDragEnabled] = useState(true);
  const [showUploader, setShowUploader] = useState(false);
  const [showIrisManager, setShowIrisManager] = useState(false);
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Subscribe to live gallery items
  useEffect(() => {
    const unsubscribe = subscribeToGalleryItems((data) => {
      setItems(data);
    });
    return () => unsubscribe();
  }, []);

  // Filter items dynamically by series, category, artist, or tags
  const filteredItems = useMemo(() => {
    return items
      .filter((item) => item.isVisible !== false)
      .filter((item) => {
        if (activeFilter === "all") return true;
        const f = activeFilter.toLowerCase().trim();

        // Match series/project
        if (item.seriesOrProject && item.seriesOrProject.toLowerCase().trim() === f) {
          return true;
        }

        // Match category
        if (item.category && item.category.toLowerCase().trim() === f) {
          return true;
        }

        // Match artist
        if (item.artist && item.artist.toLowerCase().trim() === f) {
          return true;
        }

        // Match tags
        if (item.tags && item.tags.some((t) => t.toLowerCase().trim() === f)) {
          return true;
        }

        return false;
      });
  }, [items, activeFilter]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  // Reorder handler for live Drag & Drop
  const handleReorder = async (newFilteredItems: GalleryItem[]) => {
    if (activeFilter === "all") {
      setItems(newFilteredItems);
      await syncGalleryItemsOrder(newFilteredItems);
      showToast("Live gallery order updated & synced!");
    } else {
      // Reorder within active filter and splice back into master list
      const nonFiltered = items.filter((i) => !newFilteredItems.some((n) => n.id === i.id));
      const combined = [...newFilteredItems, ...nonFiltered];
      setItems(combined);
      await syncGalleryItemsOrder(combined);
      showToast("Category order updated & synced!");
    }
  };

  const handleToggleIris = async (item: GalleryItem) => {
    const nextVal = !item.isIrisItem;
    await updateGalleryItem(item.id, { isIrisItem: nextVal });
    showToast(nextVal ? "Photo added to Iris Animation" : "Photo removed from Iris Animation");
  };

  const handleDeleteItem = async (id: string) => {
    if (confirm("Are you sure you want to permanently delete this photo?")) {
      await deleteGalleryItem(id);
      showToast("Photograph deleted successfully");
    }
  };

  const handleSaveEdit = async (id: string, updates: Partial<GalleryItem>) => {
    await updateGalleryItem(id, updates);
    showToast("Photo details updated!");
    setEditingItem(null);
  };

  const handleReplayIntro = () => {
    setForceShowIntro(true);
    setIntroFinished(false);
  };

  return (
    <SmoothScroll>
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
          <aside aria-label="In-situ Admin Controls" className="sticky top-0 z-50 w-full bg-[#111111] text-white border-b border-white/15 px-4 sm:px-8 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs font-sans shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-bold tracking-wider text-white uppercase text-[11px]">
                  Visual Admin Mode
                </span>
              </div>
              <span className="text-neutral-600 hidden sm:inline">|</span>
              <span className="text-neutral-400 text-[11px] hidden sm:inline">
                Drag photos on live grid to reorder
              </span>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <button
                type="button"
                onClick={() => setShowUploader(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-neutral-200 text-black font-bold uppercase text-[11px] tracking-wider transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Upload Photo</span>
              </button>

              <button
                type="button"
                onClick={() => setShowIrisManager(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-white/10 font-semibold uppercase text-[11px] tracking-wider transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-red-500" />
                <span>Iris Animation ({items.filter((i) => i.isIrisItem).length})</span>
              </button>

              <button
                type="button"
                onClick={() => setDragEnabled(!dragEnabled)}
                className={`px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider border transition-colors cursor-pointer ${
                  dragEnabled
                    ? "bg-red-950/70 text-red-300 border-red-500/50"
                    : "bg-neutral-900 text-neutral-400 border-white/15"
                }`}
              >
                Drag Reorder: {dragEnabled ? "ON" : "OFF"}
              </button>

              <button
                type="button"
                onClick={logout}
                className="text-neutral-400 hover:text-red-400 text-[11px] px-2 py-1 transition-colors cursor-pointer"
              >
                Logout
              </button>
            </div>
          </aside>
        )}

        {/* Live Toast Confirmation Notification */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 bg-[#141414] text-white border border-white/20 px-4 py-2.5 shadow-2xl flex items-center gap-2.5 text-xs font-sans animate-in fade-in slide-in-from-bottom-3 duration-200">
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
            {/* Filter Title Header (When filtered by specific series or category) */}
            {activeFilter !== "all" && (
              <div className="px-6 sm:px-10 lg:px-14 pt-8 pb-2 flex items-baseline justify-between">
                <div>
                  <span className="text-[10px] sm:text-[11px] font-sans uppercase tracking-[0.22em] text-neutral-500 block mb-1">
                    PROJECT / SERIES
                  </span>
                  <h2 className="font-sans text-xl sm:text-2xl font-medium tracking-tight text-neutral-950">
                    {activeFilter}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveFilter("all")}
                  className="text-xs text-neutral-500 hover:text-black uppercase tracking-wider underline underline-offset-4 cursor-pointer"
                >
                  Show All Work ({items.length})
                </button>
              </div>
            )}

            {/* Raw Natural Sized Gallery Grid with In-Situ Drag & Drop */}
            <GalleryGrid
              items={filteredItems}
              onOpenLightbox={(item) => setSelectedLightboxItem(item)}
              isAdmin={Boolean(isAdmin && dragEnabled)}
              onReorder={handleReorder}
              onEditItem={(item) => setEditingItem(item)}
              onDeleteItem={handleDeleteItem}
              onToggleIris={handleToggleIris}
            />

            {/* Minimal Footer */}
            <Footer />
          </div>
        </div>

        {/* Full-Screen Lightbox Modal */}
        <LightboxModal
          item={selectedLightboxItem}
          items={filteredItems}
          onClose={() => setSelectedLightboxItem(null)}
          onSelect={(item) => setSelectedLightboxItem(item)}
        />

        {/* In-Situ Admin Upload Modal */}
        {showUploader && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
            <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
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
    </SmoothScroll>
  );
}

export default function HomePage() {
  return (
    <AuthProvider>
      <Suspense fallback={null}>
        <HomeContent />
      </Suspense>
    </AuthProvider>
  );
}
