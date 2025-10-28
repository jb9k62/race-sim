// config.ts - Game configuration constants
// Adapted from javascript/src/config.js for OpenTUI version

// Track Configuration
export const TRACK_LENGTH = 30;      // Total race distance in cells
export const NUM_LANES = 4;          // Number of racing lanes
export const LANE_WIDTH = 8;         // Characters wide per lane

// Timing Configuration (Decoupled Rates)
export const GAME_CONFIG = {
  RENDER_FPS: 30,                     // OpenTUI rendering rate (30 FPS for smooth animation)
  GAME_UPDATE_INTERVAL_MS: 500,      // Game logic update interval (0.5 seconds = 2 Hz)
  OBSTACLE_SPAWN_RATE: 0.1,          // 10% chance per game update
  CAR_SPEED: 1,                      // Cells per second (not per game update!)
};

// Visual Configuration
export const CAR_SYMBOLS = ["🏎️", "🚗", "🚙", "🏁"];
export const CAR_COLORS = ["#ff6b6b", "#4ecdc4", "#ffe66d", "#a8e6cf"];
export const OBSTACLE_SYMBOL = "🌳";

// Color Theme
export const COLORS = {
  // Background colors
  GAME_PANE_BG: "#1a1a2e",
  STATS_PANE_BG: "#0f3460",
  MAIN_BG: "#0a0a0a",

  // Border colors
  GAME_BORDER: "#16213e",
  STATS_BORDER: "#533483",

  // UI element colors
  LANE_DIVIDER: "#3a3a3a",
  OBSTACLE_COLOR: "#00ff00",
  CRASHED_COLOR: "#ff6b6b",
  FINISHED_COLOR: "#16c79a",

  // Tab colors
  TAB_BG: "#0f3460",
  TAB_FOCUSED_BG: "#1a5490",
  TAB_SELECTED_BG: "#16c79a",
};

// Event Log Configuration
export const EVENT_LOG = {
  MAX_EVENTS: 100,                   // Maximum events to store
  VISIBLE_EVENTS: 20,                // Number of events visible in scrollbox
};

// Layout Configuration
export const LAYOUT = {
  GAME_PANE_FLEX: 3,                 // Game pane takes 3 parts (60%)
  STATS_PANE_FLEX: 2,                // Stats pane takes 2 parts (40%)
};
