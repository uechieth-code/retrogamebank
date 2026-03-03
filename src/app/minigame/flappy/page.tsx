"use client";

import { useEffect, useRef, useState } from "react";
import Leaderboard from "../components/Leaderboard";

const CANVAS_WIDTH = 480;
const CANVAS_HEIGHT = 400;
const BIRD_SIZE = 16;
const GRAVITY = 0.35;
const FLAP_STRENGTH = -8;
const PIPE_WIDTH = 60;
const INITIAL_GAP = 160;
const PIPE_SPEED_START = 3;

interface GameState {
  birdY: number;
  birdVelY: number;
  birdRotation: number;
  score: number;
  gameOver: boolean;
  hasStarted: boolean;
  frameCount: number;
  cameraShake: number;
  pipeSpeed: number;
  minGap: number;
}

interface Pipe {
  x: number;
  gapY: number;
  scored: boolean;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  type: "feather" | "spark" | "text";
  text?: string;
}

// Draw a 16x16 pixel art bird
const drawBird = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  rotation: number,
  frameCount: number,
  scale: number = 2
) => {
  const pixelSize = scale;
  const isFlapping = frameCount % 10 < 5;

  ctx.save();
  ctx.translate(x + (BIRD_SIZE * scale) / 2, y + (BIRD_SIZE * scale) / 2);
  ctx.rotate((rotation * Math.PI) / 180);
  ctx.translate(-((BIRD_SIZE * scale) / 2), -((BIRD_SIZE * scale) / 2));

  // Body: golden yellow rectangle
  ctx.fillStyle = "#ffd700";
  ctx.fillRect(4 * pixelSize, 6 * pixelSize, 8 * pixelSize, 6 * pixelSize);

  // Head: golden yellow
  ctx.fillStyle = "#ffd700";
  ctx.fillRect(6 * pixelSize, 2 * pixelSize, 6 * pixelSize, 4 * pixelSize);

  // Eye: white with black pupil
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(8 * pixelSize, 3 * pixelSize, 3 * pixelSize, 3 * pixelSize);
  ctx.fillStyle = "#000000";
  ctx.fillRect(9 * pixelSize, 3 * pixelSize, 2 * pixelSize, 2 * pixelSize);

  // Beak: orange-red triangle
  ctx.fillStyle = "#ff4444";
  ctx.beginPath();
  ctx.moveTo(12 * pixelSize, 4 * pixelSize);
  ctx.lineTo(14 * pixelSize, 4 * pixelSize);
  ctx.lineTo(13 * pixelSize, 5 * pixelSize);
  ctx.fill();

  // Wing: orange, animated flapping
  ctx.fillStyle = "#ff6b35";
  if (isFlapping) {
    // Wing up
    ctx.fillRect(3 * pixelSize, 6 * pixelSize, 2 * pixelSize, 4 * pixelSize);
  } else {
    // Wing down
    ctx.fillRect(3 * pixelSize, 8 * pixelSize, 2 * pixelSize, 3 * pixelSize);
  }

  ctx.restore();
};

// Draw retro-styled pipes
const drawPipe = (
  ctx: CanvasRenderingContext2D,
  x: number,
  gapY: number,
  gapSize: number,
  scale: number = 1
) => {
  const pipeX = x * scale;
  const pipeW = PIPE_WIDTH * scale;
  const gapH = gapSize * scale;

  // Pipe cap styling
  const capHeight = 12;

  // Top pipe
  // Pipe cap
  ctx.fillStyle = "#008844";
  ctx.fillRect(pipeX - 6, gapY - capHeight, pipeW + 12, capHeight);

  // Cap highlight
  ctx.fillStyle = "#00ff88";
  ctx.fillRect(pipeX - 6, gapY - capHeight + 2, pipeW + 12, 2);

  // Main pipe body
  ctx.fillStyle = "#00bb66";
  ctx.fillRect(pipeX, gapY - 200 - capHeight, pipeW, 200);

  // Pipe shadow/detail
  ctx.fillStyle = "#008844";
  ctx.fillRect(pipeX + pipeW - 8, gapY - 200 - capHeight, 8, 200);

  // Bottom pipe
  const bottomPipeY = gapY + gapH;

  // Pipe cap
  ctx.fillStyle = "#008844";
  ctx.fillRect(pipeX - 6, bottomPipeY, pipeW + 12, capHeight);

  // Cap highlight
  ctx.fillStyle = "#00ff88";
  ctx.fillRect(pipeX - 6, bottomPipeY + 2, pipeW + 12, 2);

  // Main pipe body
  ctx.fillStyle = "#00bb66";
  ctx.fillRect(pipeX, bottomPipeY + capHeight, pipeW, 200);

  // Pipe shadow/detail
  ctx.fillStyle = "#008844";
  ctx.fillRect(pipeX + pipeW - 8, bottomPipeY + capHeight, 8, 200);
};

