# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This repository contains multiple projects:

### 1. Vertical Lane Racer (Primary Project)

**Vertical Lane Racer** is an educational dual-implementation racing game built in both JavaScript and Python to showcase modern language features. It's a terminal-based racing game where 4 AI-controlled cars race down vertical lanes, dodging obstacles.

**Key Principle**: Both implementations must maintain feature parity - identical game behavior with language-specific modern features.

### 2. TUI Experimentation (`tui/` and `opentui-src/`)

Experimental area for TUI (Terminal User Interface) development:

- `tui/tui.ts` - TypeScript demo using OpenTUI library
- `opentui-src/` - Git submodule containing OpenTUI source code
- Root `package.json` - Dependencies for TUI experiments (@opentui/core)

**Note**: When working on the racing game, focus on `javascript/` and `python/` directories. TUI experiments are separate.

## Running the Project

### Racing Game

#### JavaScript Version

```bash
cd javascript
npm install
npm start
```

#### Python Version

```bash
cd python
python3 src/main.py
```

### TUI Experiments

```bash
# Install dependencies (from root)
npm install  # or: bun install

# Run TUI demo
bun run tui/tui.ts
# or with the module specified in package.json:
bun run opentui/tui.ts
```

## Architecture

### Strategy Pattern (Controller Architecture)

The game uses a **controller strategy pattern** that is critical to understand:

- **Cars delegate all decision-making to controller objects** (currently `RandomController`)
- Controllers receive game state and return action decisions asynchronously
- This architecture is **AI-ready**: future controllers can be `AIController` (LLM-based) or `UserController` (keyboard input) without changing car logic
- Even though `RandomController` makes instant decisions, the entire system is async to support future network/AI controllers

### Core Components

**Entities** (`entities/`):

- `Car`: Manages car state, position, lane changes, collision detection. Delegates decisions to injected controller.
- `Obstacle`: Obstacles that spawn randomly and move down the track.

**Game** (`game.js`/`game.py`):

- Main game controller managing cars, obstacles, collisions, win conditions
- Handles concurrent car updates (Promise.all / asyncio.gather)
- Maintains game state snapshot for potential AI integration

**Renderer** (`renderer.js`/`renderer.py`):

- Terminal rendering using ANSI escape codes
- Draws track, cars, obstacles, stats
- Handles cursor positioning and screen clearing

**Controllers** (`controllers/`):

- `RandomController`: Makes random lane change decisions (current implementation)
- Future: `AIController`, `UserController` can be drop-in replacements

### Async Architecture

- **JavaScript**: Uses `Promise.all()` for concurrent car updates
- **Python**: Uses `asyncio.gather()` for concurrent car updates
- The async pattern exists even for random decisions to support future controllers requiring network I/O (AI models) or user input

### State Serialization

Game state can be exported to JSON via `getStateSnapshot()` / `get_state_snapshot()` for:

- AI model integration (text or vision-based)
- Network multiplayer
- Debugging and analysis

## Language Feature Showcase

### JavaScript (ES2020+)

Key features demonstrated:

- **Private fields** (`#speed`, `#controller`) - used in Car class
- **Optional chaining** (`winner?.position`)
- **Nullish coalescing** (`value ?? default`)
- **Set.difference()** (ES2024) - in `getAvailableLanes()`
- **Generators** (`function*`) - obstacle generation
- **Async generators** (`async function*`)
- **ES Modules** - all files use import/export
- **Template literals** - rendering and formatting

### Python (3.10+)

Key features demonstrated:

- **Type hints** (`list[Car]`, `dict[str, Any]`, `Optional[Car]`)
- **Pattern matching** (`match/case`) - used in car status handling
- **Dataclasses** (`@dataclass`) - for Action types
- **Protocols** - controller interface without inheritance
- **Comprehensions** - list/dict/set comprehensions throughout
- **Enhanced f-strings** - multi-line, nested expressions
- **asyncio.gather** - concurrent car updates

## Code Conventions

### Naming

- **JavaScript**: camelCase for methods and variables (`updateAsync`, `getOccupiedLanes`)
- **Python**: snake_case for methods and variables (`update_async`, `get_occupied_lanes`)
- Both maintain identical logic with language-appropriate naming

### File Organization

#### Repository Structure

```
race_sim/
├── javascript/            # JavaScript racing game
│   ├── package.json
│   └── src/              # JS implementation
├── python/               # Python racing game
│   └── src/              # Python implementation
├── tui/                  # TUI experiments (TypeScript)
│   └── tui.ts
├── opentui-src/          # Git submodule: OpenTUI library
├── package.json          # Root dependencies for TUI
├── tsconfig.json         # TypeScript config
├── CLAUDE.md             # This file
├── README.md             # Main documentation
└── game.md               # Game design document
```

