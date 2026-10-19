"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth, AuthProvider } from "@/lib/auth-context";
import {
  subscribeToGalleryItems,
  syncGalleryItemsOrder,
  updateGalleryItem,
  deleteGalleryItem,
  resetToDefaultSeed,
} from "@/lib/gallery-service";
import { GalleryItem } from "@/types/gallery";
import DndBoard from "@/components/admin/DndBoard";
import ImageUploader from "@/components/admin/ImageUploader";
import EditItemModal from "@/components/admin/EditItemModal";
import IrisManagerModal from "@/components/admin/IrisManagerModal";
import {
  Plus,
  ExternalLink,
  RotateCcw,
  LogOut,
  Shield,
  Layers,
  Sparkles,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";

function AdminDashboardContent() {
  const router = useRouter();
  const { user, loading, logout, isFirebaseActive } = useAuth();

  const [items, setItems] = useState<GalleryItem[]>([]);
  const [showUploader, setShowUploader] = useState(false);
  const [showIrisManager, setShowIrisManager] = useState(false);
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

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

  const handleReorder = async (newItems: GalleryItem[]) => {
    setItems(newItems);
    await syncGalleryItemsOrder(newItems);
    showNotice("Gallery order synced live across database & public site!");
  };

  const handleToggleVisibility = async (id: string, isVisible: boolean) => {
    await updateGalleryItem(id, { isVisible });
    showNotice(isVisible ? "Asset enabled on public gallery" : "Asset hidden from public gallery");
  };

  const handleToggleFeatured = async (id: string, isFeatured: boolean) => {
    await updateGalleryItem(id, { isFeatured });
    showNotice(isFeatured ? "Asset highlighted as featured" : "Featured badge removed");
  };

  const handleToggleIris = async (id: string, isIrisItem: boolean) => {
    await updateGalleryItem(id, { isIrisItem });
    showNotice(isIrisItem ? "Photo added to Iris intro animation" : "Photo removed from Iris intro animation");
  };

  const handleDeleteItem = async (id: string) => {
    if (confirm("Are you sure you want to permanently delete this gallery item?")) {
      await deleteGalleryItem(id);
      showNotice("Gallery asset deleted successfully");
    }
  };

  const handleSaveEdit = async (id: string, updates: Partial<GalleryItem>) => {
    await updateGalleryItem(id, updates);
    showNotice("Asset metadata updated and saved!");
  };

  const handleResetDefaults = async () => {
    if (
      confirm(
        "Reset the entire gallery back to the initial 12 curated exhibition photos? Any custom uploads will be replaced."
      )
    ) {
      await resetToDefaultSeed();
      showNotice("Gallery reset to default exhibition seed data!");
    }
  };

  const showNotice = (msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => {
      setStatusMessage(null);
    }, 3500);
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-[#070707] text-white flex items-center justify-center font-mono-brutal text-xs">
        <div className="flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
          <span>VERIFYING ADMIN CREDENTIALS...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070707] text-[#f5f5f7] flex flex-col font-mono-brutal select-none">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-[#0d0d0d] border-b border-white/10 px-4 md:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-3 h-3 bg-red-600 group-hover:scale-125 transition-transform" />
            <span className="font-display text-base md:text-lg font-black tracking-tight text-white uppercase">
              AZIZOGRAPHY
            </span>
          </Link>
          <span className="text-[10px] text-neutral-500 uppercase tracking-widest pl-3 border-l border-white/10 hidden sm:inline">
            CANVAS CONTROLLER CMS
          </span>
        </div>

        {/* Status notification toast */}
        {statusMessage && (
          <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-white/10 border border-white/20 text-white text-[11px] rounded-none animate-fade-in">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* User Info & Actions */}
        <div className="flex items-center gap-4 text-xs">
          <div className="hidden md:flex flex-col items-end text-[10px] text-neutral-400">
            <span className="text-white font-bold">{user.email}</span>
            <span className="text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              {isFirebaseActive ? "Firebase Live Mode" : "Demo Mode Active"}
            </span>
          </div>

          <Link
            href="/"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600/90 hover:bg-red-500 text-white text-[10px] uppercase font-bold tracking-wider transition-colors"
          >
            <Sparkles className="w-3 h-3" />
            <span>Visual In-Situ Editor</span>
          </Link>

          <button
            onClick={logout}
            title="Log out"
            className="p-2 border border-white/10 hover:border-red-500 hover:text-red-400 text-neutral-400 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Main Admin Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8 space-y-8">
        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
          <div>
            <span className="text-[10px] text-red-500 font-bold uppercase tracking-widest block mb-1">
              // REARRANGE & CURATE
            </span>
            <h1 className="font-display text-3xl font-extrabold uppercase text-white tracking-tight">
              DRAG & DROP GALLERY CONTROLLER
            </h1>
            <p className="text-neutral-400 text-xs mt-1">
              Drag cards to rearrange order on live site. Changes sync in real-time to Firestore.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowUploader(!showUploader)}
              className="px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{showUploader ? "Close Uploader" : "Upload New Image"}</span>
            </button>

            <button
              type="button"
              onClick={() => setShowIrisManager(true)}
              className="px-3.5 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-white/10 font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-red-500" />
              <span>Iris Animation ({items.filter((i) => i.isIrisItem).length})</span>
            </button>

            <button
              onClick={handleResetDefaults}
              title="Reset gallery to default exhibition images"
              className="px-3 py-2.5 border border-white/15 hover:border-white text-neutral-300 hover:text-white text-xs uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-neutral-400" />
              <span className="hidden sm:inline">Reset Defaults</span>
            </button>
          </div>
        </div>

        {/* Image Uploader Drawer if open */}
        {showUploader && (
          <div className="animate-fade-in">
            <ImageUploader
              onSuccess={() => {
                setShowUploader(false);
                showNotice("New image uploaded and published to gallery!");
              }}
              onCancel={() => setShowUploader(false)}
            />
          </div>
        )}

        {/* Drag and Drop Canvas Controller */}
        <DndBoard
          items={items}
          onReorder={handleReorder}
          onToggleVisibility={handleToggleVisibility}
          onToggleFeatured={handleToggleFeatured}
          onToggleIris={handleToggleIris}
          onDeleteItem={handleDeleteItem}
          onEditItem={(item) => setEditingItem(item)}
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
