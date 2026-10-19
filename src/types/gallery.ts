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
  createdAt: string; // ISO date string
  artist?: string;
  location?: string;
  year?: string;
  aspectRatio?: 'portrait' | 'landscape' | 'square' | 'tall';
  width?: number;
  height?: number;
  exif?: {
    camera?: string;
    lens?: string;
    iso?: string;
    aperture?: string;
    shutter?: string;
  };
  tags?: string[];
}

export interface AdminUser {
  email: string;
  uid: string;
  isAuthenticated: boolean;
  role?: string;
}
