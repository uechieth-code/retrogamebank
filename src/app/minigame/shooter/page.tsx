"use client";

import { useEffect, useRef, useState } from "react";
import Leaderboard from "../components/Leaderboard";

const CANVAS_WIDTH = 480;
const CANVAS_HEIGHT = 400;

interface Player {
  x: number;
  y: number;
  width: number;
  height: number;
  health: number;
  invincibility: number;
  tilt: number;
}

interface Enemy {
  x: number;
  y: number;
  width: number;
  height: number;
  type: "normal" | "strong" | "boss";
  health: number;
  maxHealth: number;
  spawnTime: number;
  shootTimer: number;
}

interface Bullet {
  x: number;
  y: number;
  vx: number;
  vy: number;
  isPlayerBullet: boolean;
}

interface EnemyBullet {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

interface PowerUp {
  x: number;
  y: number;
  type: "health" | "rapid";
  spinAngle: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
}

interface GameState {
  player: Player;
  enemies: Enemy[];
  bullets: Bullet[];
  enemyBullets: EnemyBullet[];
  powerups: PowerUp[];
  particles: Particle[];
  score: number;
  lives: number;
  wave: number;
  gameOver: boolean;
  level: number;
  enemySpawnRate: number;
  waveTransition: number;
  screenShake: number;
  lastWaveAnnounce: number;
  stars: Array<{ x: number; y: number; size: number; speed: number; layer: number; brightness: number }>;
}

// Pixel art drawing utilities
const drawPixelShip = (ctx: CanvasRenderingContext2D, x: number, y: number, tilt: number = 0) => {
  ctx.save();
  ctx.translate(x + 16, y + 12);
  ctx.rotate(tilt);
  ctx.translate(-16, -12);

  const pixelData = [
    [0, 0, 1, 1, 0, 0],
    [0, 2, 2, 2, 2, 0],
    [1, 2, 3, 3, 2, 1],
    [1, 2, 3, 3, 2, 1],
    [0, 2, 2, 2, 2, 0],
    [1, 1, 4, 4, 1, 1],
  ];

  const colors = {
    0: "transparent",
    1: "#ff6b35", // Wing accent
    2: "#00d4ff", // Body
    3: "#00ff88", // Cockpit window
    4: "#ffd700", // Engine
  };

  pixelData.forEach((row, py) => {
    row.forEach((pixel, px) => {
      if (pixel !== 0) {
        ctx.fillStyle = colors[pixel as keyof typeof colors];
        ctx.fillRect(x + px * 4 + 2, y + py * 4, 4, 4);
      }
    });
  });

  // Engine glow
  ctx.fillStyle = "rgba(255, 200, 0, 0.6)";
  ctx.fillRect(x + 8, y + 24, 16, 4);
  ctx.fillStyle = "rgba(255, 100, 0, 0.4)";
  ctx.fillRect(x + 6, y + 28, 20, 2);

  ctx.restore();
};

const drawNormalEnemy = (ctx: CanvasRenderingContext2D, x: number, y: number, frame: number) => {
  // Body
  ctx.fillStyle = "#ff6b35";
  ctx.fillRect(x + 3, y + 2, 10, 12);

  // Head
  ctx.fillRect(x + 2, y, 12, 4);

  // Eyes
  ctx.fillStyle = "#ffd700";
  const eyeOffset = Math.sin(frame * 0.2) * 1;
  ctx.fillRect(x + 4, y + 1 + eyeOffset, 2, 2);
  ctx.fillRect(x + 10, y + 1 + eyeOffset, 2, 2);

  // Antennae
  ctx.strokeStyle = "#ff6b35";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x + 6, y);
  ctx.lineTo(x + 5, y - 3);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + 10, y);
  ctx.lineTo(x + 11, y - 3);
  ctx.stroke();

  // Wings flutter
  ctx.fillStyle = "#ff6b35";
  const wingFlap = Math.abs(Math.sin(frame * 0.3)) * 2;
  ctx.fillRect(x - 1, y + 4, 2, 6 + wingFlap);
  ctx.fillRect(x + 15, y + 4, 2, 6 + wingFlap);
};

