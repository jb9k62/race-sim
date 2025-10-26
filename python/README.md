# Vertical Lane Racer - Python Implementation

A terminal-based racing game showcasing modern Python features through a practical, educational implementation.

## Overview

Watch 4 cars race down vertical lanes, dodging obstacles to reach the finish line first! Built with Python 3.10+ to demonstrate contemporary language features in a real-world application.

## Features

### Game Mechanics
- **4 Vertical Lanes**: Cars can switch between lanes 0-3
- **Real-time Animation**: Smooth terminal rendering at 10 FPS
- **Random AI**: Cars make autonomous decisions via RandomController
- **Dynamic Obstacles**: Randomly spawned obstacles (🚧, 💥, 🛑)
- **Collision Detection**: Hit obstacles = reduced speed
- **Win Condition**: First car to reach the finish line wins

### Modern Python Features Demonstrated

#### Python 3.10+ Language Features
- **Type Hints** (`list[Car]`, `dict[str, Any]`, `Optional[Car]`)
- **Protocols** (interface definitions without inheritance)
- **Dataclasses** (`@dataclass` for Action types)
- **Pattern Matching** (`match/case` statements)
- **Enhanced F-Strings** (multi-line, nested expressions)
- **Context Managers** (`with` statement, `__enter__`/`__exit__`)
- **Async/Await** (asyncio, concurrent execution)
- **asyncio.gather** (parallel car updates)
- **Properties** (`@property` decorator)
- **Class Methods** (`@classmethod`)

#### Python Idioms & Patterns
- **Comprehensions** (list, dict, set, generator)
- **Generator Functions** (`yield` expressions)
- **Async Generators** (`async def` with `yield`)
- **Decorators** (`@dataclass`, `@property`)
- **Type Safety** (Literal types, Self type)
- **Signal Handling** (graceful Ctrl+C)
- **Strategy Pattern** (pluggable controllers)

## Installation

### Requirements
- Python 3.10 or higher
- Terminal with emoji support

### Setup

```bash
cd python
# No external dependencies required!
```

## Usage

### Run the Game

```bash
python3 src/main.py
```

Or from the project root:

```bash
cd python
python src/main.py
```

### Controls

- **Ctrl+C**: Exit gracefully
- The game runs automatically with AI-controlled cars

## Project Structure

```
python/
├── README.md             # This file
└── src/
    ├── main.py           # Entry point with game loop
    ├── game.py           # Game controller
    ├── renderer.py       # Terminal rendering
    ├── config.py         # Game constants
    ├── entities/
    │   ├── __init__.py
    │   ├── car.py        # Car class with type hints
    │   └── obstacle.py   # Obstacle class
    ├── controllers/
    │   ├── __init__.py
    │   └── random.py     # Random AI controller
    └── utils/
        ├── __init__.py
        └── generators.py # Generator functions
```

## Code Examples

### Type Hints & Protocols

```python
from typing import Protocol, Optional
from dataclasses import dataclass

# Protocol defines an interface without inheritance
class Controller(Protocol):
    """Controller interface for car decision making"""
    async def decide_action(self, car_state: dict[str, Any]) -> Action: ...

@dataclass
class Car:
    id: int
    lane: int
    position: float
    _controller: Controller  # Any object matching the protocol

    async def update_async(self) -> None:
        action = await self._controller.decide_action(self.get_state())
        if action.type == "lane_change":
            self.switch_lane(action.direction)
```

### Pattern Matching (Python 3.10+)

```python
def get_status_emoji(status: str) -> str:
    match status:
        case 'active':
            return '🏃'
        case 'crashed':
            return '💥'
        case 'finished':
            return '🏁'
        case _:
            return '?'
```

### Comprehensions

```python
# List comprehension
active_cars = [car for car in cars if car.status == 'active']

# Dict comprehension
car_positions = {car.id: car.position for car in cars}

# Set comprehension
occupied_lanes = {car.lane for car in cars if car.status == 'active'}

# Generator expression (memory efficient)
total_distance = sum(car.position for car in cars)
```

### Async Concurrent Updates

```python
class Game:
    async def update(self) -> None:
        # Update all cars concurrently
        await asyncio.gather(
            *[car.update_async() for car in self.cars]
        )

        self.update_obstacles()
        self.check_collisions()
        self.check_win_condition()
```

