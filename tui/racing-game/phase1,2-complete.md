# Phase 1 & 2 Implementation Summary

## Overview

This document summarizes the completion of **Phase 1 (Foundation Setup)** and **Phase 2 (Layout Structure)** of the OpenTUI Racing Game implementation. These phases establish the core infrastructure for building a modern TUI racing game using the OpenTUI library.

---

## Phase 1: Foundation Setup ✅

### Goals
- Set up project structure
- Initialize OpenTUI renderer
- Implement frame callback pattern with decoupled update rates
- Test basic rendering and keyboard controls

### Implementation Details

#### 1. Project Structure Created

```
tui/racing-game/
├── main.ts                    # Entry point with renderer initialization
├── config.ts                  # Game constants and configuration
├── types/
│   └── game-types.ts         # TypeScript type definitions
├── components/               # UI components (future)
└── game-logic/              # Game logic (future)
    ├── entities/
    └── controllers/
```

#### 2. Configuration System (`config.ts`)

**Key Constants Defined:**
- **Track Configuration**: 30 cells length, 4 lanes, 8 characters per lane width
- **Timing Configuration** (Decoupled Rates):
  - Rendering FPS: 30 (smooth visual updates)
  - Game Update Interval: 500ms (2 Hz - slower gameplay for clarity)
- **Visual Configuration**: Car symbols, colors, obstacle symbols
- **Color Theme**: Backgrounds, borders, UI element colors
- **Layout Ratios**: Game pane (60%) vs Stats pane (40%)

**Learning Note:** The decoupled update rate is a key architecture decision. Visual rendering runs at 30 FPS for smooth animation, while game logic updates every 0.5 seconds. This makes gameplay easier to observe and debug.

#### 3. Type System (`types/game-types.ts`)

**Interfaces Defined:**
- `CarState` - Car rendering state
- `ObstacleState` - Obstacle rendering state
- `GameStateSnapshot` - Complete game state snapshot (used to pass data from logic to UI)
- `Action` - Controller action result
- `Controller` - Strategy pattern interface for car controllers
- `GameEvent` - Event log entry
- `GameEventType` - Event type enum

**Purpose:** Full TypeScript type safety throughout the application. The `GameStateSnapshot` interface is particularly important as it's the bridge between game logic and UI components.

#### 4. Renderer Initialization (`main.ts`)

**OpenTUI Setup:**
```typescript
const renderer = await createCliRenderer({
  exitOnCtrlC: true,              // Clean Ctrl+C handling
  targetFps: 30,                  // 30 FPS rendering
  useAlternateScreen: true,       // Preserve terminal on exit
  useMouse: true,                 // Enable mouse interactions
});
```

**Learning Notes:**
- `createCliRenderer()` is async - must await
- `useAlternateScreen` prevents terminal pollution on exit
- `targetFps: 30` provides smooth animation

#### 5. Frame Callback Pattern

**Decoupled Update Rate Implementation:**
```typescript
let gameUpdateAccumulator = 0;
const frameCallback = async (deltaMs: number) => {
  frameCount++;

  // Accumulate time for game updates
  gameUpdateAccumulator += deltaMs;

  // Update game logic at slower rate (every 500ms)
  if (gameUpdateAccumulator >= GAME_UPDATE_INTERVAL_MS) {
    // Game logic update here
    gameUpdateAccumulator = 0;
  }

  // Visual updates happen every frame (30 FPS)
  // Update UI components here
};
```

**Key Concepts:**
- **Accumulator Pattern**: Tracks elapsed time between game logic updates
- **Delta Time**: `deltaMs` provides frame-independent timing (~33ms at 30 FPS)
- **Decoupled Rates**: Rendering (30 FPS) vs Game Logic (2 Hz)
- **Async Support**: Frame callback is async, supporting future AI/network controllers

**Learning Note:** This replaces traditional `setInterval` game loops with OpenTUI's frame callback system.

#### 6. Keyboard Controls

**Implemented:**
- **ESC**: Graceful shutdown (removes frame callback, stops renderer, exits)
- **Ctrl+C**: Handled automatically by `exitOnCtrlC: true`

**Event Handling:**
```typescript
renderer.keyInput.on("keypress", (key) => {
  if (key.name === "escape") {
    renderer.removeFrameCallback(frameCallback);
    renderer.stop();
    process.exit(0);
  }
});
```

#### 7. Terminal Resize Handling

**Responsive Layout:**
```typescript
renderer.on("resize", handleResize);
```

Container dimensions update automatically when terminal is resized, and OpenTUI's Yoga layout engine recalculates child positions.

---

## Phase 2: Layout Structure ✅

### Goals
- Implement two-pane horizontal split layout
- Create game pane (left, 60% width)
- Create stats pane (right, 40% width)
- Add borders, titles, and styling
- Test responsive resizing

### Implementation Details

#### 1. Flexbox Layout Architecture

**Main Container:**
```typescript
const mainContainer = new BoxRenderable(renderer, {
  flexDirection: "row",      // Horizontal split (left | right)
  alignItems: "stretch",     // Fill full height
  width: renderer.terminalWidth,
  height: renderer.terminalHeight,
});
```

