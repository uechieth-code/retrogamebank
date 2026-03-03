"use client";

import { useState, useMemo, use } from "react";
import { getGamesByConsole } from "@/data/games";
import { getConsole, getMvpConsoles } from "@/data/consoles";
import { formatPrice, formatDate, premiumRankToStars } from "@/lib/utils";
import { Game } from "@/types";

const GAMES_PER_PAGE = 50;

export default function ConsoleGameListClient({
  paramsPromise,
}: {
  paramsPromise: Promise<{ console: string }>;
}) {
  const { console: consoleId } = use(paramsPromise);
  const consoleDef = getConsole(consoleId);
  const consoleName = consoleDef?.short_name ?? consoleId.toUpperCase();
  const fullName = consoleDef?.name ?? consoleId;
  const consoles = getMvpConsoles();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [priceMin, setPriceMin] = useState<string>("");
  const [priceMax, setPriceMax] = useState<string>("");
  const [minPremiumRank, setMinPremiumRank] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<"title" | "release_date" | "price_used" | "price_new">("title");
  const [currentPage, setCurrentPage] = useState(1);

  const consoleGames = useMemo(
    () => getGamesByConsole(consoleId),
    [consoleId]
  );

  const allGenres = useMemo(() => {
    const genres = new Set<string>();
    consoleGames.forEach((g) => g.genre.forEach((genre) => genres.add(genre)));
    return Array.from(genres).sort();
  }, [consoleGames]);

  const filteredGames = useMemo(() => {
    let games = [...consoleGames];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      games = games.filter(
        (g) =>
          g.title.toLowerCase().includes(query) ||
          g.publisher.toLowerCase().includes(query)
      );
    }

    // Genre filter
    if (selectedGenre) {
      games = games.filter((g) => g.genre.includes(selectedGenre));
    }

    // Price filter (used price)
    const minPrice = priceMin ? parseInt(priceMin, 10) : null;
    const maxPrice = priceMax ? parseInt(priceMax, 10) : null;
    if (minPrice !== null || maxPrice !== null) {
      games = games.filter((g) => {
        if (g.current_used_price === null) return false;
        if (minPrice !== null && g.current_used_price < minPrice) return false;
        if (maxPrice !== null && g.current_used_price > maxPrice) return false;
        return true;
      });
    }

    // Premium rank filter
    if (minPremiumRank !== null) {
      games = games.filter((g) => g.premium_rank >= minPremiumRank);
    }

    return games;
  }, [consoleGames, searchQuery, selectedGenre, priceMin, priceMax, minPremiumRank]);

  const sortedGames = useMemo(() => {
    const games = [...filteredGames];

    switch (sortBy) {
      case "title":
        return games.sort((a, b) => a.title.localeCompare(b.title, "ja"));
      case "release_date":
        return games.sort((a, b) => {
          if (!a.release_date) return 1;
          if (!b.release_date) return -1;
          return b.release_date.localeCompare(a.release_date);
        });
      case "price_used":
        return games.sort(
          (a, b) => (b.current_used_price ?? 0) - (a.current_used_price ?? 0)
        );
      case "price_new":
        return games.sort(
          (a, b) => (b.current_new_price ?? 0) - (a.current_new_price ?? 0)
        );
      default:
        return games;
    }
  }, [filteredGames, sortBy]);

  const totalPages = Math.ceil(sortedGames.length / GAMES_PER_PAGE);
  const paginatedGames = useMemo(() => {
    const start = (currentPage - 1) * GAMES_PER_PAGE;
    return sortedGames.slice(start, start + GAMES_PER_PAGE);
  }, [sortedGames, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const stats = useMemo(() => {
    const withPrice = consoleGames.filter((g) => g.current_used_price !== null);
    const avgPrice =
      withPrice.length > 0
        ? Math.round(
            withPrice.reduce((sum, g) => sum + (g.current_used_price ?? 0), 0) /
              withPrice.length
          )
        : 0;
    return { total: consoleGames.length, avgPrice };
  }, [consoleGames]);

  return (
    <div>
      {/* パンくず */}
      <div className="text-xs text-[var(--color-retro-text-dim)] mb-4">
        <a href="/" className="hover:text-[var(--color-retro-accent)]">
          トップ
        </a>
        {" > "}
        <a href="/ranking" className="hover:text-[var(--color-retro-accent)]">
          機種別
        </a>
        {" > "}
        <span>{consoleName}</span>
      </div>

      {/* ヘッダー */}
      <div className="text-center mb-6">
        <h1
          className="text-2xl md:text-3xl font-bold retro-glow mb-2"
          style={{ fontFamily: "var(--font-family-pixel)" }}
        >
          {fullName} ソフト一覧
        </h1>
        <p className="text-[var(--color-retro-text-dim)] text-sm">
          {consoleDef?.manufacturer} {consoleName} - {stats.total}タイトル掲載
        </p>
      </div>

      {/* 統計サマリー */}
      <div className="grid grid-cols-2 md:grid-cols-2 gap-3 mb-6">
        <div className="bg-[var(--color-retro-card)] border border-[var(--color-retro-border)] rounded-lg p-3 text-center">
          <p className="text-xs text-[var(--color-retro-text-dim)]">総タイトル数</p>
          <p className="text-lg font-bold text-[var(--color-retro-accent)]">
            {stats.total}
          </p>
        </div>
        <div className="bg-[var(--color-retro-card)] border border-[var(--color-retro-border)] rounded-lg p-3 text-center">
          <p className="text-xs text-[var(--color-retro-text-dim)]">平均中古価格</p>
          <p className="text-lg font-bold text-[var(--color-retro-accent2)]">
            ¥{stats.avgPrice.toLocaleString()}
          </p>
        </div>
      </div>

      {/* 他機種へのリンク */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-1.5">
          {consoles.map((c) => (
            <a
              key={c.id}
              href={`/games/${c.id}`}
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

      {/* フィルター・検索セクション */}
      <div className="bg-[var(--color-retro-card)] border border-[var(--color-retro-border)] rounded-lg p-4 mb-6">
        <h2 className="text-sm font-bold mb-4 text-[var(--color-retro-accent)]">
          検索・フィルター
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* タイトル検索 */}
          <div>
            <label className="text-xs text-[var(--color-retro-text-dim)] block mb-1">
              タイトル/メーカー検索
            </label>
            <input
              type="text"
              placeholder="キーワードを入力..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 bg-[var(--color-retro-bg)] border border-[var(--color-retro-border)] rounded text-[var(--color-retro-text)] text-sm focus:outline-none focus:border-[var(--color-retro-accent)]"
            />
          </div>

          {/* ジャンル */}
          <div>
            <label className="text-xs text-[var(--color-retro-text-dim)] block mb-1">
              ジャンル
            </label>
            <select
              value={selectedGenre ?? ""}
              onChange={(e) => {
                setSelectedGenre(e.target.value || null);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 bg-[var(--color-retro-bg)] border border-[var(--color-retro-border)] rounded text-[var(--color-retro-text)] text-sm focus:outline-none focus:border-[var(--color-retro-accent)]"
            >
              <option value="">すべて</option>
              {allGenres.map((genre) => (
                <option key={genre} value={genre}>
                  {genre}
                </option>
              ))}
            </select>
          </div>

          {/* 中古価格範囲 */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-[var(--color-retro-text-dim)] block mb-1">
                最小価格（¥）
              </label>
              <input
                type="number"
                placeholder="最小"
                value={priceMin}
                onChange={(e) => {
                  setPriceMin(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 bg-[var(--color-retro-bg)] border border-[var(--color-retro-border)] rounded text-[var(--color-retro-text)] text-sm focus:outline-none focus:border-[var(--color-retro-accent)]"
              />
            </div>
            <div>
              <label className="text-xs text-[var(--color-retro-text-dim)] block mb-1">
                最大価格（¥）
              </label>
              <input
                type="number"
                placeholder="最大"
                value={priceMax}
                onChange={(e) => {
                  setPriceMax(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 bg-[var(--color-retro-bg)] border border-[var(--color-retro-border)] rounded text-[var(--color-retro-text)] text-sm focus:outline-none focus:border-[var(--color-retro-accent)]"
              />
            </div>
          </div>

          {/* プレミアランク */}
          <div>
            <label className="text-xs text-[var(--color-retro-text-dim)] block mb-1">
              プレミアランク以上
            </label>
            <select
              value={minPremiumRank ?? ""}
              onChange={(e) => {
                setMinPremiumRank(e.target.value ? parseInt(e.target.value, 10) : null);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 bg-[var(--color-retro-bg)] border border-[var(--color-retro-border)] rounded text-[var(--color-retro-text)] text-sm focus:outline-none focus:border-[var(--color-retro-accent)]"
            >
              <option value="">すべて</option>
              <option value="2">★★☆☆☆ 以上</option>
              <option value="3">★★★☆☆ 以上</option>
              <option value="4">★★★★☆ 以上</option>
              <option value="5">★★★★★</option>
            </select>
          </div>

          {/* ソート */}
          <div className="md:col-span-2">
            <label className="text-xs text-[var(--color-retro-text-dim)] block mb-1">
              ソート
            </label>
            <select
              value={sortBy}
              onChange={(e) =>
                setSortBy(e.target.value as "title" | "release_date" | "price_used" | "price_new")
              }
              className="w-full px-3 py-2 bg-[var(--color-retro-bg)] border border-[var(--color-retro-border)] rounded text-[var(--color-retro-text)] text-sm focus:outline-none focus:border-[var(--color-retro-accent)]"
            >
              <option value="title">タイトル順</option>
              <option value="release_date">発売日順（新しい順）</option>
              <option value="price_used">中古価格高い順</option>
              <option value="price_new">新品価格高い順</option>
            </select>
          </div>
        </div>
      </div>

      {/* 検索結果件数 */}
      <p className="text-xs text-[var(--color-retro-text-dim)] mb-4">
        検索結果: {sortedGames.length}件
        {searchQuery || selectedGenre || priceMin || priceMax || minPremiumRank
          ? ` (フィルター適用)`
          : ""}
      </p>

      {/* ゲーム一覧テーブル */}
      {paginatedGames.length > 0 ? (
        <>
          <div className="overflow-x-auto mb-6">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b-2 border-[var(--color-retro-accent)]">
                  <th className="text-left px-3 py-2 text-[var(--color-retro-accent)] font-bold">
                    タイトル
                  </th>
                  <th className="text-left px-3 py-2 text-[var(--color-retro-accent)] font-bold hidden sm:table-cell">
                    メーカー
                  </th>
                  <th className="text-center px-3 py-2 text-[var(--color-retro-accent)] font-bold hidden md:table-cell">
                    発売日
                  </th>
                  <th className="text-center px-3 py-2 text-[var(--color-retro-accent)] font-bold">
                    中古価格
                  </th>
                  <th className="text-center px-3 py-2 text-[var(--color-retro-accent)] font-bold hidden md:table-cell">
                    新品価格
                  </th>
                  <th className="text-center px-3 py-2 text-[var(--color-retro-accent)] font-bold">
                    ランク
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedGames.map((game, index) => (
                  <tr
                    key={game.id}
                    className={`border-b border-[var(--color-retro-border)] hover:bg-[rgba(0,212,255,0.05)] transition-colors ${
                      index % 2 === 0 ? "bg-[var(--color-retro-bg)]" : ""
                    }`}
                  >
                    <td className="px-3 py-2">
                      <a
                        href={`/games/${consoleId}/${game.slug}`}
                        className="text-[var(--color-retro-accent)] hover:underline font-medium"
                      >
                        {game.title}
                      </a>
                    </td>
                    <td className="text-xs px-3 py-2 text-[var(--color-retro-text-dim)] hidden sm:table-cell">
                      {game.publisher}
                    </td>
                    <td className="text-xs px-3 py-2 text-center text-[var(--color-retro-text-dim)] hidden md:table-cell">
                      {formatDate(game.release_date)}
                    </td>
                    <td className="text-center px-3 py-2 font-semibold">
                      <span className="text-[var(--color-retro-accent2)]">
                        {formatPrice(game.current_used_price)}
                      </span>
                    </td>
                    <td className="text-center px-3 py-2 text-xs hidden md:table-cell text-[var(--color-retro-text-dim)]">
                      {formatPrice(game.current_new_price)}
                    </td>
                    <td className="text-center px-3 py-2">
                      <span className="text-sm text-[var(--color-retro-red)]">
                        {premiumRankToStars(game.premium_rank)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ページネーション */}
          <div className="flex items-center justify-center gap-2 mb-6">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-2 rounded border border-[var(--color-retro-border)] text-[var(--color-retro-text-dim)] disabled:opacity-50 hover:border-[var(--color-retro-accent)] transition-colors text-sm"
            >
              前へ
            </button>

            <div className="flex gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum: number;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`px-3 py-2 rounded border text-sm transition-colors ${
                      pageNum === currentPage
                        ? "border-[var(--color-retro-accent)] bg-[var(--color-retro-accent)] text-[var(--color-retro-bg)] font-bold"
                        : "border-[var(--color-retro-border)] text-[var(--color-retro-text-dim)] hover:border-[var(--color-retro-accent)]"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-2 rounded border border-[var(--color-retro-border)] text-[var(--color-retro-text-dim)] disabled:opacity-50 hover:border-[var(--color-retro-accent)] transition-colors text-sm"
            >
              次へ
            </button>
          </div>

          <div className="text-center text-xs text-[var(--color-retro-text-dim)]">
            ページ {currentPage} / {totalPages}
          </div>
        </>
      ) : (
        <div className="text-center py-8">
          <p className="text-[var(--color-retro-text-dim)]">
            該当するゲームがありません。フィルター条件を変更してください。
          </p>
        </div>
      )}
    </div>
  );
}
