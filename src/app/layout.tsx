import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

const GA_MEASUREMENT_ID = "G-Y3Y966YP2Z";

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
  },
  twitter: {
    card: "summary_large_image",
    title: "レトロゲームバンク | レトロゲーム中古価格・プレミア情報",
    description: "24機種15000タイトル以上のレトロゲーム価格情報を収録。",
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
        <link
          href="https://fonts.googleapis.com/css2?family=DotGothic16&family=M+PLUS+Rounded+1c:wght@400;500;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen">
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
                href="/privacy"
                className="text-[var(--color-retro-text-dim)] hover:text-[var(--color-retro-accent)] transition-colors"
              >
                プライバシーポリシー
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
                <a
                  href="/privacy"
                  className="hover:text-[var(--color-retro-accent)] transition-colors"
                >
                  プライバシーポリシー
                </a>
              </div>
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
