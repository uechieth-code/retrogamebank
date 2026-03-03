import { Metadata } from "next";
import { allGames } from "@/data/games";
import { getConsole, mvpConsoleIds } from "@/data/consoles";
import ConsoleRankingClient from "./ConsoleRankingClient";

export function generateStaticParams() {
  return mvpConsoleIds.map((id) => ({ console: id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ console: string }>;
}): Promise<Metadata> {
  const { console: consoleId } = await params;
  const consoleDef = getConsole(consoleId);
  const consoleName = consoleDef?.short_name ?? consoleId.toUpperCase();
  const fullName = consoleDef?.name ?? consoleId;
  const gameCount = allGames.filter((g) => g.console_id === consoleId).length;

  return {
    title: `${fullName}（${consoleName}）プレミアソフトランキング | RetroGameBank`,
    description: `${fullName}のプレミアソフト・高額ソフトランキング。${gameCount}タイトルの中古価格・新品価格・販売本数データを収録。`,
    keywords: `${fullName},${consoleName},プレミアソフト,高額ソフト,レアソフト,中古価格,ランキング,レトロゲーム`,
  };
}

export default function ConsoleRankingPage({
  params,
}: {
  params: Promise<{ console: string }>;
}) {
  return <ConsoleRankingClient paramsPromise={params} />;
}
