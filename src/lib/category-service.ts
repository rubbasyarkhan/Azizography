import { db, isFirebaseConfigured } from "./firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { GalleryItem } from "@/types/gallery";
import { normalizeCategory, getCategoryDisplayLabel } from "./filter-utils";

export interface CategoryOption {
  key: string;
  label: string;
}

export const BUILT_IN_CATEGORIES: CategoryOption[] = [
  { key: "people", label: "Portraits & People" },
  { key: "concerts", label: "Live & Concerts" },
  { key: "singers", label: "Vocalists & Singers" },
  { key: "weddings", label: "Weddings & Ceremonies" },
  { key: "events", label: "Festivals & Events" },
];

const CUSTOM_CATEGORIES_KEY = "azizography_custom_categories_v2";

export function getCustomCategories(): CategoryOption[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CUSTOM_CATEGORIES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.filter((c) => c && typeof c.key === "string" && typeof c.label === "string");
    }
  } catch (e) {
    console.warn("Could not read custom categories from localStorage:", e);
  }
  return [];
}

export function saveCustomCategories(categories: CategoryOption[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CUSTOM_CATEGORIES_KEY, JSON.stringify(categories));
    window.dispatchEvent(
      new CustomEvent("azizography_categories_update", { detail: categories })
    );
  } catch (e) {
    console.warn("Could not save custom categories to localStorage:", e);
  }

  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, "site_metadata", "categories");
      setDoc(docRef, { list: categories, updatedAt: new Date().toISOString() }, { merge: true }).catch(
        (err) => console.warn("Firestore categories sync notice:", err)
      );
    } catch (err) {
      console.warn("Firestore categories write notice:", err);
    }
  }
}

export async function addCustomCategory(label: string): Promise<CategoryOption> {
  const trimmed = label.trim();
  if (!trimmed) {
    throw new Error("Category name cannot be empty");
  }

  const norm = normalizeCategory(trimmed);
  const key = norm || trimmed.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  const existing = getCustomCategories();
  const alreadyBuiltIn = BUILT_IN_CATEGORIES.some(
    (b) => b.key === key || b.label.toLowerCase() === trimmed.toLowerCase()
  );

  const foundExisting = existing.find(
    (c) => c.key === key || c.label.toLowerCase() === trimmed.toLowerCase()
  );

  if (foundExisting) {
    return foundExisting;
  }
  if (alreadyBuiltIn) {
    return BUILT_IN_CATEGORIES.find((b) => b.key === key)!;
  }

  const newOption: CategoryOption = {
    key,
    label: trimmed,
  };

  const updated = [...existing, newOption];
  saveCustomCategories(updated);
  return newOption;
}

export function getAllCategories(items?: GalleryItem[]): CategoryOption[] {
  const map = new Map<string, CategoryOption>();

  // 1. Built-in
  for (const b of BUILT_IN_CATEGORIES) {
    map.set(b.key, b);
  }

  // 2. Custom stored
  for (const c of getCustomCategories()) {
    if (!map.has(c.key)) {
      map.set(c.key, c);
    }
  }

  // 3. Dynamic from items
  if (items && Array.isArray(items)) {
    for (const item of items) {
      if (item.category) {
        const norm = normalizeCategory(item.category);
        const label = getCategoryDisplayLabel(item.category);
        if (!map.has(norm)) {
          map.set(norm, { key: norm, label });
        }
      }
    }
  }

  return Array.from(map.values());
}

export function subscribeToCategories(
  callback: (cats: CategoryOption[]) => void,
  items?: GalleryItem[]
): () => void {
  if (typeof window === "undefined") {
    callback(getAllCategories(items));
    return () => {};
  }

  const handler = () => {
    callback(getAllCategories(items));
  };

  window.addEventListener("azizography_categories_update", handler);
  callback(getAllCategories(items));

  // Sync from Firestore once if available
  if (isFirebaseConfigured && db) {
    getDoc(doc(db, "site_metadata", "categories"))
      .then((snap) => {
        if (snap.exists() && snap.data()?.list) {
          const remoteList: CategoryOption[] = snap.data().list;
          const localList = getCustomCategories();
          const merged = new Map<string, CategoryOption>();
          for (const c of localList) merged.set(c.key, c);
          for (const c of remoteList) merged.set(c.key, c);
          const finalCustom = Array.from(merged.values());
          localStorage.setItem(CUSTOM_CATEGORIES_KEY, JSON.stringify(finalCustom));
          callback(getAllCategories(items));
        }
      })
      .catch((err) => console.warn("Firestore categories fetch notice:", err));
  }

  return () => {
    window.removeEventListener("azizography_categories_update", handler);
  };
}
