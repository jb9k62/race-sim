// Game controller - Ported from javascript/src/game.js
// Demonstrates: TypeScript, Maps/Sets, async/await, Promise.all

import { Car } from "./entities/car.js";
import { Obstacle } from "./entities/obstacle.js";
import { RandomController } from "./controllers/random-controller.js";
import { TRACK_LENGTH, NUM_LANES, GAME_CONFIG } from "../config.js";
import type { GameStateSnapshot, GameEvent } from "../types/game-types.js";

/**
 * Game class managing the race simulation
 */
export class Game {
  private cars: Car[] = [];
  private obstacles: Obstacle[] = [];
  private trackLength: number = TRACK_LENGTH;
  private isRunning: boolean = false;
  private winner: Car | null = null;
  private startTime: number = 0;
  private events: GameEvent[] = [];

  constructor() {
    this.initialize();
  }

  /**
   * Initialize the game with 4 cars
   */
  private initialize() {
    // Create 4 cars with random controllers in different lanes
    const startingLanes = [0, 1, 2, 3];

    this.cars = startingLanes.map(lane =>
      new Car(lane, lane, new RandomController(), this.trackLength)
    );
  }

  /**
   * Start the game
   */
  start() {
    this.isRunning = true;
    this.startTime = Date.now();
    this.addEvent('start', 'Race started!', '🏁', '#16c79a');
  }

  /**
   * Main game update loop
   * @param deltaMs - Time elapsed in milliseconds (for accumulator pattern)
   */
  async updateAsync(deltaMs: number) {
    if (!this.isRunning || this.winner) return;

    // Convert deltaMs to seconds for car movement
    const deltaSeconds = deltaMs / 1000;

    // Get current game state for controllers
    const gameState = this.getStateSnapshot();

    // Update all cars concurrently (Promise.all)
    await Promise.all(
      this.cars.map(car => car.updateAsync(gameState, deltaSeconds))
    );

    // Update obstacles
    this.updateObstacles(deltaSeconds);

    // Spawn new obstacles randomly
    this.spawnObstacle();

    // Check for collisions
    this.checkCollisions();

    // Check win condition
    this.checkWinCondition();
  }

  /**
   * Update all obstacles and remove off-track ones
   */
  private updateObstacles(deltaSeconds: number) {
    // Update each obstacle
    this.obstacles.forEach(obstacle => obstacle.update(deltaSeconds));

    // Remove obstacles that are off the track (past the finish line)
    this.obstacles = this.obstacles.filter(
      obstacle => !obstacle.isOffTrack(this.trackLength)
    );
  }

  /**
   * Randomly spawn new obstacles
   */
  private spawnObstacle() {
    if (Math.random() < GAME_CONFIG.OBSTACLE_SPAWN_RATE) {
      this.obstacles.push(Obstacle.createRandom(0));
    }
  }

  /**
   * Check for collisions between cars and obstacles
   */
  private checkCollisions() {
    for (const car of this.cars) {
      if (!car.crashed && !car.finished && car.checkCollision(this.obstacles)) {
        car.crash();
        this.addEvent(
          'collision',
          `Car ${car.id + 1} crashed in lane ${car.lane + 1}!`,
          '💥',
          '#ff6b6b'
        );
      }
    }
  }

  /**
   * Check if any car has won or all cars are out
   */
  private checkWinCondition() {
    // Check if any car has finished
    const finishedCar = this.cars.find(car => car.finished);

    if (finishedCar && !this.winner) {
      this.winner = finishedCar;
      this.isRunning = false;
      this.addEvent(
        'finish',
        `Car ${finishedCar.id + 1} wins the race!`,
        '🏆',
        '#16c79a'
      );
      this.addEvent('end', 'Race finished!', '🎉', '#ffe66d');
      return;
    }

    // Check if all cars have crashed
    const allCrashed = this.cars.every(car => car.crashed);

    if (allCrashed) {
      this.isRunning = false;
      this.winner = null;
      this.addEvent('end', 'All cars crashed! No winner.', '💥', '#ff6b6b');
    }
  }

  /**
   * Add an event to the event log
   */
  private addEvent(
    type: GameEvent['type'],
    message: string,
    icon: string,
    color: string
  ) {
    const timestamp = `${((Date.now() - this.startTime) / 1000).toFixed(1)}s`;

    this.events.push({ timestamp, icon, message, color, type });

    // Keep only last 100 events
    if (this.events.length > 100) {
      this.events.shift(); // Remove oldest
    }
  }

  /**
   * Get game state snapshot for UI rendering
   */
  getStateSnapshot(): GameStateSnapshot {
    const activeCars = this.cars.filter(c => !c.crashed && !c.finished).length;
    const crashedCars = this.cars.filter(c => c.crashed).length;
    const finishedCars = this.cars.filter(c => c.finished).length;

    // Calculate progress percentage (based on leading car)
    let progressPercentage = 0;
    if (this.cars.length > 0) {
      const maxPosition = Math.max(...this.cars.map(c => c.position));
      progressPercentage = (maxPosition / this.trackLength) * 100;
    }

    return {
      cars: this.cars.map(car => car.getState()),
      obstacles: this.obstacles.map(obstacle => obstacle.toState()),
      winner: this.winner ? this.winner.getState() : null,
      isRunning: this.isRunning,
      activeCars,
      crashedCars,
      finishedCars,
      progressPercentage,
      elapsedTime: (Date.now() - this.startTime) / 1000,
      events: [...this.events], // Copy events array
    };
  }

  /**
   * Check if game is still running
   */
  getIsRunning(): boolean {
    return this.isRunning;
  }

  /**
   * Get the winner (if any)
   */
  getWinner(): Car | null {
    return this.winner;
  }
}
