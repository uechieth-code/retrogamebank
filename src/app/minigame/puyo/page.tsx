"use client";

import { useEffect, useRef, useState } from "react";
import Leaderboard from "../components/Leaderboard";

const PLAY_AREA_WIDTH = 300;
const INFO_PANEL_WIDTH = 180;
const CANVAS_WIDTH = PLAY_AREA_WIDTH + INFO_PANEL_WIDTH;
const CANVAS_HEIGHT = 400;
const GRID_WIDTH = 6;
const GRID_HEIGHT = 12;
const BLOCK_SIZE = PLAY_AREA_WIDTH / GRID_WIDTH;

const COLORS: Record<string, { light: string; base: string; dark: string }> = {
  red: { light: "#ff4444", base: "#cc2222", dark: "#991111" },
  green: { light: "#00ff88", base: "#00bb66", dark: "#008844" },
  blue: { light: "#4488ff", base: "#2266cc", dark: "#114499" },
  yellow: { light: "#ffd700", base: "#cc9900", dark: "#996600" },
};

type ColorKey = keyof typeof COLORS;
const COLOR_KEYS: ColorKey[] = ["red", "green", "blue", "yellow"];

interface Puyo {
  color: ColorKey;
  x: number;
  y: number;
}

interface Pair {
  top: Puyo;
  bottom: Puyo;
  x: number;
  y: number;
  rotation: number; // 0=vertical, 1=right, 2=vertical, 3=left
}

interface ChainEffect {
  x: number;
  y: number;
  text: string;
  life: number;
  maxLife: number;
}

interface PopAnimation {
  x: number;
  y: number;
  life: number;
  maxLife: number;
}

interface GameState {
  grid: (ColorKey | null)[][];
  currentPair: Pair | null;
  nextPair: Pair | null;
  score: number;
  chainCount: number;
  level: number;
  gameOver: boolean;
  hasStarted: boolean;
  dropTimer: number;
  dropRate: number;
  popAnimations: PopAnimation[];
  chainEffects: ChainEffect[];
  ghostY: number;
  lockDelayTimer: number;
  lockDelayMax: number;
}

