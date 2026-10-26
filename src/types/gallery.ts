export type GalleryCategory = string;

export interface CategoryDefinition {
  id: string;
  name: string; // e.g. "People", "Concerts"
  slug: string; // normalized key e.g. "people", "concerts"
  subcategories: string[]; // e.g. ["Studio", "Stage", "Monograph"]
  description?: string;
  coverImageUrl?: string;
  orderIndex?: number;
  createdAt?: string;
  count?: number;
}

export interface GalleryItem {
  id: string;
  title: string;
  category: GalleryCategory;
  subcategory?: string; // e.g. "Studio", "Stage", "Monograph"
  seriesOrProject?: string; // e.g. "Netflix x The Four Seasons", "Taika Waititi for WIRED", "The Weeknd // After Hours"
  imageUrl: string;
  storagePath: string;
  orderIndex: number; // Dictates layout position on public gallery and admin board
  isFeatured: boolean;
  isVisible: boolean;
  isIrisItem?: boolean; // When true, appears in the Iris loading animation
  isFooterTrailItem?: boolean; // When true, curated for the interactive footer mouse trail
  createdAt: string; // ISO date string
  artist?: string;
  location?: string;
  year?: string;
  aspectRatio?: 'portrait' | 'landscape' | 'square' | 'tall';
  width?: number;
  height?: number;
  blurDataUrl?: string;
  exif?: {
    camera?: string;
    lens?: string;
    iso?: string;
    aperture?: string;
    shutter?: string;
  };
  tags?: string[];
  description?: string;
  instagramUrl?: string; // Direct link to Instagram post / reel for "Like on Instagram"
}

export interface AdminUser {
  email: string;
  uid: string;
  isAuthenticated: boolean;
  role?: string;
}
