import { GalleryItem } from "@/types/gallery";
import { INITIAL_GALLERY_ITEMS } from "./seed-data";
import { db, storage, isFirebaseConfigured } from "./firebase";
import { convertAndCompressToWebP } from "./image-utils";
import {
  collection,
  getDocs,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  writeBatch,
  query,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";

const LOCAL_STORAGE_KEY = "azizography_gallery_items_v5";
const DELETED_ITEMS_KEY = "azizography_deleted_item_ids_v1";

// In-memory cache to prevent redundant JSON.parse and sorting on every render
let cachedItems: GalleryItem[] | null = null;

// Helper to track permanently deleted items across sessions and syncs
export function getDeletedItemIds(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(DELETED_ITEMS_KEY);
    if (!raw) return new Set();
    const parsed: string[] = JSON.parse(raw);
    return new Set(parsed);
  } catch {
    return new Set();
  }
}

export function markItemAsDeleted(id: string): void {
  if (typeof window === "undefined") return;
  try {
    const deleted = getDeletedItemIds();
    deleted.add(id);
    localStorage.setItem(DELETED_ITEMS_KEY, JSON.stringify(Array.from(deleted)));
  } catch (err) {
    console.error("Error marking item as deleted:", err);
  }
}

export function clearDeletedTombstones(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(DELETED_ITEMS_KEY);
  } catch (err) {
    console.error("Error clearing deleted tombstones:", err);
  }
}

// Helper to get local items with in-memory caching
export function getLocalItems(): GalleryItem[] {
  if (typeof window === "undefined") {
    return INITIAL_GALLERY_ITEMS;
  }

  const deletedIds = getDeletedItemIds();

  if (cachedItems !== null) {
    return cachedItems.filter((item) => !deletedIds.has(item.id));
  }

  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) {
      const initial = INITIAL_GALLERY_ITEMS.filter((item) => !deletedIds.has(item.id));
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(initial));
      cachedItems = initial;
      return cachedItems;
    }
    const parsed: GalleryItem[] = JSON.parse(raw);
    const valid = parsed
      .filter((item) => !deletedIds.has(item.id))
      .sort((a, b) => a.orderIndex - b.orderIndex);
    cachedItems = valid;
    return cachedItems;
  } catch (err) {
    console.error("Error reading local gallery items:", err);
    cachedItems = INITIAL_GALLERY_ITEMS.filter((item) => !deletedIds.has(item.id));
    return cachedItems;
  }
}

// Helper to save local items and update cache
export function saveLocalItems(items: GalleryItem[]): void {
  cachedItems = items;
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
    window.dispatchEvent(new CustomEvent("azizography_gallery_update", { detail: items }));
  } catch (err) {
    console.error("Error saving local gallery items:", err);
  }
}

// Fetch all gallery items
export async function getGalleryItems(): Promise<GalleryItem[]> {
  const deletedIds = getDeletedItemIds();

  if (isFirebaseConfigured && db) {
    try {
      const q = query(collection(db, "gallery_items"), orderBy("orderIndex", "asc"));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const firestoreItems = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        })) as GalleryItem[];

        // Exclude any permanently deleted items
        const validFirestore = firestoreItems.filter((i) => !deletedIds.has(i.id));
        const localItems = getLocalItems();
        const mergedMap = new Map<string, GalleryItem>();
        for (const item of validFirestore) {
          mergedMap.set(item.id, item);
        }
        for (const item of localItems) {
          if (!mergedMap.has(item.id) && !deletedIds.has(item.id)) {
            mergedMap.set(item.id, item);
          }
        }
        const merged = Array.from(mergedMap.values()).sort((a, b) => {
          if (a.orderIndex !== b.orderIndex) {
            return a.orderIndex - b.orderIndex;
          }
          const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return timeB - timeA;
        });
        saveLocalItems(merged);
        return merged;
      } else {
        // Firestore is active and explicitly empty (all gallery items wiped)
        saveLocalItems([]);
        return [];
      }
    } catch (err) {
      console.warn("Firestore fetch failed, falling back to local storage:", err);
      return getLocalItems();
    }
  }

  return getLocalItems();
}

