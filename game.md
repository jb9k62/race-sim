# Vertical Lane Racer - Game Design Document

## Project Overview

**Purpose**: Showcase modern JavaScript and Python language features through a practical, educational game implementation.

**Concept**: A vertical lane racing game where 4 cars descend through terminal-based lanes, dodging obstacles to reach the finish line first. Features real-time async updates rendered in CLI.

**Goals**:
- Demonstrate identical core game logic across two languages
- Showcase language-specific modern features naturally
- Keep implementation simple, focused, and educational
- Provide clear visual feedback in terminal environment

---

## Game Mechanics

### Core Gameplay
- **4 Vertical Lanes**: Numbered 0-3, cars can switch between them
- **Falling Motion**: Cars automatically descend from top to bottom
- **Obstacles**: Randomly spawned objects that cars must dodge
- **Collision Detection**: Hit obstacle = slow down or game over
- **Finish Line**: First car to bottom wins
- **Real-time Updates**: Async movement for each car independently

### Control Strategy
- **Random Decision Making**: Cars make purely random decisions (lane switches, speed adjustments)
- **No User Input**: Current implementation uses randomness only - no keyboard input, no AI
- **Pluggable Architecture**: Code structured to allow future replacement with:
  - AI model (decision based on game state snapshot)
  - User input (keyboard controls)
  - Any other decision strategy
- **Speed Variation**: Cars may have different speeds (randomly assigned)

### Win Condition
- First car to cross finish line (reach bottom of track)
- Alternative: Survive longest without collisions

---

## Architecture Design

### Core Entities

#### 1. **Car**
```
Properties:
- id: unique identifier
- lane: current lane (0-3)
- position: vertical position (0 to TRACK_LENGTH)
- speed: movement rate
- symbol: visual character (🚗, 🚙, 🚕, 🚓)
- status: active, crashed, finished

Methods:
- moveDown(): advance position
- switchLane(direction): move left/right
- checkCollision(obstacles): detect hits
- toDict/toObject(): serialize state
```

#### 2. **Obstacle**
```
Properties:
- lane: which lane it occupies
- position: vertical position
- symbol: visual character (🚧, 💥, 🛑)
- type: static, moving

Methods:
- update(): move or stay static
- isAt(position, lane): check location
```

#### 3. **Game**
```
Properties:
- cars: collection of Car instances
- obstacles: collection of Obstacle instances
- trackLength: total race distance
- currentTick: game timer
- gameState: running, paused, finished

Methods:
- initialize(): setup game
- update(): game loop tick
- spawnObstacle(): create random obstacle
- checkWinCondition(): determine winner
- render(): draw current state
```

#### 4. **Renderer**
```
Methods:
- clear(): clear terminal
- drawTrack(): render lanes
- drawCar(car): place car on track
- drawObstacle(obstacle): place obstacle
- drawStats(): show game info
- flush(): output to terminal
```

#### 5. **Controller (Strategy Pattern)**
```
Purpose:
- Decouple decision-making from car logic
- Allow swapping between random, AI, or user input
- Current implementation: RandomController only

Interface/Protocol:
- decideAction(gameState): returns action decision
  - gameState: snapshot of current game (cars, obstacles, lane occupancy)
  - returns: { action: 'stay' | 'left' | 'right', ... }

Implementations:
1. RandomController (Current):
   - Randomly picks valid actions
   - No logic, pure randomness
   - Example: 5% chance to switch lanes each tick

2. AIController (Future):
   - Receives game state as text/JSON
   - Sends to AI model
   - Returns model's decision
   - Could use vision model with rendered output

3. UserController (Future):
   - Listens for keyboard input
   - Maps keys to actions
   - Returns user's command
```

**Why this pattern?**
- Cars don't know HOW decisions are made, only that they receive them
- Easy to test different strategies
- Swapping controllers = one-line change
- Game state serialization enables AI/remote control

---

## Modern Language Features Showcase

