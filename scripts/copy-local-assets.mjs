/**
 * Copies every image from src/assets/ into public/images/assets/<subfolder>/
 * with clean, URL-safe filenames. Run once before dev or after adding new images.
 *
 *   node scripts/copy-local-assets.mjs
 */

import { readdir, copyFile, mkdir } from "fs/promises";
import { join, extname, relative, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const SRC = join(ROOT, "src", "assets");
const DEST = join(ROOT, "public", "images", "assets");

/** Convert any arbitrary filename into a URL-safe slug */
function slugify(name) {
  return name
    .toLowerCase()
    .replace(/[^\w\s-]/g, " ")   // strip emoji, punctuation
    .replace(/\s+/g, "-")        // spaces → hyphens
    .replace(/-{2,}/g, "-")      // collapse multiple hyphens
    .replace(/^-|-$/g, "")       // trim leading/trailing hyphens
    .slice(0, 80)                 // keep filenames reasonable
    || "image";
}

async function gatherFiles(dir, base = dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const e of entries) {
    const full = join(dir, e.name);
    if (e.isDirectory()) {
      files.push(...(await gatherFiles(full, base)));
    } else {
      const ext = extname(e.name).toLowerCase();
      if ([".jfif", ".jpeg", ".jpg", ".png", ".webp"].includes(ext)) {
        files.push({ full, rel: relative(base, dir) });
      }
    }
  }
  return files;
}

// Track used slugs per subfolder to avoid collisions
const usedSlugs = {};

async function run() {
  const files = await gatherFiles(SRC);
  let copied = 0;
  let skipped = 0;

  for (const { full, rel } of files) {
    const ext = extname(full).toLowerCase();
    const baseName = full.slice(full.lastIndexOf("\\") + 1, full.length - ext.length)
      || full.slice(full.lastIndexOf("/") + 1, full.length - ext.length);

    const slug = slugify(baseName);
    const subFolder = rel || "general";
    const destDir = join(DEST, subFolder);

    usedSlugs[subFolder] = usedSlugs[subFolder] || {};
    let finalSlug = slug;
    let counter = 2;
    while (usedSlugs[subFolder][finalSlug]) {
      finalSlug = `${slug}-${counter}`;
      counter++;
    }
    usedSlugs[subFolder][finalSlug] = true;

    // Always output as .jpg (jfif is jpeg)
    const destFile = join(destDir, `${finalSlug}.jpg`);

    await mkdir(destDir, { recursive: true });
    await copyFile(full, destFile);
    copied++;
    const relDest = relative(ROOT, destFile).replace(/\\/g, "/");
    console.log(`  ✓  ${relDest}`);
  }

  console.log(`\nDone: ${copied} copied, ${skipped} skipped.`);
  console.log(`Output → public/images/assets/`);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