// Subscribe to real-time updates with optimized memory cleanup
export function subscribeToGalleryItems(callback: (items: GalleryItem[]) => void): () => void {
  if (typeof window === "undefined") {
    return () => {};
  }

  let firestoreUnsubscribe: (() => void) | null = null;

  // Local storage listener
  const handler = () => {
    cachedItems = null; // Invalidate cache on external storage event
    callback(getLocalItems());
  };
  window.addEventListener("azizography_gallery_update", handler);
  window.addEventListener("storage", handler);

  // Initial emit from local
  callback(getLocalItems());

  if (isFirebaseConfigured && db) {
    try {
      const q = query(collection(db, "gallery_items"), orderBy("orderIndex", "asc"));
      firestoreUnsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const deletedIds = getDeletedItemIds();
          if (!snapshot.empty) {
            const firestoreItems = snapshot.docs.map((d) => ({
              id: d.id,
              ...d.data(),
            })) as GalleryItem[];

            // Exclude any permanently deleted items
            const validFirestore = firestoreItems.filter((i) => !deletedIds.has(i.id));
            const localItems = getLocalItems();
            const mergedMap = new Map<string, GalleryItem>();
            for (const item of validFirestore) {
              mergedMap.set(item.id, item);
            }
            for (const item of localItems) {
              if (!mergedMap.has(item.id) && !deletedIds.has(item.id)) {
                mergedMap.set(item.id, item);
              }
            }
            const merged = Array.from(mergedMap.values()).sort((a, b) => {
              if (a.orderIndex !== b.orderIndex) {
                return a.orderIndex - b.orderIndex;
              }
              const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
              const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
              return timeB - timeA;
            });
            saveLocalItems(merged);
            callback(merged);
          } else {
            // Live Firestore collection is empty (all gallery items wiped)
            saveLocalItems([]);
            callback([]);
          }
        },
        (error) => {
          console.info(
            "Firestore rules pending deployment in Firebase Console. Operating in local sync mode.",
            error.message
          );
          callback(getLocalItems());
        }
      );
    } catch (err) {
      console.warn("Firestore subscription failed, continuing in local mode:", err);
    }
  }

  return () => {
    if (firestoreUnsubscribe) firestoreUnsubscribe();
    window.removeEventListener("azizography_gallery_update", handler);
    window.removeEventListener("storage", handler);
  };
}

// Helper to get only Iris items (for the Iris loading animation)
export function getIrisItems(): GalleryItem[] {
  const items = getLocalItems();
  const iris = items.filter((i) => i.isIrisItem);
  return iris.length > 0 ? iris : items;
}

// Subscribe to Iris items
export function subscribeToIrisItems(callback: (items: GalleryItem[]) => void): () => void {
  return subscribeToGalleryItems((items) => {
    const iris = items.filter((i) => i.isIrisItem);
    callback(iris.length > 0 ? iris : items);
  });
}

// Helper to get only Footer Trail items (curated by admin)
export function getFooterTrailItems(): GalleryItem[] {
  const items = getLocalItems();
  const trail = items.filter((i) => i.isFooterTrailItem && i.isVisible !== false);
  return trail.length > 0 ? trail : items.filter((i) => i.isVisible !== false);
}

// Subscribe to Footer Trail items
export function subscribeToFooterTrailItems(callback: (items: GalleryItem[]) => void): () => void {
  return subscribeToGalleryItems((items) => {
    const trail = items.filter((i) => i.isFooterTrailItem && i.isVisible !== false);
    callback(trail.length > 0 ? trail : items.filter((i) => i.isVisible !== false));
  });
}

// Update multiple items order
export async function syncGalleryItemsOrder(items: GalleryItem[]): Promise<void> {
  const normalizedItems = items.map((item, index) => ({
    ...item,
    orderIndex: index,
  }));

  saveLocalItems(normalizedItems);

  if (isFirebaseConfigured && db) {
    try {
      const batch = writeBatch(db);
      for (const item of normalizedItems) {
        const itemRef = doc(db, "gallery_items", item.id);
        batch.set(itemRef, item, { merge: true });
      }
      await batch.commit();
    } catch (err) {
      console.warn("Firestore order sync pending rules authorization. Order saved in local storage:", err);
    }
  }
}

