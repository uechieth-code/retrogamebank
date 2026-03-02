import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

const GA_MEASUREMENT_ID = "G-Y3Y966YP2Z";

export const metadata: Metadata = {
  title: "レトロゲームバンク - RetroGameBank | レトロゲーム価格情報サイト",
  description:
    "FC・SFC・GB・N64・GC・Wii・GBA・NDS・3DS・PS1・PS2・PS3・PSP・Vita・MD・SS・DC・PCE・NEOGEO・GG・Xbox360など21機種、15000タイトル以上のレトロゲーム価格情報を収録。中古・新品価格、プレミアランク、販売本数データを一元提供。",
  keywords: "レトロゲーム,ファミコン,スーパーファミコン,ゲームボーイ,NINTENDO64,ゲームキューブ,Wii,プレイステーション,PS2,PS3,PSP,メガドライブ,セガサターン,ドリームキャスト,PCエンジン,ネオジオ,中古ゲーム,価格,プレミアソフト",
  icons: {
    icon: "/icon.svg",
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