**Learning Note:** `flexDirection: "row"` creates a horizontal layout. OpenTUI uses the Yoga flexbox layout engine under the hood.

#### 2. Game Pane (Left - 60%)

```typescript
const gamePane = new BoxRenderable(renderer, {
  flexGrow: 3,               // 3 parts out of 5 = 60%
  flexShrink: 0,
  backgroundColor: "#1a1a2e",
  border: true,
  borderStyle: "rounded",
  borderColor: "#16213e",
  title: "🏁 Race Track",
  titleAlignment: "center",
});
```

**Features:**
- Rounded border with dark blue color
- Centered title with emoji
- 60% width via flexGrow ratio (3 out of 5 total)
- Will contain racing track visualization (Phase 3)

#### 3. Stats Pane (Right - 40%)

```typescript
const statsPane = new BoxRenderable(renderer, {
  flexGrow: 2,               // 2 parts out of 5 = 40%
  flexShrink: 0,
  backgroundColor: "#0f3460",
  border: true,
  borderStyle: "rounded",
  borderColor: "#533483",
  title: "📊 Stats & Info",
  titleAlignment: "center",
});
```

**Features:**
- Rounded border with purple color
- Centered title with emoji
- 40% width via flexGrow ratio (2 out of 5 total)
- Will contain tabs and statistics (Phase 4)

#### 4. FlexGrow Ratio System

**How It Works:**
- Game pane: `flexGrow: 3`
- Stats pane: `flexGrow: 2`
- Total: 3 + 2 = 5 parts
- Game pane gets: 3/5 = 60%
- Stats pane gets: 2/5 = 40%

**Learning Note:** This ratio-based system makes it easy to adjust proportions. Change the values in `config.ts` → `LAYOUT.GAME_PANE_FLEX` and `LAYOUT.STATS_PANE_FLEX` to modify the split.

#### 5. Component Hierarchy

```
renderer.root
  └── mainContainer (flexDirection: "row")
      ├── gamePane (flexGrow: 3)
      │   ├── gameTestText (placeholder content)
      │   └── frameCounterText (bottom-aligned counter)
      └── statsPane (flexGrow: 2)
          └── statsTestText (placeholder content)
```

#### 6. Test Content

**Game Pane Test:**
- Displays "Phase 2 Complete" message
- Lists upcoming features (track, lanes, sprites)
- Frame counter at bottom showing live updates

**Stats Pane Test:**
- Displays "Phase 2 Complete" message
- Lists upcoming features (tabs, stats, event log)

**Frame Counter:**
- Shows frames rendered, game updates, and terminal size
- Updates at 30 FPS to verify animation loop
- Located at bottom of game pane

#### 7. Responsive Behavior

**Resize Handler:**
```typescript
const handleResize = () => {
  mainContainer.width = renderer.terminalWidth;
  mainContainer.height = renderer.terminalHeight;
  // Yoga layout automatically recalculates child sizes (60:40 ratio)
};
```

**Behavior:**
- Terminal resize triggers width/height update
- Flexbox automatically maintains 60:40 ratio
- Both panes stretch to fill full height
- No manual calculation needed!

---

## OpenTUI Concepts Learned

### 1. Renderer Lifecycle
- `createCliRenderer()` - Async initialization
- `renderer.start()` - Begin rendering
- `renderer.stop()` - Clean shutdown
- `renderer.setFrameCallback()` - Animation loop
- `renderer.removeFrameCallback()` - Cleanup

### 2. Component Tree
- `renderer.root` - Root container
- `.add()` - Add child components
- `.remove()` - Remove by ID
- Hierarchical parent-child relationships

### 3. Flexbox Layout (Yoga)
- `flexDirection: "row"` - Horizontal split
- `flexDirection: "column"` - Vertical split (default)
- `flexGrow` - Proportional sizing (ratio-based)
- `flexShrink: 0` - Prevent shrinking below content size
- `alignItems: "stretch"` - Fill cross-axis (height in row layout)

### 4. BoxRenderable
- Container component with layout capabilities
- Supports borders, backgrounds, titles
- Position modes: `"absolute"`, `"relative"`
- Z-index for layering

### 5. TextRenderable
- Display text content
- Foreground color (`fg`)
- Positioning (absolute or relative)
- Content updates trigger re-render

### 6. Event Handling
- `renderer.keyInput.on("keypress", handler)` - Keyboard
- `renderer.on("resize", handler)` - Terminal resize
- `component.on(EVENT, handler)` - Component events

---

## Key Architecture Decisions

### 1. Decoupled Update Rates
**Decision:** Render at 30 FPS, update game logic at 2 Hz (0.5s intervals)

**Rationale:**
- Smooth visual animations (30 FPS)
- Slower gameplay for educational purposes (easier to observe)
- Matches original JavaScript game's timing
- Flexible - easy to speed up/slow down via config

### 2. Configuration-Driven Design
**Decision:** All constants in `config.ts`

**Benefits:**
- Single source of truth
- Easy to adjust parameters
- No magic numbers in code
- Clean separation of concerns

### 3. Type-Safe State Snapshots
**Decision:** Use `GameStateSnapshot` interface to pass data from logic to UI

