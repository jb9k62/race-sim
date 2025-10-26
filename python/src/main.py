"""
Main entry point for Vertical Lane Racer
Demonstrates: Asyncio, error handling, context managers, signal handling
"""

import asyncio
import signal
import sys
from typing import NoReturn

from game import Game
from renderer import Renderer

# Frame rate: 100ms per frame = 10 FPS
FRAME_DELAY = 0.1


async def main() -> None:
    """
    Main game loop
    Demonstrates: async/await, context managers, error handling, cleanup pattern
    """
    game = Game()
    renderer = Renderer()

    # Flag for graceful shutdown
    should_stop = False

    def signal_handler(signum, frame):
        """
        Handle Ctrl+C gracefully
        Demonstrates: Signal handling, cleanup
        """
        nonlocal should_stop
        should_stop = True
        renderer.cleanup()
        print('\n\n👋 Game interrupted. Goodbye!\n')
        sys.exit(0)

    # Setup graceful shutdown handler
    # Demonstrates: Signal handling
    signal.signal(signal.SIGINT, signal_handler)

    try:
        # Use context manager for automatic cleanup
        # Demonstrates: Context manager usage (with statement)
        with renderer:
            # Initialize game
            await game.initialize()

            # Main game loop
            # Demonstrates: async loop, conditional logic
            while game.is_running() and not should_stop:
                await game.update()
                renderer.render(game)
                await asyncio.sleep(FRAME_DELAY)

            # Show final results
            if not should_stop:
                renderer.show_results(game)

    except Exception as error:
        # Error handling
        # Demonstrates: Exception handling, cleanup
        renderer.cleanup()
        print('\n❌ Error occurred:')
        print(error)
        sys.exit(1)
    finally:
        # Cleanup
        # Demonstrates: Finally block for cleanup
        renderer.cleanup()


if __name__ == '__main__':
    """
    Entry point
    Demonstrates: asyncio.run(), error handling
    """
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print('\n\n👋 Game interrupted. Goodbye!\n')
        sys.exit(0)
    except Exception as error:
        print(f'Fatal error: {error}')
        sys.exit(1)