### JavaScript (Node.js v22+)

#### ES Modules
```javascript
// Clean import/export syntax
import { Car } from './entities/car.js';
export class Game { }
```

#### Classes with Private Fields
```javascript
class Car {
  #speed;  // Private field
  #crashCount = 0;

  constructor(id, lane) {
    this.id = id;
    this.lane = lane;
    this.#speed = Math.random() * 2 + 1;
  }
}
```

#### Async/Await & Promises
```javascript
async function gameLoop() {
  while (game.isRunning) {
    await Promise.all(
      cars.map(car => car.updateAsync())
    );
    await game.render();
    await sleep(100);
  }
}
```

#### Modern Array Methods
```javascript
// Array.fromAsync (if streaming data)
const cars = await Array.fromAsync(carGenerator());

// Iterator helpers
const activeCars = cars.values()
  .filter(car => car.status === 'active')
  .map(car => car.position)
  .toArray();
```

#### Set Methods (New in V8 12.4)
```javascript
const occupiedLanes = new Set([0, 1, 2]);
const availableLanes = new Set([0, 1, 2, 3]);
const freeLanes = availableLanes.difference(occupiedLanes);
```

#### Destructuring & Spread
```javascript
const { lane, position, speed } = car;
const newCars = [...cars, newCar];
const { winner, ...stats } = game.getResults();
```

#### Optional Chaining & Nullish Coalescing
```javascript
const speed = car?.config?.speed ?? DEFAULT_SPEED;
const obstacle = obstacles.find(o => o.lane === lane)?.position;
```

#### Template Literals
```javascript
console.log(`Car ${id} at lane ${lane}, position ${position}`);
```

#### Generators
```javascript
function* obstacleGenerator() {
  while (true) {
    yield new Obstacle(
      Math.floor(Math.random() * 4),
      0
    );
  }
}
```

### Python (3.11+)

#### Type Hints & New Type Syntax
```python
from typing import TypeVar, Self
from collections.abc import Iterator

T = TypeVar('T')

class Car:
    def __init__(self, id: int, lane: int) -> None:
        self.id: int = id
        self.lane: int = lane

    def clone(self) -> Self:  # 3.11+ Self type
        return Car(self.id, self.lane)
```

#### Data Classes
```python
from dataclasses import dataclass, field

@dataclass
class CarState:
    id: int
    lane: int
    position: float
    speed: float = field(default=1.0)
    crashed: bool = False
```

#### Enhanced F-Strings (3.12+)
```python
# Multi-line, nested quotes, expressions
debug = True
message = f"""Car {car.id}:
    Lane: {car.lane}
    Status: {f"{'ACTIVE' if car.active else 'CRASHED'}"}
    Speed: {car.speed:.2f}
"""
```

#### Structural Pattern Matching
```python
match car.status:
    case "active":
        car.move_down()
    case "crashed":
        car.slow_down()
    case "finished":
        pass
    case _:
        raise ValueError(f"Unknown status: {car.status}")
```

#### Async/Await
```python
async def game_loop():
    while game.is_running:
        await asyncio.gather(
            *[car.update_async() for car in cars]
        )
        await game.render()
        await asyncio.sleep(0.1)
```

#### Context Managers
```python
class Terminal:
    def __enter__(self):
        self.clear()
        return self

    def __exit__(self, *args):
        self.reset()

with Terminal() as term:
    game.render(term)
```

#### Decorators
```python
def measure_time(func):
    def wrapper(*args, **kwargs):
        start = time.time()
        result = func(*args, **kwargs)
        print(f"{func.__name__}: {time.time() - start:.3f}s")
        return result
    return wrapper

@measure_time
def update_game():
    # Game logic
    pass
```

#### Comprehensions
```python
# List comprehension
active_cars = [car for car in cars if car.status == "active"]

# Dict comprehension
car_positions = {car.id: car.position for car in cars}

# Set comprehension
occupied_lanes = {car.lane for car in cars}
```

