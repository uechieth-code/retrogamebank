"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Leaderboard from "../components/Leaderboard";

// ============================================================
// Constants
// ============================================================
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const WORLD_SIZE = 2400;

// Player
const PLAYER_SIZE = 16;
const PLAYER_SPEED = 100;
const PLAYER_MAX_HP = 5;
const INVINCIBLE_TIME = 1.0;
const XP_COLLECT_RANGE = 64;

// Weapons
const PLASMA_INTERVAL = 0.8;
const PLASMA_SPEED = 300;
const PLASMA_DAMAGE = 1;
const BULLET_SIZE = 4;

// Enemy spawn
const INITIAL_SPAWN_INTERVAL = 2.0;
const MIN_SPAWN_INTERVAL = 0.3;
const SPAWN_INTERVAL_DECAY = 0.05;
const INITIAL_ENEMY_SPEED = 30;
const ENEMY_SPEED_INCREMENT = 3;
const MAX_ENEMY_SPEED = 120;

// Level up
const BASE_XP = 10;
const XP_PER_LEVEL = 5;

// Colors
const COL_BG = "#1a1a2e";
const COL_PLAYER = "#00d4ff";
const COL_PLAYER_BODY = "#0088cc";
const COL_ALLY = "#ffa500";
const COL_XP_GEM = "#00ff88";
const COL_HP_FULL = "#ff4444";
const COL_HP_EMPTY = "#333";
const COL_HUD_BG = "rgba(0,0,0,0.7)";
const COL_MODAL_BG = "rgba(0,0,0,0.85)";
const COL_TEXT = "#ffffff";
const COL_ACCENT = "#00d4ff";
const COL_YELLOW = "#ffd700";

// ============================================================
// Types
// ============================================================
type WeaponId = "plasma" | "laser" | "boomerang" | "burst" | "homing" | "flame";
type EnemyType = "slime" | "bat" | "golem" | "ghost";
type BossType = "knight_wolf" | "dragon" | "death_knight";
type UpgradeCategory = "weapon" | "weapon_boost" | "stat" | "ally";
type GameScreen = "title" | "howto" | "playing" | "levelup" | "gameover" | "paused";

interface Vec2 { x: number; y: number; }

interface Bullet {
  x: number; y: number; vx: number; vy: number;
  damage: number; size: number; weaponId: WeaponId;
  pierce: number; lifetime: number; age: number;
  angle?: number; orbitDist?: number; orbitSpeed?: number;
  target?: Enemy | Boss | null;
}

interface XpGem {
  x: number; y: number; value: number; vx: number; vy: number;
}

interface Enemy {
  x: number; y: number; hp: number; maxHp: number;
  type: EnemyType; speed: number; damage: number;
  score: number; size: number;
  phaseTimer: number; visible: boolean;
  flashTimer: number;
}

interface Boss {
  x: number; y: number; hp: number; maxHp: number;
  type: BossType; speed: number; damage: number;
  score: number; size: number;
  phaseTimer: number; attackTimer: number;
  phase: number; flashTimer: number;
}

interface Ally {
  hp: number; maxHp: number; angle: number;
  attackTimer: number; flashTimer: number;
}

interface Particle {
  x: number; y: number; vx: number; vy: number;
  life: number; maxLife: number; color: string; size: number;
}

interface UpgradeOption {
  id: string; category: UpgradeCategory; name: string; desc: string; color: string;
}

interface WeaponState {
  owned: boolean; level: number;
}

interface PlayerState {
  x: number; y: number; hp: number; maxHp: number;
  speed: number; invTimer: number; level: number;
  xp: number; xpToNext: number; score: number;
  damageMulti: number; fireRateMulti: number; bulletSizeMulti: number;
  xpRangeMulti: number; speedMulti: number;
  weapons: Record<WeaponId, WeaponState>;
  weaponTimers: Record<WeaponId, number>;
  allies: Ally[];
  allyBoostLevel: number;
  killCount: number;
  bossKillCount: number;
  damageBoostCount: number;
  fireRateBoostCount: number;
  bulletSizeBoostCount: number;
  speedBoostCount: number;
  maxHpBoostCount: number;
  xpMagnetCount: number;
}

