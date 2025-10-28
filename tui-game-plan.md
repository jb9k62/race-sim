# OpenTUI Racing Game - Implementation Plan

## Overview

This document outlines the plan to convert the vertical lane JavaScript racing game into a modern OpenTUI-based TUI application. The goal is to create a split-pane interface with the racing game on the left and interactive stats on the right, while maintaining clean architecture and showcasing OpenTUI's capabilities.

---

## Architecture Philosophy

### Core Principles

1. **Separation of Concerns**: Game logic, rendering, and UI components remain decoupled
2. **Controller Pattern Preservation**: Keep the existing `RandomController` architecture
3. **Component-Based UI**: Build reusable OpenTUI components for game elements
4. **Frame-Based Updates**: Use OpenTUI's frame callback system (not setInterval)
5. **Educational Focus**: Document patterns and decisions for learning

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    OpenTUI Renderer                          │
│  ┌────────────────────────────┬─────────────────────────┐   │
│  │                            │                         │   │
│  │    Game Pane (Left)        │   Stats Pane (Right)    │   │
│  │                            │                         │   │
│  │  ┌──────────────────────┐  │  ┌──────────────────┐  │   │
│  │  │   Track Renderer     │  │  │   Tab Controller │  │   │
│  │  │   (FrameBuffer or    │  │  │   - Overview     │  │   │
│  │  │    Box with Text)    │  │  │   - Cars Detail  │  │   │
│  │  │                      │  │  │   - Events Log   │  │   │
│  │  │  Lane 1  Lane 2      │  │  │   - Settings     │  │   │
│  │  │    🏎️      🚗        │  │  └──────────────────┘  │   │
│  │  │    🌳               │  │                         │   │
│  │  │           🏎️        │  │  ┌──────────────────┐  │   │
│  │  │                      │  │  │  Interactive     │  │   │
│  │  │  Lane 3  Lane 4      │  │  │  Controls        │  │   │
│  │  │           🌳        │  │  │  [Button] Pause  │  │   │
│  │  │    🏎️                │  │  │  [Select] Speed  │  │   │
│  │  │                      │  │  └──────────────────┘  │   │
│  │  └──────────────────────┘  │                         │   │
│  │                            │                         │   │
│  └────────────────────────────┴─────────────────────────┘   │
│                                                              │
│  Frame Callback: 30 FPS update loop                          │
└─────────────────────────────────────────────────────────────┘
```

---

## Implementation Decisions Summary

Based on user preferences:

1. ✅ **Rendering Approach**: Positioned TextRenderables (Option B) - simpler, easier to learn
2. ✅ **Track Orientation**: Vertical (top-to-bottom) - matches original game
3. ✅ **MVP Stats Tabs**: Overview + Cars Detail + Events (all 3 implemented in Phase 4)
4. ✅ **Animation**: 30 FPS rendering, game logic updates every 0.5 seconds (decoupled rates)
5. ✅ **Visual Style**: Minimalist initially, polish later
6. ✅ **Code Porting**: Copy JavaScript entities/logic to TypeScript as closely as possible

---

## Phase 1: Foundation Setup

### 1.1 Project Structure

Create new directory structure:

```
tui/
├── racing-game/
│   ├── main.ts              # Entry point, renderer initialization
│   ├── game-renderer.ts     # OpenTUI game rendering layer
│   ├── stats-panel.ts       # Stats pane component
│   ├── components/
│   │   ├── game-pane.ts     # Left pane: game display
│   │   ├── track-view.ts    # Track rendering component
│   │   ├── car-sprite.ts    # Individual car rendering
│   │   └── obstacle-sprite.ts # Obstacle rendering
│   ├── game-logic/          # Ported from javascript/src/
│   │   ├── game.ts          # Core game (ported to TypeScript)
│   │   ├── entities/        # Car, Obstacle (ported to TypeScript)
│   │   │   ├── car.ts
│   │   │   └── obstacle.ts
│   │   └── controllers/     # RandomController (ported to TypeScript)
│   │       └── random-controller.ts
│   └── types/
│       └── game-types.ts    # Shared types
```

**Key OpenTUI Concepts**:
- `main.ts` creates the `CliRenderer` using `createCliRenderer()`
- Root renderer manages the component tree
- Components are `Renderable` objects added to the tree

**Code Porting Strategy**:
- Copy JavaScript files from `javascript/src/` to TypeScript in `tui/racing-game/game-logic/`
- Add TypeScript type annotations
- Keep logic as similar as possible for easy comparison
- Adapt only where necessary for OpenTUI integration

### 1.2 Renderer Initialization

```typescript
// main.ts
import { createCliRenderer } from "@opentui/core"

const renderer = await createCliRenderer({
  exitOnCtrlC: true,
  targetFps: 30,              // 30 FPS for smooth animation
  useAlternateScreen: true,   // Preserve terminal content on exit
  useMouse: true,             // Enable mouse for buttons/tabs
})

renderer.start()
renderer.setBackgroundColor("#0a0a0a")  // Dark background
```

**Learning Notes**:
- `createCliRenderer()` is async - must await
- `targetFps: 30` sets frame rate (game runs at 30 FPS)
- `useAlternateScreen` cleans up terminal on exit
- `useMouse` enables click interactions for tabs/buttons

### 1.3 Frame Callback Pattern with Decoupled Update Rate

Replace the existing `setInterval` game loop with OpenTUI's frame callback, with **decoupled rendering and game update rates**:

```typescript
// Configuration: Decouple rendering FPS from game update rate
const RENDER_FPS = 30                    // OpenTUI renders at 30 FPS
const GAME_UPDATE_INTERVAL_MS = 500      // Game logic updates every 0.5 seconds
let gameUpdateAccumulator = 0            // Tracks time since last game update

