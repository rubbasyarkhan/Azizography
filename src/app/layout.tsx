import type { Metadata } from "next";
import {
  Syne,
  Space_Grotesk,
  Cormorant_Garamond,
  Cinzel,
  Italiana,
  Playfair_Display,
  Inter,
} from "next/font/google";
import "./globals.css";
import SmoothScroll from "@/components/SmoothScroll";
import NetlifyBadgeRemover from "@/components/NetlifyBadgeRemover";

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
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

const italiana = Italiana({
  variable: "--font-italiana",
  subsets: ["latin"],
  display: "swap",
  weight: "400",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
  style: ["normal", "italic"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "AZIZOGRAPHY // Concert, People & Editorial Visuals",
  description:
    "Refined minimalist portfolio of Aziz - specialized in concert energy, artist portraits, tour life, and intimate editorial ceremonies.",
  keywords: [
    "Azizography",
    "Concert Photographer",
    "Live Music Photography",
    "People Photography",
    "Editorial Photography",
    "Tour Photographer",
  ],
  authors: [{ name: "Aziz" }],
  openGraph: {
    title: "AZIZOGRAPHY // Editorial & Live Music Portfolio",
    description: "Raw concert energy, people spotlights, and editorial wedding ceremonies.",
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
      className={`${syne.variable} ${spaceGrotesk.variable} ${cormorant.variable} ${cinzel.variable} ${italiana.variable} ${playfair.variable} ${inter.variable} bg-[#FAF9F6] text-[#0A0A0A] antialiased selection:bg-[#0A0A0A] selection:text-[#FAF9F6]`}
    >
      <body className="min-h-screen bg-[#FAF9F6] text-[#0A0A0A] font-sans overflow-x-hidden">
        {/* Subtle fine art paper grain overlay */}
        <div 
          className="pointer-events-none fixed inset-0 z-40 opacity-[0.02] mix-blend-multiply"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}
        />
        <SmoothScroll>{children}</SmoothScroll>
        <NetlifyBadgeRemover />
      </body>
    </html>
  );
}
