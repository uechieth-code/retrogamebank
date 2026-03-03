"use client";

import Link from "next/link";

export default function MinigameHub() {
  const games = [
    {
      id: "runner",
      title: "エンドレス ランナー",
      description: "レトロゲームのキャラクターを操作して、障害物をかわしながら走り続けよう！",
      href: "/minigame/runner",
    },
    {
      id: "blocks",
      title: "ブロック パズル",
      description: "落ちてくるテトリミノを積み重ねて、ラインを消して高スコアを目指そう！",
      href: "/minigame/blocks",
    },
    {
      id: "shooter",
      title: "スペース シューター",
      description: "スペースインベーダー風シューティング！敵を撃ち落として宇宙を守ろう！",
      href: "/minigame/shooter",
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
        {/* ヘッダー */}
        <div style={{
          marginBottom: "60px",
          textAlign: "center",
        }}>
          <h1 style={{
            fontSize: "48px",
            fontWeight: "bold",
            marginBottom: "10px",
            textShadow: "0 0 10px var(--color-retro-accent), 0 0 20px rgba(0, 212, 255, 0.3)",
            color: "var(--color-retro-accent)",
          }}>
            ミニゲーム ハブ
          </h1>
          <p style={{
            fontSize: "16px",
            color: "var(--color-retro-text-dim)",
            marginTop: "10px",
          }}>
            懐かしのレトログでゲーム体験を楽しもう！
          </p>
        </div>

        {/* ゲームカードグリッド */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "30px",
          marginBottom: "40px",
        }}>
          {games.map((game) => (
            <div
              key={game.id}
              style={{
                backgroundColor: "var(--color-retro-card)",
                border: "2px solid var(--color-retro-border)",
                borderRadius: "8px",
                padding: "24px",
                transition: "all 0.2s ease",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.borderColor = "var(--color-retro-accent)";
                el.style.boxShadow = "0 0 15px rgba(0, 212, 255, 0.15)";
                el.style.transform = "translateY(-4px)";
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.borderColor = "var(--color-retro-border)";
                el.style.boxShadow = "none";
                el.style.transform = "translateY(0)";
              }}
            >
              {/* ゲームタイトル */}
              <h2 style={{
                fontSize: "24px",
                fontWeight: "bold",
                marginBottom: "12px",
                color: "var(--color-retro-accent2)",
              }}>
                {game.title}
              </h2>

              {/* 説明 */}
              <p style={{
                fontSize: "14px",
                color: "var(--color-retro-text-dim)",
                marginBottom: "20px",
                lineHeight: "1.6",
                minHeight: "60px",
              }}>
                {game.description}
              </p>

              {/* プレイボタン */}
              <Link href={game.href}>
                <button style={{
                  width: "100%",
                  padding: "12px 24px",
                  backgroundColor: "var(--color-retro-accent)",
                  color: "var(--color-retro-bg)",
                  border: "2px solid var(--color-retro-accent)",
                  borderRadius: "6px",
                  fontSize: "14px",
                  fontWeight: "bold",
                  cursor: "pointer",
                  fontFamily: "var(--font-family-pixel)",
                  transition: "all 0.2s ease",
                  textTransform: "uppercase",
                }}>
                  プレイ
                </button>
              </Link>
            </div>
          ))}
        </div>

        {/* 備考 */}
        <div style={{
          backgroundColor: "rgba(0, 212, 255, 0.05)",
          border: "1px solid var(--color-retro-border)",
          borderRadius: "8px",
          padding: "20px",
          fontSize: "13px",
          color: "var(--color-retro-text-dim)",
          lineHeight: "1.8",
        }}>
          <p style={{ marginBottom: "10px", fontWeight: "bold" }}>
            ゲーム操作:
          </p>
          <ul style={{ marginLeft: "20px" }}>
            <li>エンドレス ランナー: スペースキーまたはクリック/タップでジャンプ</li>
            <li>ブロック パズル: 矢印キーで移動、上キーで回転、スペースで高速ドロップ</li>
            <li>スペース シューター: 矢印キー（またはA/Dキー）で移動、スペースキーで射撃</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
