"""
Generator utilities for game entities
Demonstrates: Generators, async generators, type hints for iterators
"""

import asyncio
from typing import Iterator, AsyncIterator
from entities.obstacle import Obstacle


def obstacle_generator() -> Iterator[Obstacle]:
    """
    Infinite generator that produces random obstacles
    Demonstrates: Generator function with yield, Iterator type hint

    Yields:
        Obstacle: A new random obstacle

    Example:
        gen = obstacle_generator()
        obstacle1 = next(gen)
        obstacle2 = next(gen)
    """
    while True:
        yield Obstacle.create_random(0.0)


def obstacle_generator_n(count: int) -> Iterator[Obstacle]:
    """
    Generator that produces N obstacles
    Demonstrates: Finite generator with parameter

    Args:
        count: Number of obstacles to generate

    Yields:
        Obstacle: A new random obstacle
    """
    for _ in range(count):
        yield Obstacle.create_random(0.0)


async def async_obstacle_generator(delay_ms: int = 100) -> AsyncIterator[Obstacle]:
    """
    Async generator that produces obstacles with delay
    Demonstrates: Async generators (async def with yield), AsyncIterator type hint

    Args:
        delay_ms: Delay between obstacles in milliseconds

    Yields:
        Obstacle: A new random obstacle

    Example:
        async for obstacle in async_obstacle_generator(100):
            # Process obstacle
            pass
    """
    while True:
        await asyncio.sleep(delay_ms / 1000)
        yield Obstacle.create_random(0.0)


def take(iterable: Iterator, n: int) -> Iterator:
    """
    Iterator helper: Take first N items from an iterable
    Demonstrates: Generator composition, itertools-style patterns

    Args:
        iterable: Source iterable
        n: Number of items to take

    Yields:
        Items from the iterable

    Example:
        obstacles = take(obstacle_generator(), 5)
        # Gets exactly 5 obstacles
    """
    count = 0
    for item in iterable:
        if count >= n:
            break
        yield item
        count += 1
