/**
 * Generator utilities for game entities
 * Demonstrates: Generator functions, infinite iterators, yield
 */

import { Obstacle } from '../entities/obstacle.js';

/**
 * Infinite generator that produces random obstacles
 * Demonstrates: Generator function (function*), yield
 *
 * @generator
 * @yields {Obstacle} - A new random obstacle
 *
 * @example
 * const gen = obstacleGenerator();
 * const obstacle1 = gen.next().value;
 * const obstacle2 = gen.next().value;
 */
export function* obstacleGenerator() {
  while (true) {
    yield Obstacle.createRandom(0);
  }
}

/**
 * Generator that produces N obstacles
 * Demonstrates: Finite generator with parameter
 *
 * @generator
 * @param {number} count - Number of obstacles to generate
 * @yields {Obstacle} - A new random obstacle
 */
export function* obstacleGeneratorN(count) {
  for (let i = 0; i < count; i++) {
    yield Obstacle.createRandom(0);
  }
}

/**
 * Async generator that produces obstacles with delay
 * Demonstrates: Async generators (async function*), for await...of
 *
 * @async
 * @generator
 * @param {number} delayMs - Delay between obstacles in milliseconds
 * @yields {Obstacle} - A new random obstacle
 */
export async function* asyncObstacleGenerator(delayMs = 100) {
  while (true) {
    await new Promise(resolve => setTimeout(resolve, delayMs));
    yield Obstacle.createRandom(0);
  }
}

/**
 * Iterator helper: Take first N items from an iterable
 * Demonstrates: Iterator pattern, generator composition
 *
 * @generator
 * @param {Iterable} iterable - Source iterable
 * @param {number} n - Number of items to take
 * @yields {*} - Items from the iterable
 */
export function* take(iterable, n) {
  let count = 0;
  for (const item of iterable) {
    if (count >= n) break;
    yield item;
    count++;
  }
}