#### Racing Game Structure (identical in both languages)

```
{javascript,python}/src/
├── main.{js,py}           # Entry point with game loop
├── game.{js,py}           # Game controller
├── renderer.{js,py}       # Terminal rendering
├── config.{js,py}         # Constants
├── entities/              # Car, Obstacle
├── controllers/           # RandomController
└── utils/                 # Sleep, generators
```

## Development Guidelines

### Maintaining Feature Parity

When adding features, implement in **both** JavaScript and Python:

1. Implement core logic identically
2. Use language-specific features appropriately (e.g., comprehensions in Python, array methods in JS)
3. Test both implementations to ensure identical behavior
4. Update both README files

### Adding New Controllers

To add a new controller type (AI, User, etc.):

**JavaScript**:

```javascript
export class AIController {
  async decideAction(carState, gameState) {
    const response = await aiModel.predict(gameState);
    return parseResponse(response);
  }
}
```

**Python**:

```python
class AIController:
    async def decide_action(self, car_state: dict, game_state: dict) -> Action:
        response = await ai_model.predict(game_state)
        return parse_response(response)
```

Then inject into Car: `new Car(id, lane, new AIController())`

### Configuration

Edit `config.js` / `config.py` for game parameters:

- `TRACK_LENGTH`: Race distance (default: 30)
- `OBSTACLE_SPAWN_RATE`: Spawn probability per tick (default: 0.1)
- `NUM_LANES`: Number of lanes (default: 4)
- Car/obstacle symbols (emoji)

## Common Tasks

### Testing Changes

```bash
# JavaScript
cd javascript && npm start

# Python
cd python && python3 src/main.py
```

### Debugging Game State

Use `getStateSnapshot()` / `get_state_snapshot()` to inspect full game state:

```javascript
console.log(JSON.stringify(game.getStateSnapshot(), null, 2));
```

### Exit Gracefully

Both implementations handle Ctrl+C for clean shutdown with terminal cleanup.

## Important Notes

- **DO NOT** break feature parity between implementations
- **DO** use modern language features naturally (not forced)
- **DO** add extensive comments when showcasing specific features
- The project prioritizes **educational clarity** over performance
- Controllers are the extension point for AI/user input - the architecture is already prepared for this
- `opentui-src/` is a git submodule - use `git submodule update --init` if it's empty

# OpenTUI Components Summary

  Based on my exploration of the opentui-src/ directory, here's a comprehensive overview of all
   available components:

  Text & Display Components

  1. Text - Styled text with wrapping, colors, and text selection
  2. Code - Syntax-highlighted code display using Tree-sitter
  3. ASCIIFont - Large ASCII art text for headers/titles
  4. TextNode - Low-level hierarchical text composition

  Input Components

  5. Input - Single-line text input with placeholder and focus states
  6. Textarea - Multi-line text editor with undo/redo, selection, keyboard shortcuts
  7. Select - Vertical list selection with descriptions and keyboard navigation
  8. TabSelect - Horizontal tab-based selection
  9. Slider - Range slider (vertical/horizontal) with mouse support

  Container Components

  10. Box - Container with borders, backgrounds, titles, and flexbox layout
  11. ScrollBox - Container with automatic scrollbars and sticky scroll
  12. ScrollBar - Scrollbar component with arrow buttons
  13. FrameBuffer - Low-level 2D drawing surface for custom graphics

  Composition Components

  14. VRenderable - Generic component with custom render function

  Base Classes (Abstract)

- TextBufferRenderable - Base for text display components
- EditBufferRenderable - Base for text editing components

  ---
  Declarative API (Constructs)

  Functional composition helpers:

- Generic(), Box(), Text(), ASCIIFont(), Input(), Select(), TabSelect(), FrameBuffer()

  Text Styling Utilities (vstyles)

  Quick text formatters:

- bold(), italic(), underline(), dim(), blink(), inverse(), hidden(), strikethrough()
- Combinations: boldItalic(), boldUnderline(), italicUnderline()

  ---
  Key Features Across Components

- Yoga flexbox layout engine for responsive layouts
- RGBA color support with transparency
- Focus management for interactive components
- Event system for keyboard/mouse interaction
- Selection support for text components
- Customizable borders with multiple styles (single, double, rounded, heavy)
- Mouse interaction support

  The library is located in the opentui-src/ git submodule and your TUI experiments at
  tui/tui.ts can use @opentui/core (installed via root package.json).

