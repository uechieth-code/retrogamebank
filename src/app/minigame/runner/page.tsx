"use client";

import { useEffect, useRef, useState } from "react";
import Leaderboard from "../components/Leaderboard";

const CANVAS_WIDTH = 480;
const CANVAS_HEIGHT = 320;
const PLAYER_SIZE = 24;
const GRAVITY = 0.7;
const JUMP_MIN = -10;
const JUMP_MAX = -16;
const GROUND_HEIGHT = 40;
const PIXEL_SCALE = 2;

interface GameState {
  playerY: number;
  playerVelY: number;
  isJumping: boolean;
  score: number;
  gameOver: boolean;
  obstacleSpeed: number;
  obstacleSpawnRate: number;
  hasStarted: boolean;
  frameCount: number;
  cameraShake: number;
  gameOverFlash: number;
}

interface Obstacle {
  x: number;
  y: number;
  width: number;
  height: number;
  type: "box" | "spike" | "tall";
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
}

// Pixel art character drawing
const drawPixelCharacter = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  frameCount: number,
  scale: number
) => {
  // Determine animation frame (2-frame running animation)
  const isFrame1 = Math.floor(frameCount / 8) % 2 === 0;
  
  // Base character body
  const body: [number, number, string][] = [
    // Head
    [8, 2, "#ffd700"],
    [9, 2, "#ffd700"],
    [10, 2, "#ffd700"],
    [11, 2, "#ffd700"],
    
    // Eyes with white highlights
    [9, 3, "#000000"],
    [11, 3, "#000000"],
    [9, 4, "#ffffff"],
    [11, 4, "#ffffff"],
    
    // Body
    [7, 6, "#00d4ff"],
    [8, 6, "#00d4ff"],
    [9, 6, "#00d4ff"],
    [10, 6, "#00d4ff"],
    [11, 6, "#00d4ff"],
    [12, 6, "#00d4ff"],
    
    [7, 7, "#00d4ff"],
    [8, 7, "#ff6b35"],
    [9, 7, "#ff6b35"],
    [10, 7, "#ff6b35"],
    [11, 7, "#ff6b35"],
    [12, 7, "#00d4ff"],
    
    [7, 8, "#00d4ff"],
    [8, 8, "#00d4ff"],
    [9, 8, "#00d4ff"],
    [10, 8, "#00d4ff"],
    [11, 8, "#00d4ff"],
    [12, 8, "#00d4ff"],
    
    [7, 9, "#00d4ff"],
    [8, 9, "#ff6b35"],
    [9, 9, "#ff6b35"],
    [10, 9, "#ff6b35"],
    [11, 9, "#ff6b35"],
    [12, 9, "#00d4ff"],
  ];
  
  // Left arm/leg (animation frame dependent)
  if (isFrame1) {
    body.push(
      [6, 8, "#ff6b35"],
      [6, 9, "#ff6b35"],
      [6, 10, "#ff6b35"],
      [5, 11, "#ff6b35"]
    );
  } else {
    body.push(
      [6, 10, "#ff6b35"],
      [6, 11, "#ff6b35"],
      [5, 12, "#ff6b35"],
      [5, 13, "#ff6b35"]
    );
  }
  
  // Right arm/leg (animation frame dependent - opposite)
  if (!isFrame1) {
    body.push(
      [13, 8, "#ff6b35"],
      [13, 9, "#ff6b35"],
      [13, 10, "#ff6b35"],
      [14, 11, "#ff6b35"]
    );
  } else {
    body.push(
      [13, 10, "#ff6b35"],
      [13, 11, "#ff6b35"],
      [14, 12, "#ff6b35"],
      [14, 13, "#ff6b35"]
    );
  }
  
  // Draw the pixels
  body.forEach(([px, py, color]) => {
    ctx.fillStyle = color;
    ctx.fillRect(x + px * scale, y + py * scale, scale, scale);
  });
  
  // Subtle bounce animation highlight
  const bounceOffset = Math.sin(frameCount / 4) * 1;
  ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
  ctx.fillRect(x + 9 * scale, y + (3 + bounceOffset) * scale, scale * 2, scale);
};

