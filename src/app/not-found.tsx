import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div
        className="text-8xl font-bold retro-glow mb-4"
        style={{ fontFamily: "var(--font-family-pixel)" }}
      >
        404
      </div>
      <h1
        className="text-2xl font-bold text-[var(--color-retro-accent)] mb-4"
        style={{ fontFamily: "var(--font-family-pixel)" }}
      >
        PAGE NOT FOUND
      </h1>
      <p className="text-[var(--color-retro-text-dim)] mb-2">
        お探しのページは見つかりませんでした。
      </p>
      <p className="text-[var(--color-retro-text-dim)] mb-8 text-sm">
        URLが正しいかご確認ください。
      </p>

      <div
        className="bg-[var(--color-retro-card)] border border-[var(--color-retro-border)] rounded-xl p-6 mb-8"
        style={{ fontFamily: "var(--font-family-pixel)", fontSize: "14px" }}
      >
        <pre className="text-[var(--color-retro-accent2)] leading-relaxed">
{`  GAME OVER

  CONTINUE?

  > YES`}
        </pre>
      </div>

      <div className="flex gap-4 flex-wrap justify-center">
        <Link
          href="/"
          className="px-6 py-3 bg-[var(--color-retro-accent)] text-white font-bold rounded-lg hover:opacity-90 transition-opacity"
          style={{ fontFamily: "var(--font-family-pixel)" }}
        >
          トップページへ
        </Link>
        <Link
          href="/minigame"
          className="px-6 py-3 bg-[var(--color-retro-accent2)] text-white font-bold rounded-lg hover:opacity-90 transition-opacity"
          style={{ fontFamily: "var(--font-family-pixel)" }}
        >
          ミニゲームで遊ぶ
        </Link>
      </div>
    </div>
  );
}