let frameCallback: ((deltaMs: number) => Promise<void>) | null = null

frameCallback = async (deltaMs: number) => {
  // deltaMs: milliseconds since last frame (typically ~33ms at 30 FPS)

  // Accumulate time for game updates
  gameUpdateAccumulator += deltaMs

  // Update game logic at slower rate (every 500ms)
  if (gameUpdateAccumulator >= GAME_UPDATE_INTERVAL_MS) {
    await game.updateAsync(gameUpdateAccumulator)
    gameUpdateAccumulator = 0  // Reset accumulator
  }

  // Always update visual components at 30 FPS (smooth animation)
  const gameState = game.getStateSnapshot()
  gamePane.update(gameState)
  statsPanel.update(gameState)
}

renderer.setFrameCallback(frameCallback)

// Cleanup on exit
renderer.keyInput.on("keypress", (key) => {
  if (key.name === "escape") {
    renderer.removeFrameCallback(frameCallback)
    renderer.stop()
  }
})
```

**Learning Notes**:
- **Decoupled rates**: OpenTUI renders at 30 FPS, but game logic updates every 0.5 seconds
- **Accumulator pattern**: Tracks elapsed time between game updates
- **Smooth visuals**: UI updates every frame for responsive feel
- **Configurable**: Change `GAME_UPDATE_INTERVAL_MS` to speed up/slow down gameplay
- `deltaMs` replaces fixed time steps - makes animation frame-independent
- Frame callback is async - supports the existing async game logic
- `getStateSnapshot()` feeds data to UI components

---

## Phase 2: Layout Structure

### 2.1 Two-Pane Layout (Horizontal Split)

**Concept**: Use flexbox layout to divide screen into left (game) and right (stats) panes.

```typescript
// main.ts

// Container for both panes
const mainContainer = new BoxRenderable(renderer, {
  id: "main-container",
  flexDirection: "row",       // Horizontal layout
  alignItems: "stretch",      // Fill full height
  width: renderer.terminalWidth,
  height: renderer.terminalHeight,
  position: "absolute",
  left: 0,
  top: 0,
})

// Left pane: Game (60% width)
const gamePane = new BoxRenderable(renderer, {
  id: "game-pane",
  flexGrow: 3,                // 3 parts out of 5
  flexShrink: 0,
  backgroundColor: "#1a1a2e",
  border: true,
  borderStyle: "rounded",
  borderColor: "#16213e",
  title: "🏁 Race Track",
  titleAlignment: "center",
})

// Right pane: Stats (40% width)
const statsPane = new BoxRenderable(renderer, {
  id: "stats-pane",
  flexGrow: 2,                // 2 parts out of 5
  flexShrink: 0,
  backgroundColor: "#0f3460",
  border: true,
  borderStyle: "rounded",
  borderColor: "#533483",
  title: "📊 Stats & Info",
  titleAlignment: "center",
})

mainContainer.add(gamePane)
mainContainer.add(statsPane)
renderer.root.add(mainContainer)
```

**Learning Notes**:
- `flexDirection: "row"` creates horizontal split
- `flexGrow` ratio determines relative widths (3:2 = 60:40)
- `alignItems: "stretch"` makes panes fill full height
- `border: true` with `borderStyle` adds visual separation
- `title` property adds centered labels

### 2.2 Responsive Sizing

Handle terminal resize events:

```typescript
const handleResize = () => {
  mainContainer.width = renderer.terminalWidth
  mainContainer.height = renderer.terminalHeight

  // Recalculate game track dimensions
  gamePane.update()
}

renderer.on("resize", handleResize)
```

**Learning Notes**:
- OpenTUI's Yoga layout auto-recalculates on property changes
- `resize` event fires when terminal size changes
- Components should adapt to new dimensions

---

## Phase 3: Game Pane Implementation

### 3.1 Track Rendering Approach: Positioned Text Components

**Decision**: Use **Positioned TextRenderables** for simplicity and ease of learning.

**Why This Approach**:
- ✅ Higher-level component API - easier to understand
- ✅ Better for text/emoji rendering (cars and obstacles)
- ✅ Simpler state management - each entity is its own component
- ✅ Good performance for our use case (4 cars + ~10 obstacles)
- ✅ Easy to debug - can inspect individual components
- ℹ️ Can migrate to FrameBuffer later if performance becomes an issue

**Implementation**:

```typescript
// Track container
const track = new BoxRenderable(renderer, {
  id: "track",
  position: "relative",
  flexGrow: 1,
  backgroundColor: "#1a1a2e",
})

// Lane dividers (static text) - vertical lines
for (let i = 0; i < NUM_LANES + 1; i++) {
  const divider = new TextRenderable(renderer, {
    id: `lane-divider-${i}`,
    content: "│".repeat(TRACK_LENGTH),
    position: "absolute",
    left: i * LANE_WIDTH,
    top: 0,
    fg: "#4a4a4a",
  })
  track.add(divider)
}

