"use client";

import { useState, useEffect } from "react";
import { getGameById, allGames } from "@/data/games";
import { getConsole } from "@/data/consoles";
import { formatPrice, formatSales, formatDate, premiumRankToStars } from "@/lib/utils";
import { getCompareList, removeFromCompare, clearCompare, addToCompare } from "@/lib/storage";
import type { Game } from "@/types";

export default function ComparePage() {
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    setCompareIds(getCompareList());
  }, []);

  const games = compareIds.map((id) => getGameById(id)).filter(Boolean) as Game[];

  const handleRemove = (gameId: string) => {
    removeFromCompare(gameId);
    setCompareIds(getCompareList());
  };

  const handleClear = () => {
    clearCompare();
    setCompareIds([]);
  };

  const handleAdd = (gameId: string) => {
    addToCompare(gameId);
    setCompareIds(getCompareList());
    setShowSearch(false);
    setSearchQuery("");
  };

  const searchResults = searchQuery.length >= 2
    ? allGames
        .filter((g) =>
          g.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !compareIds.includes(g.id)
        )
        .slice(0, 10)
    : [];

  const comparisonFields = [
    { label: "機種", render: (g: Game) => getConsole(g.console_id)?.short_name ?? "" },
    { label: "メーカー", render: (g: Game) => g.publisher },
    { label: "開発", render: (g: Game) => g.developer },
    { label: "発売日", render: (g: Game) => formatDate(g.release_date) },
    { label: "定価", render: (g: Game) => formatPrice(g.original_price) },
    { label: "新品価格", render: (g: Game) => formatPrice(g.current_new_price) },
    { label: "中古価格", render: (g: Game) => formatPrice(g.current_used_price) },
    { label: "ジャンル", render: (g: Game) => g.genre.join(", ") },
    { label: "プレイ人数", render: (g: Game) => g.player_count },
    { label: "販売本数", render: (g: Game) => g.total_sales ? `${formatSales(g.total_sales)}（推定）` : "—" },
    { label: "プレミア度", render: (g: Game) => premiumRankToStars(g.premium_rank) },
  ];

  return (
    <div>
      <div className="text-center mb-8">
        <h1
          className="text-3xl md:text-4xl font-bold retro-glow mb-2"
          style={{ fontFamily: "var(--font-family-pixel)" }}
        >
          ソフト比較
        </h1>
        <p className="text-[var(--color-retro-text-dim)]">
          最大3タイトルを並べて比較
        </p>
      </div>

      {/* 比較ソフト追加 */}
      {games.length < 3 && (
        <div className="mb-6">
          <button
            onClick={() => setShowSearch(!showSearch)}
            className="px-4 py-2 rounded-lg bg-[var(--color-retro-accent)] text-[var(--color-retro-bg)] font-bold text-sm"
          >
            + ソフトを追加
          </button>
          {showSearch && (
            <div className="mt-3 bg-[var(--color-retro-card)] border border-[var(--color-retro-border)] rounded-xl p-4">
              <input
                type="text"
                className="search-input mb-3"
                placeholder="タイトル名で検索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
              {searchResults.length > 0 && (
                <div className="space-y-1 max-h-60 overflow-y-auto">
                  {searchResults.map((g) => (
                    <button
                      key={g.id}
                      onClick={() => handleAdd(g.id)}
                      className="w-full text-left px-3 py-2 rounded hover:bg-[var(--color-retro-border)] transition-colors text-sm"
                    >
                      <span className="tag tag-console text-xs mr-2">
                        {getConsole(g.console_id)?.short_name}
                      </span>
                      {g.title}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {games.length > 0 && (
        <button
          onClick={handleClear}
          className="mb-4 text-sm text-[var(--color-retro-accent2)] hover:underline"
        >
          すべてクリア
        </button>
      )}

      {/* 比較テーブル */}
      {games.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-retro-border)]">
                <th className="py-3 px-4 text-left w-32"></th>
                {games.map((g) => (
                  <th key={g.id} className="py-3 px-4 text-center">
                    <div className="relative">
                      <button
                        onClick={() => handleRemove(g.id)}
                        className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-[var(--color-retro-red)] text-white text-xs flex items-center justify-center"
                      >
                        ×
                      </button>
                      <a
                        href={`/games/${g.console_id}/${g.slug}`}
                        className="hover:text-[var(--color-retro-accent)]"
                      >
                        <p className="font-bold text-base">{g.title}</p>
                      </a>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {comparisonFields.map((field) => (
                <tr
                  key={field.label}
                  className="border-b border-[var(--color-retro-border)] hover:bg-[var(--color-retro-card)]"
                >
                  <td className="py-3 px-4 text-[var(--color-retro-accent)] font-medium whitespace-nowrap">
                    {field.label}
                  </td>
                  {games.map((g) => (
                    <td key={g.id} className="py-3 px-4 text-center">
                      {field.render(g)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-16 bg-[var(--color-retro-card)] border border-[var(--color-retro-border)] rounded-xl">
          <p className="text-lg text-[var(--color-retro-text-dim)] mb-2">
            比較するソフトがありません
          </p>
          <p className="text-sm text-[var(--color-retro-text-dim)]">
            上の「ソフトを追加」ボタンから最大3タイトルを選択してください
          </p>
        </div>
      )}
    </div>
  );
}
