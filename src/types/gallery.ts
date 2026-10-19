export type GalleryCategory = 'events' | 'concerts' | 'singers' | 'weddings';

export interface GalleryItem {
  id: string;
  title: string;
  category: GalleryCategory;
  imageUrl: string;
  storagePath: string;
  orderIndex: number; // Dictates layout position on public gallery and admin board
  isFeatured: boolean;
  isVisible: boolean;
  createdAt: string; // ISO date string
  artist?: string;
  location?: string;
  year?: string;
  aspectRatio?: 'portrait' | 'landscape' | 'square' | 'tall';
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