const drawStrongEnemy = (ctx: CanvasRenderingContext2D, x: number, y: number, health: number, maxHealth: number) => {
  // Armored body
  ctx.fillStyle = "#a855f7";
  ctx.fillRect(x + 2, y + 2, 16, 16);

  // Shield plates
  ctx.fillStyle = "#cc88ff";
  ctx.fillRect(x + 1, y + 3, 2, 6);
  ctx.fillRect(x + 17, y + 3, 2, 6);
  ctx.fillRect(x + 5, y, 10, 2);

  // Core highlight
  ctx.fillStyle = "#ffd700";
  ctx.fillRect(x + 8, y + 8, 4, 4);

  // Flash if just hit
  if (health < maxHealth * 0.5) {
    ctx.strokeStyle = "rgba(255, 200, 100, 0.8)";
    ctx.lineWidth = 1;
    ctx.strokeRect(x + 2, y + 2, 16, 16);
  }
};

const drawBossEnemy = (ctx: CanvasRenderingContext2D, x: number, y: number, health: number, maxHealth: number, frame: number) => {
  // Main body
  ctx.fillStyle = "#ff4444";
  ctx.fillRect(x + 6, y + 8, 28, 20);

  // Side armor
  ctx.fillStyle = "#cc2222";
  ctx.fillRect(x + 2, y + 12, 4, 12);
  ctx.fillRect(x + 34, y + 12, 4, 12);

  // Pulsing core
  const corePulse = Math.sin(frame * 0.15) * 2 + 3;
  ctx.fillStyle = "#ffd700";
  ctx.fillRect(x + 16 - corePulse / 2, y + 16 - corePulse / 2, 8 + corePulse, 8 + corePulse);

  // Core inner glow
  ctx.fillStyle = "rgba(255, 200, 0, 0.6)";
  ctx.fillRect(x + 18 - corePulse / 4, y + 18 - corePulse / 4, 4 + corePulse / 2, 4 + corePulse / 2);

  // Top gun ports
  ctx.fillStyle = "#333";
  ctx.fillRect(x + 12, y + 5, 3, 3);
  ctx.fillRect(x + 25, y + 5, 3, 3);

  // Health bar above boss
  const barWidth = 30;
  const barHeight = 3;
  ctx.fillStyle = "#333";
  ctx.fillRect(x + 5, y - 8, barWidth, barHeight);
  ctx.fillStyle = health > maxHealth * 0.5 ? "#00ff88" : "#ff6b35";
  ctx.fillRect(x + 5, y - 8, (health / maxHealth) * barWidth, barHeight);
  ctx.strokeStyle = "#fff";
  ctx.lineWidth = 1;
  ctx.strokeRect(x + 5, y - 8, barWidth, barHeight);
};

const createExplosion = (x: number, y: number): Particle[] => {
  const particles: Particle[] = [];
  const count = Math.random() > 0.5 ? 10 : 12;
  const colors = ["#ffd700", "#ff6b35", "#ff4444"];
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2;
    const speed = 2 + Math.random() * 3;
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 1,
      color: colors[Math.floor(Math.random() * colors.length)],
    });
  }
  return particles;
};

const drawStars = (ctx: CanvasRenderingContext2D, stars: GameState["stars"], offset: number) => {
  stars.forEach((star) => {
    const scrollY = (offset * star.speed) % CANVAS_HEIGHT;
    const y = (star.y + scrollY) % CANVAS_HEIGHT;
    ctx.fillStyle = `rgba(150, 200, 255, ${star.brightness * 0.7})`;
    ctx.beginPath();
    ctx.arc(star.x, y, star.size, 0, Math.PI * 2);
    ctx.fill();
  });
};

