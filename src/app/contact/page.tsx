import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "お問い合わせ | レトロゲームバンク",
  description: "レトロゲームバンク（RetroGameBank）へのお問い合わせ",
};

export default function ContactPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <h1
        className="text-2xl font-bold retro-glow mb-6"
        style={{ fontFamily: "var(--font-family-pixel)" }}
      >
        お問い合わせ
      </h1>

      <div className="bg-[var(--color-retro-card)] border border-[var(--color-retro-border)] rounded-xl p-8 space-y-6">
        <section>
          <h2 className="text-lg font-bold text-[var(--color-retro-accent)] mb-3">
            お問い合わせについて
          </h2>
          <p className="text-sm leading-relaxed text-[var(--color-retro-text)]">
            当サイト「レトロゲームバンク」に関するお問い合わせは、以下のメールアドレスまでご連絡ください。
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-[var(--color-retro-accent)] mb-3">
            連絡先
          </h2>
          <p className="text-sm leading-relaxed text-[var(--color-retro-text)]">
            メール：info@retrogamebank.com
          </p>
          <p className="text-sm leading-relaxed text-[var(--color-retro-text-dim)] mt-2">
            ※ 返信までにお時間をいただく場合がございます。
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-[var(--color-retro-accent)] mb-3">
            お問い合わせ内容について
          </h2>
          <p className="text-sm leading-relaxed text-[var(--color-retro-text)] mb-2">
            以下のようなお問い合わせを受け付けています。
          </p>
          <ul className="text-sm space-y-1 text-[var(--color-retro-text)] list-disc list-inside">
            <li>掲載情報の誤りや修正のご依頼</li>
            <li>著作権に関するご連絡</li>
            <li>広告・提携に関するお問い合わせ</li>
            <li>その他サイトに関するご質問</li>
          </ul>
        </section>

        <div className="pt-4 border-t border-[var(--color-retro-border)]">
          <p className="text-xs text-[var(--color-retro-text-dim)]">
            運営：レトロゲームバンク
          </p>
        </div>
      </div>
    </div>
  );
}
