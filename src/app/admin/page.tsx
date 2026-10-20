"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth, AuthProvider } from "@/lib/auth-context";
import {
  ArrowRight,
  AlertCircle,
  Loader2,
  ArrowLeft,
} from "lucide-react";

function AdminLoginContent() {
  const router = useRouter();
  const { user, login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      router.push("/admin/dashboard");
    }
  }, [user, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = await login(email, password);
    if (result.success) {
      router.push("/admin/dashboard");
    } else {
      setError(result.error || "Authentication failed. Please verify your credentials.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F0EA] text-[#1C1917] flex flex-col justify-between p-6 sm:p-12 select-none font-admin">
      {/* Top Header */}
      <header className="w-full max-w-5xl mx-auto flex items-center justify-between pb-6 border-b border-[#DDD6CA]">
        <Link href="/" className="flex items-center gap-2.5 group">
          <span className="text-lg font-bold tracking-wider text-[#1C1917] uppercase group-hover:text-stone-600 transition-colors">
            AZIZOGRAPHY
          </span>
          <span className="text-sm text-stone-500 font-mono font-medium">/ STUDIO</span>
        </Link>

        <Link
          href="/"
          className="flex items-center gap-2 text-sm font-semibold text-stone-600 hover:text-[#1C1917] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Portfolio</span>
        </Link>
      </header>

      {/* Main Login Card with Offwhite Cream Pearl styling */}
      <main className="w-full max-w-md mx-auto my-auto py-10">
        <div className="bg-[#FAF7F2] border border-[#DDD6CA] p-8 sm:p-10 shadow-sm rounded-2xl">
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-[#1C1917] tracking-tight">
              Sign in
            </h1>
            <p className="text-base text-stone-600 mt-2 leading-relaxed">
              Azizography Curator Studio
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2.5 rounded-lg">
              <AlertCircle className="w-5 h-5 shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-stone-800 mb-2">
                Email Address
              </label>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@domain.com"
                className="w-full bg-[#F4F0EA] border border-[#DDD6CA] px-4 py-3 text-base text-[#1C1917] placeholder:text-stone-400 focus:outline-none focus:border-[#1C1917] rounded-lg transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-stone-800 mb-2">
                Password
              </label>
              <input
                required
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-[#F4F0EA] border border-[#DDD6CA] px-4 py-3 text-base text-[#1C1917] placeholder:text-stone-400 focus:outline-none focus:border-[#1C1917] rounded-lg transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-5 bg-[#1C1917] hover:bg-[#292524] text-[#FAF7F2] font-semibold text-base flex items-center justify-center gap-2.5 transition-colors mt-7 disabled:opacity-50 cursor-pointer rounded-lg shadow-sm"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#FAF7F2]" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign in</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </main>

      {/* Minimal Footer */}
      <footer className="w-full max-w-5xl mx-auto pt-6 border-t border-[#DDD6CA] flex items-center justify-between text-sm text-stone-500 font-mono">
        <span>AZIZOGRAPHY STUDIO</span>
        <span>2026</span>
      </footer>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <AuthProvider>
      <AdminLoginContent />
    </AuthProvider>
  );
}