// Upload file to Firebase Storage (or convert to WebP data URL fallback)
export async function uploadImageFile(
  file: File
): Promise<{ imageUrl: string; storagePath: string; width?: number; height?: number }> {
  let processedFile = file;
  let webpDataUrl = "";
  let dimensions: { width?: number; height?: number } = {};

  // If already WebP, avoid re-compressing to preserve original visual fidelity
  if (file.type === "image/webp" || file.name.endsWith(".webp")) {
    processedFile = file;
    if (typeof window !== "undefined") {
      try {
        const bmp = await createImageBitmap(file);
        dimensions = { width: bmp.width, height: bmp.height };
        bmp.close();
      } catch {
        try {
          const url = URL.createObjectURL(file);
          const img = new Image();
          await new Promise<void>((resolve) => {
            img.onload = () => {
              dimensions = { width: img.naturalWidth, height: img.naturalHeight };
              URL.revokeObjectURL(url);
              resolve();
            };
            img.onerror = () => {
              URL.revokeObjectURL(url);
              resolve();
            };
            img.src = url;
          });
        } catch {
          // Ignore fallback errors
        }
      }
    }
  } else {
    try {
      const webpResult = await convertAndCompressToWebP(file, {
        maxWidth: 2560,
        maxHeight: 2560,
        quality: 0.90,
      });
      processedFile = webpResult.file;
      webpDataUrl = webpResult.dataUrl;
      dimensions = { width: webpResult.width, height: webpResult.height };
    } catch (convErr) {
      console.warn("Client WebP conversion error, proceeding with original file:", convErr);
    }
  }

  if (isFirebaseConfigured && storage) {
    try {
      const baseName = processedFile.name.replace(/\.[^/.]+$/, "");
      const filename = `${Date.now()}_${baseName}.webp`;
      const storagePath = `gallery/${filename}`;
      const storageRef = ref(storage, storagePath);
      const uploadTask = await uploadBytesResumable(storageRef, processedFile, {
        contentType: "image/webp",
      });
      const imageUrl = await getDownloadURL(uploadTask.ref);
      return { imageUrl, storagePath, ...dimensions };
    } catch (storageErr) {
      console.warn(
        "Firebase Storage upload failed or Cloud Storage is not enabled; using local media storage fallback:",
        storageErr
      );
    }
  }

  // Server-side local upload fallback: saves to /uploads/<filename>.webp as a clean static asset
  try {
    const formData = new FormData();
    formData.append("file", processedFile);
    const res = await fetch("/api/admin/save-media", {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    if (data.success && data.imageUrl) {
      return {
        imageUrl: data.imageUrl,
        storagePath: data.storagePath,
        ...dimensions,
      };
    }
  } catch (saveErr) {
    console.warn("Local media save fallback notice:", saveErr);
  }

  // Fallback: return the compressed WebP data URL directly if server save fails
  if (webpDataUrl) {
    return {
      imageUrl: webpDataUrl,
      storagePath: `local/${processedFile.name}`,
      ...dimensions,
    };
  }

  // Final fallback: convert to base64 data URL
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve({
        imageUrl: reader.result as string,
        storagePath: `local/${file.name}`,
        ...dimensions,
      });
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}

// Deep clean helper to remove any undefined properties that Firestore rejects
function cleanFirestoreData<T extends Record<string, any>>(obj: T): Partial<T> {
  const cleaned: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      if (value !== null && typeof value === "object" && !Array.isArray(value)) {
        const nested = cleanFirestoreData(value);
        if (Object.keys(nested).length > 0) {
          cleaned[key] = nested;
        }
      } else {
        cleaned[key] = value;
      }
    }
  }
  return cleaned as Partial<T>;
}

