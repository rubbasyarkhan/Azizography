import type { Metadata } from "next";
import { Syne, Space_Grotesk, Cormorant_Garamond, Cinzel, Inter } from "next/font/google";
import "./globals.css";

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "600", "700", "800"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "600", "700", "900"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "AZIZOGRAPHY // Concert, Singer & High-End Event Visuals",
  description:
    "Brutalist & refined portfolio of Aziz - specialized in raw concert energy, singer spotlights, festival stages, and intimate wedding ceremonies.",
  keywords: [
    "Azizography",
    "Concert Photographer",
    "Live Music Photography",
    "Singer Spotlight",
    "Editorial Wedding",
    "Event Visuals",
    "Tour Photographer",
  ],
  authors: [{ name: "Aziz" }],
  openGraph: {
    title: "AZIZOGRAPHY // Live Music & Editorial Portfolio",
    description: "Raw concert energy, singer spotlights, and editorial wedding ceremonies.",
    type: "website",
    locale: "en_US",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${syne.variable} ${spaceGrotesk.variable} ${cormorant.variable} ${cinzel.variable} ${inter.variable} dark bg-[#070707] text-[#f5f5f7] antialiased selection:bg-[#f5f5f7] selection:text-[#070707]`}
    >
      <body className="min-h-screen bg-[#070707] text-[#f5f5f7] font-sans overflow-x-hidden">
        {/* Grain overlay for brutalist cinematic texture */}
        <div 
          className="pointer-events-none fixed inset-0 z-50 opacity-[0.035] mix-blend-screen"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}
        />
        {children}
      </body>
    </html>
  );
}
