import { Metadata } from "next";
import { allGames } from "@/data/games";
import { getConsole } from "@/data/consoles";
import GameDetailClient from "./GameDetailClient";

export function generateStaticParams() {
  return allGames.map((game) => ({
    console: game.console_id,
    slug: game.slug,
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ console: string; slug: string }> }): Promise<Metadata> {
  const { console: consoleId, slug } = await params;
  const game = allGames.find((g) => g.console_id === consoleId && g.slug === slug);
  const consoleDef = getConsole(consoleId);
  const consoleName = consoleDef?.short_name ?? consoleId.toUpperCase();

  if (!game) {
    return { title: "ゲームが見つかりません | RetroGameBank" };
  }

  const priceInfo = game.current_used_price ? `中古¥${game.current_used_price.toLocaleString()}` : "";
  const desc = `${consoleName}「${game.title}」の価格情報。${priceInfo ? priceInfo + "。" : ""}${game.description}`;

  return {
    title: `${game.title}（${consoleName}）の価格・プレミア情報 | RetroGameBank`,
    description: desc.slice(0, 160),
    keywords: `${game.title},${consoleName},${consoleDef?.name ?? ""},${game.genre.join(",")},中古価格,プレミア,レトロゲーム`,
  };
}

export default function GameDetailPage({
  params,
}: {
  params: Promise<{ console: string; slug: string }>;
}) {
  return <GameDetailClient paramsPromise={params} />;
}
