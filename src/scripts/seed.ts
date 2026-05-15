/**
 * Pushes seed data (categories, articles, ads, …) into MongoDB.
 * The app does not read these files at runtime — run this after deploy or to reset demo content.
 */
import fs from "node:fs";
import path from "node:path";
import mongoose from "mongoose";
import { DEFAULT_CATEGORY_TREE } from "@/data/seed-categories";
import { DEFAULT_OG_IMAGE, DEFAULT_SEASONAL_ITEMS, DEFAULT_SITE_DESCRIPTION, DEFAULT_SITE_NAME } from "@/config/site-defaults";
import { categoryHubEditorialSeed } from "@/data/seed-category-hub-editorial";
import { buildSeedArticlesForDatabase } from "@/data/seed-articles/library";
import { env } from "@/lib/env";
import { seedSiteSettingsIfEmpty } from "@/services/site-settings-service";
import { seedSitePageMarketingIfEmpty } from "@/services/site-page-marketing-service";
import { Ad } from "@/models/Ad";
import { Article } from "@/models/Article";
import { filterTopLevelBySlug } from "@/lib/mongodb/category-scope";
import { ensureCategoryIndexes } from "@/lib/mongodb/ensure-category-indexes";
import { Category } from "@/models/Category";
import { categoryHeroImage } from "@/config/images";

const sponsorCode = `<div style="padding:18px;text-align:center;border-radius:16px;background:linear-gradient(135deg,#f8efe4,#fffaf5);border:1px solid #ead8c2;color:#7a4f2b;font-family:Georgia,serif"><strong>Curated partner edit</strong><br/><span style="font-size:13px">Premium home fragrance, artisan ceramics, and soft furnishing picks selected for refined interiors.</span></div>`;

async function run() {
  await mongoose.connect(env.MONGODB_URI, { dbName: "home_decor" });
  await ensureCategoryIndexes();

  await seedSiteSettingsIfEmpty({
    name: DEFAULT_SITE_NAME,
    description: DEFAULT_SITE_DESCRIPTION,
    publicUrl: "",
    ogImage: DEFAULT_OG_IMAGE,
    ogImageAlt: "",
    seasonalItems: [...DEFAULT_SEASONAL_ITEMS],
  });

  await seedSitePageMarketingIfEmpty();

  for (let i = 0; i < DEFAULT_CATEGORY_TREE.length; i++) {
    const category = DEFAULT_CATEGORY_TREE[i];
    const hub = categoryHubEditorialSeed[category.slug];
    const existing = await Category.findOne(filterTopLevelBySlug(category.slug)).select("hubEditorial image").lean();
    const hasHub = Boolean(
      existing &&
        (existing as { hubEditorial?: { title?: string } }).hubEditorial?.title?.trim(),
    );
    const hasImage = Boolean((existing as { image?: string } | null)?.image?.trim());
    await Category.findOneAndUpdate(
      filterTopLevelBySlug(category.slug),
      {
        name: category.name,
        slug: category.slug,
        parentSlug: null,
        sortOrder: i,
        isActive: true,
        ...(!hasHub && hub ? { hubEditorial: hub } : {}),
        ...(!hasImage ? { image: categoryHeroImage(category.slug) } : {}),
      },
      { upsert: true },
    );
    for (let j = 0; j < category.subcategories.length; j++) {
      const sub = category.subcategories[j];
      await Category.findOneAndUpdate(
        { parentSlug: category.slug, slug: sub },
        {
          name: String(sub).replaceAll("-", " "),
          slug: sub,
          parentSlug: category.slug,
          sortOrder: j,
          isActive: true,
        },
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
