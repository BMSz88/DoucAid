# src/__init__.py

"""
Initialization module for the Documentation Summarization AI project.

This module serves multiple purposes:
1. Mark the directory as a Python package
2. Provide easy access to key project components
3. Define package-level configurations and imports
"""

# Import key classes from respective modules
from .model import DocumentationSummarizer
from .data_processor import DocumentationDataProcessor
from .trainer import ModelTrainer
from .inference import SummaryInference

# Define package version
__version__ = '0.1.0'

# Specify which classes and functions can be directly imported
__all__ = [
    'DocumentationSummarizer',
    'DocumentationDataProcessor',
    'ModelTrainer',
    'SummaryInference'
]

# Optional: Package-level configuration or initialization
def initialize_package():
    """
    Optional initialization method for the package.
    Can be used to set up logging, configuration, or other global settings.
    """
    # Placeholder for potential package-wide initialization logic
    pass

# Automatically run initialization when package is imported
initialize_package()    