// Dynamic car (updated each frame)
const carSprite = new TextRenderable(renderer, {
  id: `car-${car.id}`,
  content: car.symbol,
  position: "absolute",
  left: car.lane * LANE_WIDTH + Math.floor(LANE_WIDTH / 2),  // Center in lane
  top: car.position,
  fg: car.color,
  zIndex: 100,  // Above obstacles
})
track.add(carSprite)

// Dynamic obstacle (updated each frame)
const obstacleSprite = new TextRenderable(renderer, {
  id: `obstacle-${obstacle.id}`,
  content: OBSTACLE_SYMBOL,
  position: "absolute",
  left: obstacle.lane * LANE_WIDTH + Math.floor(LANE_WIDTH / 2),
  top: obstacle.position,
  fg: "#00ff00",
  zIndex: 50,  // Below cars
})
track.add(obstacleSprite)
```

**Learning Notes**:
- **Absolute positioning**: Each sprite has `position: "absolute"` for pixel-perfect placement
- **Z-index layering**: Higher z-index renders on top (cars > obstacles > track)
- **Dynamic updates**: Use `setPosition()` to move sprites each frame
- **Centering**: Add `LANE_WIDTH / 2` to center sprites in lanes

### 3.2 Game Pane Component Structure

```typescript
// components/game-pane.ts

export class GamePane {
  private track: BoxRenderable
  private cars: Map<string, TextRenderable> = new Map()
  private obstacles: Map<string, TextRenderable> = new Map()

  constructor(
    private renderer: CliRenderer,
    private container: BoxRenderable
  ) {
    this.initializeTrack()
  }

  private initializeTrack() {
    this.track = new BoxRenderable(this.renderer, {
      id: "track-container",
      position: "relative",
      flexGrow: 1,
      backgroundColor: "#1a1a2e",
    })

    this.renderLanes()
    this.container.add(this.track)
  }

  private renderLanes() {
    // Static lane markers
    for (let i = 0; i < NUM_LANES + 1; i++) {
      const x = i * LANE_WIDTH
      for (let y = 0; y < TRACK_LENGTH; y++) {
        const marker = new TextRenderable(this.renderer, {
          id: `lane-${i}-${y}`,
          content: "│",
          position: "absolute",
          left: x,
          top: y,
          fg: "#3a3a3a",
        })
        this.track.add(marker)
      }
    }
  }

  update(gameState: GameStateSnapshot) {
    this.updateCars(gameState.cars)
    this.updateObstacles(gameState.obstacles)
  }

  private updateCars(cars: CarState[]) {
    cars.forEach(car => {
      let sprite = this.cars.get(car.id)

      if (!sprite) {
        // Create new car sprite
        sprite = new TextRenderable(this.renderer, {
          id: `car-${car.id}`,
          content: car.symbol,
          position: "absolute",
          fg: car.color,
          zIndex: 100,
        })
        this.track.add(sprite)
        this.cars.set(car.id, sprite)
      }

      // Update position
      sprite.setPosition({
        left: car.lane * LANE_WIDTH + LANE_WIDTH / 2,
        top: car.position,
      })

      // Update appearance based on state
      if (car.crashed) {
        sprite.content = "💥"
        sprite.fg = "#ff0000"
      }
    })
  }

  private updateObstacles(obstacles: ObstacleState[]) {
    // Remove off-screen obstacles
    this.obstacles.forEach((sprite, id) => {
      const exists = obstacles.some(obs => obs.id === id)
      if (!exists) {
        this.track.remove(sprite.id)
        this.obstacles.delete(id)
      }
    })

    // Update/create obstacles
    obstacles.forEach(obstacle => {
      let sprite = this.obstacles.get(obstacle.id)

      if (!sprite) {
        sprite = new TextRenderable(this.renderer, {
          id: `obstacle-${obstacle.id}`,
          content: obstacle.symbol,
          position: "absolute",
          fg: "#00ff00",
          zIndex: 50,
        })
        this.track.add(sprite)
        this.obstacles.set(obstacle.id, sprite)
      }

      sprite.setPosition({
        left: obstacle.lane * LANE_WIDTH + LANE_WIDTH / 2,
        top: obstacle.position,
      })
    })
  }
}
```

**Learning Notes**:
- **Map-based tracking**: `Map<id, Renderable>` tracks dynamic entities
- **Lazy creation**: Only create sprites when entities appear
- **Position updates**: Use `setPosition()` for animation
- **Z-index layering**: Cars (100) render above obstacles (50)
- **Cleanup**: Remove sprites when entities disappear

### 3.3 Constants & Configuration

```typescript
// config.ts (adapted from existing JavaScript version)

// Track Configuration
export const TRACK_LENGTH = 30
export const NUM_LANES = 4
export const LANE_WIDTH = 8  // Characters wide per lane

// Timing Configuration (Decoupled Rates)
export const GAME_CONFIG = {
  RENDER_FPS: 30,                     // OpenTUI rendering rate
  GAME_UPDATE_INTERVAL_MS: 500,      // Game logic update interval (0.5 seconds)
  OBSTACLE_SPAWN_RATE: 0.1,          // 10% chance per game update
  CAR_SPEED: 1,                      // Cells per game update
}

// Visual Configuration
export const CAR_SYMBOLS = ["🏎️", "🚗", "🚙", "🏁"]
export const CAR_COLORS = ["#ff6b6b", "#4ecdc4", "#ffe66d", "#a8e6cf"]
export const OBSTACLE_SYMBOL = "🌳"

