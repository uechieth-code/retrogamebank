"use client";

import { use } from "react";
import { getGameBySlug, allGames } from "@/data/games";
import { getConsole } from "@/data/consoles";
import { getPriceHistory } from "@/data/price-history";
import {
  formatPrice,
  formatSales,
  formatDate,
  premiumRankToStars,
  generateShopLinks,
  calculatePremiumRank,
  defaultOriginalPrices,
} from "@/lib/utils";
import PriceChart from "@/components/PriceChart";
import type { Game } from "@/types";

export default function GameDetailClient({
  paramsPromise,
}: {
  paramsPromise: Promise<{ console: string; slug: string }>;
}) {
  const params = use(paramsPromise);
  const consoleId = params.console;
  const slug = params.slug;

  const game = getGameBySlug(consoleId, slug);
  const consoleInfo = getConsole(consoleId);

  if (!game || !consoleInfo) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-[var(--color-retro-accent2)]">
          ソフトが見つかりません
        </h2>
        <p className="text-[var(--color-retro-text-dim)] mt-2">
          URLが正しいかご確認ください
        </p>
        <a
          href="/"
          className="inline-block mt-4 px-6 py-2 rounded-lg bg-[var(--color-retro-accent)] text-[var(--color-retro-bg)] font-bold"
        >
          一覧に戻る
        </a>
      </div>
    );
  }

  const priceHistory = getPriceHistory(game.id);
  const shopLinks = generateShopLinks(game, consoleInfo.short_name);

  const basePrice =
    game.original_price ?? defaultOriginalPrices[consoleId] ?? 5000;
  const premiumRank = calculatePremiumRank(
    game.current_used_price,
    game.original_price,
    defaultOriginalPrices[consoleId]
  );
  const deviationRate =
    game.current_used_price !== null
      ? ((game.current_used_price - basePrice) / basePrice) * 100
      : null;

  const relatedGames = allGames
    .filter(
      (g) =>
        g.id !== game.id &&
        (g.publisher === game.publisher ||
          g.genre.some((genre) => game.genre.includes(genre)) ||
          g.console_id === game.console_id)
    )
    .slice(0, 6);

  const premiumLabels: Record<number, string> = {
    1: "一般的な中古ソフト",
    2: "やや入手しにくい",
    3: "プレミア化の兆候",
    4: "プレミアソフト",
    5: "激レアソフト",
  };

  return (
    <div>
      {/* パンくずリスト */}
      <nav className="text-sm text-[var(--color-retro-text-dim)] mb-6">
        <a href="/" className="hover:text-[var(--color-retro-accent)]">
          ソフト一覧
        </a>
        <span className="mx-2">/</span>
        <span className="text-[var(--color-retro-text)]">{game.title}</span>
      </nav>

      {/* メイン情報 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左カラム */}
        <div className="lg:col-span-2">
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <span className="tag tag-console text-base">
                {consoleInfo.short_name}
              </span>
              <span className={`text-lg premium-${premiumRank}`}>
                {premiumRankToStars(premiumRank)}
              </span>
            </div>
            <h1
              className="text-2xl md:text-3xl font-bold retro-glow"
              style={{ fontFamily: "var(--font-family-pixel)" }}
            >
              {game.title}
            </h1>
          </div>

          {/* 基本情報テーブル */}
          <div className="bg-[var(--color-retro-card)] border border-[var(--color-retro-border)] rounded-xl p-6 mb-6">
            <h2 className="text-lg font-bold text-[var(--color-retro-accent)] mb-4">
              基本情報
            </h2>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6">
              <div>
                <dt className="text-xs text-[var(--color-retro-text-dim)]">対応機種</dt>
                <dd>{consoleInfo.name}</dd>
              </div>
              <div>
                <dt className="text-xs text-[var(--color-retro-text-dim)]">メーカー / 開発</dt>
                <dd>
                  {game.publisher}
                  {game.developer !== game.publisher && ` / ${game.developer}`}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-[var(--color-retro-text-dim)]">発売日</dt>
                <dd>{formatDate(game.release_date)}</dd>
              </div>
              <div>
                <dt className="text-xs text-[var(--color-retro-text-dim)]">定価</dt>
                <dd>{game.original_price ? formatPrice(game.original_price) : "—（税抜）"}</dd>
              </div>
              <div>
                <dt className="text-xs text-[var(--color-retro-text-dim)]">ジャンル</dt>
                <dd className="flex flex-wrap gap-1">
                  {game.genre.map((g) => (
                    <span key={g} className="tag tag-genre">{g}</span>
                  ))}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-[var(--color-retro-text-dim)]">プレイ人数</dt>
                <dd>{game.player_count}</dd>
              </div>
              <div>
                <dt className="text-xs text-[var(--color-retro-text-dim)]">累計販売本数</dt>
                <dd>{game.total_sales !== null ? `${formatSales(game.total_sales)}（推定）` : "—"}</dd>
              </div>
            </dl>
          </div>

          {/* ゲーム概要 */}
          <div className="bg-[var(--color-retro-card)] border border-[var(--color-retro-border)] rounded-xl p-6 mb-6">
            <h2 className="text-lg font-bold text-[var(--color-retro-accent)] mb-3">ゲーム概要</h2>
            <p className="text-[var(--color-retro-text)] leading-relaxed">{game.description}</p>
          </div>

          {/* 価格推移グラフ */}
          <div className="bg-[var(--color-retro-card)] border border-[var(--color-retro-border)] rounded-xl p-6 mb-6">
            <h2 className="text-lg font-bold text-[var(--color-retro-accent)] mb-4">価格推移</h2>
            {priceHistory.length > 0 ? (
              <PriceChart priceHistory={priceHistory} originalPrice={game.original_price} />
            ) : (
              <p className="text-[var(--color-retro-text-dim)] text-center py-8">
                価格履歴データはまだありません。Phase 2で実データの蓄積を開始します。
              </p>
            )}
          </div>
        </div>

        {/* 右カラム */}
        <div className="lg:col-span-1">
          {/* 現在の価格 */}
          <div className="bg-[var(--color-retro-card)] border border-[var(--color-retro-border)] rounded-xl p-6 mb-6">
            <h2 className="text-lg font-bold text-[var(--color-retro-accent)] mb-4">現在の価格</h2>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-[var(--color-retro-text-dim)]">新品</p>
                <p className="text-2xl font-bold text-[#4da6ff]">{formatPrice(game.current_new_price)}</p>
              </div>
              <div>
                <p className="text-xs text-[var(--color-retro-text-dim)]">中古</p>
                <p className="text-2xl font-bold text-[var(--color-retro-accent2)]">{formatPrice(game.current_used_price)}</p>
              </div>
            </div>
          </div>

          {/* プレミア情報 */}
          <div className="bg-[var(--color-retro-card)] border border-[var(--color-retro-border)] rounded-xl p-6 mb-6">
            <h2 className="text-lg font-bold text-[var(--color-retro-accent)] mb-4">プレミア情報</h2>
            <div className="text-center mb-3">
              <span className={`text-2xl premium-${premiumRank}`}>
                {premiumRankToStars(premiumRank)}
              </span>
              <p className={`text-sm mt-1 premium-${premiumRank}`}>
                {premiumLabels[premiumRank]}
              </p>
            </div>
            {deviationRate !== null && (
              <p className="text-sm text-center text-[var(--color-retro-text-dim)]">
                定価比：
                <span className={deviationRate > 0 ? "text-[var(--color-retro-accent2)]" : "text-[var(--color-retro-green)]"}>
                  {deviationRate > 0 ? "+" : ""}{deviationRate.toFixed(0)}%
                </span>
              </p>
            )}
          </div>

          {/* ショップリンク */}
          <div className="bg-[var(--color-retro-card)] border border-[var(--color-retro-border)] rounded-xl p-6 mb-6">
            <h2 className="text-lg font-bold text-[var(--color-retro-accent)] mb-4">購入先を探す</h2>
            <div className="space-y-3">
              {shopLinks.map((link) => (
                <a
                  key={link.shop_name}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shop-btn w-full justify-center text-sm"
                  style={{ backgroundColor: link.color }}
                >
                  {link.shop_name}で探す →
                </a>
              ))}
            </div>
            <p className="text-xs text-[var(--color-retro-text-dim)] mt-3">
              ※各ショップの検索結果ページに遷移します
            </p>
          </div>
        </div>
      </div>

      {/* 関連ソフト */}
      {relatedGames.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-bold text-[var(--color-retro-accent)] mb-4">関連ソフト</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {relatedGames.map((rg) => (
              <RelatedGameCard key={rg.id} game={rg} />
            ))}
          </div>
        </div>
      )}

      {/* 構造化データ（JSON-LD） */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            name: game.title,
            description: game.description,
            brand: { "@type": "Brand", name: game.publisher },
            offers: {
              "@type": "AggregateOffer",
              priceCurrency: "JPY",
              lowPrice: game.current_used_price ?? game.current_new_price ?? undefined,
              highPrice: game.current_new_price ?? game.current_used_price ?? undefined,
              offerCount: 6,
            },
          }),
        }}
      />
    </div>
  );
}

function RelatedGameCard({ game }: { game: Game }) {
  const consoleInfo = getConsole(game.console_id);
  return (
    <a
      href={`/games/${game.console_id}/${game.slug}`}
      className="game-card block rounded-xl bg-[var(--color-retro-card)] p-4"
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="tag tag-console text-xs">{consoleInfo?.short_name}</span>
        <span className={`text-xs premium-${game.premium_rank}`}>
          {premiumRankToStars(game.premium_rank)}
        </span>
      </div>
      <h3 className="font-medium text-sm mb-1">{game.title}</h3>
      <p className="text-xs text-[var(--color-retro-text-dim)]">
        {game.publisher} / {formatDate(game.release_date)}
      </p>
      <div className="flex justify-between items-center mt-2">
        <span className="text-xs text-[var(--color-retro-text-dim)]">中古</span>
        <span className="text-sm font-bold text-[var(--color-retro-accent2)]">
          {formatPrice(game.current_used_price)}
        </span>
      </div>
    </a>
  );
}
