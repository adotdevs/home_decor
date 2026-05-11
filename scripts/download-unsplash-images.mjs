/**
 * Downloads royalty-free Unsplash photos for local use (no runtime hotlinking).
 * Run: node scripts/download-unsplash-images.mjs
 * License: Unsplash License — https://unsplash.com/license
 */
import https from "https";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

const images = [
  { dest: "public/images/heroes/editorial-living.jpg", id: "1586023492125-27b2c045efd7" },
  { dest: "public/images/heroes/luxe-bedroom.jpg", id: "1616594039964-ae9021a400a0" },
  { dest: "public/images/heroes/open-kitchen.jpg", id: "1556911220-bff31c812dba" },
  { dest: "public/images/heroes/spa-bathroom.jpg", id: "1600566753190-17f0baa2a6c3" },
  { dest: "public/images/heroes/dining-table.jpg", id: "1617806118233-18e1de247200" },
  { dest: "public/images/categories/bedroom-living.jpg", id: "1631889997288-ba29c9f5c3d4" },
  { dest: "public/images/categories/bathroom-detail.jpg", id: "1620626011761-886a3697f9a0" },
  { dest: "public/images/categories/kitchen-light.jpg", id: "1556909111010-1962c7d6f500" },
  { dest: "public/images/categories/decor-vignette.jpg", id: "1616486339818-6d7b9a1d7c5f" },
  { dest: "public/images/categories/wall-art-room.jpg", id: "1513519245088-0e12902e5a38" },
  { dest: "public/images/categories/kids-color.jpg", id: "1566576913087-17b5d4b5f0e8" },
  { dest: "public/images/articles/bedding-texture.jpg", id: "1522771739686-4e94380a7b5c" },
  { dest: "public/images/articles/linen-curtains.jpg", id: "1583847260802-4f2a8a2e2a2e" },
  { dest: "public/images/articles/throw-blanket.jpg", id: "1505693416988-bac706d1c5b0" },
  { dest: "public/images/articles/coffee-station.jpg", id: "1495474472287-4d71b4f7d8c2" },
  { dest: "public/images/articles/tablescape.jpg", id: "1466978913421-dad2b2a4e1d2" },
  { dest: "public/images/articles/plants-shelf.jpg", id: "1416879595882-3373a0f69385" },
  { dest: "public/images/articles/candles-mood.jpg", id: "1602874809961-4a9d3a6e1b8f" },
  { dest: "public/images/gallery/masonry-01.jpg", id: "1582719478250-7fc49ba9b4a2" },
  { dest: "public/images/gallery/masonry-02.jpg", id: "1555043085-7f3a3d3c5b3d" },
  { dest: "public/images/gallery/masonry-03.jpg", id: "1502005229762-cb4c2e5a5d2e" },
  { dest: "public/images/gallery/masonry-04.jpg", id: "1556228578-6b2a7e3b1e2a" },
  { dest: "public/images/gallery/masonry-05.jpg", id: "1578500499017-8c4b2a3c5d6e" },
  { dest: "public/images/gallery/masonry-06.jpg", id: "1600212495559-3a2b4c5d6e7f" },
  { dest: "public/images/seasonal/spring-light.jpg", id: "1490750967868-88a6bfd21ea5" },
  { dest: "public/images/seasonal/summer-terrace.jpg", id: "1600596545845-dcdc7e5d5b8f" },
  { dest: "public/images/seasonal/autumn-warm.jpg", id: "1506905925346-21b2a4e5a5a5" },
  { dest: "public/images/seasonal/winter-cozy.jpg", id: "1513694203232-5d3ebff1c05a" },
];

function urlFor(id) {
  return `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1800&q=85&fm=jpg`;
}

function download(url, destPath) {
  return new Promise((resolve, reject) => {
    const full = path.join(root, destPath);
    fs.mkdirSync(path.dirname(full), { recursive: true });
    const file = fs.createWriteStream(full);
    https
      .get(url, (res) => {
        if (res.statusCode === 301 || res.statusCode === 302) {
          const loc = res.headers.location;
          if (!loc) return reject(new Error("redirect no location"));
          res.resume();
          return download(loc, destPath).then(resolve).catch(reject);
        }
        if (res.statusCode !== 200) {
          res.resume();
          return reject(new Error(`HTTP ${res.statusCode} for ${url}`));
        }
        res.pipe(file);
        file.on("finish", () => {
          file.close();
          resolve();
        });
      })
      .on("error", (err) => {
        fs.unlink(full, () => {});
        reject(err);
      });
  });
}

async function main() {
  for (const { dest, id } of images) {
    const u = urlFor(id);
    process.stdout.write(`Downloading ${dest} ... `);
    try {
      await download(u, dest);
      console.log("ok");
    } catch (e) {
      console.log("FAIL", e.message);
    }
  }
  console.log("Done.");
}

main();
