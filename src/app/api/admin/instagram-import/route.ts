import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { url, urls, postUrl } = body;

    // Batch direct images handler (downloads multiple carousel images in parallel, max 10 at a time)
    if (Array.isArray(urls) && urls.length > 0) {
      const items = await Promise.all(
        urls.slice(0, 10).map(async (u: string) => {
          try {
            const imgRes = await fetch(u.trim(), {
              headers: {
                "User-Agent":
                  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "Referer": "https://www.instagram.com/",
                "Accept": "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
              },
            });
            if (!imgRes.ok) return null;
            const contentType = imgRes.headers.get("content-type") || "image/jpeg";
            const buffer = await imgRes.arrayBuffer();
            const base64 = Buffer.from(buffer).toString("base64");
            return {
              dataUrl: `data:${contentType};base64,${base64}`,
              sourceUrl: u,
            };
          } catch {
            return null;
          }
        })
      );
      const validItems = items.filter(Boolean);
      return NextResponse.json({
        success: true,
        items: validItems,
        instagramUrl: postUrl,
      });
    }

    if (!url || typeof url !== "string") {
      return NextResponse.json(
        { success: false, message: "Please provide a valid URL." },
        { status: 400 }
      );
    }

    const trimmedUrl = url.trim();

    // Check if the URL is an Instagram post or reel URL
    const postMatch = trimmedUrl.match(/(?:instagram\.com\/(?:p|reel|tv)\/([a-zA-Z0-9_-]+))/i);
    const shortcode = postMatch ? postMatch[1] : null;
    const cleanPostUrl = shortcode ? `https://www.instagram.com/p/${shortcode}/` : postUrl || undefined;

    // 1. Direct Image URL handler (Instagram CDN, Cloudflare, S3, or general image URLs)
    const isDirectImage =
      trimmedUrl.includes("cdninstagram.com") ||
      trimmedUrl.includes("fbcdn.net") ||
      trimmedUrl.includes("scontent") ||
      /\.(jpeg|jpg|png|webp|avif)(\?.*)?$/i.test(trimmedUrl);

    if (isDirectImage) {
      const imgRes = await fetch(trimmedUrl, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Referer": "https://www.instagram.com/",
          "Accept": "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
        },
      });

      if (!imgRes.ok) {
        return NextResponse.json(
          { success: false, message: `Failed to download image from CDN (HTTP ${imgRes.status}).` },
          { status: 400 }
        );
      }

      const contentType = imgRes.headers.get("content-type") || "image/jpeg";
      const buffer = await imgRes.arrayBuffer();
      const base64 = Buffer.from(buffer).toString("base64");
      const dataUrl = `data:${contentType};base64,${base64}`;

      return NextResponse.json({
        success: true,
        dataUrl,
        instagramUrl: cleanPostUrl,
        message: "Image successfully imported from Instagram CDN!",
      });
    }

    // 2. Post / Reel page handler: attempt to parse OpenGraph / Embed tags
    if (shortcode) {
      const embedUrl = `https://www.instagram.com/p/${shortcode}/embed/captioned/`;

      try {
        const pageRes = await fetch(embedUrl, {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.5",
          },
        });

        const html = await pageRes.text();

        // Extract caption if present in embed HTML
        let caption: string | undefined = undefined;
        const captionMatch =
          html.match(/<div class="Caption"[^>]*>([\s\S]*?)<\/div>/i) ||
          html.match(/<meta property="og:description" content="([^"]+)"/i) ||
          html.match(/<meta name="description" content="([^"]+)"/i);

        if (captionMatch) {
          // Clean up HTML tags and entities
          caption = captionMatch[1]
            .replace(/<[^>]+>/g, " ")
            .replace(/&amp;/g, "&")
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'")
            .replace(/\s+/g, " ")
            .trim();
        }

        // Look for image candidates in embed HTML
        const imgCandidates = [
          ...html.matchAll(/https:\/\/[^"'\s<>\\]+cdninstagram\.com[^"'\s<>\\]+/g),
        ]
          .map((m) => m[0].replace(/&amp;/g, "&"))
          .filter((u) => !u.includes("/rsrc.php/") && !u.includes("static.cdninstagram.com"));

        if (imgCandidates.length > 0) {
          const directImgUrl = imgCandidates[0];
          const imgRes = await fetch(directImgUrl, {
            headers: {
              "User-Agent":
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            },
          });

          if (imgRes.ok) {
            const contentType = imgRes.headers.get("content-type") || "image/jpeg";
            const buffer = await imgRes.arrayBuffer();
            const base64 = Buffer.from(buffer).toString("base64");
            const dataUrl = `data:${contentType};base64,${base64}`;

            return NextResponse.json({
              success: true,
              dataUrl,
              caption,
              instagramUrl: cleanPostUrl,
              message: "Post image and caption resolved successfully!",
            });
          }
        }
      } catch (embedErr) {
        console.warn("Instagram embed resolution notice:", embedErr);
      }

      // If Instagram returned a login wall or obscured the embed CDN URL
      return NextResponse.json({
        success: false,
        requiresDirectImage: true,
        instagramUrl: cleanPostUrl,
        message:
          "Instagram login wall encountered for post URL. Simply right-click the photo on Instagram, select 'Copy Image' (or 'Copy Image Address'), and paste it here!",
      });
    }

    return NextResponse.json(
      {
        success: false,
        message:
          "Unrecognized link. Please provide an Instagram post link (instagram.com/p/...) or copy-paste the image directly.",
      },
      { status: 400 }
    );
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json(
      { success: false, message: err.message || "Failed to process Instagram import." },
      { status: 500 }
    );
  }
}
