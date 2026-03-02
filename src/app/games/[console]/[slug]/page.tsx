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

function GameJsonLd({ consoleId, slug }: { consoleId: string; slug: string }) {
  const game = allGames.find((g) => g.console_id === consoleId && g.slug === slug);
  if (!game) return null;

  const consoleDef = getConsole(consoleId);
  const consoleName = consoleDef?.short_name ?? consoleId.toUpperCase();

  const offers: Record<string, unknown>[] = [];
  if (game.current_used_price) {
    offers.push({
      "@type": "Offer",
      name: "中古",
      price: game.current_used_price,
      priceCurrency: "JPY",
      itemCondition: "https://schema.org/UsedCondition",
      availability: "https://schema.org/InStock",
    });
  }
  if (game.current_new_price) {
    offers.push({
      "@type": "Offer",
      name: "新品",
      price: game.current_new_price,
      priceCurrency: "JPY",
      itemCondition: "https://schema.org/NewCondition",
      availability: "https://schema.org/InStock",
    });
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `${game.title}（${consoleName}）`,
    description: game.description,
    brand: { "@type": "Organization", name: game.publisher },
    category: `ビデオゲーム > ${consoleName}`,
    ...(game.release_date && { releaseDate: game.release_date }),
    ...(offers.length > 0 && {
      offers: offers.length === 1 ? offers[0] : { "@type": "AggregateOffer", offers },
    }),
    additionalProperty: [
      { "@type": "PropertyValue", name: "機種", value: consoleName },
      { "@type": "PropertyValue", name: "ジャンル", value: game.genre.join(", ") },
      ...(game.total_sales !== null
        ? [{ "@type": "PropertyValue", name: "販売本数", value: `${game.total_sales}万本` }]
        : []),
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export default async function GameDetailPage({
  params,
}: {
  params: Promise<{ console: string; slug: string }>;
}) {
  const { console: consoleId, slug } = await params;
  return (
    <>
      <GameJsonLd consoleId={consoleId} slug={slug} />
      <GameDetailClient paramsPromise={params} />
    </>
  );
}
