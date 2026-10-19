import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import { getStorage, FirebaseStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Check if valid Firebase credentials have been configured
export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.projectId &&
  firebaseConfig.apiKey !== "your_api_key_here" &&
  firebaseConfig.apiKey.length > 10
);

// Only initialize Firebase Cloud Storage if explicitly enabled
// Prevents preflight 404 & CORS errors when Cloud Storage is not enabled on free tier
export const isStorageEnabled = process.env.NEXT_PUBLIC_ENABLE_FIREBASE_STORAGE === "true";

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let storage: FirebaseStorage | null = null;

if (typeof window !== "undefined" || isFirebaseConfigured) {
  try {
    if (isFirebaseConfigured) {
      app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
      auth = getAuth(app);
      db = getFirestore(app);
      if (isStorageEnabled) {
        try {
          storage = getStorage(app);
        } catch (storageErr) {
          console.warn("Firebase Storage is not enabled; using URL-based images:", storageErr);
        }
      }
    }
  } catch (err) {
    console.warn("Firebase initialization warning (falling back to demo mode):", err);
  }
}

export { app, auth, db, storage };
