"use client";

import React, { Suspense } from "react";
import GalleryPageContent from "@/components/GalleryPageContent";
import { AuthProvider } from "@/lib/auth-context";

export default function LivePage() {
  return (
    <AuthProvider>
      <Suspense fallback={null}>
        <GalleryPageContent initialFilter="concerts" />
      </Suspense>
    </AuthProvider>
  );
}
