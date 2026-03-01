import { Game } from "@/types";

// GBA（ゲームボーイアドバンス）ソフト
export const gbaGames: Game[] = [
  {
    id: "gba-001", title: "ポケットモンスター ルビー", console_id: "gba",
    publisher: "任天堂", developer: "ゲームフリーク", release_date: "2002-11-21",
    original_price: 4800, genre: ["RPG"], description: "ホウエン地方を舞台にした第3世代ポケモン。ダブルバトルやとくせいシステムを新導入。",
    player_count: "1人", current_new_price: 15000, current_used_price: 1500, total_sales: 535, premium_rank: 1, slug: "pokemon-ruby"
  },
  {
    id: "gba-002", title: "ポケットモンスター サファイア", console_id: "gba",
    publisher: "任天堂", developer: "ゲームフリーク", release_date: "2002-11-21",
    original_price: 4800, genre: ["RPG"], description: "ルビーと対になるバージョン。グラードンとカイオーガの伝説をめぐる冒険。",
    player_count: "1人", current_new_price: 15000, current_used_price: 1500, total_sales: 535, premium_rank: 1, slug: "pokemon-sapphire"
  },
  {
    id: "gba-003", title: "ポケットモンスター エメラルド", console_id: "gba",
    publisher: "任天堂", developer: "ゲームフリーク", release_date: "2004-09-16",
    original_price: 4800, genre: ["RPG"], description: "ルビー・サファイアのマイナーチェンジ版。バトルフロンティアを収録し、やりこみ要素が大幅に増加。",
    player_count: "1人", current_new_price: 25000, current_used_price: 4000, total_sales: 316, premium_rank: 1, slug: "pokemon-emerald"
  },
  {
    id: "gba-004", title: "ポケットモンスター ファイアレッド", console_id: "gba",
    publisher: "任天堂", developer: "ゲームフリーク", release_date: "2004-01-29",
    original_price: 4800, genre: ["RPG"], description: "初代赤のリメイク。カントー地方の冒険をGBAのグラフィックで再体験。クリア後にナナシマも冒険可能。",
    player_count: "1人", current_new_price: 18000, current_used_price: 3000, total_sales: 450, premium_rank: 1, slug: "pokemon-firered"
  },
  {
    id: "gba-005", title: "ファイナルファンタジータクティクスアドバンス", console_id: "gba",
    publisher: "スクウェア・エニックス", developer: "スクウェア・エニックス", release_date: "2003-02-14",
    original_price: 5800, genre: ["シミュレーションRPG"], description: "異世界イヴァリースを舞台にしたタクティカルRPG。ロウシステムによる戦略性とジョブチェンジが特徴。",
    player_count: "1人", current_new_price: 8000, current_used_price: 800, total_sales: 70, premium_rank: 1, slug: "ffta"
  },
  {
    id: "gba-006", title: "ゼルダの伝説 ふしぎのぼうし", console_id: "gba",
    publisher: "任天堂", developer: "カプコン/フラグシップ", release_date: "2004-11-04",
    original_price: 4800, genre: ["アクションRPG"], description: "ミニサイズのリンクが活躍するゼルダシリーズ。エゼロの帽子の力で小さくなり、新たな視点で冒険する。",
    player_count: "1人", current_new_price: 15000, current_used_price: 3500, total_sales: 80, premium_rank: 1, slug: "zelda-minish-cap"
  },
  {
    id: "gba-007", title: "メトロイド フュージョン", console_id: "gba",
    publisher: "任天堂", developer: "任天堂R&D1", release_date: "2003-02-14",
    original_price: 4800, genre: ["アクション", "アドベンチャー"], description: "サムスがX寄生体と戦うメトロイドシリーズ作品。緊迫したストーリーと探索型アクションの完成度が高い。",
    player_count: "1人", current_new_price: 12000, current_used_price: 3000, total_sales: 50, premium_rank: 1, slug: "metroid-fusion"
  },
  {
    id: "gba-008", title: "ファイアーエムブレム 烈火の剣", console_id: "gba",
    publisher: "任天堂", developer: "インテリジェントシステムズ", release_date: "2003-04-25",
    original_price: 4800, genre: ["シミュレーションRPG"], description: "3人の主人公の物語が交錯するシミュレーションRPG。GBAでFEシリーズの新規ファンを大きく開拓した。",
    player_count: "1人", current_new_price: 10000, current_used_price: 1500, total_sales: 80, premium_rank: 1, slug: "fire-emblem-rekka"
  },
  {
    id: "gba-009", title: "MOTHER3", console_id: "gba",
    publisher: "任天堂", developer: "ブラウニーブラウン/HAL研究所", release_date: "2006-04-20",
    original_price: 4800, genre: ["RPG"], description: "MOTHERシリーズ完結編。ノーウェア島を舞台に、少年リュカの壮大で感動的な物語が展開される。",
    player_count: "1人", current_new_price: 20000, current_used_price: 4500, total_sales: 40, premium_rank: 1, slug: "mother-3"
  },
  {
    id: "gba-010", title: "逆転裁判", console_id: "gba",
    publisher: "カプコン", developer: "カプコン", release_date: "2001-10-12",
    original_price: 4800, genre: ["アドベンチャー"], description: "弁護士・成歩堂龍一を主人公にした法廷アドベンチャー。証拠品と証言の矛盾を突く爽快な推理ゲーム。",
    player_count: "1人", current_new_price: 8000, current_used_price: 800, total_sales: 60, premium_rank: 1, slug: "gyakuten-saiban"
  },
  {
    id: "gba-011", title: "スーパーロボット大戦OG", console_id: "gba",
    publisher: "バンプレスト", developer: "バンプレスト", release_date: "2002-11-22",
    original_price: 5800, genre: ["シミュレーションRPG"], description: "オリジナルキャラクターのみで構成されたスパロボシリーズ。GBAならではの手軽さと充実した戦闘演出。",
    player_count: "1人", current_new_price: 5000, current_used_price: 500, total_sales: 45, premium_rank: 1, slug: "srw-og"
  },
  {
    id: "gba-012", title: "リズム天国", console_id: "gba",
    publisher: "任天堂", developer: "任天堂", release_date: "2006-08-03",
    original_price: 4800, genre: ["リズム"], description: "リズムに合わせてボタンを押すシンプルなリズムゲーム。つんく♂プロデュース。中毒性が高い。",
    player_count: "1人", current_new_price: 10000, current_used_price: 2000, total_sales: 50, premium_rank: 1, slug: "rhythm-tengoku"
  },
  {
    id: "gba-013", title: "ロックマンエグゼ3", console_id: "gba",
    publisher: "カプコン", developer: "カプコン", release_date: "2002-12-06",
    original_price: 4800, genre: ["アクションRPG"], description: "電脳世界を冒険するロックマンエグゼシリーズ第3作。バトルチップを駆使したリアルタイムバトルの完成度が高い。",
    player_count: "1人", current_new_price: 8000, current_used_price: 1200, total_sales: 85, premium_rank: 1, slug: "rockman-exe-3"
  },
  {
    id: "gba-014", title: "黄金の太陽 開かれし封印", console_id: "gba",
    publisher: "任天堂", developer: "キャメロット", release_date: "2001-08-01",
    original_price: 4800, genre: ["RPG"], description: "エレメンタルスター（ジン）を集めて戦うRPG。GBAとは思えない美麗なグラフィックと演出が特徴。",
    player_count: "1人", current_new_price: 6000, current_used_price: 800, total_sales: 74, premium_rank: 1, slug: "golden-sun"
  },
  {
    id: "gba-015", title: "星のカービィ 鏡の大迷宮", console_id: "gba",
    publisher: "任天堂", developer: "HAL研究所/フラグシップ", release_date: "2004-04-15",
    original_price: 4800, genre: ["アクション"], description: "4人のカービィが鏡の国を冒険するアクション。通信プレイで4人同時プレイが可能。迷宮探索型の構成。",
    player_count: "1〜4人", current_new_price: 8000, current_used_price: 1500, total_sales: 90, premium_rank: 1, slug: "kirby-mirror"
  },
];

