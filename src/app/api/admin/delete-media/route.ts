import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { imageUrl, storagePath, filename } = body;

    let targetFilename: string | null = null;

    if (filename) {
      targetFilename = filename;
    } else if (typeof storagePath === "string" && storagePath.startsWith("uploads/")) {
      targetFilename = storagePath.replace("uploads/", "");
    } else if (typeof imageUrl === "string" && imageUrl.startsWith("/uploads/")) {
      targetFilename = imageUrl.replace("/uploads/", "");
    }

    if (targetFilename) {
      // Prevent directory traversal attacks
      const safeFilename = path.basename(targetFilename);
      const filePath = path.join(process.cwd(), "public", "uploads", safeFilename);

      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
          console.log(`[delete-media] Successfully deleted file from disk: ${filePath}`);
        } catch (unlinkErr) {
          console.warn(`[delete-media] Failed to unlink file: ${filePath}`, unlinkErr);
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: "Media deleted permanently",
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error("[delete-media] Unexpected error:", err);
    return NextResponse.json(
      { success: false, message: err.message || "Failed to delete media" },
      { status: 500 }
    );
  }
}
