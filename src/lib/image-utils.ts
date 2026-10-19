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
