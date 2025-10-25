"""Main entry point for the game"""

import asyncio
from game import Game


async def main() -> None:
    """
    Simple test of the game logic (Phase 2 test)
    Full rendering will be added in Phase 4
    """
    print('🏁 Vertical Lane Racer - Phase 2 Test\n')

    game = Game()
    await game.initialize()

    print('Starting race with 4 cars...\n')

    # Run game loop
    max_ticks = 100  # Safety limit
    while game.is_running() and max_ticks > 0:
        await game.update()

        # Print stats every 10 ticks
        if game.tick % 10 == 0:
            stats = game.get_stats()
            print(f"Tick {stats['tick']}: Active: {stats['active_cars']}, "
                  f"Crashed: {stats['crashed_cars']}, Finished: {stats['finished_cars']}, "
                  f"Obstacles: {stats['obstacle_count']}")

        max_ticks -= 1

        # Small delay for visibility
        await asyncio.sleep(0.05)

    # Display results
    print('\n🏁 Race finished!')
    winner = game.get_winner()

    if winner:
        print(f'🎉 Winner: Car {winner.id} {winner.symbol}')
        print(f'   Final position: {winner.position:.2f}')
    else:
        print('❌ No winner - all cars crashed!')

    # Final stats
    print('\n📊 Final Statistics:')
    final_stats = game.get_stats()
    print(f"   Total ticks: {final_stats['tick']}")
    print(f"   Active cars: {final_stats['active_cars']}")
    print(f"   Crashed cars: {final_stats['crashed_cars']}")
    print(f"   Finished cars: {final_stats['finished_cars']}")

    # Show each car's final state
    print('\n🚗 Car Details:')
    for car in game.cars:
        print(f'   {car.symbol} Car {car.id}: Lane {car.lane}, '
              f'Position {car.position:.2f}, Status: {car.status}')


if __name__ == '__main__':
    asyncio.run(main())
