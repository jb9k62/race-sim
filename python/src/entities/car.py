"""Car entity with modern Python features"""

import random
from typing import Any, Protocol
from config import TRACK_LENGTH, NUM_LANES, CAR_SYMBOLS


class Controller(Protocol):
    """Protocol defining the controller interface"""
    async def decide_action(self, car_state: dict[str, Any]) -> dict[str, Any]:
        """Decide what action to take based on car state"""
        ...


class Car:
    """
    Car class representing a racing vehicle
    Demonstrates: Type hints, properties, private attributes, async/await
    """

    def __init__(self, id: int, lane: int, controller: Controller) -> None:
        """
        Initialize a car instance

        Args:
            id: Unique car identifier
            lane: Starting lane (0-3)
            controller: Controller instance for decision making
        """
        self.id: int = id
        self.lane: int = lane
        self.position: float = 0.0
        self._speed: float = random.random() * 1.5 + 0.5  # Random speed between 0.5 and 2.0
        self.symbol: str = CAR_SYMBOLS[id % len(CAR_SYMBOLS)]
        self.status: str = 'active'  # 'active', 'crashed', 'finished' TODO: does python have a pythonic enum
        self._controller: Controller = controller

    @property
    def speed(self) -> float:
        """Get car speed (property decorator for encapsulation)"""
        return self._speed

    def move_down(self) -> None:
        """Move the car down the track"""
        if self.status != 'active':
            return

        self.position += self._speed

        # Check if finished
        if self.position >= TRACK_LENGTH:
            self.position = TRACK_LENGTH
            self.status = 'finished'

    def switch_lane(self, direction: int) -> None:
        """
        Switch to a different lane

        Args:
            direction: Direction to move (-1 for left, 1 for right)
        """
        if self.status != 'active':
            return

        new_lane = self.lane + direction

        # Boundary checking
        if 0 <= new_lane < NUM_LANES:
            self.lane = new_lane

    def check_collision(self, obstacles: list[Any]) -> bool:
        """
        Check collision with obstacles

        Args:
            obstacles: List of obstacle objects

        Returns:
            True if collision detected
        """
        if self.status != 'active':
            return False

        # Check if any obstacle is at the same position and lane
        return any(
            obstacle.lane == self.lane and abs(obstacle.position - self.position) < 1
            for obstacle in obstacles
        )

    def crash(self) -> None:
        """Handle collision event"""
        self.status = 'crashed'
        self._speed *= 0.5  # Reduce speed after crash

    def get_state(self) -> dict[str, Any]:
        """
        Get current state for controller decision making

        Returns:
            Car state snapshot
        """
        return {
            'id': self.id,
            'lane': self.lane,
            'position': self.position,
            'speed': self._speed,
            'status': self.status
        }

    async def update_async(self) -> None:
        """
        Async update method - gets decision from controller and executes it
        Demonstrates async/await pattern
        """
        if self.status != 'active':
            return

        # Get decision from controller (strategy pattern)
        action = await self._controller.decide_action(self.get_state())

        # Execute the decision
        if action.get('type') == 'lane_change':
            self.switch_lane(action['direction'])

        # Move down the track
        self.move_down()

    def to_dict(self) -> dict[str, Any]:
        """
        Serialize car state to dictionary

        Returns:
            Serialized car data
        """
        return {
            'id': self.id,
            'lane': self.lane,
            'position': self.position,
            'speed': self._speed,
            'symbol': self.symbol,
            'status': self.status
        }
