"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { allGames } from "@/data/games";
import { getMvpConsoles, getConsole } from "@/data/consoles";
import { formatPrice, formatSales, formatDate, premiumRankToStars } from "@/lib/utils";

type RankingType = "premium" | "price_high" | "popular" | "newest";

export default function RankingPage() {
  const router = useRouter();
  const [rankingType, setRankingType] = useState<RankingType>("premium");
  const [consoleFilter, setConsoleFilter] = useState("");
  const [genreFilter, setGenreFilter] = useState("");
  const consoles = getMvpConsoles();

  // ジャンル一覧を取得
  const genres = useMemo(() => {
    const genreSet = new Set<string>();
    allGames.forEach((g) => g.genre.forEach((genre) => genreSet.add(genre)));
    return Array.from(genreSet).sort();
  }, []);

  const rankedGames = useMemo(() => {
    let games = [...allGames];

    if (consoleFilter) {
      games = games.filter((g) => g.console_id === consoleFilter);
    }
    if (genreFilter) {
      games = games.filter((g) => g.genre.includes(genreFilter));
    }

    switch (rankingType) {
      case "premium":
        return games
          .filter((g) => g.premium_rank >= 1 && g.current_used_price !== null)
          .sort((a, b) => {
            if (b.premium_rank !== a.premium_rank) return b.premium_rank - a.premium_rank;
            return (b.current_used_price ?? 0) - (a.current_used_price ?? 0);
          })
          .slice(0, 100);

      case "price_high":
        return games
          .filter((g) => g.current_used_price !== null)
          .sort((a, b) => (b.current_used_price ?? 0) - (a.current_used_price ?? 0))
          .slice(0, 100);

      case "popular":
        return games
          .filter((g) => g.total_sales !== null)
          .sort((a, b) => (b.total_sales ?? 0) - (a.total_sales ?? 0))
          .slice(0, 100);

      case "newest":
        return games
          .filter((g) => g.release_date)
          .sort((a, b) => b.release_date.localeCompare(a.release_date))
          .slice(0, 100);
    }
  }, [rankingType, consoleFilter, genreFilter]);

  const rankingTabs: { type: RankingType; label: string; desc: string }[] = [
    { type: "premium", label: "プレミア", desc: "プレミア度が高いソフト" },
    { type: "price_high", label: "高額", desc: "中古価格が高いソフト" },
    { type: "popular", label: "売上", desc: "販売本数が多いソフト" },
    { type: "newest", label: "新着", desc: "発売日が新しいソフト" },
  ];

  const getConsoleShortName = (id: string) => {
    const c = getConsole(id);
    return c?.short_name ?? id.toUpperCase();
  };

  const getRightColumnLabel = () => {
    switch (rankingType) {
      case "premium": return "中古価格";
      case "price_high": return "中古価格";
      case "popular": return "販売本数";
      case "newest": return "発売日";
    }
  };

  const getRightColumnValue = (game: typeof allGames[0]) => {
    switch (rankingType) {
      case "premium":
      case "price_high":
        return (
          <span className="text-sm font-bold text-[var(--color-retro-accent2)]">
            {formatPrice(game.current_used_price)}
          </span>
        );
      case "popular":
        return (
          <span className="text-sm font-bold text-[var(--color-retro-green)]">
            {formatSales(game.total_sales)}
          </span>
        );
      case "newest":
        return (
          <span className="text-sm text-[var(--color-retro-text-dim)]">
            {formatDate(game.release_date)}
          </span>
        );
    }
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
          レトロゲームソフトの各種ランキング TOP100
        </p>
      </div>

      {/* コンソール別ランキングへのリンク */}
      <div className="mb-8">
        <h2 className="text-sm font-bold text-[var(--color-retro-accent)] mb-3">機種別ランキング</h2>
        <div className="flex flex-wrap gap-2">
          {consoles.map((c) => (
            <a
              key={c.id}
              href={`/ranking/${c.id}`}
              className="px-3 py-1.5 rounded-lg text-xs border border-[var(--color-retro-border)] bg-[var(--color-retro-card)] text-[var(--color-retro-text-dim)] hover:border-[var(--color-retro-accent)] hover:text-[var(--color-retro-accent)] transition-colors"
            >
              {c.short_name}
            </a>
          ))}
        </div>
      </div>

      {/* ランキング種別タブ */}
      <div className="flex flex-wrap gap-2 mb-4">
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

      {/* フィルター */}
      <div className="flex flex-wrap gap-3 mb-6">
        <select
          className="retro-select text-sm"
          value={consoleFilter}
          onChange={(e) => setConsoleFilter(e.target.value)}
        >
          <option value="">全機種</option>
          {consoles.map((c) => (
            <option key={c.id} value={c.id}>
              {c.short_name}
            </option>
          ))}
        </select>
        <select
          className="retro-select text-sm"
          value={genreFilter}
          onChange={(e) => setGenreFilter(e.target.value)}
        >
          <option value="">全ジャンル</option>
          {genres.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>
      </div>

      {/* 現在の条件 */}
      <p className="text-xs text-[var(--color-retro-text-dim)] mb-4">
        {rankingTabs.find((t) => t.type === rankingType)?.desc}
        {consoleFilter && ` / ${getConsoleShortName(consoleFilter)}`}
        {genreFilter && ` / ${genreFilter}`}
        {` — ${rankedGames.length}件`}
      </p>

      {/* ランキングリスト */}
      <div className="space-y-2">
        {rankedGames.map((game, index) => (
          <a
            key={game.id}
            href={`/games/${game.console_id}/${game.slug}`}
            className="game-card flex items-center gap-3 sm:gap-4 rounded-xl bg-[var(--color-retro-card)] p-3 sm:p-4"
          >
            {/* 順位 */}
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
              <p className="text-xs text-[var(--color-retro-text-dim)] truncate">
                {game.publisher}
              </p>
            </div>

            {/* 価格/データ */}
            <div className="flex-shrink-0 text-right">
              <p className="text-xs text-[var(--color-retro-text-dim)]">{getRightColumnLabel()}</p>
              {getRightColumnValue(game)}
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
