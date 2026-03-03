"use client";

import { useEffect, useRef, useState } from "react";
import Leaderboard from "../components/Leaderboard";

const CANVAS_WIDTH = 300;
const CANVAS_HEIGHT = 600;
const GRID_WIDTH = 10;
const GRID_HEIGHT = 20;
const BLOCK_SIZE = CANVAS_WIDTH / GRID_WIDTH;

type Tetromino = {
  shape: boolean[][];
  color: string;
};

const TETROMINOES: Tetromino[] = [
  { shape: [[true, true, true, true]], color: "#00d4ff" }, // I
  { shape: [[true, true], [true, true]], color: "#ffd700" }, // O
  { shape: [[false, true, false], [true, true, true]], color: "#a855f7" }, // T
  { shape: [[false, true, true], [true, true, false]], color: "#00ff88" }, // S
  { shape: [[true, true, false], [false, true, true]], color: "#ff4444" }, // Z
  { shape: [[true, false], [true, false], [true, true]], color: "#ff6b35" }, // L
  { shape: [[false, true], [false, true], [true, true]], color: "#00d4ff" }, // J
];

interface GameState {
  grid: number[][];
  currentPiece: Tetromino | null;
  currentX: number;
  currentY: number;
  score: number;
  lines: number;
  level: number;
  gameOver: boolean;
  dropTimer: number;
  dropRate: number;
  nextPiece: Tetromino | null;
}

