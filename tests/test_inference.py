# tests/test_inference.py

import os
import sys
import unittest

# Add project root to Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from src.inference import SummaryInference

class TestSummaryInference(unittest.TestCase):
    """
    Comprehensive unit tests for the SummaryInference class
    """

    @classmethod
    def setUpClass(cls):
        """
        Set up resources shared across test cases
        """
        cls.inference_service = SummaryInference()
        
        # Sample texts for testing
        cls.sample_texts = [
            """
            Machine learning is a method of data analysis that automates analytical model building. 
            It is a branch of artificial intelligence based on the idea that systems can learn from 
            data, identify patterns and make decisions with minimal human intervention.
            """,
            """
            Natural Language Processing (NLP) is a subfield of artificial intelligence 
            that focuses on the interaction between computers and human language. 
            It aims to enable computers to understand, interpret, and generate human language 
            in a valuable and meaningful way.
            """
        ]

    def test_model_initialization(self):
        """
        Verify that the inference service is properly initialized
        """
        self.assertIsNotNone(self.inference_service.model, 
                             "Model should be initialized")
        self.assertIsNotNone(self.inference_service.tokenizer, 
                             "Tokenizer should be initialized")

    def test_generate_summary(self):
        """
        Test summary generation for a single text
        """
        for sample_text in self.sample_texts:
            summary = self.inference_service.generate_summary(sample_text)
            
            # Assertions
            self.assertIsInstance(summary, str, 
                                  "Summary should be a string")
            self.assertTrue(len(summary) > 0, 
                            "Summary should not be empty")
            self.assertTrue(len(summary) < len(sample_text), 
                            "Summary should be shorter than original text")

    def test_summary_length_constraints(self):
        """
        Verify that summaries respect configured length constraints
        """
        for sample_text in self.sample_texts:
            # Test with default configuration
            summary = self.inference_service.generate_summary(sample_text)
            max_output_length = self.inference_service.config['model']['max_output_length']
            
            # Tokenize to check actual token length
            tokens = self.inference_service.tokenizer.encode(
                summary, 
                add_special_tokens=False
            )
            self.assertLessEqual(
                len(tokens), 
                max_output_length, 
                "Summary exceeds maximum token length"
            )

    def test_batch_summarization(self):
        """
        Test batch summarization functionality
        """
        summaries = self.inference_service.batch_summarize(self.sample_texts)
        
        # Assertions
        self.assertIsInstance(summaries, list, 
                              "Batch summarization should return a list")
        self.assertEqual(len(summaries), len(self.sample_texts), 
                         "Number of summaries should match input texts")
        
        for summary, original_text in zip(summaries, self.sample_texts):
            self.assertIsInstance(summary, str, 
                                  "Each summary should be a string")
            self.assertTrue(len(summary) > 0, 
                            "Summaries should not be empty")
            self.assertTrue(len(summary) < len(original_text), 
                            "Summaries should be shorter than original texts")

    def test_summary_quality_evaluation(self):
        """
        Test summary quality evaluation method
        """
        for sample_text in self.sample_texts:
            summary = self.inference_service.generate_summary(sample_text)
            quality_metrics = self.inference_service.evaluate_summary_quality(
                sample_text, 
                summary
            )
            
            # Assertions
            self.assertIsInstance(quality_metrics, dict, 
                                  "Quality evaluation should return a dictionary")
            
            expected_metrics = [
                'original_length', 
                'summary_length', 
                'compression_ratio', 
                'summary_readability'
            ]
            
            for metric in expected_metrics:
                self.assertIn(metric, quality_metrics, 
                              f"Missing metric: {metric}")
                self.assertIsInstance(quality_metrics[metric], (int, float), 
                                      f"Metric {metric} should be a number")

    def test_error_handling(self):
        """
        Test error handling for various input scenarios
        """
        # Test with empty string
        summary = self.inference_service.generate_summary("")
        self.assertIsInstance(summary, str, 
                              "Should handle empty input gracefully")
        
        # Test with None input
        with self.assertRaises(TypeError, 
                               msg="Should raise TypeError for None input"):
            self.inference_service.generate_summary(None)

def main():
    """
    Run the test suite
    """
    unittest.main()

if __name__ == '__main__':
    main()