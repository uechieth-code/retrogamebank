"use client";

import { useEffect, useRef, useState } from "react";
import Leaderboard from "../components/Leaderboard";

const CANVAS_WIDTH = 480;
const CANVAS_HEIGHT = 400;
const PADDLE_WIDTH = 80;
const PADDLE_HEIGHT = 12;
const BALL_SIZE = 8;
const BRICK_WIDTH = 52;
const BRICK_HEIGHT = 16;
const COLS = 8;
const ROWS = 5;

interface GameState {
  paddle: { x: number; y: number };
  ball: { x: number; y: number; vx: number; vy: number };
  balls: Array<{ x: number; y: number; vx: number; vy: number }>;
  bricks: Brick[];
  score: number;
  lives: number;
  level: number;
  gameOver: boolean;
  gameWon: boolean;
  hasStarted: boolean;
  ballLaunched: boolean;
  frameCount: number;
  particles: Particle[];
  powerUps: PowerUp[];
  activePowerUps: ActivePowerUp[];
}

interface Brick {
  x: number;
  y: number;
  health: number;
  maxHealth: number;
  color: string;
  points: number;
  type: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
}

interface PowerUp {
  x: number;
  y: number;
  vy: number;
  type: "wide" | "multi" | "fire";
  life: number;
}

interface ActivePowerUp {
  type: "wide" | "multi" | "fire";
  startFrame: number;
}

interface Trail {
  x: number;
  y: number;
  age: number;
}

const BRICK_COLORS = [
  { color: "#ff4444", points: 50, health: 2 },
  { color: "#ff6b35", points: 40, health: 1 },
  { color: "#ffd700", points: 30, health: 1 },
  { color: "#00ff88", points: 20, health: 1 },
  { color: "#4488ff", points: 10, health: 1 },
];

const createBricks = (level: number): Brick[] => {
  const bricks: Brick[] = [];
  const extraRowChance = level > 1 ? 0.3 : 0;
  const totalRows = Math.random() < extraRowChance && level > 1 ? 6 : 5;

  for (let row = 0; row < Math.min(totalRows, ROWS + (level > 1 ? 1 : 0)); row++) {
    const brickTypeIndex = Math.min(row, BRICK_COLORS.length - 1);
    const brickData = BRICK_COLORS[brickTypeIndex];

    for (let col = 0; col < COLS; col++) {
      const x = 16 + col * (BRICK_WIDTH + 4);
      const y = 20 + row * (BRICK_HEIGHT + 4);

      bricks.push({
        x,
        y,
        health: brickData.health,
        maxHealth: brickData.health,
        color: brickData.color,
        points: Math.floor(brickData.points * level),
        type: brickTypeIndex,
      });
    }
  }

  return bricks;
};

const drawPixelText = (
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  size: number = 8,
  color: string = "#00d4ff"
) => {
  ctx.fillStyle = color;
  ctx.font = `${size}px monospace`;
  ctx.textAlign = "left";
  ctx.fillText(text, x, y);
};

const drawBall = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  trail: Trail[],
  hasFireball: boolean
) => {
  trail.forEach((t) => {
    const opacity = 1 - t.age / 4;
    ctx.fillStyle = `rgba(0, 212, 255, ${opacity * 0.6})`;
    ctx.fillRect(t.x, t.y, BALL_SIZE, BALL_SIZE);
  });

  if (hasFireball) {
    ctx.fillStyle = "#ff6b35";
    ctx.shadowColor = "#ff6b35";
    ctx.shadowBlur = 8;
  } else {
    ctx.fillStyle = "#ffffff";
    ctx.shadowColor = "#00d4ff";
    ctx.shadowBlur = 6;
  }

  ctx.fillRect(x, y, BALL_SIZE, BALL_SIZE);
  ctx.shadowColor = "transparent";
};

const drawPaddle = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  isPowered: boolean
) => {
  ctx.fillStyle = "#0099bb";
  ctx.fillRect(x, y + 8, width, 4);

  ctx.fillStyle = "#00d4ff";
  ctx.fillRect(x, y, width, PADDLE_HEIGHT);

  ctx.fillStyle = "#00ffff";
  ctx.fillRect(x, y, width, 2);

  if (isPowered) {
    ctx.strokeStyle = "rgba(0, 255, 255, 0.5)";
    ctx.lineWidth = 2;
    ctx.strokeRect(x - 2, y - 2, width + 4, PADDLE_HEIGHT + 4);
  }
};