#### Generators
```python
def obstacle_generator() -> Iterator[Obstacle]:
    while True:
        yield Obstacle(
            lane=random.randint(0, 3),
            position=0
        )
```

---

## Project Structure

```
race_sim/
├── game.md                    # This file
├── README.md                  # Project overview and instructions
│
├── javascript/
│   ├── package.json
│   ├── src/
│   │   ├── main.js           # Entry point
│   │   ├── game.js           # Game controller
│   │   ├── renderer.js       # Terminal rendering
│   │   ├── entities/
│   │   │   ├── car.js
│   │   │   └── obstacle.js
│   │   ├── controllers/
│   │   │   └── random.js     # Random decision controller
│   │   ├── utils/
│   │   │   └── sleep.js
│   │   └── config.js         # Game constants
│   └── README.md
│
└── python/
    ├── requirements.txt       # (if any dependencies)
    ├── src/
    │   ├── main.py           # Entry point
    │   ├── game.py           # Game controller
    │   ├── renderer.py       # Terminal rendering
    │   ├── entities/
    │   │   ├── __init__.py
    │   │   ├── car.py
    │   │   └── obstacle.py
    │   ├── controllers/
    │   │   ├── __init__.py
    │   │   └── random.py     # Random decision controller
    │   ├── utils/
    │   │   └── __init__.py
    │   └── config.py         # Game constants
    └── README.md
```

---

## Terminal Rendering Strategy

### Display Layout
```
┌────────────────────────────────────┐
│     VERTICAL LANE RACER v1.0       │
│  Lane: 0    1    2    3            │
├────────────────────────────────────┤
│      |    |    |    |              │  ← Position 0 (start)
│      |    |    🚗   |              │
│      |    |    |    |              │
│      |    🚧   |    |              │  ← Obstacle
│      🚙   |    |    |              │
│      |    |    |    🚕             │
│      |    |    |    |              │
│      |    |    💥   |              │
│      |    🚓   |    |              │
│      |    |    |    |              │
├────────────────────────────────────┤  ← Position 20 (finish)
│ 🚗 Car 0: Position 5 [ACTIVE]      │
│ 🚙 Car 1: Position 8 [ACTIVE]      │
│ 🚓 Car 2: Position 12 [CRASHED]    │
│ 🚕 Car 3: Position 7 [ACTIVE]      │
│ Tick: 45                           │
└────────────────────────────────────┘
```

### Rendering Approach

**JavaScript:**
```javascript
import * as readline from 'readline';

class Renderer {
  clear() {
    console.clear();
    // Or use ANSI escape codes
    process.stdout.write('\x1Bc');
  }

  moveCursor(x, y) {
    readline.cursorTo(process.stdout, x, y);
  }

  render(game) {
    this.clear();
    this.drawHeader();
    this.drawTrack(game);
    this.drawStats(game);
  }
}
```

**Python:**
```python
import os
import sys

class Renderer:
    def clear(self):
        os.system('clear' if os.name != 'nt' else 'cls')
        # Or use ANSI escape codes
        sys.stdout.write('\033[2J\033[H')

    def render(self, game: Game) -> None:
        self.clear()
        self.draw_header()
        self.draw_track(game)
        self.draw_stats(game)
```

---

## Game Loop Architecture

### Core Loop (Pseudo-code)
```
1. Initialize game
   - Create 4 cars in random lanes
   - Setup obstacle generator
   - Initialize renderer

2. Main loop (async):
   while game is running:
     a. Update cars (parallel/async)
        - Move down
        - Check collisions
        - Make random decisions (via controller)

     b. Update obstacles
        - Move existing
        - Spawn new (random chance)
        - Remove off-screen

     c. Check win condition
        - Any car at finish?
        - All cars crashed?

     d. Render current state

     e. Sleep (frame delay)

3. Display results
   - Show winner
   - Show final stats
```

