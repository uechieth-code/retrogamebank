"use client";

import { useEffect, useRef, useState } from "react";
import Leaderboard from "../components/Leaderboard";

const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 600;

interface Player {
  x: number;
  y: number;
  width: number;
  height: number;
  health: number;
}

interface Enemy {
  x: number;
  y: number;
  width: number;
  height: number;
  type: "normal" | "strong" | "boss";
  health: number;
}

interface Bullet {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface PowerUp {
  x: number;
  y: number;
  width: number;
  height: number;
  type: "health" | "rapid";
}

interface GameState {
  player: Player;
  enemies: Enemy[];
  bullets: Bullet[];
  powerups: PowerUp[];
  score: number;
  lives: number;
  wave: number;
  gameOver: boolean;
  level: number;
  enemySpawnRate: number;
}

export default function ShooterGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameStateRef = useRef<GameState>({
    player: { x: CANVAS_WIDTH / 2 - 10, y: CANVAS_HEIGHT - 60, width: 20, height: 30, health: 100 },
    enemies: [],
    bullets: [],
    powerups: [],
    score: 0,
    lives: 3,
    wave: 1,
    gameOver: false,
    level: 1,
    enemySpawnRate: 0.02,
  });

  const inputRef = useRef({ left: false, right: false, shoot: false });
  const shotTimerRef = useRef(0);
  const waveTimerRef = useRef(0);
  const rapidFireRef = useRef(false);

  const [showLeaderboardForm, setShowLeaderboardForm] = useState(false);
  const [playerName, setPlayerName] = useState("");
  const [playerLink, setPlayerLink] = useState("");
  const [finalScore, setFinalScore] = useState(0);

