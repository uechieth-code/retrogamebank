import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "プライバシーポリシー | レトロゲームバンク",
  description: "レトロゲームバンク（RetroGameBank）のプライバシーポリシー",
};

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <h1
        className="text-2xl font-bold retro-glow mb-6"
        style={{ fontFamily: "var(--font-family-pixel)" }}
      >
        プライバシーポリシー
      </h1>

      <div className="bg-[var(--color-retro-card)] border border-[var(--color-retro-border)] rounded-xl p-8 space-y-6">
        <section>
          <h2 className="text-lg font-bold text-[var(--color-retro-accent)] mb-3">
            1. 運営者情報
          </h2>
          <p className="text-sm leading-relaxed text-[var(--color-retro-text)]">
            当サイト「レトロゲームバンク（RetroGameBank）」（以下「当サイト」）は、レトロゲームソフトの価格情報を提供する情報サイトです。
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-[var(--color-retro-accent)] mb-3">
            2. 個人情報の取得について
          </h2>
          <p className="text-sm leading-relaxed text-[var(--color-retro-text)]">
            当サイトでは、アクセス解析ツール（Google Analyticsなど）を利用することがあります。このツールではCookieを使用してトラフィックデータを収集しています。このデータは匿名で収集されており、個人を特定するものではありません。Cookieの使用を無効にすることで、データの収集を拒否することができます。
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-[var(--color-retro-accent)] mb-3">
            3. 広告・アフィリエイトについて
          </h2>
          <p className="text-sm leading-relaxed text-[var(--color-retro-text)]">
            当サイトは、以下のアフィリエイトプログラムに参加しています。
          </p>
          <ul className="text-sm mt-2 space-y-1 text-[var(--color-retro-text)] list-disc list-inside">
            <li>Amazonアソシエイト・プログラム</li>
            <li>楽天アフィリエイト</li>
            <li>バリューコマース</li>
            <li>その他ASP</li>
          </ul>
          <p className="text-sm leading-relaxed text-[var(--color-retro-text)] mt-3">
            当サイトが紹介する商品・サービスのリンクにはアフィリエイトリンクが含まれている場合があります。リンク先で商品を購入された場合、当サイトに紹介料が支払われることがあります。商品の価格や評価への影響はありません。
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-[var(--color-retro-accent)] mb-3">
            4. Amazonアソシエイトについて
          </h2>
          <p className="text-sm leading-relaxed text-[var(--color-retro-text)]">
            当サイトは、Amazon.co.jpを宣伝しリンクすることによってサイトが紹介料を獲得できる手段を提供することを目的に設定されたアフィリエイトプログラムである、Amazonアソシエイト・プログラムの参加者です。
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-[var(--color-retro-accent)] mb-3">
            5. 価格情報について
          </h2>
          <p className="text-sm leading-relaxed text-[var(--color-retro-text)]">
            当サイトに掲載されている価格情報は、各APIやWebサイトから定期的に取得した参考値です。実際の販売価格とは異なる場合があります。商品の購入にあたっては、各販売サイトにて最新の価格をご確認ください。
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-[var(--color-retro-accent)] mb-3">
            6. 著作権について
          </h2>
          <p className="text-sm leading-relaxed text-[var(--color-retro-text)]">
            当サイトに掲載されているゲームタイトル名、メーカー名等は、各社の商標または登録商標です。当サイトは各権利者とは一切関係がありません。ゲーム画像については、各APIの規約に従い、適切な範囲で使用しています。
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-[var(--color-retro-accent)] mb-3">
            7. 免責事項
          </h2>
          <p className="text-sm leading-relaxed text-[var(--color-retro-text)]">
            当サイトの情報は可能な限り正確な情報を掲載するよう努めていますが、情報の正確性・完全性を保証するものではありません。当サイトの利用により生じたいかなる損害についても責任を負いかねます。
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-[var(--color-retro-accent)] mb-3">
            8. プライバシーポリシーの変更
          </h2>
          <p className="text-sm leading-relaxed text-[var(--color-retro-text)]">
            当サイトは、必要に応じてプライバシーポリシーを変更することがあります。変更後のプライバシーポリシーは当ページにて公開します。
          </p>
        </section>

        <div className="pt-4 border-t border-[var(--color-retro-border)]">
          <p className="text-xs text-[var(--color-retro-text-dim)]">
            制定日：2026年2月28日
          </p>
          <p className="text-xs text-[var(--color-retro-text-dim)]">
            最終更新日：2026年2月28日
          </p>
        </div>
      </div>
    </div>
  );
}
