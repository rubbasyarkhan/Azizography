# AZIZOGRAPHY // Next.js Photographer Portfolio & Drag-and-Drop Admin Portal

A full-stack, high-performance photographer portfolio built for a world-touring concert, singer spotlight, and editorial wedding photographer.

Inspired by:
- **Hero & Live Archive Layout:** [Deanie Chen Live](https://deaniechen.com/live)
- **Cinematic Loading Sequence:** [Hollywood Exhibit 2026](https://www.hollywoodexhibit2026.com/)

---

## ⚡ Tech Stack & Architecture

- **Framework:** Next.js (App Router, React 19, TypeScript)
- **Styling & Design System:** Tailwind CSS
- **Animations:** GSAP & Framer Motion (Kinetic Typography, Curtain Reveal, Split-Text)
- **Smooth Momentum Scrolling:** Lenis
- **Drag-and-Drop Engine:** `@dnd-kit` (Jira/ClickUp Kanban & Layout Grid Controller)
- **Database & Storage:** Firebase (Authentication, Firestore Database, Cloud Storage)
- **Typography:**
  - Display: **Syne** & **Space Grotesk**
  - Refined Serif: **Cormorant Garamond** & **Cinzel**
  - Body: **Inter**

---

## 🚀 Key Features

### 1. Cinematic Intro Animation (`/` & `/live`)
- Full-viewport intro sequence inspired by **Hollywood Exhibit 2026**.
- Kinetic typography, audio toggle, and dynamic percentage counter (00% → 100%).
- GSAP dual-curtain split reveal transitioning directly into the Hero showcase without page refresh.
- `sessionStorage` persistence ensures returning visitors in the same session bypass the intro unless manually replayed using the **"Intro"** header button.
- Keyboard shortcut: Press `ESC` to skip intro instantly.

### 2. Live Portfolio Showcase (`/` & `/live`)
- Colossal brutalist typography (`LIVE.`), tour marquee ticker, and live show statistics.
- Dynamic modular masonry grid populated in real-time from Firestore.
- Image sequence strictly governed by the Admin's configured `orderIndex`.
- Filter by category: **Concerts**, **Singers**, **Weddings**, **Events** with dynamic count badges and live search by artist, title, or venue.
- Full-screen **Lightbox Modal** displaying high-resolution imagery and EXIF metadata (Body, Lens, ISO, Aperture, Shutter Speed, Location, Year, Visual Tags).
- Photographer Bio, Tour Rig breakdown, and interactive **Booking Inquiry Form**.

### 3. Dynamic Drag-and-Drop Admin Portal (`/admin` & `/admin/dashboard`)
- **Authentication:**
  - Secure login page with Auth Guard.
  - **Default Credentials:**
    - **Email:** `admin@azizograhy.com`
    - **Password:** `azizography123`
  - Quick **"Click to auto-fill"** helper button for instant testing.
- **Image Uploader Dropzone:**
  - Drag-and-drop file upload with live preview.
  - Direct upload to Firebase Cloud Storage (or optimized base64 local storage).
  - Metadata indexing: Title, Category, Aspect Ratio (Portrait, Tall, Landscape, Square), Artist, Location, Year, EXIF, and Tags.
- **Canvas Controller (`DndBoard`):**
  - **Layout Grid Mode:** Visual sequencing where cards are dragged to dictate exact public display order.
  - **Jira / ClickUp Kanban Mode:** 4-column board categorized by Concerts, Singers, Weddings, and Events.
  - **Real-Time Sync:** Dragging cards immediately updates `orderIndex` and `category` across the live database and public site.
  - **Card Quick Actions:**
    - Toggle Visibility (`Eye` / `EyeOff` to hide/show from public gallery)
    - Toggle Featured status (`Star` badge)
    - Edit Metadata Drawer (modify title, location, EXIF without re-uploading)
    - Delete asset with confirmation
    - Confetti celebration upon saving reordered cards.
  - **Reset to Defaults:** Restore original 12 curated exhibition photos at any time.

---

## 🛠️ Quick Start

### 1. Install & Run Dev Server
```bash
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the live portfolio.

### 2. Access Admin Portal
Navigate to [http://localhost:3000/admin](http://localhost:3000/admin):
- **Email:** `admin@azizograhy.com`
- **Password:** `azizography123`

---

## ☁️ Connecting Live Firebase (Optional)

Azizography works out of the box with zero setup in **Demo Mode**. To link your live Firebase project, create a `.env.local` file with:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

NEXT_PUBLIC_ADMIN_EMAIL=admin@azizograhy.com
```

In the Firebase Console:
1. **Authentication:** Enable Email/Password provider and add `admin@azizograhy.com`.
2. **Firestore Database:** Create database in test mode or with security rules.
3. **Cloud Storage:** Enable Storage bucket for `gallery/*`.
