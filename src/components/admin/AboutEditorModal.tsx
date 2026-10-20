"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import {
  AboutContent,
  ClientItem,
  getLocalAboutContent,
  saveAboutContent,
  uploadAboutPortrait,
  uploadClientImage,
} from "@/lib/about-service";
import { convertAndCompressToWebP, formatBytes } from "@/lib/image-utils";
import {
  X,
  Upload,
  Plus,
  Trash2,
  CheckCircle2,
  Loader2,
  User,
  Image as ImageIcon,
  Sparkles,
  ArrowRight,
} from "lucide-react";

interface AboutEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: (msg: string) => void;
}

export default function AboutEditorModal({
  isOpen,
  onClose,
  onSaved,
}: AboutEditorModalProps) {
  const [data, setData] = useState<AboutContent>(getLocalAboutContent());
  const [uploading, setUploading] = useState(false);
  const [converting, setConverting] = useState(false);
  const [uploadStats, setUploadStats] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [clientUploadingIndex, setClientUploadingIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const current = getLocalAboutContent();
    setData(current);
    setUploadStats(null);

    // Lock background scroll and pause Lenis so mouse wheel scrolls modal natively
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const lenis = (window as unknown as { __lenis?: { stop: () => void; start: () => void } }).__lenis;
    lenis?.stop();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      lenis?.start();
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleImageFileSelect = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image file.");
      return;
    }
    setConverting(true);
    setUploadStats(null);

    try {
      const webpResult = await convertAndCompressToWebP(file, {
        maxWidth: 1600,
        maxHeight: 2000,
        quality: 0.85,
      });

      setUploadStats(
        `Optimized: ${formatBytes(file.size)} → ${formatBytes(webpResult.file.size)} (${Math.round(
          (1 - webpResult.compressionRatio) * 100
        )}% saved)`
      );

      setConverting(false);
      setUploading(true);

      const url = await uploadAboutPortrait(webpResult.file);
      setData((prev) => ({ ...prev, portraitImageUrl: url }));
      setUploading(false);
    } catch (err) {
      console.error("About image upload error:", err);
      setConverting(false);
      setUploading(false);
      alert("Failed to process image. You can also paste an image URL directly.");
    }
  };

  const handleClientImageSelect = async (index: number, file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image file.");
      return;
    }
    setClientUploadingIndex(index);
    try {
      const webpResult = await convertAndCompressToWebP(file, {
        maxWidth: 1200,
        maxHeight: 1600,
        quality: 0.82,
      });

      const url = await uploadClientImage(webpResult.file);
      handleUpdateClient(index, "imageUrl", url);
    } catch (err) {
      console.error("Client image upload error:", err);
      alert("Failed to upload image. You can also paste an image URL directly.");
    } finally {
      setClientUploadingIndex(null);
    }
  };

  const handleAddClient = () => {
    const newClient: ClientItem = {
      id: `client-${Date.now()}`,
      name: "NEW PUBLICATION",
      category: "Editorial Feature",
      imageUrl: "",
    };
    setData((prev) => ({
      ...prev,
      clients: [...(prev.clients || []), newClient],
    }));
  };

  const handleUpdateClient = (index: number, field: keyof ClientItem, value: string) => {
    setData((prev) => {
      const list = [...(prev.clients || [])];
      list[index] = { ...list[index], [field]: value };
      return { ...prev, clients: list };
    });
  };

  const handleRemoveClient = (index: number) => {
    setData((prev) => ({
      ...prev,
      clients: (prev.clients || []).filter((_, i) => i !== index),
    }));
  };

  const handleSaveAll = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const clientList = (data.clients || []).map((c) => ({
      ...c,
      name: c.name.trim().toUpperCase(),
    }));

    await saveAboutContent({
      ...data,
      clients: clientList,
      selectedClients: clientList.map((c) => c.name),
    });

    setSaving(false);
    onSaved("About page content, portrait & client archives updated successfully!");
    onClose();
  };

  return (
    <div
      data-lenis-prevent="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-fade-in font-admin"
    >
      <form
        onSubmit={handleSaveAll}
        data-lenis-prevent="true"
        className="bg-[#FAF7F2] border border-[#DDD6CA] rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto"
      >
        {/* Header (Sticky / Fixed) */}
        <div className="px-6 sm:px-8 py-5 border-b border-[#DDD6CA] flex items-center justify-between bg-[#F4F0EA] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#1C1917] text-[#FAF7F2] flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#1C1917] tracking-tight">
                Edit About Page
              </h2>
              <p className="text-xs sm:text-sm text-stone-600">
                Update photographer portrait, biography statement, client roster & exhibitions
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-stone-500 hover:text-[#1C1917] hover:bg-[#EAE4D9] rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div
          data-lenis-prevent="true"
          onWheel={(e) => e.stopPropagation()}
          className="flex-1 overflow-y-auto overscroll-contain p-6 sm:p-8 space-y-8"
        >
          {/* Section 1: Photographer Portrait Image */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider font-syne text-[#1C1917]">
                  About Page Portrait Image
                </h3>
                <p className="text-xs text-stone-600">
                  Natural 3:4 portrait photograph displayed on the about page
                </p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleImageFileSelect(file);
                }}
              />

              <button
                type="button"
                disabled={uploading || converting}
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-[#1C1917] hover:bg-[#292524] text-[#FAF7F2] text-xs font-semibold rounded-lg flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
              >
                {converting || uploading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload New Photo</span>
                  </>
                )}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-start bg-[#F4F0EA] p-4 rounded-xl border border-[#DDD6CA]">
              {/* Image Preview */}
              <div className="sm:col-span-4 aspect-[3/4] relative rounded-lg overflow-hidden bg-stone-300 border border-[#DDD6CA] shadow-xs">
                {data.portraitImageUrl ? (
                  <img
                    src={data.portraitImageUrl}
                    alt="About Portrait Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-stone-500">
                    <ImageIcon className="w-8 h-8 stroke-1 mb-2" />
                    <span className="text-xs">No image set</span>
                  </div>
                )}
              </div>

              {/* URL Direct Edit & Info */}
              <div className="sm:col-span-8 space-y-4 text-xs sm:text-sm">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1 font-syne">
                    Or Direct Image URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://your-domain.com/photo.webp"
                    value={data.portraitImageUrl || ""}
                    onChange={(e) => setData({ ...data, portraitImageUrl: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#DDD6CA] focus:border-[#1C1917] rounded-lg text-xs font-mono text-[#1C1917] focus:outline-none transition-colors"
                  />
                  <p className="text-[11px] text-stone-500 mt-1">
                    Upload an image file above, or paste an external image URL here.
                  </p>
                </div>

                {uploadStats && (
                  <div className="flex items-center gap-2 text-xs text-emerald-800 bg-emerald-50 px-3 py-2 rounded-lg border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span>{uploadStats}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1 font-syne">
                    Subtitle / Location Badge (Below Photo)
                  </label>
                  <input
                    type="text"
                    placeholder="AZIZ // LOS ANGELES • NYC • Karachi"
                    value={data.locationBadge || ""}
                    onChange={(e) => setData({ ...data, locationBadge: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#DDD6CA] focus:border-[#1C1917] rounded-lg text-xs font-mono text-[#1C1917] focus:outline-none transition-colors"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Headline & Bio Paragraphs */}
          <div className="space-y-4 pt-4 border-t border-[#DDD6CA]">
            <h3 className="text-sm font-bold uppercase tracking-wider font-syne text-[#1C1917]">
              Biography & Editorial Statement
            </h3>

            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1 font-syne">
                Hero Headline
              </label>
              <textarea
                rows={2}
                value={data.headline || ""}
                onChange={(e) => setData({ ...data, headline: e.target.value })}
                placeholder="Documenting live arena energy, intimate backstage honesty, and editorial portraiture."
                className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#DDD6CA] focus:border-[#1C1917] rounded-lg text-sm text-[#1C1917] focus:outline-none font-serif-elegant italic text-base transition-colors resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1 font-syne">
                  Bio Paragraph 1 (Artist Background)
                </label>
                <textarea
                  rows={5}
                  value={data.bioParagraph1 || ""}
                  onChange={(e) => setData({ ...data, bioParagraph1: e.target.value })}
                  placeholder="Aziz is an editorial, portrait, and live tour photographer..."
                  className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#DDD6CA] focus:border-[#1C1917] rounded-lg text-xs sm:text-sm text-[#1C1917] focus:outline-none leading-relaxed transition-colors resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1 font-syne">
                  Bio Paragraph 2 (Approach & Philosophy)
                </label>
                <textarea
                  rows={5}
                  value={data.bioParagraph2 || ""}
                  onChange={(e) => setData({ ...data, bioParagraph2: e.target.value })}
                  placeholder="Capturing high-profile editorial assignments for WIRED, Marie Claire, Netflix..."
                  className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#DDD6CA] focus:border-[#1C1917] rounded-lg text-xs sm:text-sm text-[#1C1917] focus:outline-none leading-relaxed transition-colors resize-none"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Selected Clients & Hover Preview Images */}
          <div className="space-y-4 pt-4 border-t border-[#DDD6CA]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider font-syne text-[#1C1917]">
                  Selected Clients & Editorial Publications
                </h3>
                <p className="text-xs text-stone-600">
                  Each client appears 2-in-a-row on the About page and reveals their uploaded photograph when hovered
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddClient}
                className="px-3.5 py-1.5 bg-[#1C1917] hover:bg-[#292524] text-[#FAF7F2] text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Client</span>
              </button>
            </div>

            <div className="space-y-3">
              {(data.clients || []).map((client, idx) => (
                <div
                  key={client.id || idx}
                  className="p-4 bg-[#F4F0EA] rounded-xl border border-[#DDD6CA] space-y-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-md bg-[#1C1917] text-[#FAF7F2] font-mono text-xs flex items-center justify-center font-bold">
                        {idx + 1}
                      </span>
                      <span className="font-semibold text-xs sm:text-sm text-[#1C1917] uppercase tracking-wider font-artistic italic">
                        {client.name || "Client Name"}
                      </span>
                    </div>

                    <button
                      type="button"
                      title="Delete Client"
                      onClick={() => handleRemoveClient(idx)}
                      className="p-1.5 text-stone-400 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                    {/* Thumbnail Preview */}
                    <div className="sm:col-span-3 aspect-[3/4] relative rounded-lg overflow-hidden bg-stone-300 border border-[#DDD6CA] shadow-xs">
                      {client.imageUrl ? (
                        <img
                          src={client.imageUrl}
                          alt={client.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-stone-400">
                          <ImageIcon className="w-6 h-6 stroke-1 mb-1" />
                          <span className="text-[10px]">No image</span>
                        </div>
                      )}
                    </div>

                    {/* Inputs: Name, Category, Image URL & Upload button */}
                    <div className="sm:col-span-9 space-y-2.5">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] uppercase font-mono text-stone-600 mb-1 font-semibold">
                            Client / Publication Name *
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="VOGUE"
                            value={client.name}
                            onChange={(e) => handleUpdateClient(idx, "name", e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-[#FAF7F2] border border-[#DDD6CA] rounded-lg text-xs font-bold text-[#1C1917] uppercase tracking-wider focus:outline-none focus:border-[#1C1917]"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] uppercase font-mono text-stone-600 mb-1 font-semibold">
                            Category / Assignment Type
                          </label>
                          <input
                            type="text"
                            placeholder="Fashion Editorial"
                            value={client.category || ""}
                            onChange={(e) => handleUpdateClient(idx, "category", e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-[#FAF7F2] border border-[#DDD6CA] rounded-lg text-xs font-sans text-[#1C1917] focus:outline-none focus:border-[#1C1917]"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] uppercase font-mono text-stone-600 mb-1 font-semibold">
                          Hover Cursor Image (Upload or Direct URL)
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="url"
                            placeholder="https://your-domain.com/client-photo.webp"
                            value={client.imageUrl || ""}
                            onChange={(e) => handleUpdateClient(idx, "imageUrl", e.target.value)}
                            className="flex-1 px-2.5 py-1.5 bg-[#FAF7F2] border border-[#DDD6CA] rounded-lg text-xs font-mono text-[#1C1917] focus:outline-none focus:border-[#1C1917]"
                          />

                          <label className="px-3 py-1.5 bg-[#1C1917] hover:bg-[#292524] text-[#FAF7F2] text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shrink-0">
                            {clientUploadingIndex === idx ? (
                              <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                <span>WebP...</span>
                              </>
                            ) : (
                              <>
                                <Upload className="w-3.5 h-3.5" />
                                <span>Upload</span>
                              </>
                            )}
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              disabled={clientUploadingIndex !== null}
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleClientImageSelect(idx, file);
                              }}
                            />
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions (Sticky / Fixed at Bottom) */}
        <div className="px-6 sm:px-8 py-4 border-t border-[#DDD6CA] bg-[#F4F0EA] shrink-0 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 text-stone-700 hover:bg-[#EAE4D9] rounded-lg text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={saving || uploading}
            className="px-6 py-2.5 bg-[#1C1917] hover:bg-[#292524] text-[#FAF7F2] text-xs sm:text-sm font-semibold rounded-lg flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-50 shadow-sm"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving Updates...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Save About Page</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
