// game-types.ts - TypeScript type definitions for the racing game

/**
 * Represents a car's state for rendering
 */
export interface CarState {
  id: number;
  lane: number;
  position: number;
  symbol: string;
  color: string;
  crashed: boolean;
  finished: boolean;
  distanceTraveled: number;
}

/**
 * Represents an obstacle's state for rendering
 */
export interface ObstacleState {
  id: string;
  lane: number;
  position: number;
  symbol: string;
}

/**
 * Snapshot of the entire game state at a point in time
 * Used to pass data from game logic to UI components
 */
export interface GameStateSnapshot {
  cars: CarState[];
  obstacles: ObstacleState[];
  winner: CarState | null;
  isRunning: boolean;
  activeCars: number;
  crashedCars: number;
  finishedCars: number;
  progressPercentage: number;
  elapsedTime: number;
  events: GameEvent[];
}

/**
 * Represents an action that a car can take
 */
export interface Action {
  changeLane: boolean;
  targetLane?: number;
}

/**
 * Controller interface - all controllers must implement this
 * Used for RandomController, future AIController, UserController, etc.
 */
export interface Controller {
  decideAction(carState: CarState, gameState: GameStateSnapshot): Promise<Action>;
}

/**
 * Event types that can occur during the race
 */
export type GameEventType = 'start' | 'lane_change' | 'collision' | 'finish' | 'end';

/**
 * Represents a single event in the race
 */
export interface GameEvent {
  timestamp: string;       // "12.5s" format
  icon: string;           // Event icon (🏁, ↔️, 💥, 🏆, 🎉)
  message: string;        // Event description
  color: string;          // Display color
  type: GameEventType;    // Event type for filtering
}