export default function BlocksGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameStateRef = useRef<GameState>({
    grid: Array(GRID_HEIGHT).fill(null).map(() => Array(GRID_WIDTH).fill(0)),
    currentPiece: null,
    currentX: 3,
    currentY: 0,
    score: 0,
    lines: 0,
    level: 1,
    gameOver: false,
    dropTimer: 0,
    dropRate: 60,
    nextPiece: null,
  });

  const inputRef = useRef({
    left: false,
    right: false,
    down: false,
    rotate: false,
    hardDrop: false,
  });

  const [showLeaderboardForm, setShowLeaderboardForm] = useState(false);
  const [playerName, setPlayerName] = useState("");
  const [playerLink, setPlayerLink] = useState("");
  const [finalScore, setFinalScore] = useState(0);

  const getRandomPiece = (): Tetromino => {
    return TETROMINOES[Math.floor(Math.random() * TETROMINOES.length)];
  };

  const canPlacePiece = (piece: Tetromino, x: number, y: number): boolean => {
    for (let i = 0; i < piece.shape.length; i++) {
      for (let j = 0; j < piece.shape[i].length; j++) {
        if (!piece.shape[i][j]) continue;

        const newX = x + j;
        const newY = y + i;

        if (newX < 0 || newX >= GRID_WIDTH || newY >= GRID_HEIGHT) return false;
        if (newY >= 0 && gameStateRef.current.grid[newY][newX] !== 0) return false;
      }
    }
    return true;
  };

  const placePiece = (piece: Tetromino, x: number, y: number) => {
    const grid = gameStateRef.current.grid;
    for (let i = 0; i < piece.shape.length; i++) {
      for (let j = 0; j < piece.shape[i].length; j++) {
        if (!piece.shape[i][j]) continue;

        const newX = x + j;
        const newY = y + i;

        if (newY >= 0) {
          grid[newY][newX] = 1; // Mark as filled
        }
      }
    }
  };

  const clearLines = (): number => {
    const grid = gameStateRef.current.grid;
    let linesCleared = 0;

    for (let i = GRID_HEIGHT - 1; i >= 0; i--) {
      if (grid[i].every((cell) => cell !== 0)) {
        grid.splice(i, 1);
        grid.unshift(Array(GRID_WIDTH).fill(0));
        linesCleared++;
        i++;
      }
    }

    return linesCleared;
  };

  const draw = (ctx: CanvasRenderingContext2D, state: GameState) => {
    // Background
    ctx.fillStyle = "#0a0a0f";
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Grid
    ctx.strokeStyle = "rgba(42, 42, 58, 0.3)";
    ctx.lineWidth = 1;
    for (let i = 0; i <= GRID_WIDTH; i++) {
      ctx.beginPath();
      ctx.moveTo(i * BLOCK_SIZE, 0);
      ctx.lineTo(i * BLOCK_SIZE, CANVAS_HEIGHT);
      ctx.stroke();
    }
    for (let i = 0; i <= GRID_HEIGHT; i++) {
      ctx.beginPath();
      ctx.moveTo(0, i * BLOCK_SIZE);
      ctx.lineTo(CANVAS_WIDTH, i * BLOCK_SIZE);
      ctx.stroke();
    }

    // Draw grid blocks
    for (let i = 0; i < GRID_HEIGHT; i++) {
      for (let j = 0; j < GRID_WIDTH; j++) {
        if (state.grid[i][j] !== 0) {
          ctx.fillStyle = "#a855f7";
          ctx.fillRect(j * BLOCK_SIZE + 1, i * BLOCK_SIZE + 1, BLOCK_SIZE - 2, BLOCK_SIZE - 2);
        }
      }
    }

    // Draw current piece
    if (state.currentPiece) {
      ctx.fillStyle = state.currentPiece.color;
      for (let i = 0; i < state.currentPiece.shape.length; i++) {
        for (let j = 0; j < state.currentPiece.shape[i].length; j++) {
          if (state.currentPiece.shape[i][j]) {
            const x = (state.currentX + j) * BLOCK_SIZE + 1;
            const y = (state.currentY + i) * BLOCK_SIZE + 1;
            ctx.fillRect(x, y, BLOCK_SIZE - 2, BLOCK_SIZE - 2);
          }
        }
      }
    }

    // Score display
    ctx.fillStyle = "#00d4ff";
    ctx.font = "bold 14px var(--font-family-pixel)";
    ctx.fillText(`SCORE: ${state.score}`, 10, CANVAS_HEIGHT + 20);
    ctx.fillText(`LINES: ${state.lines}`, 10, CANVAS_HEIGHT + 40);
    ctx.fillText(`LEVEL: ${state.level}`, 180, CANVAS_HEIGHT + 20);

    // Game over screen
    if (state.gameOver) {
      ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      ctx.fillStyle = "#ff6b35";
      ctx.font = "bold 20px var(--font-family-pixel)";
      ctx.textAlign = "center";
      ctx.fillText("GAME OVER", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 30);

      ctx.fillStyle = "#00d4ff";
      ctx.font = "bold 16px var(--font-family-pixel)";
      ctx.fillText(`FINAL: ${state.score}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 20);
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
      // Initialize piece if needed
      if (!state.currentPiece) {
        state.currentPiece = state.nextPiece || getRandomPiece();
        state.nextPiece = getRandomPiece();
        state.currentX = 3;
        state.currentY = 0;

        if (!canPlacePiece(state.currentPiece, state.currentX, state.currentY)) {
          state.gameOver = true;
          setFinalScore(state.score);
          setShowLeaderboardForm(true);
        }
      }

      // Handle input
      if (inputRef.current.left && canPlacePiece(state.currentPiece, state.currentX - 1, state.currentY)) {
        state.currentX--;
        inputRef.current.left = false;
      }

      if (inputRef.current.right && canPlacePiece(state.currentPiece, state.currentX + 1, state.currentY)) {
        state.currentX++;
        inputRef.current.right = false;
      }

      if (inputRef.current.rotate) {
        const rotated = rotatePiece(state.currentPiece);
        if (canPlacePiece(rotated, state.currentX, state.currentY)) {
          state.currentPiece = rotated;
        }
        inputRef.current.rotate = false;
      }

      // Hard drop
      if (inputRef.current.hardDrop) {
        while (canPlacePiece(state.currentPiece, state.currentX, state.currentY + 1)) {
          state.currentY++;
        }
        inputRef.current.hardDrop = false;
      }

      // Drop piece
      state.dropTimer++;
      if (inputRef.current.down || state.dropTimer >= state.dropRate) {
        if (canPlacePiece(state.currentPiece, state.currentX, state.currentY + 1)) {
          state.currentY++;
        } else {
          // Lock piece
          placePiece(state.currentPiece, state.currentX, state.currentY);
          const linesCleared = clearLines();

          if (linesCleared > 0) {
            const scoreMap = [0, 100, 300, 500, 800];
            state.score += scoreMap[Math.min(linesCleared, 4)];
            state.lines += linesCleared;

            // Level up every 10 lines
            const newLevel = Math.floor(state.lines / 10) + 1;
            if (newLevel > state.level) {
              state.level = newLevel;
              state.dropRate = Math.max(10, 60 - (newLevel - 1) * 5);
            }
          }

          state.currentPiece = null;
        }
        state.dropTimer = 0;
      }
    }

    draw(ctx, state);

    if (!state.gameOver) {
      requestAnimationFrame(gameLoop);
    }
  };

  const rotatePiece = (piece: Tetromino): Tetromino => {
    const rotated = [];
    for (let j = 0; j < piece.shape[0].length; j++) {
      const row = [];
      for (let i = piece.shape.length - 1; i >= 0; i--) {
        row.push(piece.shape[i][j]);
      }
      rotated.push(row);
    }
    return { shape: rotated, color: piece.color };
  };

  const restart = () => {
    gameStateRef.current = {
      grid: Array(GRID_HEIGHT).fill(null).map(() => Array(GRID_WIDTH).fill(0)),
      currentPiece: null,
      currentX: 3,
      currentY: 0,
      score: 0,
      lines: 0,
      level: 1,
      gameOver: false,
      dropTimer: 0,
      dropRate: 60,
      nextPiece: null,
    };
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

    const localKey = "leaderboard_blocks";
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
            await push(ref(db, "leaderboards/blocks"), entry);
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
        case "arrowdown":
          inputRef.current.down = true;
          break;
        case "arrowup":
        case "w":
          inputRef.current.rotate = true;
          break;
        case " ":
          e.preventDefault();
          inputRef.current.hardDrop = true;
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
        case "arrowdown":
          inputRef.current.down = false;
          break;
        case "arrowup":
        case "w":
          inputRef.current.rotate = false;
          break;
        case " ":
          inputRef.current.hardDrop = false;
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
          ブロック パズル
        </h1>

        {/* Game Canvas */}
        <div style={{
          marginBottom: "20px",
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
          <Leaderboard gameId="blocks" />
        </div>
      </div>
    </main>
  );
}
