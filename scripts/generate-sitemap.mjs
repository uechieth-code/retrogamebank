import { readdir } from "fs/promises";
import { writeFile } from "fs/promises";
import { join } from "path";

const BASE_URL = "https://retrogamebank.com";
const OUT_DIR = join(process.cwd(), "out");

/**
 * パスの各セグメントをURLエンコードする
 * 例: /games/fc/ドンキーコング → /games/fc/%E3%83%89%E3%83%B3%E3%82%AD...
 */
function encodePathSegments(path) {
  return path
    .split("/")
    .map((segment) => (segment === "" ? "" : encodeURIComponent(segment)))
    .join("/");
}

/**
 * XML特殊文字をエスケープする
 */
function escapeXml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * コンソール一覧ページのパスを取得する
 * 例: /games/fc, /games/sfc, ...
 */
async function getConsolePaths() {
  const gamesDir = join(OUT_DIR, "games");
  const paths = [];
  try {
    const entries = await readdir(gamesDir);
    for (const e of entries) {
      if (!e.includes(".")) {
        paths.push(`/games/${e}`);
      }
    }
  } catch (e) {
    console.error("Error reading consoles:", e.message);
  }
  return paths;
}

async function getGamePaths() {
  const gamesDir = join(OUT_DIR, "games");
  const paths = [];
  try {
    const consoles = await readdir(gamesDir);
    for (const c of consoles) {
      if (c.includes(".")) continue; // skip files like .html
      const slugs = await readdir(join(gamesDir, c));
      for (const s of slugs) {
        if (s.includes(".")) continue; // skip .html/.txt files, only directories
        paths.push(`/games/${c}/${s}`);
      }
    }
  } catch (e) {
    console.error("Error reading games dir:", e.message);
  }
  return paths;
}

async function getRankingConsolePaths() {
  const rankingDir = join(OUT_DIR, "ranking");
  const paths = [];
  try {
    const entries = await readdir(rankingDir);
    for (const e of entries) {
      if (!e.includes(".")) {
        paths.push(`/ranking/${e}`);
      }
    }
  } catch (e) {
    console.error("Error reading ranking dir:", e.message);
  }
  return paths;
}

async function main() {
  const consolePaths = await getConsolePaths();
  const gamePaths = await getGamePaths();
  const rankingPaths = await getRankingConsolePaths();

  const today = new Date().toISOString().split("T")[0];

  const staticPages = [
    { url: "/", priority: "1.0", freq: "weekly" },
    { url: "/ranking", priority: "0.8", freq: "weekly" },
    { url: "/minigame", priority: "0.7", freq: "monthly" },
    { url: "/minigame/runner", priority: "0.5", freq: "monthly" },
    { url: "/minigame/shooter", priority: "0.5", freq: "monthly" },
    { url: "/minigame/puyo", priority: "0.5", freq: "monthly" },
    { url: "/minigame/breakout", priority: "0.5", freq: "monthly" },
    { url: "/minigame/flappy", priority: "0.5", freq: "monthly" },
    { url: "/minigame/maze", priority: "0.5", freq: "monthly" },
    { url: "/minigame/survivors", priority: "0.5", freq: "monthly" },
    { url: "/terms", priority: "0.3", freq: "yearly" },
    { url: "/privacy", priority: "0.3", freq: "yearly" },
    { url: "/contact", priority: "0.3", freq: "yearly" },
  ];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  // Static pages
  for (const p of staticPages) {
    const encodedUrl = escapeXml(`${BASE_URL}${encodePathSegments(p.url)}`);
    xml += `  <url><loc>${encodedUrl}</loc><lastmod>${today}</lastmod><changefreq>${p.freq}</changefreq><priority>${p.priority}</priority></url>\n`;
  }

  // Console listing pages (high priority for SEO)
  for (const path of consolePaths) {
    const encodedUrl = escapeXml(`${BASE_URL}${encodePathSegments(path)}`);
    xml += `  <url><loc>${encodedUrl}</loc><lastmod>${today}</lastmod><changefreq>weekly</changefreq><priority>0.8</priority></url>\n`;
  }

  // Ranking pages
  for (const path of rankingPaths) {
    const encodedUrl = escapeXml(`${BASE_URL}${encodePathSegments(path)}`);
    xml += `  <url><loc>${encodedUrl}</loc><lastmod>${today}</lastmod><changefreq>weekly</changefreq><priority>0.7</priority></url>\n`;
  }

  // Individual game pages
  for (const path of gamePaths) {
    const encodedUrl = escapeXml(`${BASE_URL}${encodePathSegments(path)}`);
    xml += `  <url><loc>${encodedUrl}</loc><lastmod>${today}</lastmod><changefreq>monthly</changefreq><priority>0.6</priority></url>\n`;
  }

  xml += `</urlset>\n`;

  const total = staticPages.length + consolePaths.length + rankingPaths.length + gamePaths.length;
  await writeFile(join(OUT_DIR, "sitemap.xml"), xml);
  console.log(`Sitemap generated: ${total} URLs (${staticPages.length} static + ${consolePaths.length} console listings + ${rankingPaths.length} ranking + ${gamePaths.length} games)`);
}

main();