// Draw parallax background layers
const drawBackground = (
  ctx: CanvasRenderingContext2D,
  scrollOffset: number
) => {
  // Sky gradient
  const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT * 0.5);
  gradient.addColorStop(0, "#0a0a2e");
  gradient.addColorStop(1, "#1a1a4a");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  
  // Layer 1: Stars (far background, speed 0.5x)
  ctx.fillStyle = "#ffffff";
  const starSpeed = scrollOffset * 0.5;
  for (let i = 0; i < 8; i++) {
    const starX = ((i * 80 - starSpeed) % CANVAS_WIDTH + CANVAS_WIDTH) % CANVAS_WIDTH;
    ctx.fillRect(starX, 40 + Math.sin(i * 10) * 20, 2, 2);
  }
  
  // Layer 2: Mountains (mid background, speed 1x)
  ctx.fillStyle = "#1a1a3a";
  const mountainSpeed = scrollOffset * 1;
  const mountainBaseY = CANVAS_HEIGHT * 0.35;
  
  for (let i = 0; i < 3; i++) {
    const baseX = i * 200 - (mountainSpeed % 200);
    ctx.beginPath();
    ctx.moveTo(baseX - 20, mountainBaseY);
    ctx.lineTo(baseX + 40, mountainBaseY - 60);
    ctx.lineTo(baseX + 100, mountainBaseY);
    ctx.fill();
  }
  
  // Layer 3: Distant hills shadow
  ctx.fillStyle = "rgba(26, 26, 58, 0.6)";
  for (let i = 0; i < 4; i++) {
    const baseX = i * 150 - (mountainSpeed * 1.2 % 150);
    ctx.beginPath();
    ctx.moveTo(baseX, CANVAS_HEIGHT * 0.45);
    ctx.lineTo(baseX + 50, CANVAS_HEIGHT * 0.35);
    ctx.lineTo(baseX + 100, CANVAS_HEIGHT * 0.45);
    ctx.fill();
  }
};

// Draw ground with texture
const drawGround = (
  ctx: CanvasRenderingContext2D,
  scrollOffset: number
) => {
  const groundY = CANVAS_HEIGHT - GROUND_HEIGHT;
  const groundSpeed = scrollOffset * 2;
  
  // Main ground color
  ctx.fillStyle = "#3a2a1a";
  ctx.fillRect(0, groundY, CANVAS_WIDTH, GROUND_HEIGHT);
  
  // Repeating tile pattern
  const tileWidth = 40;
  for (let i = 0; i < Math.ceil(CANVAS_WIDTH / tileWidth) + 1; i++) {
    const tileX = i * tileWidth - (groundSpeed % tileWidth);
    
    // Alternate tile colors
    if (i % 2 === 0) {
      ctx.fillStyle = "#4a3a2a";
    } else {
      ctx.fillStyle = "#3a2a1a";
    }
    ctx.fillRect(tileX, groundY, tileWidth, GROUND_HEIGHT - 8);
    
    // Grass tufts on top
    ctx.fillStyle = "#5a4a2a";
    for (let j = 0; j < 4; j++) {
      ctx.fillRect(tileX + j * 8 + 2, groundY - 3, 4, 3);
    }
    
    // Brick pattern detail
    ctx.strokeStyle = "rgba(0, 0, 0, 0.3)";
    ctx.lineWidth = 1;
    for (let j = 0; j < 2; j++) {
      ctx.beginPath();
      ctx.moveTo(tileX, groundY + j * 8);
      ctx.lineTo(tileX + tileWidth, groundY + j * 8);
      ctx.stroke();
    }
  }
  
  // Dirt detail at bottom
  ctx.fillStyle = "#2a1a0a";
  ctx.fillRect(0, groundY + GROUND_HEIGHT - 4, CANVAS_WIDTH, 4);
};

