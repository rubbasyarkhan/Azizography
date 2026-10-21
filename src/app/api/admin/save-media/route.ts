import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, message: "No file provided" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const cleanName = file.name.replace(/[^a-zA-Z0-9_.-]/g, "_");
    const filename = `${Date.now()}_${cleanName.endsWith(".webp") ? cleanName : `${cleanName}.webp`}`;
    const filePath = path.join(uploadsDir, filename);

    fs.writeFileSync(filePath, buffer);

    const imageUrl = `/uploads/${filename}`;
    const storagePath = `uploads/${filename}`;

    return NextResponse.json({
      success: true,
      imageUrl,
      storagePath,
      filename,
    });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json(
      { success: false, message: err.message || "Failed to save media locally" },
      { status: 500 }
    );
  }
}
