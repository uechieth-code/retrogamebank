#!/usr/bin/env node
/**
 * 価格データ更新スクリプト（フレームワーク）
 *
 * 使い方:
 *   node scripts/update-prices.mjs --source csv --file prices.csv
 *   node scripts/update-prices.mjs --source json --file prices.json
 *
 * 入力データフォーマット (CSV):
 *   console_id,title,used_price,new_price
 *   fc,スーパーマリオブラザーズ,1200,null
 *
 * 入力データフォーマット (JSON):
 *   [{ "console_id": "fc", "title": "スーパーマリオブラザーズ", "used_price": 1200, "new_price": null }]
 *
 * このスクリプトは以下を行います:
 *   1. 入力ファイル（CSV/JSON）から最新の価格データを読み込む
 *   2. 対応する *-games.ts ファイルのタプルデータを更新
 *   3. 変更箇所のレポートを出力
 *
 * 注意:
 *   - 価格ソースのスクレイピングAPIは別途実装が必要
 *   - このスクリプトは「取得済みデータの反映」のみを担当
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, "..", "src", "data");

// コンソールIDとファイル名のマッピング
const CONSOLE_FILE_MAP = {
  fc: "fc-games.ts",
  sfc: "sfc-games.ts",
  gb: "gb-games.ts",
  gba: "gba-games.ts",
  nds: "nds-games.ts",
  "3ds": "3ds-games.ts",
  n64: "n64-games.ts",
  gc: "gc-games.ts",
  wii: "wii-games.ts",
  wiiu: "wiiu-games.ts",
  ps1: "ps1-games.ts",
  ps2: "ps2-games.ts",
  ps3: "ps3-games.ts",
  psp: "psp-games.ts",
  vita: "vita-games.ts",
  md: "md-games.ts",
  ss: "ss-games.ts",
  dc: "dc-games.ts",
  pce: "pce-games.ts",
  neogeo: "neogeo-games.ts",
  gg: "gg-games.ts",
  x360: "x360-games.ts",
  xbox: "xbox-games.ts",
  ngp: "ngp-games.ts",
};

/**
 * CSVファイルを読み込んで価格データ配列を返す
 */
function parseCSV(filePath) {
  const content = fs.readFileSync(filePath, "utf-8");
  const lines = content.trim().split("\n");
  const header = lines[0].split(",");

  return lines.slice(1).map((line) => {
    const values = line.split(",");
    return {
      console_id: values[header.indexOf("console_id")]?.trim(),
      title: values[header.indexOf("title")]?.trim(),
      used_price: parsePrice(values[header.indexOf("used_price")]?.trim()),
      new_price: parsePrice(values[header.indexOf("new_price")]?.trim()),
    };
  });
}

/**
 * JSONファイルを読み込んで価格データ配列を返す
 */
function parseJSON(filePath) {
  const content = fs.readFileSync(filePath, "utf-8");
  const data = JSON.parse(content);
  return data.map((item) => ({
    console_id: item.console_id,
    title: item.title,
    used_price: parsePrice(item.used_price),
    new_price: parsePrice(item.new_price),
  }));
}

/**
 * 価格値をパース（null/"null"/undefined → null, それ以外 → number）
 */
function parsePrice(val) {
  if (val === null || val === undefined || val === "null" || val === "") return null;
  const num = Number(val);
  return isNaN(num) ? null : num;
}

/**
 * ゲームデータファイル内のタプルを更新する
 * タプルの [4]=used_price, [5]=new_price を書き換える
 */
