import { Metadata } from "next";
import { consoles, getMvpConsoles, getConsole, mvpConsoleIds } from "@/data/consoles";
import { getGamesByConsole } from "@/data/games";
import ConsoleGameListClient from "./ConsoleGameListClient";

export function generateStaticParams() {
  return mvpConsoleIds.map((id) => ({ console: id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ console: string }>;
}): Promise<Metadata> {
  const { console: consoleId } = await params;
  const consoleDef = getConsole(consoleId);
  const consoleName = consoleDef?.short_name ?? consoleId.toUpperCase();
  const fullName = consoleDef?.name ?? consoleId;
  const gameCount = getGamesByConsole(consoleId).length;

  const title = `${fullName}（${consoleName}）ソフト一覧 | RetroGameBank`;
  const description = `${fullName}の全${gameCount}タイトルを掲載。中古価格・新品価格・プレミアランク・販売本数を検索・比較できます。${consoleDef?.manufacturer ?? ""}の${fullName}ソフトをお探しなら。`;
  const url = `https://retrogamebank.com/games/${consoleId}`;

  return {
    title,
    description,
    keywords: `${fullName},${consoleName},ソフト一覧,一覧,検索,中古価格,新品価格,プレミア,レトロゲーム,相場`,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      locale: "ja_JP",
      siteName: "レトロゲームバンク",
      title,
      description,
      url,
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}

function ConsoleJsonLd({ consoleId }: { consoleId: string }) {
  const consoleDef = getConsole(consoleId);
  const games = getGamesByConsole(consoleId);
  if (!consoleDef) return null;

  const fullName = consoleDef.name;
  const consoleName = consoleDef.short_name;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${fullName}（${consoleName}）ソフト一覧`,
    description: `${fullName}の全${games.length}タイトルの中古価格・プレミア情報`,
    url: `https://retrogamebank.com/games/${consoleId}`,
    isPartOf: {
      "@type": "WebSite",
      name: "レトロゲームバンク",
      url: "https://retrogamebank.com",
    },
    numberOfItems: games.length,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: games.length,
      itemListElement: games.slice(0, 10).map((game, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: `https://retrogamebank.com/games/${consoleId}/${game.slug}`,
        name: game.title,
      })),
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

function ConsoleBreadcrumbJsonLd({ consoleId }: { consoleId: string }) {
  const consoleDef = getConsole(consoleId);
  if (!consoleDef) return null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "トップ", item: "https://retrogamebank.com" },
      { "@type": "ListItem", position: 2, name: `${consoleDef.name}ソフト一覧` },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}


const consoleDescriptions: Record<string, string> = {
  "fc": "1983年に任天堂が発売した8ビット家庭用ゲーム機。日本のゲーム文化を確立し、スーパーマリオブラザーズやドラゴンクエストなど数々の名作を生み出した。全世界で約6200万台を販売。",
  "sfc": "1990年に任天堂が発売した16ビット家庭用ゲーム機。FCの後継機として高い表現力を実現し、ファイナルファンタジーVI、クロノ・トリガー、ゼルダの伝説 神々のトライフォースなど名作RPGの宝庫。",
  "gb": "1989年に任天堂が発売した携帯型ゲーム機。ポケットモンスターの大ヒットで社会現象を起こし、カラー版を含め全世界で約1億2800万台を販売した。",
  "n64": "1996年に任天堂が発売した64ビット家庭用ゲーム機。3Dゲームの先駆けとなり、スーパーマリオ64、ゼルダの伝説 時のオカリナ、大乱闘スマッシュブラザーズなど革新的タイトルを輩出。",
  "gc": "2001年に任天堂が発売した家庭用ゲーム機。8cmディスクを採用したコンパクトな筐体で、大乱闘スマッシュブラザーズDX、どうぶつの森+などの人気タイトルを生んだ。",
  "wii": "2006年に任天堂が発売した家庭用ゲーム機。リモコン型コントローラによる直感的な操作で幅広い層を取り込み、全世界で約1億台を販売した大ヒットハード。",
  "wiiu": "2012年に任天堂が発売した家庭用ゲーム機。液晶画面付きGamePadが特徴で、スプラトゥーンやマリオカート8など後のSwitchにつながる名作を生み出した。",
  "gba": "2001年に任天堂が発売した32ビット携帯型ゲーム機。ゲームボーイとの互換性を持ち、ポケットモンスター ルビー・サファイア、ファイアーエムブレムなど人気シリーズの携帯版が充実。",
  "nds": "2004年に任天堂が発売したデュアルスクリーン搭載の携帯型ゲーム機。タッチ操作を導入し、脳トレやどうぶつの森など新ジャンルを開拓。全世界で約1億5400万台を販売。",
  "3ds": "2011年に任天堂が発売した裸眼立体視対応の携帯型ゲーム機。モンスターハンター4、ポケットモンスター X・Y、とびだせ どうぶつの森など多数の人気作を擁する。",
  "md": "1988年にセガが発売した16ビット家庭用ゲーム機。北米ではGenesisとして知られ、ソニック・ザ・ヘッジホッグで任天堂に対抗。全世界で約3000万台を販売。",
  "ss": "1994年にセガが発売した32ビット家庭用ゲーム機。2D描画性能に優れ、バーチャファイター、サクラ大戦、ナイツなどセガの代表作が多数。日本市場で根強い人気を持つ。",
  "dc": "1998年にセガが発売した家庭用ゲーム機。モデム内蔵でオンラインゲームの先駆けとなり、シェンムー、ジェットセットラジオなど独創的な作品が多い。",
  "mk3": "1985年にセガが日本で発売した8ビット家庭用ゲーム機。海外ではマスターシステムとして展開され、ファンタシースターなどセガ初期の名作RPGを生んだ。",
  "gg": "1990年にセガが発売したカラー液晶搭載の携帯型ゲーム機。ゲームボーイのライバルとして登場し、バックライト付きカラー画面とソニックシリーズなどが特徴。",
  "ps1": "1994年にソニーが発売したCD-ROM採用の家庭用ゲーム機。ファイナルファンタジーVII、バイオハザード、メタルギアソリッドなど歴史的名作を生み出し、全世界で約1億200万台を販売。",
  "ps2": "2000年にソニーが発売した家庭用ゲーム機。DVD再生機能を搭載し、史上最も売れたゲーム機として全世界約1億5500万台を記録。ドラゴンクエストVIII、ファイナルファンタジーXなど名作多数。",
  "ps3": "2006年にソニーが発売した家庭用ゲーム機。Blu-ray搭載で高精細映像を実現し、メタルギアソリッド4、アンチャーテッド、ラストオブアスなどハイクオリティな作品が揃う。",
  "psp": "2004年にソニーが発売した携帯型ゲーム機。UMDディスクを採用し、モンスターハンターポータブルシリーズの大ヒットで日本市場を牽引。全世界で約8000万台を販売。",
  "vita": "2011年にソニーが発売した携帯型ゲーム機。有機ELディスプレイと背面タッチパネルを搭載し、ペルソナ4 ザ・ゴールデン、Gravity Dazeなどの良作を輩出。",
  "pce": "1987年にNECが発売した家庭用ゲーム機。HuCARDと呼ばれるカード型メディアを採用したコンパクト設計で、CD-ROM2システムにも対応。天外魔境やイースなどが人気。",
  "pcegt": "1990年にNECが発売したPCエンジンの携帯版。PCエンジン用HuCARDがそのまま遊べる当時としては画期的な互換携帯機。",
  "neogeo": "1990年にSNKが発売したアーケード品質の家庭用ゲーム機。本体・ソフトとも高額だが、KOF、餓狼伝説、サムライスピリッツなど格闘ゲームの名作が揃う。",
  "ngp": "1998年にSNKが発売した携帯型ゲーム機。カラー版のネオジオポケットカラーも展開し、KOFやSNK VS. CAPCOMなど対戦格闘の携帯版が充実。",
  "xbox": "2001年にMicrosoftが発売した家庭用ゲーム機。HDD内蔵でXbox Liveによるオンラインサービスを展開。Haloシリーズの誕生で海外市場を席巻した。",
  "x360": "2005年にMicrosoftが発売した家庭用ゲーム機。Xbox Live Arcadeの充実とオンライン対戦の普及に貢献し、Halo 3、ギアーズ・オブ・ウォーなど洋ゲーの名作が豊富。",
};
export default async function ConsoleGameListPage({
  params,
}: {
  params: Promise<{ console: string }>;
}) {
  const { console: consoleId } = await params;
  const consoleInfo = consoles.find(c => c.id === consoleId);
  const consoleName = consoleInfo?.name || consoleId;
  const mfr = consoleInfo?.manufacturer || "";
  return (
    <>
      <ConsoleJsonLd consoleId={consoleId} />
      <ConsoleBreadcrumbJsonLd consoleId={consoleId} />
            <section className="mb-4 px-1">
        <p className="text-sm text-gray-400 leading-relaxed">
          {consoleName}（{mfr}）のゲームソフト一覧です。中古価格・新品価格・プレミアランキング・販売本数を一覧で確認できます。お探しのレトロゲームソフトの価格比較にご活用ください。
        </p>
          {consoleDescriptions[consoleId] && (
            <p className="text-sm text-gray-400 leading-relaxed mt-2">
              {consoleDescriptions[consoleId]}
            </p>
          )}
        </section>
<ConsoleGameListClient paramsPromise={params} />
    </>
  );
}