// Draw parallax background
const drawBackground = (
  ctx: CanvasRenderingContext2D,
  frameCount: number,
  scale: number = 1
) => {
  // Sky gradient
  const gradient = ctx.createLinearGradient(
    0,
    0,
    0,
    CANVAS_HEIGHT * scale
  );
  gradient.addColorStop(0, "#87CEEB");
  gradient.addColorStop(0.7, "#b0d9f0");
  gradient.addColorStop(1, "#e6f2ff");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, CANVAS_WIDTH * scale, CANVAS_HEIGHT * scale);

  // Far background - clouds/silhouette (slow scroll)
  ctx.fillStyle = "rgba(200, 220, 240, 0.4)";
  const cloudOffset = ((frameCount * 0.5) % (CANVAS_WIDTH * 2)) * scale;
  drawClouds(ctx, -cloudOffset, 30 * scale, scale);
  drawClouds(ctx, CANVAS_WIDTH * scale - cloudOffset, 30 * scale, scale);

  // Mid background - hills with trees
  ctx.fillStyle = "#7cb342";
  ctx.beginPath();
  ctx.moveTo(0, 200 * scale);
  for (let i = 0; i < CANVAS_WIDTH + 100; i += 40) {
    const offset = i - ((frameCount * 1.5) % (CANVAS_WIDTH * 2));
    ctx.quadraticCurveTo(
      offset + 20,
      180 * scale,
      offset + 40,
      200 * scale
    );
  }
  ctx.lineTo(CANVAS_WIDTH * scale, CANVAS_HEIGHT * scale);
  ctx.lineTo(0, CANVAS_HEIGHT * scale);
  ctx.fill();

  // Near ground with grass and detail
  const groundOffset = (frameCount * 3) % (40 * scale);
  ctx.fillStyle = "#8b6f47";
  ctx.fillRect(0, 360 * scale, CANVAS_WIDTH * scale, 40 * scale);

  // Grass blades
  ctx.fillStyle = "#558b2f";
  for (let i = 0; i < CANVAS_WIDTH + 40; i += 20) {
    const x = i - groundOffset;
    ctx.fillRect(x * scale, 357 * scale, 3 * scale, 3 * scale);
  }

  // Ground detail pattern
  ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
  for (let i = 0; i < CANVAS_WIDTH + 40; i += 40) {
    const x = i - groundOffset;
    ctx.fillRect(x * scale, 360 * scale, 20 * scale, 40 * scale);
  }
};

const drawClouds = (
  ctx: CanvasRenderingContext2D,
  offsetX: number,
  y: number,
  scale: number
) => {
  ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
  for (let i = 0; i < 5; i++) {
    const cloudX = offsetX + i * 150 * scale;
    // Simple cloud shape using circles
    ctx.beginPath();
    ctx.arc(cloudX, y, 15 * scale, 0, Math.PI * 2);
    ctx.arc(cloudX + 20 * scale, y - 5 * scale, 18 * scale, 0, Math.PI * 2);
    ctx.arc(cloudX + 40 * scale, y, 15 * scale, 0, Math.PI * 2);
    ctx.fill();
  }
};

// Draw ground tile
const drawGround = (
  ctx: CanvasRenderingContext2D,
  scale: number = 1
) => {
  ctx.fillStyle = "#8b6f47";
  ctx.fillRect(0, 360 * scale, CANVAS_WIDTH * scale, 40 * scale);

  // Grass top
  ctx.fillStyle = "#558b2f";
  ctx.fillRect(0, 355 * scale, CANVAS_WIDTH * scale, 5 * scale);

  // Dirt pattern
  ctx.fillStyle = "#704020";
  for (let i = 0; i < 12; i++) {
    ctx.fillRect(
      (i * 40) * scale,
      365 * scale,
      20 * scale,
      20 * scale
    );
  }
};

