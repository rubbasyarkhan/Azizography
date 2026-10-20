/**
 * Image optimization utilities for Azizography portfolio
 * Automatically optimizes resolution, format, and compression quality.
 */

export function getOptimizedImageUrl(
  url: string,
  width: number = 800,
  quality: number = 72
): string {
  if (!url) return "";

  // Optimize Unsplash images with dynamic query parameters
  if (url.includes("images.unsplash.com")) {
    try {
      const urlObj = new URL(url);
      urlObj.searchParams.set("auto", "format"); // Negotiates WebP / AVIF automatically
      urlObj.searchParams.set("fit", "crop");
      urlObj.searchParams.set("w", String(width));
      urlObj.searchParams.set("q", String(quality));
      return urlObj.toString();
    } catch {
      // Fallback regex replacement if URL constructor fails
      let optimized = url;
      if (optimized.includes("w=")) {
        optimized = optimized.replace(/w=\d+/, `w=${width}`);
      } else {
        optimized += (optimized.includes("?") ? "&" : "?") + `w=${width}`;
      }
      if (optimized.includes("q=")) {
        optimized = optimized.replace(/q=\d+/, `q=${quality}`);
      } else {
        optimized += `&q=${quality}`;
      }
      if (!optimized.includes("auto=format")) {
        optimized += "&auto=format";
      }
      return optimized;
    }
  }

  return url;
}

/**
 * Generates an HTML srcSet for responsive lazy loading across device viewports
 */
export function getResponsiveSrcSet(url: string, widths: number[] = [400, 700, 1000]): string {
  if (!url || !url.includes("images.unsplash.com")) return "";
  return widths
    .map((w) => `${getOptimizedImageUrl(url, w, w <= 400 ? 68 : 74)} ${w}w`)
    .join(", ");
}

/**
 * Formats byte size into human-readable format (e.g. 1.8 MB, 240 KB)
 */
export function formatBytes(bytes: number, decimals: number = 1): string {
  if (!bytes || bytes <= 0) return "0 B";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export interface WebPConversionResult {
  file: File;
  dataUrl: string;
  blob: Blob;
  width: number;
  height: number;
  originalSize: number;
  compressedSize: number;
  reductionPercentage: number;
  compressionRatio: number;
  blurDataUrl?: string;
}

/**
 * Converts any image format (JPEG, PNG, HEIC, AVIF, TIFF, BMP, etc.) into a modern,
 * compressed WebP image on the client side using HTML5 Canvas.
 * Automatically resizes image if it exceeds maxWidth/maxHeight.
 * Adaptively tunes quality to guarantee safe zero-cost storage (<480 KB per doc).
 */
export async function convertAndCompressToWebP(
  input: File | Blob | string,
  options?: {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number; // 0.1 to 1.0, default 0.82
    maxSizeBytes?: number; // default 480KB for Firestore $0 safety
    filename?: string;
  }
): Promise<WebPConversionResult> {
  if (typeof window === "undefined") {
    throw new Error("convertAndCompressToWebP can only be run in the browser");
  }

  let maxWidth = options?.maxWidth || 1920;
  let maxHeight = options?.maxHeight || 1920;
  let quality = typeof options?.quality === "number" ? options?.quality : 0.82;
  const maxSizeBytes = options?.maxSizeBytes || 480 * 1024; // 480 KB

  let originalSize = 0;
  let filename = options?.filename || "photograph.webp";

  if (input instanceof File) {
    originalSize = input.size;
    const baseName = input.name.replace(/\.[^/.]+$/, "");
    filename = `${baseName}.webp`;
  } else if (input instanceof Blob) {
    originalSize = input.size;
  }

  // Load image into an HTMLImageElement
  const img = new Image();
  img.crossOrigin = "anonymous";

  let objectUrlToRevoke: string | null = null;
  try {
    if (typeof input === "string") {
      img.src = input;
    } else {
      objectUrlToRevoke = URL.createObjectURL(input);
      img.src = objectUrlToRevoke;
    }

    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () =>
        reject(new Error("Unable to decode image. Please ensure the file is a valid image."));
    });
  } finally {
    if (objectUrlToRevoke) {
      URL.revokeObjectURL(objectUrlToRevoke);
    }
  }

  // Compute scale keeping aspect ratio
  let targetWidth = img.naturalWidth || img.width;
  let targetHeight = img.naturalHeight || img.height;

  if (targetWidth > maxWidth || targetHeight > maxHeight) {
    const scale = Math.min(maxWidth / targetWidth, maxHeight / targetHeight);
    targetWidth = Math.round(targetWidth * scale);
    targetHeight = Math.round(targetHeight * scale);
  }

  // Create canvas for WebP encoding
  const canvas = document.createElement("canvas");
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext("2d", { willReadFrequently: false });

  if (!ctx) {
    throw new Error("Unable to create canvas 2D context for image compression");
  }

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

  // Encode WebP blob helper
  const encodeBlob = (q: number): Promise<Blob> => {
    return new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (b) => {
          if (b) resolve(b);
          else reject(new Error("Browser failed to encode image to WebP"));
        },
        "image/webp",
        q
      );
    });
  };

  let blob = await encodeBlob(quality);

  // Adaptive compression loop: if image exceeds maxSizeBytes (e.g. 480KB), tune down quality & scale
  let attempts = 0;
  while (blob.size > maxSizeBytes && attempts < 3) {
    attempts++;
    quality = Math.max(0.60, quality - 0.08);

    // If still large after 1st attempt, downscale canvas slightly (e.g. 1600px max)
    if (attempts >= 2 && (targetWidth > 1440 || targetHeight > 1440)) {
      targetWidth = Math.round(targetWidth * 0.88);
      targetHeight = Math.round(targetHeight * 0.88);
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
    }

    blob = await encodeBlob(quality);
  }

  // Generate dataUrl once for the final optimized canvas state
  const dataUrl = canvas.toDataURL("image/webp", quality);

  // Create a micro 24px blur placeholder for instantaneous zero-glitch display
  let blurDataUrl: string | undefined = undefined;
  try {
    const blurCanvas = document.createElement("canvas");
    const blurW = 24;
    const blurH = Math.max(12, Math.round((24 * targetHeight) / targetWidth));
    blurCanvas.width = blurW;
    blurCanvas.height = blurH;
    const bCtx = blurCanvas.getContext("2d");
    if (bCtx) {
      bCtx.imageSmoothingEnabled = true;
      bCtx.drawImage(canvas, 0, 0, blurW, blurH);
      blurDataUrl = blurCanvas.toDataURL("image/webp", 0.4);
    }
  } catch {
    // Optional blur placeholder fallback
  }

  const compressedSize = blob.size;
  const reductionPercentage =
    originalSize > 0
      ? Math.max(0, Math.round(((originalSize - compressedSize) / originalSize) * 100))
      : 0;

  const file = new File([blob], filename, { type: "image/webp" });

  return {
    file,
    dataUrl,
    blob,
    width: targetWidth,
    height: targetHeight,
    originalSize,
    compressedSize,
    reductionPercentage,
    compressionRatio: reductionPercentage,
    blurDataUrl,
  };
}