// NDS（ニンテンドーDS）ソフト
export const ndsGames: Game[] = [
  {
    id: "nds-001", title: "ポケットモンスター ダイヤモンド", console_id: "nds",
    publisher: "任天堂", developer: "ゲームフリーク", release_date: "2006-09-28",
    original_price: 4800, genre: ["RPG"], description: "シンオウ地方を舞台にした第4世代ポケモン。Wi-Fi通信による世界中のプレイヤーとの交換・対戦が実現。",
    player_count: "1人", current_new_price: 8000, current_used_price: 1000, total_sales: 585, premium_rank: 1, slug: "pokemon-diamond"
  },
  {
    id: "nds-002", title: "ポケットモンスター ハートゴールド", console_id: "nds",
    publisher: "任天堂", developer: "ゲームフリーク", release_date: "2009-09-12",
    original_price: 4800, genre: ["RPG"], description: "GB版金のリメイク。ポケウォーカー同梱。ジョウト＋カントー地方の大ボリューム冒険。",
    player_count: "1人", current_new_price: 15000, current_used_price: 5000, total_sales: 394, premium_rank: 2, slug: "pokemon-heartgold"
  },
  {
    id: "nds-003", title: "ドラゴンクエストIX 星空の守り人", console_id: "nds",
    publisher: "スクウェア・エニックス", developer: "レベルファイブ", release_date: "2009-07-11",
    original_price: 5980, genre: ["RPG"], description: "シリーズ初の携帯機メインタイトル。すれちがい通信による宝の地図交換が社会現象に。マルチプレイ対応。",
    player_count: "1〜4人", current_new_price: 5000, current_used_price: 300, total_sales: 437, premium_rank: 1, slug: "dragon-quest-9"
  },
  {
    id: "nds-004", title: "おいでよ どうぶつの森", console_id: "nds",
    publisher: "任天堂", developer: "任天堂", release_date: "2005-11-23",
    original_price: 4800, genre: ["シミュレーション"], description: "DS初のどうぶつの森。Wi-Fiで他プレイヤーの村を訪問可能。タッチペン操作で直感的なコミュニケーション。",
    player_count: "1〜4人", current_new_price: 3000, current_used_price: 200, total_sales: 523, premium_rank: 1, slug: "oideyo-doubutsu-no-mori"
  },
  {
    id: "nds-005", title: "Newスーパーマリオブラザーズ", console_id: "nds",
    publisher: "任天堂", developer: "任天堂", release_date: "2006-05-25",
    original_price: 4800, genre: ["アクション"], description: "2Dマリオの復活作。巨大マリオやマメマリオなど新変身を追加。対戦ミニゲームも収録。",
    player_count: "1〜4人", current_new_price: 4000, current_used_price: 300, total_sales: 640, premium_rank: 1, slug: "new-super-mario-bros"
  },
  {
    id: "nds-006", title: "世界樹の迷宮", console_id: "nds",
    publisher: "アトラス", developer: "アトラス", release_date: "2007-01-18",
    original_price: 5229, genre: ["RPG"], description: "下画面にマッピングしながらダンジョンを探索する3DダンジョンRPG。高難度と地図作成の楽しさで人気を博した。",
    player_count: "1人", current_new_price: 5000, current_used_price: 600, total_sales: 30, premium_rank: 1, slug: "sekaiju-no-meikyuu"
  },
  {
    id: "nds-007", title: "レイトン教授と不思議な町", console_id: "nds",
    publisher: "レベルファイブ", developer: "レベルファイブ", release_date: "2007-02-15",
    original_price: 4800, genre: ["パズル", "アドベンチャー"], description: "ナゾ解きアドベンチャー。レイトン教授とルークが不思議な町の謎に挑む。130以上のナゾを収録。",
    player_count: "1人", current_new_price: 3000, current_used_price: 200, total_sales: 200, premium_rank: 1, slug: "layton-fushigi-na-machi"
  },
  {
    id: "nds-008", title: "ファイアーエムブレム 新・暗黒竜と光の剣", console_id: "nds",
    publisher: "任天堂", developer: "インテリジェントシステムズ", release_date: "2008-08-07",
    original_price: 4800, genre: ["シミュレーションRPG"], description: "FC版暗黒竜のリメイク。兵種変更システムを新導入。Wi-Fi対戦も可能。",
    player_count: "1人", current_new_price: 8000, current_used_price: 2000, total_sales: 25, premium_rank: 1, slug: "fe-shin-ankokuryu"
  },
  {
    id: "nds-009", title: "逆転裁判4", console_id: "nds",
    publisher: "カプコン", developer: "カプコン", release_date: "2007-04-12",
    original_price: 4990, genre: ["アドベンチャー"], description: "新主人公・王泥喜法介の物語。タッチパネルを活用した新しい調査・法廷パート。",
    player_count: "1人", current_new_price: 4000, current_used_price: 300, total_sales: 50, premium_rank: 1, slug: "gyakuten-saiban-4"
  },
  {
    id: "nds-010", title: "すばらしきこのせかい", console_id: "nds",
    publisher: "スクウェア・エニックス", developer: "スクウェア・エニックス/ジュピター", release_date: "2007-07-27",
    original_price: 5980, genre: ["アクションRPG"], description: "渋谷を舞台にした異色のアクションRPG。2画面を使った独自の戦闘システムとスタイリッシュな世界観。",
    player_count: "1人", current_new_price: 12000, current_used_price: 2500, total_sales: 20, premium_rank: 1, slug: "subarashiki-kono-sekai"
  },
];

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

