"use client";

import React, { useState, useEffect, useCallback, useRef, Suspense } from "react";
import Link from "next/link";
import { GalleryItem } from "@/types/gallery";
import { subscribeToGalleryItems } from "@/lib/gallery-service";
import { INITIAL_GALLERY_ITEMS } from "@/lib/seed-data";
import CategoryShowcase from "@/components/CategoryShowcase";
import Footer from "@/components/Footer";
import LightboxModal from "@/components/LightboxModal";
import ImageUploader from "@/components/admin/ImageUploader";
import IrisManagerModal from "@/components/admin/IrisManagerModal";
import CategoryManagerModal from "@/components/admin/CategoryManagerModal";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import {
  Plus,
  Sparkles,
  CheckCircle2,
  Sliders,
  BookOpen,
  Layers,
  Grid,
} from "lucide-react";

function HomeContent() {
  const { user, logout } = useAuth();
  const isAdmin = Boolean(user);

  const [items, setItems] = useState<GalleryItem[]>(INITIAL_GALLERY_ITEMS);
  const [selectedLightboxItem, setSelectedLightboxItem] = useState<GalleryItem | null>(null);

  // Admin Modals
  const [showUploader, setShowUploader] = useState(false);
  const [showIrisManager, setShowIrisManager] = useState(false);
  const [showCategoryStudio, setShowCategoryStudio] = useState(false);
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
        console.warn("Home items unsubscribe error:", e);
      }
    };
  }, []);

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

  const handleOpenLightbox = useCallback((item: GalleryItem) => {
    setSelectedLightboxItem(item);
  }, []);

  const handleCloseLightbox = useCallback(() => {
    setSelectedLightboxItem(null);
  }, []);

  return (
    <main suppressHydrationWarning className="relative min-h-screen bg-[#FAF9F6] text-[#0A0A0A]">
      {/* In-Situ Admin Floating Bar */}
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
              Manage dynamic categories, subcategories &amp; portfolio photographs
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowCategoryStudio(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#FAF7F2] hover:bg-[#EAE4D9] text-[#1C1917] border border-[#DDD6CA] text-xs sm:text-sm font-semibold rounded-lg transition-colors cursor-pointer shadow-xs"
            >
              <Layers className="w-3.5 h-3.5 text-stone-700" />
              <span>Categories</span>
            </button>

            <button
              type="button"
              onClick={() => setShowUploader(true)}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-[#1C1917] hover:bg-[#292524] text-[#FAF7F2] text-xs sm:text-sm font-semibold rounded-lg transition-colors cursor-pointer shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Upload</span>
            </button>

            <Link
              href="/gallery"
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#FAF7F2] hover:bg-[#EAE4D9] text-[#1C1917] border border-[#DDD6CA] text-xs sm:text-sm font-semibold rounded-lg transition-colors shadow-xs"
            >
              <Grid className="w-3.5 h-3.5 text-stone-600" />
              <span>Full Archive</span>
            </Link>

            <button
              type="button"
              onClick={() => setShowIrisManager(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#FAF7F2] hover:bg-[#EAE4D9] text-[#1C1917] border border-[#DDD6CA] text-xs sm:text-sm font-semibold rounded-lg transition-colors cursor-pointer shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-stone-600" />
              <span>Iris ({items.filter((i) => i.isIrisItem).length})</span>
            </button>

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

      {/* Category Showcase Gateway Section */}
      <CategoryShowcase
        items={items}
        onOpenLightbox={handleOpenLightbox}
        isAdmin={isAdmin}
        onOpenCategoryStudio={() => setShowCategoryStudio(true)}
        onOpenUploader={() => setShowUploader(true)}
      />

      {/* Signature Full Editorial Interactive Mouse Trail Footer */}
      <Footer />

      {/* Full-Screen Lightbox Modal */}
      <LightboxModal
        item={selectedLightboxItem}
        items={items}
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
                showToast("New photograph added & live on portfolio!");
              }}
              onCancel={() => setShowUploader(false)}
            />
          </div>
        </div>
      )}

      {/* In-Situ Category Manager Studio Modal */}
      {showCategoryStudio && (
        <CategoryManagerModal
          items={items}
          onClose={() => setShowCategoryStudio(false)}
        />
      )}

      {/* In-Situ Admin Iris Manager Modal */}
      {showIrisManager && (
        <IrisManagerModal
          items={items}
          onClose={() => setShowIrisManager(false)}
          onPreviewIris={() => {
            setShowIrisManager(false);
            if (typeof window !== "undefined") window.location.reload();
          }}
        />
      )}
    </main>
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
