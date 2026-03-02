import { Game } from "@/types";

// PS1（PlayStation）ソフト
export const ps1Games: Game[] = [
  {
    id: "ps1-001", title: "ファイナルファンタジーVII", console_id: "ps1",
    publisher: "スクウェア", developer: "スクウェア", release_date: "1997-01-31",
    original_price: 6800, genre: ["RPG"], description: "3Dポリゴンで描かれたFFシリーズ第7作。クラウドの物語とマテリアシステム。RPGを世界的に普及させた歴史的作品。",
    player_count: "1人", current_new_price: 25000, current_used_price: 500, total_sales: 400, premium_rank: 1, slug: "final-fantasy-7"
  },
  {
    id: "ps1-002", title: "ファイナルファンタジーVIII", console_id: "ps1",
    publisher: "スクウェア", developer: "スクウェア", release_date: "1999-02-11",
    original_price: 7800, genre: ["RPG"], description: "ジャンクションシステムを採用したFFシリーズ第8作。スコールとリノアの物語。リアルな等身のキャラクターが話題に。",
    player_count: "1人", current_new_price: 12000, current_used_price: 300, total_sales: 370, premium_rank: 1, slug: "final-fantasy-8"
  },
  {
    id: "ps1-003", title: "ファイナルファンタジーIX", console_id: "ps1",
    publisher: "スクウェア", developer: "スクウェア", release_date: "2000-07-07",
    original_price: 7800, genre: ["RPG"], description: "原点回帰をコンセプトとしたFF第9作。ジタンとガーネットの冒険。クリスタルへの回帰とファンタジー色の強い世界。",
    player_count: "1人", current_new_price: 10000, current_used_price: 500, total_sales: 280, premium_rank: 1, slug: "final-fantasy-9"
  },
  {
    id: "ps1-004", title: "メタルギアソリッド", console_id: "ps1",
    publisher: "コナミ", developer: "コナミ", release_date: "1998-09-03",
    original_price: 6800, genre: ["アクション", "アドベンチャー"], description: "ステルスアクションの金字塔。ソリッド・スネークがシャドーモセス島に潜入する。映画的演出とゲーム性の融合。",
    player_count: "1人", current_new_price: 15000, current_used_price: 500, total_sales: 600, premium_rank: 1, slug: "metal-gear-solid"
  },
  {
    id: "ps1-005", title: "バイオハザード", console_id: "ps1",
    publisher: "カプコン", developer: "カプコン", release_date: "1996-03-22",
    original_price: 5800, genre: ["アクション", "アドベンチャー"], description: "サバイバルホラーの原点。洋館に潜む恐怖に立ち向かう。限られた弾薬とリソース管理の緊張感。",
    player_count: "1人", current_new_price: 10000, current_used_price: 500, total_sales: 500, premium_rank: 1, slug: "biohazard"
  },
  {
    id: "ps1-006", title: "クラッシュ・バンディクー", console_id: "ps1",
    publisher: "ソニー", developer: "ノーティードッグ", release_date: "1996-12-06",
    original_price: 5800, genre: ["アクション"], description: "PSを代表するアクションゲーム。バンディクーのクラッシュが島を冒険する。奥スクロール主体の3Dアクション。",
    player_count: "1人", current_new_price: 5000, current_used_price: 300, total_sales: 680, premium_rank: 1, slug: "crash-bandicoot"
  },
  {
    id: "ps1-007", title: "ゼノギアス", console_id: "ps1",
    publisher: "スクウェア", developer: "スクウェア", release_date: "1998-02-11",
    original_price: 6800, genre: ["RPG"], description: "哲学的・宗教的テーマを内包する壮大なRPG。ギアと呼ばれる巨大ロボットでの戦闘と深遠なストーリーが特徴。",
    player_count: "1人", current_new_price: 20000, current_used_price: 2500, total_sales: 120, premium_rank: 1, slug: "xenogears"
  },
  {
    id: "ps1-008", title: "ペルソナ2 罪", console_id: "ps1",
    publisher: "アトラス", developer: "アトラス", release_date: "1999-06-24",
    original_price: 6800, genre: ["RPG"], description: "現代の高校生が異世界の危機に立ち向かうRPG。噂が現実化するシステムと深いキャラクター描写。",
    player_count: "1人", current_new_price: 15000, current_used_price: 3000, total_sales: 25, premium_rank: 1, slug: "persona-2-tsumi"
  },
  {
    id: "ps1-009", title: "ヴァルキリープロファイル", console_id: "ps1",
    publisher: "エニックス", developer: "トライエース", release_date: "1999-12-22",
    original_price: 6800, genre: ["RPG", "アクション"], description: "北欧神話をモチーフにしたRPG。戦乙女レナスが死者の魂を集める。独自のコンボシステムとマルチエンディング。",
    player_count: "1人", current_new_price: 30000, current_used_price: 5000, total_sales: 35, premium_rank: 1, slug: "valkyrie-profile"
  },
  {
    id: "ps1-010", title: "パラサイト・イヴ", console_id: "ps1",
    publisher: "スクウェア", developer: "スクウェア", release_date: "1998-03-29",
    original_price: 6800, genre: ["RPG", "アクション"], description: "ミトコンドリアの反乱をテーマにしたシネマティックRPG。NYを舞台にしたホラー要素とATBベースの戦闘。",
    player_count: "1人", current_new_price: 12000, current_used_price: 1500, total_sales: 100, premium_rank: 1, slug: "parasite-eve"
  },
];

