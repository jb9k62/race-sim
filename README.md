# Vertical Lane Racer

> A terminal-based racing game showcasing modern JavaScript and Python features through identical implementations

## Overview

**Vertical Lane Racer** is an educational project that implements the same racing game in both JavaScript and Python, demonstrating how modern language features can be applied to solve real-world problems. Watch 4 AI-controlled cars race down vertical lanes, dodging obstacles in your terminal!

![Race Demo](https://img.shields.io/badge/status-complete-brightgreen)
![JavaScript](https://img.shields.io/badge/JavaScript-ES2020+-yellow)
![Python](https://img.shields.io/badge/Python-3.10+-blue)

## Quick Start

### JavaScript Version

```bash
cd javascript
npm install
npm start
```

### Python Version

```bash
cd python
python3 src/main.py
```

## Features

### Game Mechanics
- 🏎️ **4 Vertical Lanes** - Cars can switch between lanes dynamically
- 🎮 **AI-Controlled** - Random decision making via pluggable controllers
- 💥 **Dynamic Obstacles** - Randomly spawned hazards to avoid
- 🏁 **Win Condition** - First car to the finish line wins
- 🎨 **Terminal UI** - Smooth animated rendering with emojis
- ⚡ **Real-time** - 10 FPS with async concurrent updates

### Architecture Highlights

#### Strategy Pattern
Cars delegate decision-making to controller objects, making the game **AI-ready** with zero refactoring:
- **Current**: RandomController (random lane changes)
- **Future**: AIController (LLM-based decisions)
- **Future**: UserController (keyboard input)

#### Async Architecture
Even though random decisions are instant, the entire system uses async/await to support future controllers that require network requests (AI models) or user input.

#### State Serialization
Complete game state can be exported to JSON, enabling:
- AI model integration (text or vision-based)
- Network multiplayer
- Replay systems
- Debugging and analysis

## Project Structure

```
race_sim/
├── README.md                  # This file
├── game.md                    # Complete game design document
├── phase_1.md                 # Phase 1 completion report
├── phase_2.md                 # Phase 2 completion report
│
├── javascript/                # JavaScript implementation
│   ├── README.md
│   ├── package.json
│   └── src/
│       ├── main.js           # Entry point
│       ├── game.js           # Game controller
│       ├── renderer.js       # Terminal rendering
│       ├── config.js         # Constants
│       ├── entities/         # Car, Obstacle
│       ├── controllers/      # RandomController
│       └── utils/            # Sleep, generators
│
└── python/                    # Python implementation
    ├── README.md
    └── src/
        ├── main.py           # Entry point
        ├── game.py           # Game controller
        ├── renderer.py       # Terminal rendering
        ├── config.py         # Constants
        ├── entities/         # Car, Obstacle
        ├── controllers/      # RandomController
        └── utils/            # Generators
```

## Development Phases

### ✅ Phase 1: Core Entities & Controllers
- Implemented Car, Obstacle, and RandomController classes
- Established strategy pattern architecture
- Full feature parity between JS and Python

### ✅ Phase 2: Game Logic
- Game class with collision detection
- Win condition checking
- Obstacle spawning and management
- State serialization

### ✅ Phase 3: Async/Concurrency Enhancement
- Generator functions for obstacles
- Async generators with delays
- Iterator helpers and utilities

### ✅ Phase 4: Rendering System
- Full terminal renderer with ANSI codes
- Track visualization with cars and obstacles
- Stats display and results screen
- Smooth frame updates

### ✅ Phase 5: Main Loop & Polish
- Complete game loop with rendering
- Graceful shutdown (Ctrl+C handling)
- Error handling and cleanup
- Production-ready entry points

### ✅ Phase 6: Documentation & Demo
- Comprehensive README files
- Code comments highlighting features
- Architecture documentation
- Usage examples

## Modern Language Features Showcased

### JavaScript (ES2020+)
- ✨ ES Modules (`import`/`export`)
- 🔒 Private Fields (`#speed`)
- 🎭 Async/Await & Promise.all
- 🧬 Generators (`function*`)
- 🎯 Optional Chaining (`?.`)
- 🔢 Nullish Coalescing (`??`)
- 📦 Set.difference() (ES2024)
- 🏷️ Template Literals
- 📋 Destructuring
- 🌊 Spread Operator

### Python (3.10+)
- 📝 Type Hints (`list[Car]`, `dict[str, Any]`)
- 🎭 Pattern Matching (`match/case`)
- 📊 Dataclasses (`@dataclass`)
- 🔌 Protocols (structural typing)
- 📜 Enhanced F-Strings
- 🔄 Context Managers (`with`)
- ⚡ Async/Await & asyncio.gather
- 🧬 Generators & Comprehensions
- 🎨 Decorators (`@property`)
- 🎯 Literal Types

## Feature Parity Matrix

| Feature | JavaScript | Python | Status |
|---------|-----------|--------|--------|
| Core Entities | ✅ | ✅ | Complete |
| Game Logic | ✅ | ✅ | Complete |
| Async Updates | ✅ | ✅ | Complete |
| Generators | ✅ | ✅ | Complete |
| Terminal Rendering | ✅ | ✅ | Complete |
| Strategy Pattern | ✅ | ✅ | Complete |
| Error Handling | ✅ | ✅ | Complete |
| Documentation | ✅ | ✅ | Complete |

## Educational Value

This project demonstrates:

1. **Identical Logic, Different Syntax** - Same game, different language features
2. **Modern Patterns** - Strategy pattern, async/await, generators
3. **Production Practices** - Error handling, cleanup, documentation
4. **Type Safety** - JSDoc (JS) vs Type Hints (Python)
5. **Terminal UI** - ANSI codes, rendering, animation
6. **Async Architecture** - Concurrent updates, promise handling

## Future Enhancements

### Easy (Architecture Ready)
1. **AI Controller** - Integrate Claude/GPT for decision making
2. **User Controller** - Add keyboard controls
3. **Vision Models** - Send rendered frame to vision models

### Medium
4. **Power-ups** - Speed boost, shield, invincibility
5. **Difficulty Levels** - More obstacles, faster speeds
6. **Leaderboard** - Track best times and records

### Advanced
7. **Multiplayer** - Network-based racing
8. **Replay System** - Save and replay races
9. **Custom Tracks** - Load track layouts from files
10. **Sound Effects** - Terminal bell for events

## Running the Examples

### Watch a Race

```bash
# JavaScript version
cd javascript && npm start

# Python version
cd python && python3 src/main.py
```

### Exit Gracefully

Press `Ctrl+C` at any time to exit cleanly.

## Documentation

- 📖 [JavaScript README](javascript/README.md) - Detailed JS implementation guide
- 📖 [Python README](python/README.md) - Detailed Python implementation guide
- 📋 [Game Design Document](game.md) - Complete architectural specification
- ✅ [Phase 1 Report](phase_1.md) - Core entities completion
- ✅ [Phase 2 Report](phase_2.md) - Game logic completion

## Requirements

### JavaScript
- Node.js v18.0.0+
- Terminal with emoji support

### Python
- Python 3.10+
- Terminal with emoji support

## Learning Paths

### For JavaScript Developers
1. Compare `async/await` patterns between languages
2. Study private fields (`#`) vs Python's `_` convention
3. Compare generators and iterators
4. Learn about Python's type hints and protocols

### For Python Developers
1. Explore JavaScript's private fields and closures
2. Compare comprehensions with array methods
3. Study Promise.all vs asyncio.gather
4. Learn about optional chaining and nullish coalescing

### For All Developers
1. Understand the strategy pattern implementation
2. Learn terminal rendering techniques
3. Study async architecture for I/O-bound operations
4. Explore state serialization patterns

## License

MIT - Educational project for learning modern programming language features

## Contributing

This is an educational project. Feel free to:
- Fork and experiment
- Add new controller types
- Implement additional features
- Create tutorials or guides

## Credits

Built as a practical demonstration of modern JavaScript and Python features, showcasing how the same problem can be solved idiomatically in different languages.

---

**Happy Racing! 🏁**
