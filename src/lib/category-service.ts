import { db, isFirebaseConfigured } from "./firebase";
import { doc, getDoc, setDoc, onSnapshot } from "firebase/firestore";
import { GalleryItem, CategoryDefinition } from "@/types/gallery";
import { normalizeCategory, getCategoryDisplayLabel } from "./filter-utils";

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
 * Heals category list with any real categories present on active gallery items.
 * Removes empty obsolete placeholder categories (like dummy wedding/artist with 0 items).
 */
export function healCategoriesWithItems(
  existingCategories: CategoryDefinition[],
  items?: GalleryItem[]
): CategoryDefinition[] {
  if (!items || !Array.isArray(items) || items.length === 0) {
    return existingCategories;
  }

  const map = new Map<string, CategoryDefinition>();

  // 1. Index existing categories
  for (const c of existingCategories) {
    const slug = c.slug || normalizeCategory(c.name);
    map.set(slug, {
      ...c,
      slug,
      name: c.name || getCategoryDisplayLabel(slug),
      subcategories: [...(c.subcategories || [])],
    });
  }

  // 2. Discover categories & subcategories from items
  for (const item of items) {
    if (item.isVisible === false || !item.imageUrl) continue;
    const rawCat = (item.category || "people").trim();
    const slug = normalizeCategory(rawCat);
    const subName = (item.subcategory || item.seriesOrProject || "").trim();

    if (!map.has(slug)) {
      map.set(slug, {
        id: `cat-${slug}`,
        name: getCategoryDisplayLabel(rawCat),
        slug,
        subcategories: subName ? [subName] : [],
        description:
          slug === "people"
            ? "Editorial portraiture, intimate monographs, and authentic emotion."
            : slug === "singers"
            ? "Recording artists, arena performances, and raw backstage captures."
            : `Curated ${rawCat} monographs and artistic photography.`,
        orderIndex: map.size,
        createdAt: new Date().toISOString(),
      });
    } else {
      const existing = map.get(slug)!;
      if (subName && !existing.subcategories.some((s) => s.toLowerCase() === subName.toLowerCase())) {
        existing.subcategories.push(subName);
      }
    }
  }

  // 3. Count items in each category
  const list = Array.from(map.values()).map((c) => {
    const count = items.filter((i) => {
      if (i.isVisible === false || !i.imageUrl) return false;
      const norm = normalizeCategory(i.category || "people");
      return norm === c.slug || norm === normalizeCategory(c.name);
    }).length;
    return { ...c, count };
  });

  // 4. If we have categories with items, filter out obsolete categories with 0 items
  const hasPopulated = list.some((c) => (c.count || 0) > 0);
  let result = list;
  if (hasPopulated) {
    result = list.filter((c) => (c.count || 0) > 0);
  }

  return result.map(({ count, ...rest }) => rest);
}

export function getCategories(items?: GalleryItem[]): CategoryDefinition[] {
  if (inMemoryCategories && inMemoryCategories.length > 0) {
    if (items && Array.isArray(items) && items.length > 0) {
      const healed = healCategoriesWithItems(inMemoryCategories, items);
      inMemoryCategories = healed;
      return healed;
    }
    return inMemoryCategories;
  }

  if (typeof window === "undefined") {
    return items && items.length > 0 ? healCategoriesWithItems(SEED_CATEGORIES, items) : SEED_CATEGORIES;
  }

  try {
    const raw = localStorage.getItem(CATEGORIES_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const healed = items && items.length > 0 ? healCategoriesWithItems(parsed, items) : parsed;
        inMemoryCategories = healed;
        return healed;
      }
    }
  } catch (e) {
    console.warn("Could not read categories from localStorage:", e);
  }

  const initial = items && items.length > 0 ? healCategoriesWithItems(SEED_CATEGORIES, items) : SEED_CATEGORIES;
  inMemoryCategories = initial;
  return initial;
}

