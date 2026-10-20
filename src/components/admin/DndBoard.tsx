"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GalleryItem, GalleryCategory } from "@/types/gallery";
import {
  itemMatchesFilter,
  itemMatchesSearch,
  getCategoryDisplayLabel,
  normalizeCategory,
} from "@/lib/filter-utils";
import {
  GripVertical,
  Eye,
  EyeOff,
  Star,
  Trash2,
  Edit2,
  Columns,
  Grid,
  List,
  Sparkles,
  Search,
  Upload,
  MousePointer,
  ArrowUpRight,
} from "lucide-react";
import InstagramIcon from "@/components/icons/InstagramIcon";

interface DndBoardProps {
  items: GalleryItem[];
  onReorder: (newItems: GalleryItem[]) => void;
  onToggleVisibility: (id: string, isVisible: boolean) => void;
  onToggleFeatured: (id: string, isFeatured: boolean) => void;
  onToggleIris?: (id: string, isIrisItem: boolean) => void;
  onToggleFooterTrail?: (id: string, isFooterTrailItem: boolean) => void;
  onDeleteItem: (id: string) => void;
  onEditItem: (item: GalleryItem) => void;
  onOpenUploader?: () => void;
}

// Single Sortable Card Component (Memoized)
const SortableCard = React.memo(function SortableCard({
  item,
  onToggleVisibility,
  onToggleFeatured,
  onToggleIris,
  onToggleFooterTrail,
  onDeleteItem,
  onEditItem,
}: {
  item: GalleryItem;
  onToggleVisibility: (id: string, isVisible: boolean) => void;
  onToggleFeatured: (id: string, isFeatured: boolean) => void;
  onToggleIris?: (id: string, isIrisItem: boolean) => void;
  onToggleFooterTrail?: (id: string, isFooterTrailItem: boolean) => void;
  onDeleteItem: (id: string) => void;
  onEditItem: (item: GalleryItem) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative bg-[#FAF7F2] border transition-all select-none overflow-hidden rounded-xl shadow-xs hover:shadow-md font-admin ${
        isDragging
          ? "border-[#1C1917] opacity-40 shadow-2xl scale-[0.98] z-30"
          : item.isVisible
          ? "border-[#DDD6CA] hover:border-stone-400"
          : "border-[#DDD6CA] opacity-60 bg-[#EDE8DF]"
      }`}
    >
      {/* Visual Image Presentation Area (Natural Portrait Aspect) */}
      <div className="relative aspect-[3/4] w-full bg-[#EDE8DF] overflow-hidden">
        <Image
          src={item.imageUrl}
          alt={item.title}
          fill
          sizes="(max-width: 768px) 100vw, 300px"
          className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
        />

        {/* Ambient Vignette for Badge Legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none" />

        {/* Top Floating Badges */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between z-10">
          <div className="flex items-center gap-1.5">
            {/* Drag Handle */}
            <button
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing p-1.5 bg-[#FAF7F2]/95 hover:bg-[#1C1917] hover:text-[#FAF7F2] text-stone-800 rounded-md backdrop-blur-sm transition-colors border border-[#DDD6CA] shadow-xs"
              title="Drag to reorder on public site"
            >
              <GripVertical className="w-4 h-4" />
            </button>
            <span className="px-2 py-0.5 bg-[#FAF7F2]/95 text-stone-800 font-mono text-xs font-semibold rounded-md backdrop-blur-sm border border-[#DDD6CA] shadow-xs">
              #{item.orderIndex + 1}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="px-2.5 py-0.5 bg-[#FAF7F2]/95 border border-[#DDD6CA] text-xs font-mono uppercase font-semibold text-stone-800 rounded-md backdrop-blur-sm shadow-xs">
              {item.category}
            </span>

            {item.isFeatured && (
              <span
                className="p-1.5 bg-[#FAF7F2]/95 border border-[#DDD6CA] text-[#1C1917] rounded-md backdrop-blur-sm shadow-xs"
                title="Featured on Portfolio"
              >
                <Star className="w-3.5 h-3.5 fill-current" />
              </span>
            )}

            {item.isIrisItem && (
              <span
                className="p-1.5 bg-[#FAF7F2]/95 border border-[#DDD6CA] text-[#1C1917] rounded-md backdrop-blur-sm shadow-xs"
                title="Active in Iris opening animation"
              >
                <Sparkles className="w-3.5 h-3.5" />
              </span>
            )}

            {item.isFooterTrailItem && (
              <span
                className="p-1.5 bg-[#FAF7F2]/95 border border-[#DDD6CA] text-[#1C1917] rounded-md backdrop-blur-sm shadow-xs"
                title="Active in Footer Mouse Trail"
              >
                <MousePointer className="w-3.5 h-3.5" />
              </span>
            )}
          </div>
        </div>

        {/* Floating Quick Action Overlay (Bottom-Right) */}
        <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1.5 z-10 opacity-90 group-hover:opacity-100 transition-opacity">
          {/* Toggle Visibility */}
          <button
            type="button"
            onClick={() => onToggleVisibility(item.id, !item.isVisible)}
            title={item.isVisible ? "Visible (Click to hide)" : "Hidden (Click to publish)"}
            className={`p-2 rounded-lg backdrop-blur-sm border transition-colors cursor-pointer shadow-xs ${
              item.isVisible
                ? "bg-[#FAF7F2]/95 border-[#DDD6CA] text-stone-800 hover:bg-[#1C1917] hover:text-[#FAF7F2]"
                : "bg-red-50 border-red-200 text-red-600 hover:bg-red-600 hover:text-white"
            }`}
          >
            {item.isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>

          {/* Toggle Iris */}
          {onToggleIris && (
            <button
              type="button"
              onClick={() => onToggleIris(item.id, !item.isIrisItem)}
              title={item.isIrisItem ? "Remove from Iris intro ring" : "Add to Iris intro ring"}
              className={`p-2 rounded-lg backdrop-blur-sm border transition-colors cursor-pointer shadow-xs ${
                item.isIrisItem
                  ? "bg-[#1C1917] text-[#FAF7F2] border-[#1C1917]"
                  : "bg-[#FAF7F2]/95 border-[#DDD6CA] text-stone-800 hover:bg-[#1C1917] hover:text-[#FAF7F2]"
              }`}
            >
              <Sparkles className="w-4 h-4" />
            </button>
          )}

          {/* Toggle Footer Trail */}
          {onToggleFooterTrail && (
            <button
              type="button"
              onClick={() => onToggleFooterTrail(item.id, !item.isFooterTrailItem)}
              title={item.isFooterTrailItem ? "Remove from footer mouse trail" : "Add to footer mouse trail"}
              className={`p-2 rounded-lg backdrop-blur-sm border transition-colors cursor-pointer shadow-xs ${
                item.isFooterTrailItem
                  ? "bg-[#1C1917] text-[#FAF7F2] border-[#1C1917]"
                  : "bg-[#FAF7F2]/95 border-[#DDD6CA] text-stone-800 hover:bg-[#1C1917] hover:text-[#FAF7F2]"
              }`}
            >
              <MousePointer className="w-4 h-4" />
            </button>
          )}

          {/* Edit Details */}
          <button
            type="button"
            onClick={() => onEditItem(item)}
            title="Edit photo details"
            className="p-2 bg-[#FAF7F2]/95 border border-[#DDD6CA] text-stone-800 hover:bg-[#1C1917] hover:text-[#FAF7F2] rounded-lg backdrop-blur-sm transition-colors cursor-pointer shadow-xs"
          >
            <Edit2 className="w-4 h-4" />
          </button>

          {/* Delete */}
          <button
            type="button"
            onClick={() => onDeleteItem(item.id)}
            title="Delete permanently"
            className="p-2 bg-[#FAF7F2]/95 border border-[#DDD6CA] text-stone-600 hover:text-red-700 hover:bg-red-50 rounded-lg backdrop-blur-sm transition-colors cursor-pointer shadow-xs"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Bottom Content Metadata with Big Fonts */}
      <div className="p-4 bg-[#FAF7F2] border-t border-[#DDD6CA]/60">
        <h4 className="text-sm sm:text-base font-bold text-[#1C1917] truncate">
          {item.title}
        </h4>
        <p className="text-xs sm:text-sm text-stone-600 font-medium truncate mt-0.5">
          {item.seriesOrProject || item.artist || "Independent Artwork"}
        </p>

        {item.instagramUrl && (
          <div className="mt-1.5 flex items-center gap-1 text-[11px] font-sans font-medium text-pink-700">
            <InstagramIcon className="w-3 h-3 text-pink-600 shrink-0" />
            <a
              href={item.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="hover:underline flex items-center gap-0.5"
            >
              <span>Instagram post</span>
              <ArrowUpRight className="w-3 h-3" />
            </a>
          </div>
        )}

        <div className="flex items-center justify-between text-xs text-stone-500 font-mono mt-3 pt-2.5 border-t border-[#DDD6CA]/60">
          <span className="truncate max-w-[130px]">
            {item.location || item.year || "Archive"}
          </span>
          {item.exif?.camera && (
            <span className="truncate max-w-[120px] text-stone-700 font-semibold">
              {item.exif.camera.replace("Sony ", "").replace("Leica ", "")}
            </span>
          )}
        </div>
      </div>
    </div>
  );
});

function DndBoard({
  items,
  onReorder,
  onToggleVisibility,
  onToggleFeatured,
  onToggleIris,
  onToggleFooterTrail,
  onDeleteItem,
  onEditItem,
  onOpenUploader,
}: DndBoardProps) {
  const [viewMode, setViewMode] = useState<"grid" | "kanban" | "table">("grid");
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");

  const categories: GalleryCategory[] = ["people", "concerts", "singers", "weddings", "events"];

  // Dynamic filter buttons representing categories, series, and tags present in the archive
  const dynamicFilters = useMemo(() => {
    const list: { key: string; label: string; count: number }[] = [];
    const seen = new Set<string>();

    // 1. Standard categories
    for (const cat of categories) {
      const count = items.filter((i) => normalizeCategory(i.category) === cat).length;
      if (count > 0 || items.length === 0) {
        const label = getCategoryDisplayLabel(cat);
        seen.add(cat.toLowerCase());
        seen.add(label.toLowerCase());
        list.push({ key: cat, label, count });
      }
    }

    // 2. Custom series/projects
    for (const item of items) {
      if (item.seriesOrProject && item.seriesOrProject.trim()) {
        const val = item.seriesOrProject.trim();
        const key = val.toLowerCase();
        if (!seen.has(key)) {
          seen.add(key);
          const count = items.filter((i) => itemMatchesFilter(i, val)).length;
          list.push({ key: val, label: val, count });
        }
      }
    }

    // 3. Distinct tags (e.g. "testing", "tesying description")
    for (const item of items) {
      if (item.tags && Array.isArray(item.tags)) {
        for (const tag of item.tags) {
          const val = tag.trim();
          const key = val.toLowerCase();
          if (!seen.has(key) && !seen.has(normalizeCategory(key))) {
            seen.add(key);
            const count = items.filter((i) => itemMatchesFilter(i, val)).length;
            list.push({ key: val, label: `#${val}`, count });
          }
        }
      }
    }

    return list;
  }, [items, categories]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Category, series, or tag filter
      if (!itemMatchesFilter(item, filterCategory)) {
        return false;
      }

      // Text search query
      if (searchQuery.trim() && !itemMatchesSearch(item, searchQuery)) {
        return false;
      }

      return true;
    });
  }, [items, filterCategory, searchQuery]);

  const filteredItemIds = useMemo(() => filteredItems.map((i) => i.id), [filteredItems]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveDragId(String(event.active.id));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDragId(null);

    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((i) => i.id === active.id);
      const newIndex = items.findIndex((i) => i.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        const reordered = arrayMove(items, oldIndex, newIndex);
        onReorder(reordered);
      }
    }
  };

  const activeItem = activeDragId ? items.find((i) => i.id === activeDragId) : null;

  // Empty State when zero items in the entire archive
  if (items.length === 0) {
    return (
      <div className="w-full py-24 px-6 border border-[#DDD6CA] bg-[#FAF7F2] rounded-xl flex flex-col items-center justify-center text-center select-none font-admin shadow-sm">
        <div className="max-w-md space-y-4">
          <div className="w-14 h-14 rounded-full bg-[#EDE8DF] border border-[#DDD6CA] flex items-center justify-center mx-auto text-[#1C1917]">
            <Upload className="w-6 h-6" />
          </div>

          <div>
            <h2 className="text-2xl font-bold text-[#1C1917]">
              Archive is Empty
            </h2>
            <p className="text-base text-[#57534E] mt-1.5 leading-relaxed">
              Upload photographs to sequence the public portfolio and curate the intro animation.
            </p>
          </div>

          <div className="pt-2">
            {onOpenUploader && (
              <button
                type="button"
                onClick={onOpenUploader}
                className="px-6 py-3.5 bg-[#1C1917] hover:bg-[#292524] text-[#FAF7F2] text-base font-semibold rounded-lg transition-colors cursor-pointer inline-flex items-center gap-2 shadow-sm"
              >
                <Upload className="w-4 h-4" />
                <span>Upload First Photograph</span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-admin">
      {/* Search & Category Filter Toolbar with Big Fonts */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 bg-[#FAF7F2] border border-[#DDD6CA] rounded-xl shadow-xs">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search title, series, artist, or tags..."
            className="w-full bg-[#F4F0EA] border border-[#DDD6CA] pl-10 pr-4 py-2.5 text-[#1C1917] placeholder:text-stone-400 focus:outline-none focus:border-[#1C1917] text-sm rounded-lg transition-colors font-medium shadow-xs"
          />
        </div>

        {/* Filter Pills with Big Fonts */}
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <button
            type="button"
            onClick={() => setFilterCategory("all")}
            className={`px-3.5 py-2 rounded-lg transition-colors cursor-pointer font-semibold ${
              filterCategory === "all"
                ? "bg-[#1C1917] text-[#FAF7F2] shadow-sm"
                : "bg-[#FAF7F2] text-stone-700 hover:text-[#1C1917] hover:bg-[#EAE4D9] border border-[#DDD6CA]"
            }`}
          >
            All ({items.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterCategory("iris")}
            className={`px-3.5 py-2 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 font-semibold ${
              filterCategory === "iris"
                ? "bg-[#1C1917] text-[#FAF7F2] shadow-sm"
                : "bg-[#FAF7F2] text-stone-700 hover:text-[#1C1917] hover:bg-[#EAE4D9] border border-[#DDD6CA]"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Iris Ring ({items.filter((i) => i.isIrisItem).length})</span>
          </button>
          <button
            type="button"
            onClick={() => setFilterCategory("trail")}
            className={`px-3.5 py-2 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 font-semibold ${
              filterCategory === "trail"
                ? "bg-[#1C1917] text-[#FAF7F2] shadow-sm"
                : "bg-[#FAF7F2] text-stone-700 hover:text-[#1C1917] hover:bg-[#EAE4D9] border border-[#DDD6CA]"
            }`}
          >
            <MousePointer className="w-3.5 h-3.5" />
            <span>Footer Trail ({items.filter((i) => i.isFooterTrailItem).length})</span>
          </button>
          {dynamicFilters.map((df) => (
            <button
              key={df.key}
              type="button"
              onClick={() => setFilterCategory(df.key)}
              className={`px-3.5 py-2 rounded-lg transition-colors cursor-pointer font-semibold ${
                filterCategory === df.key ||
                normalizeCategory(filterCategory) === normalizeCategory(df.key)
                  ? "bg-[#1C1917] text-[#FAF7F2] shadow-sm"
                  : "bg-[#FAF7F2] text-stone-700 hover:text-[#1C1917] hover:bg-[#EAE4D9] border border-[#DDD6CA]"
              }`}
            >
              {df.label} ({df.count})
            </button>
          ))}
        </div>

        {/* View Mode Toggle with Big Fonts */}
        <div className="flex items-center gap-1 shrink-0 bg-[#F4F0EA] p-1 border border-[#DDD6CA] rounded-lg">
          <button
            type="button"
            onClick={() => setViewMode("grid")}
            title="Grid View"
            className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold rounded-md transition-colors cursor-pointer ${
              viewMode === "grid"
                ? "bg-[#1C1917] text-[#FAF7F2] shadow-sm"
                : "text-stone-600 hover:text-[#1C1917]"
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
            <span>Grid</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode("kanban")}
            title="Columns View"
            className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold rounded-md transition-colors cursor-pointer ${
              viewMode === "kanban"
                ? "bg-[#1C1917] text-[#FAF7F2] shadow-sm"
                : "text-stone-600 hover:text-[#1C1917]"
            }`}
          >
            <Columns className="w-3.5 h-3.5" />
            <span>Board</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode("table")}
            title="Table List View"
            className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold rounded-md transition-colors cursor-pointer ${
              viewMode === "table"
                ? "bg-[#1C1917] text-[#FAF7F2] shadow-sm"
                : "text-stone-600 hover:text-[#1C1917]"
            }`}
          >
            <List className="w-3.5 h-3.5" />
            <span>Table</span>
          </button>
        </div>
      </div>

      {/* DND Context */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        {viewMode === "grid" ? (
          /* Grid Sortable Layout */
          <SortableContext items={filteredItemIds} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredItems.map((item) => (
                <SortableCard
                  key={item.id}
                  item={item}
                  onToggleVisibility={onToggleVisibility}
                  onToggleFeatured={onToggleFeatured}
                  onToggleIris={onToggleIris}
                  onToggleFooterTrail={onToggleFooterTrail}
                  onDeleteItem={onDeleteItem}
                  onEditItem={onEditItem}
                />
              ))}
              {filteredItems.length === 0 && (
                <div className="col-span-full py-20 text-center border border-dashed border-neutral-300 rounded-xl text-neutral-500 text-sm font-medium">
                  No photographs matching filter &quot;{filterCategory}&quot; or search query.
                </div>
              )}
            </div>
          </SortableContext>
        ) : viewMode === "kanban" ? (
          /* Category Kanban Columns */
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
            {categories.map((cat) => {
              const catItems = filteredItems.filter((i) => normalizeCategory(i.category) === cat);
              const catLabel = getCategoryDisplayLabel(cat);
              return (
                <div
                  key={cat}
                  className="bg-[#FAF7F2] border border-[#DDD6CA] p-4 flex flex-col min-h-[500px] rounded-xl shadow-xs"
                >
                  <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#DDD6CA] text-sm">
                    <span className="font-bold text-[#1C1917]">
                      {catLabel}
                    </span>
                    <span className="px-2 py-0.5 bg-[#F4F0EA] border border-[#DDD6CA] text-stone-700 text-xs rounded-full font-mono font-semibold">
                      {catItems.length}
                    </span>
                  </div>

                  <SortableContext
                    items={catItems.map((i) => i.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-4 flex-1">
                      {catItems.map((item) => (
                        <SortableCard
                          key={item.id}
                          item={item}
                          onToggleVisibility={onToggleVisibility}
                          onToggleFeatured={onToggleFeatured}
                          onToggleIris={onToggleIris}
                          onToggleFooterTrail={onToggleFooterTrail}
                          onDeleteItem={onDeleteItem}
                          onEditItem={onEditItem}
                        />
                      ))}
                      {catItems.length === 0 && (
                        <div className="h-32 border border-dashed border-[#DDD6CA] rounded-lg flex items-center justify-center text-sm text-stone-400 text-center px-2">
                          No {catLabel} photos
                        </div>
                      )}
                    </div>
                  </SortableContext>
                </div>
              );
            })}
          </div>
        ) : (
          /* Dense Table / List View with Big Fonts */
          <div className="bg-[#FAF7F2] border border-[#DDD6CA] overflow-x-auto rounded-xl shadow-xs">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-[#DDD6CA] text-xs font-bold text-stone-700 uppercase tracking-wider bg-[#EAE4D9]/70">
                  <th className="py-3.5 px-4 w-12 text-center">#</th>
                  <th className="py-3.5 px-4 w-20">Preview</th>
                  <th className="py-3.5 px-4">Title & Story</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Artist / Location</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DDD6CA]/60">
                {filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-[#F4F0EA] transition-colors group">
                    <td className="py-3.5 px-4 text-center font-mono font-bold text-stone-400">
                      #{item.orderIndex + 1}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="relative w-12 h-14 bg-[#EDE8DF] rounded-lg overflow-hidden border border-[#DDD6CA]">
                        <Image
                          src={item.imageUrl}
                          alt={item.title}
                          fill
                          sizes="70px"
                          className="object-cover"
                        />
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-[#1C1917] text-sm">
                        {item.title}
                      </div>
                      <div className="text-xs text-stone-600 font-medium truncate max-w-xs mt-0.5">
                        {item.seriesOrProject || "Independent"}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 border border-[#DDD6CA] bg-[#F4F0EA] text-[#1C1917] text-xs font-semibold rounded-md">
                        {getCategoryDisplayLabel(item.category)}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-stone-700 text-sm">
                      <div className="font-medium text-[#1C1917]">{item.artist || "Aziz"}</div>
                      <div className="text-xs text-stone-500">{item.location || item.year || ""}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2.5 py-1 rounded-md text-xs font-semibold border ${
                            item.isVisible
                              ? "bg-[#F4F0EA] text-stone-800 border-[#DDD6CA]"
                              : "bg-red-50 text-red-600 border-red-200"
                          }`}
                        >
                          {item.isVisible ? "Visible" : "Hidden"}
                        </span>
                        {item.isIrisItem && (
                          <span className="px-2.5 py-1 bg-[#F4F0EA] border border-[#DDD6CA] text-stone-800 rounded-md text-xs font-semibold flex items-center gap-1">
                            <Sparkles className="w-3 h-3" />
                            <span>Iris</span>
                          </span>
                        )}
                        {item.isFooterTrailItem && (
                          <span className="px-2.5 py-1 bg-[#F4F0EA] border border-[#DDD6CA] text-stone-800 rounded-md text-xs font-semibold flex items-center gap-1">
                            <MousePointer className="w-3 h-3" />
                            <span>Trail</span>
                          </span>
                        )}
                        {item.isFeatured && (
                          <span className="p-1.5 bg-[#F4F0EA] border border-[#DDD6CA] text-[#1C1917] rounded-md">
                            <Star className="w-3 h-3 fill-current" />
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => onToggleVisibility(item.id, !item.isVisible)}
                          className="p-2 hover:bg-[#1C1917] hover:text-[#FAF7F2] text-stone-600 transition-colors cursor-pointer rounded-lg border border-transparent hover:border-[#1C1917]"
                          title="Toggle visibility"
                        >
                          {item.isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </button>
                        {onToggleFooterTrail && (
                          <button
                            type="button"
                            onClick={() => onToggleFooterTrail(item.id, !item.isFooterTrailItem)}
                            className={`p-2 transition-colors cursor-pointer rounded-lg border ${
                              item.isFooterTrailItem
                                ? "bg-[#1C1917] text-[#FAF7F2] border-[#1C1917]"
                                : "hover:bg-[#1C1917] hover:text-[#FAF7F2] text-stone-600 border-transparent hover:border-[#1C1917]"
                            }`}
                            title={item.isFooterTrailItem ? "Remove from footer trail" : "Add to footer trail"}
                          >
                            <MousePointer className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => onEditItem(item)}
                          className="p-2 hover:bg-[#1C1917] hover:text-[#FAF7F2] text-stone-600 transition-colors cursor-pointer rounded-lg border border-transparent hover:border-[#1C1917]"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteItem(item.id)}
                          className="p-2 hover:bg-red-50 hover:text-red-700 text-stone-500 transition-colors cursor-pointer rounded-lg"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Drag Overlay for Smooth Hover Floating */}
        <DragOverlay>
          {activeItem ? (
            <div className="p-3 bg-[#FAF7F2] border-2 border-[#1C1917] shadow-2xl flex items-center gap-3 w-72 rounded-xl opacity-95">
              <div className="relative w-12 h-14 shrink-0 bg-[#EDE8DF] rounded-lg overflow-hidden border border-[#DDD6CA]">
                <Image
                  src={activeItem.imageUrl}
                  alt={activeItem.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="min-w-0">
                <div className="font-bold text-sm text-neutral-950 truncate">
                  {activeItem.title}
                </div>
                <div className="text-xs text-neutral-500 font-mono mt-0.5">
                  Order Index #{activeItem.orderIndex + 1}
                </div>
              </div>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}

export default React.memo(DndBoard);