// Event Log Configuration
export const EVENT_LOG = {
  MAX_EVENTS: 100,                   // Maximum events to store
  VISIBLE_EVENTS: 20,                // Number of events visible in scrollbox
}
```

**Learning Notes**:
- **Decoupled timing**: Rendering (30 FPS) is separate from game logic (2 Hz / every 0.5s)
- **Slows down gameplay**: Makes it easier to observe and debug
- **Easy to adjust**: Change `GAME_UPDATE_INTERVAL_MS` to speed up/slow down
- Example: `250ms` = 4 updates/sec (faster), `1000ms` = 1 update/sec (slower)

---

## Phase 4: Stats Pane Implementation

### 4.1 Tab-Based Interface

**Concept**: Use `TabSelectRenderable` to switch between different stat views.

```typescript
// components/stats-panel.ts

export class StatsPanel {
  private tabSelect: TabSelectRenderable
  private contentArea: BoxRenderable
  private currentTab: string = "overview"

  constructor(
    private renderer: CliRenderer,
    private container: BoxRenderable
  ) {
    this.initializeTabs()
    this.initializeContent()
  }

  private initializeTabs() {
    this.tabSelect = new TabSelectRenderable(this.renderer, {
      id: "stats-tabs",
      position: "relative",
      width: this.container.width - 2,
      height: 3,
      options: [
        { name: "Overview", description: "Race summary", value: "overview" },
        { name: "Cars", description: "Car details", value: "cars" },
        { name: "Events", description: "Event log", value: "events" },
        { name: "Settings", description: "Game settings", value: "settings" },
      ],
      backgroundColor: "#0f3460",
      focusedBackgroundColor: "#1a5490",
      selectedBackgroundColor: "#16c79a",
      showDescription: true,
      showUnderline: true,
    })

    this.tabSelect.on(TabSelectRenderableEvents.SELECTION_CHANGED, (index, option) => {
      this.currentTab = option.value
      this.updateContent()
    })

    this.container.add(this.tabSelect)
  }

  private initializeContent() {
    this.contentArea = new BoxRenderable(this.renderer, {
      id: "stats-content",
      position: "relative",
      flexGrow: 1,
      backgroundColor: "#0f3460",
    })

    this.container.add(this.contentArea)
  }

  update(gameState: GameStateSnapshot) {
    this.updateContent(gameState)
  }

  private updateContent(gameState?: GameStateSnapshot) {
    // Clear previous content
    this.contentArea.removeAll()

    switch (this.currentTab) {
      case "overview":
        this.renderOverview(gameState)
        break
      case "cars":
        this.renderCarsDetail(gameState)
        break
      case "events":
        this.renderEvents(gameState)
        break
      case "settings":
        this.renderSettings()
        break
    }
  }

  private renderOverview(gameState?: GameStateSnapshot) {
    if (!gameState) return

    const stats = [
      `Race Progress: ${gameState.progressPercentage.toFixed(1)}%`,
      ``,
      `🏎️ Active Cars: ${gameState.activeCars}`,
      `💥 Crashed Cars: ${gameState.crashedCars}`,
      `🏁 Finished: ${gameState.finishedCars}`,
      ``,
      `🌳 Obstacles: ${gameState.obstacles.length}`,
      `⏱️ Race Time: ${gameState.elapsedTime.toFixed(1)}s`,
    ]

    stats.forEach((line, index) => {
      const text = new TextRenderable(this.renderer, {
        id: `stat-line-${index}`,
        content: line,
        position: "absolute",
        left: 2,
        top: 2 + index,
        fg: line.includes("💥") ? "#ff6b6b" : "#ffffff",
      })
      this.contentArea.add(text)
    })
  }

  private renderCarsDetail(gameState?: GameStateSnapshot) {
    if (!gameState) return

    const title = new TextRenderable(this.renderer, {
      id: "cars-title",
      content: "Car Status Details",
      position: "absolute",
      left: 2,
      top: 2,
      fg: "#ffe66d",
      attributes: TextAttributes.BOLD | TextAttributes.UNDERLINE,
    })
    this.contentArea.add(title)

    gameState.cars.forEach((car, index) => {
      const statusText = car.crashed ? "💥 CRASHED" :
                        car.finished ? "🏁 FINISHED" :
                        "🏎️ RACING"

      const carInfo = [
        `${car.symbol} Car ${car.id + 1}`,
        `  Status: ${statusText}`,
        `  Lane: ${car.lane + 1}`,
        `  Position: ${car.position}/${TRACK_LENGTH}`,
        `  Distance: ${car.distanceTraveled} cells`,
        ``,
      ]

      carInfo.forEach((line, lineIndex) => {
        const text = new TextRenderable(this.renderer, {
          id: `car-${car.id}-line-${lineIndex}`,
          content: line,
          position: "absolute",
          left: 2,
          top: 4 + index * 6 + lineIndex,
          fg: car.crashed ? "#ff6b6b" : car.finished ? "#16c79a" : "#ffffff",
        })
        this.contentArea.add(text)
      })
    })
  }