// PS2（PlayStation 2）ソフト
export const ps2Games: Game[] = [
  {
    id: "ps2-001", title: "ファイナルファンタジーX", console_id: "ps2",
    publisher: "スクウェア", developer: "スクウェア", release_date: "2001-07-19",
    original_price: 7800, genre: ["RPG"], description: "フルボイスを初採用したFFシリーズ第10作。ティーダとユウナの物語。スフィア盤システムとCTBを導入。",
    player_count: "1人", current_new_price: 8000, current_used_price: 300, total_sales: 325, premium_rank: 1, slug: "final-fantasy-10"
  },
  {
    id: "ps2-002", title: "ドラゴンクエストVIII 空と海と大地と呪われし姫君", console_id: "ps2",
    publisher: "スクウェア・エニックス", developer: "レベルファイブ", release_date: "2004-11-27",
    original_price: 8800, genre: ["RPG"], description: "フル3Dで描かれたDQシリーズ第8作。トゥーンレンダリングによる美麗なグラフィックと広大な世界。",
    player_count: "1人", current_new_price: 6000, current_used_price: 300, total_sales: 370, premium_rank: 1, slug: "dragon-quest-8"
  },
  {
    id: "ps2-003", title: "キングダム ハーツ", console_id: "ps2",
    publisher: "スクウェア", developer: "スクウェア", release_date: "2002-03-28",
    original_price: 6800, genre: ["アクションRPG"], description: "ディズニーとFFのコラボレーションRPG。ソラがキーブレードを手にディズニーの世界を冒険する。",
    player_count: "1人", current_new_price: 5000, current_used_price: 200, total_sales: 640, premium_rank: 1, slug: "kingdom-hearts"
  },
  {
    id: "ps2-004", title: "メタルギアソリッド3 スネークイーター", console_id: "ps2",
    publisher: "コナミ", developer: "コナミ", release_date: "2004-12-16",
    original_price: 7329, genre: ["アクション", "アドベンチャー"], description: "冷戦時代のソ連を舞台にしたステルスアクション。ビッグボスの原点を描く。サバイバル要素とカモフラージュシステム。",
    player_count: "1人", current_new_price: 8000, current_used_price: 500, total_sales: 370, premium_rank: 1, slug: "mgs3"
  },
  {
    id: "ps2-005", title: "ワンダと巨像", console_id: "ps2",
    publisher: "ソニー", developer: "Team ICO", release_date: "2005-10-27",
    original_price: 6800, genre: ["アクション", "アドベンチャー"], description: "16体の巨像を倒すことだけに特化したアクションゲーム。少女を救うため広大な禁じられた地を旅する。",
    player_count: "1人", current_new_price: 8000, current_used_price: 800, total_sales: 110, premium_rank: 1, slug: "wander-to-kyozou"
  },
  {
    id: "ps2-006", title: "ペルソナ4", console_id: "ps2",
    publisher: "アトラス", developer: "アトラス", release_date: "2008-07-10",
    original_price: 7329, genre: ["RPG"], description: "田舎町の連続殺人事件を追うジュブナイルRPG。テレビの中の異世界でシャドウと戦う。日常と非日常の対比が魅力。",
    player_count: "1人", current_new_price: 15000, current_used_price: 3000, total_sales: 50, premium_rank: 1, slug: "persona-4"
  },
  {
    id: "ps2-007", title: "ペルソナ3", console_id: "ps2",
    publisher: "アトラス", developer: "アトラス", release_date: "2006-07-13",
    original_price: 7329, genre: ["RPG"], description: "影時間に現れるシャドウと戦うジュブナイルRPG。コミュニティシステムで仲間との絆を深める。「死」をテーマにした物語。",
    player_count: "1人", current_new_price: 12000, current_used_price: 2500, total_sales: 40, premium_rank: 1, slug: "persona-3"
  },
  {
    id: "ps2-008", title: "真・三國無双2", console_id: "ps2",
    publisher: "コーエー", developer: "コーエー/オメガフォース", release_date: "2001-09-20",
    original_price: 6800, genre: ["アクション"], description: "三国志を舞台にした一騎当千アクション。大量の敵をなぎ倒す爽快感が特徴。シリーズを確立した一作。",
    player_count: "1〜2人", current_new_price: 3000, current_used_price: 100, total_sales: 250, premium_rank: 1, slug: "shin-sangoku-musou-2"
  },
  {
    id: "ps2-009", title: "ICO", console_id: "ps2",
    publisher: "ソニー", developer: "Team ICO", release_date: "2001-12-06",
    original_price: 6800, genre: ["アクション", "アドベンチャー"], description: "角の生えた少年イコが少女ヨルダと手をつないで城を脱出するアドベンチャー。独特の芸術的な世界観。",
    player_count: "1人", current_new_price: 8000, current_used_price: 500, total_sales: 70, premium_rank: 1, slug: "ico"
  },
  {
    id: "ps2-010", title: "グランツーリスモ4", console_id: "ps2",
    publisher: "ソニー", developer: "ポリフォニー・デジタル", release_date: "2004-12-28",
    original_price: 7329, genre: ["レース"], description: "700台以上の実在車種と50以上のコースを収録したレースシミュレーター。PS2の性能を極限まで引き出したグラフィック。",
    player_count: "1〜2人", current_new_price: 4000, current_used_price: 200, total_sales: 1090, premium_rank: 1, slug: "gran-turismo-4"
  },
];
