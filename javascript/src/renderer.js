/**
 * Terminal renderer for the racing game
 * Demonstrates: Template literals, ANSI escape codes, string manipulation
 */

import * as readline from 'readline';
import { TRACK_LENGTH, NUM_LANES, LANE_WIDTH } from './config.js';

/**
 * Renderer class for terminal-based visualization
 * Demonstrates: ES6 classes, template literals, ANSI codes
 */
export class Renderer {
  constructor() {
    this.trackLength = TRACK_LENGTH;
    this.numLanes = NUM_LANES;
    this.laneWidth = LANE_WIDTH;
  }

  /**
   * Clear the terminal screen
   * Demonstrates: ANSI escape codes, process.stdout manipulation
   */
  clear() {
    // ANSI escape sequence to clear screen and move cursor to top
    process.stdout.write('\x1Bc');
    // Alternative: console.clear();
  }

  /**
   * Move cursor to specific position
   * Demonstrates: readline module usage
   * @param {number} x - Column position
   * @param {number} y - Row position
   */
  moveCursor(x, y) {
    readline.cursorTo(process.stdout, x, y);
  }

  /**
   * Hide cursor for cleaner rendering
   * Demonstrates: ANSI escape codes
   */
  hideCursor() {
    process.stdout.write('\x1B[?25l');
  }

  /**
   * Show cursor
   * Demonstrates: ANSI escape codes
   */
  showCursor() {
    process.stdout.write('\x1B[?25h');
  }

  /**
   * Draw a horizontal border line
   * Demonstrates: String.repeat, template literals
   * @returns {string}
   */
  drawBorder() {
    const width = this.laneWidth * this.numLanes + 2;
    return '┌' + '─'.repeat(width) + '┐';
  }

  /**
   * Draw the header
   * Demonstrates: Template literals, string padding
   * @returns {string}
   */
  drawHeader() {
    const title = 'VERTICAL LANE RACER v1.0';
    const laneLabels = Array.from({ length: this.numLanes }, (_, i) => i)
      .map(i => ` ${i}  `)
      .join('');

    return [
      this.drawBorder(),
      `│  ${title.padEnd(this.laneWidth * this.numLanes - 2)}  │`,
      `│  Lane: ${laneLabels}│`,
      '├' + '─'.repeat(this.laneWidth * this.numLanes + 2) + '┤',
    ].join('\n');
  }

  /**
   * Build track grid with cars and obstacles
   * Demonstrates: 2D array creation, Map usage, complex logic
   * @param {Game} game - Game instance
   * @returns {string[]} - Array of track lines
   */
  buildTrackGrid(game) {
    // Create empty grid (each cell is one character position)
    const grid = Array.from({ length: this.trackLength }, () =>
      Array(this.numLanes).fill(null)
    );

    // Place obstacles on grid
    for (const obstacle of game.obstacles) {
      const row = Math.floor(obstacle.position);
      if (row >= 0 && row < this.trackLength) {
        grid[row][obstacle.lane] = obstacle.symbol;
      }
    }

    // Place cars on grid (cars overlay obstacles)
    for (const car of game.cars) {
      if (car.status !== 'finished') {
        const row = Math.floor(car.position);
        if (row >= 0 && row < this.trackLength) {
          grid[row][car.lane] = car.symbol;
        }
      }
    }

    // Convert grid to string lines
    const lines = [];
    for (let row = 0; row < this.trackLength; row++) {
      let line = '│  ';
      for (let lane = 0; lane < this.numLanes; lane++) {
        const cell = grid[row][lane];
        if (cell) {
          line += `${cell}   `;
        } else {
          line += '|   ';
        }
      }
      line += ' │';
      lines.push(line);
    }

    return lines;
  }

  /**
   * Draw the footer with finish line
   * Demonstrates: Template literals, string manipulation
   * @returns {string}
   */
  drawFooter() {
    const width = this.laneWidth * this.numLanes + 2;
    return '├' + '─'.repeat(width) + '┤';
  }

  /**
   * Draw car statistics
   * Demonstrates: Array.map, template literals, destructuring
   * @param {Game} game - Game instance
   * @returns {string}
   */
  drawStats(game) {
    const stats = game.getStats();
    const carLines = game.cars.map(car => {
      const statusEmoji = {
        active: '🏃',
        crashed: '💥',
        finished: '🏁',
      }[car.status] || '?';

      return `│ ${car.symbol} Car ${car.id}: Lane ${car.lane}, ` +
        `Pos ${car.position.toFixed(1).padStart(4)}, ` +
        `Speed ${car.speed.toFixed(1)} ${statusEmoji.padEnd(2)} │`;
    });

    const tickLine = `│ Tick: ${stats.tick.toString().padStart(3)} ` +
      `| Active: ${stats.activeCars} | Crashed: ${stats.crashedCars} ` +
      `| Finished: ${stats.finishedCars}`.padEnd(this.laneWidth * this.numLanes - 12) + ' │';

    return [
      ...carLines,
      '├' + '─'.repeat(this.laneWidth * this.numLanes + 2) + '┤',
      tickLine,
    ].join('\n');
  }

  /**
   * Draw the bottom border
   * Demonstrates: Template literals
   * @returns {string}
   */
  drawBottomBorder() {
    const width = this.laneWidth * this.numLanes + 2;
    return '└' + '─'.repeat(width) + '┘';
  }

  /**
   * Render the complete game frame
   * Demonstrates: Method composition, template literals, string concatenation
   * @param {Game} game - Game instance
   */
  render(game) {
    this.clear();

    const output = [
      this.drawHeader(),
      ...this.buildTrackGrid(game),
      this.drawFooter(),
      this.drawStats(game),
      this.drawBottomBorder(),
    ].join('\n');

    console.log(output);
  }

  /**
   * Show final results screen
   * Demonstrates: Template literals, optional chaining
   * @param {Game} game - Game instance
   */
  showResults(game) {
    this.clear();

    const winner = game.getWinner();
    const stats = game.getStats();

    console.log('\n' + '═'.repeat(50));
    console.log('🏁  RACE FINISHED  🏁'.padStart(32));
    console.log('═'.repeat(50) + '\n');

    if (winner) {
      console.log(`🎉 WINNER: Car ${winner.id} ${winner.symbol}`);
      console.log(`   Final Position: ${winner.position.toFixed(2)}`);
      console.log(`   Final Lane: ${winner.lane}`);
      console.log(`   Speed: ${winner.speed.toFixed(2)}`);
    } else {
      console.log('❌ NO WINNER - All cars crashed!');
    }

    console.log('\n' + '─'.repeat(50));
    console.log('📊 FINAL STATISTICS\n');
    console.log(`   Total Ticks: ${stats.tick}`);
    console.log(`   Active Cars: ${stats.activeCars}`);
    console.log(`   Crashed Cars: ${stats.crashedCars}`);
    console.log(`   Finished Cars: ${stats.finishedCars}`);

    console.log('\n🚗 CAR DETAILS\n');
    for (const car of game.cars) {
      const status = car.status.toUpperCase();
      console.log(`   ${car.symbol} Car ${car.id}: ${status} at position ${car.position.toFixed(2)}`);
    }

    console.log('\n' + '═'.repeat(50) + '\n');

    this.showCursor();
  }

  /**
   * Clean up renderer (show cursor, etc.)
   * Demonstrates: Cleanup pattern
   */
  cleanup() {
    this.showCursor();
  }
}
