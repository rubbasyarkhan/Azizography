"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { GalleryItem } from "@/types/gallery";
import { subscribeToGalleryItems } from "@/lib/gallery-service";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { AuthProvider } from "@/lib/auth-context";
import { CheckCircle2, Send } from "lucide-react";

function ContactContent() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const submitTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (submitTimerRef.current) clearTimeout(submitTimerRef.current);
    };
  }, []);

  const [needsActivation, setNeedsActivation] = useState(false);
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
    return () => {
      try {
        unsub();
      } catch (e) {
        console.warn("Contact items unsubscribe error:", e);
      }
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Send via local API endpoint which routes to azizfaiq18@gmail.com
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.needsActivation) {
          setNeedsActivation(true);
        }
      } else {
        // Fallback: direct to formsubmit endpoint
        const directRes = await fetch("https://formsubmit.co/ajax/azizfaiq18@gmail.com", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            name: form.name,
            email: form.email,
            projectType: form.projectType,
            date: form.date,
            location: form.location,
            message: form.message,
            _subject: `New Portfolio Commission Inquiry from ${form.name}`,
            _replyto: form.email,
            _captcha: "false",
          }),
        });
        if (directRes.ok) {
          const directData = await directRes.json();
          if (directData?.message?.toLowerCase().includes("activation")) {
            setNeedsActivation(true);
          }
        }
      }
      setSubmitted(true);
    } catch {
      // Emergency fallback: trigger native mailto to azizfaiq18@gmail.com
      const mailtoUrl = `mailto:azizfaiq18@gmail.com?subject=Commission Inquiry - ${encodeURIComponent(form.name)}&body=${encodeURIComponent(
        `Name: ${form.name}\nEmail: ${form.email}\nProject Type: ${form.projectType}\nDate: ${form.date}\nLocation: ${form.location}\n\nMessage:\n${form.message}`
      )}`;
      window.location.href = mailtoUrl;
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen bg-[#FAF9F6] text-[#0A0A0A] flex flex-col">
      {/* Top Navigation Bar: FULL ARCHIVE, ABOUT, CONTACT */}
      <Navbar items={items} />

      <div className="flex-1 flex flex-col lg:flex-row min-w-0">
        <Sidebar items={items} brandName="Azizography." />

        {/* Main Content Area */}
        <div className="flex-1 w-full min-w-0">
          <div className="w-full max-w-5xl px-6 sm:px-12 lg:px-16 py-12 lg:py-20">
            {/* Header */}
            <div className="pb-12 border-b border-[#DDD6CA]">
              <span className="text-[11px] font-syne uppercase tracking-[0.28em] text-[#78716C] block mb-2">
                COMMISSIONS & INQUIRIES
              </span>
              <h1 className="font-artistic text-4xl sm:text-5xl lg:text-6xl font-semibold italic text-[#1C1917]">
                Contact
              </h1>
              <p className="font-sans text-sm sm:text-base text-[#57534E] mt-3 max-w-2xl leading-relaxed">
                Available All over Karachi for editorial assignments, arena tour documentation, commercial campaigns, and private portraiture.
              </p>
            </div>

            {/* Two Column Layout: Form & Direct Representation */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 pt-12">
              {/* Left: Form */}
              <div className="lg:col-span-7">
                {submitted ? (
                  <div className="border border-[#DDD6CA] bg-[#F4F0EA]/60 p-8 sm:p-12 space-y-8 animate-fade-in">
                    <div className="space-y-3 pb-6 border-b border-[#DDD6CA]">
                      <span className="text-[11px] font-syne uppercase tracking-[0.28em] text-[#78716C] block">
                        INQUIRY TRANSMITTED
                      </span>
                      <h2 className="font-artistic text-3xl sm:text-4xl lg:text-5xl font-semibold italic text-[#1C1917]">
                        Thank you, {form.name || "Client"}.
                      </h2>
                      <p className="font-sans text-sm sm:text-base text-[#57534E] leading-relaxed max-w-xl pt-1">
                        Your commission inquiry has been delivered directly to{" "}
                        <span className="font-semibold text-[#1C1917]">azizfaiq18@gmail.com</span>.
                        Our studio will review availability and respond within 24 to 48 hours.
                      </p>

                      {needsActivation && (
                        <div className="mt-4 p-4 border border-[#B45309]/30 bg-[#FEF3C7]/40 text-[#92400E] text-xs sm:text-[13px] font-sans leading-relaxed">
                          <strong className="font-semibold block uppercase tracking-wider font-syne text-[10.5px] text-[#78350F] mb-1">
                            Action Required For azizfaiq18@gmail.com:
                          </strong>
                          FormSubmit has dispatched a one-time activation email to your Gmail address. Please open <strong>azizfaiq18@gmail.com</strong> (check Spam / Junk / Promotions if not in Primary) and click the <strong>&quot;Activate Form&quot;</strong> button to begin receiving all commission inquiries immediately.
                        </div>
                      )}
                    </div>

                    {/* Editorial Metadata Receipt */}
                    <div className="space-y-3">
                      <span className="text-[10px] font-syne uppercase tracking-[0.25em] text-[#78716C] block">
                        SUMMARY OF DETAILS
                      </span>
                      <div className="divide-y divide-[#DDD6CA]/70 text-xs sm:text-sm font-sans">
                        <div className="py-2.5 flex justify-between items-baseline">
                          <span className="text-[#78716C] uppercase tracking-wider text-[11px] font-syne">Project</span>
                          <span className="text-[#1C1917] font-medium capitalize">{form.projectType}</span>
                        </div>
                        <div className="py-2.5 flex justify-between items-baseline">
                          <span className="text-[#78716C] uppercase tracking-wider text-[11px] font-syne">Email</span>
                          <span className="text-[#1C1917] font-medium">{form.email}</span>
                        </div>
                        {form.date && (
                          <div className="py-2.5 flex justify-between items-baseline">
                            <span className="text-[#78716C] uppercase tracking-wider text-[11px] font-syne">Date</span>
                            <span className="text-[#1C1917] font-medium">{form.date}</span>
                          </div>
                        )}
                        {form.location && (
                          <div className="py-2.5 flex justify-between items-baseline">
                            <span className="text-[#78716C] uppercase tracking-wider text-[11px] font-syne">Location</span>
                            <span className="text-[#1C1917] font-medium">{form.location}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Clean Minimalist Actions */}
                    <div className="flex flex-wrap items-center gap-5 pt-2">
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
                        className="px-6 py-3 bg-[#1C1917] hover:bg-[#292524] text-[#FAF7F2] font-syne text-[11px] uppercase tracking-[0.2em] transition-colors cursor-pointer"
                      >
                        Submit Another Message
                      </button>

                      <a
                        href="mailto:azizfaiq18@gmail.com"
                        className="font-syne text-[11px] uppercase tracking-[0.2em] text-[#78716C] hover:text-[#1C1917] transition-colors underline underline-offset-4"
                      >
                        Direct Email
                      </a>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <label className="block text-[10.5px] font-syne uppercase tracking-[0.2em] text-[#78716C] mb-2">
                        Your Name *
                      </label>
                      <input
                        required
                        type="text"
                        placeholder="e.g. Jane Doe"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="w-full bg-transparent border-b border-[#DDD6CA] focus:border-[#1C1917] py-2.5 text-sm font-sans text-[#1C1917] placeholder:text-[#78716C] focus:outline-none transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-[10.5px] font-syne uppercase tracking-[0.2em] text-[#78716C] mb-2">
                        Email Address *
                      </label>
                      <input
                        required
                        type="email"
                        placeholder="e.g. jane@publication.com"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        className="w-full bg-transparent border-b border-[#DDD6CA] focus:border-[#1C1917] py-2.5 text-sm font-sans text-[#1C1917] placeholder:text-[#78716C] focus:outline-none transition-colors"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-[10.5px] font-syne uppercase tracking-[0.2em] text-[#78716C] mb-2">
                          Project Type
                        </label>
                        <select
                          value={form.projectType}
                          onChange={(e) => setForm({ ...form, projectType: e.target.value })}
                          className="w-full bg-transparent border-b border-[#DDD6CA] focus:border-[#1C1917] py-2.5 text-sm font-sans text-[#1C1917] focus:outline-none cursor-pointer"
                        >
                          <option value="editorial">Editorial / Magazine</option>
                          <option value="tour">Tour & Live Music</option>
                          <option value="portrait">Commercial / Portraiture</option>
                          <option value="wedding">Weddings & Ceremonies</option>
                          <option value="other">Other Inquiries</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10.5px] font-syne uppercase tracking-[0.2em] text-[#78716C] mb-2">
                          Proposed Date / Timeline
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Summer 2026 / TBD"
                          value={form.date}
                          onChange={(e) => setForm({ ...form, date: e.target.value })}
                          className="w-full bg-transparent border-b border-[#DDD6CA] focus:border-[#1C1917] py-2.5 text-sm font-sans text-[#1C1917] placeholder:text-[#78716C] focus:outline-none transition-colors"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10.5px] font-syne uppercase tracking-[0.2em] text-[#78716C] mb-2">
                        Location / Venue
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Los Angeles, London, All over Karachi"
                        value={form.location}
                        onChange={(e) => setForm({ ...form, location: e.target.value })}
                        className="w-full bg-transparent border-b border-[#DDD6CA] focus:border-[#1C1917] py-2.5 text-sm font-sans text-[#1C1917] placeholder:text-[#78716C] focus:outline-none transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-[10.5px] font-syne uppercase tracking-[0.2em] text-[#78716C] mb-2">
                        Project Scope & Details *
                      </label>
                      <textarea
                        required
                        rows={4}
                        placeholder="Tell us about the project, publication, artist, or campaign requirements..."
                        value={form.message}
                        onChange={(e) => setForm({ ...form, message: e.target.value })}
                        className="w-full bg-transparent border-b border-[#DDD6CA] focus:border-[#1C1917] py-2.5 text-sm font-sans text-[#1C1917] placeholder:text-[#78716C] focus:outline-none resize-none transition-colors"
                      />
                    </div>

                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={loading}
                        className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#1C1917] hover:bg-[#292524] text-[#FAF7F2] font-syne text-[11px] uppercase tracking-[0.2em] transition-colors cursor-pointer disabled:opacity-50"
                      >
                        <span>{loading ? "Transmitting..." : "Send Commission Inquiry"}</span>
                        <Send className="w-3.5 h-3.5" />
                      </button>
                      <p className="text-xs text-[#78716C] font-sans mt-3">
                        Delivered directly to <span className="font-semibold text-[#1C1917]">azizfaiq18@gmail.com</span>
                      </p>
                    </div>
                  </form>
                )}
              </div>

              {/* Right: Direct Representation & Studio Details */}
              <div className="lg:col-span-5 space-y-8 lg:pl-6">
                <div>
                  <h3 className="font-syne text-[11px] uppercase tracking-[0.28em] text-[#78716C] mb-3">
                    DIRECT INQUIRIES
                  </h3>
                  <a
                    href="mailto:azizfaiq18@gmail.com"
                    className="font-artistic text-2xl font-semibold text-[#1C1917] hover:opacity-75 transition-opacity block"
                  >
                    azizfaiq18@gmail.com
                  </a>
                  <a
                    href="tel:+923112494768"
                    className="font-serif-elegant text-[15px] text-[#57534E] hover:text-[#1C1917] transition-colors block mt-1"
                  >
                    +92 311 2494768
                  </a>
                </div>

                <div className="border-t border-[#DDD6CA] pt-6">
                  <h3 className="font-syne text-[11px] uppercase tracking-[0.28em] text-[#78716C] mb-3">
                    STUDIO BASE
                  </h3>
                  <p className="font-serif-elegant text-[15px] text-[#1C1917] leading-relaxed">
                    Karachi, Pakistan<br />
                    <span className="text-[#78716C] text-xs font-mono-brutal uppercase tracking-wider">Available for All over Karachi & tour assignments</span>
                  </p>
                </div>

                <div className="border-t border-[#DDD6CA] pt-6">
                  <h3 className="font-syne text-[11px] uppercase tracking-[0.28em] text-[#78716C] mb-3">
                    DIRECT SOCIAL
                  </h3>
                  <div className="flex flex-col space-y-2 text-xs font-syne uppercase tracking-[0.16em]">
                    <a
                      href="https://www.instagram.com/faiq.aziz321?obrf=dmNuMWF0YXBkNW84"
                      target="_blank"
                      rel="noreferrer"
                      className="text-[#57534E] hover:text-[#1C1917] transition-colors"
                    >
                      Instagram: @faiq.aziz321
                    </a>
                    <a
                      href="tel:+923112494768"
                      className="text-[#57534E] hover:text-[#1C1917] transition-colors"
                    >
                      Phone: +92 311 2494768
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 100% Full-Width & Section-Height Footer */}
      <Footer />
    </main>
  );
}

export default function ContactPage() {
  return (
    <AuthProvider>
      <Suspense fallback={null}>
        <ContactContent />
      </Suspense>
    </AuthProvider>
  );
}
