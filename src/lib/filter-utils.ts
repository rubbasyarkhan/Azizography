import { GalleryItem } from "@/types/gallery";

export const CATEGORY_DISPLAY_LABELS: Record<string, string> = {};

/**
 * Normalizes any category string or alias to a canonical key.
 * e.g., "Portraits & People" -> "people", "Weddings & Ceremonies" -> "weddings"
 */
export function normalizeCategory(val?: string): string {
  if (!val) return "";
  return val
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Returns formatted display label for category
 */
export function getCategoryDisplayLabel(cat: string): string {
  if (!cat) return "";
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

  // 1.5 Match subcategory
  if (item.subcategory) {
    const sub = item.subcategory.toLowerCase().trim();
    if (sub === f || sub === normalizedF || sub.includes(f) || f.includes(sub)) {
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
  if (item.subcategory && item.subcategory.toLowerCase().includes(q)) return true;
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