### JavaScript Implementation
```javascript
// main.js
import { Game } from './game.js';
import { Renderer } from './renderer.js';
import { sleep } from './utils/sleep.js';

async function main() {
  const game = new Game();
  const renderer = new Renderer();

  await game.initialize();

  while (game.isRunning()) {
    await game.update();
    renderer.render(game);
    await sleep(100); // 10 FPS
  }

  renderer.showResults(game.getWinner());
}

main().catch(console.error);
```

### Python Implementation
```python
# main.py
import asyncio
from game import Game
from renderer import Renderer

async def main():
    game = Game()
    renderer = Renderer()

    await game.initialize()

    while game.is_running():
        await game.update()
        renderer.render(game)
        await asyncio.sleep(0.1)  # 10 FPS

    renderer.show_results(game.get_winner())

if __name__ == "__main__":
    asyncio.run(main())
```

---

## Concurrent Updates (Async Pattern)

### JavaScript Approach
```javascript
class Game {
  async update() {
    // Update all cars concurrently
    await Promise.all(
      this.cars.map(car => car.updateAsync())
    );

    // Update obstacles
    this.updateObstacles();

    // Check collisions
    this.checkCollisions();

    this.tick++;
  }
}

class Car {
  #controller;  // RandomController instance

  async updateAsync() {
    // Get random decision from controller
    const action = await this.#controller.decideAction(this.getState());

    // Execute the decision
    if (action.type === 'lane_change') {
      this.switchLane(action.direction);
    }

    this.position += this.speed;

    // Check if finished
    if (this.position >= TRACK_LENGTH) {
      this.status = 'finished';
    }
  }

  getState() {
    // Return car state for controller
    return {
      lane: this.lane,
      position: this.position,
      speed: this.speed
    };
  }
}
```

### Python Approach
```python
class Game:
    async def update(self):
        # Update all cars concurrently
        await asyncio.gather(
            *[car.update_async() for car in self.cars]
        )

        # Update obstacles
        self.update_obstacles()

        # Check collisions
        self.check_collisions()

        self.tick += 1

class Car:
    def __init__(self, id: int, lane: int, controller: Controller):
        self.id = id
        self.lane = lane
        self._controller = controller  # RandomController instance

    async def update_async(self):
        # Get random decision from controller
        action = await self._controller.decide_action(self.get_state())

        # Execute the decision
        if action.type == "lane_change":
            self.switch_lane(action.direction)

        self.position += self.speed

        # Check if finished
        if self.position >= TRACK_LENGTH:
            self.status = "finished"

    def get_state(self) -> dict:
        # Return car state for controller
        return {
            "lane": self.lane,
            "position": self.position,
            "speed": self.speed
        }
```

---

## Random Controller Implementation

### JavaScript RandomController
```javascript
// controllers/random.js
export class RandomController {
  #laneChangeChance;

  constructor(laneChangeChance = 0.05) {
    this.#laneChangeChance = laneChangeChance;
  }

  async decideAction(carState) {
    // Purely random decision making
    if (Math.random() < this.#laneChangeChance) {
      return {
        type: 'lane_change',
        direction: Math.random() > 0.5 ? 1 : -1  // Randomly left or right
      };
    }

    return { type: 'stay' };  // No action
  }
}
```

### Python RandomController
```python
# controllers/random.py
import random
from dataclasses import dataclass
from typing import Literal

@dataclass
class Action:
    type: Literal["stay", "lane_change"]
    direction: int = 0

class RandomController:
    def __init__(self, lane_change_chance: float = 0.05):
        self._lane_change_chance = lane_change_chance

    async def decide_action(self, car_state: dict) -> Action:
        # Purely random decision making
        if random.random() < self._lane_change_chance:
            return Action(
                type="lane_change",
                direction=random.choice([-1, 1])  # Randomly left or right
            )

        return Action(type="stay")
```

