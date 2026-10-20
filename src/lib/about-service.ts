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

export const DEFAULT_CLIENT_ITEMS: ClientItem[] = [
  {
    id: "vogue",
    name: "VOGUE",
    category: "High Fashion Editorial",
    imageUrl: "",
  },
  {
    id: "rolling-stone",
    name: "ROLLING STONE",
    category: "Arena Tour & Stage",
    imageUrl: "",
  },
  {
    id: "gq-magazine",
    name: "GQ MAGAZINE",
    category: "Celebrity Portraiture",
    imageUrl: "",
  },
  {
    id: "wired",
    name: "WIRED",
    category: "Visionary & Innovation",
    imageUrl: "",
  },
  {
    id: "netflix",
    name: "NETFLIX",
    category: "Series Campaign & Backstage",
    imageUrl: "",
  },
  {
    id: "marie-claire",
    name: "MARIE CLAIRE",
    category: "Beauty & Haute Couture",
    imageUrl: "",
  },
  {
    id: "fast-company",
    name: "FAST COMPANY",
    category: "Cultural Leadership",
    imageUrl: "",
  },
  {
    id: "billboard",
    name: "BILLBOARD",
    category: "Stadium Headliners",
    imageUrl: "",
  },
  {
    id: "sony-music",
    name: "SONY MUSIC",
    category: "Recording Artist Roster",
    imageUrl: "",
  },
  {
    id: "coachella",
    name: "COACHELLA",
    category: "Festival Live Visuals",
    imageUrl: "",
  },
  {
    id: "universal-music",
    name: "UNIVERSAL MUSIC",
    category: "World Tour Documentation",
    imageUrl: "",
  },
  {
    id: "leica-archive",
    name: "LEICA ARCHIVE",
    category: "Direct-Flash Monograph",
    imageUrl: "",
  },
];

export const DEFAULT_ABOUT_CONTENT: AboutContent = {
  portraitImageUrl: "",
  locationBadge: "AZIZ // LOS ANGELES • NYC • All over Karachi",
  headline: "Documenting live arena energy, intimate backstage honesty, and editorial portraiture.",
  bioParagraph1: "Aziz is an editorial, portrait, and live tour photographer based between Los Angeles and New York City. His work bridges the kinetic atmosphere of world-stadium tours with the quiet authenticity of direct-flash portraiture.",
  bioParagraph2: "Capturing high-profile editorial assignments for WIRED, Marie Claire, Netflix, and Fast Company, as well as official tour photography for leading global musical artists, Aziz prioritizes raw visual truth and natural geometry over digital artifice.",
  clients: DEFAULT_CLIENT_ITEMS,
  selectedClients: DEFAULT_CLIENT_ITEMS.map((c) => c.name),
};

const LOCAL_STORAGE_KEY = "azizography_about_content_v3";
let cachedContent: AboutContent | null = null;

function normalizeClientList(parsed: Partial<AboutContent>): ClientItem[] {
  if (Array.isArray(parsed.clients) && parsed.clients.length > 0) {
    return parsed.clients.map((c, idx) => ({
      id: c.id || `client-${idx}-${Date.now()}`,
      name: c.name || "CLIENT",
      category: c.category || "Editorial",
      imageUrl: c.imageUrl || "",
    }));
  }

  if (Array.isArray(parsed.selectedClients) && parsed.selectedClients.length > 0) {
    return parsed.selectedClients.map((name, idx) => {
      const match = DEFAULT_CLIENT_ITEMS.find((d) => d.name.toLowerCase() === name.toLowerCase());
      return {
        id: match ? match.id : `client-${idx}`,
        name: name.toUpperCase(),
        category: match?.category || "Editorial Publication",
        imageUrl: match?.imageUrl || "",
      };
    });
  }

  return DEFAULT_CLIENT_ITEMS;
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
          console.warn("Firestore about content subscription notice:", err);
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
      unsubFirestore();
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
