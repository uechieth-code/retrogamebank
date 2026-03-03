import { Game } from "@/types";
import { fcGames } from "./fc-games";
import { sfcGames } from "./sfc-games";
import { gbGames } from "./gb-games";
import { mdGames } from "./md-games";
import { gbaGames } from "./gba-games";
import { ndsGames } from "./nds-games";
import { ssGames } from "./ss-games";
import { ps1Games } from "./ps1-games";
import { ps2Games } from "./ps2-games";
import { n3dsGames } from "./3ds-games";
import { n64Games } from "./n64-games";
import { gcGames } from "./gc-games";
import { dcGames } from "./dc-games";
import { pceGames } from "./pce-games";
import { pspGames } from "./psp-games";
import { neogeoGames } from "./neogeo-games";
import { wiiGames } from "./wii-games";
import { ps3Games } from "./ps3-games";
import { vitaGames } from "./vita-games";
import { ggGames } from "./gg-games";
import { x360Games } from "./x360-games";
import { wiiuGames } from "./wiiu-games";
import { xboxGames } from "./xbox-games";
import { ngpGames } from "./ngp-games";

// ジャンル正規化マップ（細分化されたジャンルを統合）
const genreNormalize: Record<string, string> = {
  // 英語→日本語
  "Action": "アクション",
  "Action/Adventure": "アクション",
  "Action/RPG": "アクションRPG",
  "RPG": "RPG",
  "Puzzle": "パズル",
  "Racing": "レース",
  "Sports": "スポーツ",
  "Fighting": "格闘",
  "Shooter": "シューティング",
  "FPS": "シューティング",
  "FPS DLC": "シューティング",
  "FPS/Action": "シューティング",
  "FPS/RPG": "シューティング",
  "TPS": "シューティング",
  "Run and Gun": "シューティング",
  "SLG": "シミュレーション",
  "Stealth": "アクション",
  "Stealth/Action": "アクション",
  "Platformer": "アクション",
  "Party": "パーティ",
  "Board Game": "テーブル",
  "Card Game": "テーブル",
  "Maze": "パズル",
  "Mecha": "アクション",
  "Game Machine": "その他",
  "MMORPG": "RPG",
  // 日本語の重複・統合
  "レーシング": "レース",
  "リズムゲーム": "リズム",
  "ボードゲーム": "テーブル",
  "カード": "テーブル",
  "パーティゲーム": "パーティ",
  "ビジュアルノベル": "アドベンチャー",
  "ノベル": "アドベンチャー",
  "ファンタジーRPG": "RPG",
  "冒険RPG": "RPG",
  "シミュレーションRPG": "シミュレーション",
  "ホラーアクション": "アクション",
  "ベルトスクロール": "アクション",
  "サンドボックス": "アクション",
  "オープンワールド": "アクション",
  "ボクシング": "格闘",
  "恋愛シミュレーション": "シミュレーション",
  "教育": "その他",
  "知育": "その他",
  "学習": "その他",
  "ステルス": "アクション",
  "飛行": "シューティング",
  "横スクロール": "アクション",
  "縦スクロール": "シューティング",
  "落ちモノ": "パズル",
  "ピンボール": "テーブル",
  "将棋": "テーブル",
  "囲碁": "テーブル",
  "麻雀": "テーブル",
  "釣り": "スポーツ",
  "音楽": "リズム",
  "ミニゲーム": "パーティ",
  "Dungeon Crawler": "RPG",
  "Space Simulation": "シミュレーション",
};

function normalizeGenres(genres: string[]): string[] {
  const normalized = genres.map(g => genreNormalize[g] ?? g);
  return [...new Set(normalized)];
}

const rawGames: Game[] = [...fcGames, ...sfcGames, ...gbGames, ...mdGames, ...gbaGames, ...ndsGames, ...ps1Games, ...ps2Games, ...ssGames, ...n3dsGames, ...n64Games, ...gcGames, ...dcGames, ...pceGames, ...pspGames, ...neogeoGames, ...wiiGames, ...ps3Games, ...vitaGames, ...ggGames, ...x360Games, ...wiiuGames, ...xboxGames, ...ngpGames];

export const allGames: Game[] = rawGames.map(g => ({
  ...g,
  genre: normalizeGenres(g.genre),
}));

export function getGamesByConsole(consoleId: string): Game[] {
  return allGames.filter((g) => g.console_id === consoleId);
}

export function getGameBySlug(consoleId: string, gameSlug: string): Game | undefined {
  return allGames.find((g) => g.console_id === consoleId && g.slug === gameSlug);
}

export function getGameById(id: string): Game | undefined {
  return allGames.find((g) => g.id === id);
}

export function getAllPublishers(): string[] {
  return [...new Set(allGames.map((g) => g.publisher))].sort();
}

export function getAllGenres(): string[] {
  return [...new Set(allGames.flatMap((g) => g.genre))].sort();
}
