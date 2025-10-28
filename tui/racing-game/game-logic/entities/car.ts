// Car entity - Ported from javascript/src/entities/car.js

import { TRACK_LENGTH, NUM_LANES, CAR_SYMBOLS, CAR_COLORS, GAME_CONFIG } from "../../config.js";
import type { Controller, CarState, GameStateSnapshot } from "../../types/game-types.js";
import type { Obstacle } from "./obstacle.js";

/**
 * Car class representing a racing vehicle
 * Demonstrates: TypeScript classes, private fields, async/await
 */
export class Car {
  public id: number;
  public lane: number;
  public position: number;
  public symbol: string;
  public color: string;
  public crashed: boolean = false;
  public finished: boolean = false;
  public distanceTraveled: number = 0;

  private speed: number;
  private controller: Controller;

  /**
   * @param id - Unique car identifier
   * @param lane - Starting lane (0-3)
   * @param controller - Controller instance for decision making
   * @param trackLength - Total track length
   */
  constructor(id: number, lane: number, controller: Controller, trackLength: number = TRACK_LENGTH) {
    this.id = id;
    this.lane = lane;
    this.position = 0;
    this.speed = GAME_CONFIG.CAR_SPEED; // Use configured speed
    this.symbol = CAR_SYMBOLS[id % CAR_SYMBOLS.length];
    this.color = CAR_COLORS[id % CAR_COLORS.length];
    this.controller = controller;
  }

  /**
   * Getter for speed (private field access)
   */
  getSpeed(): number {
    return this.speed;
  }

  /**
   * Move the car down the track
   * @param deltaSeconds - Time elapsed in seconds
   */
  moveDown(deltaSeconds: number) {
    if (this.crashed || this.finished) return;

    const distance = this.speed * deltaSeconds;
    this.position += distance;
    this.distanceTraveled += distance;

    // Check if finished
    if (this.position >= TRACK_LENGTH) {
      this.position = TRACK_LENGTH;
      this.finished = true;
    }
  }

  /**
   * Switch to a specific lane
   * @param targetLane - Target lane number
   */
  changeLane(targetLane: number) {
    if (this.crashed || this.finished) return;

    // Boundary checking
    if (targetLane >= 0 && targetLane < NUM_LANES) {
      this.lane = targetLane;
    }
  }

  /**
   * Check collision with obstacles
   * @param obstacles - Array of obstacle objects
   * @returns True if collision detected
   */
  checkCollision(obstacles: Obstacle[]): boolean {
    if (this.crashed || this.finished) return false;

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
    this.crashed = true;
    this.speed *= 0.5; // Reduce speed after crash
  }

  /**
   * Get current state for rendering and controller decision making
   */
  getState(): CarState {
    return {
      id: this.id,
      lane: this.lane,
      position: this.position,
      symbol: this.symbol,
      color: this.color,
      crashed: this.crashed,
      finished: this.finished,
      distanceTraveled: this.distanceTraveled,
    };
  }

  /**
   * Async update method - gets decision from controller and executes it
   * @param gameState - Complete game state snapshot
   * @param deltaSeconds - Time elapsed in seconds
   */
  async updateAsync(gameState: GameStateSnapshot, deltaSeconds: number) {
    if (this.crashed || this.finished) return;

    // Get decision from controller (strategy pattern)
    const action = await this.controller.decideAction(this.getState(), gameState);

    // Execute the decision
    if (action.changeLane && action.targetLane !== undefined) {
      this.changeLane(action.targetLane);
    }

    // Move down the track
    this.moveDown(deltaSeconds);
  }
}
