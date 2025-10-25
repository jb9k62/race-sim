// Game controller with modern JavaScript features
import { Car } from './entities/car.js';
import { Obstacle } from './entities/obstacle.js';
import { RandomController } from './controllers/random.js';
import {
  TRACK_LENGTH,
  NUM_LANES,
  OBSTACLE_SPAWN_RATE
} from './config.js';

/**
 * Game class managing the race simulation
 * Demonstrates: Maps/Sets, destructuring, async/await, Promise.all, array methods
 */
export class Game {
  constructor() {
    this.cars = [];
    this.obstacles = [];
    this.trackLength = TRACK_LENGTH;
    this.tick = 0;
    this.gameState = 'initialized'; // 'initialized', 'running', 'finished'
    this.winner = null;
  }

  /**
   * Initialize the game with 4 cars
   * Demonstrates: Array methods, spread operator
   */
  async initialize() {
    // Create 4 cars with random controllers in different lanes
    const startingLanes = [0, 1, 2, 3];

    this.cars = startingLanes.map(lane =>
      new Car(lane, lane, new RandomController())
    );

    this.gameState = 'running';
  }

  /**
   * Main game update loop
   * Demonstrates: async/await, Promise.all for concurrent updates
   */
  async update() {
    if (this.gameState !== 'running') return;

    // Update all cars concurrently (showcase Promise.all)
    await Promise.all(
      this.cars.map(car => car.updateAsync())
    );

    // Update obstacles
    this.updateObstacles();

    // Spawn new obstacles randomly
    this.spawnObstacle();

    // Check for collisions
    this.checkCollisions();

    // Check win condition
    this.checkWinCondition();

    this.tick++;
  }

  /**
   * Update all obstacles and remove off-track ones
   * Demonstrates: Array.filter, arrow functions
   */
  updateObstacles() {
    // Update each obstacle
    this.obstacles.forEach(obstacle => obstacle.update());

    // Remove obstacles that are off the track
    this.obstacles = this.obstacles.filter(
      obstacle => !obstacle.isOffTrack(this.trackLength)
    );
  }

  /**
   * Randomly spawn new obstacles
   * Demonstrates: Random probability check
   */
  spawnObstacle() {
    if (Math.random() < OBSTACLE_SPAWN_RATE) {
      this.obstacles.push(Obstacle.createRandom(0));
    }
  }

  /**
   * Check for collisions between cars and obstacles
   * Demonstrates: Array methods, Set for tracking collisions
   */
  checkCollisions() {
    // Use Set to track cars that have collided (modern Set usage)
    const collidedCarIds = new Set();

    for (const car of this.cars) {
      if (car.status === 'active' && car.checkCollision(this.obstacles)) {
        car.crash();
        collidedCarIds.add(car.id);
      }
    }

    return collidedCarIds;
  }

  /**
   * Check if any car has won or all cars are out
   * Demonstrates: Array.some, Array.every, destructuring
   */
  checkWinCondition() {
    // Check if any car has finished
    const finishedCar = this.cars.find(car => car.status === 'finished');

    if (finishedCar) {
      this.winner = finishedCar;
      this.gameState = 'finished';
      return;
    }

    // Check if all cars have crashed
    const allCrashed = this.cars.every(car => car.status === 'crashed');

    if (allCrashed) {
      this.gameState = 'finished';
      // No winner if all crashed
      this.winner = null;
    }
  }

  /**
   * Check if game is still running
   * @returns {boolean}
   */
  isRunning() {
    return this.gameState === 'running';
  }

  /**
   * Get the winner (if any)
   * @returns {Car|null}
   */
  getWinner() {
    return this.winner;
  }

  /**
   * Get game state snapshot for AI controllers or debugging
   * Demonstrates: Array.map, object destructuring, spread operator
   * @returns {Object} - Complete game state
   */
  getStateSnapshot() {
    return {
      tick: this.tick,
      gameState: this.gameState,
      trackLength: this.trackLength,
      cars: this.cars.map(car => car.toObject()),
      obstacles: this.obstacles.map(obstacle => obstacle.toObject()),
      winner: this.winner?.toObject() ?? null, // Optional chaining & nullish coalescing
    };
  }

  /**
   * Get occupied lanes using Set
   * Demonstrates: Set, Array.from, filter, map chaining
   * @returns {Set<number>} - Set of currently occupied lanes
   */
  getOccupiedLanes() {
    // Filter active cars and create Set of their lanes
    return new Set(
      this.cars
        .filter(car => car.status === 'active')
        .map(car => car.lane)
    );
  }

  /**
   * Get available (unoccupied) lanes
   * Demonstrates: Set.difference (new in ES2024/V8 12.4)
   * @returns {Set<number>} - Set of available lanes
   */
  getAvailableLanes() {
    const allLanes = new Set([0, 1, 2, 3]);
    const occupiedLanes = this.getOccupiedLanes();

    // Modern Set method - difference (showcase new feature)
    // Note: Fallback to manual implementation if not supported
    if (allLanes.difference) {
      return allLanes.difference(occupiedLanes);
    } else {
      // Fallback for older Node versions
      return new Set(
        [...allLanes].filter(lane => !occupiedLanes.has(lane))
      );
    }
  }

  /**
   * Get active cars count
   * Demonstrates: filter, length
   * @returns {number}
   */
  getActiveCarsCount() {
    return this.cars.filter(car => car.status === 'active').length;
  }

  /**
   * Get game statistics
   * Demonstrates: Object destructuring, computed properties
   * @returns {Object} - Game statistics
   */
  getStats() {
    const activeCars = this.cars.filter(car => car.status === 'active');
    const crashedCars = this.cars.filter(car => car.status === 'crashed');
    const finishedCars = this.cars.filter(car => car.status === 'finished');

    return {
      tick: this.tick,
      activeCars: activeCars.length,
      crashedCars: crashedCars.length,
      finishedCars: finishedCars.length,
      obstacleCount: this.obstacles.length,
      gameState: this.gameState,
      winner: this.winner ? `Car ${this.winner.id}` : 'None'
    };
  }
}
