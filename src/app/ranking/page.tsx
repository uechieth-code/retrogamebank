"use client";

import { useState, useMemo } from "react";
import { allGames } from "@/data/games";
import { getMvpConsoles } from "@/data/consoles";
import { formatPrice, formatSales, formatDate, premiumRankToStars } from "@/lib/utils";
import type { Game } from "@/types";

type RankingType = "premium" | "price_surge" | "popular" | "console_sales";

export default function RankingPage() {
  const [rankingType, setRankingType] = useState<RankingType>("premium");
  const [consoleFilter, setConsoleFilter] = useState("");
  const consoles = getMvpConsoles();

  const rankedGames = useMemo(() => {
    let games = [...allGames];

    if (consoleFilter) {
      games = games.filter((g) => g.console_id === consoleFilter);
    }

    switch (rankingType) {
      case "premium":
        return games
          .filter((g) => g.premium_rank >= 1)
          .sort((a, b) => {
            if (b.premium_rank !== a.premium_rank) return b.premium_rank - a.premium_rank;
            return (b.current_used_price ?? 0) - (a.current_used_price ?? 0);
          })
          .slice(0, 50);

      case "price_surge":
        return games
          .filter((g) => g.current_used_price !== null && g.original_price !== null)
          .map((g) => ({
            ...g,
            _surgeRatio: g.current_used_price! / g.original_price!,
          }))
          .sort((a, b) => b._surgeRatio - a._surgeRatio)
          .slice(0, 50);

      case "popular":
        return games
          .filter((g) => g.total_sales !== null)
          .sort((a, b) => (b.total_sales ?? 0) - (a.total_sales ?? 0))
          .slice(0, 50);

      case "console_sales":
        return games
          .filter((g) => g.total_sales !== null)
          .sort((a, b) => (b.total_sales ?? 0) - (a.total_sales ?? 0))
          .slice(0, 50);
    }
  }, [rankingType, consoleFilter]);

  const rankingTabs: { type: RankingType; label: string }[] = [
    { type: "premium", label: "プレミアソフト順" },
    { type: "price_surge", label: "価格急騰順" },
    { type: "popular", label: "人気順（売上）" },
    { type: "console_sales", label: "機種別売上順" },
  ];

  const getConsoleShortName = (id: string) => {
    const c = consoles.find((c) => c.id === id);
    return c?.short_name ?? id.toUpperCase();
  };

  return (
    <div>
      <div className="text-center mb-8">
        <h1
          className="text-3xl md:text-4xl font-bold retro-glow mb-2"
          style={{ fontFamily: "var(--font-family-pixel)" }}
        >
          ランキング
        </h1>
        <p className="text-[var(--color-retro-text-dim)]">
          レトロゲームソフトの各種ランキング
        </p>
      </div>

      {/* ランキング種別タブ */}
      <div className="flex flex-wrap gap-2 mb-6">
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

      {/* 機種フィルター */}
      <div className="mb-6">
        <select
          className="retro-select"
          value={consoleFilter}
          onChange={(e) => setConsoleFilter(e.target.value)}
        >
          <option value="">全機種</option>
          {consoles.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}（{c.short_name}）
            </option>
          ))}
        </select>
      </div>

      {/* ランキングリスト */}
      <div className="space-y-2">
        {rankedGames.map((game, index) => (
          <a
            key={game.id}
            href={`/games/${game.console_id}/${game.slug}`}
            className="game-card flex items-center gap-4 rounded-xl bg-[var(--color-retro-card)] p-4"
          >
            {/* 順位 */}
            <div
              className={`flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-lg font-bold text-lg ${
                index < 3
                  ? "bg-[var(--color-retro-accent)] text-[var(--color-retro-bg)]"
                  : "bg-[var(--color-retro-border)] text-[var(--color-retro-text-dim)]"
              }`}
            >
              {index + 1}
            </div>

            {/* ゲーム情報 */}
            <div className="flex-grow min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="tag tag-console text-xs">
                  {getConsoleShortName(game.console_id)}
                </span>
                <span className={`text-xs premium-${game.premium_rank}`}>
                  {premiumRankToStars(game.premium_rank)}
                </span>
              </div>
              <h3 className="font-medium text-sm truncate">{game.title}</h3>
              <p className="text-xs text-[var(--color-retro-text-dim)]">
                {game.publisher} / {formatDate(game.release_date)}
              </p>
            </div>

            {/* 価格/データ */}
            <div className="flex-shrink-0 text-right">
              {rankingType === "popular" || rankingType === "console_sales" ? (
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