// SS（セガサターン）ソフト
export const ssGames: Game[] = [
  {
    id: "ss-001", title: "ナイツ NiGHTS into Dreams...", console_id: "ss",
    publisher: "セガ", developer: "ソニックチーム", release_date: "1996-07-05",
    original_price: 5800, genre: ["アクション"], description: "夢の世界を飛び回るフライングアクション。ソニックチームが手がけた幻想的な世界観とスコアアタックの中毒性。",
    player_count: "1〜2人", current_new_price: 5000, current_used_price: 500, total_sales: 100, premium_rank: 1, slug: "nights"
  },
  {
    id: "ss-002", title: "サクラ大戦", console_id: "ss",
    publisher: "セガ", developer: "セガ/レッドカンパニー", release_date: "1996-09-27",
    original_price: 6800, genre: ["シミュレーションRPG", "アドベンチャー"], description: "大正時代の帝都を舞台にしたドラマチックアドベンチャー。恋愛ADVとSRPGの融合。声優陣の豪華さも話題に。",
    player_count: "1人", current_new_price: 3000, current_used_price: 200, total_sales: 110, premium_rank: 1, slug: "sakura-taisen"
  },
  {
    id: "ss-003", title: "パンツァードラグーンツヴァイ", console_id: "ss",
    publisher: "セガ", developer: "チームアンドロメダ", release_date: "1996-03-22",
    original_price: 5800, genre: ["シューティング"], description: "ドラゴンに乗って空を飛ぶ3Dレールシューティング。進化するドラゴンと壮大な世界観。",
    player_count: "1人", current_new_price: 8000, current_used_price: 1500, total_sales: 50, premium_rank: 1, slug: "panzer-dragoon-zwei"
  },
  {
    id: "ss-004", title: "バーチャファイター2", console_id: "ss",
    publisher: "セガ", developer: "セガAM2", release_date: "1995-12-01",
    original_price: 6800, genre: ["格闘"], description: "3D格闘ゲームの金字塔の家庭用移植版。サターン版はアーケードに迫る移植度で高い評価を受けた。",
    player_count: "1〜2人", current_new_price: 3000, current_used_price: 100, total_sales: 150, premium_rank: 1, slug: "virtua-fighter-2"
  },
  {
    id: "ss-005", title: "グランディア", console_id: "ss",
    publisher: "ゲームアーツ", developer: "ゲームアーツ", release_date: "1997-12-18",
    original_price: 6800, genre: ["RPG"], description: "冒険への憧れをテーマにした王道RPG。IP（イニシアチブポイント）システムによるリアルタイムバトルが特徴。",
    player_count: "1人", current_new_price: 10000, current_used_price: 2000, total_sales: 50, premium_rank: 1, slug: "grandia"
  },
  {
    id: "ss-006", title: "ラジアントシルバーガン", console_id: "ss",
    publisher: "ESP/トレジャー", developer: "トレジャー", release_date: "1998-07-23",
    original_price: 5800, genre: ["シューティング"], description: "7つの武器を使い分けるシューティングゲーム。高い戦略性と芸術的なボスデザイン。プレミア化が進んでいる。",
    player_count: "1〜2人", current_new_price: 80000, current_used_price: 30000, total_sales: 10, premium_rank: 5, slug: "radiant-silvergun"
  },
  {
    id: "ss-007", title: "ガーディアンヒーローズ", console_id: "ss",
    publisher: "セガ", developer: "トレジャー", release_date: "1996-01-26",
    original_price: 5800, genre: ["アクション", "RPG"], description: "6人同時対戦可能なベルトスクロールアクションRPG。マルチシナリオとレベルアップシステムが特徴。",
    player_count: "1〜6人", current_new_price: 25000, current_used_price: 8000, total_sales: 15, premium_rank: 2, slug: "guardian-heroes"
  },
  {
    id: "ss-008", title: "バルクスラッシュ", console_id: "ss",
    publisher: "ハドソン", developer: "CAプロダクション", release_date: "1997-07-11",
    original_price: 5800, genre: ["シューティング", "アクション"], description: "変形するメカを操る3Dシューティングアクション。少量生産のためプレミア価格で取引されている。",
    player_count: "1人", current_new_price: 100000, current_used_price: 40000, total_sales: 5, premium_rank: 5, slug: "bulk-slash"
  },
  {
    id: "ss-009", title: "シャイニング・フォースIII", console_id: "ss",
    publisher: "セガ", developer: "キャメロット", release_date: "1997-12-11",
    original_price: 6800, genre: ["シミュレーションRPG"], description: "3部作で構成されるシミュレーションRPG。3Dマップでの戦略的な戦闘と壮大な物語。",
    player_count: "1人", current_new_price: 15000, current_used_price: 3000, total_sales: 20, premium_rank: 1, slug: "shining-force-3"
  },
  {
    id: "ss-010", title: "デビルサマナー ソウルハッカーズ", console_id: "ss",
    publisher: "アトラス", developer: "アトラス", release_date: "1997-11-13",
    original_price: 6800, genre: ["RPG"], description: "電脳都市を舞台にした女神転生シリーズ外伝。COMPを使った悪魔召喚とハッキング。サイバーパンクな世界観。",
    player_count: "1人", current_new_price: 8000, current_used_price: 1500, total_sales: 20, premium_rank: 1, slug: "soul-hackers"
  },
];
