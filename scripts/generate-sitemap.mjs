import { readdir } from "fs/promises";
import { writeFile } from "fs/promises";
import { join } from "path";

const BASE_URL = "https://retrogamebank.com";
const OUT_DIR = join(process.cwd(), "out");

async function getGamePaths() {
  const gamesDir = join(OUT_DIR, "games");
  const paths = [];
  try {
    const consoles = await readdir(gamesDir);
    for (const c of consoles) {
      const slugs = await readdir(join(gamesDir, c));
      for (const s of slugs) {
        paths.push(`/games/${c}/${s}`);
      }
    }
  } catch (e) {
    console.error("Error reading games dir:", e.message);
  }
  return paths;
}

async function main() {
  const gamePaths = await getGamePaths();
  const today = new Date().toISOString().split("T")[0];

  const staticPages = [
    { url: "/", priority: "1.0", freq: "weekly" },
    { url: "/ranking", priority: "0.8", freq: "weekly" },
    { url: "/privacy", priority: "0.3", freq: "yearly" },
  ];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  for (const p of staticPages) {
    xml += `  <url><loc>${BASE_URL}${p.url}</loc><lastmod>${today}</lastmod><changefreq>${p.freq}</changefreq><priority>${p.priority}</priority></url>\n`;
  }

  for (const path of gamePaths) {
    xml += `  <url><loc>${BASE_URL}${path}</loc><lastmod>${today}</lastmod><changefreq>monthly</changefreq><priority>0.6</priority></url>\n`;
  }

  xml += `</urlset>\n`;

  await writeFile(join(OUT_DIR, "sitemap.xml"), xml);
  console.log(`Sitemap generated: ${staticPages.length + gamePaths.length} URLs`);
}

main();
