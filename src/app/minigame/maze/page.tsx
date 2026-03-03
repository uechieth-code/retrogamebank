'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Leaderboard from '../components/Leaderboard';

const GRID_WIDTH = 19;
const GRID_HEIGHT = 15;
const CELL_SIZE = 24;
const CANVAS_WIDTH = 480;
const CANVAS_HEIGHT = 400;

// Maze layouts
const MAZES = [
  `
WWWWWWWWWWWWWWWWWWW
W........W........W
W.WW.WWW.W.WWW.WW.W
W.WW.WWW.W.WWW.WW.W
W.................W
W.WW.W.WWWWW.W.WW.W
W....W...W...W....W
WWWW.WWW.W.WWW.WWWW
W...W.W.......W.W.W
WWWW.W.WW WWW.W.WWWW
W...W.W...W...W.W.W
WWWW.W.WWWWW.W.WWWW
W...W.W.......W.W.W
W.................W
WWWWWWWWWWWWWWWWWWW
  `,
  `
WWWWWWWWWWWWWWWWWWW
W........W........W
W.WWWWW..W..WWWWW.W
W.W.....W.W.....W.W
W.W.WWW.W.W.WWW.W.W
W...W...W.W...W...W
WWW.W.W.W.W.W.W.WWW
W...W.W.....W.W...W
W.WWW.WWWWWWW.WWW.W
W...................W
W.WWW.WWWWWWW.WWW.W
W...W.W.....W.W...W
WWW.W.W.W.W.W.W.WWW
W........W........W
WWWWWWWWWWWWWWWWWWW
  `,
];

interface Position {
  x: number;
  y: number;
}

interface Ghost extends Position {
  id: number;
  color: string;
  highlightColor: string;
  targetX: number;
  targetY: number;
  vulnerable: boolean;
  vulnerableTime: number;
  isEyes: boolean;
  direction: number;
}