// Draw pixel art obstacles
const drawObstacle = (
  ctx: CanvasRenderingContext2D,
  obstacle: Obstacle,
  frameCount: number
) => {
  if (obstacle.type === "box") {
    // Retro TV/Monitor with glow
    ctx.shadowColor = "rgba(255, 107, 53, 0.8)";
    ctx.shadowBlur = 8;
    
    // Main TV body
    ctx.fillStyle = "#2a1a0a";
    ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    
    // Screen
    ctx.fillStyle = "#00ff00";
    ctx.fillRect(obstacle.x + 4, obstacle.y + 4, obstacle.width - 8, obstacle.height - 10);
    
    // Scanlines effect on screen
    ctx.strokeStyle = "rgba(0, 0, 0, 0.3)";
    ctx.lineWidth = 1;
    for (let i = 0; i < obstacle.height - 10; i += 2) {
      ctx.beginPath();
      ctx.moveTo(obstacle.x + 4, obstacle.y + 4 + i);
      ctx.lineTo(obstacle.x + obstacle.width - 4, obstacle.y + 4 + i);
      ctx.stroke();
    }
    
    // Antenna
    ctx.strokeStyle = "#ff6b35";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(obstacle.x + obstacle.width - 4, obstacle.y - 2);
    ctx.lineTo(obstacle.x + obstacle.width + 8, obstacle.y - 12);
    ctx.stroke();
    
    ctx.shadowColor = "transparent";
  } else if (obstacle.type === "spike") {
    // Crystal/Gem with facets
    const centerX = obstacle.x + obstacle.width / 2;
    const centerY = obstacle.y + obstacle.height / 2;
    
    // Sparkle animation
    const sparkle = Math.sin(frameCount / 4) * 0.5 + 0.5;
    ctx.fillStyle = `rgba(255, 215, 0, ${0.4 + sparkle * 0.4})`;
    
    // Top facet
    ctx.beginPath();
    ctx.moveTo(centerX - 6, obstacle.y + 4);
    ctx.lineTo(centerX + 6, obstacle.y + 4);
    ctx.lineTo(centerX, obstacle.y - 4);
    ctx.fill();
    
    ctx.fillStyle = "#ffd700";
    // Middle facet
    ctx.beginPath();
    ctx.moveTo(centerX - 8, centerY - 2);
    ctx.lineTo(centerX + 8, centerY - 2);
    ctx.lineTo(centerX + 6, centerY + 6);
    ctx.lineTo(centerX - 6, centerY + 6);
    ctx.fill();
    
    // Bottom point
    ctx.fillStyle = "#ff9700";
    ctx.beginPath();
    ctx.moveTo(centerX - 4, centerY + 6);
    ctx.lineTo(centerX + 4, centerY + 6);
    ctx.lineTo(centerX, obstacle.y + obstacle.height + 2);
    ctx.fill();
    
    // Highlight
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(centerX - 2, obstacle.y + 2, 2, 4);
  } else if (obstacle.type === "tall") {
    // Tall pillar with decorative pattern
    ctx.fillStyle = "#8b4513";
    ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    
    // Stone pattern
    ctx.strokeStyle = "rgba(0, 0, 0, 0.3)";
    ctx.lineWidth = 1;
    for (let i = 0; i < obstacle.height; i += 6) {
      ctx.beginPath();
      ctx.moveTo(obstacle.x, obstacle.y + i);
      ctx.lineTo(obstacle.x + obstacle.width, obstacle.y + i);
      ctx.stroke();
    }
    
    // Decorative diamond pattern
    ctx.fillStyle = "#d4af37";
    const diamondSpacing = 10;
    for (let i = 0; i < obstacle.height; i += diamondSpacing) {
      ctx.beginPath();
      ctx.moveTo(obstacle.x + obstacle.width / 2 - 3, obstacle.y + i);
      ctx.lineTo(obstacle.x + obstacle.width / 2, obstacle.y + i - 3);
      ctx.lineTo(obstacle.x + obstacle.width / 2 + 3, obstacle.y + i);
      ctx.lineTo(obstacle.x + obstacle.width / 2, obstacle.y + i + 3);
      ctx.fill();
    }
  }
};