export default function PuyoGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameStateRef = useRef<GameState>({
    grid: Array(GRID_HEIGHT).fill(null).map(() => Array(GRID_WIDTH).fill(null)),
    currentPair: null,
    nextPair: null,
    score: 0,
    chainCount: 0,
    level: 1,
    gameOver: false,
    hasStarted: false,
    dropTimer: 0,
    dropRate: 30,
    popAnimations: [],
    chainEffects: [],
    ghostY: 0,
    lockDelayTimer: 0,
    lockDelayMax: 20,
  });

  const inputRef = useRef({
    left: false,
    right: false,
    up: false,
    down: false,
  });

  const [score, setScore] = useState(0);
  const [chain, setChain] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [submitOpen, setSubmitOpen] = useState(false);
  const [playerName, setPlayerName] = useState("");

  // Utility functions
  const getRandomColor = (): ColorKey => COLOR_KEYS[Math.floor(Math.random() * COLOR_KEYS.length)];

  const createPair = (): Pair => ({
    top: { color: getRandomColor(), x: 0, y: 0 },
    bottom: { color: getRandomColor(), x: 0, y: 1 },
    x: 2,
    y: 0,
    rotation: 0,
  });

  const getPairBlocks = (pair: Pair): Array<{ x: number; y: number; color: ColorKey }> => {
    const blocks: Array<{ x: number; y: number; color: ColorKey }> = [];
    
    if (pair.rotation === 0) { // vertical: top and bottom
      blocks.push({ x: pair.x, y: pair.y, color: pair.top.color });
      blocks.push({ x: pair.x, y: pair.y + 1, color: pair.bottom.color });
    } else if (pair.rotation === 1) { // right: left and right
      blocks.push({ x: pair.x, y: pair.y, color: pair.top.color });
      blocks.push({ x: pair.x + 1, y: pair.y, color: pair.bottom.color });
    } else if (pair.rotation === 2) { // vertical: bottom and top
      blocks.push({ x: pair.x, y: pair.y + 1, color: pair.top.color });
      blocks.push({ x: pair.x, y: pair.y, color: pair.bottom.color });
    } else { // left: right and left
      blocks.push({ x: pair.x + 1, y: pair.y, color: pair.top.color });
      blocks.push({ x: pair.x, y: pair.y, color: pair.bottom.color });
    }
    
    return blocks;
  };

  const canPlacePair = (pair: Pair, grid: (ColorKey | null)[][]): boolean => {
    const blocks = getPairBlocks(pair);
    for (const block of blocks) {
      if (block.x < 0 || block.x >= GRID_WIDTH || block.y < 0 || block.y >= GRID_HEIGHT) {
        return false;
      }
      if (grid[block.y][block.x] !== null) {
        return false;
      }
    }
    return true;
  };

  const rotatePair = (pair: Pair, grid: (ColorKey | null)[][]): Pair => {
    const rotated = { ...pair, rotation: (pair.rotation + 1) % 4 };
    if (canPlacePair(rotated, grid)) {
      return rotated;
    }
    return pair;
  };

  const lockPair = (pair: Pair | null, grid: (ColorKey | null)[][]): (ColorKey | null)[][] => {
    if (!pair) return grid;
    const newGrid = grid.map(row => [...row]);
    const blocks = getPairBlocks(pair);
    for (const block of blocks) {
      if (block.y >= 0 && block.y < GRID_HEIGHT) {
        newGrid[block.y][block.x] = block.color;
      }
    }
    return newGrid;
  };

  const findConnectedPuyos = (
    grid: (ColorKey | null)[][],
    x: number,
    y: number,
    color: ColorKey,
    visited: Set<string> = new Set()
  ): Array<{ x: number; y: number }> => {
    const key = `${x},${y}`;
    if (visited.has(key)) return [];
    if (x < 0 || x >= GRID_WIDTH || y < 0 || y >= GRID_HEIGHT) return [];
    if (grid[y][x] !== color) return [];

    visited.add(key);
    const connected: Array<{ x: number; y: number }> = [{ x, y }];

    connected.push(...findConnectedPuyos(grid, x + 1, y, color, visited));
    connected.push(...findConnectedPuyos(grid, x - 1, y, color, visited));
    connected.push(...findConnectedPuyos(grid, x, y + 1, color, visited));
    connected.push(...findConnectedPuyos(grid, x, y - 1, color, visited));

    return connected;
  };

  const popPuyos = (grid: (ColorKey | null)[][]): { newGrid: (ColorKey | null)[][]; poppedCount: number; positions: Array<{ x: number; y: number }> } => {
    const toPop: Set<string> = new Set();
    let poppedCount = 0;
    const positions: Array<{ x: number; y: number }> = [];

    for (let y = 0; y < GRID_HEIGHT; y++) {
      for (let x = 0; x < GRID_WIDTH; x++) {
        if (grid[y][x] !== null) {
          const color = grid[y][x] as ColorKey;
          const connected = findConnectedPuyos(grid, x, y, color);
          if (connected.length >= 4) {
            connected.forEach(pos => toPop.add(`${pos.x},${pos.y}`));
          }
        }
      }
    }

    const newGrid = grid.map(row => [...row]);
    toPop.forEach(key => {
      const [x, y] = key.split(",").map(Number);
      newGrid[y][x] = null;
      poppedCount++;
      positions.push({ x, y });
    });

    return { newGrid, poppedCount, positions };
  };

  const applyGravity = (grid: (ColorKey | null)[][]): (ColorKey | null)[][] => {
    const newGrid = grid.map(row => [...row]);
    
    for (let x = 0; x < GRID_WIDTH; x++) {
      const column = newGrid.map(row => row[x]).filter(cell => cell !== null);
      for (let y = 0; y < GRID_HEIGHT; y++) {
        newGrid[y][x] = y < GRID_HEIGHT - column.length ? null : column[y - (GRID_HEIGHT - column.length)];
      }
    }
    
    return newGrid;
  };

  const resolveChains = (grid: (ColorKey | null)[][]): { finalGrid: (ColorKey | null)[][]; totalScore: number; chainCount: number } => {
    let currentGrid = grid;
    let totalScore = 0;
    let chainCount = 0;

    while (true) {
      const { newGrid, poppedCount, positions } = popPuyos(currentGrid);
      if (poppedCount === 0) break;

      chainCount++;
      const baseScore = poppedCount * 10;
      const bonusScore = Math.max(0, poppedCount - 4) * 5;
      const chainBonus = chainCount * (baseScore + bonusScore);
      totalScore += chainBonus;

      // Add chain effects
      positions.forEach(pos => {
        gameStateRef.current.chainEffects.push({
          x: pos.x,
          y: pos.y,
          text: chainCount > 1 ? `${chainCount}連鎖!` : "Pop!",
          life: 60,
          maxLife: 60,
        });
        gameStateRef.current.popAnimations.push({
          x: pos.x,
          y: pos.y,
          life: 30,
          maxLife: 30,
        });
      });

      currentGrid = applyGravity(newGrid);
    }

    return { finalGrid: currentGrid, totalScore, chainCount };
  };

  const updateGame = () => {
    const gs = gameStateRef.current;
    if (!gs.hasStarted || gs.gameOver) return;

    // Generate first pair
    if (!gs.currentPair) {
      gs.currentPair = createPair();
      gs.nextPair = createPair();
    }

    // Handle input
    if (inputRef.current.left && gs.currentPair) {
      gs.currentPair.x--;
      if (!canPlacePair(gs.currentPair, gs.grid)) {
        gs.currentPair.x++;
      }
      inputRef.current.left = false;
    }
    if (inputRef.current.right && gs.currentPair) {
      gs.currentPair.x++;
      if (!canPlacePair(gs.currentPair, gs.grid)) {
        gs.currentPair.x--;
      }
      inputRef.current.right = false;
    }
    if (inputRef.current.up && gs.currentPair) {
      gs.currentPair = rotatePair(gs.currentPair, gs.grid);
      inputRef.current.up = false;
    }

    const hardDrop = inputRef.current.down;
    inputRef.current.down = false;

    // Gravity and dropping
    gs.dropTimer++;
    const dropSpeed = hardDrop ? 1 : gs.dropRate;
    
    if (gs.dropTimer >= dropSpeed && gs.currentPair) {
      gs.dropTimer = 0;
      gs.currentPair.y++;

      if (!canPlacePair(gs.currentPair, gs.grid)) {
        gs.currentPair.y--;
        gs.lockDelayTimer++;
        
        if (gs.lockDelayTimer >= gs.lockDelayMax) {
          // Lock the piece
          gs.grid = lockPair(gs.currentPair, gs.grid);

          // Check game over (3rd column fills to top)
          if (gs.grid[0][2] !== null || gs.grid[0][3] !== null) {
            gs.gameOver = true;
            setGameOver(true);
            setScore(gs.score);
            return;
          }

          // Resolve chains
          const { finalGrid, totalScore, chainCount } = resolveChains(gs.grid);
          gs.grid = finalGrid;
          gs.score += totalScore;
          gs.chainCount = chainCount;
          setScore(gs.score);
          setChain(gs.chainCount);

          gs.currentPair = gs.nextPair;
          gs.nextPair = createPair();
          gs.lockDelayTimer = 0;
        }
      } else {
        gs.lockDelayTimer = 0;
      }
    }

    // Calculate ghost position
    let ghostY = gs.currentPair?.y ?? 0;
    if (gs.currentPair) {
      while (canPlacePair({ ...gs.currentPair, y: ghostY + 1 }, gs.grid)) {
        ghostY++;
      }
    }
    gs.ghostY = ghostY;

    // Update animations
    gs.popAnimations = gs.popAnimations.filter(anim => {
      anim.life--;
      return anim.life > 0;
    });
    gs.chainEffects = gs.chainEffects.filter(effect => {
      effect.life--;
      return effect.life > 0;
    });
  };

  const drawPuyo = (ctx: CanvasRenderingContext2D, x: number, y: number, color: ColorKey, size: number = BLOCK_SIZE) => {
    const colorData = COLORS[color];
    const radius = size / 2 - 2;
    const centerX = x + size / 2;
    const centerY = y + size / 2;

    // Draw shadow
    ctx.fillStyle = colorData.dark;
    ctx.beginPath();
    ctx.arc(centerX, centerY + size / 4, radius - 1, 0, Math.PI * 2);
    ctx.fill();

    // Draw main body
    ctx.fillStyle = colorData.base;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fill();

    // Draw highlight
    ctx.fillStyle = colorData.light;
    ctx.beginPath();
    ctx.arc(centerX - size / 6, centerY - size / 6, radius / 2, 0, Math.PI * 2);
    ctx.fill();

    // Draw eyes
    const eyeOffsetX = size / 6;
    const eyeOffsetY = 0;
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(centerX - eyeOffsetX, centerY + eyeOffsetY, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(centerX + eyeOffsetX, centerY + eyeOffsetY, 2, 0, Math.PI * 2);
    ctx.fill();

    // Draw pupils
    ctx.fillStyle = "#000000";
    ctx.beginPath();
    ctx.arc(centerX - eyeOffsetX, centerY + eyeOffsetY, 1, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(centerX + eyeOffsetX, centerY + eyeOffsetY, 1, 0, Math.PI * 2);
    ctx.fill();
  };

  const drawGame = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const gs = gameStateRef.current;

    // Clear canvas
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw play area background
    ctx.fillStyle = "#1a1a1a";
    ctx.fillRect(0, 0, PLAY_AREA_WIDTH, CANVAS_HEIGHT);

    // Draw info panel background
    ctx.fillStyle = "#0a0a0a";
    ctx.fillRect(PLAY_AREA_WIDTH, 0, INFO_PANEL_WIDTH, CANVAS_HEIGHT);

    // Draw grid
    ctx.strokeStyle = "#333333";
    ctx.lineWidth = 1;
    for (let x = 0; x <= GRID_WIDTH; x++) {
      ctx.beginPath();
      ctx.moveTo(x * BLOCK_SIZE, 0);
      ctx.lineTo(x * BLOCK_SIZE, CANVAS_HEIGHT);
      ctx.stroke();
    }
    for (let y = 0; y <= GRID_HEIGHT; y++) {
      ctx.beginPath();
      ctx.moveTo(0, y * BLOCK_SIZE);
      ctx.lineTo(PLAY_AREA_WIDTH, y * BLOCK_SIZE);
      ctx.stroke();
    }

    // Draw grid contents
    for (let y = 0; y < GRID_HEIGHT; y++) {
      for (let x = 0; x < GRID_WIDTH; x++) {
        if (gs.grid[y][x] !== null) {
          const cellX = x * BLOCK_SIZE;
          const cellY = y * BLOCK_SIZE;
          drawPuyo(ctx, cellX, cellY, gs.grid[y][x] as ColorKey);
        }
      }
    }

    // Draw ghost pair
    if (gs.currentPair && gs.hasStarted && !gs.gameOver) {
      const ghostPair = { ...gs.currentPair, y: gs.ghostY };
      const blocks = getPairBlocks(ghostPair);
      blocks.forEach(block => {
        if (block.y >= 0 && block.y < GRID_HEIGHT) {
          const cellX = block.x * BLOCK_SIZE;
          const cellY = block.y * BLOCK_SIZE;
          const colorData = COLORS[block.color];
          ctx.strokeStyle = colorData.dark;
          ctx.lineWidth = 2;
          ctx.strokeRect(cellX + 2, cellY + 2, BLOCK_SIZE - 4, BLOCK_SIZE - 4);
        }
      });
    }

    // Draw current pair
    if (gs.currentPair && gs.hasStarted && !gs.gameOver) {
      const blocks = getPairBlocks(gs.currentPair);
      blocks.forEach(block => {
        if (block.y >= 0 && block.y < GRID_HEIGHT) {
          const cellX = block.x * BLOCK_SIZE;
          const cellY = block.y * BLOCK_SIZE;
          drawPuyo(ctx, cellX, cellY, block.color);
        }
      });
    }

    // Draw pop animations
    gs.popAnimations.forEach(anim => {
      const progress = 1 - anim.life / anim.maxLife;
      const cellX = anim.x * BLOCK_SIZE;
      const cellY = anim.y * BLOCK_SIZE;
      
      ctx.fillStyle = `rgba(255, 255, 255, ${1 - progress})`;
      ctx.fillRect(cellX + 2, cellY + 2, BLOCK_SIZE - 4, BLOCK_SIZE - 4);
    });

    // Draw info panel
    const infoPanelX = PLAY_AREA_WIDTH + 10;
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 14px monospace";
    
    ctx.fillText("NEXT", infoPanelX, 30);
    if (gs.nextPair) {
      const nextBlocks = getPairBlocks({ ...gs.nextPair, x: 1, y: 0 });
      nextBlocks.forEach(block => {
        const previewX = infoPanelX + block.x * 30;
        const previewY = 50 + block.y * 30;
        drawPuyo(ctx, previewX, previewY, block.color, 28);
      });
    }

    ctx.fillText("SCORE", infoPanelX, 150);
    ctx.font = "12px monospace";
    ctx.fillText(gs.score.toString(), infoPanelX, 165);

    ctx.fillText("CHAIN", infoPanelX, 190);
    ctx.fillText(gs.chainCount.toString(), infoPanelX, 205);

    ctx.fillText("LEVEL", infoPanelX, 230);
    ctx.fillText(gs.level.toString(), infoPanelX, 245);

    // Draw chain effects
    gs.chainEffects.forEach(effect => {
      const progress = effect.life / effect.maxLife;
      const alpha = Math.max(0, progress);
      ctx.fillStyle = `rgba(255, 255, 100, ${alpha})`;
      ctx.font = "bold 12px monospace";
      const cellX = effect.x * BLOCK_SIZE + BLOCK_SIZE / 2;
      const cellY = effect.y * BLOCK_SIZE + BLOCK_SIZE / 2;
      ctx.textAlign = "center";
      ctx.fillText(effect.text, cellX, cellY);
      ctx.textAlign = "left";
    });

    // Draw start screen
    if (!gs.hasStarted) {
      ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
      ctx.fillRect(0, 0, PLAY_AREA_WIDTH, CANVAS_HEIGHT);
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 24px monospace";
      ctx.textAlign = "center";
      ctx.fillText("TAP TO START", PLAY_AREA_WIDTH / 2, CANVAS_HEIGHT / 2 - 20);
      ctx.font = "12px monospace";
      ctx.fillText("or press any key", PLAY_AREA_WIDTH / 2, CANVAS_HEIGHT / 2 + 20);
      ctx.textAlign = "left";
    }

    // Draw game over screen
    if (gs.gameOver) {
      ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
      ctx.fillRect(0, 0, PLAY_AREA_WIDTH, CANVAS_HEIGHT);
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 20px monospace";
      ctx.textAlign = "center";
      ctx.fillText("GAME OVER", PLAY_AREA_WIDTH / 2, CANVAS_HEIGHT / 2 - 40);
      ctx.font = "14px monospace";
      ctx.fillText(`SCORE: ${gs.score}`, PLAY_AREA_WIDTH / 2, CANVAS_HEIGHT / 2);
      ctx.fillText("Click to submit", PLAY_AREA_WIDTH / 2, CANVAS_HEIGHT / 2 + 40);
      ctx.textAlign = "left";
    }
  };

  const gameLoop = () => {
    updateGame();
    drawGame();
    requestAnimationFrame(gameLoop);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const gs = gameStateRef.current;

      if (!gs.hasStarted) {
        gs.hasStarted = true;
        return;
      }

      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
        inputRef.current.left = true;
      }
      if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
        inputRef.current.right = true;
      }
      if (e.key === "ArrowUp" || e.key === "w" || e.key === "W") {
        inputRef.current.up = true;
      }
      if (e.key === "ArrowDown" || e.key === "s" || e.key === "S" || e.key === " ") {
        inputRef.current.down = true;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleCanvasClick = () => {
    const gs = gameStateRef.current;
    if (!gs.hasStarted) {
      gs.hasStarted = true;
    } else if (gs.gameOver) {
      setSubmitOpen(true);
    }
  };

  const handleMobileButton = (action: string) => {
    const gs = gameStateRef.current;
    if (!gs.hasStarted) {
      gs.hasStarted = true;
      return;
    }

    if (action === "left") inputRef.current.left = true;
    if (action === "right") inputRef.current.right = true;
    if (action === "rotate") inputRef.current.up = true;
    if (action === "drop") inputRef.current.down = true;
  };

  const handleSubmitScore = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const scoreData = {
      score: score,
      name: playerName || "Anonymous",
      date: new Date().toISOString().split('T')[0],
      gameId: "puyo",
    };

    try {
      // Try Firebase first
      try {
        const { isFirebaseConfigured, getDatabase } = await import("@/lib/firebase");
        if (isFirebaseConfigured()) {
          const db = await getDatabase();
          if (db) {
            // @ts-ignore
            const { ref, push } = await import("firebase/database");
            await push(ref(db, `leaderboards/puyo`), scoreData);
          }
        }
      } catch (err) {
        console.log("Firebase not available");
      }

      // Always save to localStorage
      const scores = JSON.parse(localStorage.getItem("puyo_scores") || "[]");
      scores.push(scoreData);
      localStorage.setItem("puyo_scores", JSON.stringify(scores));

      setSubmitOpen(false);
      setPlayerName("");
      
      // Reset game
      gameStateRef.current = {
        grid: Array(GRID_HEIGHT).fill(null).map(() => Array(GRID_WIDTH).fill(null)),
        currentPair: null,
        nextPair: null,
        score: 0,
        chainCount: 0,
        level: 1,
        gameOver: false,
        hasStarted: false,
        dropTimer: 0,
        dropRate: 30,
        popAnimations: [],
        chainEffects: [],
        ghostY: 0,
        lockDelayTimer: 0,
        lockDelayMax: 20,
      };
      setScore(0);
      setChain(0);
      setGameOver(false);
    } catch (error) {
      console.error("Error submitting score:", error);
    }
  };

  useEffect(() => {
    const animationId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animationId);
  }, []);

  return (
    <main className="min-h-screen bg-black p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8 text-yellow-400" style={{ textShadow: "2px 2px 0 #666" }}>
          PUYO PUYO
        </h1>

        <div className="flex flex-col lg:flex-row gap-8 justify-center">
          <div className="flex flex-col items-center gap-4">
            <canvas
              ref={canvasRef}
              width={CANVAS_WIDTH}
              height={CANVAS_HEIGHT}
              onClick={handleCanvasClick}
              className="border-4 border-yellow-400 bg-black cursor-pointer"
              style={{
                imageRendering: "crisp-edges",
              }}
            />

            <div className="grid grid-cols-3 gap-2 w-full max-w-sm">
              <button
                onMouseDown={() => handleMobileButton("left")}
                className="px-4 py-3 bg-gray-700 border-2 border-yellow-400 text-white font-bold text-lg hover:bg-gray-600 active:bg-gray-800"
              >
                ◀
              </button>
              <button
                onMouseDown={() => handleMobileButton("drop")}
                className="px-4 py-3 bg-gray-700 border-2 border-yellow-400 text-white font-bold text-lg hover:bg-gray-600 active:bg-gray-800"
              >
                ▼
              </button>
              <button
                onMouseDown={() => handleMobileButton("right")}
                className="px-4 py-3 bg-gray-700 border-2 border-yellow-400 text-white font-bold text-lg hover:bg-gray-600 active:bg-gray-800"
              >
                ▶
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 w-full max-w-sm">
              <button
                onMouseDown={() => handleMobileButton("rotate")}
                className="px-4 py-3 bg-blue-700 border-2 border-yellow-400 text-white font-bold hover:bg-blue-600 active:bg-blue-800"
              >
                ↻ 回転
              </button>
              <button
                onMouseDown={() => handleMobileButton("drop")}
                className="px-4 py-3 bg-red-700 border-2 border-yellow-400 text-white font-bold hover:bg-red-600 active:bg-red-800"
              >
                ⏬ 落下
              </button>
            </div>

            {/* Instructions */}
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
                marginBottom: "30px",
              }}
            >
              <p style={{ marginBottom: "10px", fontWeight: "bold", color: "var(--color-retro-accent)" }}>
                操作:
              </p>
              <ul style={{ marginLeft: "20px", marginBottom: "15px" }}>
                <li>←→矢印キー: 左右移動</li>
                <li>↑矢印キー: 回転</li>
                <li>↓矢印キー: 高速落下</li>
                <li>スマホ: 画面下のボタンで操作</li>
              </ul>

              <p style={{ marginBottom: "10px", fontWeight: "bold", color: "var(--color-retro-accent)" }}>
                ルール:
              </p>
              <ul style={{ marginLeft: "20px" }}>
                <li>同じ色を4つ以上つなげて消そう</li>
                <li>連鎖で大量ポイント獲得</li>
                <li>ぷよが上まで積み上がるとゲームオーバー</li>
              </ul>
            </div>
          </div>

          {submitOpen && gameOver && (
            <div className="flex flex-col items-center gap-4 lg:w-80">
              <form onSubmit={handleSubmitScore} className="w-full">
                <input
                  type="text"
                  name="playerName"
                  placeholder="Your name"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  className="w-full px-4 py-2 border-2 border-yellow-400 bg-gray-900 text-white font-bold mb-4"
                  maxLength={20}
                />
                <button
                  type="submit"
                  className="w-full px-4 py-2 bg-green-700 border-2 border-yellow-400 text-white font-bold hover:bg-green-600 active:bg-green-800"
                >
                  SUBMIT SCORE
                </button>
              </form>
              <button
                onClick={() => setSubmitOpen(false)}
                className="w-full px-4 py-2 bg-gray-700 border-2 border-yellow-400 text-white font-bold hover:bg-gray-600"
              >
                CANCEL
              </button>
            </div>
          )}

          <Leaderboard gameId="puyo" />
        </div>
      </div>
    </main>
  );
}
