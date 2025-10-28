// Obstacle entity - Ported from javascript/src/entities/obstacle.js

import { OBSTACLE_SYMBOL, NUM_LANES } from "../../config.js";
import type { ObstacleState } from "../../types/game-types.js";

/**
 * Obstacle class representing hazards on the track
 */
export class Obstacle {
  public id: string;
  public lane: number;
  public position: number;
  public symbol: string;

  /**
   * @param lane - Lane where obstacle is placed (0-3)
   * @param position - Vertical position on track
   * @param id - Unique identifier for the obstacle
   */
  constructor(lane: number, position: number, id?: string) {
    this.lane = lane;
    this.position = position;
    this.symbol = OBSTACLE_SYMBOL;
    this.id = id || `obstacle-${Date.now()}-${Math.random()}`;
  }

  /**
   * Update obstacle position (moves down the track over time)
   * @param deltaSeconds - Time elapsed in seconds
   */
  update(deltaSeconds: number) {
    // Obstacles don't move in the OpenTUI version
    // They stay in place while cars move down
  }

  /**
   * Check if obstacle is at a specific position and lane
   * @param position - Position to check
   * @param lane - Lane to check
   * @returns True if obstacle is at the specified location
   */
  isAt(position: number, lane: number): boolean {
    return this.lane === lane && Math.abs(this.position - position) < 1;
  }

  /**
   * Check if obstacle is off the track
   * @param trackLength - Length of the track
   * @returns True if obstacle is beyond track bounds
   */
  isOffTrack(trackLength: number): boolean {
    return this.position < 0 || this.position > trackLength;
  }

  /**
   * Serialize obstacle to plain object for rendering
   */
  toState(): ObstacleState {
    return {
      id: this.id,
      lane: this.lane,
      position: this.position,
      symbol: this.symbol,
    };
  }

  /**
   * Create a random obstacle
   * @param position - Starting position (usually top of visible track)
   * @returns New obstacle instance
   */
  static createRandom(position: number = 0): Obstacle {
    const lane = Math.floor(Math.random() * NUM_LANES);
    return new Obstacle(lane, position);
  }
}