**Benefits:**
- Full type safety
- Clear contract between layers
- Immutable snapshots prevent unintended mutations
- Easy to serialize for debugging/networking

### 4. Ratio-Based Layout
**Decision:** Use flexGrow ratios (3:2) instead of percentages

**Benefits:**
- No manual calculations needed
- Automatic responsiveness
- Easy to adjust proportions
- Works with any terminal size

---

## Testing

### How to Run

```bash
cd tui/racing-game
bun run main.ts
```

### Expected Behavior

1. **On Start:**
   - Terminal switches to alternate screen
   - Two-pane layout appears (60:40 split)
   - Game pane on left with dark blue border
   - Stats pane on right with purple border
   - Frame counter starts incrementing at bottom

2. **During Execution:**
   - Frame counter updates at 30 FPS
   - Game update counter increments every 0.5 seconds
   - Terminal size displayed in counter

3. **On Resize:**
   - Layout adjusts to new terminal size
   - 60:40 ratio maintained
   - No visual glitches

4. **On Exit (ESC or Ctrl+C):**
   - Graceful shutdown message
   - Terminal restored to original state
   - No leftover artifacts

---

## File Inventory

### Created Files

1. **`tui/racing-game/main.ts`** (147 lines)
   - Entry point
   - Renderer setup
   - Two-pane layout implementation
   - Frame callback with decoupled updates
   - Keyboard and resize handling

2. **`tui/racing-game/config.ts`** (53 lines)
   - Game constants
   - Timing configuration
   - Visual configuration
   - Color theme
   - Layout ratios

3. **`tui/racing-game/types/game-types.ts`** (62 lines)
   - TypeScript interfaces
   - Type definitions for game state
   - Controller interface
   - Event system types

### Directory Structure
```
tui/racing-game/
├── main.ts
├── config.ts
├── types/
│   └── game-types.ts
├── components/              # Ready for Phase 3 & 4
├── game-logic/              # Ready for Phase 5
│   ├── entities/
│   └── controllers/
└── phase1,2-complete.md     # This file
```

---

## Next Steps: Phase 3 - Game Pane Implementation

### What's Coming

1. **Track Rendering**
   - Static lane dividers (vertical lines)
   - Track container with relative positioning

2. **Car Sprites**
   - Positioned TextRenderables for each car
   - Dynamic position updates based on game state
   - Crash/finish state visualization (💥, 🏁)

3. **Obstacle Sprites**
   - Dynamic obstacle rendering
   - Spawning and despawning based on position
   - Z-index layering (cars above obstacles)

4. **GamePane Component**
   - Encapsulated game pane logic
   - Map-based sprite tracking
   - Update method accepting GameStateSnapshot

### Preparation Complete

- ✅ Layout structure in place
- ✅ Frame callback ready for game state updates
- ✅ Type system ready for game logic integration
- ✅ Configuration system ready for track dimensions
- ✅ 60% of screen dedicated to game pane

---

## Lessons Learned

### OpenTUI Patterns

1. **Flexbox is Powerful**
   - No manual positioning calculations
   - Automatic responsiveness
   - Easy to maintain

2. **Frame Callback > setInterval**
   - Delta time for smooth animation
   - Automatic frame pacing
   - Clean lifecycle management

3. **Component Composition**
   - Parent-child relationships
   - Hierarchical structure
   - Modular design

4. **Alternate Screen Mode**
   - Professional TUI feel
   - Clean exit experience
   - No terminal pollution

### Game Architecture

1. **Decoupled Update Rates**
   - Separation of rendering and logic
   - Configurable gameplay speed
   - Better for learning/debugging

2. **State Snapshot Pattern**
   - Clear data flow: logic → snapshot → UI
   - Type-safe contracts
   - Easy to test

3. **Configuration-First**
   - Single source of truth
   - Easy experimentation
   - No magic numbers

---

## Performance Notes

- **Rendering**: 30 FPS is smooth for TUI applications
- **Memory**: Minimal - only creating static containers so far
- **CPU**: Low - frame callback is efficient
- **Terminal Compatibility**: Tested on modern terminals with emoji support

---

## Known Limitations

1. **No Game Logic Yet**: Phases 1 & 2 are pure UI foundation
2. **Static Content**: Test text only - waiting for game integration
3. **No Interactions**: Beyond ESC to quit
4. **No Error Handling**: Assumes valid terminal environment

These will be addressed in future phases!

---

## Summary

**Phase 1 & 2 establish a solid foundation:**

✅ OpenTUI renderer properly initialized
✅ Frame callback pattern with decoupled update rates
✅ Two-pane responsive layout (60:40 split)
✅ Clean component hierarchy
✅ Type-safe architecture ready for game logic
✅ Configuration-driven design
✅ Professional keyboard and resize handling

**The stage is set for Phase 3 (Game Pane) and Phase 4 (Stats Pane) implementations!** 🚀

---

## Running the Demo

```bash
# From repository root
cd tui/racing-game
bun run main.ts

# Press ESC to quit
```

You should see a split-screen TUI with a frame counter incrementing smoothly at 30 FPS!
