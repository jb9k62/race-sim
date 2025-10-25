"""Game controller with modern Python features"""

import asyncio
import random
from typing import Any, Optional
from entities.car import Car
from entities.obstacle import Obstacle
from controllers.random import RandomController
from config import TRACK_LENGTH, NUM_LANES, OBSTACLE_SPAWN_RATE


class Game:
    """
    Game class managing the race simulation
    Demonstrates: Type hints, comprehensions, pattern matching, asyncio.gather
    """

    def __init__(self) -> None:
        """Initialize the game"""
        self.cars: list[Car] = []
        self.obstacles: list[Obstacle] = []
        self.track_length: int = TRACK_LENGTH
        self.tick: int = 0
        self.game_state: str = 'initialized'  # 'initialized', 'running', 'finished'
        self.winner: Optional[Car] = None

    async def initialize(self) -> None:
        """
        Initialize the game with 4 cars
        Demonstrates: List comprehension
        """
        # Create 4 cars with random controllers in different lanes
        starting_lanes = [0, 1, 2, 3]

        # List comprehension to create cars
        self.cars = [
            Car(lane, lane, RandomController())
            for lane in starting_lanes
        ]

        self.game_state = 'running'

    async def update(self) -> None:
        """
        Main game update loop
        Demonstrates: async/await, asyncio.gather for concurrent updates
        """
        if self.game_state != 'running':
            return

        # Update all cars concurrently (showcase asyncio.gather)
        await asyncio.gather(
            *[car.update_async() for car in self.cars]
        )

        # Update obstacles
        self.update_obstacles()

        # Spawn new obstacles randomly
        self.spawn_obstacle()

        # Check for collisions
        self.check_collisions()

        # Check win condition
        self.check_win_condition()

        self.tick += 1

    def update_obstacles(self) -> None:
        """
        Update all obstacles and remove off-track ones
        Demonstrates: List comprehension with filter condition
        """
        # Update each obstacle
        for obstacle in self.obstacles:
            obstacle.update()

        # Remove obstacles that are off the track (list comprehension)
        self.obstacles = [
            obstacle for obstacle in self.obstacles
            if not obstacle.is_off_track(self.track_length)
        ]

    def spawn_obstacle(self) -> None:
        """
        Randomly spawn new obstacles
        Demonstrates: Random probability check
        """
        if random.random() < OBSTACLE_SPAWN_RATE:
            self.obstacles.append(Obstacle.create_random(0.0))

    def check_collisions(self) -> set[int]:
        """
        Check for collisions between cars and obstacles
        Demonstrates: Set comprehension

        Returns:
            Set of car IDs that collided
        """
        # Use set comprehension to track cars that have collided
        collided_car_ids: set[int] = set()

        for car in self.cars:
            if car.status == 'active' and car.check_collision(self.obstacles):
                car.crash()
                collided_car_ids.add(car.id)

        return collided_car_ids

    def check_win_condition(self) -> None:
        """
        Check if any car has won or all cars are out
        Demonstrates: Pattern matching (match/case), generator expression with any()
        """
        # Check if any car has finished
        finished_car = next(
            (car for car in self.cars if car.status == 'finished'),
            None
        )

        if finished_car:
            self.winner = finished_car
            self.game_state = 'finished'
            return

        # Check if all cars have crashed using all() with generator
        all_crashed = all(car.status == 'crashed' for car in self.cars)

        if all_crashed:
            self.game_state = 'finished'
            # No winner if all crashed
            self.winner = None

    def is_running(self) -> bool:
        """Check if game is still running"""
        return self.game_state == 'running'

    def get_winner(self) -> Optional[Car]:
        """Get the winner (if any)"""
        return self.winner

    def get_state_snapshot(self) -> dict[str, Any]:
        """
        Get game state snapshot for AI controllers or debugging
        Demonstrates: List comprehension, dict with type hints

        Returns:
            Complete game state
        """
        return {
            'tick': self.tick,
            'game_state': self.game_state,
            'track_length': self.track_length,
            'cars': [car.to_dict() for car in self.cars],
            'obstacles': [obstacle.to_dict() for obstacle in self.obstacles],
            'winner': self.winner.to_dict() if self.winner else None,
        }

    def get_occupied_lanes(self) -> set[int]:
        """
        Get occupied lanes using set comprehension
        Demonstrates: Set comprehension with filtering

        Returns:
            Set of currently occupied lanes
        """
        # Set comprehension to get lanes of active cars
        return {
            car.lane
            for car in self.cars
            if car.status == 'active'
        }

    def get_available_lanes(self) -> set[int]:
        """
        Get available (unoccupied) lanes
        Demonstrates: Set operations (difference)

        Returns:
            Set of available lanes
        """
        all_lanes = {0, 1, 2, 3}
        occupied_lanes = self.get_occupied_lanes()

        # Set difference operation
        return all_lanes - occupied_lanes

    def get_active_cars_count(self) -> int:
        """
        Get active cars count
        Demonstrates: Generator expression with sum

        Returns:
            Number of active cars
        """
        return sum(1 for car in self.cars if car.status == 'active')

    def get_stats(self) -> dict[str, Any]:
        """
        Get game statistics
        Demonstrates: List comprehension, dict comprehension

        Returns:
            Game statistics
        """
        # List comprehensions to filter cars by status
        active_cars = [car for car in self.cars if car.status == 'active']
        crashed_cars = [car for car in self.cars if car.status == 'crashed']
        finished_cars = [car for car in self.cars if car.status == 'finished']

        return {
            'tick': self.tick,
            'active_cars': len(active_cars),
            'crashed_cars': len(crashed_cars),
            'finished_cars': len(finished_cars),
            'obstacle_count': len(self.obstacles),
            'game_state': self.game_state,
            'winner': f'Car {self.winner.id}' if self.winner else 'None'
        }

    def get_car_status_summary(self) -> dict[str, int]:
        """
        Get summary of car statuses using dict comprehension
        Demonstrates: Dict comprehension with filtering and sum

        Returns:
            Dictionary mapping status to count
        """
        statuses = ['active', 'crashed', 'finished']

        # Dict comprehension to count cars by status
        return {
            status: sum(1 for car in self.cars if car.status == status)
            for status in statuses
        }

    def get_car_by_id(self, car_id: int) -> Optional[Car]:
        """
        Get car by ID with pattern matching
        Demonstrates: Pattern matching (match/case) - Python 3.10+

        Args:
            car_id: ID of the car to find

        Returns:
            Car instance or None
        """
        car = next((car for car in self.cars if car.id == car_id), None)

        # Pattern matching to handle different cases
        match car:
            case None:
                return None
            case Car() if car.status == 'active':
                return car
            case Car():
                return car
            case _:
                return None
