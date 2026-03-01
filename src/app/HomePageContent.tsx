"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { allGames, getAllPublishers, getAllGenres } from "@/data/games";
import { getMvpConsoles } from "@/data/consoles";
import { formatPrice, formatSales, formatDate, premiumRankToStars } from "@/lib/utils";
import type { SortKey, SortOrder } from "@/types";

const ITEMS_PER_PAGE = 50;

export default function HomePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const consoles = getMvpConsoles();
  const publishers = getAllPublishers();
  const genres = getAllGenres();

  // フィルター状態 - URL search paramsから初期化
  const [search, setSearch] = useState("");
  const [selectedConsoles, setSelectedConsoles] = useState<string[]>([]);
  const [selectedPublisher, setSelectedPublisher] = useState("");
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [premiumFilter, setPremiumFilter] = useState(0);
  const [sortKey, setSortKey] = useState<SortKey>("release_date");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // URL search paramsまたはsessionStorageから状態を復元
  useEffect(() => {
    if (isInitialized) return;

    // URLにパラメータがあればそちらを優先、なければsessionStorageから復元
    let sp: { get: (key: string) => string | null } = searchParams;
    if (!searchParams.toString()) {
      try {
        const saved = sessionStorage.getItem("retrogamebank_filters");
        if (saved) {
          sp = new URLSearchParams(saved);
        }
      } catch {}
    }

    setSearch(sp.get("search") || "");
    setSelectedConsoles(sp.get("consoles")?.split(",").filter(Boolean) || []);
    setSelectedPublisher(sp.get("publisher") || "");
    setSelectedGenres(sp.get("genres")?.split(",").filter(Boolean) || []);
    setPriceMin(sp.get("priceMin") || "");
    setPriceMax(sp.get("priceMax") || "");
    setPremiumFilter(Number(sp.get("premium") || 0));
    setSortKey((sp.get("sortKey") as SortKey) || "release_date");
    setSortOrder((sp.get("sortOrder") as SortOrder) || "desc");
    setPage(Number(sp.get("page") || 1));
    setShowFilters(sp.get("showFilters") === "true");

    setIsInitialized(true);
  }, [searchParams, isInitialized]);

  // 状態が変更された時にURLを更新 + sessionStorageに保存
  useEffect(() => {
    if (!isInitialized) return;

    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (selectedConsoles.length > 0) params.set("consoles", selectedConsoles.join(","));
    if (selectedPublisher) params.set("publisher", selectedPublisher);
    if (selectedGenres.length > 0) params.set("genres", selectedGenres.join(","));
    if (priceMin) params.set("priceMin", priceMin);
    if (priceMax) params.set("priceMax", priceMax);
    if (premiumFilter > 0) params.set("premium", premiumFilter.toString());
    if (sortKey !== "release_date") params.set("sortKey", sortKey);
    if (sortOrder !== "desc") params.set("sortOrder", sortOrder);
    if (page !== 1) params.set("page", page.toString());
    if (showFilters) params.set("showFilters", "true");

    const queryString = params.toString();
    const newUrl = queryString ? `/?${queryString}` : "/";
    router.replace(newUrl, { scroll: false });

    // sessionStorageにも保存（詳細ページから戻る時用）
    try {
      sessionStorage.setItem("retrogamebank_filters", queryString);
    } catch {}
  }, [search, selectedConsoles, selectedPublisher, selectedGenres, priceMin, priceMax, premiumFilter, sortKey, sortOrder, page, showFilters, isInitialized, router]);

  // フィルタリングとソート
  const filteredGames = useMemo(() => {
    let games = [...allGames];

    // フリーワード検索
    if (search) {
      const q = search.toLowerCase();
      games = games.filter((g) => g.title.toLowerCase().includes(q));
    }

    // 機種フィルター
    if (selectedConsoles.length > 0) {
      games = games.filter((g) => selectedConsoles.includes(g.console_id));
    }

    // メーカーフィルター
    if (selectedPublisher) {
      games = games.filter((g) => g.publisher === selectedPublisher);
    }

    // ジャンルフィルター
    if (selectedGenres.length > 0) {
      games = games.filter((g) =>
        selectedGenres.some((sg) => g.genre.includes(sg))
      );
    }

    // 価格帯フィルター（中古価格ベース）
    const pMin = priceMin ? parseInt(priceMin) : null;
    const pMax = priceMax ? parseInt(priceMax) : null;
    if (pMin !== null) {
      games = games.filter(
        (g) => g.current_used_price !== null && g.current_used_price >= pMin
      );
    }
    if (pMax !== null) {
      games = games.filter(
        (g) => g.current_used_price !== null && g.current_used_price <= pMax
      );
    }

    // プレミア度フィルター
    if (premiumFilter > 0) {
      games = games.filter((g) => g.premium_rank >= premiumFilter);
    }

    // ソート
    games.sort((a, b) => {
      let valA: number | string = 0;
      let valB: number | string = 0;

      switch (sortKey) {
        case "title":
          valA = a.title;
          valB = b.title;
          break;
        case "release_date":
          valA = a.release_date;
          valB = b.release_date;
          break;
        case "current_new_price":
          valA = a.current_new_price ?? -1;
          valB = b.current_new_price ?? -1;
          break;
        case "current_used_price":
          valA = a.current_used_price ?? -1;
          valB = b.current_used_price ?? -1;
          break;
        case "total_sales":
          valA = a.total_sales ?? -1;
          valB = b.total_sales ?? -1;
          break;
        case "premium_rank":
          valA = a.premium_rank;
          valB = b.premium_rank;
          break;
      }

      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return games;
  }, [search, selectedConsoles, selectedPublisher, selectedGenres, priceMin, priceMax, premiumFilter, sortKey, sortOrder]);

  // ページネーション
  const totalPages = Math.ceil(filteredGames.length / ITEMS_PER_PAGE);
  const paginatedGames = filteredGames.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  const toggleConsole = useCallback((id: string) => {
    setSelectedConsoles((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
    setPage(1);
  }, []);

  const toggleGenre = useCallback((genre: string) => {
    setSelectedGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
    );
    setPage(1);
  }, []);

  const handleSort = useCallback(
    (key: SortKey) => {
      if (sortKey === key) {
        setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
      } else {
        setSortKey(key);
        setSortOrder("desc");
      }
      setPage(1);
    },
    [sortKey]
  );

  const sortIndicator = (key: SortKey) => {
    if (sortKey !== key) return " ↕";
    return sortOrder === "asc" ? " ↑" : " ↓";
  };

  const getConsoleShortName = (id: string) => {
    const c = consoles.find((c) => c.id === id);
    return c?.short_name ?? id;
  };

  return (
    <div>
      {/* ヒーローセクション */}
      <div className="text-center mb-8">
        <h2
          className="text-3xl md:text-4xl font-bold retro-glow mb-2"
          style={{ fontFamily: "var(--font-family-pixel)" }}
        >
          レトロゲームソフト一覧
        </h2>
        <p className="text-[var(--color-retro-text-dim)]">
          FC・SFC・GBのソフト価格情報を一覧で確認
        </p>
        <p className="text-sm text-[var(--color-retro-text-dim)] mt-1">
          全{allGames.length}タイトル収録
        </p>
      </div>

      {/* 検索バー */}
      <div className="mb-4">
        <input
          type="text"
          className="search-input"
          placeholder="ゲームタイトルで検索..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
      </div>

      {/* フィルター開閉ボタン */}
      <button
        onClick={() => setShowFilters(!showFilters)}
        className="mb-4 px-4 py-2 rounded-lg border border-[var(--color-retro-border)] bg-[var(--color-retro-card)] text-sm text-[var(--color-retro-text-dim)] hover:border-[var(--color-retro-accent)] hover:text-[var(--color-retro-accent)] transition-colors"
      >
        {showFilters ? "▲ フィルターを閉じる" : "▼ フィルターを開く"}
      </button>

      {/* フィルターパネル */}
      {showFilters && (
        <div className="filter-panel mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* 機種フィルター */}
            <div>
              <label className="block text-sm font-bold text-[var(--color-retro-accent)] mb-2">
                機種
              </label>
              <div className="flex flex-wrap gap-2">
                {consoles.map((c) => (
                  <label
                    key={c.id}
                    className="flex items-center gap-2 cursor-pointer text-sm"
                  >
                    <input
                      type="checkbox"
                      className="retro-checkbox"
                      checked={selectedConsoles.includes(c.id)}
                      onChange={() => toggleConsole(c.id)}
                    />
                    <span>{c.short_name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* メーカーフィルター */}
            <div>
              <label className="block text-sm font-bold text-[var(--color-retro-accent)] mb-2">
                メーカー
              </label>
              <select
                className="retro-select w-full"
                value={selectedPublisher}
                onChange={(e) => {
                  setSelectedPublisher(e.target.value);
                  setPage(1);
                }}
              >
                <option value="">すべて</option>
                {publishers.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            {/* ジャンルフィルター */}
            <div>
              <label className="block text-sm font-bold text-[var(--color-retro-accent)] mb-2">
                ジャンル
              </label>
              <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto">
                {genres.map((g) => (
                  <label
                    key={g}
                    className="flex items-center gap-1 cursor-pointer text-xs"
                  >
                    <input
                      type="checkbox"
                      className="retro-checkbox"
                      checked={selectedGenres.includes(g)}
                      onChange={() => toggleGenre(g)}
                    />
                    <span>{g}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* 価格帯フィルター */}
            <div>
              <label className="block text-sm font-bold text-[var(--color-retro-accent)] mb-2">
                中古価格帯
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  className="search-input text-sm"
                  placeholder="下限"
                  value={priceMin}
                  onChange={(e) => {
                    setPriceMin(e.target.value);
                    setPage(1);
                  }}
                  style={{ width: "100px" }}
                />
                <span className="text-[var(--color-retro-text-dim)]">〜</span>
                <input
                  type="number"
                  className="search-input text-sm"
                  placeholder="上限"
                  value={priceMax}
                  onChange={(e) => {
                    setPriceMax(e.target.value);
                    setPage(1);
                  }}
                  style={{ width: "100px" }}
                />
                <span className="text-sm text-[var(--color-retro-text-dim)]">円</span>
              </div>
            </div>

            {/* プレミア度フィルター */}
            <div>
              <label className="block text-sm font-bold text-[var(--color-retro-accent)] mb-2">
                プレミア度
              </label>
              <select
                className="retro-select"
                value={premiumFilter}
                onChange={(e) => {
                  setPremiumFilter(Number(e.target.value));
                  setPage(1);
                }}
              >
                <option value={0}>すべて</option>
                <option value={1}>★☆☆☆☆ 以上</option>
                <option value={2}>★★☆☆☆ 以上</option>
                <option value={3}>★★★☆☆ 以上</option>
                <option value={4}>★★★★☆ 以上</option>
                <option value={5}>★★★★★ のみ</option>
              </select>
            </div>
          </div>

          {/* リセットボタン */}
          <div className="mt-4 pt-4 border-t border-[var(--color-retro-border)]">
            <button
              onClick={() => {
                setSearch("");
                setSelectedConsoles([]);
                setSelectedPublisher("");
                setSelectedGenres([]);
                setPriceMin("");
                setPriceMax("");
                setPremiumFilter(0);
                setSortKey("release_date");
                setSortOrder("desc");
                setPage(1);
              }}
              className="text-sm text-[var(--color-retro-accent2)] hover:underline"
            >
              フィルターをリセット
            </button>
          </div>
        </div>
      )}

      {/* 結果件数 */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-[var(--color-retro-text-dim)]">
          {filteredGames.length}件中 {(page - 1) * ITEMS_PER_PAGE + 1}〜
          {Math.min(page * ITEMS_PER_PAGE, filteredGames.length)}件を表示
        </p>
      </div>

      {/* ゲーム一覧テーブル */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--color-retro-border)] text-left">
              <th
                className="py-3 px-2 cursor-pointer hover:text-[var(--color-retro-accent)] transition-colors whitespace-nowrap"
                onClick={() => handleSort("title")}
              >
                タイトル{sortIndicator("title")}
              </th>
              <th className="py-3 px-2 whitespace-nowrap">機種</th>
              <th className="py-3 px-2 whitespace-nowrap hidden md:table-cell">メーカー</th>
              <th
                className="py-3 px-2 cursor-pointer hover:text-[var(--color-retro-accent)] transition-colors whitespace-nowrap hidden sm:table-cell"
                onClick={() => handleSort("release_date")}
              >
                発売日{sortIndicator("release_date")}
              </th>
              <th className="py-3 px-2 whitespace-nowrap hidden lg:table-cell">ジャンル</th>
              <th
                className="py-3 px-2 cursor-pointer hover:text-[var(--color-retro-accent)] transition-colors whitespace-nowrap text-right hidden sm:table-cell"
                onClick={() => handleSort("current_new_price")}
              >
                新品{sortIndicator("current_new_price")}
              </th>
              <th
                className="py-3 px-2 cursor-pointer hover:text-[var(--color-retro-accent)] transition-colors whitespace-nowrap text-right"
                onClick={() => handleSort("current_used_price")}
              >
                中古{sortIndicator("current_used_price")}
              </th>
              <th
                className="py-3 px-2 cursor-pointer hover:text-[var(--color-retro-accent)] transition-colors whitespace-nowrap text-right hidden md:table-cell"
                onClick={() => handleSort("total_sales")}
              >
                販売本数{sortIndicator("total_sales")}
              </th>
              <th
                className="py-3 px-2 cursor-pointer hover:text-[var(--color-retro-accent)] transition-colors whitespace-nowrap"
                onClick={() => handleSort("premium_rank")}
              >
                プレミア{sortIndicator("premium_rank")}
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedGames.map((game) => (
              <tr
                key={game.id}
                className="border-b border-[var(--color-retro-border)] hover:bg-[var(--color-retro-card)] transition-colors cursor-pointer"
                onClick={() => router.push(`/games/${game.console_id}/${game.slug}`)}
              >
                <td className="py-3 px-2">
                  <span className="font-medium hover:text-[var(--color-retro-accent)] transition-colors">
                    {game.title}
                  </span>
                </td>
                <td className="py-3 px-2">
                  <span className="tag tag-console">
                    {getConsoleShortName(game.console_id)}
                  </span>
                </td>
                <td className="py-3 px-2 text-[var(--color-retro-text-dim)] hidden md:table-cell">
                  {game.publisher}
                </td>
                <td className="py-3 px-2 text-[var(--color-retro-text-dim)] hidden sm:table-cell whitespace-nowrap">
                  {formatDate(game.release_date)}
                </td>
                <td className="py-3 px-2 hidden lg:table-cell">
                  <div className="flex flex-wrap gap-1">
                    {game.genre.map((g) => (
                      <span key={g} className="tag tag-genre">
                        {g}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="py-3 px-2 text-right hidden sm:table-cell whitespace-nowrap">
                  {formatPrice(game.current_new_price)}
                </td>
                <td className="py-3 px-2 text-right whitespace-nowrap">
                  <span
                    className={
                      game.premium_rank >= 4
                        ? "text-[var(--color-retro-accent2)] font-bold"
                        : ""
                    }
                  >
                    {formatPrice(game.current_used_price)}
                  </span>
                </td>
                <td className="py-3 px-2 text-right text-[var(--color-retro-text-dim)] hidden md:table-cell whitespace-nowrap">
                  {game.total_sales !== null
                    ? formatSales(game.total_sales)
                    : "—"}
                </td>
                <td className={`py-3 px-2 whitespace-nowrap premium-${game.premium_rank}`}>
                  {premiumRankToStars(game.premium_rank)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 結果なし */}
      {filteredGames.length === 0 && (
        <div className="text-center py-12">
          <p className="text-[var(--color-retro-text-dim)] text-lg">
            該当するソフトが見つかりませんでした
          </p>
          <p className="text-sm text-[var(--color-retro-text-dim)] mt-2">
            検索条件を変更してください
          </p>
        </div>
      )}

      {/* ページネーション */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-8">
          <button
            className="pagination-btn"
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
          >
            ‹ 前へ
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              className={`pagination-btn ${p === page ? "active" : ""}`}
              onClick={() => setPage(p)}
            >
              {p}
            </button>
          ))}
          <button
            className="pagination-btn"
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
          >
            次へ ›
          </button>
        </div>
      )}
    </div>
  );
}