  private renderEvents(gameState?: GameStateSnapshot) {
    // Event log with ScrollBox (MVP implementation)

    const title = new TextRenderable(this.renderer, {
      id: "events-title",
      content: "📜 Race Events",
      position: "absolute",
      left: 2,
      top: 2,
      fg: "#ffe66d",
      attributes: TextAttributes.BOLD | TextAttributes.UNDERLINE,
    })
    this.contentArea.add(title)

    // ScrollBox for event log
    const scrollBox = new ScrollBoxRenderable(this.renderer, {
      id: "events-scroll",
      position: "absolute",
      left: 2,
      top: 4,
      width: this.contentArea.width - 4,
      height: this.contentArea.height - 6,
      rootOptions: {
        backgroundColor: "#0f3460",
        border: true,
        borderStyle: "single",
      },
      viewportOptions: {
        backgroundColor: "#0f3460",
      },
      scrollbarOptions: {
        trackOptions: {
          foregroundColor: "#16c79a",
          backgroundColor: "#1a5490",
        },
      },
    })

    // Add event log entries (from game state)
    this.events.forEach((event, index) => {
      const eventText = new TextRenderable(this.renderer, {
        id: `event-${index}`,
        content: `[${event.timestamp}] ${event.icon} ${event.message}`,
        position: "relative",
        top: index,
        fg: event.color,
      })
      scrollBox.add(eventText)
    })

    this.contentArea.add(scrollBox)
  }

  private renderSettings() {
    const placeholder = new TextRenderable(this.renderer, {
      id: "settings-placeholder",
      content: "⚙️ Settings coming soon...\n\nControls:\n- Tab: Switch tabs\n- Esc: Quit game\n- Space: Pause (future)",
      position: "absolute",
      left: 2,
      top: 2,
      fg: "#a8a8a8",
    })
    this.contentArea.add(placeholder)
  }
}
```

**Learning Notes**:
- **TabSelectRenderable**: Pre-built tabbed interface component
- **Event listening**: `SELECTION_CHANGED` fires on tab switch
- **Dynamic content**: `removeAll()` clears old content, add new
- **Text attributes**: Use `TextAttributes.BOLD | TextAttributes.UNDERLINE` for styling
- **Color coding**: Different colors for different states (crashed=red, finished=green)

### 4.2 Stats Tab Features

#### Tab 1: Overview (MVP ✅)
- Race progress percentage
- Active/crashed/finished car counts
- Total obstacles on track
- Elapsed race time
- Simple text-based stats display

#### Tab 2: Cars Detail (MVP ✅)
- Individual car status (racing/crashed/finished)
- Current lane position
- Distance traveled
- Per-car color coding (crashed=red, finished=green, racing=white)
- Position on track (Y-coordinate)

#### Tab 3: Events Log (MVP ✅)
- **ScrollBoxRenderable** for scrollable event history
- Event types tracked:
  - 🏁 Race start
  - ↔️ Lane changes (with car ID and lanes)
  - 💥 Collisions (with car ID and obstacle position)
  - 🏆 Car finishes (with finish time and position)
  - 🎉 Race end (winner announcement)
- Timestamps for each event
- Color coding by event type
- Auto-scroll to newest events
- Maximum 100 events stored (configurable)

#### Tab 4: Settings (Future Phase)
- Interactive speed control (Select dropdown)
- Pause/Resume button
- Reset race button
- FPS display toggle
- Game update interval slider

### 4.3 Event Tracking Implementation

To support the Events Log tab, the Game class needs to emit events:

```typescript
// types/game-types.ts
export interface GameEvent {
  timestamp: string        // "12.5s" format
  icon: string            // Event icon (🏁, ↔️, 💥, 🏆, 🎉)
  message: string         // Event description
  color: string           // Display color
  type: 'start' | 'lane_change' | 'collision' | 'finish' | 'end'
}

// game-logic/game.ts
export class Game {
  private events: GameEvent[] = []

  private addEvent(type: GameEvent['type'], message: string, icon: string, color: string) {
    const timestamp = `${((Date.now() - this.startTime) / 1000).toFixed(1)}s`

    this.events.push({ timestamp, icon, message, color, type })

    // Keep only last MAX_EVENTS
    if (this.events.length > EVENT_LOG.MAX_EVENTS) {
      this.events.shift()  // Remove oldest
    }
  }

  async start() {
    this.isRunning = true
    this.startTime = Date.now()

    // Log race start
    this.addEvent('start', 'Race started!', '🏁', '#16c79a')
  }

  private checkCollisions() {
    this.cars.forEach(car => {
      if (car.crashed) return

      const collision = this.obstacles.some(obs =>
        obs.lane === car.lane &&
        Math.abs(obs.position - car.position) < 1
      )

      if (collision) {
        car.crashed = true
        this.addEvent(
          'collision',
          `Car ${car.id + 1} crashed in lane ${car.lane + 1}!`,
          '💥',
          '#ff6b6b'
        )
      }
    })
  }

  // In Car class - track lane changes
  changeLane(targetLane: number, gameState: GameStateSnapshot) {
    const oldLane = this.lane
    this.lane = targetLane

    // Emit lane change event (callback to game)
    if (this.onLaneChange) {
      this.onLaneChange(this.id, oldLane, targetLane)
    }
  }

