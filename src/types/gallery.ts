export type GalleryCategory = 'people' | 'events' | 'concerts' | 'singers' | 'weddings' | string;

export interface GalleryItem {
  id: string;
  title: string;
  category: GalleryCategory;
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
  instagramUrl?: string; // Direct link to Instagram post / reel for "View and comment on Instagram"
}

export interface AdminUser {
  email: string;
  uid: string;
  isAuthenticated: boolean;
  role?: string;
}
