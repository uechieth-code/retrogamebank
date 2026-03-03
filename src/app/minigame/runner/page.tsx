"use client";

import { useEffect, useRef, useState } from "react";
import Leaderboard from "../components/Leaderboard";

const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 600;
const PLAYER_SIZE = 20;
const GRAVITY = 0.6;
const JUMP_STRENGTH = -15;

interface GameState {
  playerY: number;
  playerVelY: number;
  isJumping: boolean;
  score: number;
  gameOver: boolean;
  obstacleSpeed: number;
  obstacleSpawnRate: number;
}

interface Obstacle {
  x: number;
  y: number;
  width: number;
  height: number;
  type: "box" | "spike" | "gap";
}

export default function RunnerGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameStateRef = useRef<GameState>({
    playerY: CANVAS_HEIGHT - 100,
    playerVelY: 0,
    isJumping: false,
    score: 0,
    gameOver: false,
    obstacleSpeed: 6,
    obstacleSpawnRate: 0.02,
  });

  const obstaclesRef = useRef<Obstacle[]>([]);
  const inputRef = useRef({ space: false, mouseClick: false });
  const lastSpawnRef = useRef(0);

  const [showLeaderboardForm, setShowLeaderboardForm] = useState(false);
  const [playerName, setPlayerName] = useState("");
  const [playerLink, setPlayerLink] = useState("");
  const [finalScore, setFinalScore] = useState(0);

  // キャンバス描画
  const draw = (ctx: CanvasRenderingContext2D, state: GameState) => {
    // 背景
    ctx.fillStyle = "#0a0a0f";
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // グリッドパターン
    ctx.strokeStyle = "rgba(42, 42, 58, 0.3)";
    ctx.lineWidth = 1;
    for (let i = 0; i < CANVAS_WIDTH; i += 40) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, CANVAS_HEIGHT);
      ctx.stroke();
    }

    // プレイヤー（ピクセルアート風カートリッジ）
    ctx.fillStyle = "#ff6b35";
    ctx.fillRect(
      CANVAS_WIDTH / 2 - PLAYER_SIZE / 2,
      state.playerY,
      PLAYER_SIZE,
      PLAYER_SIZE
    );
    // カートリッジラベル
    ctx.fillStyle = "#00d4ff";
    ctx.fillRect(
      CANVAS_WIDTH / 2 - PLAYER_SIZE / 2 + 2,
      state.playerY + 4,
      PLAYER_SIZE - 4,
      6
    );

    // 障害物
    obstaclesRef.current.forEach((obstacle) => {
      if (obstacle.type === "box") {
        ctx.fillStyle = "#a855f7";
      } else if (obstacle.type === "spike") {
        ctx.fillStyle = "#ff4444";
      } else {
        ctx.fillStyle = "transparent";
        ctx.strokeStyle = "#00ff88";
        ctx.lineWidth = 2;
        ctx.strokeRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
        return;
      }
      ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    });

    // スコア表示
    ctx.fillStyle = "#00d4ff";
    ctx.font = "bold 16px var(--font-family-pixel)";
    ctx.fillText(`SCORE: ${Math.floor(state.score)}`, 20, 30);

    // スピード表示
    ctx.fillStyle = "#00ff88";
    ctx.fillText(`SPD: ${Math.floor(state.obstacleSpeed * 10) / 10}`, 20, 50);

    // ゲームオーバー画面
    if (state.gameOver) {
      ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      ctx.fillStyle = "#ff6b35";
      ctx.font = "bold 24px var(--font-family-pixel)";
      ctx.textAlign = "center";
      ctx.fillText("GAME OVER", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 40);

      ctx.fillStyle = "#00d4ff";
      ctx.font = "bold 18px var(--font-family-pixel)";
      ctx.fillText(`FINAL SCORE: ${Math.floor(state.score)}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 20);

      ctx.fillStyle = "#00ff88";
      ctx.font = "14px var(--font-family-pixel)";
      ctx.fillText("クリックしてリスタート", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 80);
      ctx.textAlign = "left";
    }
  };

  // ゲームループ
  const gameLoop = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const state = gameStateRef.current;

    if (!state.gameOver) {
      // プレイヤー物理演算
      state.playerVelY += GRAVITY;
      state.playerY += state.playerVelY;

      // 地面判定
      if (state.playerY + PLAYER_SIZE >= CANVAS_HEIGHT - 20) {
        state.playerY = CANVAS_HEIGHT - 20 - PLAYER_SIZE;
        state.playerVelY = 0;
        state.isJumping = false;
      }

      // ジャンプ処理
      if ((inputRef.current.space || inputRef.current.mouseClick) && !state.isJumping) {
        state.playerVelY = JUMP_STRENGTH;
        state.isJumping = true;
        inputRef.current.space = false;
        inputRef.current.mouseClick = false;
      }

      // スコア増加
      state.score += 0.1;

      // 難易度上昇
      if (state.score > 0 && Math.floor(state.score) % 1000 === 0) {
        state.obstacleSpeed += 0.5;
        state.obstacleSpawnRate += 0.003;
      }

      // 障害物生成
      lastSpawnRef.current++;
      if (Math.random() < state.obstacleSpawnRate && lastSpawnRef.current > 30) {
        const type = Math.random() > 0.7 ? (Math.random() > 0.5 ? "spike" : "gap") : "box";
        obstaclesRef.current.push({
          x: CANVAS_WIDTH,
          y: CANVAS_HEIGHT - 50,
          width: 30,
          height: type === "gap" ? 40 : 30,
          type: type as "box" | "spike" | "gap",
        });
        lastSpawnRef.current = 0;
      }

      // 障害物更新と当たり判定
      obstaclesRef.current = obstaclesRef.current.filter((obstacle) => {
        obstacle.x -= state.obstacleSpeed;

        // 当たり判定
        const playerX = CANVAS_WIDTH / 2 - PLAYER_SIZE / 2;
        if (
          playerX < obstacle.x + obstacle.width &&
          playerX + PLAYER_SIZE > obstacle.x &&
          state.playerY + PLAYER_SIZE > obstacle.y &&
          state.playerY < obstacle.y + obstacle.height &&
          obstacle.type !== "gap"
        ) {
          state.gameOver = true;
          setFinalScore(Math.floor(state.score));
          setShowLeaderboardForm(true);
        }

        return obstacle.x + obstacle.width > 0;
      });
    }

    draw(ctx, state);

    if (!state.gameOver) {
      requestAnimationFrame(gameLoop);
    }
  };

  // リスタート
  const restart = () => {
    gameStateRef.current = {
      playerY: CANVAS_HEIGHT - 100,
      playerVelY: 0,
      isJumping: false,
      score: 0,
      gameOver: false,
      obstacleSpeed: 6,
      obstacleSpawnRate: 0.02,
    };
    obstaclesRef.current = [];
    lastSpawnRef.current = 0;
    setShowLeaderboardForm(false);
    setPlayerName("");
    setPlayerLink("");
    gameLoop();
  };

  // スコア送信
  const submitScore = async () => {
    if (!playerName.trim()) return;

    const today = new Date();
    const dateStr = `${today.getFullYear()}/${String(today.getMonth() + 1).padStart(2, "0")}/${String(today.getDate()).padStart(2, "0")}`;

    const entry = {
      name: playerName.substring(0, 10),
      score: finalScore,
      date: dateStr,
      link: playerLink.trim() || undefined,
    };

    // localStorage保存
    const localKey = "leaderboard_runner";
    const existing = JSON.parse(localStorage.getItem(localKey) || "[]");
    existing.push(entry);
    existing.sort((a: any, b: any) => b.score - a.score);
    localStorage.setItem(localKey, JSON.stringify(existing.slice(0, 30)));

    // Firebase送信試行
    try {
      const { isFirebaseConfigured, getDatabase } = await import("@/lib/firebase");
      if (isFirebaseConfigured()) {
        const db = await getDatabase();
        if (db) {
          try {
            // @ts-ignore
            const { ref, push } = await import("firebase/database");
            await push(ref(db, "leaderboards/runner"), entry);
          } catch (importError) {
            console.warn("Firebase database import failed, using localStorage only");
          }
        }
      }
    } catch (error) {
      console.warn("Firebase not available, score saved to localStorage");
    }

    restart();
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        inputRef.current.space = true;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        inputRef.current.space = false;
      }
    };

    const handleCanvasClick = () => {
      if (gameStateRef.current.gameOver) {
        restart();
      } else {
        inputRef.current.mouseClick = true;
      }
    };

    const canvas = canvasRef.current;
    if (canvas) {
      canvas.addEventListener("click", handleCanvasClick);
      canvas.addEventListener("touchstart", handleCanvasClick);
    }

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    gameLoop();

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      if (canvas) {
        canvas.removeEventListener("click", handleCanvasClick);
        canvas.removeEventListener("touchstart", handleCanvasClick);
      }
    };
  }, []);

  return (
    <main style={{
      minHeight: "100vh",
      backgroundColor: "var(--color-retro-bg)",
      color: "var(--color-retro-text)",
      fontFamily: "var(--font-family-pixel)",
      padding: "40px 20px",
    }}>
      <div style={{
        maxWidth: "600px",
        margin: "0 auto",
      }}>
        <h1 style={{
          fontSize: "32px",
          fontWeight: "bold",
          marginBottom: "20px",
          color: "var(--color-retro-accent2)",
          textAlign: "center",
        }}>
          エンドレス ランナー
        </h1>

        {/* ゲームキャンバス */}
        <div style={{
          marginBottom: "30px",
          border: "3px solid var(--color-retro-accent)",
          borderRadius: "8px",
          overflow: "hidden",
          boxShadow: "0 0 20px rgba(0, 212, 255, 0.3)",
        }}>
          <canvas
            ref={canvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            style={{
              display: "block",
              width: "100%",
              height: "auto",
            }}
          />
        </div>

        {/* スコア入力フォーム */}
        {showLeaderboardForm && (
          <div style={{
            backgroundColor: "var(--color-retro-card)",
            border: "2px solid var(--color-retro-border)",
            borderRadius: "8px",
            padding: "20px",
            marginBottom: "30px",
          }}>
            <h2 style={{
              fontSize: "18px",
              fontWeight: "bold",
              marginBottom: "15px",
              color: "var(--color-retro-green)",
            }}>
              スコア送信
            </h2>

            <div style={{ marginBottom: "15px" }}>
              <label style={{
                display: "block",
                marginBottom: "5px",
                fontSize: "13px",
                color: "var(--color-retro-text-dim)",
              }}>
                プレイヤー名 (最大10文字)
              </label>
              <input
                type="text"
                maxLength={10}
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px",
                  backgroundColor: "var(--color-retro-bg)",
                  border: "1px solid var(--color-retro-border)",
                  color: "var(--color-retro-text)",
                  borderRadius: "4px",
                  fontFamily: "var(--font-family-pixel)",
                  fontSize: "13px",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <div style={{ marginBottom: "15px" }}>
              <label style={{
                display: "block",
                marginBottom: "5px",
                fontSize: "13px",
                color: "var(--color-retro-text-dim)",
              }}>
                SNS/ホームページURL (任意)
              </label>
              <input
                type="text"
                value={playerLink}
                onChange={(e) => setPlayerLink(e.target.value)}
                placeholder="https://..."
                style={{
                  width: "100%",
                  padding: "8px",
                  backgroundColor: "var(--color-retro-bg)",
                  border: "1px solid var(--color-retro-border)",
                  color: "var(--color-retro-text)",
                  borderRadius: "4px",
                  fontFamily: "var(--font-family-pixel)",
                  fontSize: "13px",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <button
              onClick={submitScore}
              disabled={!playerName.trim()}
              style={{
                width: "100%",
                padding: "10px",
                backgroundColor: playerName.trim() ? "var(--color-retro-green)" : "var(--color-retro-text-dim)",
                color: "var(--color-retro-bg)",
                border: "none",
                borderRadius: "4px",
                fontFamily: "var(--font-family-pixel)",
                fontWeight: "bold",
                cursor: playerName.trim() ? "pointer" : "not-allowed",
              }}
            >
              送信
            </button>
          </div>
        )}

        {/* ランキング */}
        <div style={{
          backgroundColor: "var(--color-retro-card)",
          border: "2px solid var(--color-retro-border)",
          borderRadius: "8px",
          padding: "20px",
        }}>
          <h2 style={{
            fontSize: "18px",
            fontWeight: "bold",
            marginBottom: "15px",
            color: "var(--color-retro-accent)",
          }}>
            ランキング
          </h2>
          <Leaderboard gameId="runner" />
        </div>
      </div>
    </main>
  );
}
