"use client";

import Link from "next/link";

export default function MinigameCenter() {
  const games = [
    {
      id: "runner",
      title: "ピクセルダッシュ",
      description: "障害物をかわしながら走り続けよう！長押しでジャンプの高さが変わる。",
      href: "/minigame/runner",
      color: "#ff6b35",
    },
    {
      id: "shooter",
      title: "スターブラスト",
      description: "敵を撃ち落として宇宙を守れ！ボスを倒してハイスコアを狙おう。",
      href: "/minigame/shooter",
      color: "#00d4ff",
    },
    {
      id: "puyo",
      title: "カラーチェイン",
      description: "同じ色を4つ以上つなげて消そう！連鎖で大量得点のチャンス。",
      href: "/minigame/puyo",
      color: "#00ff88",
    },
    {
      id: "breakout",
      title: "ブロッククラッシュ",
      description: "パドルでボールを打ち返してブロックを全て壊せ！パワーアップも登場。",
      href: "/minigame/breakout",
      color: "#ffd700",
    },
    {
      id: "flappy",
      title: "パタパタバード",
      description: "タップで飛んで土管の隙間をくぐり抜けろ！シンプルだけど高難度。",
      href: "/minigame/flappy",
      color: "#ff4444",
    },
    {
      id: "maze",
      title: "ドットイーター",
      description: "迷路のドットを全て集めろ！ゴーストに捕まるな。パワーエサで反撃だ。",
      href: "/minigame/maze",
      color: "#a855f7",
    },
    {
      id: "survivors",
      title: "サバイバーズ",
      description: "四方から押し寄せる敵を自動攻撃で倒せ！レベルアップで武器と仲間を強化するローグライト型サバイバー。",
      href: "/minigame/survivors",
      color: "#ff2266",
    },
  ];

  return (
    <main style={{
      minHeight: "100vh",
      backgroundColor: "var(--color-retro-bg)",
      color: "var(--color-retro-text)",
      fontFamily: "var(--font-family-pixel)",
      padding: "40px 20px",
    }}>
      <div style={{
        maxWidth: "1000px",
        margin: "0 auto",
      }}>
        <div style={{
          marginBottom: "40px",
          textAlign: "center",
        }}>
          <h1 style={{
            fontSize: "36px",
            fontWeight: "bold",
            marginBottom: "10px",
            textShadow: "0 0 10px var(--color-retro-accent), 0 0 20px rgba(0, 212, 255, 0.3)",
            color: "var(--color-retro-accent)",
          }}>
            ミニゲームセンター
          </h1>
          <p style={{
            fontSize: "14px",
            color: "var(--color-retro-text-dim)",
            marginTop: "8px",
          }}>
            全7種類のレトロ風ミニゲームで遊ぼう！ランキング上位を目指せ。
          </p>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "20px",
          marginBottom: "40px",
        }}>
          {games.map((game) => (
            <Link key={game.id} href={game.href} style={{ textDecoration: "none", color: "inherit" }}>
              <div
                style={{
                  backgroundColor: "var(--color-retro-card)",
                  border: "2px solid var(--color-retro-border)",
                  borderRadius: "8px",
                  padding: "20px",
                  transition: "all 0.2s ease",
                  cursor: "pointer",
                  height: "100%",
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.borderColor = game.color;
                  el.style.boxShadow = `0 0 15px ${game.color}33`;
                  el.style.transform = "translateY(-3px)";
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.borderColor = "var(--color-retro-border)";
                  el.style.boxShadow = "none";
                  el.style.transform = "translateY(0)";
                }}
              >
                <div style={{
                  width: "40px",
                  height: "4px",
                  backgroundColor: game.color,
                  borderRadius: "2px",
                  marginBottom: "12px",
                }} />
                <h2 style={{
                  fontSize: "20px",
                  fontWeight: "bold",
                  marginBottom: "8px",
                  color: game.color,
                }}>
                  {game.title}
                </h2>
                <p style={{
                  fontSize: "13px",
                  color: "var(--color-retro-text-dim)",
                  lineHeight: "1.6",
                }}>
                  {game.description}
                </p>
              </div>
            </Link>
          ))}
        </div>

        <div style={{ textAlign: "center" }}>
          <Link href="/" style={{
            color: "var(--color-retro-text-dim)",
            fontSize: "13px",
            textDecoration: "none",
          }}>
            ← トップページに戻る
          </Link>
        </div>
      </div>
    </main>
  );
}
