"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Camera, Mail, MapPin, Send, CheckCircle2, ArrowRight } from "lucide-react";

export default function AboutSection() {
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    service: "concert",
    date: "",
    details: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);
  };

  return (
    <section id="about" className="w-full border-t border-white/10 bg-[#0a0a0a] py-20 font-mono-brutal text-xs">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        {/* Section Header */}
        <div className="flex items-center justify-between pb-8 border-b border-white/10 text-[11px] uppercase tracking-widest text-neutral-400">
          <span>03 // THE ARTIST & RIG</span>
          <span>EST. 2016 • TOURING WORLDWIDE</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pt-12 items-start">
          {/* Left Column: Portrait & Bio */}
          <div className="lg:col-span-6 space-y-8">
            <div className="relative aspect-[4/5] w-full max-w-md bg-neutral-900 border border-white/15 overflow-hidden">
              <Image
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1200&auto=format&fit=crop"
                alt="Aziz - Photographer Profile"
                fill
                sizes="(max-width: 768px) 100vw, 500px"
                className="object-cover filter grayscale contrast-125 hover:grayscale-0 transition-all duration-700"
              />
              <div className="absolute bottom-3 left-3 bg-black/80 backdrop-blur-md px-3 py-1 border border-white/20 text-[10px] text-white uppercase tracking-widest">
                AZIZ // PIT PHOTO AT SOFI STADIUM
              </div>
            </div>

            <div className="space-y-4 max-w-lg">
              <h2 className="font-display text-3xl sm:text-4xl font-extrabold uppercase text-white tracking-tight leading-none">
                OBSESSED WITH THE FRICTION OF SOUND & LIGHT.
              </h2>
              <p className="text-neutral-400 leading-relaxed text-xs sm:text-sm">
                Based between Los Angeles and Brooklyn, Aziz has spent ten years in the photo pit and on tour buses. 
                From the thunderous bass reverberations of European festival stages to the tender hush of candlelit 
                vows in Italy, the philosophy remains uncompromising: high contrast, zero fluff, cinematic truth.
              </p>
            </div>

            {/* Gear Rig Spec */}
            <div className="border border-white/10 p-5 bg-[#121212] space-y-3">
              <div className="flex items-center gap-2 text-white font-bold uppercase tracking-wider text-[11px]">
                <Camera className="w-3.5 h-3.5 text-red-500" />
                <span>Primary Tour & Ceremony Gear</span>
              </div>
              <ul className="text-neutral-400 space-y-1.5 text-[11px]">
                <li>• <strong className="text-neutral-200">Bodies:</strong> Sony A1 Dual Rigs, Leica M11-P Monochrome, Hasselblad X2D</li>
                <li>• <strong className="text-neutral-200">Glass:</strong> GM 16-35 f/2.8, GM 50 f/1.2, GM 135 f/1.8, Leica 35mm Summilux</li>
                <li>• <strong className="text-neutral-200">Analog:</strong> Contax T2 (Portra 800 / Tri-X 400 for backstage rolls)</li>
              </ul>
            </div>
          </div>

          {/* Right Column: Inquiries / Booking Form */}
          <div id="contact" className="lg:col-span-6 border border-white/15 bg-[#101010] p-6 sm:p-10">
            <div className="mb-6">
              <span className="text-[10px] text-red-500 font-bold uppercase tracking-widest block mb-1">
                // AVAILABILITY 2026/2027
              </span>
              <h3 className="font-display text-2xl sm:text-3xl font-extrabold uppercase text-white tracking-tight">
                BOOK AN ASSIGNMENT
              </h3>
              <p className="text-neutral-400 text-xs mt-1">
                Tour passes, festival media credentials, album artwork sessions, or high-fashion weddings.
              </p>
            </div>

            {formSubmitted ? (
              <div className="py-12 text-center space-y-4 border border-red-500/30 bg-red-950/10 p-6">
                <CheckCircle2 className="w-12 h-12 text-red-500 mx-auto animate-bounce" />
                <h4 className="font-display text-xl uppercase font-bold text-white">
                  TRANSMISSION RECEIVED
                </h4>
                <p className="text-neutral-300 text-xs max-w-sm mx-auto">
                  Aziz or management will review date availability and respond within 24 hours.
                </p>
                <button
                  onClick={() => setFormSubmitted(false)}
                  className="px-4 py-2 border border-white/20 text-neutral-400 hover:text-white uppercase text-[10px] tracking-wider"
                >
                  SEND ANOTHER NOTE
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] uppercase text-neutral-400 tracking-wider mb-1">
                    Your Name / Management
                  </label>
                  <input
                    required
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="E.G. WARNER MUSIC / JANE DOE"
                    className="w-full bg-[#181818] border border-white/10 px-3 py-2.5 text-white placeholder:text-neutral-600 focus:outline-none focus:border-white text-xs uppercase"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase text-neutral-400 tracking-wider mb-1">
                      Direct Email
                    </label>
                    <input
                      required
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="MGMT@ARTIST.COM"
                      className="w-full bg-[#181818] border border-white/10 px-3 py-2.5 text-white placeholder:text-neutral-600 focus:outline-none focus:border-white text-xs uppercase"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase text-neutral-400 tracking-wider mb-1">
                      Assignment Scope
                    </label>
                    <select
                      value={formData.service}
                      onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                      className="w-full bg-[#181818] border border-white/10 px-3 py-2.5 text-white focus:outline-none focus:border-white text-xs uppercase"
                    >
                      <option value="concert">Concert / Arena Tour</option>
                      <option value="singer">Singer Spotlight / EP Cover</option>
                      <option value="wedding">Editorial Wedding / Ceremony</option>
                      <option value="festival">Festival / Multi-Day Event</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase text-neutral-400 tracking-wider mb-1">
                    Target Date & Location
                  </label>
                  <input
                    type="text"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    placeholder="E.G. OCT 2026 / PARIS, FRANCE"
                    className="w-full bg-[#181818] border border-white/10 px-3 py-2.5 text-white placeholder:text-neutral-600 focus:outline-none focus:border-white text-xs uppercase"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase text-neutral-400 tracking-wider mb-1">
                    Project Details & Notes
                  </label>
                  <textarea
                    rows={4}
                    value={formData.details}
                    onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                    placeholder="DESCRIBE THE STAGE SETUP, ACCESS REQUIREMENTS, OR VIBE..."
                    className="w-full bg-[#181818] border border-white/10 px-3 py-2.5 text-white placeholder:text-neutral-600 focus:outline-none focus:border-white text-xs uppercase"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-white hover:bg-neutral-200 text-black font-display font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all mt-4"
                >
                  <span>SUBMIT INQUIRY</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
