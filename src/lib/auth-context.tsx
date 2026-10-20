"use client";

import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from "react";
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

const CONFIGURED_ADMIN_EMAIL = (process.env.NEXT_PUBLIC_ADMIN_EMAIL || "").toLowerCase().trim();
const CONFIGURED_ADMIN_PASS = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "";
const AUTH_STORAGE_KEY = "azizography_auth_session";

const isValidAdmin = (email?: string | null) => {
  if (!email) return false;
  const normalized = email.toLowerCase().trim();
  if (CONFIGURED_ADMIN_EMAIL) {
    return normalized === CONFIGURED_ADMIN_EMAIL;
  }
  return true;
};

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
          // Check if local session exists
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

  const login = useCallback(async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    // 1. If live Firebase auth is configured
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
        // Check environment variable credentials
        if (
          CONFIGURED_ADMIN_EMAIL &&
          CONFIGURED_ADMIN_PASS &&
          email.toLowerCase().trim() === CONFIGURED_ADMIN_EMAIL &&
          pass === CONFIGURED_ADMIN_PASS
        ) {
          const adminUser = { email: email.trim(), uid: "admin-session-active" };
          setUser(adminUser);
          sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(adminUser));
          return { success: true };
        }
        return { success: false, error: error.message || "Invalid email or password." };
      }
    }

    // 2. Local / Environment-Configured Admin Auth
    if (
      CONFIGURED_ADMIN_EMAIL &&
      CONFIGURED_ADMIN_PASS &&
      email.toLowerCase().trim() === CONFIGURED_ADMIN_EMAIL &&
      pass === CONFIGURED_ADMIN_PASS
    ) {
      const adminUser = { email: email.trim(), uid: "admin-session-active" };
      setUser(adminUser);
      sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(adminUser));
      return { success: true };
    }

    return {
      success: false,
      error: "Invalid email or password. Please verify your administrator credentials.",
    };
  }, []);

  const logout = useCallback(async () => {
    if (isFirebaseConfigured && auth) {
      try {
        await firebaseSignOut(auth);
      } catch (err) {
        console.error("Sign out error", err);
      }
    }
    sessionStorage.removeItem(AUTH_STORAGE_KEY);
    setUser(null);
  }, []);

  const isAdmin = Boolean(user && (user.uid === "admin-session-active" || isValidAdmin(user.email)));

  const contextValue = useMemo(
    () => ({
      user,
      loading,
      isAdmin,
      login,
      logout,
      isFirebaseActive: isFirebaseConfigured,
    }),
    [user, loading, isAdmin, login, logout]
  );

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
