// Car entity with modern JavaScript features
import { TRACK_LENGTH, NUM_LANES, CAR_SYMBOLS } from '../config.js';

/**
 * Car class representing a racing vehicle
 * Demonstrates: ES6 classes, private fields, getters/setters, async/await
 */
export class Car {
  // Private fields (ES2022+)
  #speed;
  #controller;

  /**
   * @param {number} id - Unique car identifier
   * @param {number} lane - Starting lane (0-3)
   * @param {Object} controller - Controller instance for decision making
   */
  constructor(id, lane, controller) {
    this.id = id;
    this.lane = lane;
    this.position = 0;
    this.#speed = Math.random() * 1.5 + 0.5; // Random speed between 0.5 and 2.0
    this.symbol = CAR_SYMBOLS[id % CAR_SYMBOLS.length];
    this.status = 'active'; // 'active', 'crashed', 'finished'
    this.#controller = controller;
  }

  /**
   * Getter for speed (private field access)
   */
  get speed() {
    return this.#speed;
  }

  /**
   * Move the car down the track
   */
  moveDown() {
    if (this.status !== 'active') return;

    this.position += this.#speed;

    // Check if finished
    if (this.position >= TRACK_LENGTH) {
      this.position = TRACK_LENGTH;
      this.status = 'finished';
    }
  }

  /**
   * Switch to a different lane
   * @param {number} direction - Direction to move (-1 for left, 1 for right)
   */
  switchLane(direction) {
    if (this.status !== 'active') return;

    const newLane = this.lane + direction;

    // Boundary checking
    if (newLane >= 0 && newLane < NUM_LANES) {
      this.lane = newLane;
    }
  }

  /**
   * Check collision with obstacles
   * @param {Array} obstacles - Array of obstacle objects
   * @returns {boolean} - True if collision detected
   */
  checkCollision(obstacles) {
    if (this.status !== 'active') return false;

    // Check if any obstacle is at the same position and lane
    return obstacles.some(obstacle =>
      obstacle.lane === this.lane &&
      Math.abs(obstacle.position - this.position) < 1
    );
  }

  /**
   * Handle collision event
   */
  crash() {
    this.status = 'crashed';
    this.#speed *= 0.5; // Reduce speed after crash
  }

  /**
   * Get current state for controller decision making
   * @returns {Object} - Car state snapshot
   */
  getState() {
    return {
      id: this.id,
      lane: this.lane,
      position: this.position,
      speed: this.#speed,
      status: this.status
    };
  }

  /**
   * Async update method - gets decision from controller and executes it
   * Demonstrates async/await pattern
   */
  async updateAsync() {
    if (this.status !== 'active') return;

    // Get decision from controller (strategy pattern)
    const action = await this.#controller.decideAction(this.getState());

    // Execute the decision
    if (action.type === 'lane_change') {
      this.switchLane(action.direction);
    }

    // Move down the track
    this.moveDown();
  }

  /**
   * Serialize car state to plain object
   * @returns {Object} - Serialized car data
   */
  toObject() {
    return {
      id: this.id,
      lane: this.lane,
      position: this.position,
      speed: this.#speed,
      symbol: this.symbol,
      status: this.status
    };
  }
}
