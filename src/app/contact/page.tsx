"use client";

import React, { useState, useEffect } from "react";
import { GalleryItem } from "@/types/gallery";
import { subscribeToGalleryItems } from "@/lib/gallery-service";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import SmoothScroll from "@/components/SmoothScroll";
import { AuthProvider } from "@/lib/auth-context";
import { CheckCircle2, Send } from "lucide-react";

function ContactContent() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    projectType: "editorial",
    date: "",
    location: "",
    message: "",
  });

  useEffect(() => {
    const unsub = subscribeToGalleryItems((data) => {
      setItems(data);
    });
    return () => unsub();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 600);
  };

  return (
    <SmoothScroll>
      <main className="min-h-screen bg-[#FAF9F6] text-[#0A0A0A]">
        <div className="flex flex-col lg:flex-row min-h-screen">
          {/* Editorial Left Sidebar (Jessica Chou Style) */}
          <Sidebar items={items} />

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col min-w-0">
            <div className="w-full px-6 sm:px-12 lg:px-20 py-12 lg:py-20 max-w-5xl">
              {/* Header */}
              <div className="pb-12 border-b border-black/[0.08]">
                <span className="text-[11px] font-syne uppercase tracking-[0.28em] text-neutral-400 block mb-2">
                  COMMISSIONS & INQUIRIES
                </span>
                <h1 className="font-artistic text-4xl sm:text-5xl lg:text-6xl font-normal italic text-neutral-950">
                  Contact
                </h1>
                <p className="font-sans text-sm sm:text-base text-neutral-600 mt-3 max-w-2xl leading-relaxed">
                  Available worldwide for editorial assignments, arena tour documentation, commercial campaigns, and private portraiture.
                </p>
              </div>

              {/* Two Column Layout: Form & Direct Representation */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 pt-12">
                {/* Left: Form */}
                <div className="lg:col-span-7">
                  {submitted ? (
                    <div className="p-8 bg-neutral-900 text-white rounded-none space-y-4">
                      <div className="flex items-center gap-2 text-emerald-400">
                        <CheckCircle2 className="w-5 h-5" />
                        <span className="font-sans font-semibold text-sm uppercase tracking-wider">
                          Inquiry Transmitted
                        </span>
                      </div>
                      <h3 className="font-sans text-xl font-medium text-white">
                        Thank you for reaching out, {form.name}.
                      </h3>
                      <p className="font-sans text-xs text-neutral-300 leading-relaxed">
                        We have received your commission inquiry. Our studio or management team will review availability and respond within 24 to 48 hours.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setSubmitted(false);
                          setForm({
                            name: "",
                            email: "",
                            projectType: "editorial",
                            date: "",
                            location: "",
                            message: "",
                          });
                        }}
                        className="mt-4 px-4 py-2 bg-white text-black font-sans text-xs uppercase tracking-widest font-semibold hover:bg-neutral-200 transition-colors cursor-pointer"
                      >
                        Submit Another Message
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div>
                        <label className="block text-[10.5px] font-syne uppercase tracking-[0.2em] text-neutral-500 mb-2">
                          Your Name *
                        </label>
                        <input
                          required
                          type="text"
                          placeholder="e.g. Jane Doe"
                          value={form.name}
                          onChange={(e) => setForm({ ...form, name: e.target.value })}
                          className="w-full bg-transparent border-b border-black/20 focus:border-black py-2.5 text-sm font-sans text-neutral-950 placeholder:text-neutral-400 focus:outline-none transition-colors"
                        />
                      </div>

                      <div>
                        <label className="block text-[10.5px] font-syne uppercase tracking-[0.2em] text-neutral-500 mb-2">
                          Email Address *
                        </label>
                        <input
                          required
                          type="email"
                          placeholder="e.g. jane@publication.com"
                          value={form.email}
                          onChange={(e) => setForm({ ...form, email: e.target.value })}
                          className="w-full bg-transparent border-b border-black/20 focus:border-black py-2.5 text-sm font-sans text-neutral-950 placeholder:text-neutral-400 focus:outline-none transition-colors"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-[10.5px] font-syne uppercase tracking-[0.2em] text-neutral-500 mb-2">
                            Project Type
                          </label>
                          <select
                            value={form.projectType}
                            onChange={(e) => setForm({ ...form, projectType: e.target.value })}
                            className="w-full bg-transparent border-b border-black/20 focus:border-black py-2.5 text-sm font-sans text-neutral-950 focus:outline-none cursor-pointer"
                          >
                            <option value="editorial">Editorial / Magazine</option>
                            <option value="tour">Tour & Live Music</option>
                            <option value="portrait">Commercial / Portraiture</option>
                            <option value="wedding">Weddings & Ceremonies</option>
                            <option value="other">Other Inquiries</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[10.5px] font-syne uppercase tracking-[0.2em] text-neutral-500 mb-2">
                            Proposed Date / Timeline
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Summer 2026 / TBD"
                            value={form.date}
                            onChange={(e) => setForm({ ...form, date: e.target.value })}
                            className="w-full bg-transparent border-b border-black/20 focus:border-black py-2.5 text-sm font-sans text-neutral-950 placeholder:text-neutral-400 focus:outline-none transition-colors"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10.5px] font-syne uppercase tracking-[0.2em] text-neutral-500 mb-2">
                          Location / Venue
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Los Angeles, London, Worldwide"
                          value={form.location}
                          onChange={(e) => setForm({ ...form, location: e.target.value })}
                          className="w-full bg-transparent border-b border-black/20 focus:border-black py-2.5 text-sm font-sans text-neutral-950 placeholder:text-neutral-400 focus:outline-none transition-colors"
                        />
                      </div>

                      <div>
                        <label className="block text-[10.5px] font-syne uppercase tracking-[0.2em] text-neutral-500 mb-2">
                          Project Scope & Details *
                        </label>
                        <textarea
                          required
                          rows={4}
                          placeholder="Tell us about the project, publication, artist, or campaign requirements..."
                          value={form.message}
                          onChange={(e) => setForm({ ...form, message: e.target.value })}
                          className="w-full bg-transparent border-b border-black/20 focus:border-black py-2.5 text-sm font-sans text-neutral-950 placeholder:text-neutral-400 focus:outline-none resize-none transition-colors"
                        />
                      </div>

                      <div className="pt-2">
                        <button
                          type="submit"
                          disabled={loading}
                          className="inline-flex items-center gap-2 px-8 py-3.5 bg-neutral-950 hover:bg-neutral-800 text-white font-syne text-[11px] uppercase tracking-[0.2em] transition-colors cursor-pointer disabled:opacity-50"
                        >
                          <span>{loading ? "Transmitting..." : "Send Commission Inquiry"}</span>
                          <Send className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </form>
                  )}
                </div>

                {/* Right: Direct Representation & Studio Details */}
                <div className="lg:col-span-5 space-y-8 lg:pl-6">
                  <div>
                    <h3 className="font-syne text-[11px] uppercase tracking-[0.28em] text-neutral-400 mb-3">
                      DIRECT INQUIRIES
                    </h3>
                    <a
                      href="mailto:inquiries@azizography.com"
                      className="font-artistic text-2xl font-normal text-neutral-950 hover:opacity-75 transition-opacity block"
                    >
                      inquiries@azizography.com
                    </a>
                    <a
                      href="mailto:studio@azizography.com"
                      className="font-serif-elegant text-[15px] text-neutral-600 hover:text-black transition-colors block mt-1"
                    >
                      studio@azizography.com
                    </a>
                  </div>

                  <div className="border-t border-black/[0.06] pt-6">
                    <h3 className="font-syne text-[11px] uppercase tracking-[0.28em] text-neutral-400 mb-3">
                      STUDIO BASES
                    </h3>
                    <p className="font-serif-elegant text-[15px] text-neutral-800 leading-relaxed">
                      Los Angeles, California<br />
                      New York City, New York<br />
                      <span className="text-neutral-400 text-xs font-mono-brutal uppercase tracking-wider">Available for global tour assignments</span>
                    </p>
                  </div>

                  <div className="border-t border-black/[0.06] pt-6">
                    <h3 className="font-syne text-[11px] uppercase tracking-[0.28em] text-neutral-400 mb-3">
                      MANAGEMENT & SYNDICATION
                    </h3>
                    <p className="font-serif-elegant text-[15px] text-neutral-800 leading-relaxed">
                      Maison Talent Group // London • LA<br />
                      Syndication via Leica Archive
                    </p>
                  </div>

                  <div className="border-t border-black/[0.06] pt-6">
                    <h3 className="font-syne text-[11px] uppercase tracking-[0.28em] text-neutral-400 mb-3">
                      SOCIAL
                    </h3>
                    <div className="flex flex-col space-y-2 text-xs font-syne uppercase tracking-[0.16em]">
                      <a
                        href="https://instagram.com"
                        target="_blank"
                        rel="noreferrer"
                        className="text-neutral-700 hover:text-black transition-colors"
                      >
                        Instagram: @azizography
                      </a>
                      <a
                        href="https://twitter.com"
                        target="_blank"
                        rel="noreferrer"
                        className="text-neutral-700 hover:text-black transition-colors"
                      >
                        Twitter / X: @azizography
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <Footer />
          </div>
        </div>
      </main>
    </SmoothScroll>
  );
}

export default function ContactPage() {
  return (
    <AuthProvider>
      <ContactContent />
    </AuthProvider>
  );
}
