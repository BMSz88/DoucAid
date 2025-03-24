# src/model.py
#this file contains the main model class for the Documentation Summarization AI project. It includes the core functionality for generating abstractive summaries of documentation text.
# Import necessary libraries
import torch
from transformers import T5ForConditionalGeneration, T5Tokenizer
import yaml
import os
import logging

class DocumentationSummarizer:
    def __init__(self, config_path='../config/config.yaml'):
        """
        Initialize the Documentation Summarization Model
        
        Args:
            config_path (str): Path to configuration file
        """
        # Setup logging
        logging.basicConfig(level=logging.INFO)
        self.logger = logging.getLogger(__name__)
        
        # Load configuration
        try:
            config_path = os.path.abspath(os.path.join(os.path.dirname(__file__), config_path))
            with open(config_path, 'r') as file:
                self.config = yaml.safe_load(file)
        except Exception as e:
            self.logger.error(f"Error loading configuration: {e}")
            raise
        
        # Initialize model and tokenizer
        self.model_name = self.config['model']['name']
        
        try:
            self.tokenizer = T5Tokenizer.from_pretrained(self.model_name)
            self.model = T5ForConditionalGeneration.from_pretrained(self.model_name)
        except Exception as e:
            self.logger.error(f"Error initializing model: {e}")
            raise
        
        # Configure model parameters
        self.max_input_length = self.config['model']['max_input_length']
        self.max_output_length = self.config['model']['max_output_length']
    
    def generate_summary(self, text, **kwargs):
        """
        Generate abstractive summary with precise compression control
        
        Args:
            text (str): Input documentation text
            **kwargs: Flexible keyword arguments for length control
        
        Returns:
            str: Generated summary
        """
        try:
            # Calculate input text length
            input_words = text.split()
            input_length = len(input_words)
            
            # Use configuration defaults with flexible overrides
            min_length = kwargs.get('min_length', max(10, input_length // 3))
            max_length = kwargs.get('max_length', min(30, input_length // 2))
            
            # Ensure minimum and maximum lengths are reasonable
            min_length = max(5, min(min_length, input_length // 2))
            max_length = max(min_length, min(max_length, input_length - 5))
            
            # Preprocess input
            input_text = f"summarize: {text}"
            
            # Tokenize input
            inputs = self.tokenizer.encode(
                input_text, 
                return_tensors="pt", 
                max_length=self.max_input_length, 
                truncation=True
            )
            
            # Generate summary with flexible parameters
            summary_ids = self.model.generate(
                inputs,
                min_length=min_length,
                max_length=max_length,
                num_return_sequences=1,
                no_repeat_ngram_size=2,
                do_sample=True,
                temperature=0.7,
                top_k=50,
                top_p=0.95
            )
            
            # Decode summary
            summary = self.tokenizer.decode(summary_ids[0], skip_special_tokens=True)
            
            # Fine-tune summary length
            words = summary.split()
            
            # Adjust summary to target length
            if len(words) > max_length:
                summary = ' '.join(words[:max_length])
            elif len(words) < min_length:
                # If too short, regenerate with adjusted parameters
                additional_ids = self.model.generate(
                    inputs,
                    min_length=min_length - len(words),
                    max_length=max_length - len(words),
                    num_return_sequences=1,
                    no_repeat_ngram_size=2
                )
                additional_text = self.tokenizer.decode(additional_ids[0], skip_special_tokens=True)
                summary += " " + additional_text
            
            # Final length adjustment
            words = summary.split()
            summary = ' '.join(words[:max_length])
            
            return summary
        
        except Exception as e:
            self.logger.error(f"Error generating summary: {e}")
            return "Unable to generate summary due to an error."
    
    def fine_tune(self, training_data):
        """
        Fine-tune the model on specific documentation data
        
        Args:
            training_data (list): List of training examples
        
        Returns:
            dict: Fine-tuning metrics
        """
        try:
            # Prepare training inputs
            inputs = self.tokenizer(
                [f"summarize: {item['text']}" for item in training_data],
                max_length=self.max_input_length,
                truncation=True,
                padding=True,
                return_tensors="pt"
            )
            
            targets = self.tokenizer(
                [item['summary'] for item in training_data],
                max_length=self.max_output_length,
                truncation=True,
                padding=True,
                return_tensors="pt"
            )
            
            # Placeholder for actual fine-tuning logic
            self.logger.info("Fine-tuning process initiated")
            
            return {
                "status": "Fine-tuning simulation",
                "total_samples": len(training_data)
            }
        
        except Exception as e:
            self.logger.error(f"Error during fine-tuning: {e}")
            return {"status": "Error", "message": str(e)}

def main():
    """
    Demonstration of model usage
    """
    # Initialize the summarizer
    summarizer = DocumentationSummarizer()
    
    # Example documentation texts with different lengths
    sample_texts = [
        "Python is a high-level, interpreted programming language known for its readability and versatility.",
        "Python supports multiple programming paradigms, including procedural, object-oriented, and functional programming. It is widely used in web development, data science, artificial intelligence, and scientific computing.",
        "From a social perspective, urban green spaces foster community interactions and social cohesion. They provide a venue for events, activities, and gatherings, encouraging people from diverse backgrounds to come together."
    ]
    
    # Demonstrate summaries with different length constraints
    for text in sample_texts:
        print("\nOriginal Text:")
        print(text)
        print(f"Original Length: {len(text.split())} words")
        
        # Generate summaries with different length constraints
        summary_lengths = [
            (5, 10),   # Very short summary
            (10, 20),  # Short summary
            (15, 30)   # Moderate summary
        ]
        
        for min_len, max_len in summary_lengths:
            summary = summarizer.generate_summary(
                text, 
                min_length=min_len, 
                max_length=max_len
            )
            print(f"\nSummary (Min: {min_len}, Max: {max_len} words):")
            print(summary)
            print(f"Summary Length: {len(summary.split())} words")

if __name__ == "__main__":
    main()