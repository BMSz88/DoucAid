# tests/test_data_processor.py

import os
import sys
import unittest
import pandas as pd

# Add project root to Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from src.data_processor import DocumentationDataProcessor

class TestDocumentationDataProcessor(unittest.TestCase):
    """
    Comprehensive unit tests for the DocumentationDataProcessor class
    """

    @classmethod
    def setUpClass(cls):
        """
        Set up resources shared across test cases
        """
        cls.data_processor = DocumentationDataProcessor()
        
        # Create temporary test data directory
        cls.test_raw_dir = os.path.join(os.path.dirname(__file__), 'test_data', 'raw')
        cls.test_processed_dir = os.path.join(os.path.dirname(__file__), 'test_data', 'processed')
        
        # Ensure test directories exist
        os.makedirs(cls.test_raw_dir, exist_ok=True)
        os.makedirs(cls.test_processed_dir, exist_ok=True)

    def setUp(self):
        """
        Prepare test data before each test method
        """
        # Create sample text files for testing
        self._create_test_files()

    def _create_test_files(self):
        """
        Create sample documentation files for testing
        """
        test_files = [
            {
                'filename': 'test_doc1.txt',
                'content': """
                Machine learning is a method of data analysis that automates analytical model building. 
                It is a branch of artificial intelligence based on the idea that systems can learn from 
                data, identify patterns and make decisions with minimal human intervention.
                """
            },
            {
                'filename': 'test_doc2.md',
                'content': """
                Natural Language Processing (NLP) is a subfield of linguistics, computer science, and artificial intelligence 
                concerned with the interactions between computers and human language. The goal is to enable computers to 
                understand, interpret, and manipulate human language in valuable ways.
                """
            }
        ]

        # Write test files
        for file_info in test_files:
            file_path = os.path.join(self.test_raw_dir, file_info['filename'])
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(file_info['content'])

    def test_load_documentation_files(self):
        """
        Test loading documentation files from raw data directory
        """
        # Temporarily modify raw data directory for testing
        original_raw_dir = self.data_processor.raw_data_dir
        self.data_processor.raw_data_dir = self.test_raw_dir

        try:
            documents = self.data_processor.load_documentation_files()
            
            # Assertions
            self.assertIsInstance(documents, list, "Should return a list of documents")
            self.assertEqual(len(documents), 2, "Should load two test documents")
            
            # Verify document structure
            for doc in documents:
                self.assertIn('filename', doc, "Document should have a filename")
                self.assertIn('text', doc, "Document should have text content")
                self.assertTrue(len(doc['text']) > 0, "Document text should not be empty")
        
        finally:
            # Restore original raw data directory
            self.data_processor.raw_data_dir = original_raw_dir

    def test_preprocess_text(self):
        """
        Test text preprocessing functionality
        """
        test_texts = [
            "  Machine Learning is AWESOME!  ",
            "Data Science: Transforming Business with AI. 2023",
            "   Multiple   Spaces   Test   "
        ]

        expected_outputs = [
            "machine learning is awesome",
            "data science transforming business with ai",
            "multiple spaces test"
        ]

        for original, expected in zip(test_texts, expected_outputs):
            processed_text = self.data_processor.preprocess_text(original)
            self.assertEqual(processed_text, expected, f"Preprocessing failed for: {original}")

    def test_prepare_training_data(self):
        """
        Test training data preparation
        """
        # Temporarily modify raw and processed data directories
        original_raw_dir = self.data_processor.raw_data_dir
        original_processed_dir = self.data_processor.processed_data_dir
        
        self.data_processor.raw_data_dir = self.test_raw_dir
        self.data_processor.processed_data_dir = self.test_processed_dir

        try:
            # Prepare training data
            training_data = self.data_processor.prepare_training_data()
            
            # Assertions
            self.assertIsInstance(training_data, pd.DataFrame, "Should return a DataFrame")
            self.assertEqual(len(training_data), 2, "Should process two test documents")
            
            # Verify DataFrame columns
            expected_columns = ['filename', 'text', 'summary']
            for col in expected_columns:
                self.assertIn(col, training_data.columns, f"Missing column: {col}")
            
            # Verify processed data characteristics
            for _, row in training_data.iterrows():
                self.assertTrue(len(row['text']) > 0, "Processed text should not be empty")
                self.assertTrue(len(row['summary']) > 0, "Summary should not be empty")
                self.assertTrue(len(row['summary']) <= len(row['text']), "Summary should be shorter than original text")
        
        finally:
            # Restore original directories
            self.data_processor.raw_data_dir = original_raw_dir
            self.data_processor.processed_data_dir = original_processed_dir

    def tearDown(self):
        """
        Clean up test files after each test method
        """
        for filename in os.listdir(self.test_raw_dir):
            os.remove(os.path.join(self.test_raw_dir, filename))

    @classmethod
    def tearDownClass(cls):
        """
        Remove test directories after all tests complete
        """
        import shutil
        shutil.rmtree(os.path.join(os.path.dirname(__file__), 'test_data'), ignore_errors=True)

def main():
    """
    Run the test suite
    """
    unittest.main()

if __name__ == '__main__':
    main()