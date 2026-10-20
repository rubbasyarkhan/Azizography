"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth, AuthProvider } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ExternalLink,
  ArrowRight,
} from "lucide-react";

function AdminGuideContent() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<
    "overview" | "uploading" | "reordering" | "iris" | "trail" | "metadata" | "howto"
  >("overview");

  // Auth Guard
  React.useEffect(() => {
    if (!loading && !user) {
      router.push("/admin");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-[#F4F0EA] text-[#1C1917] flex items-center justify-center font-admin text-sm">
        <span className="text-stone-500 font-mono tracking-widest uppercase">LOADING STUDIO MANUAL...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F0EA] text-[#1C1917] flex flex-col font-admin select-none">
      {/* Studio Navigation Bar */}
      <header className="sticky top-0 z-40 bg-[#F4F0EA]/95 backdrop-blur-md border-b border-[#DDD6CA] px-6 sm:px-10 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/dashboard"
            className="flex items-center gap-2 text-stone-600 hover:text-[#1C1917] text-sm font-semibold transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </Link>
          <div className="h-4 w-px bg-[#DDD6CA] hidden sm:block" />
          <h1 className="text-xs font-mono uppercase tracking-widest text-stone-500 hidden sm:block">
            Studio Reference Manual
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/dashboard"
            className="px-4 py-2 bg-[#1C1917] hover:bg-[#292524] text-[#FAF7F2] text-sm font-semibold rounded-lg transition-colors shadow-sm"
          >
            Dashboard
          </Link>
          <Link
            href="/"
            className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold text-stone-600 hover:text-[#1C1917] hover:bg-[#EAE4D9]/80 rounded-lg transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            <span className="hidden sm:inline">Live Portfolio</span>
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-6 sm:p-8 md:p-10 space-y-8">
        {/* Header Hero */}
        <div className="bg-[#FAF7F2] border border-[#DDD6CA] rounded-2xl p-8 sm:p-10 space-y-3 shadow-xs">
          <span className="text-xs font-mono uppercase tracking-[0.2em] text-stone-500 block">
            OPERATING MANUAL
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#1C1917] tracking-tight">
            Curator Studio Architecture & Workflow
          </h2>
          <p className="text-base text-stone-600 max-w-3xl leading-relaxed">
            A comprehensive reference on image ingestion, automatic WebP compression, drag-and-drop exhibition sequencing, the camera aperture intro animation, and curatorial metadata.
          </p>
        </div>

        {/* Minimal Monochrome Tabs */}
        <div className="flex flex-wrap items-center gap-2 p-1.5 bg-[#FAF7F2] border border-[#DDD6CA] rounded-xl text-sm font-medium shadow-xs">
          <button
            type="button"
            onClick={() => setActiveTab("overview")}
            className={`px-4 py-2 rounded-lg transition-colors cursor-pointer ${
              activeTab === "overview"
                ? "bg-[#1C1917] text-[#FAF7F2] font-semibold shadow-xs"
                : "text-stone-600 hover:text-[#1C1917] hover:bg-[#EAE4D9]"
            }`}
          >
            1. Navigation
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("uploading")}
            className={`px-4 py-2 rounded-lg transition-colors cursor-pointer ${
              activeTab === "uploading"
                ? "bg-[#1C1917] text-[#FAF7F2] font-semibold shadow-xs"
                : "text-stone-600 hover:text-[#1C1917] hover:bg-[#EAE4D9]"
            }`}
          >
            2. Ingestion & WebP
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("reordering")}
            className={`px-4 py-2 rounded-lg transition-colors cursor-pointer ${
              activeTab === "reordering"
                ? "bg-[#1C1917] text-[#FAF7F2] font-semibold shadow-xs"
                : "text-stone-600 hover:text-[#1C1917] hover:bg-[#EAE4D9]"
            }`}
          >
            3. Sequencing Board
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("iris")}
            className={`px-4 py-2 rounded-lg transition-colors cursor-pointer ${
              activeTab === "iris"
                ? "bg-[#1C1917] text-[#FAF7F2] font-semibold shadow-xs"
                : "text-stone-600 hover:text-[#1C1917] hover:bg-[#EAE4D9]"
            }`}
          >
            4. Iris Aperture
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("trail")}
            className={`px-4 py-2 rounded-lg transition-colors cursor-pointer ${
              activeTab === "trail"
                ? "bg-[#1C1917] text-[#FAF7F2] font-semibold shadow-xs"
                : "text-stone-600 hover:text-[#1C1917] hover:bg-[#EAE4D9]"
            }`}
          >
            5. Footer Mouse Trail
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("metadata")}
            className={`px-4 py-2 rounded-lg transition-colors cursor-pointer ${
              activeTab === "metadata"
                ? "bg-[#1C1917] text-[#FAF7F2] font-semibold shadow-xs"
                : "text-stone-600 hover:text-[#1C1917] hover:bg-[#EAE4D9]"
            }`}
          >
            6. Metadata & EXIF
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("howto")}
            className={`px-4 py-2 rounded-lg transition-colors cursor-pointer ${
              activeTab === "howto"
                ? "bg-[#1C1917] text-[#FAF7F2] font-semibold shadow-xs"
                : "text-stone-600 hover:text-[#1C1917] hover:bg-[#EAE4D9]"
            }`}
          >
            7. How-To Guides
          </button>
        </div>

        {/* Tab 1: Overview */}
        {activeTab === "overview" && (
          <div className="bg-[#FAF7F2] border border-[#DDD6CA] rounded-2xl p-8 sm:p-10 space-y-6 shadow-xs">
            <div>
              <h3 className="text-2xl font-bold text-[#1C1917] tracking-tight">
                The 3 Core Surfaces
              </h3>
              <p className="text-base text-stone-600 mt-1">
                Manage and curate your archive seamlessly from the dashboard or directly on the live website.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="p-6 bg-[#F4F0EA] border border-[#DDD6CA] rounded-xl space-y-3">
                <span className="text-xs text-stone-500 font-mono tracking-wider font-semibold block">01 / DASHBOARD</span>
                <h4 className="text-base sm:text-lg font-bold text-[#1C1917]">Central Studio (/admin/dashboard)</h4>
                <p className="text-sm sm:text-base text-stone-600 leading-relaxed">
                  Sequence the portfolio archive, reorder cards in Grid/Kanban/Table mode, upload assets, and curate the Iris intro.
                </p>
              </div>

              <div className="p-6 bg-[#F4F0EA] border border-[#DDD6CA] rounded-xl space-y-3">
                <span className="text-xs text-stone-500 font-mono tracking-wider font-semibold block">02 / LIVE SITE</span>
                <h4 className="text-base sm:text-lg font-bold text-[#1C1917]">In-Situ Live Overlay (/)</h4>
                <p className="text-sm sm:text-base text-stone-600 leading-relaxed">
                  When logged in, an administrative control bar appears atop the public site. Drag cards directly on the live portfolio to see the final visitor experience.
                </p>
              </div>

              <div className="p-6 bg-[#F4F0EA] border border-[#DDD6CA] rounded-xl space-y-3">
                <span className="text-xs text-stone-500 font-mono tracking-wider font-semibold block">03 / DRAWERS</span>
                <h4 className="text-base sm:text-lg font-bold text-[#1C1917]">Non-Destructive Overlays</h4>
                <p className="text-sm sm:text-base text-stone-600 leading-relaxed">
                  Drawers for editing metadata, updating series, setting camera EXIF values, and managing intro portraits without leaving your view.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Uploading */}
        {activeTab === "uploading" && (
          <div className="bg-[#FAF7F2] border border-[#DDD6CA] rounded-2xl p-8 sm:p-10 space-y-6 shadow-xs">
            <div>
              <h3 className="text-2xl font-bold text-[#1C1917] tracking-tight">
                Client-Side WebP Compression
              </h3>
              <p className="text-base text-stone-600 mt-1">
                Upload raw high-res camera exports. The browser compresses each file before saving.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="p-6 bg-[#F4F0EA] border border-[#DDD6CA] rounded-xl space-y-2.5">
                <span className="text-xs text-stone-500 font-mono tracking-wider font-semibold block">01 / DROP</span>
                <h4 className="text-base sm:text-lg font-bold text-[#1C1917]">Select Image</h4>
                <p className="text-sm sm:text-base text-stone-600 leading-relaxed">
                  Drop any JPEG, PNG, TIFF, or HEIC export into the dropzone.
                </p>
              </div>

              <div className="p-6 bg-[#F4F0EA] border border-[#DDD6CA] rounded-xl space-y-2.5">
                <span className="text-xs text-stone-500 font-mono tracking-wider font-semibold block">02 / OPTIMIZE</span>
                <h4 className="text-base sm:text-lg font-bold text-[#1C1917]">WebP Conversion</h4>
                <p className="text-sm sm:text-base text-stone-600 leading-relaxed">
                  Resizes to max 1920px at 82% quality, shrinking files 60–85% with zero visible sharpness loss.
                </p>
              </div>

              <div className="p-6 bg-[#F4F0EA] border border-[#DDD6CA] rounded-xl space-y-2.5">
                <span className="text-xs text-stone-500 font-mono tracking-wider font-semibold block">03 / PUBLISH</span>
                <h4 className="text-base sm:text-lg font-bold text-[#1C1917]">Instant Sync</h4>
                <p className="text-sm sm:text-base text-stone-600 leading-relaxed">
                  Set Title, Category, and Project name. Click publish to deploy live to your archive.
                </p>
              </div>
            </div>

            <div className="p-6 bg-[#F4F0EA] border border-[#DDD6CA] rounded-xl text-stone-800 space-y-2">
              <span className="font-bold text-base text-[#1C1917] block">Aspect Ratio Reservation (CLS Prevention)</span>
              <p className="text-sm sm:text-base text-stone-600 leading-relaxed">
                The uploader automatically detects true natural image ratios (Portrait 3:4, Landscape 16:9, Square 1:1, Tall 9:16) and reserves exact grid space, preventing any Cumulative Layout Shift (CLS) when visitors scroll.
              </p>
            </div>
          </div>
        )}

        {/* Tab 3: Reordering */}
        {activeTab === "reordering" && (
          <div className="bg-[#FAF7F2] border border-[#DDD6CA] rounded-2xl p-8 sm:p-10 space-y-6 shadow-xs">
            <div>
              <h3 className="text-2xl font-bold text-[#1C1917] tracking-tight">
                Sequencing Board (DndBoard)
              </h3>
              <p className="text-base text-stone-600 mt-1">
                Rearrange how visitors see your portfolio archive across 3 view modes.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="p-6 bg-[#F4F0EA] border border-[#DDD6CA] rounded-xl space-y-2.5">
                <span className="text-xs text-stone-500 font-mono tracking-wider font-semibold block">GRID VIEW</span>
                <h4 className="text-base sm:text-lg font-bold text-[#1C1917]">Visual Sequencing</h4>
                <p className="text-sm sm:text-base text-stone-600 leading-relaxed">
                  Natural aspect ratio cards showing exact `#1, #2, #3` order. Grab the handle icon in the top-left to drag to any position.
                </p>
              </div>

              <div className="p-6 bg-[#F4F0EA] border border-[#DDD6CA] rounded-xl space-y-2.5">
                <span className="text-xs text-stone-500 font-mono tracking-wider font-semibold block">BOARD VIEW</span>
                <h4 className="text-base sm:text-lg font-bold text-[#1C1917]">Kanban by Category</h4>
                <p className="text-sm sm:text-base text-stone-600 leading-relaxed">
                  Separates works into 5 columns (People, Concerts, Singers, Weddings, Events) to review balance across genres.
                </p>
              </div>

              <div className="p-6 bg-[#F4F0EA] border border-[#DDD6CA] rounded-xl space-y-2.5">
                <span className="text-xs text-stone-500 font-mono tracking-wider font-semibold block">TABLE VIEW</span>
                <h4 className="text-base sm:text-lg font-bold text-[#1C1917]">Spreadsheet Mode</h4>
                <p className="text-sm sm:text-base text-stone-600 leading-relaxed">
                  High-density table showing index, thumbnail, series, category, and direct action icons.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Iris */}
        {activeTab === "iris" && (
          <div className="bg-[#FAF7F2] border border-[#DDD6CA] rounded-2xl p-8 sm:p-10 space-y-6 shadow-xs">
            <div>
              <h3 className="text-2xl font-bold text-[#1C1917] tracking-tight">
                Camera Iris Motion Engine
              </h3>
              <p className="text-base text-stone-600 mt-1">
                The 24-blade camera diaphragm intro animation that greets new visitors.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="p-6 bg-[#F4F0EA] border border-[#DDD6CA] rounded-xl space-y-2.5">
                <span className="font-bold text-base text-[#1C1917] block">How it works</span>
                <p className="text-sm sm:text-base text-stone-600 leading-relaxed">
                  On first visit, selected portraits revolve tangentially like physical aperture blades before dissolving into the gallery. Visitors can press <kbd className="px-2 py-1 bg-[#FAF7F2] border border-[#DDD6CA] rounded text-[#1C1917] font-mono text-xs shadow-xs">ESC</kbd> to enter immediately.
                </p>
              </div>

              <div className="p-6 bg-[#F4F0EA] border border-[#DDD6CA] rounded-xl space-y-2.5">
                <span className="font-bold text-base text-[#1C1917] block">Managing Iris portraits</span>
                <p className="text-sm sm:text-base text-stone-600 leading-relaxed">
                  Click <strong>&quot;Iris Ring&quot;</strong> in the dashboard. Click any photo to toggle it in or out of the ring, or click <strong>&quot;Preview&quot;</strong> to watch the live sequence.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: Footer Mouse Trail */}
        {activeTab === "trail" && (
          <div className="bg-[#FAF7F2] border border-[#DDD6CA] rounded-2xl p-8 sm:p-10 space-y-6 shadow-xs">
            <div>
              <h3 className="text-2xl font-bold text-[#1C1917] tracking-tight">
                Interactive Footer Mouse Trail (React Bits)
              </h3>
              <p className="text-base text-stone-600 mt-1">
                Curate which photographs appear in the fluid mouse cursor trail at the bottom of the portfolio.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="p-6 bg-[#F4F0EA] border border-[#DDD6CA] rounded-xl space-y-2.5">
                <span className="text-xs text-stone-500 font-mono tracking-wider font-semibold block">01 / BEHIND TEXT LAYER</span>
                <h4 className="text-base sm:text-lg font-bold text-[#1C1917]">Zero Obscuration</h4>
                <p className="text-sm sm:text-base text-stone-600 leading-relaxed">
                  The GSAP image trail is isolated strictly at z-index 0 underneath all editorial copy, studio specs, links, and the Instagram CTA. Words and buttons always stay crisp and clickable.
                </p>
              </div>

              <div className="p-6 bg-[#F4F0EA] border border-[#DDD6CA] rounded-xl space-y-2.5">
                <span className="text-xs text-stone-500 font-mono tracking-wider font-semibold block">02 / CURATION</span>
                <h4 className="text-base sm:text-lg font-bold text-[#1C1917]">Admin Toggles</h4>
                <p className="text-sm sm:text-base text-stone-600 leading-relaxed">
                  Toggle any photo into the trail via the cursor icon on cards, the checkbox in the Edit dialog, or when publishing new works. Filter directly with the &quot;Footer Trail&quot; pill.
                </p>
              </div>

              <div className="p-6 bg-[#F4F0EA] border border-[#DDD6CA] rounded-xl space-y-2.5">
                <span className="text-xs text-stone-500 font-mono tracking-wider font-semibold block">03 / SMART FALLBACK</span>
                <h4 className="text-base sm:text-lg font-bold text-[#1C1917]">Always Beautiful</h4>
                <p className="text-sm sm:text-base text-stone-600 leading-relaxed">
                  If you haven&apos;t designated specific photographs for the trail, the engine automatically sequences through your visible archive so the footer is never empty.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: Metadata */}
        {activeTab === "metadata" && (
          <div className="bg-[#FAF7F2] border border-[#DDD6CA] rounded-2xl p-8 sm:p-10 space-y-6 shadow-xs">
            <div>
              <h3 className="text-2xl font-bold text-[#1C1917] tracking-tight">
                Curatorial Series & EXIF Specs
              </h3>
              <p className="text-base text-stone-600 mt-1">
                How project titles populate the Jessica Chou-style public sidebar.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="p-6 bg-[#F4F0EA] border border-[#DDD6CA] rounded-xl space-y-2.5">
                <span className="font-bold text-base text-[#1C1917] block">Dynamic Sidebar Series</span>
                <p className="text-sm sm:text-base text-stone-600 leading-relaxed">
                  Whenever you set a <strong>Series / Project / Story</strong> (e.g. <em>Jessica Chastain for Marie Claire</em>), that title automatically generates a dedicated filter link in the public sidebar.
                </p>
              </div>

              <div className="p-6 bg-[#F4F0EA] border border-[#DDD6CA] rounded-xl space-y-2.5">
                <span className="font-bold text-base text-[#1C1917] block">Camera EXIF Data</span>
                <p className="text-sm sm:text-base text-stone-600 leading-relaxed">
                  Input technical specs (Camera Body, Lens, ISO, Aperture, Shutter). These details appear elegantly in client lightbox inspection views.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 6: How-To Guides */}
        {activeTab === "howto" && (
          <div className="bg-[#FAF7F2] border border-[#DDD6CA] rounded-2xl p-8 sm:p-10 space-y-5 shadow-xs">
            <div>
              <h3 className="text-2xl font-bold text-[#1C1917] tracking-tight">
                Quick How-To Cheatsheet
              </h3>
              <p className="text-base text-stone-600 mt-1">
                Straightforward instructions for everyday curatorial tasks.
              </p>
            </div>

            <div className="space-y-4">
              <div className="p-5 bg-[#F4F0EA] border border-[#DDD6CA] rounded-xl space-y-1.5">
                <span className="font-bold text-sm sm:text-base text-[#1C1917] block">How to publish a new photo:</span>
                <p className="text-sm sm:text-base text-stone-600 leading-relaxed">
                  Click &quot;Add Photograph&quot; → drop image file → enter title & category → click &quot;Publish Photograph&quot;.
                </p>
              </div>

              <div className="p-5 bg-[#F4F0EA] border border-[#DDD6CA] rounded-xl space-y-1.5">
                <span className="font-bold text-sm sm:text-base text-[#1C1917] block">How to change the lead `#1` photo on the homepage:</span>
                <p className="text-sm sm:text-base text-stone-600 leading-relaxed">
                  On the dashboard Grid view, click and hold the grip icon on your desired photo, drag it to the `#1` slot, and release.
                </p>
              </div>

              <div className="p-5 bg-[#F4F0EA] border border-[#DDD6CA] rounded-xl space-y-1.5">
                <span className="font-bold text-sm sm:text-base text-[#1C1917] block">How to create a new project in the public sidebar:</span>
                <p className="text-sm sm:text-base text-stone-600 leading-relaxed">
                  Edit any photo → enter the project name in &quot;Series / Project / Story&quot; (e.g. <em>Coachella Midnight</em>) → save. It instantly appears in the public sidebar.
                </p>
              </div>

              <div className="p-5 bg-[#F4F0EA] border border-[#DDD6CA] rounded-xl space-y-1.5">
                <span className="font-bold text-sm sm:text-base text-[#1C1917] block">How to temporarily hide a photo from clients:</span>
                <p className="text-sm sm:text-base text-stone-600 leading-relaxed">
                  Click the Eye icon on any card to toggle between Visible and Hidden without deleting the asset.
                </p>
              </div>

              <div className="p-5 bg-[#F4F0EA] border border-[#DDD6CA] rounded-xl space-y-1.5">
                <span className="font-bold text-sm sm:text-base text-[#1C1917] block">How to add or remove photos from the footer mouse trail:</span>
                <p className="text-sm sm:text-base text-stone-600 leading-relaxed">
                  Click the cursor icon on any card in the dashboard or check &quot;Footer Trail&quot; inside the Edit dialog. You can also filter exclusively by &quot;Footer Trail&quot; using the toolbar pill.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Back to Studio Bottom Bar */}
        <div className="flex items-center justify-between p-6 bg-[#FAF7F2] border border-[#DDD6CA] rounded-2xl shadow-xs">
          <span className="text-sm sm:text-base text-stone-600 font-medium">Azizography Curator Studio Manual</span>
          <Link
            href="/admin/dashboard"
            className="px-5 py-2.5 bg-[#1C1917] hover:bg-[#292524] text-[#FAF7F2] text-sm sm:text-base font-semibold rounded-lg transition-colors shadow-sm inline-flex items-center gap-2"
          >
            <span>Back to Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </main>
    </div>
  );
}

export default function AdminGuidePage() {
  return (
    <AuthProvider>
      <AdminGuideContent />
    </AuthProvider>
  );
}
