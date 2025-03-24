# tests/test_model.py

import os
import sys
import unittest
import torch

# Add project root to Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from src.model import DocumentationSummarizer

class TestDocumentationSummarizer(unittest.TestCase):
    """
    Unit tests for the DocumentationSummarizer class
    """

    @classmethod
    def setUpClass(cls):
        """
        Set up resources shared across test cases
        """
        cls.summarizer = DocumentationSummarizer()
        cls.sample_text = """
        Machine learning is a method of data analysis that automates analytical model building. 
        It is a branch of artificial intelligence based on the idea that systems can learn from 
        data, identify patterns and make decisions with minimal human intervention. Machine learning 
        algorithms are used in a wide variety of applications, from email filtering and computer vision 
        to recommendation systems and self-driving cars.
        """

    def test_model_initialization(self):
        """
        Test that the model and tokenizer are properly initialized
        """
        self.assertIsNotNone(self.summarizer.model, "Model should be initialized")
        self.assertIsNotNone(self.summarizer.tokenizer, "Tokenizer should be initialized")

    def test_generate_summary(self):
        """
        Test summary generation functionality
        """
        # Generate summary
        summary = self.summarizer.generate_summary(self.sample_text)
        
        # Assertions
        self.assertIsInstance(summary, str, "Summary should be a string")
        self.assertTrue(len(summary) > 0, "Summary should not be empty")
        self.assertTrue(len(summary) < len(self.sample_text), "Summary should be shorter than original text")

    def test_summary_length_constraints(self):
        """
        Verify that summary respects length constraints
        """
        # Test default configuration
        summary = self.summarizer.generate_summary(self.sample_text)
        max_output_length = self.summarizer.config['model']['max_output_length']
        
        # Tokenize to check actual token length
        tokens = self.summarizer.tokenizer.encode(summary, add_special_tokens=False)
        self.assertLessEqual(len(tokens), max_output_length, "Summary exceeds maximum token length")

    def test_fine_tuning_method(self):
        """
        Test the fine-tuning method with mock training data
        """
        mock_training_data = [
            {
                'text': "Sample document text about machine learning.",
                'summary': "Machine learning is an AI technique."
            }
        ]
        
        # Call fine-tuning method
        result = self.summarizer.fine_tune(mock_training_data)
        
        # Assertions
        self.assertIsInstance(result, dict, "Fine-tuning should return a dictionary")
        self.assertIn('status', result, "Result should contain a status")
        self.assertIn('total_samples', result, "Result should contain total samples")

    def test_error_handling(self):
        """
        Test error handling for invalid input
        """
        # Test with empty string
        summary = self.summarizer.generate_summary("")
        self.assertIsInstance(summary, str, "Should handle empty input gracefully")

    @unittest.skipIf(not torch.cuda.is_available(), "CUDA not available")
    def test_cuda_availability(self):
        """
        Test CUDA device availability (if applicable)
        """
        # Verify model can be moved to CUDA device
        try:
            self.summarizer.model.to('cuda')
            cuda_support = True
        except Exception:
            cuda_support = False
        
        self.assertTrue(cuda_support, "Model should support CUDA device")

def main():
    """
    Run the test suite
    """
    unittest.main()

if __name__ == '__main__':
    main()