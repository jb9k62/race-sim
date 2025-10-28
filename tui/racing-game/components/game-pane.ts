// GamePane component - Handles rendering the racing track, cars, and obstacles
// Uses positioned TextRenderables for each sprite

import type { CliRenderer } from "@opentui/core";
import { BoxRenderable, TextRenderable } from "@opentui/core";
import { TRACK_LENGTH, NUM_LANES, LANE_WIDTH, COLORS } from "../config.js";
import type { GameStateSnapshot, CarState, ObstacleState } from "../types/game-types.js";

/**
 * GamePane - Component for rendering the racing game
 * Phase 3: Uses positioned TextRenderables for track, cars, and obstacles
 */
export class GamePane {
  private trackContainer: BoxRenderable;
  private cars: Map<number, TextRenderable> = new Map();
  private obstacles: Map<string, TextRenderable> = new Map();
  private laneDividers: TextRenderable[] = [];

  constructor(
    private renderer: CliRenderer,
    private container: BoxRenderable
  ) {
    this.initializeTrack();
  }

  /**
   * Initialize the track container and static elements
   */
  private initializeTrack() {
    // Track container holds all game elements
    this.trackContainer = new BoxRenderable(this.renderer, {
      id: "track-container",
      position: "relative",
      flexGrow: 1,
      backgroundColor: COLORS.GAME_PANE_BG,
    });

    // Render static lane dividers
    this.renderLaneDividers();

    this.container.add(this.trackContainer);
  }

  /**
   * Render static lane dividers (vertical lines)
   */
  private renderLaneDividers() {
    // Draw vertical lane dividers
    for (let i = 0; i <= NUM_LANES; i++) {
      const x = i * LANE_WIDTH;

      // Create a vertical line of characters
      const dividerChars: string[] = [];
      for (let y = 0; y < TRACK_LENGTH; y++) {
        dividerChars.push("│");
      }

      const divider = new TextRenderable(this.renderer, {
        id: `lane-divider-${i}`,
        content: dividerChars.join("\n"),
        position: "absolute",
        left: x,
        top: 0,
        fg: COLORS.LANE_DIVIDER,
      });

      this.laneDividers.push(divider);
      this.trackContainer.add(divider);
    }
  }

  /**
   * Update the game pane with new game state
   * Called every frame (30 FPS)
   */
  update(gameState: GameStateSnapshot) {
    this.updateCars(gameState.cars);
    this.updateObstacles(gameState.obstacles);
  }

  /**
   * Update car sprites based on game state
   */
  private updateCars(cars: CarState[]) {
    cars.forEach(car => {
      let sprite = this.cars.get(car.id);

      if (!sprite) {
        // Create new car sprite
        sprite = new TextRenderable(this.renderer, {
          id: `car-${car.id}`,
          content: car.symbol,
          position: "absolute",
          fg: car.color,
          zIndex: 100, // Cars render above obstacles
        });
        this.trackContainer.add(sprite);
        this.cars.set(car.id, sprite);
      }

      // Update position (center in lane)
      const x = car.lane * LANE_WIDTH + Math.floor(LANE_WIDTH / 2);
      const y = Math.floor(car.position);

      sprite.setPosition({
        left: x,
        top: y,
      });

      // Update appearance based on state
      if (car.crashed) {
        sprite.content = "💥";
        sprite.fg = COLORS.CRASHED_COLOR;
      } else if (car.finished) {
        sprite.content = "🏁";
        sprite.fg = COLORS.FINISHED_COLOR;
      } else {
        sprite.content = car.symbol;
        sprite.fg = car.color;
      }
    });
  }

  /**
   * Update obstacle sprites based on game state
   */
  private updateObstacles(obstacles: ObstacleState[]) {
    // Remove off-screen obstacles
    const obstacleIds = new Set(obstacles.map(obs => obs.id));
    this.obstacles.forEach((sprite, id) => {
      if (!obstacleIds.has(id)) {
        this.trackContainer.remove(sprite.id);
        this.obstacles.delete(id);
      }
    });

    // Update/create obstacles
    obstacles.forEach(obstacle => {
      let sprite = this.obstacles.get(obstacle.id);

      if (!sprite) {
        // Create new obstacle sprite
        sprite = new TextRenderable(this.renderer, {
          id: `obstacle-${obstacle.id}`,
          content: obstacle.symbol,
          position: "absolute",
          fg: COLORS.OBSTACLE_COLOR,
          zIndex: 50, // Obstacles render below cars
        });
        this.trackContainer.add(sprite);
        this.obstacles.set(obstacle.id, sprite);
      }

      // Update position (center in lane)
      const x = obstacle.lane * LANE_WIDTH + Math.floor(LANE_WIDTH / 2);
      const y = Math.floor(obstacle.position);

      sprite.setPosition({
        left: x,
        top: y,
      });
    });
  }

  /**
   * Clean up resources
   */
  cleanup() {
    this.cars.clear();
    this.obstacles.clear();
    this.laneDividers = [];
  }
}