const drawBrick = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  color: string,
  health: number,
  maxHealth: number
) => {
  ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
  ctx.fillRect(x, y + BRICK_HEIGHT - 2, BRICK_WIDTH, 2);

  ctx.fillStyle = color;
  ctx.fillRect(x, y, BRICK_WIDTH, BRICK_HEIGHT);

  ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
  ctx.fillRect(x, y, BRICK_WIDTH, 2);

  if (health < maxHealth && maxHealth > 1) {
    ctx.strokeStyle = "rgba(0, 0, 0, 0.5)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x + BRICK_WIDTH * 0.3, y + BRICK_HEIGHT * 0.2);
    ctx.lineTo(x + BRICK_WIDTH * 0.7, y + BRICK_HEIGHT * 0.8);
    ctx.stroke();
  }
};

const drawPowerUp = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  type: "wide" | "multi" | "fire"
) => {
  const colors: Record<string, string> = {
    wide: "#0099ff",
    multi: "#00ff88",
    fire: "#ff6b35",
  };

  const letters: Record<string, string> = {
    wide: "W",
    multi: "M",
    fire: "F",
  };

  ctx.fillStyle = `${colors[type]}40`;
  ctx.fillRect(x - 4, y - 4, 16, 16);

  ctx.fillStyle = colors[type];
  ctx.fillRect(x, y, 8, 8);

  ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
  ctx.fillRect(x, y, 8, 2);

  drawPixelText(ctx, letters[type], x + 2, y + 6, 6, "#000000");
};

const drawBackground = (ctx: CanvasRenderingContext2D, frameCount: number) => {
  ctx.fillStyle = "#0a0a1a";
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  ctx.fillStyle = "#ffffff";
  for (let i = 0; i < 12; i++) {
    const x = (i * 40 + frameCount * 0.5) % CANVAS_WIDTH;
    const y = 20 + (i * 7) % 80;
    ctx.fillRect(x, y, 1, 1);
  }

  ctx.strokeStyle = "#00d4ff";
  ctx.lineWidth = 2;
  ctx.strokeRect(8, 8, CANVAS_WIDTH - 16, CANVAS_HEIGHT - 16);

  ctx.fillStyle = "#00d4ff";
  for (let i = 0; i < 4; i++) {
    const corners = [
      [8, 8],
      [CANVAS_WIDTH - 12, 8],
      [8, CANVAS_HEIGHT - 12],
      [CANVAS_WIDTH - 12, CANVAS_HEIGHT - 12],
    ];
    const [cx, cy] = corners[i];
    ctx.fillRect(cx, cy, 4, 4);
  }
};

