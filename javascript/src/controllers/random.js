// Random controller for car decision making
// Demonstrates: Strategy pattern, private fields, async methods

/**
 * RandomController makes purely random decisions for car movement
 * This demonstrates the strategy pattern - the controller can be swapped
 * with AI or user input controllers without changing car logic
 */
export class RandomController {
  // Private field for lane change probability
  #laneChangeChance;

  /**
   * @param {number} laneChangeChance - Probability of lane change per tick (default 0.05 = 5%)
   */
  constructor(laneChangeChance = 0.05) {
    this.#laneChangeChance = laneChangeChance;
  }

  /**
   * Decide what action the car should take
   * @param {Object} carState - Current state of the car
   * @returns {Promise<Object>} - Action decision
   *
   * Note: This is async even though random decisions are instant.
   * This architecture allows future controllers (AI, network) to be
   * truly async without changing car logic.
   */
  async decideAction(carState) {
    // Purely random decision making - ignores car state
    if (Math.random() < this.#laneChangeChance) {
      return {
        type: 'lane_change',
        direction: Math.random() > 0.5 ? 1 : -1  // Randomly left (-1) or right (1)
      };
    }

    return { type: 'stay' };  // No action - stay in current lane
  }

  /**
   * Get controller configuration
   * @returns {Object} - Controller settings
   */
  getConfig() {
    return {
      type: 'random',
      laneChangeChance: this.#laneChangeChance
    };
  }
}
