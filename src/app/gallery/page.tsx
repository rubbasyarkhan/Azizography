"use client";

import React, { Suspense } from "react";
import GalleryPageContent from "@/components/GalleryPageContent";
import { AuthProvider } from "@/lib/auth-context";

export default function GalleryPage() {
  return (
    <AuthProvider>
      <Suspense fallback={null}>
        <GalleryPageContent />
      </Suspense>
    </AuthProvider>
  );
}