export default function BreakoutGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameStateRef = useRef<GameState>({
    paddle: { x: CANVAS_WIDTH / 2 - PADDLE_WIDTH / 2, y: CANVAS_HEIGHT - 30 },
    ball: { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT - 50, vx: 0, vy: 0 },
    balls: [],
    bricks: createBricks(1),
    score: 0,
    lives: 3,
    level: 1,
    gameOver: false,
    gameWon: false,
    hasStarted: false,
    ballLaunched: false,
    frameCount: 0,
    particles: [],
    powerUps: [],
    activePowerUps: [],
  });

  const ballTrailsRef = useRef<Map<number, Trail[]>>(new Map());
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [playerName, setPlayerName] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const submitScore = async () => {
    if (!playerName.trim() || gameStateRef.current.score === 0) return;

    try {
      const response = await fetch("/api/leaderboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gameId: "breakout",
          name: playerName,
          score: gameStateRef.current.score,
        }),
      });

      if (response.ok) {
        setSubmitSuccess(true);
        setPlayerName("");
        setTimeout(() => setShowLeaderboard(true), 1000);
      }
    } catch (error) {
      console.error("Failed to submit score:", error);
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const gameState = gameStateRef.current;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (["ArrowLeft", "ArrowRight", "a", "d", " "].includes(e.key)) {
        e.preventDefault();
      }

      if (e.key === "ArrowLeft" || e.key.toLowerCase() === "a") {
        gameState.paddle.x = Math.max(8, gameState.paddle.x - 8);
      } else if (e.key === "ArrowRight" || e.key.toLowerCase() === "d") {
        gameState.paddle.x = Math.min(
          CANVAS_WIDTH - PADDLE_WIDTH - 8,
          gameState.paddle.x + 8
        );
      } else if (e.key === " ") {
        if (!gameState.ballLaunched && !gameState.gameOver && !gameState.gameWon) {
          gameState.ballLaunched = true;
          gameState.ball.vx = (Math.random() - 0.5) * 4;
          gameState.ball.vy = -6;
          gameState.hasStarted = true;
        }
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      if (x > 0 && x < rect.width) {
        const scaleFactor = CANVAS_WIDTH / rect.width;
        const newX = x * scaleFactor - PADDLE_WIDTH / 2;
        gameState.paddle.x = Math.max(8, Math.min(CANVAS_WIDTH - PADDLE_WIDTH - 8, newX));
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        const rect = canvas.getBoundingClientRect();
        const x = touch.clientX - rect.left;
        if (x > 0 && x < rect.width) {
          const scaleFactor = CANVAS_WIDTH / rect.width;
          const newX = x * scaleFactor - PADDLE_WIDTH / 2;
          gameState.paddle.x = Math.max(8, Math.min(CANVAS_WIDTH - PADDLE_WIDTH - 8, newX));
        }
      }
    };

    const handleTouchStart = () => {
      if (!gameState.ballLaunched && !gameState.gameOver && !gameState.gameWon) {
        gameState.ballLaunched = true;
        gameState.ball.vx = (Math.random() - 0.5) * 4;
        gameState.ball.vy = -6;
        gameState.hasStarted = true;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("touchmove", handleTouchMove);
    canvas.addEventListener("touchstart", handleTouchStart);

    const gameLoop = () => {
      const g = gameState;
      g.frameCount++;

      if (!g.ballLaunched) {
        g.ball.x = g.paddle.x + PADDLE_WIDTH / 2 - BALL_SIZE / 2;
        g.ball.y = g.paddle.y - BALL_SIZE - 2;
      }

      const powerUpDuration = 300;
      g.activePowerUps = g.activePowerUps.filter(
        (p) => g.frameCount - p.startFrame < powerUpDuration
      );

      g.powerUps = g.powerUps.filter((p) => {
        p.y += p.vy;
        p.life--;

        if (
          p.x > g.paddle.x - 8 &&
          p.x < g.paddle.x + PADDLE_WIDTH + 8 &&
          p.y + 8 > g.paddle.y - 4 &&
          p.y < g.paddle.y + PADDLE_HEIGHT + 4
        ) {
          if (p.type === "wide") {
            g.activePowerUps = g.activePowerUps.filter((ap) => ap.type !== "wide");
            g.activePowerUps.push({ type: "wide", startFrame: g.frameCount });
          } else if (p.type === "multi") {
            for (let i = 0; i < 2; i++) {
              g.balls.push({
                x: g.ball.x,
                y: g.ball.y,
                vx: (Math.random() - 0.5) * 8,
                vy: -5 + Math.random() * 2,
              });
              ballTrailsRef.current.set(g.balls.length - 1, []);
            }
          } else if (p.type === "fire") {
            g.activePowerUps = g.activePowerUps.filter((ap) => ap.type !== "fire");
            g.activePowerUps.push({ type: "fire", startFrame: g.frameCount });
          }
          return false;
        }

        return p.life > 0;
      });

      const updateBall = (ball: typeof g.ball, ballIndex: number) => {
        ball.x += ball.vx;
        ball.y += ball.vy;

        let trail = ballTrailsRef.current.get(ballIndex) || [];
        trail.push({ x: ball.x, y: ball.y, age: 0 });
        trail = trail.map((t) => ({ ...t, age: t.age + 1 })).filter((t) => t.age < 4);
        ballTrailsRef.current.set(ballIndex, trail);

        if (ball.vy < 8) {
          ball.vy += 0.2;
        }

        if (ball.x < 8 || ball.x + BALL_SIZE > CANVAS_WIDTH - 8) {
          ball.vx *= -1;
          ball.x = Math.max(8, Math.min(CANVAS_WIDTH - 8 - BALL_SIZE, ball.x));
        }

        if (ball.y < 8) {
          ball.vy *= -1;
          ball.y = 8;
        }

        if (
          ball.x + BALL_SIZE > g.paddle.x &&
          ball.x < g.paddle.x + PADDLE_WIDTH &&
          ball.y + BALL_SIZE >= g.paddle.y &&
          ball.y + BALL_SIZE <= g.paddle.y + PADDLE_HEIGHT + 2 &&
          ball.vy > 0
        ) {
          ball.vy = -6;

          const hitPos = (ball.x + BALL_SIZE / 2 - g.paddle.x) / PADDLE_WIDTH;
          ball.vx = (hitPos - 0.5) * 8;

          ball.y = g.paddle.y - BALL_SIZE - 1;
        }

        let hasFire = g.activePowerUps.some((p) => p.type === "fire");
        g.bricks = g.bricks.filter((brick) => {
          if (
            ball.x + BALL_SIZE > brick.x &&
            ball.x < brick.x + BRICK_WIDTH &&
            ball.y + BALL_SIZE > brick.y &&
            ball.y < brick.y + BRICK_HEIGHT
          ) {
            if (!hasFire) {
              const overlapLeft = ball.x + BALL_SIZE - brick.x;
              const overlapRight = brick.x + BRICK_WIDTH - ball.x;
              const overlapTop = ball.y + BALL_SIZE - brick.y;
              const overlapBottom = brick.y + BRICK_HEIGHT - ball.y;

              const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);

              if (minOverlap === overlapTop || minOverlap === overlapBottom) {
                ball.vy *= -1;
              } else {
                ball.vx *= -1;
              }
            }

            brick.health--;

            for (let i = 0; i < 5; i++) {
              g.particles.push({
                x: brick.x + BRICK_WIDTH / 2,
                y: brick.y + BRICK_HEIGHT / 2,
                vx: (Math.random() - 0.5) * 6,
                vy: (Math.random() - 0.5) * 6,
                life: 20,
                maxLife: 20,
                color: brick.color,
              });
            }

            g.score += brick.points;

            if (Math.random() < 0.15) {
              const powerUpTypes: Array<"wide" | "multi" | "fire"> = ["wide", "multi", "fire"];
              const type = powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)];
              g.powerUps.push({
                x: brick.x + BRICK_WIDTH / 2 - 4,
                y: brick.y + BRICK_HEIGHT / 2,
                vy: 1.5,
                type,
                life: 300,
              });
            }

            return brick.health <= 0;
          }
          return true;
        });

        if (ball.y > CANVAS_HEIGHT) {
          return false;
        }

        return true;
      };

      if (!updateBall(g.ball, -1)) {
        g.ballLaunched = false;
        if (g.balls.length === 0) {
          g.lives--;
          if (g.lives <= 0) {
            g.gameOver = true;
          }
        }
      }

      g.balls = g.balls.filter((ball, idx) => updateBall(ball, idx));

      if (g.bricks.length === 0 && !g.gameOver) {
        g.gameWon = true;
      }

      g.particles = g.particles.filter((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.2;
        p.life--;
        return p.life > 0;
      });

      ctx.imageSmoothingEnabled = false;
      drawBackground(ctx, g.frameCount);

      g.bricks.forEach((brick) => {
        drawBrick(ctx, brick.x, brick.y, brick.color, brick.health, brick.maxHealth);
      });

      g.powerUps.forEach((p) => {
        drawPowerUp(ctx, p.x, p.y, p.type);
      });

      const isPoweredWide = g.activePowerUps.some((p) => p.type === "wide");
      const isPoweredFire = g.activePowerUps.some((p) => p.type === "fire");

      const trail = ballTrailsRef.current.get(-1) || [];
      drawBall(ctx, g.ball.x, g.ball.y, trail, isPoweredFire);

      g.balls.forEach((ball, idx) => {
        const ballTrail = ballTrailsRef.current.get(idx) || [];
        drawBall(ctx, ball.x, ball.y, ballTrail, isPoweredFire);
      });

      g.particles.forEach((p) => {
        ctx.fillStyle = p.color;
        const opacity = p.life / p.maxLife;
        ctx.globalAlpha = opacity;
        ctx.fillRect(p.x, p.y, 4, 4);
        ctx.globalAlpha = 1;
      });

      const paddleWidth = isPoweredWide ? PADDLE_WIDTH * 1.5 : PADDLE_WIDTH;
      drawPaddle(ctx, g.paddle.x, g.paddle.y, paddleWidth, isPoweredWide);

      drawPixelText(ctx, `SCORE: ${g.score}`, 16, 25, 12, "#00d4ff");
      drawPixelText(ctx, `LIVES: ${g.lives}`, CANVAS_WIDTH - 130, 25, 12, "#ff6b35");
      drawPixelText(ctx, `LV ${g.level}`, CANVAS_WIDTH / 2 - 20, 25, 12, "#00ff88");

      if (g.gameOver) {
        ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        drawPixelText(ctx, "GAME OVER", CANVAS_WIDTH / 2 - 90, CANVAS_HEIGHT / 2 - 20, 24, "#ff4444");
      } else if (g.gameWon) {
        ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        drawPixelText(ctx, "LEVEL CLEAR!", CANVAS_WIDTH / 2 - 110, CANVAS_HEIGHT / 2 - 20, 20, "#00ff88");
      }

      if (!g.gameOver && !g.gameWon) {
        requestAnimationFrame(gameLoop);
      }
    };

    gameLoop();

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("touchmove", handleTouchMove);
      canvas.removeEventListener("touchstart", handleTouchStart);
    };
  }, []);

  const handleReset = () => {
    gameStateRef.current = {
      paddle: { x: CANVAS_WIDTH / 2 - PADDLE_WIDTH / 2, y: CANVAS_HEIGHT - 30 },
      ball: { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT - 50, vx: 0, vy: 0 },
      balls: [],
      bricks: createBricks(1),
      score: 0,
      lives: 3,
      level: 1,
      gameOver: false,
      gameWon: false,
      hasStarted: false,
      ballLaunched: false,
      frameCount: 0,
      particles: [],
      powerUps: [],
      activePowerUps: [],
    };
    ballTrailsRef.current.clear();
    setSubmitSuccess(false);
    setShowLeaderboard(false);
  };

  const handleNextLevel = () => {
    const g = gameStateRef.current;
    g.level++;
    g.bricks = createBricks(g.level);
    g.ballLaunched = false;
    g.gameWon = false;
    g.balls = [];
    g.powerUps = [];
    g.activePowerUps = [];
    ballTrailsRef.current.clear();
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: "var(--color-retro-bg)",
        color: "var(--color-retro-text)",
        fontFamily: "var(--font-family-pixel)",
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div style={{ marginBottom: "20px", textAlign: "center" }}>
        <h1
          style={{
            fontSize: "32px",
            fontWeight: "bold",
            marginBottom: "10px",
            textShadow: "0 0 10px var(--color-retro-accent)",
            color: "var(--color-retro-accent)",
          }}
        >
          ブレイク アウト
        </h1>
      </div>

      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        style={{
          border: "4px solid var(--color-retro-accent)",
          backgroundColor: "#000000",
          imageRendering: "pixelated",
          marginBottom: "20px",
          boxShadow: "0 0 20px rgba(0, 212, 255, 0.3)",
        }}
      />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "10px",
          marginBottom: "20px",
          width: "100%",
          maxWidth: "480px",
        }}
      >
        <button
          onClick={handleReset}
          style={{
            padding: "12px",
            backgroundColor: "var(--color-retro-accent)",
            color: "var(--color-retro-bg)",
            border: "2px solid var(--color-retro-accent)",
            borderRadius: "4px",
            fontSize: "14px",
            fontWeight: "bold",
            cursor: "pointer",
            fontFamily: "var(--font-family-pixel)",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            const btn = e.currentTarget;
            btn.style.backgroundColor = "var(--color-retro-accent2)";
            btn.style.borderColor = "var(--color-retro-accent2)";
          }}
          onMouseLeave={(e) => {
            const btn = e.currentTarget;
            btn.style.backgroundColor = "var(--color-retro-accent)";
            btn.style.borderColor = "var(--color-retro-accent)";
          }}
        >
          新しいゲーム
        </button>

        {gameStateRef.current.gameWon && (
          <button
            onClick={handleNextLevel}
            style={{
              padding: "12px",
              backgroundColor: "#00ff88",
              color: "#000000",
              border: "2px solid #00ff88",
              borderRadius: "4px",
              fontSize: "14px",
              fontWeight: "bold",
              cursor: "pointer",
              fontFamily: "var(--font-family-pixel)",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              const btn = e.currentTarget;
              btn.style.backgroundColor = "#00dd77";
              btn.style.borderColor = "#00dd77";
            }}
            onMouseLeave={(e) => {
              const btn = e.currentTarget;
              btn.style.backgroundColor = "#00ff88";
              btn.style.borderColor = "#00ff88";
            }}
          >
            次のレベル
          </button>
        )}
      </div>

      {gameStateRef.current.gameOver && (
        <div
          style={{
            marginBottom: "20px",
            textAlign: "center",
            maxWidth: "480px",
          }}
        >
          <p style={{ marginBottom: "15px", fontSize: "16px", color: "#ff6b35" }}>
            最終スコア: {gameStateRef.current.score}
          </p>

          {!submitSuccess ? (
            <div
              style={{
                backgroundColor: "var(--color-retro-card)",
                padding: "15px",
                borderRadius: "4px",
                border: "1px solid var(--color-retro-border)",
              }}
            >
              <input
                type="text"
                placeholder="プレイヤー名"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && submitScore()}
                style={{
                  width: "100%",
                  padding: "8px",
                  marginBottom: "10px",
                  backgroundColor: "var(--color-retro-bg)",
                  color: "var(--color-retro-text)",
                  border: "1px solid var(--color-retro-border)",
                  borderRadius: "4px",
                  fontFamily: "var(--font-family-pixel)",
                  fontSize: "12px",
                }}
              />
              <button
                onClick={submitScore}
                style={{
                  width: "100%",
                  padding: "8px",
                  backgroundColor: "var(--color-retro-accent)",
                  color: "var(--color-retro-bg)",
                  border: "1px solid var(--color-retro-accent)",
                  borderRadius: "4px",
                  fontSize: "12px",
                  fontWeight: "bold",
                  cursor: "pointer",
                  fontFamily: "var(--font-family-pixel)",
                }}
              >
                スコア送信
              </button>
            </div>
          ) : (
            <div style={{ color: "#00ff88", marginBottom: "10px" }}>
              スコアを送信しました！
            </div>
          )}
        </div>
      )}

      {showLeaderboard && <Leaderboard gameId="breakout" />}

      <div
        style={{
          maxWidth: "480px",
          backgroundColor: "rgba(0, 212, 255, 0.05)",
          border: "1px solid var(--color-retro-border)",
          borderRadius: "4px",
          padding: "15px",
          fontSize: "12px",
          color: "var(--color-retro-text-dim)",
          lineHeight: "1.8",
        }}
      >
        <p style={{ marginBottom: "10px", fontWeight: "bold", color: "var(--color-retro-accent)" }}>
          操作:
        </p>
        <ul style={{ marginLeft: "20px", marginBottom: "15px" }}>
          <li>左右矢印キー / A/D: パドル移動</li>
          <li>スペースキー: ボール発射</li>
          <li>マウス: パドルに自動追従</li>
          <li>タッチ: パドル移動・ボール発射</li>
        </ul>

        <p style={{ marginBottom: "10px", fontWeight: "bold", color: "var(--color-retro-accent)" }}>
          ルール:
        </p>
        <ul style={{ marginLeft: "20px" }}>
          <li>全てのレンガを壊してレベルクリア</li>
          <li>レンガの種類により点数が異なる</li>
          <li>パドルの位置でボール方向が変わる</li>
          <li>パワーアップ: W (ワイド), M (マルチボール), F (ファイア)</li>
          <li>ボールを落としたらライフ-1、ゲームオーバーは3回まで</li>
        </ul>
      </div>
    </main>
  );
}
