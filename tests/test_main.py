"""
Tests for main module
"""

import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'src'))

from main import main

def test_main():
    """Test that main function runs without error"""
    try:
        main()
        assert True
    except Exception:
        assert False