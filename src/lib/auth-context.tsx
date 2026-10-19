"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { auth, isFirebaseConfigured } from "./firebase";
import {
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User,
} from "firebase/auth";

interface AuthContextType {
  user: { email: string; uid: string } | null;
  loading: boolean;
  isAdmin: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  isFirebaseActive: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isAdmin: false,
  login: async () => ({ success: false }),
  logout: async () => {},
  isFirebaseActive: false,
});

const DEFAULT_ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL || "admin@azizograhy.com";
const DEFAULT_ADMIN_PASS = "azizography123";
const AUTH_STORAGE_KEY = "azizography_auth_session";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<{ email: string; uid: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If Firebase Auth is active
    if (isFirebaseConfigured && auth) {
      const unsubscribe = onAuthStateChanged(auth, (firebaseUser: User | null) => {
        if (firebaseUser && firebaseUser.email) {
          setUser({ email: firebaseUser.email, uid: firebaseUser.uid });
        } else {
          // Check if local mock session exists
          checkLocalSession();
        }
        setLoading(false);
      });
      return () => unsubscribe();
    } else {
      checkLocalSession();
      setLoading(false);
    }
  }, []);

  const checkLocalSession = () => {
    try {
      const session = sessionStorage.getItem(AUTH_STORAGE_KEY);
      if (session) {
        const parsed = JSON.parse(session);
        setUser(parsed);
      }
    } catch (e) {
      console.error("Failed to parse auth session", e);
    }
  };

  const login = async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    // If live Firebase auth is configured
    if (isFirebaseConfigured && auth) {
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, pass);
        const u = {
          email: userCredential.user.email || email,
          uid: userCredential.user.uid,
        };
        setUser(u);
        sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(u));
        return { success: true };
      } catch (err: unknown) {
        const error = err as Error;
        console.warn("Firebase sign in error, evaluating demo bypass:", error);
        // If credentials match default credentials, allow demo access
        if (
          email.toLowerCase().trim() === DEFAULT_ADMIN_EMAIL.toLowerCase().trim() &&
          pass === DEFAULT_ADMIN_PASS
        ) {
          const demoUser = { email: DEFAULT_ADMIN_EMAIL, uid: "demo-admin-uid-99" };
          setUser(demoUser);
          sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(demoUser));
          return { success: true };
        }
        return { success: false, error: error.message || "Invalid credentials" };
      }
    }

    // Local Mock / Demo Auth
    if (
      email.toLowerCase().trim() === DEFAULT_ADMIN_EMAIL.toLowerCase().trim() &&
      pass === DEFAULT_ADMIN_PASS
    ) {
      const demoUser = { email: DEFAULT_ADMIN_EMAIL, uid: "demo-admin-uid-99" };
      setUser(demoUser);
      sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(demoUser));
      return { success: true };
    }

    return {
      success: false,
      error: "Invalid email or password. Use default: admin@azizograhy.com / azizography123",
    };
  };

  const logout = async () => {
    if (isFirebaseConfigured && auth) {
      try {
        await firebaseSignOut(auth);
      } catch (err) {
        console.error("Sign out error", err);
      }
    }
    sessionStorage.removeItem(AUTH_STORAGE_KEY);
    setUser(null);
  };

  const isAdmin = Boolean(
    user && user.email.toLowerCase().trim() === DEFAULT_ADMIN_EMAIL.toLowerCase().trim()
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAdmin,
        login,
        logout,
        isFirebaseActive: isFirebaseConfigured,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
