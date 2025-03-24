# tests/test_trainer.py
#advised to keep this python file. #new

import os
import sys
import unittest
import torch
import pandas as pd

# Add project root to Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from src.trainer import ModelTrainer
from src.data_processor import DocumentationDataProcessor

class TestModelTrainer(unittest.TestCase):
    """
    Comprehensive unit tests for the ModelTrainer class
    """

    @classmethod
    def setUpClass(cls):
        """
        Set up resources shared across test cases
        """
        # Initialize data processor and prepare sample data
        data_processor = DocumentationDataProcessor()
        cls.training_data = data_processor.prepare_training_data()
        
        # Initialize trainer
        cls.trainer = ModelTrainer()

    def test_model_trainer_initialization(self):
        """
        Verify that the ModelTrainer is correctly initialized
        """
        # Check key attributes
        self.assertIsNotNone(self.trainer.model, "Model should be initialized")
        self.assertIsNotNone(self.trainer.tokenizer, "Tokenizer should be initialized")
        
        # Verify configuration parameters
        self.assertTrue(hasattr(self.trainer, 'learning_rate'), "Learning rate should be defined")
        self.assertTrue(hasattr(self.trainer, 'batch_size'), "Batch size should be defined")
        self.assertTrue(hasattr(self.trainer, 'epochs'), "Epochs should be defined")

    def test_data_preparation(self):
        """
        Test the data preparation method
        """
        # Prepare data loader
        dataloader = self.trainer.prepare_data(self.training_data)
        
        # Verify dataloader characteristics
        self.assertIsNotNone(dataloader, "Dataloader should not be None")
        
        # Check first batch
        first_batch = next(iter(dataloader))
        expected_keys = ['input_ids', 'attention_mask', 'labels']
        
        for key in expected_keys:
            self.assertIn(key, first_batch, f"Missing key in batch: {key}")
            self.assertIsInstance(first_batch[key], torch.Tensor, f"{key} should be a torch Tensor")

    def test_training_process(self):
        """
        Test the model training method
        """
        # Use a small subset of data for quick testing
        small_dataset = self.training_data.head(10)
        
        # Perform training
        training_metrics = self.trainer.train(small_dataset)
        
        # Verify training metrics
        self.assertIsInstance(training_metrics, dict, "Training should return a metrics dictionary")
        
        expected_metrics = ['total_loss', 'average_loss', 'epochs']
        for metric in expected_metrics:
            self.assertIn(metric, training_metrics, f"Missing metric: {metric}")

    def test_model_saving_and_loading(self):
        """
        Test model saving and loading functionality
        """
        # Perform a quick training
        small_dataset = self.training_data.head(10)
        self.trainer.train(small_dataset)
        
        # Save the model
        self.trainer.save_model()
        
        # Verify model save location exists
        model_save_path = os.path.join(
            os.path.dirname(__file__), 
            '..', 
            'models', 
            'summarization_model'
        )
        self.assertTrue(os.path.exists(model_save_path), 
                        "Model should be saved to specified location")

def main():
    """
    Run the test suite
    """
    unittest.main()

if __name__ == '__main__':
    main()