**Key Points:**
- Controllers receive car state but ignore it (random doesn't use state)
- Future AI controllers would analyze the state
- Future user controllers would check input buffer
- Same interface = easy to swap implementations

---

## Game State Serialization (AI-Ready)

To enable AI controllers in the future, the game state must be serializable to text/JSON.

### JavaScript Example
```javascript
class Game {
  getStateSnapshot() {
    return {
      tick: this.tick,
      cars: this.cars.map(car => ({
        id: car.id,
        lane: car.lane,
        position: car.position,
        speed: car.speed,
        status: car.status
      })),
      obstacles: this.obstacles.map(obs => ({
        lane: obs.lane,
        position: obs.position
      })),
      trackLength: this.trackLength
    };
  }

  getStateAsText() {
    // For vision models or text-based AI
    return this.renderer.renderToString(this);
  }
}
```

### Python Example
```python
from dataclasses import asdict

class Game:
    def get_state_snapshot(self) -> dict:
        return {
            "tick": self.tick,
            "cars": [asdict(car) for car in self.cars],
            "obstacles": [asdict(obs) for obs in self.obstacles],
            "track_length": self.track_length
        }

    def get_state_as_text(self) -> str:
        # For vision models or text-based AI
        return self.renderer.render_to_string(self)
```

**Usage for AI Controller:**
```python
async def decide_action(self, car_state: dict) -> Action:
    # Get full game context
    game_snapshot = self.game.get_state_snapshot()

    # Send to AI model
    response = await ai_model.predict(
        prompt=f"You are car {car_state['id']}. Game state: {game_snapshot}.
                Should you switch lanes? Return 'left', 'right', or 'stay'."
    )

    # Parse AI response
    if response == "left":
        return Action(type="lane_change", direction=-1)
    elif response == "right":
        return Action(type="lane_change", direction=1)
    else:
        return Action(type="stay")
```

---

## Development Phases

### Phase 1: Core Entities & Controllers
**Tasks:**
- [ ] Implement Car class (both languages)
- [ ] Implement Obstacle class (both languages)
- [ ] Implement RandomController class (both languages)
- [ ] Wire controller to car (dependency injection)
- [ ] Add unit tests for entity methods
- [ ] Ensure feature parity between implementations

**Features to showcase:**
- JS: Classes with private fields, getters/setters, strategy pattern
- Python: Data classes, type hints, properties, protocols

### Phase 2: Game Logic
**Tasks:**
- [ ] Implement Game class
- [ ] Add collision detection
- [ ] Implement win condition checking
- [ ] Add obstacle spawning logic
- [ ] Create configuration system

**Features to showcase:**
- JS: Maps/Sets for state management, destructuring
- Python: Pattern matching, comprehensions

### Phase 3: Async/Concurrency
**Tasks:**
- [ ] Convert update methods to async
- [ ] Implement concurrent car updates
- [ ] Add async random decision making (via controller)
- [ ] Handle promises/tasks properly

**Features to showcase:**
- JS: Promise.all, async/await, Array.fromAsync
- Python: asyncio.gather, async/await, generators

**Note:** Async is used even though random decisions are instant - this architecture allows future controllers (AI, network) to be truly async without changing car logic.

### Phase 4: Rendering System
**Tasks:**
- [ ] Implement Renderer class
- [ ] Add terminal clearing
- [ ] Create track drawing logic
- [ ] Add stats display
- [ ] Handle cursor positioning

**Features to showcase:**
- JS: Template literals, readline module
- Python: F-strings (multi-line), context managers

### Phase 5: Main Loop & Polish
**Tasks:**
- [ ] Create main entry point
- [ ] Implement game loop
- [ ] Add results display
- [ ] Handle graceful shutdown
- [ ] Add error handling

**Features to showcase:**
- JS: Top-level await, optional chaining
- Python: Decorators, exception handling

### Phase 6: Documentation & Demo
**Tasks:**
- [ ] Write README for each implementation
- [ ] Add code comments highlighting features
- [ ] Create demo video/GIF
- [ ] Document learnings and comparisons

---

## Configuration Constants

### Shared Config (both languages)
```
TRACK_LENGTH = 30           # How long the race is
NUM_LANES = 4               # Number of lanes
FRAME_RATE = 10             # Updates per second (100ms)
OBSTACLE_SPAWN_RATE = 0.1   # Chance to spawn per tick
CAR_SYMBOLS = ['🚗', '🚙', '🚕', '🚓']
OBSTACLE_SYMBOLS = ['🚧', '💥', '🛑']
LANE_WIDTH = 5              # Character width per lane
```

---

## Feature Parity Matrix

| Feature | JavaScript | Python |
|---------|-----------|--------|
| Classes | ES6 Classes + private fields | Classes + dataclasses |
| Types | JSDoc (optional) | Type hints (mandatory) |
| Async | Promise, async/await | asyncio, async/await |
| Data structures | Map, Set, Array | dict, set, list |
| Pattern matching | switch (basic) | match/case (structural) |
| Iteration | for...of, iterators | for...in, generators |
| String formatting | Template literals | F-strings |
| Destructuring | Object/array destructuring | Tuple/dict unpacking |
| Modules | ES modules (import/export) | Standard imports |
| Error handling | try/catch | try/except |

---

## Testing Strategy

### Unit Tests
- Test Car movement and lane switching
- Test Obstacle creation and positioning
- Test collision detection
- Test game state transitions

### Integration Tests
- Test full game loop
- Test async updates
- Test rendering output
- Test win conditions

### Tools
- **JavaScript**: Node.js built-in test runner (node:test)
- **Python**: pytest or built-in unittest

---

## Learning Outcomes

By implementing this game, developers will learn:

1. **Modern Syntax**: Hands-on with latest language features
2. **Async Patterns**: Real-world concurrent programming
3. **OOP Design**: Clean entity modeling
4. **State Management**: Game state using modern data structures
5. **Terminal UI**: Character-based rendering techniques
6. **Cross-language Comparison**: Same logic, different idioms
7. **Testing**: Unit and integration testing approaches

---

## Future Enhancements (Optional)

### Controller Swapping (Easy - Architecture Ready)
1. **AI Controller**:
   - Pass game state to AI model (Claude, GPT, local model)
   - Get decision back
   - Drop-in replacement for RandomController

2. **User Input Controller**:
   - Listen for keyboard input (arrow keys)
   - Allow one or more cars to be player-controlled
   - Mix of user + random/AI cars in same race

3. **Hybrid Controller**:
   - AI suggests, user approves
   - Or user control with AI assistance

### Game Enhancements
4. **Power-ups**: Speed boost, shield, etc.
5. **Difficulty Levels**: More obstacles, faster speeds
6. **Multiplayer**: Network-based racing (controller receives state over websocket)
7. **Replay System**: Save and replay races
8. **Leaderboard**: Track best times
9. **Custom Tracks**: Load track layouts from files
10. **Sound Effects**: Terminal bell for events

**Note:** Items 1-3 require minimal changes due to controller pattern. Just implement new controller class and inject it.

---

## Getting Started

### JavaScript Version
```bash
cd javascript
npm install
node src/main.js
```

### Python Version
```bash
cd python
python3.11 -m venv venv
source venv/bin/activate
pip install -r requirements.txt  # if any
python src/main.py
```

---

## Success Criteria

- [ ] Both implementations produce identical game behavior
- [ ] Modern language features used naturally (not forced)
- [ ] Code is readable and well-commented
- [ ] Game runs smoothly at 10 FPS
- [ ] Terminal rendering is clean and flicker-free
- [ ] Async updates work correctly
- [ ] Collision detection is accurate
- [ ] Win conditions trigger properly
- [ ] Code demonstrates educational value

---

**END OF GAME DESIGN DOCUMENT**

*This document serves as the complete blueprint for implementing the Vertical Lane Racer game in both JavaScript and Python, showcasing modern language features through practical application.*
