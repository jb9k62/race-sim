#!/usr/bin/env bun
// main.ts - Entry point for OpenTUI Racing Game
// Phase 1: Foundation Setup - Renderer initialization and frame callback pattern

import { createCliRenderer, BoxRenderable, TextRenderable } from "@opentui/core";
import { GAME_CONFIG, COLORS } from "./config.js";

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

  // Create a simple container to test rendering (Phase 1 - Hello World)
  const container = new BoxRenderable(renderer, {
    id: "test-container",
    position: "absolute",
    left: 0,
    top: 0,
    width: renderer.terminalWidth,
    height: renderer.terminalHeight,
    backgroundColor: COLORS.MAIN_BG,
    border: true,
    borderStyle: "rounded",
    borderColor: COLORS.GAME_BORDER,
    title: "🏁 OpenTUI Racing Game - Phase 1 Test",
    titleAlignment: "center",
  });

  // Add test text
  const testText = new TextRenderable(renderer, {
    id: "test-text",
    content: [
      "✅ Phase 1: Foundation Setup Complete!",
      "",
      "Renderer Status:",
      `  • FPS: ${GAME_CONFIG.RENDER_FPS}`,
      `  • Terminal Size: ${renderer.terminalWidth}x${renderer.terminalHeight}`,
      `  • Game Update Interval: ${GAME_CONFIG.GAME_UPDATE_INTERVAL_MS}ms`,
      "",
      "Frame Callback Test:",
      "  • Frame counter will increment below...",
      "",
      "Frames rendered: 0",
      "",
      "Controls:",
      "  • ESC or Ctrl+C: Quit",
    ].join("\n"),
    position: "absolute",
    left: 4,
    top: 2,
    fg: "#ffffff",
  });

  container.add(testText);
  renderer.root.add(container);

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
    // For Phase 1, just update the frame counter
    testText.content = [
      "✅ Phase 1: Foundation Setup Complete!",
      "",
      "Renderer Status:",
      `  • FPS: ${GAME_CONFIG.RENDER_FPS}`,
      `  • Terminal Size: ${renderer.terminalWidth}x${renderer.terminalHeight}`,
      `  • Game Update Interval: ${GAME_CONFIG.GAME_UPDATE_INTERVAL_MS}ms`,
      "",
      "Frame Callback Test:",
      "  • Frame counter incrementing = renderer working! ✓",
      "",
      `Frames rendered: ${frameCount} (${GAME_CONFIG.RENDER_FPS} FPS)`,
      `Game updates: ${gameUpdateCount} (${1000 / GAME_CONFIG.GAME_UPDATE_INTERVAL_MS} Hz)`,
      "",
      "Controls:",
      "  • ESC or Ctrl+C: Quit",
      "",
      "Next: Phase 2 - Two-pane layout implementation",
    ].join("\n");
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
  const handleResize = () => {
    container.width = renderer.terminalWidth;
    container.height = renderer.terminalHeight;
  };

  renderer.on("resize", handleResize);

  console.log("✅ Renderer started! Press ESC to quit.\n");
}

// Run the main function
main().catch((error) => {
  console.error("❌ Fatal error:", error);
  process.exit(1);
});