  getStateSnapshot(): GameStateSnapshot {
    return {
      // ... existing fields
      events: [...this.events],  // Include events in snapshot
    }
  }
}
```

**Learning Notes**:
- **Event history**: Store events in array, pass to UI via state snapshot
- **Timestamp formatting**: Convert ms to seconds with 1 decimal place
- **Circular buffer**: Keep only last 100 events to prevent memory growth
- **Event types**: Enum for filtering (future enhancement)
- **Callback pattern**: Car notifies Game of lane changes for event logging

### 4.4 Interactive Elements Ideas

**For Future Phases**:

1. **Speed Control Select**:
```typescript
const speedSelect = new SelectRenderable(renderer, {
  options: [
    { name: "Slow", value: 0.5 },
    { name: "Normal", value: 1.0 },
    { name: "Fast", value: 2.0 },
  ],
  selectedBackgroundColor: "#16c79a",
})

speedSelect.on(SelectRenderableEvents.ITEM_SELECTED, (index, option) => {
  gameState.setSpeed(option.value)
})
```

2. **Pause/Resume Button**:
```typescript
const pauseButton = new BoxRenderable(renderer, {
  // ... styled as button
  onMouse(event: MouseEvent) {
    if (event.type === "down") {
      gameState.togglePause()
      this.backgroundColor = gameState.paused ? "#ff6b6b" : "#16c79a"
    }
  },
})
```

3. **Slider for Obstacle Spawn Rate**:
```typescript
const spawnSlider = new SliderRenderable(renderer, {
  min: 0,
  max: 100,
  value: 10,  // 10% spawn rate
  onValueChange: (value) => {
    gameState.setObstacleSpawnRate(value / 100)
  },
})
```

---

## Phase 5: Game Logic Integration

### 5.1 Adapting Existing Game Class

The existing `Game` class needs minimal changes:

**Changes Required**:
1. Accept `deltaMs` instead of using fixed intervals
2. Expose `getStateSnapshot()` for UI updates
3. Remove direct console rendering
4. Emit events for UI updates

```typescript
// game-logic/game.ts (adapted from javascript/src/game.js)

export class Game {
  private cars: Car[] = []
  private obstacles: Obstacle[] = []
  private isRunning: boolean = false
  private winner: Car | null = null
  private startTime: number = 0

  constructor(
    private numCars: number = 4,
    private trackLength: number = 30
  ) {
    this.initializeCars()
  }

  private initializeCars() {
    for (let i = 0; i < this.numCars; i++) {
      const controller = new RandomController()
      const car = new Car(i, i, controller, this.trackLength)
      this.cars.push(car)
    }
  }

  async start() {
    this.isRunning = true
    this.startTime = Date.now()
  }

  async updateAsync(deltaMs: number) {
    if (!this.isRunning || this.winner) return

    // Convert deltaMs to seconds for car movement
    const deltaSeconds = deltaMs / 1000

    // Update all cars concurrently
    const gameState = this.getStateSnapshot()
    await Promise.all(
      this.cars.map(car =>
        car.updateAsync(gameState, deltaSeconds)
      )
    )

    // Spawn obstacles
    this.maybeSpawnObstacle()

    // Update obstacles
    this.obstacles.forEach(obs => obs.update(deltaSeconds))

    // Check collisions
    this.checkCollisions()

    // Remove off-screen obstacles
    this.obstacles = this.obstacles.filter(obs => obs.position < this.trackLength)

    // Check for winner
    this.checkForWinner()
  }

  getStateSnapshot(): GameStateSnapshot {
    return {
      cars: this.cars.map(car => ({
        id: car.id,
        lane: car.lane,
        position: car.position,
        symbol: car.symbol,
        color: car.color,
        crashed: car.crashed,
        finished: car.finished,
        distanceTraveled: car.distanceTraveled,
      })),
      obstacles: this.obstacles.map(obs => ({
        id: obs.id,
        lane: obs.lane,
        position: obs.position,
        symbol: obs.symbol,
      })),
      winner: this.winner,
      isRunning: this.isRunning,
      activeCars: this.cars.filter(c => !c.crashed && !c.finished).length,
      crashedCars: this.cars.filter(c => c.crashed).length,
      finishedCars: this.cars.filter(c => c.finished).length,
      progressPercentage: this.getLeadingCarProgress(),
      elapsedTime: (Date.now() - this.startTime) / 1000,
    }
  }

  // ... rest of game logic (checkCollisions, maybeSpawnObstacle, etc.)
}
```

**Key Changes**:
- ✅ Already async (no changes needed)
- ✅ Already uses controllers (no changes needed)
- ➕ Accept `deltaMs` parameter
- ➕ Add `getStateSnapshot()` method
- ➖ Remove `Renderer` dependency
- ➖ Remove console logging

### 5.2 Car & Obstacle Classes

These can be reused almost entirely:

```typescript
// game-logic/entities/car.ts (adapted from javascript/src/entities/Car.js)

export class Car {
  public crashed: boolean = false
  public finished: boolean = false
  public distanceTraveled: number = 0

  constructor(
    public id: number,
    public lane: number,
    private controller: Controller,
    private trackLength: number,
    public symbol: string = CAR_SYMBOLS[id],
    public color: string = CAR_COLORS[id]
  ) {}

  async updateAsync(gameState: GameStateSnapshot, deltaSeconds: number) {
    if (this.crashed || this.finished) return

    // Move forward based on speed and deltaTime
    this.position += GAME_CONFIG.CAR_SPEED * deltaSeconds
    this.distanceTraveled += GAME_CONFIG.CAR_SPEED * deltaSeconds

    // Check finish
    if (this.position >= this.trackLength) {
      this.position = this.trackLength
      this.finished = true
      return
    }

    // Get controller decision
    const action = await this.controller.decideAction(
      this.getState(),
      gameState
    )

    if (action.changeLane) {
      this.changeLane(action.targetLane, gameState)
    }
  }

