# Vertical Lane Racer - JavaScript Implementation

A terminal-based racing game showcasing modern JavaScript features through a practical, educational implementation.

## Overview

Watch 4 cars race down vertical lanes, dodging obstacles to reach the finish line first! Built with modern JavaScript (ES2020+) to demonstrate contemporary language features in a real-world application.

## Features

### Game Mechanics
- **4 Vertical Lanes**: Cars can switch between lanes 0-3
- **Real-time Animation**: Smooth terminal rendering at 10 FPS
- **Random AI**: Cars make autonomous decisions via RandomController
- **Dynamic Obstacles**: Randomly spawned obstacles (🚧, 💥, 🛑)
- **Collision Detection**: Hit obstacles = reduced speed
- **Win Condition**: First car to reach the finish line wins

### Modern JavaScript Features Demonstrated

#### ES6+ Language Features
- **ES Modules** (`import`/`export`)
- **Classes with Private Fields** (`#speed`, `#controller`)
- **Async/Await** (game loop, concurrent car updates)
- **Promise.all** (parallel car movements)
- **Getters/Setters** (`get speed()`)
- **Template Literals** (multi-line strings, rendering)
- **Destructuring** (object/array destructuring)
- **Spread Operator** (`...cars`)
- **Optional Chaining** (`winner?.position`)
- **Nullish Coalescing** (`value ?? default`)
- **Arrow Functions** (`car => car.update()`)
- **Default Parameters** (`constructor(delay = 100)`)
- **Static Methods** (`Obstacle.createRandom()`)

#### Advanced Patterns
- **Generators** (`function* obstacleGenerator()`)
- **Async Generators** (`async function* asyncObstacleGenerator()`)
- **Strategy Pattern** (pluggable controllers)
- **Set Operations** (`.difference()` for available lanes)
- **Array Methods** (`.map()`, `.filter()`, `.some()`, `.every()`)

## Installation

### Requirements
- Node.js v18.0.0 or higher
- Terminal with emoji support

### Setup

```bash
cd javascript
npm install
```

## Usage

### Run the Game

```bash
npm start
```

Or directly:

```bash
node src/main.js
```

### Controls

- **Ctrl+C**: Exit gracefully
- The game runs automatically with AI-controlled cars

## Project Structure

```
javascript/
├── package.json           # Project configuration
├── README.md             # This file
└── src/
    ├── main.js           # Entry point with game loop
    ├── game.js           # Game controller
    ├── renderer.js       # Terminal rendering
    ├── config.js         # Game constants
    ├── entities/
    │   ├── car.js        # Car class with private fields
    │   └── obstacle.js   # Obstacle class
    ├── controllers/
    │   └── random.js     # Random AI controller
    └── utils/
        ├── sleep.js      # Async sleep utility
        └── generators.js # Generator functions
```

## Code Examples

### Strategy Pattern (Controller)

```javascript
// Cars are controlled by pluggable controllers
class Car {
  #controller;  // Private field

  constructor(id, lane, controller) {
    this.#controller = controller;
  }

  async updateAsync() {
    // Controller makes decisions
    const action = await this.#controller.decideAction(this.getState());
    if (action.type === 'lane_change') {
      this.switchLane(action.direction);
    }
    this.position += this.speed;
  }
}

// Swap controller implementations without changing Car code
const car = new Car(0, 0, new RandomController());
// Future: new Car(0, 0, new AIController());
// Future: new Car(0, 0, new UserController());
```

### Async Concurrent Updates

```javascript
class Game {
  async update() {
    // Update all cars concurrently
    await Promise.all(
      this.cars.map(car => car.updateAsync())
    );

    // Update game state
    this.updateObstacles();
    this.checkCollisions();
    this.checkWinCondition();
  }
}
```

### Generator Functions

```javascript
// Infinite obstacle generator
function* obstacleGenerator() {
  while (true) {
    yield Obstacle.createRandom(0);
  }
}

// Async generator with delay
async function* asyncObstacleGenerator(delayMs = 100) {
  while (true) {
    await sleep(delayMs);
    yield Obstacle.createRandom(0);
  }
}
```

### Modern Set Operations

```javascript
// Get available lanes using Set.difference
getAvailableLanes() {
  const allLanes = new Set([0, 1, 2, 3]);
  const occupiedLanes = this.getOccupiedLanes();

  // Modern Set method (ES2024)
  if (allLanes.difference) {
    return allLanes.difference(occupiedLanes);
  } else {
    // Fallback for older Node versions
    return new Set([...allLanes].filter(lane => !occupiedLanes.has(lane)));
  }
}
```

## Architecture

### Game Loop

```
1. Initialize game (4 cars with random controllers)
2. Main loop (async):
   a. Update cars concurrently (Promise.all)
   b. Update obstacles
   c. Spawn new obstacles (random)
   d. Check collisions
   e. Check win condition
   f. Render frame
   g. Sleep (100ms)
3. Show results
```

### Controller Pattern

Cars delegate decision-making to controller objects:

- **RandomController**: Makes random lane changes (current implementation)
- **AIController**: Could use AI models to make decisions (future)
- **UserController**: Could accept keyboard input (future)

This architecture makes the game **AI-ready** - just implement a new controller!

## Configuration

Edit `src/config.js` to customize:

```javascript
export const TRACK_LENGTH = 30;        // Race distance
export const NUM_LANES = 4;            // Number of lanes
export const OBSTACLE_SPAWN_RATE = 0.1; // Spawn chance per tick
export const LANE_WIDTH = 5;           // Display width
export const CAR_SYMBOLS = ['🚗', '🚙', '🚕', '🚓'];
export const OBSTACLE_SYMBOLS = ['🚧', '💥', '🛑'];
```

## Learning Outcomes

By studying this code, you'll learn:

1. **Modern JavaScript Syntax**: Private fields, optional chaining, nullish coalescing
2. **Async Patterns**: Promise.all, async/await, concurrent execution
3. **OOP Design**: Classes, strategy pattern, dependency injection
4. **Functional Programming**: Generators, arrow functions, array methods
5. **Terminal UI**: ANSI escape codes, cursor control, rendering
6. **State Management**: Sets, Maps, immutable patterns

## Future Enhancements

### Controller Swapping (Architecture Ready!)

1. **AI Controller**:
   ```javascript
   class AIController {
     async decideAction(carState, gameState) {
       const response = await aiModel.predict(gameState);
       return parseAIResponse(response);
     }
   }
   ```

2. **User Controller**:
   ```javascript
   class UserController {
     async decideAction(carState) {
       const key = await readKeypress();
       return { type: 'lane_change', direction: key === 'left' ? -1 : 1 };
     }
   }
   ```

### Game Features
- Power-ups (speed boost, shield)
- Multiple difficulty levels
- Network multiplayer
- Replay system
- Leaderboard

## License

MIT - Educational project for learning modern JavaScript

## Author

Part of the Modern Language Features Showcase Project

---

**Note**: This implementation prioritizes **educational clarity** over performance. The code is intentionally verbose with extensive comments to demonstrate language features.
