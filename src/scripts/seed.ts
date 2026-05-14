import fs from "node:fs";
import path from "node:path";
import mongoose from "mongoose";
import { categoryTree } from "@/config/site";
import { DEFAULT_OG_IMAGE, DEFAULT_SEASONAL_ITEMS, DEFAULT_SITE_DESCRIPTION, DEFAULT_SITE_NAME } from "@/config/site-defaults";
import { categoryHubEditorialSeed } from "@/data/seed-category-hub-editorial";
import { buildSeedArticlesForDatabase } from "@/data/seed-articles/library";
import { env } from "@/lib/env";
import { seedSiteSettingsIfEmpty } from "@/services/site-settings-service";
import { Ad } from "@/models/Ad";
import { Article } from "@/models/Article";
import { Category } from "@/models/Category";
import { categoryHeroImage } from "@/config/images";

const sponsorCode = `<div style="padding:18px;text-align:center;border-radius:16px;background:linear-gradient(135deg,#f8efe4,#fffaf5);border:1px solid #ead8c2;color:#7a4f2b;font-family:Georgia,serif"><strong>Curated partner edit</strong><br/><span style="font-size:13px">Premium home fragrance, artisan ceramics, and soft furnishing picks selected for refined interiors.</span></div>`;

async function run() {
  await mongoose.connect(env.MONGODB_URI, { dbName: "home_decor" });

  await seedSiteSettingsIfEmpty({
    name: DEFAULT_SITE_NAME,
    description: DEFAULT_SITE_DESCRIPTION,
    publicUrl: "",
    ogImage: DEFAULT_OG_IMAGE,
    ogImageAlt: "",
    seasonalItems: [...DEFAULT_SEASONAL_ITEMS],
  });

  for (const category of categoryTree) {
    const hub = categoryHubEditorialSeed[category.slug];
    const existing = await Category.findOne({ slug: category.slug }).select("hubEditorial image").lean();
    const hasHub = Boolean(
      existing &&
        (existing as { hubEditorial?: { title?: string } }).hubEditorial?.title?.trim(),
    );
    const hasImage = Boolean((existing as { image?: string } | null)?.image?.trim());
    await Category.findOneAndUpdate(
      { slug: category.slug },
      {
        name: category.name,
        slug: category.slug,
        parentSlug: null,
        isActive: true,
        ...(!hasHub && hub ? { hubEditorial: hub } : {}),
        ...(!hasImage ? { image: categoryHeroImage(category.slug) } : {}),
      },
      { upsert: true },
    );
    for (const sub of category.subcategories) {
      await Category.findOneAndUpdate(
        { slug: sub },
        { name: sub.replaceAll("-", " "), slug: sub, parentSlug: category.slug, isActive: true },
        { upsert: true },
      );
    }
  }

  const seedArticles = buildSeedArticlesForDatabase();

  const jsonPath = path.join(process.cwd(), "data", "articles.seed.json");
  fs.mkdirSync(path.dirname(jsonPath), { recursive: true });
  fs.writeFileSync(jsonPath, JSON.stringify(seedArticles, null, 2), "utf8");
  console.log(`Wrote ${seedArticles.length} articles to ${path.relative(process.cwd(), jsonPath)}`);

  for (const article of seedArticles) {
    const doc = article as Record<string, unknown>;
    await Article.findOneAndUpdate({ slug: doc.slug }, doc, { upsert: true });
  }

  for (const placement of [
    "header",
    "in-content",
    "sidebar",
    "sticky-mobile",
    "footer",
    "grid",
  ]) {
    await Ad.findOneAndUpdate(
      { placement },
      { placement, name: `${placement} curated sponsor`, code: sponsorCode, isEnabled: true },
      { upsert: true },
    );
  }

  await mongoose.disconnect();
  console.log("Seed completed.");
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