// ============================================================
// Helper functions
// ============================================================
function dist(a: Vec2, b: Vec2): number {
  const dx = a.x - b.x, dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

function normalize(v: Vec2): Vec2 {
  const len = Math.sqrt(v.x * v.x + v.y * v.y);
  if (len === 0) return { x: 0, y: 0 };
  return { x: v.x / len, y: v.y / len };
}

function randomInRange(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

// Enemy color map
const ENEMY_COLORS: Record<EnemyType, string> = {
  slime: "#44cc44",
  bat: "#aa44ff",
  golem: "#888888",
  ghost: "#aaddff",
};

const BOSS_COLORS: Record<BossType, string> = {
  knight_wolf: "#ff8800",
  dragon: "#ff2222",
  death_knight: "#8800ff",
};

// ============================================================
// Component
// ============================================================
export default function SurvivorsGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<{
    screen: GameScreen;
    player: PlayerState;
    enemies: Enemy[];
    bosses: Boss[];
    bullets: Bullet[];
    xpGems: XpGem[];
    particles: Particle[];
    elapsed: number;
    spawnTimer: number;
    bossTimers: { knight: number; dragon: number; death: number };
    bossSpawnCounts: { knight: number; dragon: number; death: number };
    upgradeOptions: UpgradeOption[];
    selectedUpgrade: number;
    keys: Set<string>;
    touchDir: Vec2 | null;
    touchId: number | null;
    touchStart: Vec2 | null;
    cameraX: number;
    cameraY: number;
    hpRegenTimer: number;
    lastTime: number;
    animFrame: number;
    isMobile: boolean;
    bestScore: number;
    nameInput: string;
  } | null>(null);
  const [screen, setScreen] = useState<GameScreen>("title");
  const [finalScore, setFinalScore] = useState(0);
  const [finalTime, setFinalTime] = useState(0);
  const [finalKills, setFinalKills] = useState(0);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [nameInput, setNameInput] = useState("");

  // ============================================================
  // Init game state
  // ============================================================
  const initGame = useCallback(() => {
    const g = gameRef.current!;
    g.screen = "playing";
    g.elapsed = 0;
    g.spawnTimer = 0;
    g.bossTimers = { knight: 30, dragon: 90, death: 180 };
    g.bossSpawnCounts = { knight: 0, dragon: 0, death: 0 };
    g.enemies = [];
    g.bosses = [];
    g.bullets = [];
    g.xpGems = [];
    g.particles = [];
    g.upgradeOptions = [];
    g.selectedUpgrade = -1;
    g.hpRegenTimer = 0;
    g.cameraX = 0;
    g.cameraY = 0;

    const weapons: Record<WeaponId, WeaponState> = {
      plasma: { owned: true, level: 1 },
      laser: { owned: false, level: 0 },
      boomerang: { owned: false, level: 0 },
      burst: { owned: false, level: 0 },
      homing: { owned: false, level: 0 },
      flame: { owned: false, level: 0 },
    };

    const weaponTimers: Record<WeaponId, number> = {
      plasma: 0, laser: 0, boomerang: 0, burst: 0, homing: 0, flame: 0,
    };

    g.player = {
      x: WORLD_SIZE / 2, y: WORLD_SIZE / 2,
      hp: PLAYER_MAX_HP, maxHp: PLAYER_MAX_HP,
      speed: PLAYER_SPEED, invTimer: 0,
      level: 1, xp: 0, xpToNext: BASE_XP + 1 * XP_PER_LEVEL,
      score: 0, damageMulti: 1, fireRateMulti: 1,
      bulletSizeMulti: 1, xpRangeMulti: 1, speedMulti: 1,
      weapons, weaponTimers, allies: [],
      allyBoostLevel: 0, killCount: 0, bossKillCount: 0,
      damageBoostCount: 0, fireRateBoostCount: 0, bulletSizeBoostCount: 0,
      speedBoostCount: 0, maxHpBoostCount: 0, xpMagnetCount: 0,
    };

    setScreen("playing");
  }, []);

  // ============================================================
  // Spawn enemies
  // ============================================================
  function getSpawnInterval(elapsed: number): number {
    const decaySteps = Math.floor(elapsed / 10);
    return Math.max(MIN_SPAWN_INTERVAL, INITIAL_SPAWN_INTERVAL - decaySteps * SPAWN_INTERVAL_DECAY);
  }

  function getEnemySpeedBonus(elapsed: number): number {
    const steps = Math.floor(elapsed / 10);
    return Math.min(steps * ENEMY_SPEED_INCREMENT, MAX_ENEMY_SPEED - INITIAL_ENEMY_SPEED);
  }

  function getEnemyHpBonus(elapsed: number): number {
    return Math.floor(elapsed / 60);
  }

  function getMaxEnemies(elapsed: number): number {
    return 5 + Math.floor(elapsed / 30) * 5;
  }

  function spawnEnemy(g: NonNullable<typeof gameRef.current>): void {
    if (g.enemies.length >= getMaxEnemies(g.elapsed)) return;
    const p = g.player;
    const angle = Math.random() * Math.PI * 2;
    const spawnDist = 500;
    const sx = p.x + Math.cos(angle) * spawnDist;
    const sy = p.y + Math.sin(angle) * spawnDist;

    const hpBonus = getEnemyHpBonus(g.elapsed);
    const speedBonus = getEnemySpeedBonus(g.elapsed);

    // Choose enemy type based on elapsed time
    let types: EnemyType[] = ["slime"];
    if (g.elapsed > 15) types.push("bat");
    if (g.elapsed > 30) types.push("golem");
    if (g.elapsed > 45) types.push("ghost");
    const type = types[Math.floor(Math.random() * types.length)];

    const base: Record<EnemyType, { hp: number; speed: number; damage: number; score: number; size: number }> = {
      slime: { hp: 1, speed: 30, damage: 1, score: 10, size: 14 },
      bat: { hp: 1, speed: 50, damage: 1, score: 15, size: 12 },
      golem: { hp: 3, speed: 20, damage: 2, score: 25, size: 20 },
      ghost: { hp: 2, speed: 35, damage: 1, score: 20, size: 14 },
    };

    const b = base[type];
    g.enemies.push({
      x: sx, y: sy,
      hp: b.hp + hpBonus, maxHp: b.hp + hpBonus,
      type, speed: Math.min(b.speed + speedBonus, MAX_ENEMY_SPEED),
      damage: b.damage, score: b.score, size: b.size,
      phaseTimer: 0, visible: true, flashTimer: 0,
    });
  }

  function spawnBoss(g: NonNullable<typeof gameRef.current>, type: BossType, count: number): void {
    const p = g.player;
    const angle = Math.random() * Math.PI * 2;
    const spawnDist = 600;
    const sx = p.x + Math.cos(angle) * spawnDist;
    const sy = p.y + Math.sin(angle) * spawnDist;
    const hpMulti = Math.pow(1.3, count);

    const base: Record<BossType, { hp: number; speed: number; damage: number; score: number; size: number }> = {
      knight_wolf: { hp: 15, speed: 60, damage: 2, score: 200, size: 28 },
      dragon: { hp: 50, speed: 35, damage: 3, score: 500, size: 40 },
      death_knight: { hp: 150, speed: 25, damage: 4, score: 2000, size: 60 },
    };

    const b = base[type];
    g.bosses.push({
      x: sx, y: sy,
      hp: Math.floor(b.hp * hpMulti), maxHp: Math.floor(b.hp * hpMulti),
      type, speed: b.speed, damage: b.damage, score: b.score, size: b.size,
      phaseTimer: 0, attackTimer: 0, phase: 1, flashTimer: 0,
    });
  }

  // ============================================================
  // Weapons fire
  // ============================================================
  function fireWeapons(g: NonNullable<typeof gameRef.current>, dt: number): void {
    const p = g.player;
    const fireRate = p.fireRateMulti;
    const dmgMulti = p.damageMulti;
    const sizeMulti = p.bulletSizeMulti;

    // Find nearest enemy for aiming
    let nearest: (Enemy | Boss) | null = null;
    let nearestDist = Infinity;
    for (const e of g.enemies) {
      const d = dist(p, e);
      if (d < nearestDist) { nearest = e; nearestDist = d; }
    }
    for (const b of g.bosses) {
      const d = dist(p, b);
      if (d < nearestDist) { nearest = b; nearestDist = d; }
    }

    // Default direction (right)
    let aimDir: Vec2 = { x: 1, y: 0 };
    if (nearest) {
      aimDir = normalize({ x: nearest.x - p.x, y: nearest.y - p.y });
    }

    // Plasma shot
    if (p.weapons.plasma.owned) {
      p.weaponTimers.plasma -= dt;
      if (p.weaponTimers.plasma <= 0) {
        p.weaponTimers.plasma = PLASMA_INTERVAL / fireRate;
        g.bullets.push({
          x: p.x, y: p.y,
          vx: aimDir.x * PLASMA_SPEED, vy: aimDir.y * PLASMA_SPEED,
          damage: Math.ceil(PLASMA_DAMAGE * dmgMulti), size: BULLET_SIZE * sizeMulti,
          weaponId: "plasma", pierce: 0, lifetime: 2, age: 0,
        });
      }
    }

    // Laser beam
    if (p.weapons.laser.owned) {
      p.weaponTimers.laser -= dt;
      if (p.weaponTimers.laser <= 0) {
        p.weaponTimers.laser = 1.5 / fireRate;
        g.bullets.push({
          x: p.x, y: p.y,
          vx: aimDir.x * 500, vy: aimDir.y * 500,
          damage: Math.ceil(2 * dmgMulti), size: 3 * sizeMulti,
          weaponId: "laser", pierce: 99, lifetime: 1.5, age: 0,
        });
      }
    }

    // Boomerang
    if (p.weapons.boomerang.owned) {
      p.weaponTimers.boomerang -= dt;
      if (p.weaponTimers.boomerang <= 0) {
        p.weaponTimers.boomerang = 2.0 / fireRate;
        const bAngle = Math.atan2(aimDir.y, aimDir.x);
        g.bullets.push({
          x: p.x, y: p.y, vx: 0, vy: 0,
          damage: Math.ceil(1.5 * dmgMulti), size: 6 * sizeMulti,
          weaponId: "boomerang", pierce: 99, lifetime: 3, age: 0,
          angle: bAngle, orbitDist: 80, orbitSpeed: 4,
        });
      }
    }

    // Burst (all directions)
    if (p.weapons.burst.owned) {
      p.weaponTimers.burst -= dt;
      if (p.weaponTimers.burst <= 0) {
        p.weaponTimers.burst = 3.0 / fireRate;
        const count = 12;
        for (let i = 0; i < count; i++) {
          const a = (i / count) * Math.PI * 2;
          g.bullets.push({
            x: p.x, y: p.y,
            vx: Math.cos(a) * 200, vy: Math.sin(a) * 200,
            damage: Math.ceil(1 * dmgMulti), size: BULLET_SIZE * sizeMulti,
            weaponId: "burst", pierce: 0, lifetime: 1.5, age: 0,
          });
        }
      }
    }

    // Homing missile
    if (p.weapons.homing.owned) {
      p.weaponTimers.homing -= dt;
      if (p.weaponTimers.homing <= 0) {
        p.weaponTimers.homing = 1.2 / fireRate;
        g.bullets.push({
          x: p.x, y: p.y,
          vx: aimDir.x * 150, vy: aimDir.y * 150,
          damage: Math.ceil(2 * dmgMulti), size: 5 * sizeMulti,
          weaponId: "homing", pierce: 0, lifetime: 3, age: 0,
          target: nearest as (Enemy | Boss | null),
        });
      }
    }

    // Flame wave
    if (p.weapons.flame.owned) {
      p.weaponTimers.flame -= dt;
      if (p.weaponTimers.flame <= 0) {
        p.weaponTimers.flame = 0.3 / fireRate;
        const spread = 0.3;
        const a = Math.atan2(aimDir.y, aimDir.x) + randomInRange(-spread, spread);
        g.bullets.push({
          x: p.x, y: p.y,
          vx: Math.cos(a) * 180, vy: Math.sin(a) * 180,
          damage: Math.ceil(0.5 * dmgMulti), size: 8 * sizeMulti,
          weaponId: "flame", pierce: 1, lifetime: 0.6, age: 0,
        });
      }
    }

    // Ally attacks
    const allyCount = p.allies.length;
    const allyAtkSpeedBonus = allyCount >= 2 ? 0.9 : 1;
    for (const ally of p.allies) {
      ally.attackTimer -= dt;
      if (ally.attackTimer <= 0) {
        ally.attackTimer = 1.2 * allyAtkSpeedBonus;
        const allyX = p.x + Math.cos(ally.angle) * 48;
        const allyY = p.y + Math.sin(ally.angle) * 48;
        // Find nearest enemy to ally
        let allyTarget: Vec2 = { x: allyX + 1, y: allyY };
        let aMinDist = Infinity;
        for (const e of g.enemies) {
          const d = dist({ x: allyX, y: allyY }, e);
          if (d < aMinDist) { allyTarget = e; aMinDist = d; }
        }
        for (const b of g.bosses) {
          const d = dist({ x: allyX, y: allyY }, b);
          if (d < aMinDist) { allyTarget = b; aMinDist = d; }
        }
        const aDir = normalize({ x: allyTarget.x - allyX, y: allyTarget.y - allyY });
        const allyDmg = Math.ceil(0.5 * dmgMulti * (1 + p.allyBoostLevel * 0.3));
        g.bullets.push({
          x: allyX, y: allyY,
          vx: aDir.x * 250, vy: aDir.y * 250,
          damage: allyDmg, size: 3,
          weaponId: "plasma", pierce: 0, lifetime: 1.5, age: 0,
        });
      }
    }
  }

  // ============================================================
  // Level up system
  // ============================================================
  function generateUpgradeOptions(g: NonNullable<typeof gameRef.current>): UpgradeOption[] {
    const p = g.player;
    const pool: UpgradeOption[] = [];

    // New weapons
    const weaponDefs: { id: WeaponId; name: string; desc: string }[] = [
      { id: "laser", name: "レーザービーム", desc: "貫通型レーザー。敵を貫く" },
      { id: "boomerang", name: "ブーメラン", desc: "周囲を回転する弾" },
      { id: "burst", name: "全方位バースト", desc: "360度に弾を一斉発射" },
      { id: "homing", name: "ホーミングミサイル", desc: "敵を自動追尾する弾" },
      { id: "flame", name: "フレイムウェーブ", desc: "火炎の波を連射" },
    ];
    for (const w of weaponDefs) {
      if (!p.weapons[w.id].owned) {
        pool.push({ id: `weapon_${w.id}`, category: "weapon", name: w.name, desc: w.desc, color: "#ff6b35" });
      }
    }

    // Weapon boosts
    if (p.damageBoostCount < 3)
      pool.push({ id: "atk_up", category: "weapon_boost", name: "攻撃力UP", desc: "全武器ダメージ+20%", color: "#ff4444" });
    if (p.fireRateBoostCount < 3)
      pool.push({ id: "fire_rate_up", category: "weapon_boost", name: "攻撃速度UP", desc: "発射間隔-15%", color: "#ff8800" });
    if (p.bulletSizeBoostCount < 3)
      pool.push({ id: "bullet_size_up", category: "weapon_boost", name: "弾サイズUP", desc: "弾の大きさ+30%", color: "#ffaa00" });

    // Stats
    if (p.speedBoostCount < 3)
      pool.push({ id: "speed_up", category: "stat", name: "移動速度UP", desc: "移動速度+15%", color: "#00ff88" });
    if (p.maxHpBoostCount < 3)
      pool.push({ id: "max_hp_up", category: "stat", name: "最大HP UP", desc: "最大HP+2（全回復）", color: "#ff4444" });
    if (p.xpMagnetCount < 2)
      pool.push({ id: "xp_magnet", category: "stat", name: "経験値マグネット", desc: "収集範囲+50%", color: "#00d4ff" });
    pool.push({ id: "hp_heal", category: "stat", name: "HP回復", desc: "即座にHPを1回復", color: "#ff6688" });

    // Allies
    if (p.allies.length < 4)
      pool.push({ id: "ally_add", category: "ally", name: "仲間追加", desc: "自動攻撃する仲間を1体追加", color: "#ffa500" });
    if (p.allies.length > 0 && p.allyBoostLevel < 3)
      pool.push({ id: "ally_boost", category: "ally", name: "仲間強化", desc: "全仲間の攻撃力とHP+30%", color: "#ff8800" });

    // Shuffle and pick 3
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    return pool.slice(0, 3);
  }

  function applyUpgrade(g: NonNullable<typeof gameRef.current>, option: UpgradeOption): void {
    const p = g.player;
    switch (option.id) {
      case "weapon_laser": p.weapons.laser = { owned: true, level: 1 }; break;
      case "weapon_boomerang": p.weapons.boomerang = { owned: true, level: 1 }; break;
      case "weapon_burst": p.weapons.burst = { owned: true, level: 1 }; break;
      case "weapon_homing": p.weapons.homing = { owned: true, level: 1 }; break;
      case "weapon_flame": p.weapons.flame = { owned: true, level: 1 }; break;
      case "atk_up": p.damageMulti += 0.2; p.damageBoostCount++; break;
      case "fire_rate_up": p.fireRateMulti *= 1.15; p.fireRateBoostCount++; break;
      case "bullet_size_up": p.bulletSizeMulti += 0.3; p.bulletSizeBoostCount++; break;
      case "speed_up": p.speedMulti += 0.15; p.speedBoostCount++; break;
      case "max_hp_up":
        p.maxHp += 2; p.hp = p.maxHp; p.maxHpBoostCount++;
        break;
      case "xp_magnet": p.xpRangeMulti += 0.5; p.xpMagnetCount++; break;
      case "hp_heal": p.hp = Math.min(p.hp + 1, p.maxHp); break;
      case "ally_add": {
        const count = p.allies.length + 1;
        const ally: Ally = {
          hp: 3, maxHp: 3, angle: 0, attackTimer: 1.2, flashTimer: 0,
        };
        p.allies.push(ally);
        // Redistribute angles
        for (let i = 0; i < p.allies.length; i++) {
          p.allies[i].angle = (i / p.allies.length) * Math.PI * 2;
        }
        break;
      }
      case "ally_boost":
        p.allyBoostLevel++;
        for (const a of p.allies) {
          a.maxHp = Math.ceil(3 * (1 + p.allyBoostLevel * 0.3));
          a.hp = Math.min(a.hp + 1, a.maxHp);
        }
        break;
    }
  }

  // ============================================================
  // Particles
  // ============================================================
  function spawnParticles(g: NonNullable<typeof gameRef.current>, x: number, y: number, color: string, count: number): void {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = randomInRange(30, 120);
      g.particles.push({
        x, y,
        vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
        life: randomInRange(0.3, 0.8), maxLife: 0.8,
        color, size: randomInRange(2, 5),
      });
    }
  }

  // ============================================================
  // Main game loop update
  // ============================================================
  function updateGame(g: NonNullable<typeof gameRef.current>, dt: number): void {
    if (g.screen !== "playing") return;
    const p = g.player;

    g.elapsed += dt;

    // --- Player movement ---
    let dx = 0, dy = 0;
    if (g.touchDir) {
      dx = g.touchDir.x;
      dy = g.touchDir.y;
    } else {
      if (g.keys.has("ArrowLeft") || g.keys.has("a") || g.keys.has("A")) dx -= 1;
      if (g.keys.has("ArrowRight") || g.keys.has("d") || g.keys.has("D")) dx += 1;
      if (g.keys.has("ArrowUp") || g.keys.has("w") || g.keys.has("W")) dy -= 1;
      if (g.keys.has("ArrowDown") || g.keys.has("s") || g.keys.has("S")) dy += 1;
    }
    if (dx !== 0 || dy !== 0) {
      const dir = normalize({ x: dx, y: dy });
      const spd = p.speed * p.speedMulti;
      p.x += dir.x * spd * dt;
      p.y += dir.y * spd * dt;
    }
    p.x = clamp(p.x, PLAYER_SIZE, WORLD_SIZE - PLAYER_SIZE);
    p.y = clamp(p.y, PLAYER_SIZE, WORLD_SIZE - PLAYER_SIZE);

    // Invincibility timer
    if (p.invTimer > 0) p.invTimer -= dt;

    // Camera
    g.cameraX = p.x - CANVAS_WIDTH / 2;
    g.cameraY = p.y - CANVAS_HEIGHT / 2;

    // --- Ally rotation ---
    const allySpeed = 90 * (Math.PI / 180); // 90 deg/s
    for (const ally of p.allies) {
      ally.angle += allySpeed * dt;
      if (ally.flashTimer > 0) ally.flashTimer -= dt;
    }

    // HP regen from synergy (3+ allies)
    if (p.allies.length >= 3) {
      g.hpRegenTimer += dt;
      if (g.hpRegenTimer >= 15) {
        g.hpRegenTimer -= 15;
        p.hp = Math.min(p.hp + 1, p.maxHp);
      }
    }

    // --- Fire weapons ---
    fireWeapons(g, dt);

    // --- Spawn enemies ---
    g.spawnTimer -= dt;
    if (g.spawnTimer <= 0) {
      g.spawnTimer = getSpawnInterval(g.elapsed);
      spawnEnemy(g);
    }

    // --- Spawn bosses ---
    // Knight wolf (small boss)
    g.bossTimers.knight -= dt;
    if (g.bossTimers.knight <= 0) {
      g.bossTimers.knight = 30;
      spawnBoss(g, "knight_wolf", g.bossSpawnCounts.knight);
      g.bossSpawnCounts.knight++;
    }
    // Dragon (mid boss) - after 90s
    if (g.elapsed >= 90) {
      g.bossTimers.dragon -= dt;
      if (g.bossTimers.dragon <= 0) {
        g.bossTimers.dragon = 90;
        spawnBoss(g, "dragon", g.bossSpawnCounts.dragon);
        g.bossSpawnCounts.dragon++;
      }
    }
    // Death knight (big boss) - after 180s
    if (g.elapsed >= 180) {
      g.bossTimers.death -= dt;
      if (g.bossTimers.death <= 0) {
        g.bossTimers.death = 180;
        spawnBoss(g, "death_knight", g.bossSpawnCounts.death);
        g.bossSpawnCounts.death++;
      }
    }

    // --- Update bullets ---
    for (let i = g.bullets.length - 1; i >= 0; i--) {
      const b = g.bullets[i];
      b.age += dt;
      if (b.age >= b.lifetime) { g.bullets.splice(i, 1); continue; }

      if (b.weaponId === "boomerang") {
        // Orbit around player
        b.angle = (b.angle || 0) + (b.orbitSpeed || 4) * dt;
        b.x = p.x + Math.cos(b.angle) * (b.orbitDist || 80);
        b.y = p.y + Math.sin(b.angle) * (b.orbitDist || 80);
      } else if (b.weaponId === "homing" && b.target) {
        // Re-target if target dead, otherwise home in
        const t = b.target;
        if (("hp" in t) && t.hp > 0) {
          const tDir = normalize({ x: t.x - b.x, y: t.y - b.y });
          const homingStrength = 5;
          b.vx += tDir.x * homingStrength;
          b.vy += tDir.y * homingStrength;
          const speed = Math.sqrt(b.vx * b.vx + b.vy * b.vy);
          if (speed > 250) {
            b.vx = (b.vx / speed) * 250;
            b.vy = (b.vy / speed) * 250;
          }
        }
        b.x += b.vx * dt;
        b.y += b.vy * dt;
      } else {
        b.x += b.vx * dt;
        b.y += b.vy * dt;
      }
    }

    // --- Update enemies ---
    for (let i = g.enemies.length - 1; i >= 0; i--) {
      const e = g.enemies[i];
      if (e.flashTimer > 0) e.flashTimer -= dt;

      // Ghost visibility
      if (e.type === "ghost") {
        e.phaseTimer += dt;
        e.visible = Math.sin(e.phaseTimer * 2) > -0.3;
      }

      // Movement
      const dir = normalize({ x: p.x - e.x, y: p.y - e.y });
      if (e.type === "bat") {
        // Zigzag
        const zigzag = Math.sin(g.elapsed * 5 + i) * 0.5;
        const perpX = -dir.y * zigzag;
        const perpY = dir.x * zigzag;
        e.x += (dir.x + perpX) * e.speed * dt;
        e.y += (dir.y + perpY) * e.speed * dt;
      } else {
        e.x += dir.x * e.speed * dt;
        e.y += dir.y * e.speed * dt;
      }

      // Collision with player
      if (p.invTimer <= 0 && dist(p, e) < PLAYER_SIZE + e.size / 2) {
        p.hp -= e.damage;
        p.invTimer = INVINCIBLE_TIME;
        spawnParticles(g, p.x, p.y, "#ff0000", 5);
        if (p.hp <= 0) { gameOver(g); return; }
      }

      // Collision with allies
      for (let ai = p.allies.length - 1; ai >= 0; ai--) {
        const ally = p.allies[ai];
        const allyX = p.x + Math.cos(ally.angle) * 48;
        const allyY = p.y + Math.sin(ally.angle) * 48;
        if (dist({ x: allyX, y: allyY }, e) < 12 + e.size / 2) {
          ally.hp -= e.damage;
          ally.flashTimer = 0.2;
          if (ally.hp <= 0) {
            p.allies.splice(ai, 1);
            spawnParticles(g, allyX, allyY, COL_ALLY, 8);
            // Redistribute angles
            for (let j = 0; j < p.allies.length; j++) {
              p.allies[j].angle = (j / p.allies.length) * Math.PI * 2;
            }
          }
        }
      }

      // Bullet collision with enemies
      for (let bi = g.bullets.length - 1; bi >= 0; bi--) {
        const b = g.bullets[bi];
        if (dist(b, e) < b.size + e.size / 2) {
          e.hp -= b.damage;
          e.flashTimer = 0.1;
          if (b.pierce <= 0) {
            g.bullets.splice(bi, 1);
          } else {
            b.pierce--;
          }
          if (e.hp <= 0) {
            p.score += e.score;
            p.killCount++;
            spawnParticles(g, e.x, e.y, ENEMY_COLORS[e.type], 6);
            // Drop XP gems
            const gemCount = e.type === "golem" ? 3 : 1;
            for (let gi = 0; gi < gemCount; gi++) {
              g.xpGems.push({
                x: e.x + randomInRange(-10, 10),
                y: e.y + randomInRange(-10, 10),
                value: 1 + Math.floor(g.elapsed / 60),
                vx: randomInRange(-30, 30),
                vy: randomInRange(-30, 30),
              });
            }
            g.enemies.splice(i, 1);
            break;
          }
        }
      }
    }

    // --- Update bosses ---
    for (let i = g.bosses.length - 1; i >= 0; i--) {
      const b = g.bosses[i];
      if (b.flashTimer > 0) b.flashTimer -= dt;
      b.phaseTimer += dt;
      b.attackTimer -= dt;

      // Movement
      const dir = normalize({ x: p.x - b.x, y: p.y - b.y });

      if (b.type === "knight_wolf") {
        // Charge behavior
        if (b.phaseTimer % 3 < 1.5) {
          // Standing still, preparing
        } else {
          b.x += dir.x * b.speed * 2 * dt;
          b.y += dir.y * b.speed * 2 * dt;
        }
      } else if (b.type === "dragon") {
        b.x += dir.x * b.speed * dt;
        b.y += dir.y * b.speed * dt;
        // Fire 3-way bullets
        if (b.attackTimer <= 0) {
          b.attackTimer = 2.0;
          for (let a = -1; a <= 1; a++) {
            const angle = Math.atan2(dir.y, dir.x) + a * 0.3;
            g.bullets.push({
              x: b.x, y: b.y,
              vx: -Math.cos(angle) * 150, vy: -Math.sin(angle) * 150,
              damage: 0, size: 6, weaponId: "plasma",
              pierce: 0, lifetime: 3, age: 0,
            });
            // These are enemy bullets - mark with negative damage as a hack
            // Actually, let's handle boss projectiles separately by tracking them in enemies array as a projectile
            // For simplicity, we'll check boss-to-player collision directly
          }
        }
      } else if (b.type === "death_knight") {
        b.x += dir.x * b.speed * dt;
        b.y += dir.y * b.speed * dt;
        // Phase 2 at 50% HP
        if (b.hp <= b.maxHp / 2) b.phase = 2;
      }

      // Boss collision with player
      if (p.invTimer <= 0 && dist(p, b) < PLAYER_SIZE + b.size / 2) {
        p.hp -= b.damage;
        p.invTimer = INVINCIBLE_TIME;
        spawnParticles(g, p.x, p.y, "#ff0000", 8);
        if (p.hp <= 0) { gameOver(g); return; }
      }

      // Boss collision with allies
      for (let ai = p.allies.length - 1; ai >= 0; ai--) {
        const ally = p.allies[ai];
        const allyX = p.x + Math.cos(ally.angle) * 48;
        const allyY = p.y + Math.sin(ally.angle) * 48;
        if (dist({ x: allyX, y: allyY }, b) < 12 + b.size / 2) {
          ally.hp -= b.damage;
          ally.flashTimer = 0.2;
          if (ally.hp <= 0) {
            p.allies.splice(ai, 1);
            spawnParticles(g, allyX, allyY, COL_ALLY, 8);
            for (let j = 0; j < p.allies.length; j++) {
              p.allies[j].angle = (j / p.allies.length) * Math.PI * 2;
            }
          }
        }
      }

      // Bullet collision with bosses
      for (let bi = g.bullets.length - 1; bi >= 0; bi--) {
        const bullet = g.bullets[bi];
        if (dist(bullet, b) < bullet.size + b.size / 2) {
          b.hp -= bullet.damage;
          b.flashTimer = 0.1;
          if (bullet.pierce <= 0) {
            g.bullets.splice(bi, 1);
          } else {
            bullet.pierce--;
          }
          if (b.hp <= 0) {
            p.score += b.score * 2; // Boss kill bonus
            p.killCount++;
            p.bossKillCount++;
            spawnParticles(g, b.x, b.y, BOSS_COLORS[b.type], 15);
            // Big XP drop
            const gemCount = b.type === "death_knight" ? 20 : b.type === "dragon" ? 10 : 5;
            for (let gi = 0; gi < gemCount; gi++) {
              g.xpGems.push({
                x: b.x + randomInRange(-20, 20),
                y: b.y + randomInRange(-20, 20),
                value: b.type === "death_knight" ? 5 : b.type === "dragon" ? 3 : 2,
                vx: randomInRange(-60, 60),
                vy: randomInRange(-60, 60),
              });
            }
            g.bosses.splice(i, 1);
            break;
          }
        }
      }
    }

    // --- Update XP gems ---
    const collectRange = XP_COLLECT_RANGE * p.xpRangeMulti;
    for (let i = g.xpGems.length - 1; i >= 0; i--) {
      const gem = g.xpGems[i];
      gem.vx *= 0.95;
      gem.vy *= 0.95;
      gem.x += gem.vx * dt;
      gem.y += gem.vy * dt;

      const d = dist(p, gem);
      if (d < collectRange) {
        // Magnetize toward player
        const pullDir = normalize({ x: p.x - gem.x, y: p.y - gem.y });
        const pullSpeed = 300;
        gem.x += pullDir.x * pullSpeed * dt;
        gem.y += pullDir.y * pullSpeed * dt;
      }
      if (d < PLAYER_SIZE) {
        p.xp += gem.value;
        g.xpGems.splice(i, 1);
        // Check level up
        if (p.xp >= p.xpToNext) {
          p.xp -= p.xpToNext;
          p.level++;
          p.xpToNext = BASE_XP + p.level * XP_PER_LEVEL;
          // Show level up modal
          g.upgradeOptions = generateUpgradeOptions(g);
          if (g.upgradeOptions.length > 0) {
            g.screen = "levelup";
            g.selectedUpgrade = -1;
            setScreen("levelup");
          }
          spawnParticles(g, p.x, p.y, COL_YELLOW, 20);
        }
      }
    }

    // --- Update particles ---
    for (let i = g.particles.length - 1; i >= 0; i--) {
      const part = g.particles[i];
      part.x += part.vx * dt;
      part.y += part.vy * dt;
      part.life -= dt;
      if (part.life <= 0) g.particles.splice(i, 1);
    }

    // Performance cap: remove oldest enemies if too many
    if (g.enemies.length > 200) {
      g.enemies.splice(0, g.enemies.length - 200);
    }
  }

  // ============================================================
  // Game over
  // ============================================================
  function gameOver(g: NonNullable<typeof gameRef.current>): void {
    const p = g.player;
    const timeBonus = Math.floor(g.elapsed) * 10;
    p.score += timeBonus;
    g.screen = "gameover";
    setScreen("gameover");
    setFinalScore(p.score);
    setFinalTime(g.elapsed);
    setFinalKills(p.killCount);

    // Save to localStorage
    try {
      const key = "leaderboard_survivors";
      const stored = localStorage.getItem(key);
      const scores = stored ? JSON.parse(stored) : [];
      const best = scores.length > 0 ? Math.max(...scores.map((s: any) => s.score)) : 0;
      g.bestScore = Math.max(best, p.score);
    } catch { g.bestScore = p.score; }
  }

  function saveScore(name: string): void {
    const g = gameRef.current;
    if (!g) return;
    try {
      const key = "leaderboard_survivors";
      const stored = localStorage.getItem(key);
      const scores = stored ? JSON.parse(stored) : [];
      scores.push({
        name: name.slice(0, 3) || "???",
        score: Math.floor(g.player.score),
        date: new Date().toLocaleDateString("ja-JP"),
        survivalTime: Math.floor(g.elapsed),
        kills: g.player.killCount,
      });
      scores.sort((a: any, b: any) => b.score - a.score);
      localStorage.setItem(key, JSON.stringify(scores.slice(0, 30)));
    } catch {}

    // Also save to Firebase if available
    (async () => {
      try {
        const { isFirebaseConfigured, getDatabase } = await import("@/lib/firebase");
        if (isFirebaseConfigured()) {
          const db = await getDatabase();
          if (db) {
            // @ts-ignore
            const { ref, push } = await import("firebase/database");
            await push(ref(db, "leaderboards/survivors"), {
              name: name.slice(0, 3) || "???",
              score: Math.floor(g.player.score),
              date: new Date().toLocaleDateString("ja-JP"),
              survivalTime: Math.floor(g.elapsed),
              kills: g.player.killCount,
            });
          }
        }
      } catch {}
    })();
  }

  // ============================================================
  // Render
  // ============================================================
  function render(g: NonNullable<typeof gameRef.current>, ctx: CanvasRenderingContext2D): void {
    const canvas = canvasRef.current!;
    ctx.fillStyle = COL_BG;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    if (g.screen === "title") {
      renderTitle(ctx);
      return;
    }
    if (g.screen === "howto") {
      renderHowTo(ctx);
      return;
    }
    if (g.screen === "gameover") {
      renderGameOver(g, ctx);
      return;
    }

    const p = g.player;
    const cx = g.cameraX;
    const cy = g.cameraY;

    // --- Background grid ---
    ctx.strokeStyle = "#252540";
    ctx.lineWidth = 1;
    const gridSize = 64;
    const startX = -(cx % gridSize);
    const startY = -(cy % gridSize);
    for (let x = startX; x < CANVAS_WIDTH; x += gridSize) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, CANVAS_HEIGHT); ctx.stroke();
    }
    for (let y = startY; y < CANVAS_HEIGHT; y += gridSize) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(CANVAS_WIDTH, y); ctx.stroke();
    }

    // World boundary indicator
    ctx.strokeStyle = "#ff444466";
    ctx.lineWidth = 3;
    ctx.strokeRect(-cx, -cy, WORLD_SIZE, WORLD_SIZE);

    // --- XP Gems ---
    for (const gem of g.xpGems) {
      const sx = gem.x - cx, sy = gem.y - cy;
      if (sx < -20 || sx > CANVAS_WIDTH + 20 || sy < -20 || sy > CANVAS_HEIGHT + 20) continue;
      ctx.fillStyle = COL_XP_GEM;
      ctx.globalAlpha = 0.7 + Math.sin(g.elapsed * 6 + gem.x) * 0.3;
      ctx.beginPath();
      // Diamond shape
      ctx.moveTo(sx, sy - 4);
      ctx.lineTo(sx + 3, sy);
      ctx.lineTo(sx, sy + 4);
      ctx.lineTo(sx - 3, sy);
      ctx.closePath();
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    // --- Enemies ---
    for (const e of g.enemies) {
      if (!e.visible && e.type === "ghost") continue;
      const sx = e.x - cx, sy = e.y - cy;
      if (sx < -40 || sx > CANVAS_WIDTH + 40 || sy < -40 || sy > CANVAS_HEIGHT + 40) continue;

      ctx.globalAlpha = e.type === "ghost" ? 0.6 : 1;
      const color = e.flashTimer > 0 ? "#ffffff" : ENEMY_COLORS[e.type];
      drawEnemy(ctx, sx, sy, e.size, e.type, color, g.elapsed);
      ctx.globalAlpha = 1;

      // HP bar for damaged enemies
      if (e.hp < e.maxHp) {
        const barW = e.size;
        const barH = 3;
        ctx.fillStyle = "#333";
        ctx.fillRect(sx - barW / 2, sy - e.size / 2 - 6, barW, barH);
        ctx.fillStyle = "#ff4444";
        ctx.fillRect(sx - barW / 2, sy - e.size / 2 - 6, barW * (e.hp / e.maxHp), barH);
      }
    }

    // --- Bosses ---
    for (const b of g.bosses) {
      const sx = b.x - cx, sy = b.y - cy;
      if (sx < -80 || sx > CANVAS_WIDTH + 80 || sy < -80 || sy > CANVAS_HEIGHT + 80) continue;
      const color = b.flashTimer > 0 ? "#ffffff" : BOSS_COLORS[b.type];
      drawBoss(ctx, sx, sy, b.size, b.type, color, g.elapsed);

      // Boss HP bar
      const barW = b.size * 1.5;
      const barH = 4;
      ctx.fillStyle = "#333";
      ctx.fillRect(sx - barW / 2, sy - b.size / 2 - 8, barW, barH);
      ctx.fillStyle = "#ff4444";
      ctx.fillRect(sx - barW / 2, sy - b.size / 2 - 8, barW * (b.hp / b.maxHp), barH);
    }

    // --- Bullets ---
    for (const b of g.bullets) {
      const sx = b.x - cx, sy = b.y - cy;
      if (sx < -20 || sx > CANVAS_WIDTH + 20 || sy < -20 || sy > CANVAS_HEIGHT + 20) continue;
      drawBullet(ctx, sx, sy, b);
    }

    // --- Allies ---
    for (const ally of p.allies) {
      const ax = p.x + Math.cos(ally.angle) * 48 - cx;
      const ay = p.y + Math.sin(ally.angle) * 48 - cy;
      const allyColor = ally.flashTimer > 0 ? "#ffffff" : COL_ALLY;
      ctx.fillStyle = allyColor;
      ctx.beginPath();
      ctx.arc(ax, ay, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.arc(ax - 2, ay - 2, 2, 0, Math.PI * 2);
      ctx.fill();
    }

    // --- Player ---
    const px = p.x - cx, py = p.y - cy;
    if (p.invTimer > 0 && Math.floor(p.invTimer * 10) % 2 === 0) {
      // Blinking
    } else {
      drawPlayer(ctx, px, py);
    }

    // --- Particles ---
    for (const part of g.particles) {
      const sx = part.x - cx, sy = part.y - cy;
      ctx.globalAlpha = part.life / part.maxLife;
      ctx.fillStyle = part.color;
      ctx.fillRect(sx - part.size / 2, sy - part.size / 2, part.size, part.size);
    }
    ctx.globalAlpha = 1;

    // --- HUD ---
    renderHUD(g, ctx);

    // --- Level up modal ---
    if (g.screen === "levelup") {
      renderLevelUpModal(g, ctx);
    }

    // --- Pause overlay ---
    if (g.screen === "paused") {
      ctx.fillStyle = COL_MODAL_BG;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      ctx.fillStyle = COL_TEXT;
      ctx.font = "bold 32px monospace";
      ctx.textAlign = "center";
      ctx.fillText("PAUSED", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 20);
      ctx.font = "16px monospace";
      ctx.fillText("Press ESC or P to resume", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 20);
    }

    // --- Virtual joystick (mobile) ---
    if (g.isMobile && g.touchStart && g.touchDir) {
      ctx.globalAlpha = 0.3;
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(g.touchStart.x, g.touchStart.y, 50, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 0.5;
      ctx.fillStyle = "#00d4ff";
      const knobX = g.touchStart.x + g.touchDir.x * 25;
      const knobY = g.touchStart.y + g.touchDir.y * 25;
      ctx.beginPath();
      ctx.arc(knobX, knobY, 20, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  }

  // ============================================================
  // Draw helpers
  // ============================================================
  function drawPlayer(ctx: CanvasRenderingContext2D, x: number, y: number): void {
    // Simple pixel art character
    const s = 2;
    ctx.fillStyle = COL_PLAYER;
    // Head
    ctx.fillRect(x - 3 * s, y - 7 * s, 6 * s, 6 * s);
    // Body
    ctx.fillStyle = COL_PLAYER_BODY;
    ctx.fillRect(x - 4 * s, y - 1 * s, 8 * s, 6 * s);
    // Eyes
    ctx.fillStyle = "#fff";
    ctx.fillRect(x - 2 * s, y - 5 * s, 1.5 * s, 2 * s);
    ctx.fillRect(x + 0.5 * s, y - 5 * s, 1.5 * s, 2 * s);
    // Feet
    ctx.fillStyle = COL_PLAYER;
    ctx.fillRect(x - 3 * s, y + 5 * s, 2.5 * s, 2 * s);
    ctx.fillRect(x + 0.5 * s, y + 5 * s, 2.5 * s, 2 * s);
  }

  function drawEnemy(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, type: EnemyType, color: string, time: number): void {
    ctx.fillStyle = color;
    const s = size / 2;
    if (type === "slime") {
      // Blob shape
      const bounce = Math.sin(time * 4) * 2;
      ctx.beginPath();
      ctx.ellipse(x, y + bounce, s, s * 0.8, 0, 0, Math.PI * 2);
      ctx.fill();
      // Eyes
      ctx.fillStyle = "#000";
      ctx.fillRect(x - s * 0.35, y - s * 0.2 + bounce, 3, 3);
      ctx.fillRect(x + s * 0.15, y - s * 0.2 + bounce, 3, 3);
    } else if (type === "bat") {
      // Wing flap
      const flapAngle = Math.sin(time * 10) * 0.4;
      ctx.save();
      ctx.translate(x, y);
      // Body
      ctx.beginPath();
      ctx.ellipse(0, 0, s * 0.5, s * 0.6, 0, 0, Math.PI * 2);
      ctx.fill();
      // Wings
      ctx.beginPath();
      ctx.moveTo(-s * 0.3, 0);
      ctx.lineTo(-s, -s * 0.8 + flapAngle * s);
      ctx.lineTo(-s * 0.6, s * 0.3);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(s * 0.3, 0);
      ctx.lineTo(s, -s * 0.8 + flapAngle * s);
      ctx.lineTo(s * 0.6, s * 0.3);
      ctx.fill();
      // Eyes
      ctx.fillStyle = "#ff0000";
      ctx.fillRect(-3, -2, 2, 2);
      ctx.fillRect(1, -2, 2, 2);
      ctx.restore();
    } else if (type === "golem") {
      // Blocky shape
      ctx.fillRect(x - s, y - s, s * 2, s * 2);
      ctx.fillStyle = "#666";
      ctx.fillRect(x - s * 0.6, y - s * 0.6, s * 0.4, s * 0.4);
      ctx.fillRect(x + s * 0.2, y - s * 0.6, s * 0.4, s * 0.4);
      ctx.fillStyle = "#555";
      ctx.fillRect(x - s * 0.3, y + s * 0.1, s * 0.6, s * 0.3);
    } else if (type === "ghost") {
      // Ghost shape
      ctx.beginPath();
      ctx.arc(x, y - s * 0.2, s * 0.7, Math.PI, 0);
      ctx.lineTo(x + s * 0.7, y + s * 0.5);
      for (let i = 0; i < 4; i++) {
        const cx2 = x + s * 0.7 - (i + 0.5) * (s * 1.4 / 4);
        const cy2 = i % 2 === 0 ? y + s * 0.8 : y + s * 0.5;
        ctx.lineTo(cx2, cy2);
      }
      ctx.lineTo(x - s * 0.7, y + s * 0.5);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#000";
      ctx.fillRect(x - s * 0.3, y - s * 0.3, 3, 4);
      ctx.fillRect(x + s * 0.1, y - s * 0.3, 3, 4);
    }
  }

  function drawBoss(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, type: BossType, color: string, time: number): void {
    ctx.fillStyle = color;
    const s = size / 2;
    if (type === "knight_wolf") {
      // Wolf shape
      ctx.beginPath();
      ctx.arc(x, y, s, 0, Math.PI * 2);
      ctx.fill();
      // Ears
      ctx.beginPath();
      ctx.moveTo(x - s * 0.6, y - s * 0.8);
      ctx.lineTo(x - s * 0.2, y - s);
      ctx.lineTo(x - s * 0.1, y - s * 0.5);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(x + s * 0.6, y - s * 0.8);
      ctx.lineTo(x + s * 0.2, y - s);
      ctx.lineTo(x + s * 0.1, y - s * 0.5);
      ctx.fill();
      // Eyes
      ctx.fillStyle = "#ff0000";
      ctx.fillRect(x - s * 0.4, y - s * 0.2, 4, 4);
      ctx.fillRect(x + s * 0.2, y - s * 0.2, 4, 4);
    } else if (type === "dragon") {
      // Dragon shape
      ctx.beginPath();
      ctx.ellipse(x, y, s, s * 0.7, 0, 0, Math.PI * 2);
      ctx.fill();
      // Horns
      ctx.fillStyle = "#ff8800";
      ctx.beginPath();
      ctx.moveTo(x - s * 0.5, y - s * 0.6);
      ctx.lineTo(x - s * 0.3, y - s * 1.2);
      ctx.lineTo(x - s * 0.1, y - s * 0.6);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(x + s * 0.5, y - s * 0.6);
      ctx.lineTo(x + s * 0.3, y - s * 1.2);
      ctx.lineTo(x + s * 0.1, y - s * 0.6);
      ctx.fill();
      // Eyes
      ctx.fillStyle = "#ffff00";
      ctx.fillRect(x - s * 0.35, y - s * 0.15, 5, 5);
      ctx.fillRect(x + s * 0.15, y - s * 0.15, 5, 5);
      // Fire particles
      ctx.fillStyle = "#ff4400";
      const fireOff = Math.sin(time * 8) * 4;
      ctx.fillRect(x - 3, y + s * 0.5 + fireOff, 6, 6);
    } else if (type === "death_knight") {
      // Large dark knight
      ctx.fillStyle = color;
      ctx.fillRect(x - s, y - s, s * 2, s * 2);
      // Helmet
      ctx.fillStyle = "#440066";
      ctx.fillRect(x - s * 0.7, y - s * 1.1, s * 1.4, s * 0.5);
      // Eyes - glowing
      const glow = 0.7 + Math.sin(time * 3) * 0.3;
      ctx.fillStyle = `rgba(255, 0, 255, ${glow})`;
      ctx.fillRect(x - s * 0.4, y - s * 0.6, 5, 5);
      ctx.fillRect(x + s * 0.2, y - s * 0.6, 5, 5);
      // Sword
      ctx.fillStyle = "#cccccc";
      ctx.fillRect(x + s * 0.8, y - s * 0.8, 4, s * 1.6);
    }
  }

  function drawBullet(ctx: CanvasRenderingContext2D, x: number, y: number, b: Bullet): void {
    switch (b.weaponId) {
      case "plasma":
        ctx.fillStyle = "#00ffff";
        ctx.beginPath();
        ctx.arc(x, y, b.size, 0, Math.PI * 2);
        ctx.fill();
        break;
      case "laser":
        ctx.strokeStyle = "#ff00ff";
        ctx.lineWidth = b.size;
        ctx.globalAlpha = 0.8;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x - b.vx * 0.02, y - b.vy * 0.02);
        ctx.stroke();
        ctx.globalAlpha = 1;
        break;
      case "boomerang":
        ctx.fillStyle = "#ffd700";
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate((b.angle || 0) * 3);
        ctx.fillRect(-b.size, -2, b.size * 2, 4);
        ctx.fillRect(-2, -b.size, 4, b.size * 2);
        ctx.restore();
        break;
      case "burst":
        ctx.fillStyle = "#ff8800";
        ctx.beginPath();
        ctx.arc(x, y, b.size, 0, Math.PI * 2);
        ctx.fill();
        break;
      case "homing":
        ctx.fillStyle = "#ff4444";
        ctx.beginPath();
        ctx.moveTo(x, y - b.size);
        ctx.lineTo(x + b.size, y + b.size);
        ctx.lineTo(x - b.size, y + b.size);
        ctx.closePath();
        ctx.fill();
        break;
      case "flame":
        ctx.fillStyle = `rgba(255, ${100 + Math.floor(b.age / b.lifetime * 150)}, 0, ${1 - b.age / b.lifetime})`;
        ctx.beginPath();
        ctx.arc(x, y, b.size * (1 + b.age / b.lifetime), 0, Math.PI * 2);
        ctx.fill();
        break;
    }
  }

  function renderHUD(g: NonNullable<typeof gameRef.current>, ctx: CanvasRenderingContext2D): void {
    const p = g.player;

    // HUD bar background
    ctx.fillStyle = COL_HUD_BG;
    ctx.fillRect(0, 0, CANVAS_WIDTH, 44);

    // Level
    ctx.fillStyle = COL_ACCENT;
    ctx.font = "bold 14px monospace";
    ctx.textAlign = "left";
    ctx.fillText(`Lv.${p.level}`, 10, 18);

    // XP bar
    const xpBarX = 10;
    const xpBarY = 24;
    const xpBarW = 80;
    const xpBarH = 6;
    ctx.fillStyle = "#333";
    ctx.fillRect(xpBarX, xpBarY, xpBarW, xpBarH);
    ctx.fillStyle = COL_XP_GEM;
    ctx.fillRect(xpBarX, xpBarY, xpBarW * (p.xp / p.xpToNext), xpBarH);

    // HP hearts
    const heartStartX = 100;
    for (let i = 0; i < p.maxHp; i++) {
      ctx.fillStyle = i < p.hp ? COL_HP_FULL : COL_HP_EMPTY;
      const hx = heartStartX + i * 16;
      drawHeart(ctx, hx, 14, 6);
    }

    // Ally count
    if (p.allies.length > 0) {
      ctx.fillStyle = COL_ALLY;
      ctx.font = "12px monospace";
      ctx.fillText(`仲間: ${p.allies.length}`, heartStartX, 38);
    }

    // Score (right side)
    ctx.fillStyle = COL_YELLOW;
    ctx.font = "bold 16px monospace";
    ctx.textAlign = "right";
    ctx.fillText(Math.floor(p.score).toLocaleString(), CANVAS_WIDTH - 10, 18);

    // Time
    ctx.fillStyle = COL_TEXT;
    ctx.font = "12px monospace";
    ctx.fillText(formatTime(g.elapsed), CANVAS_WIDTH - 10, 36);

    // Kills
    ctx.fillStyle = "#aaa";
    ctx.textAlign = "right";
    ctx.fillText(`${p.killCount} kills`, CANVAS_WIDTH - 80, 36);

    // Weapon icons
    const weaponNames: Record<WeaponId, string> = {
      plasma: "P", laser: "L", boomerang: "B", burst: "A", homing: "H", flame: "F",
    };
    const weaponColors: Record<WeaponId, string> = {
      plasma: "#00ffff", laser: "#ff00ff", boomerang: "#ffd700",
      burst: "#ff8800", homing: "#ff4444", flame: "#ff6600",
    };
    let wx = CANVAS_WIDTH / 2 - 60;
    for (const [id, state] of Object.entries(p.weapons)) {
      if (state.owned) {
        ctx.fillStyle = weaponColors[id as WeaponId];
        ctx.font = "bold 12px monospace";
        ctx.textAlign = "center";
        ctx.fillText(weaponNames[id as WeaponId], wx, 18);
        wx += 20;
      }
    }

    // Pause button (mobile)
    if (g.isMobile) {
      ctx.fillStyle = "rgba(255,255,255,0.3)";
      ctx.fillRect(CANVAS_WIDTH - 40, 48, 30, 30);
      ctx.fillStyle = "#fff";
      ctx.font = "16px monospace";
      ctx.textAlign = "center";
      ctx.fillText("||", CANVAS_WIDTH - 25, 68);
    }
  }

  function drawHeart(ctx: CanvasRenderingContext2D, x: number, y: number, size: number): void {
    ctx.beginPath();
    ctx.moveTo(x, y + size * 0.3);
    ctx.bezierCurveTo(x, y, x - size, y, x - size, y + size * 0.3);
    ctx.bezierCurveTo(x - size, y + size * 0.7, x, y + size, x, y + size * 1.2);
    ctx.bezierCurveTo(x, y + size, x + size, y + size * 0.7, x + size, y + size * 0.3);
    ctx.bezierCurveTo(x + size, y, x, y, x, y + size * 0.3);
    ctx.fill();
  }

  function renderLevelUpModal(g: NonNullable<typeof gameRef.current>, ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = COL_MODAL_BG;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    ctx.fillStyle = COL_YELLOW;
    ctx.font = "bold 28px monospace";
    ctx.textAlign = "center";
    ctx.fillText("LEVEL UP!", CANVAS_WIDTH / 2, 140);

    ctx.fillStyle = COL_TEXT;
    ctx.font = "14px monospace";
    ctx.fillText(`Lv.${g.player.level} — 強化を1つ選べ`, CANVAS_WIDTH / 2, 170);

    const options = g.upgradeOptions;
    const cardW = 200;
    const cardH = 120;
    const gap = 20;
    const totalW = options.length * cardW + (options.length - 1) * gap;
    const startX = (CANVAS_WIDTH - totalW) / 2;
    const cardY = 200;

    for (let i = 0; i < options.length; i++) {
      const opt = options[i];
      const cx2 = startX + i * (cardW + gap);
      const isSelected = g.selectedUpgrade === i;

      // Card background
      ctx.fillStyle = isSelected ? "#333355" : "#1a1a2e";
      ctx.strokeStyle = isSelected ? opt.color : "#444";
      ctx.lineWidth = isSelected ? 3 : 1;
      ctx.fillRect(cx2, cardY, cardW, cardH);
      ctx.strokeRect(cx2, cardY, cardW, cardH);

      // Number
      ctx.fillStyle = opt.color;
      ctx.font = "bold 20px monospace";
      ctx.textAlign = "center";
      ctx.fillText(`[${i + 1}]`, cx2 + cardW / 2, cardY + 25);

      // Name
      ctx.fillStyle = COL_TEXT;
      ctx.font = "bold 14px monospace";
      ctx.fillText(opt.name, cx2 + cardW / 2, cardY + 55);

      // Description
      ctx.fillStyle = "#aaa";
      ctx.font = "11px monospace";
      // Word wrap
      const words = opt.desc;
      const maxLineW = cardW - 20;
      let line = "";
      let lineY = cardY + 78;
      for (const char of words) {
        const testLine = line + char;
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxLineW) {
          ctx.fillText(line, cx2 + cardW / 2, lineY);
          line = char;
          lineY += 14;
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line, cx2 + cardW / 2, lineY);
    }

    ctx.fillStyle = "#666";
    ctx.font = "12px monospace";
    ctx.textAlign = "center";
    ctx.fillText("1/2/3キーまたはクリックで選択", CANVAS_WIDTH / 2, cardY + cardH + 30);
  }

  function renderTitle(ctx: CanvasRenderingContext2D): void {
    // Background
    ctx.fillStyle = COL_BG;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Decorative grid
    ctx.strokeStyle = "#252540";
    ctx.lineWidth = 1;
    for (let x = 0; x < CANVAS_WIDTH; x += 40) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, CANVAS_HEIGHT); ctx.stroke();
    }
    for (let y = 0; y < CANVAS_HEIGHT; y += 40) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(CANVAS_WIDTH, y); ctx.stroke();
    }

    // Title
    ctx.fillStyle = COL_ACCENT;
    ctx.font = "bold 40px monospace";
    ctx.textAlign = "center";
    ctx.fillText("RETROGAMEBANK", CANVAS_WIDTH / 2, 180);
    ctx.fillStyle = COL_YELLOW;
    ctx.font = "bold 48px monospace";
    ctx.fillText("SURVIVORS", CANVAS_WIDTH / 2, 240);

    // Subtitle
    ctx.fillStyle = "#888";
    ctx.font = "14px monospace";
    ctx.fillText("ローグライト型エンドレスサバイバー", CANVAS_WIDTH / 2, 280);

    // Menu buttons
    const buttons = [
      { label: "GAME START", y: 340, color: COL_ACCENT },
      { label: "HOW TO PLAY", y: 390, color: "#888" },
      { label: "LEADERBOARD", y: 440, color: "#888" },
    ];
    for (const btn of buttons) {
      ctx.fillStyle = btn.color;
      ctx.font = "bold 20px monospace";
      ctx.fillText(btn.label, CANVAS_WIDTH / 2, btn.y);
    }

    ctx.fillStyle = "#555";
    ctx.font = "11px monospace";
    ctx.fillText("© RetroGameBank", CANVAS_WIDTH / 2, CANVAS_HEIGHT - 20);
  }

  function renderHowTo(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = COL_BG;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    ctx.fillStyle = COL_ACCENT;
    ctx.font = "bold 28px monospace";
    ctx.textAlign = "center";
    ctx.fillText("HOW TO PLAY", CANVAS_WIDTH / 2, 60);

    const lines = [
      { text: "【操作方法】", color: COL_YELLOW, size: 16 },
      { text: "WASD / 矢印キー: 移動", color: COL_TEXT, size: 14 },
      { text: "攻撃は自動で行われる", color: COL_TEXT, size: 14 },
      { text: "スマホ: 画面左下をドラッグで移動", color: COL_TEXT, size: 14 },
      { text: "", color: COL_TEXT, size: 10 },
      { text: "【ゲームルール】", color: COL_YELLOW, size: 16 },
      { text: "敵を倒して経験値を集める", color: COL_TEXT, size: 14 },
      { text: "レベルアップ時に武器や能力を強化", color: COL_TEXT, size: 14 },
      { text: "仲間を追加して火力を上げる", color: COL_TEXT, size: 14 },
      { text: "時間が経つほど敵が強くなる", color: COL_TEXT, size: 14 },
      { text: "HPが0になるとゲームオーバー", color: COL_TEXT, size: 14 },
      { text: "", color: COL_TEXT, size: 10 },
      { text: "【スコア】", color: COL_YELLOW, size: 16 },
      { text: "敵撃破 + 生存時間ボーナス + ボス撃破ボーナス", color: COL_TEXT, size: 14 },
    ];

    let y = 110;
    for (const line of lines) {
      ctx.fillStyle = line.color;
      ctx.font = `${line.size}px monospace`;
      ctx.fillText(line.text, CANVAS_WIDTH / 2, y);
      y += line.size + 8;
    }

    ctx.fillStyle = COL_ACCENT;
    ctx.font = "bold 18px monospace";
    ctx.fillText("← BACK", CANVAS_WIDTH / 2, CANVAS_HEIGHT - 50);
  }

  function renderGameOver(g: NonNullable<typeof gameRef.current>, ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = COL_BG;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    ctx.fillStyle = "#ff4444";
    ctx.font = "bold 40px monospace";
    ctx.textAlign = "center";
    ctx.fillText("GAME OVER", CANVAS_WIDTH / 2, 120);

    ctx.fillStyle = COL_TEXT;
    ctx.font = "18px monospace";
    ctx.fillText(`スコア: ${Math.floor(g.player.score).toLocaleString()}`, CANVAS_WIDTH / 2, 200);
    ctx.fillText(`生存時間: ${formatTime(g.elapsed)}`, CANVAS_WIDTH / 2, 235);
    ctx.fillText(`撃破数: ${g.player.killCount}`, CANVAS_WIDTH / 2, 270);
    ctx.fillText(`到達レベル: Lv.${g.player.level}`, CANVAS_WIDTH / 2, 305);

    if (g.bestScore > 0) {
      ctx.fillStyle = COL_YELLOW;
      ctx.font = "14px monospace";
      ctx.fillText(`自己ベスト: ${Math.floor(g.bestScore).toLocaleString()}`, CANVAS_WIDTH / 2, 340);
    }

    // Name input hint
    ctx.fillStyle = "#888";
    ctx.font = "14px monospace";
    ctx.fillText("スコアを登録するには名前を入力（3文字まで）", CANVAS_WIDTH / 2, 390);

    // Buttons
    ctx.fillStyle = COL_ACCENT;
    ctx.font = "bold 20px monospace";
    ctx.fillText("RETRY", CANVAS_WIDTH / 2 - 120, 470);
    ctx.fillStyle = "#888";
    ctx.fillText("TITLE", CANVAS_WIDTH / 2 + 120, 470);
  }

  // ============================================================
  // Setup effect
  // ============================================================
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    gameRef.current = {
      screen: "title",
      player: null as any,
      enemies: [], bosses: [], bullets: [],
      xpGems: [], particles: [],
      elapsed: 0, spawnTimer: 0,
      bossTimers: { knight: 30, dragon: 90, death: 180 },
      bossSpawnCounts: { knight: 0, dragon: 0, death: 0 },
      upgradeOptions: [], selectedUpgrade: -1,
      keys: new Set(), touchDir: null, touchId: null, touchStart: null,
      cameraX: 0, cameraY: 0, hpRegenTimer: 0,
      lastTime: performance.now(), animFrame: 0,
      isMobile, bestScore: 0, nameInput: "",
    };

    // Load best score
    try {
      const stored = localStorage.getItem("leaderboard_survivors");
      if (stored) {
        const scores = JSON.parse(stored);
        if (scores.length > 0) {
          gameRef.current.bestScore = Math.max(...scores.map((s: any) => s.score));
        }
      }
    } catch {}

    // --- Input handlers ---
    const onKeyDown = (e: KeyboardEvent) => {
      const g = gameRef.current;
      if (!g) return;
      g.keys.add(e.key);

      if (g.screen === "title") {
        if (e.key === "Enter" || e.key === " ") {
          initGame();
        }
      } else if (g.screen === "levelup") {
        if (e.key === "1" && g.upgradeOptions.length >= 1) {
          applyUpgrade(g, g.upgradeOptions[0]);
          g.screen = "playing";
          setScreen("playing");
        } else if (e.key === "2" && g.upgradeOptions.length >= 2) {
          applyUpgrade(g, g.upgradeOptions[1]);
          g.screen = "playing";
          setScreen("playing");
        } else if (e.key === "3" && g.upgradeOptions.length >= 3) {
          applyUpgrade(g, g.upgradeOptions[2]);
          g.screen = "playing";
          setScreen("playing");
        }
      } else if (g.screen === "playing") {
        if (e.key === "Escape" || e.key === "p" || e.key === "P") {
          g.screen = "paused";
          setScreen("paused");
        }
      } else if (g.screen === "paused") {
        if (e.key === "Escape" || e.key === "p" || e.key === "P") {
          g.screen = "playing";
          setScreen("playing");
        }
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      const g = gameRef.current;
      if (!g) return;
      g.keys.delete(e.key);
    };

    const getCanvasCoords = (clientX: number, clientY: number): Vec2 => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = CANVAS_WIDTH / rect.width;
      const scaleY = CANVAS_HEIGHT / rect.height;
      return {
        x: (clientX - rect.left) * scaleX,
        y: (clientY - rect.top) * scaleY,
      };
    };

    const onClick = (e: MouseEvent) => {
      const g = gameRef.current;
      if (!g) return;
      const pos = getCanvasCoords(e.clientX, e.clientY);

      if (g.screen === "title") {
        // GAME START area
        if (pos.y >= 325 && pos.y <= 355) { initGame(); return; }
        // HOW TO PLAY
        if (pos.y >= 375 && pos.y <= 405) { g.screen = "howto"; setScreen("howto" as any); return; }
        // LEADERBOARD
        if (pos.y >= 425 && pos.y <= 455) { setShowLeaderboard(true); return; }
      } else if (g.screen === "howto") {
        g.screen = "title";
        setScreen("title");
      } else if (g.screen === "levelup") {
        const options = g.upgradeOptions;
        const cardW = 200;
        const cardH = 120;
        const gap2 = 20;
        const totalW2 = options.length * cardW + (options.length - 1) * gap2;
        const startX2 = (CANVAS_WIDTH - totalW2) / 2;
        const cardY2 = 200;

        for (let i = 0; i < options.length; i++) {
          const cx2 = startX2 + i * (cardW + gap2);
          if (pos.x >= cx2 && pos.x <= cx2 + cardW && pos.y >= cardY2 && pos.y <= cardY2 + cardH) {
            applyUpgrade(g, options[i]);
            g.screen = "playing";
            setScreen("playing");
            return;
          }
        }
      } else if (g.screen === "gameover") {
        // RETRY button area
        if (pos.y >= 455 && pos.y <= 485 && pos.x < CANVAS_WIDTH / 2) {
          initGame();
          return;
        }
        // TITLE button area
        if (pos.y >= 455 && pos.y <= 485 && pos.x >= CANVAS_WIDTH / 2) {
          g.screen = "title";
          setScreen("title");
          return;
        }
      } else if (g.screen === "playing" && g.isMobile) {
        // Pause button
        if (pos.x >= CANVAS_WIDTH - 40 && pos.y >= 48 && pos.y <= 78) {
          g.screen = "paused";
          setScreen("paused");
        }
      }
    };

    const onMouseMove = (e: MouseEvent) => {
      const g = gameRef.current;
      if (!g || g.screen !== "levelup") return;
      const pos = getCanvasCoords(e.clientX, e.clientY);
      const options = g.upgradeOptions;
      const cardW = 200;
      const cardH = 120;
      const gap2 = 20;
      const totalW2 = options.length * cardW + (options.length - 1) * gap2;
      const startX2 = (CANVAS_WIDTH - totalW2) / 2;
      const cardY2 = 200;

      g.selectedUpgrade = -1;
      for (let i = 0; i < options.length; i++) {
        const cx2 = startX2 + i * (cardW + gap2);
        if (pos.x >= cx2 && pos.x <= cx2 + cardW && pos.y >= cardY2 && pos.y <= cardY2 + cardH) {
          g.selectedUpgrade = i;
        }
      }
    };

    // Touch handlers for virtual joystick
    const onTouchStart = (e: TouchEvent) => {
      const g = gameRef.current;
      if (!g) return;
      e.preventDefault();

      for (const touch of Array.from(e.changedTouches)) {
        const pos = getCanvasCoords(touch.clientX, touch.clientY);

        if (g.screen === "title" || g.screen === "gameover" || g.screen === "levelup" || g.screen === "howto") {
          // Simulate click
          onClick({ clientX: touch.clientX, clientY: touch.clientY } as MouseEvent);
          return;
        }

        if (g.screen === "playing" && g.touchId === null) {
          // Start joystick
          if (pos.x < CANVAS_WIDTH * 0.6) {
            g.touchId = touch.identifier;
            g.touchStart = pos;
            g.touchDir = { x: 0, y: 0 };
          }
        }
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      const g = gameRef.current;
      if (!g || g.touchId === null || !g.touchStart) return;
      e.preventDefault();

      for (const touch of Array.from(e.changedTouches)) {
        if (touch.identifier === g.touchId) {
          const pos = getCanvasCoords(touch.clientX, touch.clientY);
          const dx2 = pos.x - g.touchStart.x;
          const dy2 = pos.y - g.touchStart.y;
          const len = Math.sqrt(dx2 * dx2 + dy2 * dy2);
          if (len > 5) {
            g.touchDir = { x: dx2 / len, y: dy2 / len };
          } else {
            g.touchDir = { x: 0, y: 0 };
          }
        }
      }
    };

    const onTouchEnd = (e: TouchEvent) => {
      const g = gameRef.current;
      if (!g) return;

      for (const touch of Array.from(e.changedTouches)) {
        if (touch.identifier === g.touchId) {
          g.touchId = null;
          g.touchDir = null;
          g.touchStart = null;
        }
      }
    };

    // Attach events
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    canvas.addEventListener("click", onClick);
    canvas.addEventListener("mousemove", onMouseMove);
    canvas.addEventListener("touchstart", onTouchStart, { passive: false });
    canvas.addEventListener("touchmove", onTouchMove, { passive: false });
    canvas.addEventListener("touchend", onTouchEnd);

    // Game loop
    let running = true;
    const loop = (now: number) => {
      if (!running) return;
      const g = gameRef.current;
      if (!g) return;
      const dt = Math.min((now - g.lastTime) / 1000, 0.05);
      g.lastTime = now;

      if (g.screen === "playing") {
        updateGame(g, dt);
      }

      render(g, ctx);
      g.animFrame = requestAnimationFrame(loop);
    };

    gameRef.current.animFrame = requestAnimationFrame(loop);

    return () => {
      running = false;
      if (gameRef.current) cancelAnimationFrame(gameRef.current.animFrame);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      canvas.removeEventListener("click", onClick);
      canvas.removeEventListener("mousemove", onMouseMove);
      canvas.removeEventListener("touchstart", onTouchStart);
      canvas.removeEventListener("touchmove", onTouchMove);
      canvas.removeEventListener("touchend", onTouchEnd);
    };
  }, [initGame]);

  // ============================================================
  // Score save handler
  // ============================================================
  const handleSaveScore = () => {
    saveScore(nameInput);
    setNameInput("");
    setShowLeaderboard(true);
  };

  // ============================================================
  // JSX
  // ============================================================
  return (
    <main style={{
      minHeight: "100vh",
      backgroundColor: "#0a0a1a",
      color: "#fff",
      fontFamily: "var(--font-family-pixel, monospace)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      padding: "20px",
    }}>
      <div style={{ width: "100%", maxWidth: "820px" }}>
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "12px",
        }}>
          <h1 style={{
            fontSize: "22px",
            color: COL_ACCENT,
            textShadow: `0 0 10px ${COL_ACCENT}`,
          }}>
            RetroGameBank Survivors
          </h1>
          <a href="/minigame" style={{
            color: "#888",
            fontSize: "13px",
            textDecoration: "none",
          }}>
            ← ミニゲーム一覧
          </a>
        </div>

        <div style={{
          position: "relative",
          width: "100%",
          paddingTop: `${(CANVAS_HEIGHT / CANVAS_WIDTH) * 100}%`,
          backgroundColor: COL_BG,
          borderRadius: "8px",
          overflow: "hidden",
          border: "2px solid #333",
        }}>
          <canvas
            ref={canvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              imageRendering: "pixelated",
            }}
          />
        </div>

        {/* Score registration for game over */}
        {screen === "gameover" && (
          <div style={{
            marginTop: "16px",
            padding: "16px",
            backgroundColor: "#1a1a2e",
            borderRadius: "8px",
            border: "1px solid #333",
            textAlign: "center",
          }}>
            <div style={{ marginBottom: "12px", fontSize: "14px", color: "#aaa" }}>
              スコア登録（3文字まで）
            </div>
            <div style={{ display: "flex", justifyContent: "center", gap: "8px", alignItems: "center" }}>
              <input
                type="text"
                maxLength={3}
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="AAA"
                style={{
                  width: "80px",
                  padding: "8px 12px",
                  fontSize: "18px",
                  fontFamily: "monospace",
                  textAlign: "center",
                  backgroundColor: "#0a0a1a",
                  color: COL_YELLOW,
                  border: `2px solid ${COL_ACCENT}`,
                  borderRadius: "4px",
                  textTransform: "uppercase",
                }}
              />
              <button
                onClick={handleSaveScore}
                style={{
                  padding: "8px 20px",
                  fontSize: "14px",
                  fontFamily: "monospace",
                  backgroundColor: COL_ACCENT,
                  color: "#000",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontWeight: "bold",
                }}
              >
                登録
              </button>
            </div>
          </div>
        )}

        {/* Leaderboard */}
        <div style={{ marginTop: "20px" }}>
          <button
            onClick={() => setShowLeaderboard(!showLeaderboard)}
            style={{
              background: "none",
              border: "1px solid #444",
              color: "#888",
              padding: "8px 16px",
              fontSize: "13px",
              fontFamily: "monospace",
              cursor: "pointer",
              borderRadius: "4px",
              width: "100%",
            }}
          >
            {showLeaderboard ? "ランキングを隠す ▲" : "ランキングを見る ▼"}
          </button>
          {showLeaderboard && (
            <Leaderboard gameId={"survivors" as any} />
          )}
        </div>

        <div style={{
          marginTop: "20px",
          fontSize: "12px",
          color: "#555",
          lineHeight: "1.8",
        }}>
          <p>操作: WASD/矢印キーで移動、攻撃は自動。ESC/Pでポーズ。</p>
          <p>レベルアップ時は1/2/3キーまたはクリックで選択。</p>
          <p>スマホ: 画面左側をドラッグで移動。</p>
        </div>
      </div>
    </main>
  );
}
