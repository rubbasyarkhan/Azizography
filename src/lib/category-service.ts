import { db, isFirebaseConfigured } from "./firebase";
import { doc, getDoc, setDoc, updateDoc, onSnapshot } from "firebase/firestore";
import { GalleryItem, CategoryDefinition } from "@/types/gallery";
import { normalizeCategory, getCategoryDisplayLabel } from "./filter-utils";
import { getLocalItems, saveLocalItems } from "./gallery-service";

export interface CategoryOption {
  key: string;
  label: string;
  subcategories?: string[];
  description?: string;
  count?: number;
}

const CATEGORIES_STORAGE_KEY = "azizography_categories_v3";

// Initial seed matching user portfolio taxonomy
export const SEED_CATEGORIES: CategoryDefinition[] = [
  {
    id: "cat-people",
    name: "People",
    slug: "people",
    subcategories: ["@boljanimusic"],
    description: "Editorial portraiture, intimate monographs, and authentic emotion.",
    orderIndex: 0,
    createdAt: new Date().toISOString(),
  },
  {
    id: "cat-singers",
    name: "Singers",
    slug: "singers",
    subcategories: ["Talha Anjum (Mr MOST STREAM)"],
    description: "Recording artists, arena performances, and raw backstage captures.",
    orderIndex: 1,
    createdAt: new Date().toISOString(),
  },
];

let inMemoryCategories: CategoryDefinition[] | null = null;

/**
 * Attaches real-time item counts to authoritative categories.
 * The DB categories list is authoritative: this function NEVER invents or
 * resurrects deleted categories or subcategories from stale gallery items.
 */
export function healCategoriesWithItems(
  existingCategories: CategoryDefinition[],
  items?: GalleryItem[]
): CategoryDefinition[] {
  const baseList =
    existingCategories && existingCategories.length > 0
      ? existingCategories
      : SEED_CATEGORIES;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return baseList;
  }

  return baseList.map((cat) => {
    const catSlug = cat.slug || normalizeCategory(cat.name);
    const catNameLower = cat.name.toLowerCase().trim();

    const count = items.filter((i) => {
      if (i.isVisible === false || !i.imageUrl) return false;
      const raw = (i.category || "").toLowerCase().trim();
      const norm = normalizeCategory(i.category || "");
      return norm === catSlug || raw === catNameLower;
    }).length;

    return { ...cat, count };
  });
}

export function getCategories(items?: GalleryItem[]): CategoryDefinition[] {
  if (inMemoryCategories && inMemoryCategories.length > 0) {
    if (items && Array.isArray(items) && items.length > 0) {
      return healCategoriesWithItems(inMemoryCategories, items);
    }
    return inMemoryCategories;
  }

  if (typeof window === "undefined") {
    return items && items.length > 0
      ? healCategoriesWithItems(SEED_CATEGORIES, items)
      : SEED_CATEGORIES;
  }

  try {
    const raw = localStorage.getItem(CATEGORIES_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        inMemoryCategories = parsed;
        return items && items.length > 0
          ? healCategoriesWithItems(parsed, items)
          : parsed;
      }
    }
  } catch (e) {
    console.warn("Could not read categories from localStorage:", e);
  }

  inMemoryCategories = SEED_CATEGORIES;
  return items && items.length > 0
    ? healCategoriesWithItems(SEED_CATEGORIES, items)
    : SEED_CATEGORIES;
}

/**
 * Persists categories directly to Firestore DB and local storage,
 * and notifies all active client listeners.
 */
export async function saveCategories(categories: CategoryDefinition[]): Promise<void> {
  inMemoryCategories = categories;

  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(categories));
      window.dispatchEvent(
        new CustomEvent("azizography_categories_update", { detail: categories })
      );
    } catch (e) {
      console.warn("Could not save categories to localStorage:", e);
    }
  }

  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, "site_metadata", "categories_v3");
      await setDoc(
        docRef,
        {
          list: categories,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
    } catch (err) {
      console.warn("Firestore categories write notice:", err);
    }
  }
}

