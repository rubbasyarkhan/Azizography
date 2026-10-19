import { GalleryItem } from "@/types/gallery";
import { INITIAL_GALLERY_ITEMS } from "./seed-data";
import { db, storage, isFirebaseConfigured } from "./firebase";
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
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

const LOCAL_STORAGE_KEY = "azizography_gallery_items_v1";

// Helper to get local items
export function getLocalItems(): GalleryItem[] {
  if (typeof window === "undefined") {
    return INITIAL_GALLERY_ITEMS;
  }
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_GALLERY_ITEMS));
      return INITIAL_GALLERY_ITEMS;
    }
    const parsed: GalleryItem[] = JSON.parse(raw);
    return parsed.sort((a, b) => a.orderIndex - b.orderIndex);
  } catch (err) {
    console.error("Error reading local gallery items:", err);
    return INITIAL_GALLERY_ITEMS;
  }
}

// Helper to save local items
export function saveLocalItems(items: GalleryItem[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
    // Dispatch custom event to notify components across tabs/pages
    window.dispatchEvent(new CustomEvent("azizography_gallery_update", { detail: items }));
  } catch (err) {
    console.error("Error saving local gallery items:", err);
  }
}

// Fetch all gallery items
export async function getGalleryItems(): Promise<GalleryItem[]> {
  if (isFirebaseConfigured && db) {
    try {
      const q = query(collection(db, "gallery_items"), orderBy("orderIndex", "asc"));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        return snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        })) as GalleryItem[];
      }
      // If Firestore collection is empty, seed it with default items!
      const batch = writeBatch(db);
      for (const item of INITIAL_GALLERY_ITEMS) {
        const itemRef = doc(db, "gallery_items", item.id);
        batch.set(itemRef, item);
      }
      await batch.commit();
      return INITIAL_GALLERY_ITEMS;
    } catch (err) {
      console.warn("Firestore fetch failed, falling back to local storage:", err);
      return getLocalItems();
    }
  }

  return getLocalItems();
}

// Subscribe to real-time updates
export function subscribeToGalleryItems(callback: (items: GalleryItem[]) => void): () => void {
  if (typeof window === "undefined") {
    return () => {};
  }

  if (isFirebaseConfigured && db) {
    try {
      const q = query(collection(db, "gallery_items"), orderBy("orderIndex", "asc"));
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          if (!snapshot.empty) {
            const items = snapshot.docs.map((d) => ({
              id: d.id,
              ...d.data(),
            })) as GalleryItem[];
            callback(items);
          } else {
            callback(getLocalItems());
          }
        },
        (error) => {
          console.warn("Firestore snapshot error, using local listener:", error);
          callback(getLocalItems());
        }
      );
      return unsubscribe;
    } catch {
      // Fallback to local listener
    }
  }

  // Local storage listener
  const handler = () => {
    callback(getLocalItems());
  };
  window.addEventListener("azizography_gallery_update", handler);
  window.addEventListener("storage", handler);

  // Initial emit
  callback(getLocalItems());

  return () => {
    window.removeEventListener("azizography_gallery_update", handler);
    window.removeEventListener("storage", handler);
  };
}

// Update multiple items order and/or category (Jira/Clickup style Drag and drop)
export async function syncGalleryItemsOrder(items: GalleryItem[]): Promise<void> {
  // Update orderIndex according to array index
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
      console.error("Failed to batch update Firestore items:", err);
    }
  }
}

// Upload file to Firebase Storage (or convert to base64 if running locally)
export async function uploadImageFile(file: File): Promise<{ imageUrl: string; storagePath: string }> {
  if (isFirebaseConfigured && storage) {
    const filename = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    const storagePath = `gallery/${filename}`;
    const storageRef = ref(storage, storagePath);
    const uploadTask = await uploadBytesResumable(storageRef, file);
    const imageUrl = await getDownloadURL(uploadTask.ref);
    return { imageUrl, storagePath };
  }

  // Fallback: convert to base64 data URL
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve({
        imageUrl: reader.result as string,
        storagePath: `local/${file.name}`,
      });
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}

// Add a new gallery item
export async function createGalleryItem(
  itemData: Omit<GalleryItem, "id" | "createdAt" | "orderIndex">
): Promise<GalleryItem> {
  const currentItems = getLocalItems();
  const newId = `item-${Date.now()}`;
  const newItem: GalleryItem = {
    ...itemData,
    id: newId,
    orderIndex: currentItems.length,
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
      await setDoc(docRef, newItem);
    } catch (err) {
      console.error("Failed to add doc to Firestore:", err);
    }
  }

  return newItem;
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
      await updateDoc(docRef, updates);
    } catch (err) {
      console.error("Failed to update doc in Firestore:", err);
    }
  }
}

// Delete gallery item
export async function deleteGalleryItem(id: string): Promise<void> {
  const currentItems = getLocalItems();
  const updatedItems = currentItems.filter((item) => item.id !== id);
  saveLocalItems(updatedItems);

  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, "gallery_items", id);
      await deleteDoc(docRef);
    } catch (err) {
      console.error("Failed to delete doc in Firestore:", err);
    }
  }
}

// Reset gallery items to default seed
export async function resetToDefaultSeed(): Promise<void> {
  saveLocalItems(INITIAL_GALLERY_ITEMS);

  if (isFirebaseConfigured && db) {
    try {
      const batch = writeBatch(db);
      // Delete existing
      const existing = await getDocs(collection(db, "gallery_items"));
      existing.forEach((d) => batch.delete(d.ref));
      // Re-add defaults
      for (const item of INITIAL_GALLERY_ITEMS) {
        batch.set(doc(db, "gallery_items", item.id), item);
      }
      await batch.commit();
    } catch (err) {
      console.error("Failed to reset Firestore:", err);
    }
  }
}