  const draw = (ctx: CanvasRenderingContext2D, state: GameState) => {
    // Background with scanlines
    ctx.fillStyle = "#0a0a0f";
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    ctx.strokeStyle = "rgba(42, 42, 58, 0.3)";
    ctx.lineWidth = 1;
    for (let i = 0; i < CANVAS_WIDTH; i += 40) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, CANVAS_HEIGHT);
      ctx.stroke();
    }

    // Player (ship)
    ctx.fillStyle = "#00d4ff";
    ctx.beginPath();
    ctx.moveTo(state.player.x + state.player.width / 2, state.player.y);
    ctx.lineTo(state.player.x + state.player.width, state.player.y + state.player.height);
    ctx.lineTo(state.player.x, state.player.y + state.player.height);
    ctx.closePath();
    ctx.fill();

    // Bullets
    ctx.fillStyle = "#00ff88";
    state.bullets.forEach((bullet) => {
      ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    });

    // Enemies
    state.enemies.forEach((enemy) => {
      if (enemy.type === "normal") {
        ctx.fillStyle = "#ff6b35";
      } else if (enemy.type === "strong") {
        ctx.fillStyle = "#a855f7";
      } else {
        ctx.fillStyle = "#ff4444";
      }
      ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);

      // Enemy eyes
      if (enemy.type !== "boss") {
        ctx.fillStyle = "#000";
        ctx.fillRect(enemy.x + 4, enemy.y + 5, 3, 3);
        ctx.fillRect(enemy.x + enemy.width - 7, enemy.y + 5, 3, 3);
      }
    });

    // Power-ups
    state.powerups.forEach((powerup) => {
      ctx.fillStyle = powerup.type === "health" ? "#00ff88" : "#ffd700";
      ctx.fillRect(powerup.x, powerup.y, powerup.width, powerup.height);
    });

    // HUD
    ctx.fillStyle = "#00d4ff";
    ctx.font = "bold 14px var(--font-family-pixel)";
    ctx.fillText(`WAVE: ${state.wave}`, 20, 25);
    ctx.fillText(`SCORE: ${state.score}`, 20, 45);
    ctx.fillText(`LIVES: ${state.lives}`, CANVAS_WIDTH - 120, 25);
    ctx.fillText(`LV: ${state.level}`, CANVAS_WIDTH - 120, 45);

    // Game over
    if (state.gameOver) {
      ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      ctx.fillStyle = "#ff6b35";
      ctx.font = "bold 24px var(--font-family-pixel)";
      ctx.textAlign = "center";
      ctx.fillText("GAME OVER", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 40);

      ctx.fillStyle = "#00d4ff";
      ctx.font = "bold 18px var(--font-family-pixel)";
      ctx.fillText(`FINAL SCORE: ${state.score}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 20);
      ctx.textAlign = "left";
    }
  };

  const gameLoop = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const state = gameStateRef.current;

    if (!state.gameOver) {
      // Player movement
      if (inputRef.current.left && state.player.x > 0) {
        state.player.x -= 5;
      }
      if (inputRef.current.right && state.player.x + state.player.width < CANVAS_WIDTH) {
        state.player.x += 5;
      }

      // Shooting
      shotTimerRef.current++;
      const shotRate = rapidFireRef.current ? 5 : 10;
      if (inputRef.current.shoot && shotTimerRef.current >= shotRate) {
        state.bullets.push({
          x: state.player.x + state.player.width / 2 - 2,
          y: state.player.y - 10,
          width: 4,
          height: 15,
        });
        shotTimerRef.current = 0;
      }

      // Wave management
      waveTimerRef.current++;
      if (waveTimerRef.current > 100) {
        if (Math.random() < state.enemySpawnRate) {
          const isBoss = state.wave % 5 === 0 && Math.random() > 0.7;
          state.enemies.push({
            x: Math.random() * (CANVAS_WIDTH - 30),
            y: -30,
            width: isBoss ? 40 : 20,
            height: isBoss ? 40 : 20,
            type: isBoss ? "boss" : Math.random() > 0.7 ? "strong" : "normal",
            health: isBoss ? 5 : Math.random() > 0.7 ? 2 : 1,
          });
        }
      }

      // Enemy movement
      state.enemies.forEach((enemy) => {
        enemy.y += 2 + state.level;
      });

      // Bullet movement
      state.bullets = state.bullets.filter((bullet) => {
        bullet.y -= 8;
        return bullet.y > 0;
      });

      // Power-up movement
      state.powerups = state.powerups.filter((powerup) => {
        powerup.y += 2;
        return powerup.y < CANVAS_HEIGHT;
      });

      // Collision: bullets vs enemies
      for (let i = state.bullets.length - 1; i >= 0; i--) {
        const bullet = state.bullets[i];
        for (let j = state.enemies.length - 1; j >= 0; j--) {
          const enemy = state.enemies[j];
          if (
            bullet.x < enemy.x + enemy.width &&
            bullet.x + bullet.width > enemy.x &&
            bullet.y < enemy.y + enemy.height &&
            bullet.y + bullet.height > enemy.y
          ) {
            state.bullets.splice(i, 1);
            enemy.health--;

            if (enemy.health <= 0) {
              const scoreMap = { normal: 10, strong: 25, boss: 100 };
              state.score += scoreMap[enemy.type];
              state.enemies.splice(j, 1);

              // Drop power-up
              if (Math.random() > 0.8) {
                state.powerups.push({
                  x: enemy.x,
                  y: enemy.y,
                  width: 15,
                  height: 15,
                  type: Math.random() > 0.5 ? "health" : "rapid",
                });
              }

              // Wave progress
              if (state.enemies.length === 0) {
                state.wave++;
                state.level = Math.floor(state.wave / 5) + 1;
                state.enemySpawnRate += 0.005;
                waveTimerRef.current = 0;
              }
            }
            break;
          }
        }
      }

      // Collision: player vs power-ups
      state.powerups = state.powerups.filter((powerup) => {
        if (
          state.player.x < powerup.x + powerup.width &&
          state.player.x + state.player.width > powerup.x &&
          state.player.y < powerup.y + powerup.height &&
          state.player.y + state.player.height > powerup.y
        ) {
          if (powerup.type === "health") {
            state.player.health = Math.min(100, state.player.health + 30);
          } else {
            rapidFireRef.current = true;
            setTimeout(() => {
              rapidFireRef.current = false;
            }, 5000);
          }
          return false;
        }
        return true;
      });

      // Collision: player vs enemies
      state.enemies = state.enemies.filter((enemy) => {
        if (
          state.player.x < enemy.x + enemy.width &&
          state.player.x + state.player.width > enemy.x &&
          state.player.y < enemy.y + enemy.height &&
          state.player.y + state.player.height > enemy.y
        ) {
          state.lives--;
          if (state.lives <= 0) {
            state.gameOver = true;
            setFinalScore(state.score);
            setShowLeaderboardForm(true);
          }
          return false;
        }
        return true;
      });

      // Remove off-screen enemies
      state.enemies = state.enemies.filter((enemy) => enemy.y < CANVAS_HEIGHT);
    }

    draw(ctx, state);

    if (!state.gameOver) {
      requestAnimationFrame(gameLoop);
    }
  };

  const restart = () => {
    gameStateRef.current = {
      player: { x: CANVAS_WIDTH / 2 - 10, y: CANVAS_HEIGHT - 60, width: 20, height: 30, health: 100 },
      enemies: [],
      bullets: [],
      powerups: [],
      score: 0,
      lives: 3,
      wave: 1,
      gameOver: false,
      level: 1,
      enemySpawnRate: 0.02,
    };
    shotTimerRef.current = 0;
    waveTimerRef.current = 0;
    rapidFireRef.current = false;
    setShowLeaderboardForm(false);
    setPlayerName("");
    setPlayerLink("");
    gameLoop();
  };

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

    const localKey = "leaderboard_shooter";
    const existing = JSON.parse(localStorage.getItem(localKey) || "[]");
    existing.push(entry);
    existing.sort((a: any, b: any) => b.score - a.score);
    localStorage.setItem(localKey, JSON.stringify(existing.slice(0, 30)));

    try {
      const { isFirebaseConfigured, getDatabase } = await import("@/lib/firebase");
      if (isFirebaseConfigured()) {
        const db = await getDatabase();
        if (db) {
          try {
            // @ts-ignore
            const { ref, push } = await import("firebase/database");
            await push(ref(db, "leaderboards/shooter"), entry);
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
      switch (e.key.toLowerCase()) {
        case "arrowleft":
        case "a":
          inputRef.current.left = true;
          break;
        case "arrowright":
        case "d":
          inputRef.current.right = true;
          break;
        case " ":
          e.preventDefault();
          inputRef.current.shoot = true;
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      switch (e.key.toLowerCase()) {
        case "arrowleft":
        case "a":
          inputRef.current.left = false;
          break;
        case "arrowright":
        case "d":
          inputRef.current.right = false;
          break;
        case " ":
          inputRef.current.shoot = false;
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    gameLoop();

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
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
          スペース シューター
        </h1>

        {/* Game Canvas */}
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

        {/* Score Form */}
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

        {/* Leaderboard */}
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
          <Leaderboard gameId="shooter" />
        </div>
      </div>
    </main>
  );
}
