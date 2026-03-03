# PAC-MAZE Game

A classic Pac-Man style maze game for RetroGameBank with SFC-era pixel art styling.

## Game Overview

Navigate a 19x15 grid maze collecting dots while avoiding or outwitting 4 ghost enemies. Collect all dots to clear the level and progress to increasingly challenging mazes with faster ghosts.

## Gameplay Mechanics

### Player
- Yellow circle character (Pac-Man style)
- Animates mouth opening/closing as it moves
- Move with Arrow Keys or WASD
- Grid-based movement constrained to maze paths

### Enemies
Four ghost types with distinct AI personalities:

1. **Blinky (Red #ff4444)** - Chases player directly
2. **Pinky (Pink #ff88cc)** - Aims 4 tiles ahead of player
3. **Inky (Cyan #00d4ff)** - Random movement (simplified AI)
4. **Clyde (Orange #ff6b35)** - Chases when far (>8 tiles), scatters when close

### Power Pellets
- 4 large pulsing pellets in maze corners
- Makes ghosts vulnerable for 8 seconds
- Eat vulnerable ghosts for escalating points: 200 → 400 → 800 → 1600

### Scoring
- Regular Dot: 10 points
- Power Pellet: 50 points
- Vulnerable Ghost: 200-1600 points (combo multiplier)
- Level Clear: 1000 × level

### Lives System
- Start with 3 lives
- Lose 1 life when touched by non-vulnerable ghost
- Game over when all lives lost

## Controls

### Keyboard
- Arrow Keys: Move up/down/left/right
- WASD: Alternative movement controls
- Enter: Start game from menu

### D-Pad (Mobile/Console)
On-screen 50px buttons:
```
      [▲]
[◀] [▼] [▶]
```

## Levels

### Level Progression
- Ghosts move faster each level (1.15x speed multiplier per level)
- 2 preset maze layouts that cycle
- Level Clear bonus: 1000 points × level number

### Maze 1
Classic symmetrical design with central hub

### Maze 2
Asymmetrical design with varied corridors

## Visual Design

- Canvas: 480×400px
- Grid: 19×15 cells (24px each)
- Walls: Bright blue (#2222ff) with highlight edges
- Dots: White circles (4px)
- Power Pellets: Yellow pulsing circles (8px)
- Vulnerable Mode: Ghosts turn dark blue (#2222aa)

## Game States

1. **START** - "READY?" prompt with START button
2. **PLAYING** - Active gameplay
3. **LEVELCLEAR** - Level completion with NEXT LEVEL button
4. **GAMEOVER** - Final score display with PLAY AGAIN button

## Leaderboard Integration

Scores are automatically submitted to the retrogamebank leaderboard system.
Game ID: "maze"

## Technical Details

- Built with React + Canvas API
- 60 FPS game loop
- Responsive controls (keyboard, mouse, touch)
- Smooth ghost AI pathfinding
- Score/Level/Lives tracking

## Files
- `/src/app/minigame/maze/page.tsx` - Main game component (679 lines)
- Leaderboard imported from `../components/Leaderboard`
