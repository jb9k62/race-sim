/**
 * Main entry point for Vertical Lane Racer
 * Demonstrates: Top-level await, async game loop, error handling, graceful shutdown
 */

import { Game } from './game.js';
import { Renderer } from './renderer.js';
import { sleep } from './utils/sleep.js';

// Frame rate: 100ms per frame = 10 FPS
const FRAME_DELAY = 100;

/**
 * Main game loop
 * Demonstrates: async/await, Promise handling, error handling, cleanup pattern
 */
async function main() {
  const game = new Game();
  const renderer = new Renderer();

  // Flag for graceful shutdown
  let shouldStop = false;

  // Setup graceful shutdown handler
  // Demonstrates: Event handling, cleanup pattern
  process.on('SIGINT', () => {
    shouldStop = true;
    renderer.cleanup();
    console.log('\n\n👋 Game interrupted. Goodbye!\n');
    process.exit(0);
  });

  try {
    // Hide cursor for cleaner rendering
    renderer.hideCursor();

    // Initialize game
    await game.initialize();

    // Main game loop
    while (game.isRunning() && !shouldStop) {
      await game.update();
      renderer.render(game);
      await sleep(FRAME_DELAY);
    }

    // Show final results
    if (!shouldStop) {
      renderer.showResults(game);
    }

  } catch (error) {
    // Error handling
    renderer.cleanup();
    console.error('\n❌ Error occurred:');
    console.error(error);
    process.exit(1);
  } finally {
    // Cleanup
    renderer.cleanup();
  }
}

// Run the game
// Demonstrates: Top-level await pattern, error handling
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