export async function addCategory(
  name: string,
  subcategories: string[] = [],
  description?: string,
  coverImageUrl?: string
): Promise<CategoryDefinition> {
  const trimmed = name.trim();
  if (!trimmed) {
    throw new Error("Category name cannot be empty");
  }

  const slug =
    normalizeCategory(trimmed) ||
    trimmed.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const current = getCategories();
  const existing = current.find(
    (c) => c.slug === slug || c.name.toLowerCase() === trimmed.toLowerCase()
  );

  if (existing) {
    if (subcategories.length > 0) {
      const mergedSubs = Array.from(
        new Set([...(existing.subcategories || []), ...subcategories])
      );
      const updated = current.map((c) =>
        c.id === existing.id
          ? {
              ...c,
              subcategories: mergedSubs,
              description: description?.trim() || c.description,
            }
          : c
      );
      await saveCategories(updated);
      return { ...existing, subcategories: mergedSubs };
    }
    return existing;
  }

  const newCat: CategoryDefinition = {
    id: `cat-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    name: trimmed,
    slug,
    subcategories: subcategories.map((s) => s.trim()).filter(Boolean),
    description: description?.trim() || `Curated ${trimmed} monographs and exhibition series.`,
    coverImageUrl: coverImageUrl?.trim() || "",
    orderIndex: current.length,
    createdAt: new Date().toISOString(),
  };

  const updated = [...current, newCat];
  await saveCategories(updated);
  return newCat;
}

export async function updateCategory(
  id: string,
  updates: Partial<CategoryDefinition>
): Promise<void> {
  const current = getCategories();
  const oldCategory = current.find((c) => c.id === id || c.slug === id);

  const updated = current.map((c) => {
    if (c.id === id || c.slug === id) {
      const next = { ...c, ...updates };
      if (updates.name && !updates.slug) {
        next.slug = normalizeCategory(updates.name);
      }
      return next;
    }
    return c;
  });

  await saveCategories(updated);

  // If the category name changed, update all gallery items in DB & local storage
  if (oldCategory && updates.name && updates.name !== oldCategory.name) {
    const oldSlug = oldCategory.slug;
    const oldNameLower = oldCategory.name.toLowerCase().trim();
    const newName = updates.name.trim();

    const localItems = getLocalItems();
    let hasChanges = false;
    const itemsToUpdateInDb: string[] = [];

    const updatedItems = localItems.map((item) => {
      const itemCatNorm = normalizeCategory(item.category || "");
      const itemCatLower = (item.category || "").toLowerCase().trim();
      if (itemCatNorm === oldSlug || itemCatLower === oldNameLower) {
        hasChanges = true;
        itemsToUpdateInDb.push(item.id);
        return {
          ...item,
          category: newName,
        };
      }
      return item;
    });

    if (hasChanges) {
      saveLocalItems(updatedItems);

      if (isFirebaseConfigured && db) {
        for (const itemId of itemsToUpdateInDb) {
          try {
            const itemRef = doc(db, "gallery_items", itemId);
            await updateDoc(itemRef, {
              category: newName,
            });
          } catch (err) {
            console.warn(`Firestore update item ${itemId} error on category rename:`, err);
          }
        }
      }
    }
  }
}

/**
 * Permanently deletes a category from the database, and reassigns any existing
 * photographs in this category to the primary remaining category so no items
 * are orphaned or left resurrecting the deleted category.
 */
export async function deleteCategory(idOrSlug: string): Promise<void> {
  const current = getCategories();
  const target = current.find(
    (c) =>
      c.id === idOrSlug ||
      c.slug === idOrSlug ||
      normalizeCategory(c.name) === normalizeCategory(idOrSlug)
  );

  const updated = current.filter(
    (c) =>
      c.id !== idOrSlug &&
      c.slug !== idOrSlug &&
      normalizeCategory(c.name) !== normalizeCategory(idOrSlug)
  );

  // 1. Save updated categories to Firestore and local storage
  await saveCategories(updated);

  // 2. Reassign all gallery items in DB that belonged to the deleted category
  if (target) {
    const deletedSlug = target.slug;
    const deletedNameLower = target.name.toLowerCase().trim();
    const fallbackCategory = updated[0]?.name || "People";

    const localItems = getLocalItems();
    let hasChanges = false;
    const itemsToUpdateInDb: string[] = [];

    const updatedItems = localItems.map((item) => {
      const itemCatNorm = normalizeCategory(item.category || "");
      const itemCatLower = (item.category || "").toLowerCase().trim();
      if (itemCatNorm === deletedSlug || itemCatLower === deletedNameLower) {
        hasChanges = true;
        itemsToUpdateInDb.push(item.id);
        return {
          ...item,
          category: fallbackCategory,
          subcategory: "", // also clear subcategory so it's not orphaned
        };
      }
      return item;
    });

    if (hasChanges) {
      saveLocalItems(updatedItems);

      if (isFirebaseConfigured && db) {
        for (const itemId of itemsToUpdateInDb) {
          try {
            const itemRef = doc(db, "gallery_items", itemId);
            await updateDoc(itemRef, {
              category: fallbackCategory,
              subcategory: "",
            });
          } catch (err) {
            console.warn(`Firestore update item ${itemId} error on category delete:`, err);
          }
        }
      }
    }
  }
}

export async function addSubcategory(
  categorySlugOrId: string,
  subcategoryName: string
): Promise<void> {
  const trimmedSub = subcategoryName.trim();
  if (!trimmedSub) return;
  const current = getCategories();
  const updated = current.map((c) => {
    if (
      c.id === categorySlugOrId ||
      c.slug === categorySlugOrId ||
      c.name.toLowerCase() === categorySlugOrId.toLowerCase()
    ) {
      const existing = c.subcategories || [];
      if (!existing.some((s) => s.toLowerCase() === trimmedSub.toLowerCase())) {
        return { ...c, subcategories: [...existing, trimmedSub] };
      }
    }
    return c;
  });
  await saveCategories(updated);
}

/**
 * Permanently deletes a subcategory from a category in the database,
 * and clears the subcategory tag from all gallery items in DB that had it.
 */
export async function deleteSubcategory(
  categorySlugOrId: string,
  subcategoryName: string
): Promise<void> {
  const trimmedSub = subcategoryName.trim();
  const trimmedSubLower = trimmedSub.toLowerCase();
  const current = getCategories();

  const targetCategory = current.find(
    (c) =>
      c.id === categorySlugOrId ||
      c.slug === categorySlugOrId ||
      c.name.toLowerCase() === categorySlugOrId.toLowerCase()
  );

  const updated = current.map((c) => {
    if (
      c.id === categorySlugOrId ||
      c.slug === categorySlugOrId ||
      c.name.toLowerCase() === categorySlugOrId.toLowerCase()
    ) {
      return {
        ...c,
        subcategories: (c.subcategories || []).filter(
          (s) => s.trim().toLowerCase() !== trimmedSubLower
        ),
      };
    }
    return c;
  });

  // 1. Save updated categories to DB & local storage
  await saveCategories(updated);

  // 2. Clear subcategory field on all gallery items in DB
  if (targetCategory) {
    const targetSlug = targetCategory.slug;
    const targetNameLower = targetCategory.name.toLowerCase().trim();

    const localItems = getLocalItems();
    let hasChanges = false;
    const itemsToUpdateInDb: string[] = [];

    const updatedItems = localItems.map((item) => {
      const itemCatNorm = normalizeCategory(item.category || "");
      const itemCatLower = (item.category || "").toLowerCase().trim();
      const itemSub = (item.subcategory || "").trim().toLowerCase();
      const itemSeries = (item.seriesOrProject || "").trim().toLowerCase();

      const matchesCat = itemCatNorm === targetSlug || itemCatLower === targetNameLower;
      const matchesSub = itemSub === trimmedSubLower || itemSeries === trimmedSubLower;

      if (matchesCat && matchesSub) {
        hasChanges = true;
        itemsToUpdateInDb.push(item.id);
        return {
          ...item,
          subcategory: "",
        };
      }
      return item;
    });

    if (hasChanges) {
      saveLocalItems(updatedItems);

      if (isFirebaseConfigured && db) {
        for (const itemId of itemsToUpdateInDb) {
          try {
            const itemRef = doc(db, "gallery_items", itemId);
            await updateDoc(itemRef, {
              subcategory: "",
            });
          } catch (err) {
            console.warn(`Firestore update item ${itemId} error on subcategory delete:`, err);
          }
        }
      }
    }
  }
}

export async function reorderCategories(newCategories: CategoryDefinition[]): Promise<void> {
  const indexed = newCategories.map((c, idx) => ({ ...c, orderIndex: idx }));
  await saveCategories(indexed);
}

// Backward-compatible adapter for existing components
export function getAllCategories(items?: GalleryItem[]): CategoryOption[] {
  const categories = getCategories(items);
  const map = new Map<string, CategoryOption>();

  for (const c of categories) {
    map.set(c.slug, {
      key: c.slug,
      label: c.name,
      subcategories: c.subcategories || [],
      description: c.description,
      count: c.count,
    });
  }

  return Array.from(map.values());
}

export async function addCustomCategory(label: string): Promise<CategoryOption> {
  const cat = await addCategory(label);
  return {
    key: cat.slug,
    label: cat.name,
    subcategories: cat.subcategories,
    description: cat.description,
  };
}

// Shared subscriber set for categories
const categoryCallbacks = new Set<(cats: CategoryDefinition[]) => void>();
let globalCategoryFirestoreUnsub: (() => void) | null = null;
let categoryTeardownTimer: ReturnType<typeof setTimeout> | null = null;

function broadcastCategories(cats: CategoryDefinition[]) {
  categoryCallbacks.forEach((cb) => {
    try {
      cb(cats);
    } catch {
      // safe
    }
  });
}

export function subscribeToCategories(
  callback: (cats: CategoryDefinition[]) => void
): () => void {
  if (typeof window === "undefined") {
    callback(getCategories());
    return () => {};
  }

  if (categoryTeardownTimer) {
    clearTimeout(categoryTeardownTimer);
    categoryTeardownTimer = null;
  }

  categoryCallbacks.add(callback);

  const handler = () => {
    broadcastCategories(getCategories());
  };

  if (categoryCallbacks.size === 1) {
    window.addEventListener("azizography_categories_update", handler);
  }

  callback(getCategories());

  if (!globalCategoryFirestoreUnsub && isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, "site_metadata", "categories_v3");
      globalCategoryFirestoreUnsub = onSnapshot(
        docRef,
        async (snap) => {
          if (snap.exists() && Array.isArray(snap.data()?.list)) {
            const remoteList: CategoryDefinition[] = snap.data().list;
            inMemoryCategories = remoteList;
            try {
              localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(remoteList));
            } catch {}
            broadcastCategories(remoteList);
          } else if (!snap.exists()) {
            // Seed DB on first boot
            try {
              await setDoc(docRef, {
                list: SEED_CATEGORIES,
                updatedAt: new Date().toISOString(),
              });
              inMemoryCategories = SEED_CATEGORIES;
              broadcastCategories(SEED_CATEGORIES);
            } catch (seedErr) {
              console.warn("Initial category seed notice:", seedErr);
            }
          }
        },
        (err) => {
          console.warn(
            "Firestore categories notice (using local storage fallback):",
            err?.message || err
          );
          broadcastCategories(getCategories());
        }
      );
    } catch {
      // safe fallback
    }
  }

  return () => {
    categoryCallbacks.delete(callback);
    if (categoryCallbacks.size === 0) {
      categoryTeardownTimer = setTimeout(() => {
        if (categoryCallbacks.size === 0) {
          if (globalCategoryFirestoreUnsub) {
            try {
              globalCategoryFirestoreUnsub();
            } catch (unsubErr) {
              console.debug("Firestore category unsubscribe suppressed:", unsubErr);
            }
            globalCategoryFirestoreUnsub = null;
          }
          window.removeEventListener("azizography_categories_update", handler);
        }
      }, 2500);
    }
  };
}