// Draw dust particle effect
const drawParticle = (
  ctx: CanvasRenderingContext2D,
  particle: Particle
) => {
  const opacity = particle.life / 100;
  ctx.fillStyle = `rgba(200, 200, 200, ${opacity * 0.6})`;
  ctx.fillRect(particle.x, particle.y, 4, 4);
};

export default function RunnerGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameStateRef = useRef<GameState>({
    playerY: CANVAS_HEIGHT - GROUND_HEIGHT - PLAYER_SIZE - 10,
    playerVelY: 0,
    isJumping: false,
    score: 0,
    gameOver: false,
    obstacleSpeed: 6,
    obstacleSpawnRate: 0.02,
    hasStarted: false,
    frameCount: 0,
    cameraShake: 0,
    gameOverFlash: 0,
  });

  const obstaclesRef = useRef<Obstacle[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const inputRef = useRef({ space: false, touch: false, holdStart: 0 });
  const lastSpawnRef = useRef(0);
  const scrollOffsetRef = useRef(0);
  const touchButtonRef = useRef<HTMLDivElement>(null);

  const [showLeaderboardForm, setShowLeaderboardForm] = useState(false);
  const [playerName, setPlayerName] = useState("");
  const [playerLink, setPlayerLink] = useState("");
  const [finalScore, setFinalScore] = useState(0);

  // Draw function with all visual improvements
  const draw = (ctx: CanvasRenderingContext2D, state: GameState) => {
    // Camera shake offset
    const shakeX = state.cameraShake * (Math.random() - 0.5) * 4;
    const shakeY = state.cameraShake * (Math.random() - 0.5) * 2;
    ctx.save();
    ctx.translate(shakeX, shakeY);

    // Draw background and parallax
    drawBackground(ctx, scrollOffsetRef.current);
    
    // Draw ground
    drawGround(ctx, scrollOffsetRef.current);
    
    // Draw obstacles
    obstaclesRef.current.forEach((obstacle) => {
      drawObstacle(ctx, obstacle, state.frameCount);
    });
    
    // Draw particles
    particlesRef.current.forEach((particle) => {
      drawParticle(ctx, particle);
    });

    // Draw player character with animation
    const playerX = CANVAS_WIDTH / 2 - PLAYER_SIZE / 2;
    drawPixelCharacter(ctx, playerX, state.playerY, state.frameCount, PIXEL_SCALE);

    // Score display
    ctx.restore();
    ctx.fillStyle = "#00d4ff";
    ctx.font = "bold 16px monospace";
    ctx.fillText(`SCORE: ${Math.floor(state.score)}`, 20, 30);

    // Speed display
    ctx.fillStyle = "#00ff88";
    ctx.fillText(`SPD: ${Math.floor(state.obstacleSpeed * 10) / 10}`, 20, 50);

    // Start screen
    if (!state.hasStarted) {
      ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      
      ctx.fillStyle = "#ff6b35";
      ctx.font = "bold 28px monospace";
      ctx.textAlign = "center";
      ctx.fillText("RUNNER", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 60);
      
      ctx.fillStyle = "#00d4ff";
      ctx.font = "16px monospace";
      ctx.fillText("TAP TO START", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 40);
      ctx.fillText("SPACE TO START", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 65);
      ctx.textAlign = "left";
    }

    // Game over screen
    if (state.gameOver) {
      // Flash effect
      const flashOpacity = Math.max(0, state.gameOverFlash / 30);
      ctx.fillStyle = `rgba(255, 107, 53, ${flashOpacity * 0.4})`;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Pulsing "GAME OVER" text
      const pulse = Math.sin(state.frameCount / 8) * 0.2 + 0.8;
      ctx.fillStyle = `rgba(255, 107, 53, ${pulse})`;
      ctx.font = "bold 32px monospace";
      ctx.textAlign = "center";
      ctx.fillText("GAME OVER", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 60);

      ctx.fillStyle = "#00d4ff";
      ctx.font = "bold 18px monospace";
      ctx.fillText(`FINAL SCORE: ${Math.floor(state.score)}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 20);

      ctx.fillStyle = "#00ff88";
      ctx.font = "14px monospace";
      ctx.fillText("TAP TO RESTART / SPACE TO RESTART", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 80);
      ctx.textAlign = "left";
    }

    // Scanline overlay for CRT feel
    ctx.strokeStyle = "rgba(0, 0, 0, 0.1)";
    ctx.lineWidth = 1;
    for (let i = 0; i < CANVAS_HEIGHT; i += 2) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(CANVAS_WIDTH, i);
      ctx.stroke();
    }
  };

  // Game loop
  const gameLoop = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const state = gameStateRef.current;
    state.frameCount++;

    // Reduce camera shake
    if (state.cameraShake > 0) {
      state.cameraShake -= 0.15;
    }

    // Reduce game over flash
    if (state.gameOverFlash > 0) {
      state.gameOverFlash -= 1;
    }

    if (state.hasStarted && !state.gameOver) {
      // Player physics
      state.playerVelY += GRAVITY;
      state.playerY += state.playerVelY;

      // Ground collision
      const groundY = CANVAS_HEIGHT - GROUND_HEIGHT - PLAYER_SIZE;
      if (state.playerY >= groundY) {
        state.playerY = groundY;
        state.playerVelY = 0;
        state.isJumping = false;

        // Create dust particles on land
        if (Math.abs(state.playerVelY) > 2) {
          for (let i = 0; i < 6; i++) {
            particlesRef.current.push({
              x: CANVAS_WIDTH / 2 - PLAYER_SIZE / 2 + Math.random() * PLAYER_SIZE,
              y: state.playerY + PLAYER_SIZE,
              vx: (Math.random() - 0.5) * 4,
              vy: -Math.random() * 3,
              life: 100,
            });
          }
        }
      }

      // Jump input - hold longer for higher jump
      if ((inputRef.current.space || inputRef.current.touch) && !state.isJumping) {
        const holdMs = Date.now() - inputRef.current.holdStart;
        const holdFactor = Math.min(holdMs / 300, 1); // 0~300ms → 0~1
        const jumpStr = JUMP_MIN + (JUMP_MAX - JUMP_MIN) * holdFactor;
        state.playerVelY = jumpStr;
        state.isJumping = true;
        inputRef.current.space = false;
        inputRef.current.touch = false;
      }

      // Score increase
      state.score += 0.1;

      // Difficulty ramp
      if (state.score > 0 && Math.floor(state.score) % 1000 === 0) {
        state.obstacleSpeed += 0.5;
        state.obstacleSpawnRate += 0.003;
      }

      // Spawn obstacles
      lastSpawnRef.current++;
      if (Math.random() < state.obstacleSpawnRate && lastSpawnRef.current > 30) {
        const typeRoll = Math.random();
        const type: "box" | "spike" | "tall" = typeRoll > 0.6 ? "spike" : typeRoll > 0.3 ? "tall" : "box";
        
        obstaclesRef.current.push({
          x: CANVAS_WIDTH,
          y: CANVAS_HEIGHT - GROUND_HEIGHT - (type === "tall" ? 50 : 35),
          width: type === "tall" ? 20 : 30,
          height: type === "tall" ? 50 : 35,
          type,
        });
        lastSpawnRef.current = 0;
      }

      // Update obstacles and collision
      obstaclesRef.current = obstaclesRef.current.filter((obstacle) => {
        obstacle.x -= state.obstacleSpeed;
        scrollOffsetRef.current += state.obstacleSpeed;

        // Collision detection with slight margin
        const playerX = CANVAS_WIDTH / 2 - PLAYER_SIZE / 2 + 4;
        const playerWidth = PLAYER_SIZE - 8;
        const playerCollisionY = state.playerY + 6;
        const playerCollisionHeight = PLAYER_SIZE - 8;

        if (
          playerX < obstacle.x + obstacle.width - 2 &&
          playerX + playerWidth > obstacle.x + 2 &&
          playerCollisionY + playerCollisionHeight > obstacle.y + 2 &&
          playerCollisionY < obstacle.y + obstacle.height - 2
        ) {
          state.gameOver = true;
          state.gameOverFlash = 60;
          state.cameraShake = 1;
          setFinalScore(Math.floor(state.score));
          setShowLeaderboardForm(true);
        }

        return obstacle.x + obstacle.width > 0;
      });

      // Update particles
      particlesRef.current = particlesRef.current.filter((particle) => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.vy += 0.2; // gravity
        particle.life -= 2;
        return particle.life > 0;
      });
    }

    draw(ctx, state);

    if (!state.gameOver) {
      requestAnimationFrame(gameLoop);
    }
  };

  // Restart game
  const restart = () => {
    gameStateRef.current = {
      playerY: CANVAS_HEIGHT - GROUND_HEIGHT - PLAYER_SIZE - 10,
      playerVelY: 0,
      isJumping: false,
      score: 0,
      gameOver: false,
      obstacleSpeed: 6,
      obstacleSpawnRate: 0.02,
      hasStarted: false,
      frameCount: 0,
      cameraShake: 0,
      gameOverFlash: 0,
    };
    obstaclesRef.current = [];
    particlesRef.current = [];
    scrollOffsetRef.current = 0;
    lastSpawnRef.current = 0;
    setShowLeaderboardForm(false);
    setPlayerName("");
    setPlayerLink("");
    gameLoop();
  };

  // Submit score
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

    // Save to localStorage
    const localKey = "leaderboard_runner";
    const existing = JSON.parse(localStorage.getItem(localKey) || "[]");
    existing.push(entry);
    existing.sort((a: any, b: any) => b.score - a.score);
    localStorage.setItem(localKey, JSON.stringify(existing.slice(0, 30)));

    // Try Firebase
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
    const state = gameStateRef.current;

    // Keyboard controls
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        if (!state.hasStarted) {
          state.hasStarted = true;
          gameLoop();
        } else if (!state.gameOver) {
          if (!inputRef.current.space) {
            inputRef.current.holdStart = Date.now();
          }
          inputRef.current.space = true;
        } else {
          restart();
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        inputRef.current.space = false;
      }
    };

    // Touch and click controls
    const handleCanvasTouch = (e: TouchEvent | MouseEvent) => {
      e.preventDefault();

      if (!state.hasStarted) {
        state.hasStarted = true;
        gameLoop();
      } else if (!state.gameOver) {
        inputRef.current.holdStart = Date.now();
        inputRef.current.touch = true;
      } else {
        restart();
      }
    };

    // Touch button handlers
    const handleTouchButtonStart = () => {
      inputRef.current.holdStart = Date.now();
      inputRef.current.touch = true;
      if (touchButtonRef.current) {
        touchButtonRef.current.style.opacity = "0.8";
        touchButtonRef.current.style.backgroundColor = "rgba(0, 212, 255, 0.6)";
      }
    };

    const handleTouchButtonEnd = () => {
      inputRef.current.touch = false;
      if (touchButtonRef.current) {
        touchButtonRef.current.style.opacity = "0.5";
        touchButtonRef.current.style.backgroundColor = "rgba(0, 212, 255, 0.3)";
      }
    };

    const canvas = canvasRef.current;
    if (canvas) {
      canvas.addEventListener("click", handleCanvasTouch);
      canvas.addEventListener("touchstart", handleCanvasTouch, { passive: false });
    }

    const touchBtn = touchButtonRef.current;
    if (touchBtn) {
      touchBtn.addEventListener("touchstart", handleTouchButtonStart, { passive: true });
      touchBtn.addEventListener("touchend", handleTouchButtonEnd, { passive: true });
      touchBtn.addEventListener("mousedown", handleTouchButtonStart);
      touchBtn.addEventListener("mouseup", handleTouchButtonEnd);
      touchBtn.addEventListener("mouseleave", handleTouchButtonEnd);
    }

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    // Initial draw
    gameLoop();

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      if (canvas) {
        canvas.removeEventListener("click", handleCanvasTouch);
        canvas.removeEventListener("touchstart", handleCanvasTouch);
      }
      if (touchBtn) {
        touchBtn.removeEventListener("touchstart", handleTouchButtonStart);
        touchBtn.removeEventListener("touchend", handleTouchButtonEnd);
        touchBtn.removeEventListener("mousedown", handleTouchButtonStart);
        touchBtn.removeEventListener("mouseup", handleTouchButtonEnd);
        touchBtn.removeEventListener("mouseleave", handleTouchButtonEnd);
      }
    };
  }, []);

  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: "var(--color-retro-bg)",
        color: "var(--color-retro-text)",
        fontFamily: "var(--font-family-pixel)",
        padding: "40px 20px",
      }}
    >
      <div
        style={{
          maxWidth: "600px",
          margin: "0 auto",
        }}
      >
        <h1
          style={{
            fontSize: "32px",
            fontWeight: "bold",
            marginBottom: "20px",
            color: "var(--color-retro-accent2)",
            textAlign: "center",
          }}
        >
          ENDLESS RUNNER
        </h1>

        {/* Game Canvas */}
        <div
          style={{
            marginBottom: "20px",
            border: "3px solid var(--color-retro-accent)",
            borderRadius: "8px",
            overflow: "hidden",
            boxShadow: "0 0 20px rgba(0, 212, 255, 0.3)",
          }}
        >
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

        {/* Mobile Touch Button */}
        <div
          ref={touchButtonRef}
          style={{
            width: "100%",
            height: "80px",
            backgroundColor: "rgba(0, 212, 255, 0.3)",
            border: "2px solid var(--color-retro-accent)",
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "24px",
            fontWeight: "bold",
            color: "var(--color-retro-accent)",
            cursor: "pointer",
            userSelect: "none",
            marginBottom: "30px",
            transition: "all 0.1s",
          }}
        >
          JUMP
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
            <li>スペースキー / タップ: ジャンプ（長押しで高くジャンプ）</li>
            <li>ゲームスタート: スペースキー / タップ</li>
          </ul>

          <p style={{ marginBottom: "10px", fontWeight: "bold", color: "var(--color-retro-accent)" }}>
            ルール:
          </p>
          <ul style={{ marginLeft: "20px" }}>
            <li>障害物をかわして走り続けよう</li>
            <li>スコアは走った距離に応じて加算</li>
            <li>障害物に当たるとゲームオーバー</li>
          </ul>
        </div>

        {/* Score Submit Form */}
        {showLeaderboardForm && (
          <div
            style={{
              backgroundColor: "var(--color-retro-card)",
              border: "2px solid var(--color-retro-border)",
              borderRadius: "8px",
              padding: "20px",
              marginBottom: "30px",
            }}
          >
            <h2
              style={{
                fontSize: "18px",
                fontWeight: "bold",
                marginBottom: "15px",
                color: "var(--color-retro-green)",
              }}
            >
              SUBMIT SCORE
            </h2>

            <div style={{ marginBottom: "15px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "5px",
                  fontSize: "13px",
                  color: "var(--color-retro-text-dim)",
                }}
              >
                Player Name (max 10 characters)
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
              <label
                style={{
                  display: "block",
                  marginBottom: "5px",
                  fontSize: "13px",
                  color: "var(--color-retro-text-dim)",
                }}
              >
                SNS/Website URL (optional)
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
                backgroundColor: playerName.trim()
                  ? "var(--color-retro-green)"
                  : "var(--color-retro-text-dim)",
                color: "var(--color-retro-bg)",
                border: "none",
                borderRadius: "4px",
                fontFamily: "var(--font-family-pixel)",
                fontWeight: "bold",
                cursor: playerName.trim() ? "pointer" : "not-allowed",
              }}
            >
              SUBMIT
            </button>
          </div>
        )}

        {/* Leaderboard */}
        <div
          style={{
            backgroundColor: "var(--color-retro-card)",
            border: "2px solid var(--color-retro-border)",
            borderRadius: "8px",
            padding: "20px",
          }}
        >
          <h2
            style={{
              fontSize: "18px",
              fontWeight: "bold",
              marginBottom: "15px",
              color: "var(--color-retro-accent)",
            }}
          >
            LEADERBOARD
          </h2>
          <Leaderboard gameId="runner" />
        </div>
      </div>
    </main>
  );
}
