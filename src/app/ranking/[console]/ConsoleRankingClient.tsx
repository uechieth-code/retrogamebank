"use client";

import { useState, useMemo, use } from "react";
import { allGames } from "@/data/games";
import { getConsole, getMvpConsoles } from "@/data/consoles";
import { formatPrice, formatSales, formatDate, premiumRankToStars } from "@/lib/utils";

type RankingType = "premium" | "price_high" | "popular";

export default function ConsoleRankingClient({
  paramsPromise,
}: {
  paramsPromise: Promise<{ console: string }>;
}) {
  const { console: consoleId } = use(paramsPromise);
  const consoleDef = getConsole(consoleId);
  const consoleName = consoleDef?.short_name ?? consoleId.toUpperCase();
  const fullName = consoleDef?.name ?? consoleId;
  const consoles = getMvpConsoles();

  const [rankingType, setRankingType] = useState<RankingType>("premium");

  const consoleGames = useMemo(
    () => allGames.filter((g) => g.console_id === consoleId),
    [consoleId]
  );

  const rankedGames = useMemo(() => {
    const games = [...consoleGames];

    switch (rankingType) {
      case "premium":
        return games
          .filter((g) => g.premium_rank >= 1 && g.current_used_price !== null)
          .sort((a, b) => {
            if (b.premium_rank !== a.premium_rank) return b.premium_rank - a.premium_rank;
            return (b.current_used_price ?? 0) - (a.current_used_price ?? 0);
          });

      case "price_high":
        return games
          .filter((g) => g.current_used_price !== null)
          .sort((a, b) => (b.current_used_price ?? 0) - (a.current_used_price ?? 0));

      case "popular":
        return games
          .filter((g) => g.total_sales !== null)
          .sort((a, b) => (b.total_sales ?? 0) - (a.total_sales ?? 0));
    }
  }, [rankingType, consoleGames]);

  const rankingTabs: { type: RankingType; label: string }[] = [
    { type: "premium", label: "プレミア順" },
    { type: "price_high", label: "高額順" },
    { type: "popular", label: "売上順" },
  ];

  // 統計データ
  const stats = useMemo(() => {
    const withPrice = consoleGames.filter((g) => g.current_used_price !== null);
    const avgPrice = withPrice.length > 0
      ? Math.round(withPrice.reduce((sum, g) => sum + (g.current_used_price ?? 0), 0) / withPrice.length)
      : 0;
    const premiumCount = consoleGames.filter((g) => g.premium_rank >= 4).length;
    return { total: consoleGames.length, avgPrice, premiumCount };
  }, [consoleGames]);

  return (
    <div>
      {/* パンくず */}
      <div className="text-xs text-[var(--color-retro-text-dim)] mb-4">
        <a href="/" className="hover:text-[var(--color-retro-accent)]">トップ</a>
        {" > "}
        <a href="/ranking" className="hover:text-[var(--color-retro-accent)]">ランキング</a>
        {" > "}
        <span>{consoleName}</span>
      </div>

      <div className="text-center mb-6">
        <h1
          className="text-2xl md:text-3xl font-bold retro-glow mb-2"
          style={{ fontFamily: "var(--font-family-pixel)" }}
        >
          {fullName} ランキング
        </h1>
        <p className="text-[var(--color-retro-text-dim)] text-sm">
          {consoleName}ソフトのプレミア・高額・売上ランキング
        </p>
      </div>

      {/* 統計サマリー */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-[var(--color-retro-card)] border border-[var(--color-retro-border)] rounded-lg p-3 text-center">
          <p className="text-xs text-[var(--color-retro-text-dim)]">収録数</p>
          <p className="text-lg font-bold text-[var(--color-retro-accent)]">{stats.total}</p>
        </div>
        <div className="bg-[var(--color-retro-card)] border border-[var(--color-retro-border)] rounded-lg p-3 text-center">
          <p className="text-xs text-[var(--color-retro-text-dim)]">平均中古価格</p>
          <p className="text-lg font-bold text-[var(--color-retro-accent2)]">¥{stats.avgPrice.toLocaleString()}</p>
        </div>
        <div className="bg-[var(--color-retro-card)] border border-[var(--color-retro-border)] rounded-lg p-3 text-center">
          <p className="text-xs text-[var(--color-retro-text-dim)]">高プレミア</p>
          <p className="text-lg font-bold text-[var(--color-retro-red)]">{stats.premiumCount}本</p>
        </div>
      </div>

      {/* 他機種へのリンク */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-1.5">
          {consoles.map((c) => (
            <a
              key={c.id}
              href={`/ranking/${c.id}`}
              className={`px-2 py-1 rounded text-xs border transition-colors ${
                c.id === consoleId
                  ? "border-[var(--color-retro-accent)] text-[var(--color-retro-accent)] bg-[rgba(0,212,255,0.1)]"
                  : "border-[var(--color-retro-border)] text-[var(--color-retro-text-dim)] hover:border-[var(--color-retro-accent)]"
              }`}
            >
              {c.short_name}
            </a>
          ))}
        </div>
      </div>

      {/* ランキング種別タブ */}
      <div className="flex gap-2 mb-4">
        {rankingTabs.map((tab) => (
          <button
            key={tab.type}
            onClick={() => setRankingType(tab.type)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              rankingType === tab.type
                ? "bg-[var(--color-retro-accent)] text-[var(--color-retro-bg)]"
                : "bg-[var(--color-retro-card)] border border-[var(--color-retro-border)] text-[var(--color-retro-text-dim)] hover:border-[var(--color-retro-accent)]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <p className="text-xs text-[var(--color-retro-text-dim)] mb-4">
        {rankedGames.length}件
      </p>

      {/* ランキングリスト */}
      <div className="space-y-2">
        {rankedGames.map((game, index) => (
          <a
            key={game.id}
            href={`/games/${game.console_id}/${game.slug}`}
            className="game-card flex items-center gap-3 sm:gap-4 rounded-xl bg-[var(--color-retro-card)] p-3 sm:p-4"
          >
            <div
              className={`flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-lg font-bold text-sm sm:text-lg ${
                index < 3
                  ? "bg-[var(--color-retro-accent)] text-[var(--color-retro-bg)]"
                  : index < 10
                  ? "bg-[var(--color-retro-border)] text-[var(--color-retro-text)]"
                  : "bg-[var(--color-retro-border)] text-[var(--color-retro-text-dim)]"
              }`}
            >
              {index + 1}
            </div>

            <div className="flex-grow min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-xs premium-${game.premium_rank}`}>
                  {premiumRankToStars(game.premium_rank)}
                </span>
                {game.genre.slice(0, 2).map((g) => (
                  <span key={g} className="tag tag-genre text-xs">{g}</span>
                ))}
              </div>
              <h3 className="font-medium text-sm truncate">{game.title}</h3>
              <p className="text-xs text-[var(--color-retro-text-dim)] truncate">
                {game.publisher} / {formatDate(game.release_date)}
              </p>
            </div>

            <div className="flex-shrink-0 text-right">
              {rankingType === "popular" ? (
                <>
                  <p className="text-xs text-[var(--color-retro-text-dim)]">販売本数</p>
                  <p className="text-sm font-bold text-[var(--color-retro-green)]">
                    {formatSales(game.total_sales)}
                  </p>
                </>
              ) : (
                <>
                  <p className="text-xs text-[var(--color-retro-text-dim)]">中古</p>
                  <p className="text-sm font-bold text-[var(--color-retro-accent2)]">
                    {formatPrice(game.current_used_price)}
                  </p>
                </>
              )}
            </div>
          </a>
        ))}
      </div>

      {rankedGames.length === 0 && (
        <div className="text-center py-12">
          <p className="text-[var(--color-retro-text-dim)]">
            該当するソフトがありません
          </p>
        </div>
      )}
    </div>
  );
}
