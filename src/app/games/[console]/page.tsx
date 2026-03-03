import { Metadata } from "next";
import { getMvpConsoles, getConsole, mvpConsoleIds } from "@/data/consoles";
import { getGamesByConsole } from "@/data/games";
import ConsoleGameListClient from "./ConsoleGameListClient";

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
  const gameCount = getGamesByConsole(consoleId).length;

  const title = `${fullName}（${consoleName}）ソフト一覧 | RetroGameBank`;
  const description = `${fullName}の全${gameCount}タイトルを掲載。中古価格・新品価格・プレミアランク・販売本数を検索・比較できます。${consoleDef?.manufacturer ?? ""}の${fullName}ソフトをお探しなら。`;
  const url = `https://retrogamebank.com/games/${consoleId}`;

  return {
    title,
    description,
    keywords: `${fullName},${consoleName},ソフト一覧,一覧,検索,中古価格,新品価格,プレミア,レトロゲーム,相場`,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      locale: "ja_JP",
      siteName: "レトロゲームバンク",
      title,
      description,
      url,
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}

export default function ConsoleGameListPage({
  params,
}: {
  params: Promise<{ console: string }>;
}) {
  return <ConsoleGameListClient paramsPromise={params} />;
}
