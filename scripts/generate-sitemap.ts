/**
 * sitemap.xml 自動生成スクリプト
 * ビルド後に実行: npx ts-node scripts/generate-sitemap.ts
 */
import * as fs from "fs";
import * as path from "path";

// ゲームデータからインポートする代わりに、outディレクトリをスキャン
const BASE_URL = "https://retrogamebank.com";
const OUT_DIR = path.join(__dirname, "..", "out");

function getAllHtmlPaths(dir: string, basePath: string = ""): string[] {
  const paths: string[] = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.name.startsWith("_")) continue;
    const fullPath = path.join(dir, entry.name);
    const urlPath = basePath + "/" + entry.name;

    if (entry.isDirectory()) {
      paths.push(...getAllHtmlPaths(fullPath, urlPath));
    } else if (entry.name.endsWith(".html") && entry.name !== "404.html") {
      const cleanPath = urlPath.replace(/\.html$/, "").replace(/\/index$/, "") || "/";
      paths.push(cleanPath);
    }
  }

  return paths;
}

function generateSitemap(): void {
  const paths = getAllHtmlPaths(OUT_DIR);
  const today = new Date().toISOString().split("T")[0];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${paths
  .map(
    (p) => `  <url>
    <loc>${BASE_URL}${p}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${p === "/" || p.startsWith("/ranking") ? "daily" : "weekly"}</changefreq>
    <priority>${p === "/" ? "1.0" : p.startsWith("/ranking") ? "0.8" : "0.6"}</priority>
  </url>`
  )
  .join("\n")}
</urlset>`;

  fs.writeFileSync(path.join(OUT_DIR, "sitemap.xml"), sitemap);
  console.log(`Generated sitemap.xml with ${paths.length} URLs`);

  // robots.txt も生成
  const robots = `User-agent: *
Allow: /

Sitemap: ${BASE_URL}/sitemap.xml`;

  fs.writeFileSync(path.join(OUT_DIR, "robots.txt"), robots);
  console.log("Generated robots.txt");
}

generateSitemap();
