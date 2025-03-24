# src/data_processor.py

import os
import json
import logging
import pandas as pd
import re

class DocumentationDataProcessor:
    def __init__(self, raw_data_dir='../data/raw', processed_data_dir='../data/processed'):
        """
        Initialize Data Processor for Documentation Summarization
        
        Args:
            raw_data_dir (str): Directory containing raw documentation files
            processed_data_dir (str): Directory to store processed data
        """
        # Setup logging
        logging.basicConfig(level=logging.INFO)
        self.logger = logging.getLogger(__name__)
        
        # Set absolute paths
        self.raw_data_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), raw_data_dir))
        self.processed_data_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), processed_data_dir))
        
        # Ensure processed data directory exists
        os.makedirs(self.processed_data_dir, exist_ok=True)
    
    def load_documentation_files(self):
        """
        Load documentation files from the raw data directory
        
        Returns:
            list: List of dictionaries containing document texts
        """
        documents = []
        
        # Supported file types
        supported_extensions = ['.txt', '.md', '.json']
        
        try:
            # Iterate through files in the raw data directory
            for filename in os.listdir(self.raw_data_dir):
                file_path = os.path.join(self.raw_data_dir, filename)
                
                # Check file extension
                if os.path.isfile(file_path) and any(filename.endswith(ext) for ext in supported_extensions):
                    try:
                        with open(file_path, 'r', encoding='utf-8') as file:
                            # Handle different file types
                            if filename.endswith('.txt') or filename.endswith('.md'):
                                content = file.read()
                                documents.append({
                                    'filename': filename,
                                    'text': content
                                })
                            elif filename.endswith('.json'):
                                json_content = json.load(file)
                                # Assume JSON might have a specific structure
                                documents.append({
                                    'filename': filename,
                                    'text': json_content.get('text', '')
                                })
                    except Exception as e:
                        self.logger.error(f"Error reading file {filename}: {e}")
        
        except Exception as e:
            self.logger.error(f"Error loading documentation files: {e}")
        
        return documents
    
    def preprocess_text(self, text):
        """
        Preprocess documentation text
        
        Args:
            text (str): Input text to preprocess
        
        Returns:
            str: Preprocessed text
        """
        try:
            # Remove extra whitespaces
            text = ' '.join(text.split())
            
            # Remove special characters and digits
            text = re.sub(r'[^a-zA-Z\s]', '', text)
            
            # Convert to lowercase
            text = text.lower()
            
            # Remove multiple spaces
            text = re.sub(r'\s+', ' ', text).strip()
            
            return text
        
        except Exception as e:
            self.logger.error(f"Error preprocessing text: {e}")
            return text
    
    def prepare_training_data(self):
        """
        Prepare training data for the summarization model
        
        Returns:
            pd.DataFrame: Processed training dataset
        """
        try:
            # Load documentation files
            documents = self.load_documentation_files()
            
            # Preprocess and prepare training data
            processed_data = []
            for doc in documents:
                preprocessed_text = self.preprocess_text(doc['text'])
                
                # Generate placeholder summary (to be replaced with actual summarization)
                placeholder_summary = preprocessed_text[:min(len(preprocessed_text), 150)]
                
                processed_data.append({
                    'filename': doc['filename'],
                    'text': preprocessed_text,
                    'summary': placeholder_summary
                })
            
            # Convert to DataFrame
            df = pd.DataFrame(processed_data)
            
            # Save processed data
            output_path = os.path.join(self.processed_data_dir, 'processed_training_data.csv')
            df.to_csv(output_path, index=False)
            
            self.logger.info(f"Processed data saved to {output_path}")
            
            return df
        
        except Exception as e:
            self.logger.error(f"Error preparing training data: {e}")
            return pd.DataFrame()

def main():
    """
    Demonstration of data processing capabilities
    """
    # Initialize data processor
    data_processor = DocumentationDataProcessor()
    
    # Load and process documentation
    training_data = data_processor.prepare_training_data()
    
    # Print processing results
    print(f"Total documents processed: {len(training_data)}")
    print("\nFirst two documents:")
    print(training_data.head(2))

if __name__ == "__main__":
    main()