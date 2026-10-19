"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth, AuthProvider } from "@/lib/auth-context";
import { Lock, ArrowRight, ShieldCheck, Sparkles, AlertCircle, Loader2 } from "lucide-react";

function AdminLoginContent() {
  const router = useRouter();
  const { user, login, isFirebaseActive } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      router.push("/admin/dashboard");
    }
  }, [user, router]);

  const handleFillDefaults = () => {
    setEmail("admin@azizography.com");
    setPassword("azizography123");
    setError(null);
  };

  const handleInstantDemoLogin = async () => {
    setLoading(true);
    setError(null);
    setEmail("admin@azizography.com");
    setPassword("azizography123");
    const result = await login("admin@azizography.com", "azizography123");
    if (result.success) {
      router.push("/admin/dashboard");
    } else {
      setError(result.error || "Authentication failed.");
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = await login(email, password);
    if (result.success) {
      router.push("/admin/dashboard");
    } else {
      setError(result.error || "Authentication failed. Check credentials.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070707] text-[#f5f5f7] flex flex-col justify-between p-6 md:p-12 font-mono-brutal select-none">
      {/* Top Header */}
      <div className="flex items-center justify-between text-xs border-b border-white/10 pb-4">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-2.5 h-2.5 bg-red-600 group-hover:scale-125 transition-transform" />
          <span className="font-display font-black text-sm uppercase text-white tracking-wider">
            AZIZOGRAPHY
          </span>
        </Link>

        <div className="flex items-center gap-3 text-[11px] text-neutral-400">
          <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
          <span>PORTAL GATEWAY // V2026</span>
        </div>
      </div>

      {/* Main Login Card */}
      <div className="w-full max-w-md mx-auto my-12 bg-[#111111] border border-white/15 p-8 shadow-2xl">
        <div className="mb-6">
          <div className="flex items-center gap-2 text-[10px] text-red-500 font-bold uppercase tracking-widest mb-1">
            <Lock className="w-3.5 h-3.5" />
            <span>SECURE ACCESS ONLY</span>
          </div>
          <h1 className="font-display text-3xl font-extrabold uppercase text-white tracking-tight">
            ADMIN PORTAL
          </h1>
          <p className="text-neutral-400 text-xs mt-1">
            Sign in to manage gallery ordering, upload tour imagery, and control layout settings.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-950/40 border border-red-500 text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4 text-xs">
          <div>
            <label className="block text-[10px] uppercase text-neutral-400 tracking-wider mb-1">
              Admin Email
            </label>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@azizography.com"
              className="w-full bg-[#181818] border border-white/10 px-3 py-2.5 text-white placeholder:text-neutral-600 focus:outline-none focus:border-white text-xs"
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase text-neutral-400 tracking-wider mb-1">
              Password
            </label>
            <input
              required
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full bg-[#181818] border border-white/10 px-3 py-2.5 text-white placeholder:text-neutral-600 focus:outline-none focus:border-white text-xs"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-red-600 hover:bg-red-500 text-white font-display font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all mt-4 disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>AUTHENTICATING...</span>
              </>
            ) : (
              <>
                <span>ENTER CANVAS DASHBOARD</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Demo Credentials Quick Fill & 1-Click Login */}
        <div className="mt-6 pt-6 border-t border-white/10 space-y-3">
          <button
            type="button"
            onClick={handleInstantDemoLogin}
            disabled={loading}
            className="w-full py-2.5 bg-white/10 hover:bg-white text-white hover:text-black font-mono text-[11px] uppercase tracking-wider font-bold transition-all border border-white/20 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>1-Click Instant Demo Login</span>
          </button>

          <div className="p-3 bg-black/60 border border-white/10 font-mono text-[10px] text-neutral-300 space-y-1">
            <div>
              <span className="text-neutral-500">EMAIL:</span> admin@azizography.com
            </div>
            <div>
              <span className="text-neutral-500">PASS:</span> azizography123
            </div>
          </div>

          <div className="flex items-center gap-2 text-[10px] text-neutral-500">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span>
              {isFirebaseActive ? "Connected to live Firebase Auth" : "Running in Zero-Config Demo Mode"}
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Footer info */}
      <div className="text-center text-[10px] text-neutral-600 uppercase tracking-widest">
        AZIZOGRAPHY SECURE CMS // JIRA DND ENGINE // V1.0
      </div>
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
