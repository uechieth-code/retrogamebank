"use client";

import { useState, useEffect } from "react";
import { getGameById } from "@/data/games";
import { getConsole } from "@/data/consoles";
import { formatPrice, formatDate, premiumRankToStars } from "@/lib/utils";
import { getFavorites, removeFavorite } from "@/lib/storage";
import type { Game } from "@/types";

export default function FavoritesPage() {
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);

  useEffect(() => {
    setFavoriteIds(getFavorites());
  }, []);

  const games = favoriteIds
    .map((id) => getGameById(id))
    .filter(Boolean) as Game[];

  const handleRemove = (gameId: string) => {
    removeFavorite(gameId);
    setFavoriteIds(getFavorites());
  };

  return (
    <div>
      <div className="text-center mb-8">
        <h1
          className="text-3xl md:text-4xl font-bold retro-glow mb-2"
          style={{ fontFamily: "var(--font-family-pixel)" }}
        >
          お気に入り
        </h1>
        <p className="text-[var(--color-retro-text-dim)]">
          ウォッチリストに追加したソフト
        </p>
      </div>

      {games.length > 0 ? (
        <div className="space-y-2">
          {games.map((game) => {
            const consoleInfo = getConsole(game.console_id);
            return (
              <div
                key={game.id}
                className="game-card flex items-center gap-4 rounded-xl bg-[var(--color-retro-card)] p-4"
              >
                <a
                  href={`/games/${game.console_id}/${game.slug}`}
                  className="flex-grow min-w-0"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="tag tag-console text-xs">
                      {consoleInfo?.short_name}
                    </span>
                    <span className={`text-xs premium-${game.premium_rank}`}>
                      {premiumRankToStars(game.premium_rank)}
                    </span>
                  </div>
                  <h3 className="font-medium text-sm">{game.title}</h3>
                  <p className="text-xs text-[var(--color-retro-text-dim)]">
                    {game.publisher} / {formatDate(game.release_date)}
                  </p>
                </a>
                <div className="flex-shrink-0 text-right mr-4">
                  <p className="text-xs text-[var(--color-retro-text-dim)]">中古</p>
                  <p className="text-sm font-bold text-[var(--color-retro-accent2)]">
                    {formatPrice(game.current_used_price)}
                  </p>
                </div>
                <button
                  onClick={() => handleRemove(game.id)}
                  className="flex-shrink-0 px-3 py-1 rounded border border-[var(--color-retro-red)] text-[var(--color-retro-red)] text-xs hover:bg-[var(--color-retro-red)] hover:text-white transition-colors"
                >
                  削除
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 bg-[var(--color-retro-card)] border border-[var(--color-retro-border)] rounded-xl">
          <p className="text-lg text-[var(--color-retro-text-dim)] mb-2">
            お気に入りに追加されたソフトはありません
          </p>
          <p className="text-sm text-[var(--color-retro-text-dim)]">
            各ソフトの詳細ページから「お気に入りに追加」できます
          </p>
          <a
            href="/"
            className="inline-block mt-4 px-6 py-2 rounded-lg bg-[var(--color-retro-accent)] text-[var(--color-retro-bg)] font-bold text-sm"
          >
            ソフト一覧へ
          </a>
        </div>
      )}
    </div>
  );
}
