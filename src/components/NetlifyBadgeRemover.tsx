"use client";

import { useEffect } from "react";

/**
 * NetlifyBadgeRemover
 * Proactively cleans up any injected Netlify badges, collaborative drawers, or feedback widgets
 * that Netlify's edge scripts attempt to inject into client sessions.
 */
export default function NetlifyBadgeRemover() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const purgeNetlifyElements = () => {
      // 1. Target standard Netlify badge and drawer selectors
      const selectors = [
        "netlify-badge",
        "[id*='netlify-badge']",
        "[class*='netlify-badge']",
        "[data-netlify-badge]",
        "[class*='netlify-feedback']",
        "iframe[src*='netlify']",
        "div[data-netlify-deploy-id]",
      ];

      selectors.forEach((sel) => {
        document.querySelectorAll(sel).forEach((el) => {
          try {
            el.remove();
          } catch {
            // ignore if already detached
          }
        });
      });

      // 2. Target custom elements whose tag contains 'netlify'
      document.querySelectorAll("*").forEach((el) => {
        const tag = el.tagName.toLowerCase();
        if (tag.includes("netlify")) {
          try {
            el.remove();
          } catch {
            // ignore
          }
        }
      });
    };

    // Run immediately
    purgeNetlifyElements();

    // Observe any delayed injection from Netlify's CDN edge
    const observer = new MutationObserver(() => {
      purgeNetlifyElements();
    });

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
    });

    // Also run on window load to catch late scripts
    window.addEventListener("load", purgeNetlifyElements);

    return () => {
      observer.disconnect();
      window.removeEventListener("load", purgeNetlifyElements);
    };
  }, []);

  return null;
}
