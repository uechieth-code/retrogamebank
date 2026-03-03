import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "利用規約 | レトロゲームバンク",
  description: "レトロゲームバンク（RetroGameBank）の利用規約",
};

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <h1
        className="text-2xl font-bold retro-glow mb-6"
        style={{ fontFamily: "var(--font-family-pixel)" }}
      >
        利用規約
      </h1>

      <div className="bg-[var(--color-retro-card)] border border-[var(--color-retro-border)] rounded-xl p-8 space-y-6">
        <section>
          <h2 className="text-lg font-bold text-[var(--color-retro-accent)] mb-3">
            1. はじめに
          </h2>
          <p className="text-sm leading-relaxed text-[var(--color-retro-text)]">
            本利用規約（以下「本規約」）は、レトロゲームバンク（以下「当サイト」）の利用条件を定めるものです。当サイトをご利用いただく場合は、本規約に同意したものとみなします。
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-[var(--color-retro-accent)] mb-3">
            2. サービス内容
          </h2>
          <p className="text-sm leading-relaxed text-[var(--color-retro-text)]">
            当サイトは、レトロゲームソフトの中古価格・新品価格・プレミア情報等の参考情報を提供する無料の情報サイトです。当サイトに掲載される価格情報は参考値であり、実際の販売価格を保証するものではありません。
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-[var(--color-retro-accent)] mb-3">
            3. 禁止事項
          </h2>
          <p className="text-sm leading-relaxed text-[var(--color-retro-text)] mb-2">
            当サイトのご利用にあたり、以下の行為を禁止します。
          </p>
          <ul className="text-sm space-y-1 text-[var(--color-retro-text)] list-disc list-inside">
            <li>当サイトのコンテンツを無断で複製・転載・再配布する行為</li>
            <li>当サイトのサーバーに過度な負荷をかける行為（スクレイピング等）</li>
            <li>当サイトの運営を妨害する行為</li>
            <li>その他、法令または公序良俗に反する行為</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-[var(--color-retro-accent)] mb-3">
            4. 知的財産権
          </h2>
          <p className="text-sm leading-relaxed text-[var(--color-retro-text)]">
            当サイトに掲載されているゲームタイトル名、メーカー名、ロゴ等は各社の商標または登録商標です。当サイトは各権利者の公式サイトではなく、各権利者とは一切関係がありません。当サイト独自のコンテンツ（レイアウト、デザイン、文章等）の著作権は当サイト運営者に帰属します。
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-[var(--color-retro-accent)] mb-3">
            5. 免責事項
          </h2>
          <p className="text-sm leading-relaxed text-[var(--color-retro-text)]">
            当サイトの情報は可能な限り正確な情報を掲載するよう努めていますが、情報の正確性・完全性・最新性を保証するものではありません。当サイトの利用により生じたいかなる損害についても、当サイト運営者は一切の責任を負いません。商品の購入にあたっては、各販売サイトにて最新の価格・在庫状況をご確認ください。
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-[var(--color-retro-accent)] mb-3">
            6. アフィリエイトリンクについて
          </h2>
          <p className="text-sm leading-relaxed text-[var(--color-retro-text)]">
            当サイト内のリンクにはアフィリエイトリンクが含まれています。リンク先で商品を購入された場合、当サイトに紹介料が支払われることがあります。これは商品の価格に影響を与えるものではありません。詳しくは「プライバシーポリシー」をご確認ください。
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-[var(--color-retro-accent)] mb-3">
            7. リンクについて
          </h2>
          <p className="text-sm leading-relaxed text-[var(--color-retro-text)]">
            当サイトへのリンクは原則として自由です。ただし、当サイトの名誉を毀損する形でのリンク、フレーム内での表示、その他不適切な形でのリンクはお断りします。
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-[var(--color-retro-accent)] mb-3">
            8. 規約の変更
          </h2>
          <p className="text-sm leading-relaxed text-[var(--color-retro-text)]">
            当サイトは、必要に応じて本規約を変更することがあります。変更後の利用規約は当ページにて公開した時点で効力を生じるものとします。
          </p>
        </section>

        <div className="pt-4 border-t border-[var(--color-retro-border)]">
          <p className="text-xs text-[var(--color-retro-text-dim)]">
            制定日：2026年3月3日
          </p>
          <p className="text-xs text-[var(--color-retro-text-dim)]">
            最終更新日：2026年3月3日
          </p>
        </div>
      </div>
    </div>
  );
}
