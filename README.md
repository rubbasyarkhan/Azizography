# AZIZOGRAPHY // Editorial, Concert & Tour Photography Archive

A modern, high-performance photographer portfolio and curator studio built with Next.js 16, React 19, Tailwind CSS, Lenis momentum smooth scrolling, and Firebase Firestore / Cloud Storage.

Designed for live arena tours, vocalist spotlights, high-fashion editorial commissions, and cinematic portrait archives.

---

## Architecture & Tech Stack

- **Framework:** Next.js (App Router, React 19, TypeScript, Turbopack)
- **Styling:** Tailwind CSS with custom editorial typography scales
- **Smooth Momentum Scrolling:** Lenis with nested scroll container prevention (`[data-lenis-prevent]`)
- **Drag-and-Drop Sequencing:** `@dnd-kit` (Grid & Category Kanban curation boards)
- **Database & Storage:** Firebase Firestore Database & Firebase Cloud Storage
- **Client-Side Optimization:** Canvas-based automatic WebP compression (80–90% file size reduction before upload)
- **Typography:**
  - Display & Headlines: **Playfair Display**, **Syne**, **Cinzel**
  - Refined Serif & Editorial: **Cormorant Garamond**
  - Monospace & System UI: **Space Grotesk**, **Inter**

---

## Key Features

### 1. Interactive Editorial Archive & Gallery
- **Dynamic Masonry Grid:** Responsive columns adapting smoothly from mobile phones to ultra-wide displays.
- **Categorized Exhibitions:** Filter dynamically by **Portraits & People**, **Live & Concerts**, **Vocalists & Singers**, **Weddings & Ceremonies**, and **Festivals & Events**.
- **Live Search & Tags:** Real-time text search indexing photograph titles, series, artist names, captions, locations, and EXIF tags.
- **Instagram Post Integration:** Photographs can feature direct links to live Instagram posts or reels. Visitors can click **"View and comment on Instagram ↗"** directly from image captions, desktop hover overlays, or within the full lightbox.

### 2. Full-Screen Interactive Lightbox & Carousel
- Zero-latency hero preview transitioning into an interactive WebGL liquid carousel.
- Full gestures, drag momentum, and mouse-wheel navigation.
- Floating metadata and direct jump to Instagram comments in a new tab.
- Accessible keyboard controls (<kbd>ESC</kbd> to close, arrow keys for navigation).

### 3. Selected Clients & Interactive Hover Cursor
- **2-in-a-Row Grid:** Clean two-column editorial layout for publication and brand commissions.
- **Interactive Cursor Follower:** On desktop, hovering over any publication row reveals a floating photograph that follows the mouse cursor, dynamically cross-fading when moving between clients.
- **Touch-Friendly Fallback:** On mobile and tablet screens, clean inline thumbnails render so touch screen users see the imagery seamlessly.

### 4. 24-Blade Iris Aperture Intro Loader
- Mathematical 24-blade camera aperture opening sequence revolving through curated portraits upon first visitor load.
- Persisted session storage so returning visitors bypass the animation unless manually replayed.

### 5. Interactive Mouse Trail
- Velocity-based mouse trail displaying curated photography on cursor movement.

### 6. Curator Admin Portal (`/admin` & `/admin/dashboard`)
- **Authentication Guard:** Secure session authentication using environment-configured administrator credentials or live Firebase Auth.
- **Drag-and-Drop Exhibition Sequencing:** Live reordering via `@dnd-kit` immediately synchronizes display sequence to Firestore and local storage.
- **Client-Side WebP Image Compression:** Automatic compression and conversion of uploaded JPEG/PNG/HEIC files to high-efficiency WebP with compression ratio telemetry.
- **Dedicated About Page Editor:** Modal editor to upload photographer portraits, update hero statements, and manage client publication roster and hover preview photos.
- **Dedicated Iris Aperture Manager:** Visual selector to curate portraits active in the opening aperture animation.

---

## Environment Configuration

Create a `.env.local` file in the project root based on `.env.example`:

```bash
cp .env.example .env.local
```

### Environment Variables Reference

| Variable | Description |
| :--- | :--- |
| `ADMIN_EMAIL` | Administrator login email address for the curator studio (server-side) |
| `ADMIN_PASSWORD` | Administrator login password (server-side) |
| `CONTACT_EMAIL` | Destination email address where contact inquiries are delivered |
| `NEXT_PUBLIC_CONTACT_EMAIL` | Public contact inquiry address displayed on the contact page |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | *(Optional)* Firebase Web API Key |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | *(Optional)* Firebase Auth Domain (`your-app.firebaseapp.com`) |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | *(Optional)* Firebase Project ID |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | *(Optional)* Firebase Cloud Storage Bucket |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | *(Optional)* Firebase Cloud Messaging Sender ID |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | *(Optional)* Firebase Web App ID |
| `NEXT_PUBLIC_ENABLE_FIREBASE_STORAGE` | Set to `true` when Firebase Cloud Storage bucket is initialized |

> **Note:** Azizography runs out-of-the-box in offline/local mode if Firebase keys are omitted. When Firebase keys are provided, it automatically connects to live Firestore and Cloud Storage.

---

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Start Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Build for Production

```bash
npm run build
npm run start
```

---

## License

Private portfolio archive for Azizography. All photography rights reserved by the respective artist.
