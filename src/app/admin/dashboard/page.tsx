"use client";

import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth, AuthProvider } from "@/lib/auth-context";
import {
  subscribeToGalleryItems,
  syncGalleryItemsOrder,
  updateGalleryItem,
  deleteGalleryItem,
} from "@/lib/gallery-service";
import { GalleryItem } from "@/types/gallery";
import DndBoard from "@/components/admin/DndBoard";
import ImageUploader from "@/components/admin/ImageUploader";
import EditItemModal from "@/components/admin/EditItemModal";
import IrisManagerModal from "@/components/admin/IrisManagerModal";
import AboutEditorModal from "@/components/admin/AboutEditorModal";
import {
  Plus,
  ExternalLink,
  LogOut,
  Sparkles,
  BookOpen,
  User,
} from "lucide-react";

function AdminDashboardContent() {
  const router = useRouter();
  const { user, loading, logout, isFirebaseActive } = useAuth();

  const [items, setItems] = useState<GalleryItem[]>([]);
  const [showUploader, setShowUploader] = useState(false);
  const [showIrisManager, setShowIrisManager] = useState(false);
  const [showAboutEditor, setShowAboutEditor] = useState(false);
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [importData, setImportData] = useState<{
    imageUrl?: string;
    imageUrls?: string[];
    postUrl?: string;
    caption?: string;
  } | null>(null);
  const statusTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Check if opened from Instagram Bookmarklet
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const rawImgs = params.get("import_imgs");
      const img = params.get("import_img");
      const post = params.get("import_post");
      const caption = params.get("import_caption");

      let parsedImgs: string[] = [];
      if (rawImgs) {
        try {
          parsedImgs = JSON.parse(rawImgs);
        } catch {
          parsedImgs = rawImgs.split(",").map((s) => s.trim()).filter(Boolean);
        }
      } else if (img) {
        parsedImgs = [img];
      }

      if (parsedImgs.length > 0) {
        setImportData({
          imageUrl: parsedImgs[0],
          imageUrls: parsedImgs,
          postUrl: post || undefined,
          caption: caption || undefined,
        });
        setShowUploader(true);
        // Clean URL query parameters quietly without a page reload
        window.history.replaceState({}, "", window.location.pathname);
      }
    }
  }, []);

  // Auth Guard
  useEffect(() => {
    if (!loading && !user) {
      router.push("/admin");
    }
  }, [user, loading, router]);

  // Subscribe to live items
  useEffect(() => {
    const unsubscribe = subscribeToGalleryItems((data) => {
      setItems(data);
    });
    return () => unsubscribe();
  }, []);

  const showNotice = useCallback((msg: string) => {
    if (statusTimeoutRef.current) {
      clearTimeout(statusTimeoutRef.current);
    }
    setStatusMessage(msg);
    statusTimeoutRef.current = setTimeout(() => {
      setStatusMessage(null);
    }, 3200);
  }, []);

  useEffect(() => {
    return () => {
      if (statusTimeoutRef.current) clearTimeout(statusTimeoutRef.current);
    };
  }, []);

  const handleReorder = useCallback(async (newItems: GalleryItem[]) => {
    setItems(newItems);
    await syncGalleryItemsOrder(newItems);
    showNotice("Exhibition sequence saved");
  }, [showNotice]);

  const handleToggleVisibility = useCallback(async (id: string, isVisible: boolean) => {
    await updateGalleryItem(id, { isVisible });
    showNotice(isVisible ? "Asset published to public gallery" : "Asset hidden from public gallery");
  }, [showNotice]);

  const handleToggleFeatured = useCallback(async (id: string, isFeatured: boolean) => {
    await updateGalleryItem(id, { isFeatured });
    showNotice(isFeatured ? "Marked as featured hero" : "Featured badge removed");
  }, [showNotice]);

  const handleToggleIris = useCallback(async (id: string, isIrisItem: boolean) => {
    await updateGalleryItem(id, { isIrisItem });
    showNotice(isIrisItem ? "Added to opening Iris ring" : "Removed from opening Iris ring");
  }, [showNotice]);

  const handleToggleFooterTrail = useCallback(async (id: string, isFooterTrailItem: boolean) => {
    await updateGalleryItem(id, { isFooterTrailItem });
    showNotice(isFooterTrailItem ? "Added to footer mouse trail" : "Removed from footer mouse trail");
  }, [showNotice]);

  const handleDeleteItem = useCallback(async (id: string) => {
    const itemToDelete = items.find((i) => i.id === id);
    const itemTitle = itemToDelete?.title || "this photograph";
    if (confirm(`Permanently delete "${itemTitle}"? This will remove the photograph and its media files.`)) {
      setItems((prev) => prev.filter((i) => i.id !== id));
      await deleteGalleryItem(id, itemToDelete);
      showNotice("Photograph permanently deleted");
    }
  }, [items, showNotice]);

  const handleSaveEdit = useCallback(async (id: string, updates: Partial<GalleryItem>) => {
    await updateGalleryItem(id, updates);
    showNotice("Photograph details updated");
  }, [showNotice]);

  const visibleCount = useMemo(() => items.filter((i) => i.isVisible !== false).length, [items]);
  const irisCount = useMemo(() => items.filter((i) => i.isIrisItem).length, [items]);
  const footerTrailCount = useMemo(() => items.filter((i) => i.isFooterTrailItem).length, [items]);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-[#F4F0EA] text-[#1C1917] flex items-center justify-center font-admin text-base">
        <span className="text-stone-500 font-mono tracking-widest uppercase">LOADING STUDIO...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F0EA] text-[#1C1917] flex flex-col font-admin">
      {/* Studio Navigation Bar */}
      <header className="sticky top-0 z-40 bg-[#F4F0EA]/95 backdrop-blur-md border-b border-[#DDD6CA] px-6 sm:px-10 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2.5 group">
            <span className="text-lg font-bold tracking-wider text-[#1C1917] uppercase group-hover:text-stone-600 transition-colors">
              AZIZOGRAPHY
            </span>
            <span className="text-sm text-stone-500 font-mono font-medium">/ STUDIO</span>
          </Link>

          <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-[#DDD6CA] text-xs text-stone-600 font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-600" />
            <span>{isFirebaseActive ? "LIVE CLOUD" : "LOCAL CACHE"}</span>
          </div>
        </div>

        {/* Status Toast */}
        {statusMessage && (
          <div className="hidden md:flex items-center gap-2 px-3.5 py-1.5 bg-[#FAF7F2] border border-[#DDD6CA] text-[#1C1917] text-sm font-medium rounded-lg animate-fade-in shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-600" />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* User Info & Actions */}
        <div className="flex items-center gap-3">
          <Link
            href="/admin/guide"
            className="flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-stone-700 hover:text-[#1C1917] hover:bg-[#EAE4D9]/70 rounded-lg transition-colors border border-transparent hover:border-[#DDD6CA]"
          >
            <BookOpen className="w-4 h-4 text-stone-600" />
            <span className="hidden sm:inline">Guide</span>
          </Link>

          <Link
            href="/"
            className="flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-stone-700 hover:text-[#1C1917] hover:bg-[#EAE4D9]/70 rounded-lg transition-colors border border-transparent hover:border-[#DDD6CA]"
          >
            <ExternalLink className="w-4 h-4 text-stone-600" />
            <span className="hidden sm:inline">Portfolio</span>
          </Link>

          <div className="h-4 w-px bg-[#DDD6CA] mx-1 hidden sm:block" />

          <button
            onClick={logout}
            title="Sign Out"
            className="p-2 text-stone-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Studio Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 sm:p-8 md:p-10 space-y-8">
        {/* Title & Primary Toolbar with Big Fonts */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 pb-6 border-b border-[#DDD6CA]">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-[#1C1917] tracking-tight">
              Archive & Exhibition
            </h1>
            <p className="text-base text-stone-600 mt-2">
              {items.length} works total · {visibleCount} published · {irisCount} in Iris intro · {footerTrailCount} in footer trail
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowUploader(!showUploader)}
              className="px-5 py-2.5 bg-[#1C1917] hover:bg-[#292524] text-[#FAF7F2] font-semibold text-sm rounded-lg flex items-center gap-2 transition-colors cursor-pointer shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>{showUploader ? "Close Uploader" : "Add Photograph"}</span>
            </button>

            <button
              type="button"
              onClick={() => setShowAboutEditor(true)}
              className="px-4 py-2.5 bg-[#FAF7F2] hover:bg-[#EAE4D9] text-[#1C1917] border border-[#DDD6CA] hover:border-stone-400 text-sm font-semibold rounded-lg flex items-center gap-2 transition-colors cursor-pointer shadow-xs"
            >
              <User className="w-4 h-4 text-stone-700" />
              <span>Edit About Page</span>
            </button>

            <button
              type="button"
              onClick={() => setShowIrisManager(true)}
              className="px-4 py-2.5 bg-[#FAF7F2] hover:bg-[#EAE4D9] text-[#1C1917] border border-[#DDD6CA] hover:border-stone-400 text-sm font-semibold rounded-lg flex items-center gap-2 transition-colors cursor-pointer shadow-xs"
            >
              <Sparkles className="w-4 h-4 text-stone-700" />
              <span>Iris Ring ({irisCount})</span>
            </button>

            <Link
              href="/admin/guide"
              className="px-4 py-2.5 bg-[#FAF7F2] hover:bg-[#EAE4D9] text-[#1C1917] border border-[#DDD6CA] hover:border-stone-400 text-sm font-semibold rounded-lg flex items-center gap-2 transition-colors cursor-pointer shadow-xs"
            >
              <BookOpen className="w-4 h-4 text-stone-700" />
              <span>Tutorial Guide</span>
            </Link>
          </div>
        </div>

        {/* Image Uploader Drawer */}
        {showUploader && (
          <div className="animate-in fade-in duration-150">
            <ImageUploader
              initialImportData={importData}
              onSuccess={() => {
                setShowUploader(false);
                setImportData(null);
                showNotice("Photograph published to portfolio");
              }}
              onCancel={() => {
                setShowUploader(false);
                setImportData(null);
              }}
            />
          </div>
        )}

        {/* Live Reordering & Gallery Board */}
        <DndBoard
          items={items}
          onReorder={handleReorder}
          onToggleVisibility={handleToggleVisibility}
          onToggleFeatured={handleToggleFeatured}
          onToggleIris={handleToggleIris}
          onToggleFooterTrail={handleToggleFooterTrail}
          onDeleteItem={handleDeleteItem}
          onEditItem={(item) => setEditingItem(item)}
          onOpenUploader={() => setShowUploader(true)}
        />
      </main>

      {/* Iris Manager Modal */}
      {showIrisManager && (
        <IrisManagerModal
          items={items}
          onClose={() => setShowIrisManager(false)}
          onPreviewIris={() => {
            setShowIrisManager(false);
            router.push("/");
          }}
        />
      )}

      {/* About Editor Modal */}
      <AboutEditorModal
        isOpen={showAboutEditor}
        onClose={() => setShowAboutEditor(false)}
        onSaved={(msg) => showNotice(msg)}
      />

      {/* Edit Item Modal */}
      <EditItemModal
        item={editingItem}
        onClose={() => setEditingItem(null)}
        onSave={handleSaveEdit}
        onDelete={handleDeleteItem}
      />
    </div>
  );
}

export default function AdminDashboardPage() {
  return (
    <AuthProvider>
      <AdminDashboardContent />
    </AuthProvider>
  );
}
