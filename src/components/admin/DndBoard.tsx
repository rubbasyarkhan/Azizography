"use client";

import React, { useState } from "react";
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
  GripVertical,
  Eye,
  EyeOff,
  Star,
  Trash2,
  Edit2,
  Move,
  Columns,
  Grid,
  MapPin,
  Calendar,
  Sparkles,
} from "lucide-react";
import confetti from "canvas-confetti";

interface DndBoardProps {
  items: GalleryItem[];
  onReorder: (newItems: GalleryItem[]) => void;
  onToggleVisibility: (id: string, isVisible: boolean) => void;
  onToggleFeatured: (id: string, isFeatured: boolean) => void;
  onDeleteItem: (id: string) => void;
  onEditItem: (item: GalleryItem) => void;
}

// Sortable Item Component
function SortableCard({
  item,
  onToggleVisibility,
  onToggleFeatured,
  onDeleteItem,
  onEditItem,
}: {
  item: GalleryItem;
  onToggleVisibility: (id: string, isVisible: boolean) => void;
  onToggleFeatured: (id: string, isFeatured: boolean) => void;
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

  const getCategoryColor = (cat: GalleryCategory) => {
    switch (cat) {
      case "concerts":
        return "text-red-400 border-red-500/30 bg-red-950/20";
      case "singers":
        return "text-purple-400 border-purple-500/30 bg-purple-950/20";
      case "weddings":
        return "text-amber-400 border-amber-500/30 bg-amber-950/20";
      case "events":
        return "text-cyan-400 border-cyan-500/30 bg-cyan-950/20";
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative bg-[#141414] border ${
        isDragging
          ? "border-red-500 opacity-40 shadow-2xl scale-95 z-30"
          : item.isVisible
          ? "border-white/10 hover:border-white/30"
          : "border-red-900/40 opacity-60 bg-black/60"
      } p-3 transition-all flex flex-col justify-between select-none`}
    >
      <div>
        {/* Top Header: Drag Handle & Order Badge */}
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/5 text-[10px] font-mono-brutal">
          <div className="flex items-center gap-1.5">
            <button
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing p-1 text-neutral-500 hover:text-white rounded"
              title="Drag to reorder"
            >
              <GripVertical className="w-4 h-4" />
            </button>
            <span className="font-bold text-white">#{item.orderIndex + 1}</span>
          </div>

          <div className="flex items-center gap-1">
            <span className={`px-2 py-0.5 border text-[9px] font-bold uppercase tracking-wider ${getCategoryColor(item.category)}`}>
              {item.category}
            </span>
            {item.isFeatured && (
              <span className="p-0.5 text-amber-400" title="Featured on Hero">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
              </span>
            )}
          </div>
        </div>

        {/* Thumbnail & Title */}
        <div className="flex gap-3 items-center">
          <div className="relative w-16 h-16 shrink-0 bg-neutral-900 border border-white/10 overflow-hidden">
            <Image
              src={item.imageUrl}
              alt={item.title}
              fill
              sizes="64px"
              className="object-cover"
            />
          </div>

          <div className="min-w-0 flex-1">
            <h4 className="font-display font-bold text-xs uppercase text-white truncate">
              {item.title}
            </h4>
            {item.artist && (
              <p className="text-[10px] text-neutral-400 font-serif-elegant italic truncate">
                {item.artist}
              </p>
            )}
            <div className="flex items-center gap-2 text-[9px] font-mono-brutal text-neutral-500 mt-1">
              {item.location && <span className="truncate">{item.location}</span>}
              {item.year && <span>• {item.year}</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Card Action Controls */}
      <div className="mt-3 pt-2 border-t border-white/10 flex items-center justify-between text-neutral-400 text-xs">
        <div className="flex items-center gap-1">
          {/* Toggle Visibility */}
          <button
            onClick={() => onToggleVisibility(item.id, !item.isVisible)}
            title={item.isVisible ? "Visible on Live Site (Click to Hide)" : "Hidden from Live Site (Click to Show)"}
            className={`p-1.5 transition-colors ${
              item.isVisible ? "text-neutral-300 hover:text-white" : "text-red-500 bg-red-950/30"
            }`}
          >
            {item.isVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
          </button>

          {/* Toggle Featured */}
          <button
            onClick={() => onToggleFeatured(item.id, !item.isFeatured)}
            title={item.isFeatured ? "Featured (Click to Unfeature)" : "Mark as Featured"}
            className={`p-1.5 transition-colors ${
              item.isFeatured ? "text-amber-400 fill-amber-400" : "text-neutral-500 hover:text-amber-300"
            }`}
          >
            <Star className={`w-3.5 h-3.5 ${item.isFeatured ? "fill-amber-400" : ""}`} />
          </button>
        </div>

        <div className="flex items-center gap-1">
          {/* Edit Details */}
          <button
            onClick={() => onEditItem(item)}
            title="Edit Details"
            className="p-1.5 text-neutral-400 hover:text-white transition-colors"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>

          {/* Delete */}
          <button
            onClick={() => onDeleteItem(item.id)}
            title="Delete from Gallery"
            className="p-1.5 text-neutral-500 hover:text-red-400 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function DndBoard({
  items,
  onReorder,
  onToggleVisibility,
  onToggleFeatured,
  onDeleteItem,
  onEditItem,
}: DndBoardProps) {
  const [viewMode, setViewMode] = useState<"grid" | "kanban">("grid");
  const [activeDragId, setActiveDragId] = useState<string | null>(null);

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

        // Confetti burst on successful reorder
        confetti({
          particleCount: 25,
          spread: 40,
          origin: { y: 0.8 },
          colors: ["#ef4444", "#ffffff", "#888888"],
        });
      }
    }
  };

  const activeItem = activeDragId ? items.find((i) => i.id === activeDragId) : null;

  const categories: GalleryCategory[] = ["concerts", "singers", "weddings", "events"];

  return (
    <div className="space-y-6">
      {/* Board Controls & Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-[#111111] border border-white/10 font-mono-brutal text-xs">
        <div className="flex items-center gap-3">
          <span className="text-white font-bold uppercase tracking-wider">
            CANVAS CONTROLLER:
          </span>
          <span className="text-neutral-400">
            {items.length} Images Indexed
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode("grid")}
            className={`flex items-center gap-1.5 px-3 py-1.5 border text-xs uppercase tracking-wider transition-colors ${
              viewMode === "grid"
                ? "bg-white text-black border-white font-bold"
                : "bg-transparent text-neutral-400 border-white/10 hover:border-white/30"
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
            <span>Layout Grid</span>
          </button>

          <button
            onClick={() => setViewMode("kanban")}
            className={`flex items-center gap-1.5 px-3 py-1.5 border text-xs uppercase tracking-wider transition-colors ${
              viewMode === "kanban"
                ? "bg-white text-black border-white font-bold"
                : "bg-transparent text-neutral-400 border-white/10 hover:border-white/30"
            }`}
          >
            <Columns className="w-3.5 h-3.5" />
            <span>Jira / Kanban</span>
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
          <SortableContext items={items.map((i) => i.id)} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {items.map((item) => (
                <SortableCard
                  key={item.id}
                  item={item}
                  onToggleVisibility={onToggleVisibility}
                  onToggleFeatured={onToggleFeatured}
                  onDeleteItem={onDeleteItem}
                  onEditItem={onEditItem}
                />
              ))}
            </div>
          </SortableContext>
        ) : (
          /* Jira / ClickUp Style Kanban Columns */
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {categories.map((cat) => {
              const catItems = items.filter((i) => i.category === cat);
              return (
                <div
                  key={cat}
                  className="bg-[#0f0f0f] border border-white/10 p-4 flex flex-col min-h-[500px]"
                >
                  <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/10 font-mono-brutal text-xs">
                    <span className="font-bold uppercase tracking-widest text-white">
                      // {cat}
                    </span>
                    <span className="px-2 py-0.5 bg-white/10 text-neutral-300 text-[10px]">
                      {catItems.length}
                    </span>
                  </div>

                  <SortableContext
                    items={catItems.map((i) => i.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-3 flex-1">
                      {catItems.map((item) => (
                        <SortableCard
                          key={item.id}
                          item={item}
                          onToggleVisibility={onToggleVisibility}
                          onToggleFeatured={onToggleFeatured}
                          onDeleteItem={onDeleteItem}
                          onEditItem={onEditItem}
                        />
                      ))}
                      {catItems.length === 0 && (
                        <div className="h-32 border border-dashed border-white/10 flex items-center justify-center text-[10px] text-neutral-600 font-mono-brutal uppercase">
                          No images in {cat}
                        </div>
                      )}
                    </div>
                  </SortableContext>
                </div>
              );
            })}
          </div>
        )}

        {/* Drag Overlay for smooth preview */}
        <DragOverlay>
          {activeItem ? (
            <div className="p-3 bg-[#1c1c1c] border-2 border-red-500 shadow-2xl flex items-center gap-3 w-64 opacity-90">
              <div className="relative w-12 h-12 shrink-0 bg-black">
                <Image
                  src={activeItem.imageUrl}
                  alt={activeItem.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="min-w-0">
                <div className="font-display font-bold text-xs uppercase text-white truncate">
                  {activeItem.title}
                </div>
                <div className="text-[10px] text-red-400 font-mono-brutal uppercase">
                  Reordering #{activeItem.orderIndex + 1}
                </div>
              </div>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
