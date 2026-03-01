import { Game } from "@/types";
import { fcGames } from "./fc-games";
import { sfcGames } from "./sfc-games";

const gbGames: Game[] = [
  { id: "gb-001", title: "ポケットモンスター 赤", console_id: "gb", publisher: "任天堂", developer: "ゲームフリーク", release_date: "1996-02-27", original_price: 3900, genre: ["RPG"], description: "151匹のポケモンを集めて育てるRPG。通信ケーブルによる交換・対戦が社会現象を巻き起こした。世界的フランチャイズの原点。", player_count: "1人", current_new_price: 50000, current_used_price: 1500, total_sales: 822, premium_rank: 1, slug: "pokemon-red" },
  { id: "gb-002", title: "ポケットモンスター 緑", console_id: "gb", publisher: "任天堂", developer: "ゲームフリーク", release_date: "1996-02-27", original_price: 3900, genre: ["RPG"], description: "赤版と対になるバージョン。出現するポケモンが異なり、通信交換で図鑑を完成させる。", player_count: "1人", current_new_price: 55000, current_used_price: 2000, total_sales: 822, premium_rank: 1, slug: "pokemon-green" },
  { id: "gb-003", title: "テトリス", console_id: "gb", publisher: "任天堂", developer: "任天堂R&D1", release_date: "1989-06-14", original_price: 2600, genre: ["パズル"], description: "ゲームボーイと同時に発売された定番パズルゲーム。落下するブロックを回転・配置して列を消す。通信対戦も可能。", player_count: "1〜2人", current_new_price: 8000, current_used_price: 200, total_sales: 3000, premium_rank: 1, slug: "tetris" },
  { id: "gb-004", title: "スーパーマリオランド", console_id: "gb", publisher: "任天堂", developer: "任天堂R&D1", release_date: "1989-04-21", original_price: 2600, genre: ["アクション"], description: "ゲームボーイ初のマリオ作品。サラサ・ランドを舞台にデイジー姫を救う冒険。シューティングステージも収録。", player_count: "1人", current_new_price: 5000, current_used_price: 300, total_sales: 1814, premium_rank: 1, slug: "super-mario-land" },
  { id: "gb-005", title: "スーパーマリオランド2 6つの金貨", console_id: "gb", publisher: "任天堂", developer: "任天堂R&D1", release_date: "1992-10-21", original_price: 3900, genre: ["アクション"], description: "ワリオが初登場したマリオシリーズ作品。6つのゾーンを自由な順番で攻略し、金貨を集めてワリオに奪われた城を取り戻す。", player_count: "1人", current_new_price: 8000, current_used_price: 500, total_sales: 1118, premium_rank: 1, slug: "super-mario-land-2" },
  { id: "gb-006", title: "ゼルダの伝説 夢をみる島", console_id: "gb", publisher: "任天堂", developer: "任天堂", release_date: "1993-06-06", original_price: 3900, genre: ["アクションRPG"], description: "コホリント島を舞台にしたゼルダシリーズ作品。携帯機ながら本格的な謎解きとストーリーが高い評価を受けた。", player_count: "1人", current_new_price: 12000, current_used_price: 800, total_sales: 383, premium_rank: 1, slug: "zelda-links-awakening" },
  { id: "gb-007", title: "星のカービィ", console_id: "gb", publisher: "任天堂", developer: "HAL研究所", release_date: "1992-04-27", original_price: 2900, genre: ["アクション"], description: "カービィのデビュー作。吸い込みと空を飛ぶ能力で冒険するシンプルなアクションゲーム。初心者にも優しい難易度設計。", player_count: "1人", current_new_price: 6000, current_used_price: 400, total_sales: 500, premium_rank: 1, slug: "kirby-dream-land" },
  { id: "gb-008", title: "星のカービィ2", console_id: "gb", publisher: "任天堂", developer: "HAL研究所", release_date: "1995-03-21", original_price: 3900, genre: ["アクション"], description: "3匹の動物の仲間とコピー能力を組み合わせて冒険するアクションゲーム。前作より探索要素が増加。", player_count: "1人", current_new_price: 8000, current_used_price: 600, total_sales: 250, premium_rank: 1, slug: "kirby-dream-land-2" },
  { id: "gb-009", title: "ドンキーコング", console_id: "gb", publisher: "任天堂", developer: "任天堂", release_date: "1994-06-14", original_price: 3900, genre: ["アクション", "パズル"], description: "アーケード版のステージを再現した後、大量の新ステージが展開されるアクションパズルゲーム。101ステージを収録。", player_count: "1人", current_new_price: 8000, current_used_price: 500, total_sales: 200, premium_rank: 1, slug: "donkey-kong-gb" },
  { id: "gb-010", title: "ドラゴンクエストモンスターズ テリーのワンダーランド", console_id: "gb", publisher: "エニックス", developer: "トーセ", release_date: "1998-09-25", original_price: 4500, genre: ["RPG"], description: "モンスターを配合して育てるRPG。DQ6の幼少期テリーが主人公。通信対戦・配合の奥深さが人気を博した。", player_count: "1人", current_new_price: 12000, current_used_price: 300, total_sales: 235, premium_rank: 1, slug: "dqm-terry" },
  { id: "gb-011", title: "ポケットモンスター 青", console_id: "gb", publisher: "任天堂", developer: "ゲームフリーク", release_date: "1996-10-15", original_price: 3900, genre: ["RPG"], description: "赤・緑の改良版として発売されたバージョン。グラフィックの改善やバグ修正が行われている。", player_count: "1人", current_new_price: 60000, current_used_price: 2500, total_sales: 500, premium_rank: 2, slug: "pokemon-blue" },
  { id: "gb-012", title: "ポケットモンスター ピカチュウ", console_id: "gb", publisher: "任天堂", developer: "ゲームフリーク", release_date: "1998-09-12", original_price: 3900, genre: ["RPG"], description: "アニメ版を意識したピカチュウが最初のパートナーとなるバージョン。ピカチュウが主人公の後をついてくる。", player_count: "1人", current_new_price: 30000, current_used_price: 2000, total_sales: 316, premium_rank: 1, slug: "pokemon-yellow" },
  { id: "gb-013", title: "メトロイドII RETURN OF SAMUS", console_id: "gb", publisher: "任天堂", developer: "任天堂R&D1", release_date: "1992-01-21", original_price: 3500, genre: ["アクション", "アドベンチャー"], description: "メトロイドの故郷SR388を舞台にしたシリーズ第2作。全メトロイドの殲滅が目的。ベビーメトロイドとの出会いが後のシリーズに影響。", player_count: "1人", current_new_price: 15000, current_used_price: 2500, total_sales: 172, premium_rank: 1, slug: "metroid-2" },
  { id: "gb-014", title: "魔界塔士Sa・Ga", console_id: "gb", publisher: "スクウェア", developer: "スクウェア", release_date: "1989-12-15", original_price: 3500, genre: ["RPG"], description: "ゲームボーイ初のRPG。塔を上り世界を巡る冒険。人間・エスパー・モンスターの3種族システムが特徴。後のサガシリーズの原点。", player_count: "1人", current_new_price: 10000, current_used_price: 300, total_sales: 100, premium_rank: 1, slug: "makai-toushi-saga" },
  { id: "gb-015", title: "Sa・Ga2 秘宝伝説", console_id: "gb", publisher: "スクウェア", developer: "スクウェア", release_date: "1990-12-14", original_price: 3900, genre: ["RPG"], description: "秘宝をめぐる冒険を描くサガシリーズ第2作。メカが仲間に加わり、よりシステムが充実。GB RPGの代表作の一つ。", player_count: "1人", current_new_price: 8000, current_used_price: 400, total_sales: 85, premium_rank: 1, slug: "saga-2" },
  { id: "gb-016", title: "ポケットモンスター 金", console_id: "gb", publisher: "任天堂", developer: "ゲームフリーク", release_date: "1999-11-21", original_price: 3900, genre: ["RPG"], description: "ジョウト地方を舞台にした第2世代ポケモン。昼夜の概念やポケモンの卵などの新要素を追加。100種類の新ポケモンが登場。", player_count: "1人", current_new_price: 25000, current_used_price: 1200, total_sales: 600, premium_rank: 1, slug: "pokemon-gold" },
  { id: "gb-017", title: "ポケットモンスター 銀", console_id: "gb", publisher: "任天堂", developer: "ゲームフリーク", release_date: "1999-11-21", original_price: 3900, genre: ["RPG"], description: "金版と対になる第2世代ポケモン。出現するポケモンが一部異なる。クリア後にカントー地方も冒険できる大ボリューム。", player_count: "1人", current_new_price: 25000, current_used_price: 1200, total_sales: 600, premium_rank: 1, slug: "pokemon-silver" },
  { id: "gb-018", title: "カエルの為に鐘は鳴る", console_id: "gb", publisher: "任天堂", developer: "任天堂/インテリジェントシステムズ", release_date: "1992-09-14", original_price: 3500, genre: ["アクションRPG", "アドベンチャー"], description: "王子がカエルやヘビに変身しながら冒険するアクションRPG。ユーモラスなストーリーとテンポの良いゲーム性が好評。隠れた名作。", player_count: "1人", current_new_price: 20000, current_used_price: 3500, total_sales: 16, premium_rank: 1, slug: "kaeru-no-tame-ni" },
  { id: "gb-019", title: "トリップワールド", console_id: "gb", publisher: "サンソフト", developer: "サンソフト", release_date: "1992-11-27", original_price: 3500, genre: ["アクション"], description: "変身能力を持つ主人公ヤクパンのアクションゲーム。少量生産のため現在は高値で取引されるプレミアソフト。", player_count: "1人", current_new_price: 80000, current_used_price: 25000, total_sales: 5, premium_rank: 5, slug: "trip-world" },
  { id: "gb-020", title: "スパイダーマン3 インベイジョン・オブ・ザ・スパイダースレイヤーズ", console_id: "gb", publisher: "LJN", developer: "Rare", release_date: "1993-07-14", original_price: 3800, genre: ["アクション"], description: "スパイダーマンを操作するアクションゲーム。海外版のみの流通が主で日本版は希少。プレミア価格で取引されている。", player_count: "1人", current_new_price: 60000, current_used_price: 18000, total_sales: 3, premium_rank: 4, slug: "spiderman-3-gb" },
];

import { gbaGames, ndsGames, ps1Games, ps2Games, mdGames, ssGames } from "./games-expanded";

export const allGames: Game[] = [...fcGames, ...sfcGames, ...gbGames, ...gbaGames, ...ndsGames, ...ps1Games, ...ps2Games, ...mdGames, ...ssGames];

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
