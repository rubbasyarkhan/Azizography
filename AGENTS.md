<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Mandatory Architecture & Code Quality Rules

### 1. Firebase Firestore Initialization & Transport Stability
* **Never enable `experimentalAutoDetectLongPolling: true` or unstable polling flags** in `initializeFirestore()`.
* **Always initialize Firestore via standard `getFirestore(app)`** using native WebSockets/WebChannels over HTTPS/WSS.
* *Reason*: In Firebase Web SDK 11.x, auto-detect long-polling triggers a known internal state race condition that crashes the client async queue with:
  `FIRESTORE INTERNAL ASSERTION FAILED: Unexpected state (ID: ca9) CONTEXT: {"ve":-1}`.

### 2. Resilient Real-Time Snapshot Listeners & Teardown Cleanups
* **Every Firestore `onSnapshot` unsubscription function (`unsub()`) MUST be wrapped in a `try...catch` block.**
  During rapid React 19 lifecycle changes, route navigation, or hot reloads, calling an unsubscription on a transitioning or faulted stream will crash the app with uncaught error `ID: b815` unless caught.
* **Always supply an explicit error callback to `onSnapshot`** that logs a warning and falls back gracefully to localStorage or in-memory cache instead of throwing unhandled promise rejections.

