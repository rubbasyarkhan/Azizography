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
          // Check if local session exists
          checkLocalSession();
        }
        setLoading(false);
      });
      return () => {
        try {
          unsubscribe();
        } catch {
          // Safe unsubscription cleanup
        }
      };
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
    // 1. If live Firebase auth is configured, attempt Firebase login first
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
      } catch {
        // Fall back to server-side authentication below
      }
    }

    // 2. Server-side admin authentication via secure API endpoint
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: pass }),
      });
      const data = await response.json();

      if (response.ok && data.success && data.user) {
        setUser(data.user);
        sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(data.user));
        return { success: true };
      }

      return {
        success: false,
        error: data.error || "Invalid email or password. Please verify your administrator credentials.",
      };
    } catch (err) {
      console.error("Login verification error", err);
      return {
        success: false,
        error: "Unable to verify credentials. Please check your network connection.",
      };
    }
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

  const isAdmin = Boolean(user && (user.uid === "admin-session-active" || user.email));

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
