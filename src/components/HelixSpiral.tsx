"use client";

import React, { useEffect, useRef } from "react";
import Image from "next/image";

interface HelixSpiralProps {
  active: boolean;
  onComplete?: () => void;
}

// 40 curated editorial images for the dense logarithmic spiral
const SPIRAL_IMAGES = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1520523839898-507125cd53c1?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1583939003579-730e3918a45a?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?q=80&w=800&auto=format&fit=crop",
];

export default function HelixSpiral({ active, onComplete }: HelixSpiralProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const spiralGroupRef = useRef<HTMLDivElement>(null);
  const rotationAngleRef = useRef(0);
  const animationFrameIdRef = useRef<number | null>(null);

  // Generate 42 logarithmic spiral positions
  const count = 42;
  const spiralItems = React.useMemo(() => {
    const items = [];
    const a = 32; // Initial core radius
    const b = 0.082; // Growth factor of logarithmic spiral
    const angleStep = 0.36; // Radian step between successive images

    for (let i = 0; i < count; i++) {
      const theta = i * angleStep;
      const radius = a * Math.exp(b * theta);
      const x = Math.cos(theta) * radius;
      const y = Math.sin(theta) * radius * 0.72; // Isometric ellipse tilt for depth

      // Size scales exponentially from tiny in dense core to large on outer edges
      const progress = i / count;
      const width = Math.round(36 + Math.pow(progress, 1.85) * 195);
      const height = Math.round(width * 1.34);

      // 3D paper curl variations: curl intensity increases as cards fly forward
      const curlIntensity = 10 + progress * 24;
      const curlX = Math.sin(i * 1.3) * curlIntensity;
      const curlY = Math.cos(i * 1.1) * curlIntensity;
      const rotZ = (theta * 180) / Math.PI + 70 + Math.sin(i) * 12;

      // Z depth layering: outer cards pop forward in camera perspective
      const z = Math.round(progress * 280);

      const imgUrl = SPIRAL_IMAGES[i % SPIRAL_IMAGES.length];

      items.push({
        id: i,
        x,
        y,
        z,
        width,
        height,
        rotZ,
        curlX,
        curlY,
        imgUrl,
        progress,
      });
    }
    return items;
  }, []);

  // Continuous spinning animation
  useEffect(() => {
    if (!active) return;

    let startTime = performance.now();
    const duration = 2200; // 2 seconds runtime requested by user

    const animate = (now: number) => {
      const elapsed = now - startTime;
      
      // Rotate the entire spiral group continuously
      rotationAngleRef.current += 0.85;

      if (spiralGroupRef.current) {
        spiralGroupRef.current.style.transform = `rotate(${rotationAngleRef.current}deg)`;
      }

      // Check if 2 seconds have passed
      if (elapsed < duration) {
        animationFrameIdRef.current = requestAnimationFrame(animate);
      } else {
        // Trigger completion transition
        onComplete?.();
      }
    };

    animationFrameIdRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, [active, onComplete]);

  if (!active) return null;

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 z-30 overflow-hidden flex items-center justify-center pointer-events-none select-none bg-black"
      style={{
        perspective: "1400px",
      }}
    >
      {/* Dense Dark Core Glow */}
      <div className="absolute w-48 h-48 rounded-full bg-black/90 shadow-[0_0_90px_rgba(0,0,0,1)] z-20 pointer-events-none" />

      {/* Rotating Spiral Container */}
      <div
        ref={spiralGroupRef}
        className="relative w-0 h-0 transition-transform duration-75 ease-linear will-change-transform"
        style={{
          transformStyle: "preserve-3d",
        }}
      >
        {spiralItems.map((item) => (
          <div
            key={item.id}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 will-change-transform"
            style={{
              transform: `translate3d(${item.x}px, ${item.y}px, ${item.z}px) rotateZ(${item.rotZ}deg)`,
              transformStyle: "preserve-3d",
              zIndex: Math.round(item.progress * 100),
            }}
          >
            {/* Paper Bending Card with 3D cylindrical curl and glossy sheen */}
            <div
              className="relative overflow-hidden bg-neutral-900 border border-white/20 transition-all"
              style={{
                width: `${item.width}px`,
                height: `${item.height}px`,
                transform: `rotateX(${item.curlX}deg) rotateY(${item.curlY}deg)`,
                borderRadius: `${Math.max(2, Math.round(item.width * 0.05))}px`,
                boxShadow: `
                  0 ${Math.round(8 + item.progress * 24)}px ${Math.round(14 + item.progress * 30)}px rgba(0,0,0,0.85),
                  0 2px 6px rgba(0,0,0,0.5)
                `,
                // Paper curl curvature simulation
                clipPath: "polygon(0% 0%, 100% 1%, 98% 99%, 1% 100%)",
              }}
            >
              <Image
                src={item.imgUrl}
                alt="Spiral Photo"
                fill
                sizes="(max-width: 768px) 120px, 240px"
                className="object-cover filter contrast-125 saturate-110"
                priority={item.progress > 0.6}
              />

              {/* Glossy Paper Light Reflection overlay */}
              <div
                className="pointer-events-none absolute inset-0 mix-blend-overlay opacity-75"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(255,255,255,0.4) 0%, transparent 45%, rgba(0,0,0,0.4) 100%)",
                }}
              />

              {/* Paper Corner Curl Shadow */}
              <div
                className="pointer-events-none absolute -bottom-2 -right-2 w-8 h-8 opacity-40"
                style={{
                  background: "radial-gradient(circle, rgba(0,0,0,0.8) 0%, transparent 70%)",
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
