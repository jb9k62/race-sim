// RandomController - Ported from javascript/src/controllers/random.js
// Demonstrates: Strategy pattern, private fields, async methods

import type { Controller, Action, CarState, GameStateSnapshot } from "../../types/game-types.js";

/**
 * RandomController makes purely random decisions for car movement
 * This demonstrates the strategy pattern - the controller can be swapped
 * with AI or user input controllers without changing car logic
 */
export class RandomController implements Controller {
  // Private field for lane change probability
  private laneChangeChance: number;

  /**
   * @param laneChangeChance - Probability of lane change per tick (default 0.05 = 5%)
   */
  constructor(laneChangeChance: number = 0.05) {
    this.laneChangeChance = laneChangeChance;
  }

  /**
   * Decide what action the car should take
   * @param carState - Current state of the car
   * @param gameState - Complete game state snapshot
   * @returns Action decision
   *
   * Note: This is async even though random decisions are instant.
   * This architecture allows future controllers (AI, network) to be
   * truly async without changing car logic.
   */
  async decideAction(carState: CarState, gameState: GameStateSnapshot): Promise<Action> {
    // Purely random decision making - ignores car state
    if (Math.random() < this.laneChangeChance) {
      // Randomly choose a new lane
      const direction = Math.random() > 0.5 ? 1 : -1; // Randomly left (-1) or right (1)
      const targetLane = carState.lane + direction;

      // Only change lane if target is valid
      if (targetLane >= 0 && targetLane < 4) {
        return {
          changeLane: true,
          targetLane,
        };
      }
    }

    // No action - stay in current lane
    return { changeLane: false };
  }

  /**
   * Get controller configuration
   */
  getConfig() {
    return {
      type: 'random',
      laneChangeChance: this.laneChangeChance,
    };
  }
}
