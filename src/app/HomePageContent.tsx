"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { allGames, getAllPublishers, getAllGenres } from "@/data/games";
import { getMvpConsoles, getConsole } from "@/data/consoles";
import { formatPrice, formatSales, formatDate, premiumRankToStars } from "@/lib/utils";
import type { SortKey, SortOrder } from "@/types";

const PAGE_SIZE_OPTIONS = [50, 100, 200] as const;

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
  const [pageSize, setPageSize] = useState<number>(50);
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
    setPageSize(Number(sp.get("pageSize") || 50));
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
    if (pageSize !== 50) params.set("pageSize", pageSize.toString());
    if (showFilters) params.set("showFilters", "true");

    const queryString = params.toString();
    const newUrl = queryString ? `/?${queryString}` : "/";
    router.replace(newUrl, { scroll: false });

    // sessionStorageにも保存（詳細ページから戻る時用）
    try {
      sessionStorage.setItem("retrogamebank_filters", queryString);
    } catch {}
  }, [search, selectedConsoles, selectedPublisher, selectedGenres, priceMin, priceMax, premiumFilter, sortKey, sortOrder, page, pageSize, showFilters, isInitialized, router]);

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
  const totalPages = Math.ceil(filteredGames.length / pageSize);
  const paginatedGames = filteredGames.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  // アクティブフィルター数
  const activeFilterCount = [
    selectedConsoles.length > 0,
    selectedPublisher !== "",
    selectedGenres.length > 0,
    priceMin !== "",
    priceMax !== "",
    premiumFilter > 0,
  ].filter(Boolean).length;

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

  // ページ変更時にスクロールトップ
  const changePage = useCallback((newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
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
    const c = getConsole(id);
    return c?.short_name ?? id.toUpperCase();
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
          レトロゲームソフトの価格情報を一覧で確認
        </p>
        <p className="text-sm text-[var(--color-retro-text-dim)] mt-1">
          全{allGames.length}タイトル収録
        </p>
        <a
          href="/minigame"
          className="inline-block mt-3 px-5 py-2 rounded-xl bg-[var(--color-retro-accent2)] text-white font-bold text-sm hover:opacity-90 transition-opacity"
          style={{ fontFamily: "var(--font-family-pixel)" }}
        >
          🎮 ミニゲームで遊ぶ
        </a>
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
        {activeFilterCount > 0 && (
          <span className="ml-2 inline-flex items-center justify-center w-5 h-5 rounded-full bg-[var(--color-retro-accent)] text-[var(--color-retro-bg)] text-xs font-bold">
            {activeFilterCount}
          </span>
        )}
      </button>

      {/* アクティブフィルタータグ（フィルター閉じている時） */}
      {!showFilters && activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2 mb-4 items-center">
          <span className="text-xs text-[var(--color-retro-text-dim)]">適用中:</span>
          {selectedConsoles.length > 0 && (
            <span className="tag tag-console text-xs">
              機種: {selectedConsoles.map((c) => getConsoleShortName(c)).join(", ")}
              <button className="ml-1 opacity-60 hover:opacity-100" onClick={() => { setSelectedConsoles([]); setPage(1); }}>×</button>
            </span>
          )}
          {selectedPublisher && (
            <span className="tag tag-genre text-xs">
              {selectedPublisher}
              <button className="ml-1 opacity-60 hover:opacity-100" onClick={() => { setSelectedPublisher(""); setPage(1); }}>×</button>
            </span>
          )}
          {selectedGenres.length > 0 && (
            <span className="tag tag-genre text-xs">
              {selectedGenres.join(", ")}
              <button className="ml-1 opacity-60 hover:opacity-100" onClick={() => { setSelectedGenres([]); setPage(1); }}>×</button>
            </span>
          )}
          {(priceMin || priceMax) && (
            <span className="tag tag-console text-xs">
              ¥{priceMin || "0"}〜¥{priceMax || "∞"}
              <button className="ml-1 opacity-60 hover:opacity-100" onClick={() => { setPriceMin(""); setPriceMax(""); setPage(1); }}>×</button>
            </span>
          )}
          {premiumFilter > 0 && (
            <span className="tag tag-console text-xs">
              プレミア{premiumFilter}以上
              <button className="ml-1 opacity-60 hover:opacity-100" onClick={() => { setPremiumFilter(0); setPage(1); }}>×</button>
            </span>
          )}
        </div>
      )}

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
              <div className="flex flex-wrap gap-2">
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
                setPageSize(50);
              }}
              className="text-sm text-[var(--color-retro-accent2)] hover:underline"
            >
              フィルターをリセット
            </button>
          </div>
        </div>
      )}

      {/* 結果件数 + 表示件数セレクター */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <p className="text-sm text-[var(--color-retro-text-dim)]">
          {filteredGames.length}件中 {filteredGames.length > 0 ? (page - 1) * pageSize + 1 : 0}〜
          {Math.min(page * pageSize, filteredGames.length)}件を表示
        </p>
        <div className="flex items-center gap-2">
          <span className="text-xs text-[var(--color-retro-text-dim)]">表示件数:</span>
          {PAGE_SIZE_OPTIONS.map((size) => (
            <button
              key={size}
              className={`px-2 py-1 text-xs rounded border transition-colors ${
                pageSize === size
                  ? "border-[var(--color-retro-accent)] text-[var(--color-retro-accent)] bg-[rgba(0,212,255,0.1)]"
                  : "border-[var(--color-retro-border)] text-[var(--color-retro-text-dim)] hover:border-[var(--color-retro-accent)]"
              }`}
              onClick={() => {
                setPageSize(size);
                setPage(1);
              }}
            >
              {size}件
            </button>
          ))}
        </div>
      </div>

      {/* モバイルソートセレクター（sm以下で表示） */}
      <div className="flex gap-2 mb-3 sm:hidden">
        <select
          className="retro-select flex-1 text-xs"
          value={sortKey}
          onChange={(e) => {
            setSortKey(e.target.value as SortKey);
            setPage(1);
          }}
        >
          <option value="release_date">発売日順</option>
          <option value="title">タイトル順</option>
          <option value="current_used_price">中古価格順</option>
          <option value="current_new_price">新品価格順</option>
          <option value="total_sales">販売本数順</option>
          <option value="premium_rank">プレミア順</option>
        </select>
        <button
          className="retro-select text-xs px-3"
          onClick={() => setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))}
        >
          {sortOrder === "asc" ? "↑ 昇順" : "↓ 降順"}
        </button>
      </div>

      {/* モバイルカードレイアウト（sm以下で表示） */}
      <div className="sm:hidden space-y-2">
        {paginatedGames.map((game) => (
          <div
            key={game.id}
            className="game-card rounded-lg bg-[var(--color-retro-card)] p-3 cursor-pointer"
            onClick={() => router.push(`/games/${game.console_id}/${game.slug}`)}
          >
            <div className="flex items-start justify-between gap-2 mb-1">
              <span className="font-medium text-sm leading-tight">{game.title}</span>
              <span className={`whitespace-nowrap text-xs premium-${game.premium_rank}`}>
                {premiumRankToStars(game.premium_rank)}
              </span>
            </div>
            <div className="flex items-center gap-2 flex-wrap text-xs">
              <span className="tag tag-console">{getConsoleShortName(game.console_id)}</span>
              {game.genre.slice(0, 2).map((g) => (
                <span key={g} className="tag tag-genre">{g}</span>
              ))}
              <span className="text-[var(--color-retro-text-dim)]">{formatDate(game.release_date)}</span>
            </div>
            <div className="flex items-center gap-4 mt-2 text-xs">
              <span>
                中古: <span className={game.premium_rank >= 4 ? "text-[var(--color-retro-accent2)] font-bold" : ""}>{formatPrice(game.current_used_price)}</span>
              </span>
              <span className="text-[var(--color-retro-text-dim)]">
                新品: {formatPrice(game.current_new_price)}
              </span>
              {game.total_sales !== null && (
                <span className="text-[var(--color-retro-text-dim)]">{formatSales(game.total_sales)}</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* デスクトップテーブル（sm以上で表示） */}
      <div className="overflow-x-auto hidden sm:block">
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
                className="py-3 px-2 cursor-pointer hover:text-[var(--color-retro-accent)] transition-colors whitespace-nowrap"
                onClick={() => handleSort("release_date")}
              >
                発売日{sortIndicator("release_date")}
              </th>
              <th className="py-3 px-2 whitespace-nowrap hidden lg:table-cell">ジャンル</th>
              <th
                className="py-3 px-2 cursor-pointer hover:text-[var(--color-retro-accent)] transition-colors whitespace-nowrap text-right hidden md:table-cell"
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
                <td className="py-3 px-2 text-[var(--color-retro-text-dim)] whitespace-nowrap">
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
                <td className="py-3 px-2 text-right hidden md:table-cell whitespace-nowrap">
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
      {totalPages > 1 && (() => {
        const WINDOW = 2;
        const pages: (number | "...")[] = [];
        if (totalPages <= 9) {
          for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
          pages.push(1);
          if (page - WINDOW > 2) pages.push("...");
          for (let i = Math.max(2, page - WINDOW); i <= Math.min(totalPages - 1, page + WINDOW); i++) {
            pages.push(i);
          }
          if (page + WINDOW < totalPages - 1) pages.push("...");
          pages.push(totalPages);
        }
        return (
          <div className="flex justify-center items-center gap-1 mt-8 flex-wrap">
            <button
              className="pagination-btn"
              onClick={() => changePage(Math.max(1, page - 1))}
              disabled={page === 1}
            >
              ‹ 前へ
            </button>
            {pages.map((p, idx) =>
              p === "..." ? (
                <span key={`dots-${idx}`} className="px-2 text-[var(--color-retro-text-dim)]">…</span>
              ) : (
                <button
                  key={p}
                  className={`pagination-btn ${p === page ? "active" : ""}`}
                  onClick={() => changePage(p as number)}
                >
                  {p}
                </button>
              )
            )}
            <button
              className="pagination-btn"
              onClick={() => changePage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
            >
              次へ ›
            </button>
          </div>
        );
      })()}

    </div>
  );
}