export function saveCategories(categories: CategoryDefinition[]): void {
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
      setDoc(docRef, { list: categories, updatedAt: new Date().toISOString() }, { merge: true }).catch(
        (err) => console.warn("Firestore categories sync notice:", err)
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

  const slug = normalizeCategory(trimmed) || trimmed.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const current = getCategories();
  const existing = current.find(
    (c) => c.slug === slug || c.name.toLowerCase() === trimmed.toLowerCase()
  );

  if (existing) {
    // If new subcategories provided, merge them
    if (subcategories.length > 0) {
      const mergedSubs = Array.from(new Set([...(existing.subcategories || []), ...subcategories]));
      const updated = current.map((c) =>
        c.id === existing.id ? { ...c, subcategories: mergedSubs, description: description?.trim() || c.description } : c
      );
      saveCategories(updated);
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
  saveCategories(updated);
  return newCat;
}

export async function updateCategory(
  id: string,
  updates: Partial<CategoryDefinition>
): Promise<void> {
  const current = getCategories();
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
  saveCategories(updated);
}

export async function deleteCategory(id: string): Promise<void> {
  const current = getCategories();
  const updated = current.filter((c) => c.id !== id && c.slug !== id);
  saveCategories(updated);
}

export async function addSubcategory(categorySlugOrId: string, subcategoryName: string): Promise<void> {
  const trimmedSub = subcategoryName.trim();
  if (!trimmedSub) return;
  const current = getCategories();
  const updated = current.map((c) => {
    if (c.id === categorySlugOrId || c.slug === categorySlugOrId || c.name.toLowerCase() === categorySlugOrId.toLowerCase()) {
      const existing = c.subcategories || [];
      if (!existing.some((s) => s.toLowerCase() === trimmedSub.toLowerCase())) {
        return { ...c, subcategories: [...existing, trimmedSub] };
      }
    }
    return c;
  });
  saveCategories(updated);
}

export async function deleteSubcategory(categorySlugOrId: string, subcategoryName: string): Promise<void> {
  const trimmedSub = subcategoryName.trim().toLowerCase();
  const current = getCategories();
  const updated = current.map((c) => {
    if (c.id === categorySlugOrId || c.slug === categorySlugOrId || c.name.toLowerCase() === categorySlugOrId.toLowerCase()) {
      return {
        ...c,
        subcategories: (c.subcategories || []).filter((s) => s.trim().toLowerCase() !== trimmedSub),
      };
    }
    return c;
  });
  saveCategories(updated);
}

export async function reorderCategories(newCategories: CategoryDefinition[]): Promise<void> {
  const indexed = newCategories.map((c, idx) => ({ ...c, orderIndex: idx }));
  saveCategories(indexed);
}

// Backward-compatible adapter for existing components
export function getAllCategories(items?: GalleryItem[]): CategoryOption[] {
  const categories = getCategories(items);
  const map = new Map<string, CategoryOption>();

  for (const c of categories) {
    map.set(c.slug, {
      key: c.slug,
      label: c.name,
      subcategories: c.subcategories,
      description: c.description,
    });
  }

  // Also collect any dynamic categories assigned on items
  if (items && Array.isArray(items)) {
    for (const item of items) {
      if (item.category) {
        const norm = normalizeCategory(item.category);
        const subName = (item.subcategory || item.seriesOrProject || "").trim();
        if (!map.has(norm)) {
          map.set(norm, {
            key: norm,
            label: getCategoryDisplayLabel(item.category),
            subcategories: subName ? [subName] : [],
          });
        } else if (subName) {
          const opt = map.get(norm)!;
          if (opt.subcategories && !opt.subcategories.some((s) => s.toLowerCase() === subName.toLowerCase())) {
            opt.subcategories.push(subName);
          }
        }
      }
    }
  }

  return Array.from(map.values());
}

export async function addCustomCategory(label: string): Promise<CategoryOption> {
  const cat = await addCategory(label);
  return { key: cat.slug, label: cat.name, subcategories: cat.subcategories, description: cat.description };
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
        (snap) => {
          if (snap.exists() && snap.data()?.list) {
            const remoteList: CategoryDefinition[] = snap.data().list;
            inMemoryCategories = remoteList;
            try {
              localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(remoteList));
            } catch {}
            broadcastCategories(remoteList);
          }
        },
        (err) => {
          console.warn("Firestore categories notice (using local storage fallback):", err?.message || err);
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
