"use client";

import React, { useState } from "react";
import Image from "next/image";
import { CheckCircle2 } from "lucide-react";

export default function AboutSection() {
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    projectType: "tour",
    date: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);
  };

  const clients = [
    "BILLIE EILISH",
    "THE WEEKND",
    "DUA LIPA",
    "ROLLING STONE",
    "VOGUE",
    "COACHELLA",
    "GQ MAGAZINE",
    "LEICA ARCHIVE",
    "MET GALA NOIR",
    "BRIXTON ACADEMY",
    "SOFI STADIUM",
    "LAKE COMO CEREMONIES",
  ];

  return (
    <section id="about" className="w-full px-4 sm:px-8 md:px-[60px] py-24 border-t border-black/[0.08] bg-[#F7F6F2]">
      <div className="max-w-7xl mx-auto">
        {/* Two-Column Minimalist Layout (Pearl White Light Theme) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-start">
          {/* Left Column: Portrait & Bio */}
          <div className="lg:col-span-5 space-y-8">
            <div className="relative aspect-[3/4] w-full max-w-sm overflow-hidden bg-neutral-200">
              <Image
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1200&auto=format&fit=crop"
                alt="Aziz Profile"
                fill
                sizes="(max-width: 768px) 100vw, 400px"
                className="object-cover"
              />
            </div>

            <div className="space-y-4">
              <h2 className="font-sans text-xl sm:text-2xl font-bold uppercase tracking-wider text-black">
                AZIZ // PHOTOGRAPHER
              </h2>
              <p className="font-sans text-xs sm:text-sm text-neutral-600 leading-relaxed max-w-md">
                Los Angeles & New York based concert, artist, and editorial photographer. 
                Documenting live arena stadium energy, intimate backstage moments, editorial portraits, 
                and timeless high-fashion ceremonies worldwide.
              </p>
            </div>

            {/* Select Clients */}
            <div className="pt-4 border-t border-black/[0.08] space-y-3">
              <span className="text-[10px] font-sans text-neutral-400 uppercase tracking-[0.2em] block">
                SELECTED CLIENTS & PUBLICATIONS
              </span>
              <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs font-sans text-neutral-600 uppercase tracking-wider">
                {clients.map((c, i) => (
                  <span key={i} className="hover:text-black transition-colors">
                    {c} {i !== clients.length - 1 && <span className="text-neutral-300 ml-3">/</span>}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Contact & Booking Inquiry */}
          <div id="contact" className="lg:col-span-7 space-y-8 lg:pl-10">
            <div>
              <span className="text-[10px] font-sans text-neutral-400 uppercase tracking-[0.25em] block mb-2">
                INQUIRIES & ASSIGNMENTS
              </span>
              <h3 className="font-sans text-2xl sm:text-3xl font-bold uppercase tracking-tight text-black">
                LET&apos;S WORK TOGETHER.
              </h3>
              <p className="font-sans text-xs sm:text-sm text-neutral-600 mt-2">
                Available for worldwide tour assignments, editorial portraits, and select private commissions.
              </p>
            </div>

            {formSubmitted ? (
              <div className="border border-black/10 p-8 text-center space-y-3 bg-white shadow-sm">
                <CheckCircle2 className="w-8 h-8 text-black mx-auto" />
                <h4 className="font-sans text-base uppercase font-bold text-black tracking-wider">
                  MESSAGE RECEIVED
                </h4>
                <p className="font-sans text-xs text-neutral-600">
                  Thank you for reaching out. We will review your inquiry and respond within 24 hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] uppercase font-sans tracking-widest text-neutral-500 mb-2">
                      NAME *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Jane Doe"
                      className="w-full bg-transparent border-b border-black/20 py-2 text-xs text-black placeholder:text-neutral-400 focus:outline-none focus:border-black uppercase tracking-wider font-sans transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-sans tracking-widest text-neutral-500 mb-2">
                      EMAIL ADDRESS *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="jane@management.com"
                      className="w-full bg-transparent border-b border-black/20 py-2 text-xs text-black placeholder:text-neutral-400 focus:outline-none focus:border-black uppercase tracking-wider font-sans transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] uppercase font-sans tracking-widest text-neutral-500 mb-2">
                      PROJECT TYPE
                    </label>
                    <select
                      value={formData.projectType}
                      onChange={(e) => setFormData({ ...formData, projectType: e.target.value })}
                      className="w-full bg-[#F7F6F2] border-b border-black/20 py-2 text-xs text-black focus:outline-none focus:border-black uppercase tracking-wider font-sans transition-colors cursor-pointer"
                    >
                      <option value="tour">Tour / Concert Coverage</option>
                      <option value="editorial">Editorial / People Portrait</option>
                      <option value="artist">Singer / Musician Spotlight</option>
                      <option value="wedding">Ceremony / High-End Wedding</option>
                      <option value="event">Private Event / Gala</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-sans tracking-widest text-neutral-500 mb-2">
                      TARGET DATE / TIMELINE
                    </label>
                    <input
                      type="text"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      placeholder="MM / YYYY or Dates"
                      className="w-full bg-transparent border-b border-black/20 py-2 text-xs text-black placeholder:text-neutral-400 focus:outline-none focus:border-black uppercase tracking-wider font-sans transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-sans tracking-widest text-neutral-500 mb-2">
                    PROJECT DETAILS & LOCATION
                  </label>
                  <textarea
                    rows={3}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Tell us about the project, city, venue, and vision..."
                    className="w-full bg-transparent border-b border-black/20 py-2 text-xs text-black placeholder:text-neutral-400 focus:outline-none focus:border-black uppercase tracking-wider font-sans transition-colors resize-none"
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-[11px] font-sans text-neutral-500 uppercase tracking-widest">
                    DIRECT: INQUIRIES@AZIZOGRAPHY.COM
                  </span>

                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-black text-white hover:bg-neutral-800 transition-colors text-xs font-bold uppercase tracking-[0.18em] cursor-pointer"
                  >
                    SEND INQUIRY
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
