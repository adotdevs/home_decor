import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import path from "path";
import { writeFile, mkdir } from "fs/promises";
import { cookies } from "next/headers";
import { connectDb } from "@/lib/db";
import { MediaUpload } from "@/models/MediaUpload";
import { authCookie, verifyAdminToken } from "@/lib/utils/auth";

const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

const GALLERY_CATS = new Set(["living", "kitchen", "bedroom", "bathroom", "wall-decor", "entryway", "general"]);

function parseGalleryFields(formData: FormData): { showInGallery: boolean; galleryCategory?: string } {
  const raw = formData.get("showInGallery");
  const showInGallery = raw === "true" || raw === "1" || raw === "on";
  const cat = formData.get("galleryCategory");
  const galleryCategory = typeof cat === "string" && GALLERY_CATS.has(cat) ? cat : undefined;
  return { showInGallery, galleryCategory };
}

async function requireAdmin() {
  const token = (await cookies()).get(authCookie)?.value;
  return Boolean(token && verifyAdminToken(token));
}

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await connectDb();
  return NextResponse.json(await MediaUpload.find().sort({ createdAt: -1 }).limit(120).lean());
}

export async function POST(req: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const { showInGallery, galleryCategory } = parseGalleryFields(formData);
  if (showInGallery && !galleryCategory) {
    return NextResponse.json({ error: "galleryCategory is required when showInGallery is true" }, { status: 400 });
  }
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Expected file field" }, { status: 400 });
  }
  if (!ALLOWED.has(file.type)) {
    return NextResponse.json({ error: "Unsupported image type" }, { status: 400 });
  }
  if (file.size > 8 * 1024 * 1024) {
    return NextResponse.json({ error: "File too large (max 8MB)" }, { status: 400 });
  }

  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadDir, { recursive: true });

  const original = file.name || "upload";
  const extFromName = path.extname(original).toLowerCase();
  const ext =
    extFromName && [".jpg", ".jpeg", ".png", ".webp", ".gif"].includes(extFromName)
      ? extFromName
      : file.type === "image/jpeg"
        ? ".jpg"
        : file.type === "image/png"
          ? ".png"
          : file.type === "image/webp"
            ? ".webp"
            : ".gif";

  const filename = `${randomUUID()}${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(uploadDir, filename), buffer);

  const url = `/uploads/${filename}`;
  await connectDb();
  const doc = await MediaUpload.create({
    url,
    alt: original.replace(/\.[^.]+$/, ""),
    mimeType: file.type,
    width: 0,
    height: 0,
    showInGallery,
    galleryCategory: showInGallery ? galleryCategory : undefined,
  });

  return NextResponse.json(doc.toObject());
}