// Add a new gallery item
export async function createGalleryItem(
  itemData: Omit<GalleryItem, "id" | "createdAt" | "orderIndex">
): Promise<GalleryItem> {
  const currentItems = getLocalItems();
  const newId = `item-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const newItem: GalleryItem = {
    ...itemData,
    id: newId,
    orderIndex: 0, // Put new item at top
    createdAt: new Date().toISOString(),
  };

  const updatedItems = [newItem, ...currentItems].map((item, idx) => ({
    ...item,
    orderIndex: idx,
  }));

  saveLocalItems(updatedItems);

  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, "gallery_items", newId);
      const cleaned = cleanFirestoreData(updatedItems[0]);
      await setDoc(docRef, cleaned);
    } catch (err) {
      console.warn("Firestore document write notice:", err);
    }
  }

  return updatedItems[0];
}

// Add multiple gallery items in one batch preserving sequence (maximum 10 at a time)
export async function createMultipleGalleryItems(
  itemsData: Array<Omit<GalleryItem, "id" | "createdAt" | "orderIndex">>
): Promise<GalleryItem[]> {
  const cappedData = itemsData.slice(0, 10);
  const currentItems = getLocalItems();
  const now = Date.now();
  const newItems: GalleryItem[] = cappedData.map((data, idx) => ({
    ...data,
    id: `item-${now + idx}-${Math.random().toString(36).substring(2, 7)}`,
    orderIndex: idx,
    createdAt: new Date(now + idx * 10).toISOString(),
  }));

  const updatedItems = [...newItems, ...currentItems].map((item, idx) => ({
    ...item,
    orderIndex: idx,
  }));

  saveLocalItems(updatedItems);

  if (isFirebaseConfigured && db) {
    try {
      const batch = writeBatch(db);
      for (const item of newItems) {
        const docRef = doc(db, "gallery_items", item.id);
        const cleaned = cleanFirestoreData(item);
        batch.set(docRef, cleaned);
      }
      await batch.commit();
    } catch (err) {
      console.warn("Firestore batch write notice:", err);
    }
  }

  return newItems;
}

// Update specific gallery item
export async function updateGalleryItem(
  id: string,
  updates: Partial<GalleryItem>
): Promise<void> {
  const currentItems = getLocalItems();
  const updatedItems = currentItems.map((item) =>
    item.id === id ? { ...item, ...updates } : item
  );
  saveLocalItems(updatedItems);

  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, "gallery_items", id);
      const cleaned = cleanFirestoreData(updates);
      await updateDoc(docRef, cleaned);
    } catch (err) {
      console.warn("Firestore update notice:", err);
    }
  }
}

// Delete gallery item permanently (from local storage, server disk, Firebase Storage, and Firestore)
export async function deleteGalleryItem(id: string, itemToDelete?: GalleryItem): Promise<void> {
  // 1. Mark as permanently deleted in tombstones to prevent resurrection on sync
  markItemAsDeleted(id);

  // 2. Identify target item to extract image URL & storage path
  const currentItems = getLocalItems();
  const targetItem = itemToDelete || currentItems.find((item) => item.id === id);

  // 3. Purge immediately from local storage & in-memory cache
  const updatedItems = currentItems
    .filter((item) => item.id !== id)
    .map((item, idx) => ({ ...item, orderIndex: idx }));
  saveLocalItems(updatedItems);

  // 4. Permanently delete media file from server disk (/public/uploads)
  if (targetItem?.imageUrl || targetItem?.storagePath) {
    try {
      await fetch("/api/admin/delete-media", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageUrl: targetItem.imageUrl,
          storagePath: targetItem.storagePath,
        }),
      });
    } catch (mediaErr) {
      console.warn("Could not delete local media file:", mediaErr);
    }
  }

  // 5. Permanently delete from Firebase Cloud Storage if applicable
  if (isFirebaseConfigured && storage && targetItem?.storagePath?.startsWith("gallery/")) {
    try {
      const storageRef = ref(storage, targetItem.storagePath);
      await deleteObject(storageRef);
    } catch (storageErr) {
      console.warn("Could not delete Firebase Storage object:", storageErr);
    }
  }

  // 6. Permanently delete document from Firestore
  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, "gallery_items", id);
      await deleteDoc(docRef);
    } catch (err) {
      console.warn("Firestore delete notice:", err);
    }
  }
}

// Reset gallery items to default seed
export async function resetToDefaultSeed(): Promise<void> {
  clearDeletedTombstones();
  saveLocalItems(INITIAL_GALLERY_ITEMS);

  if (isFirebaseConfigured && db) {
    try {
      const batch = writeBatch(db);
      const existing = await getDocs(collection(db, "gallery_items"));
      existing.forEach((d) => batch.delete(d.ref));
      for (const item of INITIAL_GALLERY_ITEMS) {
        batch.set(doc(db, "gallery_items", item.id), item);
      }
      await batch.commit();
    } catch (err) {
      console.error("Failed to reset Firestore:", err);
    }
  }
}