  // ... rest of car methods (unchanged)
}
```

**No major changes needed** - already async and controller-based!

---

## Phase 6: Input & Controls

### 6.1 Keyboard Controls

```typescript
// main.ts - keyboard handling

function setupKeyboardControls(renderer: CliRenderer, statsPanel: StatsPanel) {
  renderer.keyInput.on("keypress", (key: KeyEvent) => {
    // Quit
    if (key.name === "escape" || (key.ctrl && key.name === "c")) {
      cleanup()
      renderer.stop()
      process.exit(0)
    }

    // Tab navigation (if stats panel has focus)
    if (key.name === "tab") {
      statsPanel.nextTab()
    }

    // Pause/Resume (future)
    if (key.name === "space") {
      game.togglePause()
    }

    // Speed controls (future)
    if (key.name === "up") {
      game.increaseSpeed()
    }
    if (key.name === "down") {
      game.decreaseSpeed()
    }

    // Reset (future)
    if (key.name === "r") {
      game.reset()
    }
  })
}
```

**Learning Notes**:
- `keypress` event fires for all keyboard input
- `KeyEvent` has `name`, `ctrl`, `shift`, `alt` properties
- Tab key can manually switch tabs (or let TabSelect handle it)

### 6.2 Mouse Controls

```typescript
// Example: Make tabs clickable (TabSelect handles this automatically)

statsPanel.tabSelect.on(TabSelectRenderableEvents.ITEM_SELECTED, (index) => {
  console.log(`Clicked tab ${index}`)
})

// Example: Custom button with mouse events
const pauseButton = new BoxRenderable(renderer, {
  // ... styling
  onMouse(event: MouseEvent) {
    if (event.type === "down") {
      game.togglePause()
    }
  },
})
```

---

## Phase 7: Polish & Enhancements

### 7.1 Visual Improvements

1. **Progress Bar**:
```typescript
const progressBar = new BoxRenderable(renderer, {
  id: "progress-bar",
  position: "absolute",
  top: 0,
  left: 0,
  width: Math.floor((gameState.progressPercentage / 100) * maxWidth),
  height: 1,
  backgroundColor: "#16c79a",
})
```

2. **Color Gradients for Speed**:
```typescript
const speedColor = getSpeedColor(car.speed)  // Red -> Yellow -> Green
carSprite.fg = speedColor
```

3. **Animated Border for Winner**:
```typescript
if (gameState.winner) {
  gamePane.borderColor = getBorderColorForFrame(frameCount)  // Cycle colors
}
```

### 7.2 Performance Optimization

1. **Object Pooling** (if many obstacles):
```typescript
class SpritePool {
  private pool: TextRenderable[] = []

  acquire(id: string): TextRenderable {
    return this.pool.pop() || new TextRenderable(...)
  }