function updateGameFile(consoleId, priceUpdates) {
  const fileName = CONSOLE_FILE_MAP[consoleId];
  if (!fileName) {
    console.warn(`  ⚠ 不明なコンソールID: ${consoleId}`);
    return { updated: 0, notFound: [] };
  }

  const filePath = path.join(DATA_DIR, fileName);
  if (!fs.existsSync(filePath)) {
    console.warn(`  ⚠ ファイルが見つかりません: ${fileName}`);
    return { updated: 0, notFound: [] };
  }

  let content = fs.readFileSync(filePath, "utf-8");
  let updatedCount = 0;
  const notFound = [];

  for (const update of priceUpdates) {
    // タイトルでタプル行を検索
    const titleEscaped = update.title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    // タプル形式: ["日付", "タイトル", "パブリッシャー", [...], used_price, new_price, ...]
    const tupleRegex = new RegExp(
      `(\\["[^"]*",\\s*"${titleEscaped}",\\s*"[^"]*",\\s*\\[[^\\]]*\\],\\s*)(\\d+|null)(,\\s*)(\\d+|null)`,
      "g"
    );

    const match = tupleRegex.exec(content);
    if (match) {
      const oldUsed = match[2];
      const oldNew = match[4];
      const newUsed = update.used_price === null ? "null" : String(update.used_price);
      const newNew = update.new_price === null ? "null" : String(update.new_price);

      if (oldUsed !== newUsed || oldNew !== newNew) {
        content = content.replace(
          match[0],
          `${match[1]}${newUsed}${match[3]}${newNew}`
        );
        updatedCount++;
        console.log(
          `  ✓ ${update.title}: 中古 ${oldUsed}→${newUsed}, 新品 ${oldNew}→${newNew}`
        );
      }
    } else {
      notFound.push(update.title);
    }
  }

  if (updatedCount > 0) {
    fs.writeFileSync(filePath, content, "utf-8");
  }

  return { updated: updatedCount, notFound };
}

/**
 * メイン処理
 */
function main() {
  const args = process.argv.slice(2);
  const sourceIdx = args.indexOf("--source");
  const fileIdx = args.indexOf("--file");

  if (sourceIdx === -1 || fileIdx === -1) {
    console.log("使い方:");
    console.log("  node scripts/update-prices.mjs --source csv --file prices.csv");
    console.log("  node scripts/update-prices.mjs --source json --file prices.json");
    console.log("");
    console.log("CSV形式: console_id,title,used_price,new_price");
    console.log('JSON形式: [{"console_id":"fc","title":"...","used_price":1200,"new_price":null}]');
    process.exit(0);
  }

  const source = args[sourceIdx + 1];
  const filePath = path.resolve(args[fileIdx + 1]);

  if (!fs.existsSync(filePath)) {
    console.error(`エラー: ファイルが見つかりません: ${filePath}`);
    process.exit(1);
  }

  // データ読み込み
  let priceData;
  if (source === "csv") {
    priceData = parseCSV(filePath);
  } else if (source === "json") {
    priceData = parseJSON(filePath);
  } else {
    console.error(`エラー: 不明なソース形式: ${source}（csv または json を指定）`);
    process.exit(1);
  }

  console.log(`\n📊 価格データ更新開始`);
  console.log(`   ソース: ${source.toUpperCase()}`);
  console.log(`   件数: ${priceData.length}件\n`);

  // コンソールIDごとにグループ化
  const grouped = {};
  for (const item of priceData) {
    if (!grouped[item.console_id]) grouped[item.console_id] = [];
    grouped[item.console_id].push(item);
  }

  let totalUpdated = 0;
  const allNotFound = [];

  for (const [consoleId, updates] of Object.entries(grouped)) {
    console.log(`[${consoleId.toUpperCase()}] ${updates.length}件の更新を処理...`);
    const result = updateGameFile(consoleId, updates);
    totalUpdated += result.updated;
    allNotFound.push(...result.notFound.map((t) => `${consoleId}: ${t}`));
  }

  // レポート出力
  console.log(`\n========== 更新レポート ==========`);
  console.log(`更新成功: ${totalUpdated}件`);
  if (allNotFound.length > 0) {
    console.log(`未発見: ${allNotFound.length}件`);
    allNotFound.forEach((t) => console.log(`  - ${t}`));
  }
  console.log(`==================================\n`);
}

main();
