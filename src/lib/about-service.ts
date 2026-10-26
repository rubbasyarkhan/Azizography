import { db, isFirebaseConfigured } from "./firebase";
import { doc, getDoc, setDoc, onSnapshot } from "firebase/firestore";
import { uploadImageFile } from "./gallery-service";

export interface ClientItem {
  id: string;
  name: string;
  imageUrl: string;
  category?: string;
}

export interface AboutExhibition {
  year: string;
  title: string;
  venue: string;
  type: string;
}

export interface AboutContent {
  portraitImageUrl: string;
  locationBadge: string;
  headline: string;
  bioParagraph1: string;
  bioParagraph2: string;
  clients: ClientItem[];
  selectedClients?: string[];
  exhibitions?: AboutExhibition[];
  updatedAt?: string;
}

export const DEFAULT_MOCK_CLIENT_IDS = new Set<string>([
  "vogue",
  "rolling-stone",
  "gq-magazine",
  "wired",
  "netflix",
  "marie-claire",
  "fast-company",
  "billboard",
  "sony-music",
  "coachella",
  "universal-music",
  "leica-archive",
]);

export const DEFAULT_CLIENT_ITEMS: ClientItem[] = [];

export const DEFAULT_ABOUT_CONTENT: AboutContent = {
  portraitImageUrl: "",
  locationBadge: "AZIZ // KARACHI, PAKISTAN",
  headline: "Documenting live visual stories, monographs, and portraiture.",
  bioParagraph1: "Aziz is an editorial and portrait photographer documenting stories with authentic emotion and natural geometry.",
  bioParagraph2: "",
  clients: [],
  selectedClients: [],
};

const LOCAL_STORAGE_KEY = "azizography_about_content_v4";
let cachedContent: AboutContent | null = null;

function normalizeClientList(parsed: Partial<AboutContent>): ClientItem[] {
  if (Array.isArray(parsed.clients) && parsed.clients.length > 0) {
    return parsed.clients
      .filter((c) => !DEFAULT_MOCK_CLIENT_IDS.has((c.id || "").toLowerCase()))
      .map((c, idx) => ({
        id: c.id || `client-${idx}-${Date.now()}`,
        name: c.name || "CLIENT",
        category: c.category || "Editorial",
        imageUrl: c.imageUrl || "",
      }));
  }

  return [];
}

export function getLocalAboutContent(): AboutContent {
  if (typeof window === "undefined") {
    return DEFAULT_ABOUT_CONTENT;
  }

  if (cachedContent !== null) {
    return cachedContent;
  }

  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) {
      // Also check legacy key
      const legacyRaw = localStorage.getItem("azizography_about_content_v2");
      if (legacyRaw) {
        const legacyParsed = JSON.parse(legacyRaw);
        const migrated: AboutContent = {
          ...DEFAULT_ABOUT_CONTENT,
          ...legacyParsed,
          clients: normalizeClientList(legacyParsed),
        };
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(migrated));
        cachedContent = migrated;
        return cachedContent;
      }

      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(DEFAULT_ABOUT_CONTENT));
      cachedContent = { ...DEFAULT_ABOUT_CONTENT };
      return cachedContent;
    }
    const parsed: Partial<AboutContent> = JSON.parse(raw);
    cachedContent = {
      ...DEFAULT_ABOUT_CONTENT,
      ...parsed,
      clients: normalizeClientList(parsed),
    };
    return cachedContent;
  } catch (err) {
    console.error("Error reading local about content:", err);
    cachedContent = { ...DEFAULT_ABOUT_CONTENT };
    return cachedContent;
  }
}

export function saveLocalAboutContent(content: AboutContent): void {
  if (typeof window === "undefined") return;
  cachedContent = content;
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(content));
    window.dispatchEvent(new CustomEvent("about_content_updated", { detail: content }));
  } catch (err) {
    console.error("Error saving local about content:", err);
  }
}

export function subscribeToAboutContent(callback: (content: AboutContent) => void): () => void {
  // 1. Immediately emit current local or cached content
  callback(getLocalAboutContent());

  // 2. Listen to local window updates across components
  const handleLocalUpdate = (e: Event) => {
    const customEvent = e as CustomEvent<AboutContent>;
    if (customEvent.detail) {
      callback(customEvent.detail);
    }
  };
  if (typeof window !== "undefined") {
    window.addEventListener("about_content_updated", handleLocalUpdate);
  }

  // 3. Listen to Firestore real-time updates if connected
  let unsubFirestore: (() => void) | null = null;
  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, "site_content", "about");
      unsubFirestore = onSnapshot(
        docRef,
        (snap) => {
          if (snap.exists()) {
            const data = snap.data() as Partial<AboutContent>;
            const merged: AboutContent = {
              ...DEFAULT_ABOUT_CONTENT,
              ...data,
              clients: normalizeClientList(data),
            };
            saveLocalAboutContent(merged);
            callback(merged);
          }
        },
        (err) => {
          console.warn("Firestore about notice (using local storage fallback):", err?.message || err);
          callback(getLocalAboutContent());
        }
      );
    } catch (err) {
      console.warn("Could not attach Firestore about listener:", err);
    }
  }

  return () => {
    if (typeof window !== "undefined") {
      window.removeEventListener("about_content_updated", handleLocalUpdate);
    }
    if (unsubFirestore) {
      try {
        unsubFirestore();
      } catch (unsubErr) {
        console.debug("Firestore about unsubscribe suppressed:", unsubErr);
      }
    }
  };
}

export async function saveAboutContent(updates: Partial<AboutContent>): Promise<AboutContent> {
  const current = getLocalAboutContent();
  const updated: AboutContent = {
    ...current,
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  saveLocalAboutContent(updated);

  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, "site_content", "about");
      await setDoc(docRef, updated, { merge: true });
    } catch (err) {
      console.warn("Firestore about update pending rules authorization. Content saved in local cache:", err);
    }
  }

  return updated;
}

export async function uploadAboutPortrait(file: File): Promise<string> {
  const result = await uploadImageFile(file);
  return result.imageUrl;
}

export async function uploadClientImage(file: File): Promise<string> {
  const result = await uploadImageFile(file);
  return result.imageUrl;
}