const drawNebula = (ctx: CanvasRenderingContext2D, offset: number) => {
  const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
  gradient.addColorStop(0, "rgba(100, 50, 150, 0.1)");
  gradient.addColorStop(0.5, "rgba(50, 100, 150, 0.1)");
  gradient.addColorStop(1, "rgba(100, 100, 50, 0.1)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, offset % CANVAS_HEIGHT, CANVAS_WIDTH, CANVAS_HEIGHT);
  ctx.fillRect(0, (offset % CANVAS_HEIGHT) - CANVAS_HEIGHT, CANVAS_WIDTH, CANVAS_HEIGHT);
};

export default function ShooterGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameStateRef = useRef<GameState>({
    player: {
      x: CANVAS_WIDTH / 2 - 16,
      y: CANVAS_HEIGHT - 80,
      width: 32,
      height: 24,
      health: 100,
      invincibility: 0,
      tilt: 0,
    },
    enemies: [],
    bullets: [],
    enemyBullets: [],
    powerups: [],
    particles: [],
    score: 0,
    lives: 3,
    wave: 1,
    gameOver: false,
    level: 1,
    enemySpawnRate: 0.02,
    waveTransition: 0,
    screenShake: 0,
    lastWaveAnnounce: 0,
    stars: Array.from({ length: 30 }, () => ({
      x: Math.random() * CANVAS_WIDTH,
      y: Math.random() * CANVAS_HEIGHT,
      size: Math.random() * 0.5 + 0.3,
      speed: Math.random() * 0.3 + 0.1,
      layer: Math.floor(Math.random() * 3),
      brightness: Math.random() * 0.5 + 0.5,
    })),
  });

  const inputRef = useRef({ left: false, right: false, shoot: false });
  const shotTimerRef = useRef(0);
  const waveTimerRef = useRef(0);
  const rapidFireRef = useRef(false);
  const scrollOffsetRef = useRef(0);
  const frameCountRef = useRef(0);

  const [showLeaderboardForm, setShowLeaderboardForm] = useState(false);
  const [playerName, setPlayerName] = useState("");
  const [playerLink, setPlayerLink] = useState("");
  const [finalScore, setFinalScore] = useState(0);
  const [autoFire, setAutoFire] = useState(false);

  const draw = (ctx: CanvasRenderingContext2D, state: GameState, frameCount: number) => {
    // Background
    ctx.fillStyle = "#0a0a1a";
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Stars
    drawStars(ctx, state.stars.filter((s) => s.layer === 0), scrollOffsetRef.current * 0.3);
    drawNebula(ctx, scrollOffsetRef.current * 0.5);
    drawStars(ctx, state.stars.filter((s) => s.layer === 1), scrollOffsetRef.current * 0.7);
    drawStars(ctx, state.stars.filter((s) => s.layer === 2), scrollOffsetRef.current);

    scrollOffsetRef.current += 0.5;

    // Scanlines
    ctx.strokeStyle = "rgba(42, 42, 58, 0.2)";
    ctx.lineWidth = 1;
    for (let i = 0; i < CANVAS_HEIGHT; i += 3) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(CANVAS_WIDTH, i);
      ctx.stroke();
    }

    // Apply screen shake
    if (state.screenShake > 0) {
      ctx.save();
      const shake = Math.random() * state.screenShake - state.screenShake / 2;
      ctx.translate(shake, Math.random() * state.screenShake - state.screenShake / 2);
    }

    // Draw enemies
    state.enemies.forEach((enemy) => {
      if (enemy.type === "normal") {
        drawNormalEnemy(ctx, enemy.x, enemy.y, frameCount);
      } else if (enemy.type === "strong") {
        drawStrongEnemy(ctx, enemy.x, enemy.y, enemy.health, enemy.maxHealth);
      } else {
        drawBossEnemy(ctx, enemy.x, enemy.y, enemy.health, enemy.maxHealth, frameCount);
      }
    });

    // Draw player bullets with trail effect
    state.bullets.forEach((bullet) => {
      if (bullet.isPlayerBullet) {
        // Trail
        ctx.fillStyle = "rgba(0, 255, 136, 0.3)";
        ctx.fillRect(bullet.x - 1, bullet.y - 8, 2, 8);
        // Core
        ctx.fillStyle = "#00ff88";
        ctx.fillRect(bullet.x - 1, bullet.y - 2, 2, 2);
      }
    });

    // Draw enemy bullets
    state.enemyBullets.forEach((bullet) => {
      ctx.fillStyle = "#ff4444";
      ctx.beginPath();
      ctx.arc(bullet.x, bullet.y, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(255, 68, 68, 0.4)";
      ctx.beginPath();
      ctx.arc(bullet.x, bullet.y, 4, 0, Math.PI * 2);
      ctx.fill();
    });

    // Draw particles
    state.particles.forEach((particle) => {
      ctx.globalAlpha = particle.life;
      ctx.fillStyle = particle.color;
      ctx.fillRect(particle.x, particle.y, 2, 2);
      ctx.globalAlpha = 1;
    });

    // Draw power-ups with spin
    state.powerups.forEach((powerup) => {
      ctx.save();
      ctx.translate(powerup.x + 8, powerup.y + 8);
      ctx.rotate(powerup.spinAngle);

      if (powerup.type === "health") {
        // Heart shape (simplified)
        ctx.fillStyle = "#00ff88";
        ctx.fillRect(-3, -6, 2, 8);
        ctx.fillRect(1, -6, 2, 8);
        ctx.fillRect(-5, -3, 10, 6);
      } else {
        // Lightning bolt
        ctx.fillStyle = "#ffd700";
        ctx.beginPath();
        ctx.moveTo(-2, -6);
        ctx.lineTo(1, -2);
        ctx.lineTo(-1, -1);
        ctx.lineTo(2, 6);
        ctx.lineTo(0, 1);
        ctx.lineTo(-2, 1);
        ctx.closePath();
        ctx.fill();
      }

      // Glow
      ctx.globalAlpha = 0.4;
      ctx.strokeStyle = powerup.type === "health" ? "#00ff88" : "#ffd700";
      ctx.lineWidth = 1;
      ctx.strokeRect(-6, -6, 12, 12);
      ctx.globalAlpha = 1;

      ctx.restore();
    });

    // Draw player with invincibility flash
    if (state.player.invincibility <= 0 || Math.floor(frameCount / 5) % 2 === 0) {
      drawPixelShip(ctx, state.player.x, state.player.y, state.player.tilt);
    }

    // Restore context if shaking
    if (state.screenShake > 0) {
      ctx.restore();
    }

    // HUD with gradient health bar
    ctx.fillStyle = "#00d4ff";
    ctx.font = "bold 12px monospace";
    ctx.textAlign = "left";

    // Wave
    ctx.fillText(`WAVE: ${state.wave}`, 15, 25);

    // Score with digit styling
    ctx.fillText(`SCORE: ${String(state.score).padStart(6, "0")}`, 15, 40);

    // Level
    ctx.fillText(`LV: ${state.level}`, CANVAS_WIDTH - 85, 25);

    // Health bar
    const barX = CANVAS_WIDTH - 85;
    const barY = 32;
    const barWidth = 70;
    const barHeight = 8;

    ctx.fillStyle = "#333";
    ctx.fillRect(barX, barY, barWidth, barHeight);

    const healthPercent = state.player.health / 100;
    const healthColor =
      healthPercent > 0.6 ? "#00ff88" : healthPercent > 0.3 ? "#ffd700" : "#ff6b35";
    ctx.fillStyle = healthColor;
    ctx.fillRect(barX + 1, barY + 1, (barWidth - 2) * healthPercent, barHeight - 2);

    ctx.strokeStyle = "#00d4ff";
    ctx.lineWidth = 1;
    ctx.strokeRect(barX, barY, barWidth, barHeight);

    ctx.fillText(`${Math.floor(state.player.health)}HP`, barX, barY - 2);

    // Lives as ship icons
    ctx.fillStyle = "#00d4ff";
    let livesX = 15;
    ctx.fillText("LIVES:", livesX, CANVAS_HEIGHT - 20);
    livesX += 45;
    for (let i = 0; i < state.lives; i++) {
      drawPixelShip(ctx, livesX + i * 25, CANVAS_HEIGHT - 40, 0);
    }

    // Wave transition announcement
    if (state.waveTransition > 0) {
      const alpha = Math.min(1, state.waveTransition / 30);
      ctx.globalAlpha = Math.sin(alpha * Math.PI) * 0.8;
      ctx.fillStyle = "#00ff88";
      ctx.font = "bold 32px monospace";
      ctx.textAlign = "center";
      ctx.fillText(`WAVE ${state.wave}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
      ctx.globalAlpha = 1;
    }

    // Game over
    if (state.gameOver) {
      ctx.fillStyle = "rgba(0, 0, 0, 0.85)";
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      ctx.fillStyle = "#ff6b35";
      ctx.font = "bold 28px monospace";
      ctx.textAlign = "center";
      ctx.fillText("GAME OVER", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 40);

      ctx.fillStyle = "#00d4ff";
      ctx.font = "bold 16px monospace";
      ctx.fillText(`FINAL SCORE: ${String(state.score).padStart(6, "0")}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 10);
      ctx.fillText("Press R to restart or submit", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 35);

      ctx.textAlign = "left";
    }
  };

  const gameLoop = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const state = gameStateRef.current;
    frameCountRef.current++;

    if (!state.gameOver) {
      // Player movement with tilt
      if (inputRef.current.left && state.player.x > 0) {
        state.player.x -= 5;
        state.player.tilt = Math.max(state.player.tilt - 0.1, -0.3);
      } else if (inputRef.current.right && state.player.x + state.player.width < CANVAS_WIDTH) {
        state.player.x += 5;
        state.player.tilt = Math.min(state.player.tilt + 0.1, 0.3);
      } else {
        state.player.tilt *= 0.9; // Return to neutral
      }

      // Shooting
      shotTimerRef.current++;
      const shotRate = rapidFireRef.current ? 4 : 8;
      if ((inputRef.current.shoot || autoFire) && shotTimerRef.current >= shotRate) {
        // Muzzle flash
        state.particles.push(
          ...createExplosion(
            state.player.x + state.player.width / 2,
            state.player.y - 5
          ).slice(0, 2)
        );

        state.bullets.push({
          x: state.player.x + state.player.width / 2,
          y: state.player.y - 10,
          vx: 0,
          vy: -8,
          isPlayerBullet: true,
        });
        shotTimerRef.current = 0;
      }

      // Wave management
      waveTimerRef.current++;
      if (state.waveTransition > 0) {
        state.waveTransition--;
        if (state.waveTransition === 0) {
          waveTimerRef.current = 0;
        }
      }

      if (waveTimerRef.current > 100) {
        if (Math.random() < state.enemySpawnRate) {
          const rand = Math.random();
          let enemyType: "normal" | "strong" | "boss" = "normal";
          let width = 16,
            height = 16;
          let health = 1;

          if (state.wave % 5 === 0 && rand > 0.85) {
            enemyType = "boss";
            width = 40;
            height = 40;
            health = 8 + state.level;
          } else if (rand > 0.7) {
            enemyType = "strong";
            width = 20;
            height = 20;
            health = 2 + Math.floor(state.level / 2);
          }

          state.enemies.push({
            x: Math.random() * (CANVAS_WIDTH - width),
            y: -height - 10,
            width,
            height,
            type: enemyType,
            health,
            maxHealth: health,
            spawnTime: frameCountRef.current,
            shootTimer: 0,
          });
        }
      }

      // Enemy movement with patterns and shooting
      state.enemies.forEach((enemy, idx) => {
        const age = frameCountRef.current - enemy.spawnTime;

        // Movement pattern based on type
        if (enemy.type === "normal") {
          // Sine wave
          enemy.x += Math.sin(age * 0.05) * 1;
          enemy.y += 2 + state.level * 0.3;
        } else if (enemy.type === "strong") {
          // Zigzag pattern
          enemy.x += Math.sin(age * 0.08) * 2;
          enemy.y += 1.5 + state.level * 0.3;
        } else {
          // Boss moves slowly, tracking player slightly
          const playerCenterX = state.player.x + state.player.width / 2;
          if (enemy.x + enemy.width / 2 < playerCenterX - 20) {
            enemy.x += 1;
          } else if (enemy.x + enemy.width / 2 > playerCenterX + 20) {
            enemy.x -= 1;
          }
          enemy.y += 0.5;
        }

        // Enemy shooting
        enemy.shootTimer++;
        if (enemy.type === "strong" && enemy.shootTimer > 80) {
          state.enemyBullets.push({
            x: enemy.x + enemy.width / 2,
            y: enemy.y + enemy.height,
            vx: (Math.random() - 0.5) * 2,
            vy: 2,
          });
          enemy.shootTimer = 0;
        } else if (enemy.type === "boss" && enemy.shootTimer > 40) {
          // Boss shoots in spread pattern
          for (let i = -1; i <= 1; i++) {
            state.enemyBullets.push({
              x: enemy.x + enemy.width / 2 + i * 8,
              y: enemy.y + enemy.height,
              vx: i * 1.5,
              vy: 3,
            });
          }
          enemy.shootTimer = 0;
        }
      });

      // Bullet movement
      state.bullets = state.bullets.filter((bullet) => {
        bullet.x += bullet.vx;
        bullet.y += bullet.vy;
        return bullet.y > 0;
      });

      // Enemy bullet movement
      state.enemyBullets = state.enemyBullets.filter((bullet) => {
        bullet.x += bullet.vx;
        bullet.y += bullet.vy;
        return bullet.y < CANVAS_HEIGHT && bullet.x > 0 && bullet.x < CANVAS_WIDTH;
      });

      // Power-up movement
      state.powerups = state.powerups.filter((powerup) => {
        powerup.y += 2;
        powerup.spinAngle += 0.1;
        return powerup.y < CANVAS_HEIGHT;
      });

      // Update particles
      state.particles = state.particles.filter((particle) => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.vy += 0.1; // Gravity
        particle.life -= 0.02;
        return particle.life > 0;
      });

      // Decrease invincibility
      if (state.player.invincibility > 0) {
        state.player.invincibility--;
      }

      // Screen shake
      if (state.screenShake > 0) {
        state.screenShake -= 1;
      }

      // Collision: player bullets vs enemies
      for (let i = state.bullets.length - 1; i >= 0; i--) {
        const bullet = state.bullets[i];
        if (!bullet.isPlayerBullet) continue;

        for (let j = state.enemies.length - 1; j >= 0; j--) {
          const enemy = state.enemies[j];
          if (
            bullet.x > enemy.x &&
            bullet.x < enemy.x + enemy.width &&
            bullet.y > enemy.y &&
            bullet.y < enemy.y + enemy.height
          ) {
            state.bullets.splice(i, 1);
            enemy.health--;

            if (enemy.health <= 0) {
              const scoreMap = { normal: 10, strong: 25, boss: 100 };
              state.score += scoreMap[enemy.type];

              // Explosion
              state.particles.push(...createExplosion(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2));

              state.enemies.splice(j, 1);

              // Drop power-up
              if (Math.random() > 0.8) {
                state.powerups.push({
                  x: enemy.x + enemy.width / 2,
                  y: enemy.y + enemy.height / 2,
                  type: Math.random() > 0.5 ? "health" : "rapid",
                  spinAngle: 0,
                });
              }

              // Wave progress
              if (state.enemies.length === 0 && state.waveTransition === 0) {
                state.wave++;
                state.level = Math.floor(state.wave / 5) + 1;
                state.enemySpawnRate = Math.min(0.08, 0.02 + state.wave * 0.003);
                state.waveTransition = 80;
              }
            }
            break;
          }
        }
      }

      // Collision: player vs power-ups
      state.powerups = state.powerups.filter((powerup) => {
        if (
          state.player.x < powerup.x + 12 &&
          state.player.x + state.player.width > powerup.x &&
          state.player.y < powerup.y + 12 &&
          state.player.y + state.player.height > powerup.y
        ) {
          state.particles.push(...createExplosion(powerup.x, powerup.y));

          if (powerup.type === "health") {
            state.player.health = Math.min(100, state.player.health + 30);
          } else {
            rapidFireRef.current = true;
            setTimeout(() => {
              rapidFireRef.current = false;
            }, 8000);
          }
          return false;
        }
        return true;
      });

      // Collision: player vs enemies
      state.enemies = state.enemies.filter((enemy) => {
        if (
          state.player.invincibility <= 0 &&
          state.player.x < enemy.x + enemy.width &&
          state.player.x + state.player.width > enemy.x &&
          state.player.y < enemy.y + enemy.height &&
          state.player.y + state.player.height > enemy.y
        ) {
          state.player.health -= 25;
          state.player.invincibility = 120; // 2 seconds at 60fps
          state.screenShake = 10;

          if (state.player.health <= 0) {
            state.lives--;
            state.player.health = 100;
            state.player.invincibility = 180;

            if (state.lives <= 0) {
              state.gameOver = true;
              setFinalScore(state.score);
              setShowLeaderboardForm(true);
            }
          }
          return false;
        }
        return true;
      });

      // Collision: player vs enemy bullets
      state.enemyBullets = state.enemyBullets.filter((bullet) => {
        if (
          state.player.invincibility <= 0 &&
          state.player.x < bullet.x + 4 &&
          state.player.x + state.player.width > bullet.x - 4 &&
          state.player.y < bullet.y + 4 &&
          state.player.y + state.player.height > bullet.y - 4
        ) {
          state.player.health -= 15;
          state.player.invincibility = 120;
          state.screenShake = 5;

          state.particles.push(...createExplosion(bullet.x, bullet.y));

          if (state.player.health <= 0) {
            state.lives--;
            state.player.health = 100;
            state.player.invincibility = 180;

            if (state.lives <= 0) {
              state.gameOver = true;
              setFinalScore(state.score);
              setShowLeaderboardForm(true);
            }
          }
          return false;
        }
        return true;
      });

      // Remove off-screen enemies
      state.enemies = state.enemies.filter((enemy) => enemy.y < CANVAS_HEIGHT + 50);
    }

    draw(ctx, state, frameCountRef.current);

    if (!state.gameOver) {
      requestAnimationFrame(gameLoop);
    }
  };

  const restart = () => {
    gameStateRef.current = {
      player: {
        x: CANVAS_WIDTH / 2 - 16,
        y: CANVAS_HEIGHT - 80,
        width: 32,
        height: 24,
        health: 100,
        invincibility: 0,
        tilt: 0,
      },
      enemies: [],
      bullets: [],
      enemyBullets: [],
      powerups: [],
      particles: [],
      score: 0,
      lives: 3,
      wave: 1,
      gameOver: false,
      level: 1,
      enemySpawnRate: 0.02,
      waveTransition: 0,
      screenShake: 0,
      lastWaveAnnounce: 0,
      stars: Array.from({ length: 30 }, () => ({
        x: Math.random() * CANVAS_WIDTH,
        y: Math.random() * CANVAS_HEIGHT,
        size: Math.random() * 0.5 + 0.3,
        speed: Math.random() * 0.3 + 0.1,
        layer: Math.floor(Math.random() * 3),
        brightness: Math.random() * 0.5 + 0.5,
      })),
    };
    shotTimerRef.current = 0;
    waveTimerRef.current = 0;
    rapidFireRef.current = false;
    frameCountRef.current = 0;
    scrollOffsetRef.current = 0;
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
        case "r":
          if (gameStateRef.current.gameOver) {
            e.preventDefault();
            if (showLeaderboardForm) {
              setShowLeaderboardForm(false);
              restart();
            }
          }
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

    // Touch controls
    const handleTouchStart = (e: TouchEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      Array.from(e.touches).forEach((touch) => {
        const rect = canvas.getBoundingClientRect();
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;

        // Check if touch is on canvas
        if (y < canvas.height) {
          // Left side movement
          if (x < canvas.width / 3) {
            inputRef.current.left = true;
          }
          // Right side movement
          else if (x > (canvas.width * 2) / 3) {
            inputRef.current.right = true;
          }
        }
      });
    };

    const handleTouchEnd = () => {
      inputRef.current.left = false;
      inputRef.current.right = false;
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });

    gameLoop();

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchend", handleTouchEnd);
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
          スペース シューター
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
              imageRendering: "pixelated",
            }}
          />
        </div>

        {/* Mobile Controls */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "15px",
            marginBottom: "20px",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <button
            onClick={() => {
              inputRef.current.left = true;
            }}
            onMouseUp={() => {
              inputRef.current.left = false;
            }}
            onTouchStart={(e) => {
              e.preventDefault();
              inputRef.current.left = true;
            }}
            onTouchEnd={() => {
              inputRef.current.left = false;
            }}
            style={{
              padding: "15px 25px",
              fontSize: "18px",
              backgroundColor: "var(--color-retro-accent)",
              color: "var(--color-retro-bg)",
              border: "2px solid var(--color-retro-accent2)",
              borderRadius: "6px",
              fontWeight: "bold",
              cursor: "pointer",
              fontFamily: "var(--font-family-pixel)",
            }}
          >
            LEFT
          </button>

          <button
            onClick={() => {
              inputRef.current.shoot = true;
            }}
            onMouseUp={() => {
              inputRef.current.shoot = false;
            }}
            onTouchStart={(e) => {
              e.preventDefault();
              inputRef.current.shoot = true;
            }}
            onTouchEnd={() => {
              inputRef.current.shoot = false;
            }}
            style={{
              padding: "20px 40px",
              fontSize: "20px",
              backgroundColor: "#ff6b35",
              color: "#fff",
              border: "2px solid #ff4444",
              borderRadius: "6px",
              fontWeight: "bold",
              cursor: "pointer",
              fontFamily: "var(--font-family-pixel)",
            }}
          >
            FIRE
          </button>

          <button
            onClick={() => {
              inputRef.current.right = true;
            }}
            onMouseUp={() => {
              inputRef.current.right = false;
            }}
            onTouchStart={(e) => {
              e.preventDefault();
              inputRef.current.right = true;
            }}
            onTouchEnd={() => {
              inputRef.current.right = false;
            }}
            style={{
              padding: "15px 25px",
              fontSize: "18px",
              backgroundColor: "var(--color-retro-accent)",
              color: "var(--color-retro-bg)",
              border: "2px solid var(--color-retro-accent2)",
              borderRadius: "6px",
              fontWeight: "bold",
              cursor: "pointer",
              fontFamily: "var(--font-family-pixel)",
            }}
          >
            RIGHT
          </button>
        </div>

        {/* Auto-fire toggle */}
        <div style={{ marginBottom: "20px", textAlign: "center" }}>
          <label
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
              cursor: "pointer",
              fontSize: "13px",
            }}
          >
            <input
              type="checkbox"
              checked={autoFire}
              onChange={(e) => setAutoFire(e.target.checked)}
              style={{
                cursor: "pointer",
                width: "18px",
                height: "18px",
              }}
            />
            Auto-fire (Mobile)
          </label>
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
            <li>←→矢印キー / A/D: 移動</li>
            <li>スペースキー: 弾を発射</li>
            <li>タッチ: 画面左右タップで移動、FIREボタンで発射</li>
          </ul>

          <p style={{ marginBottom: "10px", fontWeight: "bold", color: "var(--color-retro-accent)" }}>
            ルール:
          </p>
          <ul style={{ marginLeft: "20px" }}>
            <li>敵を撃破してスコアを稼ごう</li>
            <li>ウェーブをクリアしてボスを倒せ</li>
            <li>敵や弾に当たるとゲームオーバー</li>
          </ul>
        </div>

        {/* Score Form */}
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
              スコア送信
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
              <label
                style={{
                  display: "block",
                  marginBottom: "5px",
                  fontSize: "13px",
                  color: "var(--color-retro-text-dim)",
                }}
              >
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
              送信
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
            ランキング
          </h2>
          <Leaderboard gameId="shooter" />
        </div>
      </div>
    </main>
  );
}