### Generator Functions

```python
def obstacle_generator() -> Iterator[Obstacle]:
    """Infinite generator yielding random obstacles"""
    while True:
        yield Obstacle.create_random(0.0)

async def async_obstacle_generator(delay_ms: int = 100) -> AsyncIterator[Obstacle]:
    """Async generator with delay"""
    while True:
        await asyncio.sleep(delay_ms / 1000)
        yield Obstacle.create_random(0.0)
```

### Context Managers

```python
class Renderer:
    def __enter__(self):
        """Context manager entry - hide cursor"""
        self.hide_cursor()
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        """Context manager exit - show cursor"""
        self.cleanup()
        return False

# Usage
with Renderer() as renderer:
    renderer.render(game)
    # Cursor automatically shown on exit
```

### Dataclasses

```python
from dataclasses import dataclass
from typing import Literal

@dataclass
class Action:
    """Represents a car action decision"""
    type: Literal['stay', 'lane_change']
    direction: int = 0

# Creates __init__, __repr__, __eq__ automatically
action = Action(type='lane_change', direction=1)
```

## Architecture

### Game Loop

```
1. Initialize game (4 cars with random controllers)
2. Main loop (async):
   a. Update cars concurrently (asyncio.gather)
   b. Update obstacles
   c. Spawn new obstacles (random)
   d. Check collisions
   e. Check win condition
   f. Render frame
   g. Sleep (0.1s)
3. Show results
```

### Strategy Pattern

Cars delegate decision-making to controller objects:

- **RandomController**: Makes random lane changes (current implementation)
- **AIController**: Could use AI models to make decisions (future)
- **UserController**: Could accept keyboard input (future)

This architecture makes the game **AI-ready** - just implement a new controller!

## Configuration

Edit `src/config.py` to customize:

```python
TRACK_LENGTH = 30        # Race distance
NUM_LANES = 4            # Number of lanes
OBSTACLE_SPAWN_RATE = 0.1  # Spawn chance per tick
LANE_WIDTH = 5           # Display width
CAR_SYMBOLS = ['🚗', '🚙', '🚕', '🚓']
OBSTACLE_SYMBOLS = ['🚧', '💥', '🛑']
```

## Learning Outcomes

By studying this code, you'll learn:

1. **Modern Python Syntax**: Type hints, pattern matching, dataclasses
2. **Async Patterns**: asyncio.gather, async/await, concurrent execution
3. **OOP Design**: Classes, protocols, strategy pattern, dependency injection
4. **Functional Programming**: Generators, comprehensions, iterators
5. **Terminal UI**: ANSI escape codes, cursor control, rendering
6. **Context Managers**: Resource management, cleanup patterns

## Type Safety

This project uses comprehensive type hints for better IDE support and static analysis:

```bash
# Check types with mypy (optional)
pip install mypy
mypy src/
```

## Future Enhancements

### Controller Swapping (Architecture Ready!)

1. **AI Controller**:
   ```python
   class AIController:
       async def decide_action(self, car_state: dict) -> Action:
           response = await ai_model.predict(game_state)
           return parse_ai_response(response)
   ```

2. **User Controller**:
   ```python
   class UserController:
       async def decide_action(self, car_state: dict) -> Action:
           key = await read_keypress()
           direction = -1 if key == 'left' else 1
           return Action(type='lane_change', direction=direction)
   ```

### Game Features
- Power-ups (speed boost, shield)
- Multiple difficulty levels
- Network multiplayer
- Replay system
- Leaderboard

## Comparison with JavaScript Version

Both implementations provide identical gameplay but showcase language-specific features:

| Feature | Python | JavaScript |
|---------|--------|------------|
| Type Safety | Type hints | JSDoc / TypeScript |
| Interfaces | Protocols | Duck typing |
| Data Classes | @dataclass | Plain objects |
| Pattern Matching | match/case | switch (basic) |
| Context Managers | with statement | try/finally |
| Comprehensions | List/dict/set | Array methods |
| Concurrency | asyncio | Promise.all |

## License

MIT - Educational project for learning modern Python

## Author

Part of the Modern Language Features Showcase Project

---

**Note**: This implementation prioritizes **educational clarity** over performance. The code is intentionally verbose with extensive comments to demonstrate language features.
