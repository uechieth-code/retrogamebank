import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

const GA_MEASUREMENT_ID = "G-Y3Y966YP2Z2";

export const metadata: Metadata = {
  title: {
    default: "レトロゲームバンク | レトロゲーム中古価格・プレミア情報サイト",
    template: "%s | レトロゲームバンク",
  },
  description:
    "ファミコン・スーファミ・ゲームボーイ・PS1・PS2・セガサターン・メガドライブなど24機種15000タイトル以上のレトロゲーム中古価格・新品価格・プレミアランク・販売本数を一覧で比較。レトロゲームの相場がひと目で分かる価格情報データベース。",
  keywords: "レトロゲーム,レトロゲーム 一覧,レトロゲーム 価格,ゲーム 一覧,ファミコン ソフト 一覧,スーファミ ソフト 一覧,レトロゲーム プレミア,中古ゲーム 価格,ファミコン,スーパーファミコン,ゲームボーイ,NINTENDO64,ゲームキューブ,Wii,プレイステーション,PS2,PS3,PSP,メガドライブ,セガサターン,ドリームキャスト,PCエンジン,ネオジオ,プレミアソフト,レトロゲーム 相場",
  icons: {
    icon: "/icon.svg",
  },
  metadataBase: new URL("https://retrogamebank.com"),
  alternates: {
    canonical: "https://retrogamebank.com",
  },
  openGraph: {
    type: "website",
    locale: "ja_JP",
    siteName: "レトロゲームバンク",
    title: "レトロゲームバンク | レトロゲーム中古価格・プレミア情報サイト",
    description: "24機種15000タイトル以上のレトロゲーム価格・プレミア情報を収録。中古相場がひと目で分かるデータベース。",
    url: "https://retrogamebank.com",
    images: [
      {
        url: "https://retrogamebank.com/ogp.png",
        width: 1200,
        height: 630,
        alt: "レトロゲームバンク",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "レトロゲームバンク | レトロゲーム中古価格・プレミア情報",
    description: "24機種15000タイトル以上のレトロゲーム価格情報を収録。",
    images: ["https://retrogamebank.com/ogp.png"],
  },
  verification: {
    google: "QlaNlr3MM7Ssqq8tTowchOeOcej35TfKUgkQAtJL4K0",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=DotGothic16&family=M+PLUS+Rounded+1c:wght@400;700&display=swap"
          rel="stylesheet"
        />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#00d4ff" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2457682322189798" crossOrigin="anonymous"></script>
      </head>
      <body className="min-h-screen">
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
          strategy="afterInteractive"
        />
        <Script id="ga4-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}');
          `}
        </Script>
        <Script id="sw-register" strategy="afterInteractive">
          {`
            if ('serviceWorker' in navigator) {
              navigator.serviceWorker.register('/sw.js').catch(function() {});
            }
          `}
        </Script>
        <header className="border-b border-[var(--color-retro-border)] bg-[var(--color-retro-card)]">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <a href="/" className="flex items-center gap-3">
              <span className="text-2xl">🎮</span>
              <div>
                <h1
                  className="text-xl font-bold retro-glow"
                  style={{ fontFamily: "var(--font-family-pixel)" }}
                >
                  RetroGameBank
                </h1>
                <p className="text-xs text-[var(--color-retro-text-dim)]">
                  レトロゲームバンク
                </p>
              </div>
            </a>
            <nav className="hidden md:flex items-center gap-6 text-sm">
              <a
                href="/"
                className="text-[var(--color-retro-text-dim)] hover:text-[var(--color-retro-accent)] transition-colors"
              >
                ソフト一覧
              </a>
              <a
                href="/ranking"
                className="text-[var(--color-retro-text-dim)] hover:text-[var(--color-retro-accent)] transition-colors"
              >
                ランキング
              </a>
              <a
                href="/games/fc"
                className="text-[var(--color-retro-text-dim)] hover:text-[var(--color-retro-accent)] transition-colors"
              >
                機種別
              </a>
              <a
                href="/minigame"
                className="text-[var(--color-retro-text-dim)] hover:text-[var(--color-retro-accent)] transition-colors"
              >
                ミニゲーム
              </a>
            </nav>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 py-6">{children}</main>

        <footer className="border-t border-[var(--color-retro-border)] bg-[var(--color-retro-card)] mt-12">
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="text-center md:text-left">
                <p
                  className="text-lg font-bold retro-glow"
                  style={{ fontFamily: "var(--font-family-pixel)" }}
                >
                  RetroGameBank
                </p>
                <p className="text-xs text-[var(--color-retro-text-dim)] mt-1">
                  レトロゲームの価格情報を一元提供
                </p>
              </div>
              <div className="flex gap-6 text-sm text-[var(--color-retro-text-dim)]">
                <a href="/ranking" className="hover:text-[var(--color-retro-accent)] transition-colors">ランキング</a>
                <a href="/minigame" className="hover:text-[var(--color-retro-accent)] transition-colors">ミニゲーム</a>
                <a href="/terms" className="hover:text-[var(--color-retro-accent)] transition-colors">利用規約</a>
                <a href="/privacy" className="hover:text-[var(--color-retro-accent)] transition-colors">プライバシーポリシー</a>
                <a href="/contact" className="hover:text-[var(--color-retro-accent)] transition-colors">お問い合わせ</a>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap justify-center gap-2 text-xs text-[var(--color-retro-text-dim)]">
              <a href="/games/fc" className="hover:text-[var(--color-retro-accent)]">FC</a>
              <a href="/games/sfc" className="hover:text-[var(--color-retro-accent)]">SFC</a>
              <a href="/games/gb" className="hover:text-[var(--color-retro-accent)]">GB</a>
              <a href="/games/gba" className="hover:text-[var(--color-retro-accent)]">GBA</a>
              <a href="/games/nds" className="hover:text-[var(--color-retro-accent)]">NDS</a>
              <a href="/games/3ds" className="hover:text-[var(--color-retro-accent)]">3DS</a>
              <a href="/games/n64" className="hover:text-[var(--color-retro-accent)]">N64</a>
              <a href="/games/gc" className="hover:text-[var(--color-retro-accent)]">GC</a>
              <a href="/games/wii" className="hover:text-[var(--color-retro-accent)]">Wii</a>
              <a href="/games/wiiu" className="hover:text-[var(--color-retro-accent)]">WiiU</a>
              <a href="/games/ps1" className="hover:text-[var(--color-retro-accent)]">PS1</a>
              <a href="/games/ps2" className="hover:text-[var(--color-retro-accent)]">PS2</a>
              <a href="/games/ps3" className="hover:text-[var(--color-retro-accent)]">PS3</a>
              <a href="/games/psp" className="hover:text-[var(--color-retro-accent)]">PSP</a>
              <a href="/games/vita" className="hover:text-[var(--color-retro-accent)]">Vita</a>
              <a href="/games/md" className="hover:text-[var(--color-retro-accent)]">MD</a>
              <a href="/games/ss" className="hover:text-[var(--color-retro-accent)]">SS</a>
              <a href="/games/dc" className="hover:text-[var(--color-retro-accent)]">DC</a>
              <a href="/games/pce" className="hover:text-[var(--color-retro-accent)]">PCE</a>
              <a href="/games/neogeo" className="hover:text-[var(--color-retro-accent)]">NEOGEO</a>
              <a href="/games/gg" className="hover:text-[var(--color-retro-accent)]">GG</a>
              <a href="/games/x360" className="hover:text-[var(--color-retro-accent)]">X360</a>
              <a href="/games/xbox" className="hover:text-[var(--color-retro-accent)]">Xbox</a>
              <a href="/games/ngp" className="hover:text-[var(--color-retro-accent)]">NGP</a>
            </div>
            <div className="mt-6 pt-4 border-t border-[var(--color-retro-border)] text-center">
              <p className="text-xs text-[var(--color-retro-text-dim)]">
                © 2026 RetroGameBank. 当サイトはアフィリエイト広告を利用しています。
              </p>
              <p className="text-xs text-[var(--color-retro-text-dim)] mt-1">
                ※掲載価格は参考値であり、実際の販売価格とは異なる場合があります。累計販売本数は推定値です。
              </p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
