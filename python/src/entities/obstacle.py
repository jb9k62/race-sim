"""Obstacle entity"""

import random
from typing import Any
from config import OBSTACLE_SYMBOLS, NUM_LANES


class Obstacle:
    """
    Obstacle class representing hazards on the track
    Demonstrates: Type hints, default parameters, class methods
    """

    def __init__(self, lane: int, position: float, type: str = 'static') -> None:
        """
        Initialize an obstacle

        Args:
            lane: Lane where obstacle is placed (0-3)
            position: Vertical position on track
            type: Type of obstacle ('static' or 'moving')
        """
        self.lane: int = lane
        self.position: float = position
        self.type: str = type
        self.symbol: str = random.choice(OBSTACLE_SYMBOLS)
        self.speed: float = random.random() * 0.5 if type == 'moving' else 0.0

    def update(self) -> None:
        """Update obstacle position (for moving obstacles)"""
        if self.type == 'moving':
            self.position += self.speed

    def is_at(self, position: float, lane: int) -> bool:
        """
        Check if obstacle is at a specific position and lane

        Args:
            position: Position to check
            lane: Lane to check

        Returns:
            True if obstacle is at the specified location
        """
        return self.lane == lane and abs(self.position - position) < 1

    def is_off_track(self, track_length: int) -> bool:
        """
        Check if obstacle is off the track

        Args:
            track_length: Length of the track

        Returns:
            True if obstacle is beyond track bounds
        """
        return self.position < 0 or self.position > track_length

    def to_dict(self) -> dict[str, Any]:
        """
        Serialize obstacle to dictionary

        Returns:
            Serialized obstacle data
        """
        return {
            'lane': self.lane,
            'position': self.position,
            'type': self.type,
            'symbol': self.symbol
        }

    @classmethod
    def create_random(cls, position: float = 0.0) -> 'Obstacle':
        """
        Create a random obstacle

        Args:
            position: Starting position (usually 0 for top of track)

        Returns:
            New obstacle instance
        """
        lane = random.randint(0, NUM_LANES - 1)
        type_ = 'moving' if random.random() < 0.2 else 'static'  # 20% chance of moving
        return cls(lane, position, type_)
