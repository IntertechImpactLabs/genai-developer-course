"""
Common utilities for the GenAI course
"""

import os
from typing import Optional


def load_env_var(var_name: str, default: Optional[str] = None) -> str:
    """Load environment variable with optional default"""
    value = os.getenv(var_name, default)
    if value is None:
        raise ValueError(f"Environment variable {var_name} is required")
    return value


def print_section_header(title: str) -> None:
    """Print a formatted section header"""
    print("=" * 50)
    print(f" {title}")
    print("=" * 50)


def print_demo_info(section: str, part: str, demo: str) -> None:
    """Print demo information in a consistent format"""
    print_section_header(f"GenAI Course - {section} {part} {demo}")
    print(f"Running: {demo}")
    print(f"Section: {section}")
    print(f"Part: {part}")
    print("-" * 30)