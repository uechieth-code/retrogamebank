/**
 * Phase 2: 価格取得バッチ処理スクリプト
 *
 * 実行方法: npx ts-node scripts/fetch-prices.ts
 * GitHub Actionsで深夜1日1回実行することを想定。
 *
 * 各APIから価格情報を取得し、price_historyテーブル（データソース）に蓄積する。
 * プレミア度の自動再計算も行う。
 */

// --- 型定義 ---
interface PriceResult {
  game_id: string;
  source: string;
  condition: "new" | "used";
  price: number;
  fetched_at: string;
}

// --- Amazon PA-API 5.0 連携 ---
// 注意: Amazon PA-APIのキャッシュ保持期間（24時間）を遵守すること
async function fetchAmazonPrice(searchTerm: string): Promise<PriceResult | null> {
  const AMAZON_ACCESS_KEY = process.env.AMAZON_ACCESS_KEY;
  const AMAZON_SECRET_KEY = process.env.AMAZON_SECRET_KEY;
  const AMAZON_PARTNER_TAG = process.env.AMAZON_PARTNER_TAG;

  if (!AMAZON_ACCESS_KEY || !AMAZON_SECRET_KEY || !AMAZON_PARTNER_TAG) {
    console.warn("Amazon PA-API credentials not configured. Skipping.");
    return null;
  }

  // PA-API 5.0 SearchItems エンドポイント
  // 実装時は aws4-axios 等を使用してSigV4署名を行う
  console.log(`[Amazon] Searching: ${searchTerm}`);

  // TODO: 実際のAPI呼び出しを実装
  // const response = await paapi.searchItems({
  //   Keywords: searchTerm,
  //   SearchIndex: "VideoGames",
  //   ItemCount: 1,
  //   Resources: ["Offers.Listings.Price"],
  // });

  return null;
}

// --- 楽天商品検索API連携 ---
async function fetchRakutenPrice(searchTerm: string): Promise<PriceResult | null> {
  const RAKUTEN_APP_ID = process.env.RAKUTEN_APP_ID;
  const RAKUTEN_AFFILIATE_ID = process.env.RAKUTEN_AFFILIATE_ID;

  if (!RAKUTEN_APP_ID) {
    console.warn("Rakuten API credentials not configured. Skipping.");
    return null;
  }

  console.log(`[楽天] Searching: ${searchTerm}`);

  // TODO: 実際のAPI呼び出しを実装
  // const url = `https://app.rakuten.co.jp/services/api/IchibaItem/Search/20170706?format=json&keyword=${encodeURIComponent(searchTerm)}&genreId=110&applicationId=${RAKUTEN_APP_ID}`;
  // const response = await fetch(url);
  // const data = await response.json();

  return null;
}

// --- 駿河屋 スクレイピング ---
async function fetchSurugayaPrice(searchTerm: string): Promise<PriceResult | null> {
  console.log(`[駿河屋] Searching: ${searchTerm}`);

  // 注意: 駿河屋は公式APIがないためWebスクレイピングが必要
  // robots.txt を確認し、利用規約を遵守すること
  // リクエスト間隔を十分に空けること（最低1秒以上）

  // TODO: 実際のスクレイピングを実装
  // const url = `https://www.suruga-ya.jp/search?category=&search_word=${encodeURIComponent(searchTerm)}`;
  // const response = await fetch(url, { headers: { "User-Agent": "RetroGameBank-PriceBot/1.0" } });

  return null;
}

// --- プレミア度再計算 ---
function recalculatePremiumRank(
  usedPrice: number | null,
  originalPrice: number | null,
  defaultPrice: number = 5000
): number {
  if (usedPrice === null) return 1;
  const base = originalPrice ?? defaultPrice;
  if (base === 0) return 1;
  const ratio = usedPrice / base;
  if (ratio <= 1) return 1;
  if (ratio <= 2) return 2;
  if (ratio <= 5) return 3;
  if (ratio <= 10) return 4;
  return 5;
}

// --- メイン処理 ---
async function main() {
  console.log("=== RetroGameBank Price Fetcher ===");
  console.log(`Execution time: ${new Date().toISOString()}`);
  console.log("");

  // TODO: データベースからゲーム一覧を取得
  // const games = await db.query("SELECT * FROM games");

  // 各ゲームに対して価格を取得
  // for (const game of games) {
  //   const consoleName = await db.query("SELECT short_name FROM consoles WHERE id = ?", [game.console_id]);
  //   const searchTerm = `${game.title} ${consoleName}`;
  //
  //   // 各ショップから価格取得（並行実行）
  //   const [amazonPrice, rakutenPrice, surugayaPrice] = await Promise.allSettled([
  //     fetchAmazonPrice(searchTerm),
  //     fetchRakutenPrice(searchTerm),
  //     fetchSurugayaPrice(searchTerm),
  //   ]);
  //
  //   // price_historyに挿入
  //   // ...
  //
  //   // gamesテーブルの current_new_price, current_used_price を更新
  //   // ...
  //
  //   // プレミア度を再計算
  //   const newPremiumRank = recalculatePremiumRank(game.current_used_price, game.original_price);
  //   // await db.query("UPDATE games SET premium_rank = ? WHERE id = ?", [newPremiumRank, game.id]);
  //
  //   // レート制限対策：リクエスト間隔を空ける
  //   await new Promise(resolve => setTimeout(resolve, 2000));
  // }

  console.log("");
  console.log("Price fetch completed.");
  console.log("Next run: tomorrow at 01:00 JST");
}

main().catch(console.error);

// --- GitHub Actions ワークフロー例 ---
// .github/workflows/fetch-prices.yml
/*
name: Fetch Prices
on:
  schedule:
    - cron: '0 16 * * *'  # UTC 16:00 = JST 01:00
  workflow_dispatch:

jobs:
  fetch:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npx ts-node scripts/fetch-prices.ts
        env:
          AMAZON_ACCESS_KEY: ${{ secrets.AMAZON_ACCESS_KEY }}
          AMAZON_SECRET_KEY: ${{ secrets.AMAZON_SECRET_KEY }}
          AMAZON_PARTNER_TAG: ${{ secrets.AMAZON_PARTNER_TAG }}
          RAKUTEN_APP_ID: ${{ secrets.RAKUTEN_APP_ID }}
          RAKUTEN_AFFILIATE_ID: ${{ secrets.RAKUTEN_AFFILIATE_ID }}
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
*/
