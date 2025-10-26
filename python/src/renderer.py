"""
Terminal renderer for the racing game
Demonstrates: F-strings, ANSI escape codes, context managers, type hints
"""

import os
import sys
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from game import Game

from config import TRACK_LENGTH, NUM_LANES, LANE_WIDTH


class Renderer:
    """
    Renderer class for terminal-based visualization
    Demonstrates: Type hints, f-strings, ANSI codes, context manager
    """

    def __init__(self) -> None:
        """Initialize the renderer"""
        self.track_length: int = TRACK_LENGTH
        self.num_lanes: int = NUM_LANES
        self.lane_width: int = LANE_WIDTH

    def clear(self) -> None:
        """
        Clear the terminal screen
        Demonstrates: OS-specific commands, ANSI escape codes
        """
        # ANSI escape sequence to clear screen and move cursor to top
        sys.stdout.write('\033[2J\033[H')
        sys.stdout.flush()

    def hide_cursor(self) -> None:
        """
        Hide cursor for cleaner rendering
        Demonstrates: ANSI escape codes
        """
        sys.stdout.write('\033[?25l')
        sys.stdout.flush()

    def show_cursor(self) -> None:
        """
        Show cursor
        Demonstrates: ANSI escape codes
        """
        sys.stdout.write('\033[?25h')
        sys.stdout.flush()

    def draw_border(self) -> str:
        """
        Draw a horizontal border line
        Demonstrates: String multiplication, f-strings

        Returns:
            Border string
        """
        width = self.lane_width * self.num_lanes + 2
        return '┌' + '─' * width + '┐'

    def draw_header(self) -> str:
        """
        Draw the header
        Demonstrates: Multi-line f-strings, list comprehension, str.join

        Returns:
            Header string
        """
        title = 'VERTICAL LANE RACER v1.0'
        lane_labels = ''.join(f' {i}  ' for i in range(self.num_lanes))

        width = self.lane_width * self.num_lanes + 2

        return '\n'.join([
            self.draw_border(),
            f'│  {title:<{self.lane_width * self.num_lanes - 2}}  │',
            f'│  Lane: {lane_labels}│',
            '├' + '─' * (self.lane_width * self.num_lanes + 2) + '┤',
        ])

    def build_track_grid(self, game: 'Game') -> list[str]:
        """
        Build track grid with cars and obstacles
        Demonstrates: List comprehension, nested loops, type hints

        Args:
            game: Game instance

        Returns:
            List of track lines
        """
        # Create empty grid (each cell is one character position)
        grid: list[list[str | None]] = [
            [None for _ in range(self.num_lanes)]
            for _ in range(self.track_length)
        ]

        # Place obstacles on grid
        for obstacle in game.obstacles:
            row = int(obstacle.position)
            if 0 <= row < self.track_length:
                grid[row][obstacle.lane] = obstacle.symbol

        # Place cars on grid (cars overlay obstacles)
        for car in game.cars:
            if car.status != 'finished':
                row = int(car.position)
                if 0 <= row < self.track_length:
                    grid[row][car.lane] = car.symbol

        # Convert grid to string lines
        lines: list[str] = []
        for row in range(self.track_length):
            line = '│  '
            for lane in range(self.num_lanes):
                cell = grid[row][lane]
                if cell:
                    line += f'{cell}   '
                else:
                    line += '|   '
            line += ' │'
            lines.append(line)

        return lines

    def draw_footer(self) -> str:
        """
        Draw the footer with finish line
        Demonstrates: String multiplication

        Returns:
            Footer string
        """
        width = self.lane_width * self.num_lanes + 2
        return '├' + '─' * width + '┤'

    def draw_stats(self, game: 'Game') -> str:
        """
        Draw car statistics
        Demonstrates: List comprehension, dict literal, match/case, f-strings

        Args:
            game: Game instance

        Returns:
            Stats string
        """
        stats = game.get_stats()

        # Map status to emoji using match/case (Python 3.10+)
        def get_status_emoji(status: str) -> str:
            match status:
                case 'active':
                    return '🏃'
                case 'crashed':
                    return '💥'
                case 'finished':
                    return '🏁'
                case _:
                    return '?'

        # Build car info lines using list comprehension
        car_lines = [
            f'│ {car.symbol} Car {car.id}: Lane {car.lane}, '
            f'Pos {car.position:>4.1f}, '
            f'Speed {car.speed:.1f} {get_status_emoji(car.status):<2} │'
            for car in game.cars
        ]

        tick_line = (
            f"│ Tick: {stats['tick']:>3} "
            f"| Active: {stats['active_cars']} | Crashed: {stats['crashed_cars']} "
            f"| Finished: {stats['finished_cars']}"
        ).ljust(self.lane_width * self.num_lanes + 2) + ' │'

        border = '├' + '─' * (self.lane_width * self.num_lanes + 2) + '┤'

        return '\n'.join([
            *car_lines,
            border,
            tick_line,
        ])

    def draw_bottom_border(self) -> str:
        """
        Draw the bottom border
        Demonstrates: String multiplication

        Returns:
            Bottom border string
        """
        width = self.lane_width * self.num_lanes + 2
        return '└' + '─' * width + '┘'

    def render(self, game: 'Game') -> None:
        """
        Render the complete game frame
        Demonstrates: Method composition, list unpacking, str.join

        Args:
            game: Game instance
        """
        self.clear()

        output = '\n'.join([
            self.draw_header(),
            *self.build_track_grid(game),
            self.draw_footer(),
            self.draw_stats(game),
            self.draw_bottom_border(),
        ])

        print(output)

    def show_results(self, game: 'Game') -> None:
        """
        Show final results screen
        Demonstrates: Multi-line f-strings, optional types

        Args:
            game: Game instance
        """
        self.clear()

        winner = game.get_winner()
        stats = game.get_stats()

        print('\n' + '═' * 50)
        print('🏁  RACE FINISHED  🏁'.center(50))
        print('═' * 50 + '\n')

        if winner:
            print(f'🎉 WINNER: Car {winner.id} {winner.symbol}')
            print(f'   Final Position: {winner.position:.2f}')
            print(f'   Final Lane: {winner.lane}')
            print(f'   Speed: {winner.speed:.2f}')
        else:
            print('❌ NO WINNER - All cars crashed!')

        print('\n' + '─' * 50)
        print('📊 FINAL STATISTICS\n')
        print(f"   Total Ticks: {stats['tick']}")
        print(f"   Active Cars: {stats['active_cars']}")
        print(f"   Crashed Cars: {stats['crashed_cars']}")
        print(f"   Finished Cars: {stats['finished_cars']}")

        print('\n🚗 CAR DETAILS\n')
        for car in game.cars:
            status = car.status.upper()
            print(f'   {car.symbol} Car {car.id}: {status} at position {car.position:.2f}')

        print('\n' + '═' * 50 + '\n')

        self.show_cursor()

    def cleanup(self) -> None:
        """
        Clean up renderer (show cursor, etc.)
        Demonstrates: Cleanup pattern
        """
        self.show_cursor()

    def __enter__(self):
        """
        Context manager entry
        Demonstrates: Context manager protocol (__enter__/__exit__)
        """
        self.hide_cursor()
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        """
        Context manager exit
        Ensures cursor is shown even if an error occurs
        """
        self.cleanup()
        return False  # Don't suppress exceptions