  release(sprite: TextRenderable) {
    sprite.visible = false
    this.pool.push(sprite)
  }
}
```

2. **Dirty Flags** (only update changed components):
```typescript
if (car.positionChanged || car.laneChanged) {
  carSprite.setPosition({ left: car.lane * LANE_WIDTH, top: car.position })
}
```

3. **Throttle Updates** (stats don't need 30 FPS):
```typescript
let statsUpdateCounter = 0
if (statsUpdateCounter++ % 5 === 0) {  // Update stats every 5 frames (6 FPS)
  statsPanel.update(gameState)
}
```

---

## Phase 8: Future Enhancements

### 8.1 Advanced Stats Features

1. **Scrollable Event Log**:
   - Use `ScrollBoxRenderable` for event history
   - Store last 100 events with timestamps
   - Filter by event type (collision, finish, lane change)

2. **Real-time Charts** (if feeling ambitious):
   - ASCII line chart of car positions over time
   - Bar chart of distances traveled

3. **Replay Mode**:
   - Record game state snapshots
   - Play back race after completion

### 8.2 AI Controller Integration

The architecture is already ready for AI:

```typescript
// Future: AI-powered controller
class AIController implements Controller {
  async decideAction(carState: CarState, gameState: GameStateSnapshot): Promise<Action> {
    // Call LLM API with game state
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      // ... Claude API call with game state as text/vision
    })

    const decision = parseAIResponse(response)
    return { changeLane: decision.shouldChange, targetLane: decision.lane }
  }
}
```

### 8.3 Multiplayer (Networking)

The async controller pattern supports network play:

```typescript
class NetworkController implements Controller {
  async decideAction(carState: CarState, gameState: GameStateSnapshot): Promise<Action> {
    // Send state to remote player, wait for input
    const response = await this.socket.send(gameState)
    return response.action
  }
}
```

---

## Implementation Checklist

### Phase 1: Foundation ✅
- [ ] Set up `tui/racing-game/` directory structure
- [ ] Create `main.ts` with renderer initialization
- [ ] Set up frame callback loop
- [ ] Test basic rendering (Hello World)

### Phase 2: Layout ✅
- [ ] Implement two-pane layout (game + stats)
- [ ] Add borders and titles
- [ ] Test responsive resizing
- [ ] Verify flexbox layout works

### Phase 3: Game Pane 🎮
- [ ] Create `GamePane` class
- [ ] Render static track (lanes)
- [ ] Implement car sprite rendering
- [ ] Implement obstacle sprite rendering
- [ ] Connect to game state updates
- [ ] Test animation smoothness

### Phase 4: Stats Pane 📊
- [ ] Create `StatsPanel` class
- [ ] Implement tab selection (TabSelectRenderable)
- [ ] Build Overview tab (race stats)
- [ ] Build Cars Detail tab (per-car info)
- [ ] Build Events Log tab with ScrollBoxRenderable
- [ ] Implement event tracking in Game class
- [ ] Add event emission for collisions, finishes, lane changes
- [ ] Add placeholder Settings tab (future)
- [ ] Test tab switching and scrolling

### Phase 5: Game Logic 🎯
- [ ] Port `Game` class from JavaScript to TypeScript
- [ ] Adapt `updateAsync()` for deltaMs and accumulator pattern
- [ ] Implement `getStateSnapshot()` method
- [ ] Add event tracking (`addEvent()` method)
- [ ] Port `Car` class from JavaScript to TypeScript
- [ ] Port `Obstacle` class from JavaScript to TypeScript
- [ ] Port `RandomController` from JavaScript to TypeScript
- [ ] Add TypeScript types and interfaces
- [ ] Test game loop integration with decoupled update rate

### Phase 6: Controls ⌨️
- [ ] Add keyboard event handling
- [ ] Implement Escape to quit
- [ ] Add Tab navigation (if needed)
- [ ] Test all keyboard controls

### Phase 7: Polish ✨
- [ ] Add color coding (crashed=red, finished=green)
- [ ] Add winner announcement
- [ ] Optimize performance (if needed)
- [ ] Add visual effects (optional)

### Phase 8: Documentation 📖
- [ ] Document component architecture
- [ ] Add inline code comments
- [ ] Write usage instructions
- [ ] Document OpenTUI patterns learned

---

## File-by-File Implementation Order

1. **`main.ts`** - Entry point, renderer setup
2. **`config.ts`** - Constants (reuse from JS version)
3. **`types/game-types.ts`** - TypeScript interfaces
4. **`game-logic/game.ts`** - Core game (adapted)
5. **`game-logic/entities/car.ts`** - Car class (minimal changes)
6. **`game-logic/entities/obstacle.ts`** - Obstacle class (minimal changes)
7. **`game-logic/controllers/random-controller.ts`** - Controller (reuse)
8. **`components/game-pane.ts`** - Left pane rendering
9. **`components/stats-panel.ts`** - Right pane + tabs
10. **`components/track-view.ts`** - Track rendering logic

---

## Expected Timeline

- **Phase 1-2** (Foundation + Layout): 1-2 hours
- **Phase 3** (Game Pane): 2-3 hours
- **Phase 4** (Stats Pane): 2-3 hours
- **Phase 5** (Game Logic): 1-2 hours (mostly reuse)
- **Phase 6** (Controls): 30 minutes
- **Phase 7** (Polish): 1-2 hours (optional)

**Total MVP**: ~8-12 hours of focused development

---

## Learning Outcomes

By completing this project, you'll learn:

1. **OpenTUI Core Concepts**:
   - Renderer initialization and lifecycle
   - Component tree architecture
   - Flexbox layout with Yoga
   - Frame callback pattern for animations

2. **Component Usage**:
   - BoxRenderable for containers
   - TextRenderable for text/sprites
   - TabSelectRenderable for tabs
   - Event handling (keyboard, mouse)

3. **Game Architecture**:
   - Separating game logic from rendering
   - State snapshot pattern
   - Delta time-based animation
   - Controller/strategy pattern

4. **Performance**:
   - Efficient component updates
   - Object pooling (if needed)
   - Throttling non-critical updates

5. **TUI Best Practices**:
   - Responsive layouts
   - Clean component composition
   - Event management
   - Cleanup and lifecycle

---

## Next Steps

With the plan approved, we'll proceed with:

1. **Create project structure** (`tui/racing-game/` directory)
2. **Port game logic** (Copy `javascript/src/` to TypeScript with types)
3. **Implement Phase 1**: Renderer setup and basic "Hello World"
4. **Implement Phase 2**: Two-pane layout
5. **Implement Phase 3**: Game pane with positioned text rendering
6. **Implement Phase 4**: Stats pane with 3 MVP tabs (Overview, Cars, Events)
7. **Integrate game logic** with OpenTUI frame callback
8. **Test and polish** with incremental improvements

Each phase will be documented with inline comments explaining OpenTUI patterns for learning.

---

## Notes

- This plan prioritizes **learning and clean architecture** over minimal code
- Each component is **modular and testable**
- The **controller pattern is preserved** for future AI/multiplayer integration
- **OpenTUI patterns are documented** throughout for educational value
- **Game logic ported from JavaScript** - keeping it close to original for comparison
- **Decoupled update rates** - 30 FPS rendering, 2 Hz game updates (0.5s intervals)
- **MVP includes Events log** - full ScrollBox implementation with event tracking
- **Vertical track orientation** - matches original game design
- **Positioned TextRenderables** - simpler approach, good for learning
- The plan is **flexible** - we can adjust based on what we discover during implementation

Ready to start implementation! 🚀
