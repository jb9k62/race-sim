// Obstacle entity
import { OBSTACLE_SYMBOLS, NUM_LANES } from '../config.js';

/**
 * Obstacle class representing hazards on the track
 * Demonstrates: ES6 classes, destructuring, default parameters
 */
export class Obstacle {
  /**
   * @param {number} lane - Lane where obstacle is placed (0-3)
   * @param {number} position - Vertical position on track
   * @param {string} type - Type of obstacle ('static' or 'moving')
   */
  constructor(lane, position, type = 'static') {
    this.lane = lane;
    this.position = position;
    this.type = type;
    this.symbol = OBSTACLE_SYMBOLS[Math.floor(Math.random() * OBSTACLE_SYMBOLS.length)];
    this.speed = type === 'moving' ? Math.random() * 0.5 : 0;
  }

  /**
   * Update obstacle position (for moving obstacles)
   */
  update() {
    if (this.type === 'moving') {
      this.position += this.speed;
    }
  }

  /**
   * Check if obstacle is at a specific position and lane
   * @param {number} position - Position to check
   * @param {number} lane - Lane to check
   * @returns {boolean} - True if obstacle is at the specified location
   */
  isAt(position, lane) {
    return this.lane === lane && Math.abs(this.position - position) < 1;
  }

  /**
   * Check if obstacle is off the track
   * @param {number} trackLength - Length of the track
   * @returns {boolean} - True if obstacle is beyond track bounds
   */
  isOffTrack(trackLength) {
    return this.position < 0 || this.position > trackLength;
  }

  /**
   * Serialize obstacle to plain object
   * @returns {Object} - Serialized obstacle data
   */
  toObject() {
    return {
      lane: this.lane,
      position: this.position,
      type: this.type,
      symbol: this.symbol
    };
  }

  /**
   * Create a random obstacle
   * @param {number} position - Starting position (usually 0 for top of track)
   * @returns {Obstacle} - New obstacle instance
   */
  static createRandom(position = 0) {
    const lane = Math.floor(Math.random() * NUM_LANES);
    const type = Math.random() < 0.2 ? 'moving' : 'static'; // 20% chance of moving obstacle
    return new Obstacle(lane, position, type);
  }
}