const MazeGame: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<'start' | 'playing' | 'gameover' | 'levelclear'>('start');
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(5);
  const [maze, setMaze] = useState<string[][]>([]);
  const [dotsRemaining, setDotsRemaining] = useState(0);
  const [dotsEaten, setDotsEaten] = useState(0);
  const [playerReady, setPlayerReady] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const gameRef = useRef({
    player: { x: 1, y: 1 },
    playerDirection: 0,
    nextDirection: 0,
    ghosts: [] as Ghost[],
    dots: new Set<string>(),
    powerPellets: new Set<string>(),
    gameState: 'start' as 'start' | 'playing' | 'gameover' | 'levelclear',
    level: 1,
    score: 0,
    lives: 5,
    frameCount: 0,
    vulnerable: false,
    vulnerableTimer: 0,
    ghostEatCombo: 0,
    showMessage: '',
    messageTimer: 0,
    levelStartTime: 0,
  });

  const parseMaze = (mazeString: string): string[][] => {
    const lines = mazeString.trim().split('\n');
    const result: string[][] = [];
    for (let i = 0; i < GRID_HEIGHT; i++) {
      const line = lines[i] || '';
      const row: string[] = [];
      for (let j = 0; j < GRID_WIDTH; j++) {
        row.push(line[j] || ' ');
      }
      result.push(row);
    }
    return result;
  };

  const initializeMaze = useCallback((lvl: number) => {
    const mazeIdx = (lvl - 1) % MAZES.length;
    const parsedMaze = parseMaze(MAZES[mazeIdx]);
    setMaze(parsedMaze);

    const dots = new Set<string>();
    const powerPellets = new Set<string>();

    for (let y = 0; y < GRID_HEIGHT; y++) {
      for (let x = 0; x < GRID_WIDTH; x++) {
        const cell = parsedMaze[y][x];
        if (cell === '.') {
          dots.add(`${x},${y}`);
        } else if (cell === 'P') {
          powerPellets.add(`${x},${y}`);
        }
      }
    }

    gameRef.current.dots = dots;
    gameRef.current.powerPellets = powerPellets;
    gameRef.current.level = lvl;
    gameRef.current.player = { x: 1, y: 1 };
    gameRef.current.playerDirection = 0;
    gameRef.current.nextDirection = 0;
    gameRef.current.lives = 5;
    gameRef.current.vulnerable = false;
    gameRef.current.vulnerableTimer = 0;
    gameRef.current.ghostEatCombo = 0;
    gameRef.current.levelStartTime = Date.now();

    const ghostSpeed = 1 + Math.floor((lvl - 1) * 0.1);

    gameRef.current.ghosts = [
      {
        id: 0,
        x: 8,
        y: 7,
        color: '#ff4444',
        highlightColor: '#ff8888',
        targetX: 8,
        targetY: 7,
        vulnerable: false,
        vulnerableTime: 0,
        isEyes: false,
        direction: 0,
      },
      {
        id: 1,
        x: 9,
        y: 7,
        color: '#ff88cc',
        highlightColor: '#ffbbdd',
        targetX: 9,
        targetY: 7,
        vulnerable: false,
        vulnerableTime: 0,
        isEyes: false,
        direction: 0,
      },
      {
        id: 2,
        x: 8,
        y: 8,
        color: '#00d4ff',
        highlightColor: '#88eeff',
        targetX: 8,
        targetY: 8,
        vulnerable: false,
        vulnerableTime: 0,
        isEyes: false,
        direction: 0,
      },
      {
        id: 3,
        x: 9,
        y: 8,
        color: '#ff6b35',
        highlightColor: '#ff9966',
        targetX: 9,
        targetY: 8,
        vulnerable: false,
        vulnerableTime: 0,
        isEyes: false,
        direction: 0,
      },
    ];

    setDotsRemaining(dots.size);
    setDotsEaten(0);
    setLevel(lvl);
  }, []);

  useEffect(() => {
    initializeMaze(1);
  }, [initializeMaze]);

  const isWall = useCallback(
    (x: number, y: number): boolean => {
      if (x < 0 || x >= GRID_WIDTH || y < 0 || y >= GRID_HEIGHT) return true;
      if (maze.length === 0) return true;
      return maze[y][x] === 'W';
    },
    [maze]
  );

  const canMoveTo = useCallback(
    (x: number, y: number): boolean => {
      return !isWall(x, y);
    },
    [isWall]
  );

  const getGhostTarget = (ghostId: number, playerX: number, playerY: number): [number, number] => {
    switch (ghostId) {
      case 0: // Blinky - chase player
        return [playerX, playerY];
      case 1: // Pinky - aim 4 tiles ahead
        const dirs = [[0, -1], [1, 0], [0, 1], [-1, 0]];
        const dir = dirs[gameRef.current.playerDirection] || [0, 0];
        return [playerX + dir[0] * 4, playerY + dir[1] * 4];
      case 2: // Inky - simplified random
        return [Math.floor(Math.random() * GRID_WIDTH), Math.floor(Math.random() * GRID_HEIGHT)];
      case 3: // Clyde - random vs scatter
        const dist = Math.abs(playerX - gameRef.current.ghosts[3].x) + Math.abs(playerY - gameRef.current.ghosts[3].y);
        return dist > 8 ? [playerX, playerY] : [GRID_WIDTH - 2, 2];
      default:
        return [playerX, playerY];
    }
  };

  const updateGame = useCallback(() => {
    if (gameRef.current.gameState !== 'playing') return;

    gameRef.current.frameCount++;

    // Handle vulnerable timer
    if (gameRef.current.vulnerable) {
      gameRef.current.vulnerableTimer--;
      if (gameRef.current.vulnerableTimer <= 0) {
        gameRef.current.vulnerable = false;
        gameRef.current.ghostEatCombo = 0;
        gameRef.current.ghosts.forEach((g) => {
          g.vulnerable = false;
        });
      }
    }

    // Move player
    const dirs = [[0, -1], [1, 0], [0, 1], [-1, 0]];
    let newX = gameRef.current.player.x;
    let newY = gameRef.current.player.y;

    const nextDir = dirs[gameRef.current.nextDirection] || [0, 0];
    if (canMoveTo(gameRef.current.player.x + nextDir[0], gameRef.current.player.y + nextDir[1])) {
      gameRef.current.playerDirection = gameRef.current.nextDirection;
    }

    const currentDir = dirs[gameRef.current.playerDirection] || [0, 0];
    if (canMoveTo(gameRef.current.player.x + currentDir[0], gameRef.current.player.y + currentDir[1])) {
      newX += currentDir[0];
      newY += currentDir[1];
    }

    gameRef.current.player = { x: newX, y: newY };

    // Collect dots
    const dotKey = `${newX},${newY}`;
    if (gameRef.current.dots.has(dotKey)) {
      gameRef.current.dots.delete(dotKey);
      gameRef.current.score += 10;
      setScore(gameRef.current.score);
      setDotsEaten((prev) => prev + 1);
      setDotsRemaining((prev) => prev - 1);
    }

    // Collect power pellets
    if (gameRef.current.powerPellets.has(dotKey)) {
      gameRef.current.powerPellets.delete(dotKey);
      gameRef.current.score += 50;
      setScore(gameRef.current.score);
      gameRef.current.vulnerable = true;
      gameRef.current.vulnerableTimer = 720; // 12 seconds at 60fps (50% longer)
      gameRef.current.ghostEatCombo = 0;
      gameRef.current.ghosts.forEach((g) => {
        g.vulnerable = true;
        g.vulnerableTime = 720;
      });
    }

    // Check for fruit spawn (at 70 dots eaten)
    // Fruit logic simplified for this implementation

    // Update ghost AI and movement (every 3 frames for slower movement)
    if (gameRef.current.frameCount % 3 === 0) {
      gameRef.current.ghosts.forEach((ghost) => {
        const [targetX, targetY] = getGhostTarget(ghost.id, gameRef.current.player.x, gameRef.current.player.y);

        // Simple pathfinding - pick direction closest to target
        const bestDir = 0;
        let bestDist = Infinity;

        for (let d = 0; d < 4; d++) {
          const dir = dirs[d];
          const nx = ghost.x + dir[0];
          const ny = ghost.y + dir[1];

          if (!canMoveTo(nx, ny)) continue;

          const dist = Math.abs(nx - targetX) + Math.abs(ny - targetY);
          if (dist < bestDist) {
            bestDist = dist;
            ghost.direction = d;
          }
        }

        const dir = dirs[ghost.direction] || [0, 0];
        const newGhostX = ghost.x + dir[0];
        const newGhostY = ghost.y + dir[1];

        if (canMoveTo(newGhostX, newGhostY)) {
          ghost.x = newGhostX;
          ghost.y = newGhostY;
        }
      });
    }

    // Check collision with ghosts
    for (const ghost of gameRef.current.ghosts) {
      if (ghost.x === gameRef.current.player.x && ghost.y === gameRef.current.player.y) {
        if (ghost.vulnerable) {
          ghost.vulnerable = false;
          ghost.isEyes = true;
          ghost.x = 9;
          ghost.y = 7;
          gameRef.current.ghostEatCombo++;
          const points = 200 * Math.pow(2, gameRef.current.ghostEatCombo - 1);
          gameRef.current.score += points;
          setScore(gameRef.current.score);
        } else if (!ghost.isEyes) {
          gameRef.current.lives--;
          setLives(gameRef.current.lives);
          gameRef.current.player = { x: 1, y: 1 };

          if (gameRef.current.lives <= 0) {
            gameRef.current.gameState = 'gameover';
            setGameState('gameover');
          }
        }
      }
    }

    // Check level clear
    if (gameRef.current.dots.size === 0 && gameRef.current.powerPellets.size === 0) {
      const bonusPoints = 1000 * gameRef.current.level;
      gameRef.current.score += bonusPoints;
      setScore(gameRef.current.score);
      gameRef.current.gameState = 'levelclear';
      setGameState('levelclear');
    }
  }, [canMoveTo]);

  const gameLoop = useCallback(() => {
    updateGame();

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#0a0a0f';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw offset to center maze
    const offsetX = (CANVAS_WIDTH - GRID_WIDTH * CELL_SIZE) / 2;
    const offsetY = (CANVAS_HEIGHT - GRID_HEIGHT * CELL_SIZE) / 2;

    ctx.save();
    ctx.translate(offsetX, offsetY);

    // Draw maze walls
    ctx.fillStyle = '#2222ff';
    for (let y = 0; y < GRID_HEIGHT; y++) {
      for (let x = 0; x < GRID_WIDTH; x++) {
        if (maze[y] && maze[y][x] === 'W') {
          ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);

          // Add highlight edges for SFC look
          ctx.strokeStyle = '#6666ff';
          ctx.lineWidth = 1;
          ctx.strokeRect(x * CELL_SIZE + 1, y * CELL_SIZE + 1, CELL_SIZE - 2, CELL_SIZE - 2);
        }
      }
    }

    // Draw dots
    ctx.fillStyle = '#ffffff';
    for (const dotKey of gameRef.current.dots) {
      const [x, y] = dotKey.split(',').map(Number);
      ctx.beginPath();
      ctx.arc(x * CELL_SIZE + CELL_SIZE / 2, y * CELL_SIZE + CELL_SIZE / 2, 2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Draw power pellets (pulsing)
    const pulseSize = 3 + Math.sin(gameRef.current.frameCount / 10) * 1.5;
    ctx.fillStyle = '#ffff00';
    for (const pelletKey of gameRef.current.powerPellets) {
      const [x, y] = pelletKey.split(',').map(Number);
      ctx.beginPath();
      ctx.arc(x * CELL_SIZE + CELL_SIZE / 2, y * CELL_SIZE + CELL_SIZE / 2, pulseSize, 0, Math.PI * 2);
      ctx.fill();
    }

    // Draw player
    const playerX = gameRef.current.player.x * CELL_SIZE + CELL_SIZE / 2;
    const playerY = gameRef.current.player.y * CELL_SIZE + CELL_SIZE / 2;

    ctx.fillStyle = '#ffff00';
    const mouthFrame = Math.floor((gameRef.current.frameCount / 5) % 3);
    const mouthAngle = mouthFrame === 0 ? 0 : mouthFrame === 1 ? 0.3 : 0.1;

    ctx.beginPath();
    ctx.arc(playerX, playerY, 6, mouthAngle, Math.PI * 2 - mouthAngle, false);
    ctx.lineTo(playerX, playerY);
    ctx.closePath();
    ctx.fill();

    // Draw eyes
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(playerX - 3, playerY - 2, 2, 2);
    ctx.fillRect(playerX + 1, playerY - 2, 2, 2);
    ctx.fillStyle = '#000000';
    ctx.fillRect(playerX - 2.5, playerY - 1.5, 1, 1);
    ctx.fillRect(playerX + 1.5, playerY - 1.5, 1, 1);

    // Draw ghosts
    for (const ghost of gameRef.current.ghosts) {
      const gx = ghost.x * CELL_SIZE + CELL_SIZE / 2;
      const gy = ghost.y * CELL_SIZE + CELL_SIZE / 2;

      if (ghost.isEyes) {
        // Draw eyes only
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(gx - 3, gy - 2, 2, 2);
        ctx.fillRect(gx + 1, gy - 2, 2, 2);
        ctx.fillStyle = '#0000ff';
        ctx.fillRect(gx - 2.5, gy - 1.5, 1, 1);
        ctx.fillRect(gx + 1.5, gy - 1.5, 1, 1);
      } else {
        // Draw ghost body
        const bodyColor = ghost.vulnerable ? '#2222aa' : ghost.color;
        ctx.fillStyle = bodyColor;
        ctx.beginPath();
        ctx.arc(gx, gy - 2, 6, Math.PI, 0, false);
        ctx.lineTo(gx + 6, gy + 2);
        ctx.lineTo(gx + 4, gy);
        ctx.lineTo(gx + 2, gy + 2);
        ctx.lineTo(gx, gy);
        ctx.lineTo(gx - 2, gy + 2);
        ctx.lineTo(gx - 4, gy);
        ctx.lineTo(gx - 6, gy + 2);
        ctx.closePath();
        ctx.fill();

        // Draw eyes
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(gx - 3, gy - 2, 2, 2);
        ctx.fillRect(gx + 1, gy - 2, 2, 2);

        const pupilColor = ghost.vulnerable ? '#ffffff' : '#0000ff';
        ctx.fillStyle = pupilColor;
        ctx.fillRect(gx - 2.5, gy - 1.5, 1, 1);
        ctx.fillRect(gx + 1.5, gy - 1.5, 1, 1);
      }
    }

    ctx.restore();
  }, [maze, updateGame]);

  useEffect(() => {
    const interval = setInterval(gameLoop, 1000 / 60);
    return () => clearInterval(interval);
  }, [gameLoop]);

  const handleKeyDown = (e: KeyboardEvent) => {
    const key = e.key.toUpperCase();
    if (key === 'ARROWUP' || key === 'W') {
      gameRef.current.nextDirection = 0;
      e.preventDefault();
    } else if (key === 'ARROWRIGHT' || key === 'D') {
      gameRef.current.nextDirection = 1;
      e.preventDefault();
    } else if (key === 'ARROWDOWN' || key === 'S') {
      gameRef.current.nextDirection = 2;
      e.preventDefault();
    } else if (key === 'ARROWLEFT' || key === 'A') {
      gameRef.current.nextDirection = 3;
      e.preventDefault();
    } else if (key === 'ENTER' && gameRef.current.gameState === 'start') {
      gameRef.current.gameState = 'playing';
      setGameState('playing');
      e.preventDefault();
    }
  };

  const handleDPadButton = (direction: number) => {
    gameRef.current.nextDirection = direction;
  };

  const startGame = () => {
    gameRef.current.gameState = 'playing';
    setGameState('playing');
    setPlayerReady(true);
  };

  const nextLevel = () => {
    initializeMaze(level + 1);
    gameRef.current.gameState = 'playing';
    setGameState('playing');
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 p-4">
      <div className="w-full max-w-md">
        <h1 className="text-4xl font-bold text-yellow-400 text-center mb-4">DOT EATER</h1>

        <div className="relative bg-black border-4 border-purple-600" style={{ width: CANVAS_WIDTH, height: CANVAS_HEIGHT }}>
          <canvas
            ref={canvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            className="block w-full"
          />

          {gameState === 'start' && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-80">
              <div className="text-center">
                <div className="text-4xl font-bold text-yellow-400 mb-8">READY?</div>
                <button
                  onClick={startGame}
                  className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-3 px-8 rounded text-lg"
                >
                  START
                </button>
              </div>
            </div>
          )}

          {gameState === 'levelclear' && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-80">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-400 mb-4">LEVEL CLEAR!</div>
                <div className="text-xl text-white mb-8">Level {level}</div>
                <button
                  onClick={nextLevel}
                  className="bg-green-400 hover:bg-green-500 text-black font-bold py-3 px-8 rounded text-lg"
                >
                  NEXT LEVEL
                </button>
              </div>
            </div>
          )}

          {gameState === 'gameover' && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-80">
              <div className="text-center">
                <div className="text-4xl font-bold text-red-400 mb-8">GAME OVER</div>
                <div className="text-2xl text-white mb-8">Final Score: {score}</div>
                <button
                  onClick={() => {
                    initializeMaze(1);
                    setGameState('start');
                    setScore(0);
                    setLives(5);
                    setSubmitted(false);
                  }}
                  className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-3 px-8 rounded text-lg"
                >
                  PLAY AGAIN
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="mt-4 bg-gray-800 p-4 rounded-lg border-2 border-purple-600">
          <div className="grid grid-cols-3 gap-2 text-center text-white mb-4">
            <div>
              <div className="text-sm text-gray-400">SCORE</div>
              <div className="text-2xl font-bold text-yellow-400">{score}</div>
            </div>
            <div>
              <div className="text-sm text-gray-400">LEVEL</div>
              <div className="text-2xl font-bold text-green-400">{level}</div>
            </div>
            <div>
              <div className="text-sm text-gray-400">LIVES</div>
              <div className="text-2xl font-bold text-red-400">{lives}</div>
            </div>
          </div>

          <div className="text-center text-white mb-4">
            <div className="text-sm text-gray-400">Dots: {dotsRemaining}</div>
          </div>

          {/* D-Pad Controls */}
          <div className="flex justify-center mb-4">
            <div className="inline-block">
              <div className="flex justify-center mb-1">
                <button
                  onMouseDown={() => handleDPadButton(0)}
                  className="w-12 h-12 bg-red-600 hover:bg-red-700 rounded flex items-center justify-center text-white font-bold"
                  title="Up"
                >
                  ▲
                </button>
              </div>
              <div className="flex gap-1 justify-center mb-1">
                <button
                  onMouseDown={() => handleDPadButton(3)}
                  className="w-12 h-12 bg-red-600 hover:bg-red-700 rounded flex items-center justify-center text-white font-bold"
                  title="Left"
                >
                  ◀
                </button>
                <button
                  onMouseDown={() => handleDPadButton(2)}
                  className="w-12 h-12 bg-red-600 hover:bg-red-700 rounded flex items-center justify-center text-white font-bold"
                  title="Down"
                >
                  ▼
                </button>
                <button
                  onMouseDown={() => handleDPadButton(1)}
                  className="w-12 h-12 bg-red-600 hover:bg-red-700 rounded flex items-center justify-center text-white font-bold"
                  title="Right"
                >
                  ▶
                </button>
              </div>
            </div>
          </div>

          <div className="text-center text-sm text-gray-400">
            Use arrow keys or WASD to move
          </div>
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
            marginTop: "20px",
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          <p style={{ marginBottom: "10px", fontWeight: "bold", color: "var(--color-retro-accent)" }}>
            操作:
          </p>
          <ul style={{ marginLeft: "20px", marginBottom: "15px" }}>
            <li>↑↓←→矢印キー: 移動</li>
            <li>スマホ: D-padボタンで操作</li>
          </ul>

          <p style={{ marginBottom: "10px", fontWeight: "bold", color: "var(--color-retro-accent)" }}>
            ルール:
          </p>
          <ul style={{ marginLeft: "20px" }}>
            <li>全てのドットを集めてステージクリア</li>
            <li>ゴーストに触れるとミス</li>
            <li>パワーエサを取るとゴーストを食べられる</li>
          </ul>
        </div>

        {playerReady && gameState === 'gameover' && !submitted && (
          <Leaderboard
            gameId="maze"
          />
        )}
      </div>
    </div>
  );
};

export default MazeGame;
