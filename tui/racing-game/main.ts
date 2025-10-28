#!/usr/bin/env bun
// main.ts - Entry point for OpenTUI Racing Game
// Phase 1: Foundation Setup - Renderer initialization and frame callback pattern
// Phase 2: Layout Structure - Two-pane layout with flexbox

import { createCliRenderer, BoxRenderable, TextRenderable } from "@opentui/core";
import { GAME_CONFIG, COLORS, LAYOUT } from "./config.js";

/**
 * Main entry point
 * Sets up the OpenTUI renderer with proper configuration
 */
async function main() {
  console.log("🏁 Starting OpenTUI Racing Game...\n");

  // Create the CLI renderer with OpenTUI
  // Learning Note: createCliRenderer is async - must await
  const renderer = await createCliRenderer({
    exitOnCtrlC: true,              // Clean exit on Ctrl+C
    targetFps: GAME_CONFIG.RENDER_FPS,  // 30 FPS for smooth animation
    useAlternateScreen: true,       // Preserve terminal content on exit
    useMouse: true,                 // Enable mouse for buttons/tabs (future)
  });

  // Set background color
  renderer.setBackgroundColor(COLORS.MAIN_BG);

  // ==================== Phase 2: Two-Pane Layout ====================

  // Main container for both panes (horizontal split)
  // Learning Note: flexDirection: "row" creates horizontal layout
  const mainContainer = new BoxRenderable(renderer, {
    id: "main-container",
    flexDirection: "row",         // Horizontal layout (left | right)
    alignItems: "stretch",        // Fill full height
    width: renderer.terminalWidth,
    height: renderer.terminalHeight,
    position: "absolute",
    left: 0,
    top: 0,
    backgroundColor: COLORS.MAIN_BG,
  });

  // Left pane: Game (60% width)
  // Learning Note: flexGrow ratio determines relative widths (3:2 = 60:40)
  const gamePane = new BoxRenderable(renderer, {
    id: "game-pane",
    flexGrow: LAYOUT.GAME_PANE_FLEX,   // 3 parts out of 5 = 60%
    flexShrink: 0,
    backgroundColor: COLORS.GAME_PANE_BG,
    border: true,
    borderStyle: "rounded",
    borderColor: COLORS.GAME_BORDER,
    title: "🏁 Race Track",
    titleAlignment: "center",
  });

  // Right pane: Stats (40% width)
  const statsPane = new BoxRenderable(renderer, {
    id: "stats-pane",
    flexGrow: LAYOUT.STATS_PANE_FLEX,  // 2 parts out of 5 = 40%
    flexShrink: 0,
    backgroundColor: COLORS.STATS_PANE_BG,
    border: true,
    borderStyle: "rounded",
    borderColor: COLORS.STATS_BORDER,
    title: "📊 Stats & Info",
    titleAlignment: "center",
  });

  // Add test content to game pane
  const gameTestText = new TextRenderable(renderer, {
    id: "game-test-text",
    content: [
      "✅ Phase 2: Layout Complete!",
      "",
      "Game Pane (Left - 60%)",
      "",
      "This pane will display:",
      "  • Racing track",
      "  • 4 lanes with dividers",
      "  • Car sprites (🏎️ 🚗 🚙 🏁)",
      "  • Obstacles (🌳)",
      "",
      "Coming in Phase 3!",
    ].join("\n"),
    position: "absolute",
    left: 2,
    top: 2,
    fg: "#ffffff",
  });

  // Add test content to stats pane
  const statsTestText = new TextRenderable(renderer, {
    id: "stats-test-text",
    content: [
      "✅ Phase 2: Layout Complete!",
      "",
      "Stats Pane (Right - 40%)",
      "",
      "This pane will display:",
      "  • Tab selection",
      "  • Overview stats",
      "  • Car details",
      "  • Event log",
      "",
      "Coming in Phase 4!",
    ].join("\n"),
    position: "absolute",
    left: 2,
    top: 2,
    fg: "#ffffff",
  });

  // Frame counter display (bottom of game pane)
  const frameCounterText = new TextRenderable(renderer, {
    id: "frame-counter",
    content: "Frames: 0",
    position: "absolute",
    left: 2,
    bottom: 2,
    fg: "#888888",
  });

  // Add components to panes
  gamePane.add(gameTestText);
  gamePane.add(frameCounterText);
  statsPane.add(statsTestText);

  // Add panes to main container
  mainContainer.add(gamePane);
  mainContainer.add(statsPane);

  // Add main container to renderer root
  renderer.root.add(mainContainer);

  // Start the renderer
  renderer.start();

  // Frame callback pattern with decoupled update rate
  // Learning Note: Rendering runs at 30 FPS, game logic will update every 500ms
  let gameUpdateAccumulator = 0;
  let frameCount = 0;
  let gameUpdateCount = 0;

  const frameCallback = async (deltaMs: number) => {
    // deltaMs: milliseconds since last frame (typically ~33ms at 30 FPS)
    frameCount++;

    // Accumulate time for game updates
    gameUpdateAccumulator += deltaMs;

    // Update game logic at slower rate (every 500ms)
    if (gameUpdateAccumulator >= GAME_CONFIG.GAME_UPDATE_INTERVAL_MS) {
      gameUpdateCount++;
      gameUpdateAccumulator = 0; // Reset accumulator
    }

    // Update visual components at 30 FPS (smooth animation)
    // For Phase 2, update the frame counter to verify animation loop
    frameCounterText.content = [
      `Frames: ${frameCount}`,
      `Game Updates: ${gameUpdateCount}`,
      `Terminal: ${renderer.terminalWidth}x${renderer.terminalHeight}`,
    ].join(" | ");
  };

  // Register frame callback
  // Learning Note: This replaces setInterval - called automatically each frame
  renderer.setFrameCallback(frameCallback);

  // Keyboard event handling
  renderer.keyInput.on("keypress", (key) => {
    // Quit on Escape (Ctrl+C handled by exitOnCtrlC option)
    if (key.name === "escape") {
      console.log("\n👋 Shutting down gracefully...");
      renderer.removeFrameCallback(frameCallback);
      renderer.stop();
      process.exit(0);
    }
  });

  // Handle terminal resize
  // Learning Note: OpenTUI's Yoga layout auto-recalculates on property changes
  const handleResize = () => {
    mainContainer.width = renderer.terminalWidth;
    mainContainer.height = renderer.terminalHeight;
    // Flexbox will automatically recalculate child pane sizes (60:40 ratio)
  };

  renderer.on("resize", handleResize);

  console.log("✅ Renderer started! Press ESC to quit.\n");
}

// Run the main function
main().catch((error) => {
  console.error("❌ Fatal error:", error);
  process.exit(1);
});
