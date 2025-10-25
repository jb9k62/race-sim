// Main entry point for the game
import { Game } from './game.js';

/**
 * Simple test of the game logic (Phase 2 test)
 * Full rendering will be added in Phase 4
 */
async function main() {
  console.log('🏁 Vertical Lane Racer - Phase 2 Test\n');

  const game = new Game();
  await game.initialize();

  console.log('Starting race with 4 cars...\n');

  // Run game loop
  let maxTicks = 100; // Safety limit
  while (game.isRunning() && maxTicks > 0) {
    await game.update();

    // Print stats every 10 ticks
    if (game.tick % 10 === 0) {
      const stats = game.getStats();
      console.log(`Tick ${stats.tick}: Active: ${stats.activeCars}, Crashed: ${stats.crashedCars}, Finished: ${stats.finishedCars}, Obstacles: ${stats.obstacleCount}`);
    }

    maxTicks--;

    // Small delay for visibility
    await new Promise(resolve => setTimeout(resolve, 50));
  }

  // Display results
  console.log('\n🏁 Race finished!');
  const winner = game.getWinner();

  if (winner) {
    console.log(`🎉 Winner: Car ${winner.id} ${winner.symbol}`);
    console.log(`   Final position: ${winner.position.toFixed(2)}`);
  } else {
    console.log('❌ No winner - all cars crashed!');
  }

  // Final stats
  console.log('\n📊 Final Statistics:');
  const finalStats = game.getStats();
  console.log(`   Total ticks: ${finalStats.tick}`);
  console.log(`   Active cars: ${finalStats.activeCars}`);
  console.log(`   Crashed cars: ${finalStats.crashedCars}`);
  console.log(`   Finished cars: ${finalStats.finishedCars}`);

  // Show each car's final state
  console.log('\n🚗 Car Details:');
  for (const car of game.cars) {
    console.log(`   ${car.symbol} Car ${car.id}: Lane ${car.lane}, Position ${car.position.toFixed(2)}, Status: ${car.status}`);
  }
}

main().catch(console.error);
