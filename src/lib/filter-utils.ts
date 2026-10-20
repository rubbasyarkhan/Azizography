import { GalleryItem } from "@/types/gallery";

export const CATEGORY_DISPLAY_LABELS: Record<string, string> = {
  people: "Portraits & People",
  concerts: "Live & Concerts",
  singers: "Vocalists & Singers",
  weddings: "Weddings & Ceremonies",
  events: "Festivals & Events",
};

/**
 * Normalizes any category string or alias to a canonical key.
 * e.g., "Portraits & People" -> "people", "Live & Concerts" -> "concerts"
 */
export function normalizeCategory(val?: string): string {
  if (!val) return "";
  const v = val.toLowerCase().trim();

  // People & Portraits
  if (
    v === "people" ||
    v === "portraits & people" ||
    v === "portraits" ||
    v === "portrait" ||
    v === "portraiture" ||
    v === "people / editorial" ||
    v === "editorial"
  ) {
    return "people";
  }

  // Concerts & Live Music
  if (
    v === "concerts" ||
    v === "live & concerts" ||
    v === "live" ||
    v === "concert" ||
    v === "tour" ||
    v === "live music"
  ) {
    return "concerts";
  }

  // Singers & Vocalists
  if (
    v === "singers" ||
    v === "vocalists & singers" ||
    v === "vocalists" ||
    v === "singer" ||
    v === "vocalist"
  ) {
    return "singers";
  }

  // Weddings
  if (
    v === "weddings" ||
    v === "weddings & ceremonies" ||
    v === "wedding" ||
    v === "ceremonies" ||
    v === "ceremony"
  ) {
    return "weddings";
  }

  // Events & Festivals
  if (
    v === "events" ||
    v === "festivals & events" ||
    v === "events & festivals" ||
    v === "events and festivals" ||
    v === "festivals" ||
    v === "festival" ||
    v === "event"
  ) {
    return "events";
  }

  return v;
}

/**
 * Returns formatted display label for category
 */
export function getCategoryDisplayLabel(cat: string): string {
  const norm = normalizeCategory(cat);
  if (CATEGORY_DISPLAY_LABELS[norm]) {
    return CATEGORY_DISPLAY_LABELS[norm];
  }
  return cat.charAt(0).toUpperCase() + cat.slice(1);
}

/**
 * Checks if an item matches a filter string (category, tag, series, etc.)
 */
export function itemMatchesFilter(item: GalleryItem, filterValue: string): boolean {
  if (!filterValue || filterValue === "all") return true;

  if (filterValue === "iris") {
    return Boolean(item.isIrisItem);
  }

  if (filterValue === "trail" || filterValue === "footertrail") {
    return Boolean(item.isFooterTrailItem);
  }

  const f = filterValue.toLowerCase().trim();
  const normalizedF = normalizeCategory(f);

  // 1. Match category (both raw and normalized)
  if (item.category) {
    const rawCat = item.category.toLowerCase().trim();
    const normCat = normalizeCategory(item.category);

    if (rawCat === f || normCat === normalizedF) {
      return true;
    }

    const displayLabel = getCategoryDisplayLabel(item.category).toLowerCase().trim();
    if (displayLabel === f || displayLabel === normalizedF) {
      return true;
    }
  }

  // 2. Match series or project name
  if (item.seriesOrProject) {
    const s = item.seriesOrProject.toLowerCase().trim();
    if (s === f || normalizeCategory(s) === normalizedF) {
      return true;
    }
    // Substring match
    if (s.includes(f) || f.includes(s)) {
      return true;
    }
  }

  // 3. Match tags
  if (item.tags && Array.isArray(item.tags)) {
    for (const rawTag of item.tags) {
      const t = rawTag.toLowerCase().trim();
      if (t === f || normalizeCategory(t) === normalizedF) {
        return true;
      }
      if (t.includes(f) || f.includes(t)) {
        return true;
      }
    }
  }

  // 4. Match title
  if (item.title) {
    const title = item.title.toLowerCase().trim();
    if (title === f || title.includes(f)) {
      return true;
    }
  }

  // 5. Match description
  if (item.description) {
    const desc = item.description.toLowerCase().trim();
    if (desc === f || desc.includes(f)) {
      return true;
    }
  }

  // 6. Match artist
  if (item.artist) {
    const art = item.artist.toLowerCase().trim();
    if (art === f || art.includes(f)) {
      return true;
    }
  }

  return false;
}

/**
 * Checks if an item matches a search text query across all metadata fields
 */
export function itemMatchesSearch(item: GalleryItem, query: string): boolean {
  if (!query || !query.trim()) return true;

  const q = query.toLowerCase().trim();

  if (item.title && item.title.toLowerCase().includes(q)) return true;
  if (item.seriesOrProject && item.seriesOrProject.toLowerCase().includes(q)) return true;
  if (item.artist && item.artist.toLowerCase().includes(q)) return true;
  if (item.location && item.location.toLowerCase().includes(q)) return true;
  if (item.category && item.category.toLowerCase().includes(q)) return true;
  if (item.description && item.description.toLowerCase().includes(q)) return true;

  const displayCat = getCategoryDisplayLabel(item.category).toLowerCase();
  if (displayCat.includes(q)) return true;

  if (item.tags && Array.isArray(item.tags)) {
    for (const tag of item.tags) {
      if (tag.toLowerCase().includes(q)) return true;
    }
  }

  return false;
}
