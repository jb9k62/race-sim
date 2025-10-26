/**
 * Sleep utility for async delays
 * Demonstrates: Promise-based async utility, modern export syntax
 */

/**
 * Async sleep function
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise<void>}
 */
export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Sleep with cancellation support
 * Demonstrates: AbortController usage (modern async pattern)
 * @param {number} ms - Milliseconds to sleep
 * @param {AbortSignal} [signal] - Optional abort signal
 * @returns {Promise<void>}
 */
export function sleepWithCancel(ms, signal) {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(resolve, ms);

    if (signal) {
      signal.addEventListener('abort', () => {
        clearTimeout(timeout);
        reject(new Error('Sleep cancelled'));
      });
    }
  });
}
