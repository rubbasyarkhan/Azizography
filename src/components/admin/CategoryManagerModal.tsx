"use client";

import React, { useState, useEffect, useMemo } from "react";
import { CategoryDefinition, GalleryItem } from "@/types/gallery";
import {
  getCategories,
  saveCategories,
  addCategory,
  deleteCategory,
  addSubcategory,
  deleteSubcategory,
  updateCategory,
  reorderCategories,
  subscribeToCategories,
  healCategoriesWithItems,
} from "@/lib/category-service";
import { normalizeCategory } from "@/lib/filter-utils";
import {
  X,
  Plus,
  FolderPlus,
  Tag,
  Trash2,
  Edit2,
  Check,
  Layers,
  Sparkles,
  ArrowUp,
  ArrowDown,
  Eye,
} from "lucide-react";

interface CategoryManagerModalProps {
  onClose: () => void;
  onSelectCategory?: (categoryName: string) => void;
  items?: GalleryItem[];
}

export default function CategoryManagerModal({
  onClose,
  items = [],
}: CategoryManagerModalProps) {
  const [categories, setCategories] = useState<CategoryDefinition[]>(() =>
    getCategories(items)
  );
  const [newCatName, setNewCatName] = useState("");
  const [newCatSubs, setNewCatSubs] = useState("");
  const [newCatDesc, setNewCatDesc] = useState("");
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [editingCatName, setEditingCatName] = useState("");
  const [editingCatDesc, setEditingCatDesc] = useState("");
  const [newSubInputs, setNewSubInputs] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    const unsub = subscribeToCategories((cats) => {
      const healed = healCategoriesWithItems(cats, items);
      setCategories(healed);
    });
    return () => {
      try {
        unsub();
      } catch (e) {
        console.warn("CategoryManagerModal categories unsubscribe error:", e);
      }
    };
  }, [items]);

  const showNotice = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 3200);
  };

  // Compute item counts for each category and subcategory
  const countsMap = useMemo(() => {
    const catCounts = new Map<string, number>();
    const subCounts = new Map<string, number>();

    for (const item of items) {
      if (item.isVisible === false || !item.imageUrl) continue;
      const normCat = normalizeCategory(item.category || "people");
      catCounts.set(normCat, (catCounts.get(normCat) || 0) + 1);

      const subName = (item.subcategory || item.seriesOrProject || "").trim().toLowerCase();
      if (subName) {
        const key = `${normCat}:::${subName}`;
        subCounts.set(key, (subCounts.get(key) || 0) + 1);
      }
    }

    return { catCounts, subCounts };
  }, [items]);

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    const subList = newCatSubs
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    await addCategory(newCatName.trim(), subList, newCatDesc.trim());
    setNewCatName("");
    setNewCatSubs("");
    setNewCatDesc("");
    showNotice(`Created category "${newCatName.trim()}"`);
  };

  const handleDeleteCategory = async (id: string, name: string) => {
    if (
      confirm(
        `Are you sure you want to delete category "${name}" and its subcategories?`
      )
    ) {
      await deleteCategory(id);
      showNotice(`Deleted category "${name}"`);
    }
  };

  const handleAddSubcategory = async (catId: string) => {
    const subText = (newSubInputs[catId] || "").trim();
    if (!subText) return;

    await addSubcategory(catId, subText);
    setNewSubInputs((prev) => ({ ...prev, [catId]: "" }));
    showNotice(`Added subcategory "${subText}"`);
  };

  const handleDeleteSub = async (catId: string, subName: string) => {
    await deleteSubcategory(catId, subName);
    showNotice(`Removed subcategory "${subName}"`);
  };

  const handleStartEdit = (cat: CategoryDefinition) => {
    setEditingCatId(cat.id);
    setEditingCatName(cat.name);
    setEditingCatDesc(cat.description || "");
  };

  const handleSaveEdit = async (catId: string) => {
    if (!editingCatName.trim()) return;
    await updateCategory(catId, {
      name: editingCatName.trim(),
      description: editingCatDesc.trim(),
    });
    setEditingCatId(null);
    setEditingCatName("");
    setEditingCatDesc("");
    showNotice("Category details updated");
  };

  const handleMoveCategory = async (index: number, direction: "up" | "down") => {
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= categories.length) return;

    const updated = [...categories];
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;

    setCategories(updated);
    await reorderCategories(updated);
    showNotice(`Reordered category sequence`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[92vh] bg-[#FAF7F2] border border-[#DDD6CA] shadow-2xl rounded-2xl flex flex-col overflow-hidden text-[#1C1917] font-admin">
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#DDD6CA] bg-[#F4F0EA] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#1C1917] text-[#FAF7F2] flex items-center justify-center shadow-xs">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold tracking-tight text-[#1C1917]">
                Category &amp; Subcategory Studio
              </h3>
              <p className="text-xs text-stone-500 font-mono">
                Manage live categories, descriptions &amp; subseries synced with client showcase
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-stone-500 hover:text-[#1C1917] hover:bg-[#EAE4D9] rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notice alert */}
        {notice && (
          <div className="bg-stone-900 text-stone-100 text-xs font-mono px-6 py-2 flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>{notice}</span>
          </div>
        )}

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Create New Category Card */}
          <div className="p-5 bg-[#F4F0EA] border border-[#DDD6CA] rounded-xl space-y-4">
            <div className="flex items-center gap-2 text-sm font-bold text-[#1C1917] uppercase tracking-wider">
              <FolderPlus className="w-4 h-4 text-stone-700" />
              <span>Create New Category</span>
            </div>

            <form onSubmit={handleCreateCategory} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Category Name * (e.g. People, Singers, Wedding, Concert)
                  </label>
                  <input
                    required
                    type="text"
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    placeholder="e.g. People"
                    className="w-full bg-[#FAF7F2] border border-[#DDD6CA] px-3 py-2 text-sm text-[#1C1917] rounded-lg focus:outline-none focus:border-[#1C1917]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Subcategories (comma separated)
                  </label>
                  <input
                    type="text"
                    value={newCatSubs}
                    onChange={(e) => setNewCatSubs(e.target.value)}
                    placeholder="e.g. @boljanimusic, Studio Sessions"
                    className="w-full bg-[#FAF7F2] border border-[#DDD6CA] px-3 py-2 text-sm text-[#1C1917] rounded-lg focus:outline-none focus:border-[#1C1917]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Description / Subtitle (Rendered on Homepage under Archive &amp; Collections)
                </label>
                <input
                  type="text"
                  value={newCatDesc}
                  onChange={(e) => setNewCatDesc(e.target.value)}
                  placeholder="e.g. Editorial portraiture, intimate monographs, and authentic emotion."
                  className="w-full bg-[#FAF7F2] border border-[#DDD6CA] px-3 py-2 text-sm text-[#1C1917] rounded-lg focus:outline-none focus:border-[#1C1917]"
                />
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  className="flex items-center gap-2 px-5 py-2.5 bg-[#1C1917] text-[#FAF7F2] hover:bg-stone-800 text-xs font-semibold uppercase tracking-wider rounded-lg transition-colors cursor-pointer shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Category</span>
                </button>
              </div>
            </form>
          </div>

          {/* List of Existing Categories */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 font-mono">
                Active Categories ({categories.length})
              </h4>
              <span className="text-xs text-stone-500 font-mono">
                First category is active on homepage showcase
              </span>
            </div>

            {categories.length === 0 ? (
              <div className="p-8 text-center bg-[#F4F0EA] border border-dashed border-[#DDD6CA] rounded-xl text-stone-500 text-sm">
                No categories created yet. Add your first category above!
              </div>
            ) : (
              <div className="space-y-4">
                {categories.map((cat, idx) => {
                  const norm = normalizeCategory(cat.slug || cat.name);
                  const itemCount = countsMap.catCounts.get(norm) || 0;

                  return (
                    <div
                      key={cat.id || cat.slug}
                      className="p-5 bg-[#FAF7F2] border border-[#DDD6CA] rounded-xl shadow-xs space-y-4 hover:border-stone-400 transition-colors"
                    >
                      {/* Category Title Bar */}
                      <div className="flex items-center justify-between gap-3 flex-wrap">
                        <div className="flex items-center gap-2.5 flex-1 min-w-[200px]">
                          {editingCatId === cat.id ? (
                            <div className="flex flex-col gap-2 w-full">
                              <div className="flex items-center gap-2">
                                <input
                                  type="text"
                                  value={editingCatName}
                                  onChange={(e) => setEditingCatName(e.target.value)}
                                  placeholder="Category Name"
                                  className="bg-[#F4F0EA] border border-[#DDD6CA] px-2.5 py-1 text-sm font-bold text-[#1C1917] rounded-md focus:outline-none focus:border-[#1C1917] flex-1"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleSaveEdit(cat.id)}
                                  className="p-1.5 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 cursor-pointer"
                                  title="Save Changes"
                                >
                                  <Check className="w-4 h-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditingCatId(null)}
                                  className="p-1.5 text-stone-500 hover:bg-[#EAE4D9] rounded-md cursor-pointer"
                                  title="Cancel"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                              <input
                                type="text"
                                value={editingCatDesc}
                                onChange={(e) => setEditingCatDesc(e.target.value)}
                                placeholder="Subtitle / Description on Homepage"
                                className="bg-[#F4F0EA] border border-[#DDD6CA] px-2.5 py-1 text-xs text-[#1C1917] rounded-md focus:outline-none focus:border-[#1C1917]"
                              />
                            </div>
                          ) : (
                            <>
                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  disabled={idx === 0}
                                  onClick={() => handleMoveCategory(idx, "up")}
                                  className="p-1 text-stone-400 hover:text-black disabled:opacity-20 cursor-pointer disabled:cursor-default"
                                  title="Move Up"
                                >
                                  <ArrowUp className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  disabled={idx === categories.length - 1}
                                  onClick={() => handleMoveCategory(idx, "down")}
                                  className="p-1 text-stone-400 hover:text-black disabled:opacity-20 cursor-pointer disabled:cursor-default"
                                  title="Move Down"
                                >
                                  <ArrowDown className="w-3.5 h-3.5" />
                                </button>
                              </div>

                              <span className="text-base font-bold text-[#1C1917]">
                                {cat.name}
                              </span>

                              <span className="text-xs font-mono text-stone-600 bg-[#EAE4D9] px-2 py-0.5 rounded font-semibold">
                                {itemCount} {itemCount === 1 ? "work" : "works"}
                              </span>

                              {idx === 0 && (
                                <span className="text-[10px] font-mono tracking-wider uppercase text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full font-bold">
                                  Default Showcase
                                </span>
                              )}

                              <button
                                type="button"
                                onClick={() => handleStartEdit(cat)}
                                className="text-stone-400 hover:text-stone-700 p-1 cursor-pointer"
                                title="Edit Category & Description"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>

                        {editingCatId !== cat.id && (
                          <button
                            type="button"
                            onClick={() => handleDeleteCategory(cat.id, cat.name)}
                            className="text-stone-400 hover:text-red-600 p-1.5 rounded-md hover:bg-red-50 transition-colors cursor-pointer"
                            title="Delete Category"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      {editingCatId !== cat.id && (
                        <p className="text-xs text-stone-600 italic">
                          {cat.description || "No description set (default placeholder will show)."}
                        </p>
                      )}

                      {/* Subcategories Chips */}
                      <div className="space-y-2 pt-2 border-t border-[#DDD6CA]/60">
                        <div className="text-[11px] font-semibold text-stone-600 uppercase tracking-wider flex items-center gap-1.5">
                          <Tag className="w-3.5 h-3.5 text-stone-500" />
                          <span>Subcategories &amp; Series:</span>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          {cat.subcategories && cat.subcategories.length > 0 ? (
                            cat.subcategories.map((sub, sIdx) => {
                              const subCountKey = `${norm}:::${sub.trim().toLowerCase()}`;
                              const sCount = countsMap.subCounts.get(subCountKey) || 0;

                              return (
                                <span
                                  key={sIdx}
                                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#F4F0EA] border border-[#DDD6CA] text-stone-800 text-xs font-medium rounded-full"
                                >
                                  <span>{sub}</span>
                                  {sCount > 0 && (
                                    <span className="text-[10px] font-mono text-stone-500 font-bold">
                                      ({sCount})
                                    </span>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteSub(cat.id, sub)}
                                    className="text-stone-400 hover:text-red-600 p-0.5 rounded-full hover:bg-stone-200 cursor-pointer"
                                    title={`Remove ${sub}`}
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </span>
                              );
                            })
                          ) : (
                            <span className="text-xs text-stone-400 italic">
                              No subcategories added yet.
                            </span>
                          )}

                          {/* Inline Quick Add Subcategory */}
                          <div className="flex items-center gap-1.5">
                            <input
                              type="text"
                              placeholder="+ Add subcategory..."
                              value={newSubInputs[cat.id] || ""}
                              onChange={(e) =>
                                setNewSubInputs({
                                  ...newSubInputs,
                                  [cat.id]: e.target.value,
                                })
                              }
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  handleAddSubcategory(cat.id);
                                }
                              }}
                              className="bg-[#F4F0EA] border border-[#DDD6CA] px-2.5 py-1 text-xs text-[#1C1917] placeholder:text-stone-400 rounded-full focus:outline-none focus:border-[#1C1917] w-40"
                            />
                            <button
                              type="button"
                              onClick={() => handleAddSubcategory(cat.id)}
                              className="p-1 bg-[#1C1917] text-white hover:bg-stone-800 rounded-full cursor-pointer"
                              title="Add subcategory"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#DDD6CA] bg-[#F4F0EA] flex items-center justify-between text-xs text-stone-500 font-mono">
          <span>Categories auto-sync to Firebase and client portal.</span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-[#1C1917] text-[#FAF7F2] hover:bg-stone-800 font-semibold uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
