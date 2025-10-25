"""Random controller for car decision making"""

import random
from dataclasses import dataclass
from typing import Any, Literal


@dataclass
class Action:
    """
    Action dataclass representing a decision
    Demonstrates: Python 3.10+ dataclasses with type hints
    """
    type: Literal['stay', 'lane_change']
    direction: int = 0


class RandomController:
    """
    RandomController makes purely random decisions for car movement
    This demonstrates the strategy pattern - the controller can be swapped
    with AI or user input controllers without changing car logic
    """

    def __init__(self, lane_change_chance: float = 0.05) -> None:
        """
        Initialize random controller

        Args:
            lane_change_chance: Probability of lane change per tick (default 0.05 = 5%)
        """
        self._lane_change_chance: float = lane_change_chance

    async def decide_action(self, car_state: dict[str, Any]) -> dict[str, Any]:
        """
        Decide what action the car should take

        Args:
            car_state: Current state of the car

        Returns:
            Action decision dictionary

        Note: This is async even though random decisions are instant.
        This architecture allows future controllers (AI, network) to be
        truly async without changing car logic.
        """
        # Purely random decision making - ignores car state
        if random.random() < self._lane_change_chance:
            return {
                'type': 'lane_change',
                'direction': random.choice([-1, 1])  # Randomly left (-1) or right (1)
            }

        return {'type': 'stay'}  # No action - stay in current lane

    def get_config(self) -> dict[str, Any]:
        """
        Get controller configuration

        Returns:
            Controller settings
        """
        return {
            'type': 'random',
            'lane_change_chance': self._lane_change_chance
        }
