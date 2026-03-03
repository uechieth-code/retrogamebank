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

function ConsoleJsonLd({ consoleId }: { consoleId: string }) {
  const consoleDef = getConsole(consoleId);
  const games = getGamesByConsole(consoleId);
  if (!consoleDef) return null;

  const fullName = consoleDef.name;
  const consoleName = consoleDef.short_name;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${fullName}（${consoleName}）ソフト一覧`,
    description: `${fullName}の全${games.length}タイトルの中古価格・プレミア情報`,
    url: `https://retrogamebank.com/games/${consoleId}`,
    isPartOf: {
      "@type": "WebSite",
      name: "レトロゲームバンク",
      url: "https://retrogamebank.com",
    },
    numberOfItems: games.length,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: games.length,
      itemListElement: games.slice(0, 10).map((game, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: `https://retrogamebank.com/games/${consoleId}/${game.slug}`,
        name: game.title,
      })),
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

function ConsoleBreadcrumbJsonLd({ consoleId }: { consoleId: string }) {
  const consoleDef = getConsole(consoleId);
  if (!consoleDef) return null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "トップ", item: "https://retrogamebank.com" },
      { "@type": "ListItem", position: 2, name: `${consoleDef.name}ソフト一覧` },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export default async function ConsoleGameListPage({
  params,
}: {
  params: Promise<{ console: string }>;
}) {
  const { console: consoleId } = await params;
  return (
    <>
      <ConsoleJsonLd consoleId={consoleId} />
      <ConsoleBreadcrumbJsonLd consoleId={consoleId} />
      <ConsoleGameListClient paramsPromise={params} />
    </>
  );
}
