"use client";

import React, { useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GalleryItem } from "@/types/gallery";
import { getOptimizedImageUrl, getResponsiveSrcSet } from "@/lib/image-utils";
import {
  GripVertical,
  Sparkles,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Maximize2,
  ArrowUpRight,
} from "lucide-react";
import InstagramIcon from "@/components/icons/InstagramIcon";

interface GalleryGridProps {
  items: GalleryItem[];
  onOpenLightbox: (item: GalleryItem) => void;
  isAdmin?: boolean;
  onReorder?: (newItems: GalleryItem[]) => void;
  onEditItem?: (item: GalleryItem) => void;
  onDeleteItem?: (id: string) => void;
  onToggleIris?: (item: GalleryItem) => void;
}

// Single Sortable Image Card for Live Drag & Drop (Memoized for high performance rendering)
const SortableImageCard = React.memo(function SortableImageCard({
  item,
  index,
  isAdmin,
  onOpenLightbox,
  onEditItem,
  onDeleteItem,
  onToggleIris,
}: {
  item: GalleryItem;
  index: number;
  isAdmin?: boolean;
  onOpenLightbox: (item: GalleryItem) => void;
  onEditItem?: (item: GalleryItem) => void;
  onDeleteItem?: (id: string) => void;
  onToggleIris?: (item: GalleryItem) => void;
}) {
  const [imageLoaded, setImageLoaded] = useState(false);

  // Compute exact aspect ratio string to prevent any Cumulative Layout Shift (CLS)
  const aspectRatioStyle = React.useMemo(() => {
    if (item.width && item.height) {
      return `${item.width} / ${item.height}`;
    }
    if (item.aspectRatio === "portrait") return "3 / 4";
    if (item.aspectRatio === "landscape") return "16 / 9";
    if (item.aspectRatio === "tall") return "9 / 16";
    if (item.aspectRatio === "square") return "1 / 1";
    return undefined;
  }, [item.width, item.height, item.aspectRatio]);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id, disabled: !isAdmin });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const isLcpCandidate = index < 2;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative break-inside-avoid select-none mb-6 sm:mb-8 transition-opacity ${
        isDragging ? "opacity-30 scale-[0.98] z-30" : "opacity-100"
      }`}
    >
      {/* Raw Sized Photograph Container with strict aspect ratio reservation to prevent CLS */}
      <div
        onClick={() => {
          if (!isDragging) {
            onOpenLightbox(item);
          }
        }}
        style={{
          ...(aspectRatioStyle ? { aspectRatio: aspectRatioStyle } : {}),
          ...(item.blurDataUrl
            ? {
                backgroundImage: `url(${item.blurDataUrl})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }
            : {}),
        }}
        className="relative w-full overflow-hidden bg-[#161616] cursor-pointer shadow-sm hover:shadow-md transition-shadow duration-300"
      >
        {/* Full Height & Width Raw Image (Optimized, compressed, and lazy loaded) */}
        <img
          src={getOptimizedImageUrl(item.imageUrl, 750, 75)}
          srcSet={getResponsiveSrcSet(item.imageUrl, [380, 680, 950])}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          alt={item.title}
          loading={isLcpCandidate ? "eager" : "lazy"}
          fetchPriority={isLcpCandidate ? "high" : undefined}
          decoding="async"
          onLoad={() => setImageLoaded(true)}
          className={`w-full h-auto block object-cover transition-all duration-500 ease-out group-hover:scale-[1.015] ${
            imageLoaded ? "opacity-100" : "opacity-0"
          }`}
        />

        {/* Minimal Editorial Overlay on Hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none flex flex-col justify-end p-5">
          {(item.seriesOrProject || item.description || item.artist) && (
            <span className="text-[10px] font-syne text-neutral-300 uppercase tracking-[0.22em] block mb-1">
              {item.seriesOrProject || item.description || item.artist}
            </span>
          )}
          <h3 className="font-artistic text-lg sm:text-xl font-normal italic text-white leading-tight">
            {item.title}
          </h3>
          {(item.location || item.year) && (
            <div className="flex items-center gap-2 text-[10px] uppercase font-mono-brutal text-neutral-300 tracking-widest mt-1.5">
              {item.location && <span>{item.location}</span>}
              {item.location && item.year && <span>•</span>}
              {item.year && <span>{item.year}</span>}
            </div>
          )}
          {item.instagramUrl && (
            <div className="pointer-events-auto mt-2.5">
              <a
                href={item.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/20 hover:bg-white text-white hover:text-black backdrop-blur-md rounded text-[10px] font-syne uppercase tracking-wider transition-all"
              >
                <InstagramIcon className="w-3 h-3 text-pink-400" />
                <span>View and comment on Instagram</span>
                <ArrowUpRight className="w-3 h-3" />
              </a>
            </div>
          )}
        </div>

        {/* In-Situ Admin Controls Overlay */}
        {isAdmin && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="absolute top-2 inset-x-2 flex items-center justify-between z-20"
          >
            {/* Drag Handle */}
            <div
              {...attributes}
              {...listeners}
              className="flex items-center gap-1.5 px-2 py-1 bg-black/85 backdrop-blur-md text-white text-[10px] uppercase font-mono tracking-wider border border-white/20 cursor-grab active:cursor-grabbing hover:bg-red-600 transition-colors shadow-lg"
              title="Drag to reorder photo position live"
            >
              <GripVertical className="w-3.5 h-3.5" />
              <span>#{index + 1}</span>
            </div>

            {/* Quick Action Badges */}
            <div className="flex items-center gap-1 bg-black/85 backdrop-blur-md p-1 border border-white/20 shadow-lg">
              {/* Toggle Iris Active */}
              <button
                type="button"
                onClick={() => onToggleIris?.(item)}
                title={item.isIrisItem ? "Active in Iris Animation (Click to remove)" : "Add to Iris Loading Animation"}
                className={`p-1 transition-colors cursor-pointer ${
                  item.isIrisItem
                    ? "text-red-400 bg-red-950/60 hover:text-white"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
              </button>

              {/* Edit Modal */}
              <button
                type="button"
                onClick={() => onEditItem?.(item)}
                title="Edit Photo Metadata & Tags"
                className="p-1 text-neutral-400 hover:text-white transition-colors cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>

              {/* Delete Button */}
              <button
                type="button"
                onClick={() => onDeleteItem?.(item.id)}
                title="Delete Asset"
                className="p-1 text-neutral-400 hover:text-red-400 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Subtle Bottom Caption for Editorial Look */}
      <div className="pt-2.5 pb-1 flex flex-col gap-1 text-neutral-800">
        <div className="flex items-baseline justify-between gap-2">
          <p className="font-sans text-[13px] font-medium uppercase tracking-wider text-neutral-900 truncate">
            {item.title}
          </p>
          {item.year && (
            <span className="font-sans text-[11px] text-neutral-400 uppercase tracking-wider shrink-0">
              {item.year}
            </span>
          )}
        </div>
        {(item.seriesOrProject || item.description) && (
          <p className="font-sans text-[11px] text-neutral-500 uppercase tracking-widest line-clamp-2">
            {item.seriesOrProject || item.description}
          </p>
        )}
        {item.instagramUrl && (
          <div className="pt-0.5">
            <a
              href={item.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1 text-[11px] font-sans font-medium text-stone-700 hover:text-black group/insta transition-colors"
            >
              <InstagramIcon className="w-3 h-3 text-pink-600 shrink-0" />
              <span className="underline underline-offset-2">View and comment on Instagram</span>
              <ArrowUpRight className="w-3 h-3 group-hover/insta:translate-x-0.5 group-hover/insta:-translate-y-0.5 transition-transform" />
            </a>
          </div>
        )}
      </div>
    </div>
  );
});

function GalleryGrid({
  items,
  onOpenLightbox,
  isAdmin = false,
  onReorder,
  onEditItem,
  onDeleteItem,
  onToggleIris,
}: GalleryGridProps) {
  const [activeDragItem, setActiveDragItem] = useState<GalleryItem | null>(null);
  const itemIds = React.useMemo(() => items.map((i) => i.id), [items]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Requires 8px movement before initiating drag, allowing clicks to work cleanly
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const found = items.find((i) => i.id === event.active.id);
    setActiveDragItem(found || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveDragItem(null);
    const { active, over } = event;
    if (!over || active.id === over.id || !onReorder) return;

    const oldIndex = items.findIndex((i) => i.id === active.id);
    const newIndex = items.findIndex((i) => i.id === over.id);
    if (oldIndex !== -1 && newIndex !== -1) {
      const reordered = arrayMove(items, oldIndex, newIndex);
      onReorder(reordered);
    }
  };

  if (items.length === 0) {
    return (
      <div className="w-full py-32 text-center">
        <p className="font-syne text-xs text-neutral-400 uppercase tracking-[0.25em]">
          NO PHOTOGRAPHS FOUND IN THIS SELECTION
        </p>
      </div>
    );
  }

  const content = (
    <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-3 gap-6 sm:gap-8">
      {items.map((item, index) => (
        <SortableImageCard
          key={item.id}
          item={item}
          index={index}
          isAdmin={isAdmin}
          onOpenLightbox={onOpenLightbox}
          onEditItem={onEditItem}
          onDeleteItem={onDeleteItem}
          onToggleIris={onToggleIris}
        />
      ))}
    </div>
  );

  return (
    <div className="w-full px-6 sm:px-10 lg:px-14 pb-24 pt-4">
      {isAdmin && onReorder ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={itemIds} strategy={rectSortingStrategy}>
            {content}
          </SortableContext>

          <DragOverlay dropAnimation={null}>
            {activeDragItem ? (
              <div className="w-72 shadow-2xl bg-neutral-900 border-2 border-red-500 overflow-hidden opacity-95 scale-105 pointer-events-none">
                <img
                  src={activeDragItem.imageUrl}
                  alt={activeDragItem.title}
                  className="w-full h-auto block object-contain"
                />
                <div className="p-3 bg-black text-white text-xs uppercase font-mono">
                  {activeDragItem.title}
                </div>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      ) : (
        content
      )}
    </div>
  );
}

export default React.memo(GalleryGrid);
