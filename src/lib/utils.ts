import { Game } from "@/types";
import { ShopLink } from "@/types";

export function calculatePremiumRank(
  usedPrice: number | null,
  originalPrice: number | null,
  defaultOriginalPrice: number = 5000
): number {
  if (usedPrice === null) return 1;
  const base = originalPrice ?? defaultOriginalPrice;
  if (base === 0) return 1;
  const ratio = usedPrice / base;
  if (ratio <= 1) return 1;
  if (ratio <= 2) return 2;
  if (ratio <= 5) return 3;
  if (ratio <= 10) return 4;
  return 5;
}

export function premiumRankToStars(rank: number): string {
  return "★".repeat(rank) + "☆".repeat(5 - rank);
}

export function formatPrice(price: number | null): string {
  if (price === null) return "—";
  return `¥${price.toLocaleString("ja-JP")}`;
}

export function formatSales(sales: number | null): string {
  if (sales === null) return "—";
  return `${sales}万本`;
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return "—";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "—";
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}/${m}/${d}`;
}

export function generateShopLinks(game: Game, consoleName: string): ShopLink[] {
  const query = encodeURIComponent(`${game.title} ${consoleName}`);
  return [
    { shop_name: "Amazon", url: `https://www.amazon.co.jp/s?k=${query}&tag=retrogamebank-22`, color: "#FF9900" },
    { shop_name: "楽天市場", url: `https://hb.afl.rakuten.co.jp/hgc/515df0a2.2aef5645.515df0a3.1323e0ba/?pc=${encodeURIComponent(`https://search.rakuten.co.jp/search/mall/${query}/`)}&link_type=hybrid_url`, color: "#BF0000" },
    { shop_name: "駿河屋", url: `https://www.suruga-ya.jp/search?category=&search_word=${query}`, color: "#1B4D8E" },
    { shop_name: "メルカリ", url: `https://www.mercari.com/jp/search/?keyword=${query}`, color: "#FF0211" },
    { shop_name: "ヤフオク!", url: `https://auctions.yahoo.co.jp/search/search?p=${query}`, color: "#FF0033" },
    { shop_name: "ブックオフ", url: `https://shopping.bookoff.co.jp/search?keyword=${query}`, color: "#0068B7" },
  ];
}

export const defaultOriginalPrices: Record<string, number> = {
  fc: 5000, sfc: 9800, gb: 3500, n64: 6800, gc: 6800, gba: 4800, ps1: 5800, ps2: 6800, md: 6800, ss: 5800,
};
