# tests/__init__.py
# Initialization module for the tests package.
# Provides configuration and utility functions for testing the Documentation Summarization AI project.
"""
Initialization module for the tests package.
Provides configuration and utility functions for testing the Documentation Summarization AI project.
"""

# Optional: Import key testing utilities or configuration
import sys
import os

# Add project root to Python path for consistent imports
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
sys.path.insert(0, project_root)

# You can add any project-wide testing configurations or utilities here
def setup_test_environment():
    """
    Set up consistent testing environment for the project.
    """
    # Placeholder for any global test setup logic
    pass

# Automatically run setup when tests package is imported
setup_test_environment()