export default function FlappyGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<GameState>({
    birdY: CANVAS_HEIGHT / 2,
    birdVelY: 0,
    birdRotation: 0,
    score: 0,
    gameOver: false,
    hasStarted: false,
    frameCount: 0,
    cameraShake: 0,
    pipeSpeed: PIPE_SPEED_START,
    minGap: INITIAL_GAP,
  });

  const [pipes, setPipes] = useState<Pipe[]>([
    { x: CANVAS_WIDTH + 100, gapY: 150, scored: false },
  ]);

  const [particles, setParticles] = useState<Particle[]>([]);
  const [playerName, setPlayerName] = useState("");
  const [submitMessage, setSubmitMessage] = useState("");

  const birdX = 80;
  const inputRef = useRef<HTMLInputElement>(null);

  // Handle input
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        if (!gameState.hasStarted) {
          setGameState((prev) => ({ ...prev, hasStarted: true }));
        } else if (!gameState.gameOver) {
          setGameState((prev) => ({
            ...prev,
            birdVelY: FLAP_STRENGTH,
          }));
          // Add feather particles
          setParticles((prev) => [
            ...prev,
            {
              x: birdX + BIRD_SIZE,
              y: gameState.birdY + BIRD_SIZE / 2,
              vx: Math.random() * 2 - 1,
              vy: Math.random() * 2 - 1,
              life: 30,
              type: "feather",
            },
          ]);
        }
      }
    };

    const handleClick = () => {
      if (!gameState.hasStarted) {
        setGameState((prev) => ({ ...prev, hasStarted: true }));
      } else if (!gameState.gameOver) {
        setGameState((prev) => ({
          ...prev,
          birdVelY: FLAP_STRENGTH,
        }));
        // Add feather particles
        setParticles((prev) => [
          ...prev,
          {
            x: birdX + BIRD_SIZE,
            y: gameState.birdY + BIRD_SIZE / 2,
            vx: Math.random() * 2 - 1,
            vy: Math.random() * 2 - 1,
            life: 30,
            type: "feather",
          },
        ]);
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    canvasRef.current?.addEventListener("click", handleClick);

    return () => {
      window.removeEventListener("keydown", handleKeyPress);
      canvasRef.current?.removeEventListener("click", handleClick);
    };
  }, [gameState, birdX]);

  // Game loop
  useEffect(() => {
    const gameLoop = setInterval(() => {
      setGameState((prevState) => {
        if (!prevState.hasStarted) return prevState;

        let newState = { ...prevState };
        newState.frameCount += 1;

        if (!newState.gameOver) {
          // Apply gravity
          newState.birdVelY += GRAVITY;
          newState.birdY += newState.birdVelY;

          // Calculate rotation based on velocity
          newState.birdRotation = Math.min(
            Math.max(newState.birdVelY * 5, -30),
            90
          );

          // Collision with ground
          if (newState.birdY + BIRD_SIZE > CANVAS_HEIGHT - 40) {
            newState.gameOver = true;
            newState.cameraShake = 10;
          }

          // Collision with top
          if (newState.birdY < 0) {
            newState.gameOver = true;
            newState.cameraShake = 10;
          }
        }

        // Update camera shake
        if (newState.cameraShake > 0) {
          newState.cameraShake -= 1;
        }

        return newState;
      });

      // Update pipes and collision
      setPipes((prevPipes) => {
        let newPipes = prevPipes
          .map((pipe) => ({
            ...pipe,
            x: pipe.x - gameState.pipeSpeed,
          }))
          .filter((pipe) => pipe.x > -PIPE_WIDTH);

        // Spawn new pipe
        const lastPipe = prevPipes[prevPipes.length - 1];
        if (lastPipe.x < CANVAS_WIDTH - 150) {
          newPipes.push({
            x: CANVAS_WIDTH + 50,
            gapY: Math.random() * (CANVAS_HEIGHT - 200 - gameState.minGap) + 100,
            scored: false,
          });
        }

        // Check collisions and scoring
        newPipes = newPipes.map((pipe) => {
          // Collision detection
          if (!gameState.gameOver) {
            const birdLeft = birdX;
            const birdRight = birdX + BIRD_SIZE * 2;
            const birdTop = gameState.birdY;
            const birdBottom = gameState.birdY + BIRD_SIZE * 2;

            const pipeLeft = pipe.x;
            const pipeRight = pipe.x + PIPE_WIDTH;

            if (birdRight > pipeLeft && birdLeft < pipeRight) {
              // Check gap collision
              if (
                birdTop < pipe.gapY ||
                birdBottom > pipe.gapY + gameState.minGap
              ) {
                setGameState((prev) => ({
                  ...prev,
                  gameOver: true,
                  cameraShake: 10,
                }));
              }
            }

            // Scoring
            if (
              !pipe.scored &&
              birdRight > pipeLeft &&
              birdRight < pipeRight
            ) {
              setGameState((prev) => {
                const newScore = prev.score + 1;
                // Increase difficulty every 10 pipes
                const newPipeSpeed =
                  PIPE_SPEED_START + Math.floor(newScore / 10) * 0.3;
                const newMinGap = Math.max(
                  INITIAL_GAP - Math.floor(newScore / 20) * 3,
                  130
                );

                // Add score popup
                setParticles((prev) => [
                  ...prev,
                  {
                    x: birdX,
                    y: gameState.birdY,
                    vx: 0,
                    vy: -2,
                    life: 60,
                    type: "text",
                    text: "+1",
                  },
                ]);

                // Milestone sparkles
                if (
                  newScore % 10 === 0 &&
                  [10, 25, 50, 100].includes(newScore)
                ) {
                  for (let i = 0; i < 8; i++) {
                    setParticles((p) => [
                      ...p,
                      {
                        x: birdX + BIRD_SIZE,
                        y: gameState.birdY,
                        vx: Math.cos((i / 8) * Math.PI * 2) * 3,
                        vy: Math.sin((i / 8) * Math.PI * 2) * 3,
                        life: 50,
                        type: "spark",
                      },
                    ]);
                  }
                }

                return {
                  ...prev,
                  score: newScore,
                  pipeSpeed: newPipeSpeed,
                  minGap: newMinGap,
                };
              });

              return { ...pipe, scored: true };
            }
          }

          return pipe;
        });

        return newPipes;
      });

      // Update particles
      setParticles((prev) =>
        prev
          .map((p) => ({
            ...p,
            x: p.x + p.vx,
            y: p.y + p.vy,
            vy: p.vy + 0.2,
            life: p.life - 1,
          }))
          .filter((p) => p.life > 0)
      );
    }, 1000 / 60);

    return () => clearInterval(gameLoop);
  }, [gameState.pipeSpeed, gameState.minGap, gameState.gameOver]);

  // Draw canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Apply camera shake
    if (gameState.cameraShake > 0) {
      ctx.translate(
        (Math.random() - 0.5) * gameState.cameraShake,
        (Math.random() - 0.5) * gameState.cameraShake
      );
    }

    // Draw background
    drawBackground(ctx, gameState.frameCount);

    // Draw pipes
    pipes.forEach((pipe) => {
      drawPipe(ctx, pipe.x, pipe.gapY, gameState.minGap);
    });

    // Draw ground
    drawGround(ctx);

    // Draw bird with squash/stretch effect
    drawBird(
      ctx,
      birdX,
      gameState.birdY,
      gameState.birdRotation,
      gameState.frameCount,
      2
    );

    // Draw particles
    particles.forEach((p) => {
      const opacity = p.life / 60;
      if (p.type === "feather") {
        ctx.fillStyle = `rgba(255, 180, 100, ${opacity})`;
        ctx.fillRect(p.x, p.y, 3, 3);
      } else if (p.type === "spark") {
        ctx.fillStyle = `rgba(255, 255, 100, ${opacity})`;
        ctx.fillRect(p.x, p.y, 2, 2);
      } else if (p.type === "text") {
        ctx.fillStyle = `rgba(255, 255, 100, ${opacity})`;
        ctx.font = "bold 16px Arial";
        ctx.fillText(p.text || "+1", p.x, p.y);
      }
    });

    // Draw start screen
    if (!gameState.hasStarted) {
      ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 32px Arial";
      ctx.textAlign = "center";
      ctx.fillText("PATAPATA BIRD", CANVAS_WIDTH / 2, 150);

      ctx.font = "20px Arial";
      ctx.fillText("TAP TO START", CANVAS_WIDTH / 2, 250);
      ctx.fillText("or press SPACE", CANVAS_WIDTH / 2, 280);
    }

    // Draw game over screen
    if (gameState.gameOver && gameState.hasStarted) {
      ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 32px Arial";
      ctx.textAlign = "center";
      ctx.fillText("GAME OVER", CANVAS_WIDTH / 2, 140);

      ctx.font = "24px Arial";
      ctx.fillText(`Score: ${gameState.score}`, CANVAS_WIDTH / 2, 200);

      ctx.font = "16px Arial";
      ctx.fillText("TAP TO RESTART", CANVAS_WIDTH / 2, 280);
    }

    // Draw score
    if (gameState.hasStarted) {
      ctx.fillStyle = "#000000";
      ctx.font = "bold 24px Arial";
      ctx.textAlign = "left";
      ctx.fillText(gameState.score.toString(), 20, 40);
    }

    ctx.restore();
  }, [gameState, pipes, particles]);

  const handleRestart = () => {
    setGameState({
      birdY: CANVAS_HEIGHT / 2,
      birdVelY: 0,
      birdRotation: 0,
      score: 0,
      gameOver: false,
      hasStarted: false,
      frameCount: 0,
      cameraShake: 0,
      pipeSpeed: PIPE_SPEED_START,
      minGap: INITIAL_GAP,
    });
    setPipes([{ x: CANVAS_WIDTH + 100, gapY: 150, scored: false }]);
    setParticles([]);
    setSubmitMessage("");
  };

  const handleSubmitScore = async () => {
    if (!playerName.trim()) {
      setSubmitMessage("Please enter your name");
      return;
    }

    try {
      const response = await fetch("/api/leaderboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gameId: "flappy",
          name: playerName,
          score: gameState.score,
        }),
      });

      if (response.ok) {
        setSubmitMessage("Score submitted!");
        setPlayerName("");
        setTimeout(() => {
          handleRestart();
          setSubmitMessage("");
        }, 2000);
      } else {
        setSubmitMessage("Failed to submit score");
      }
    } catch (error) {
      setSubmitMessage("Error submitting score");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 p-4">
      <div className="w-full max-w-2xl">
        <h1 className="text-4xl font-bold text-white text-center mb-6">
          Flappy Bird
        </h1>

        <div className="flex flex-col items-center gap-4">
          <canvas
            ref={canvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            className="border-4 border-yellow-400 bg-blue-300 shadow-lg"
          />

          <button
            onClick={() => {
              if (!gameState.hasStarted) {
                setGameState((prev) => ({ ...prev, hasStarted: true }));
              } else if (!gameState.gameOver) {
                setGameState((prev) => ({
                  ...prev,
                  birdVelY: FLAP_STRENGTH,
                }));
              }
            }}
            className="px-8 py-3 bg-yellow-400 text-black font-bold rounded text-lg hover:bg-yellow-300 transition"
          >
            FLAP
          </button>

          {gameState.gameOver && (
            <div className="w-full bg-gray-800 p-4 rounded text-white text-center">
              <p className="text-xl font-bold mb-2">Final Score: {gameState.score}</p>
              <input
                ref={inputRef}
                type="text"
                placeholder="Enter your name"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                onKeyPress={(e) =>
                  e.key === "Enter" && handleSubmitScore()
                }
                className="w-full mb-2 px-3 py-2 bg-gray-700 text-white rounded"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSubmitScore}
                  className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 rounded font-bold transition"
                >
                  Submit Score
                </button>
                <button
                  onClick={handleRestart}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded font-bold transition"
                >
                  Play Again
                </button>
              </div>
              {submitMessage && (
                <p className="mt-2 text-yellow-300">{submitMessage}</p>
              )}
            </div>
          )}
        </div>

        <div className="mt-8">
          <Leaderboard gameId="flappy" />
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
            marginTop: "30px",
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          <p style={{ marginBottom: "10px", fontWeight: "bold", color: "var(--color-retro-accent)" }}>
            操作:
          </p>
          <ul style={{ marginLeft: "20px", marginBottom: "15px" }}>
            <li>スペースキー / クリック / FLAPボタン: 羽ばたく</li>
          </ul>

          <p style={{ marginBottom: "10px", fontWeight: "bold", color: "var(--color-retro-accent)" }}>
            ルール:
          </p>
          <ul style={{ marginLeft: "20px" }}>
            <li>土管の隙間をくぐり抜けよう</li>
            <li>土管を1つ通過するごとに1点</li>
            <li>土管や地面に当たるとゲームオーバー</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
