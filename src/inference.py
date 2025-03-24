# src/inference.py

import os
import logging
import yaml
import torch
from transformers import T5ForConditionalGeneration, T5Tokenizer

class SummaryInference:
    """
    Inference service for documentation summarization
    Provides methods for generating summaries from trained models
    """
    def __init__(self, config_path='../config/config.yaml', model_path='../models/summarization_model'):
        """
        Initialize inference service with model and configuration

        Args:
            config_path (str): Path to configuration file
            model_path (str): Path to pre-trained model
        """
        # Configure logging
        logging.basicConfig(level=logging.INFO)
        self.logger = logging.getLogger(__name__)

        # Load configuration
        try:
            config_path = os.path.abspath(os.path.join(os.path.dirname(__file__), config_path))
            with open(config_path, 'r') as file:
                self.config = yaml.safe_load(file)
        except Exception as e:
            self.logger.error(f"Configuration loading error: {e}")
            raise

        # Set computational device
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        self.logger.info(f"Inference running on: {self.device}")

        # Load model and tokenizer
        self.model_path = os.path.abspath(os.path.join(os.path.dirname(__file__), model_path))
        self._load_model()

    def _load_model(self):
        """
        Load pre-trained model and tokenizer
        """
        try:
            self.tokenizer = T5Tokenizer.from_pretrained(self.model_path)
            self.model = T5ForConditionalGeneration.from_pretrained(self.model_path)
            
            # Move model to appropriate device
            self.model.to(self.device)
            self.model.eval()  # Set to evaluation mode
            
            self.logger.info("Model successfully loaded for inference")
        except Exception as e:
            self.logger.error(f"Model loading error: {e}")
            raise

    def generate_summary(self, text, max_length=None, min_length=None):
        """
        Generate summary for given text

        Args:
            text (str): Input text to summarize
            max_length (int, optional): Maximum summary length
            min_length (int, optional): Minimum summary length

        Returns:
            str: Generated summary
        """
        try:
            # Use configuration defaults if not specified
            max_length = max_length or self.config['model']['max_output_length']
            min_length = min_length or max_length // 2

            # Prepare input text
            input_text = f"summarize: {text}"

            # Tokenize input
            inputs = self.tokenizer.encode(
                input_text, 
                return_tensors="pt", 
                max_length=self.config['model']['max_input_length'], 
                truncation=True
            ).to(self.device)

            # Generate summary
            with torch.no_grad():
                summary_ids = self.model.generate(
                    inputs,
                    max_length=max_length,
                    min_length=min_length,
                    num_return_sequences=1,
                    temperature=self.config['inference']['temperature'],
                    top_k=self.config['inference']['top_k'],
                    top_p=self.config['inference']['top_p']
                )

            # Decode summary
            summary = self.tokenizer.decode(summary_ids[0], skip_special_tokens=True)
            
            return summary

        except Exception as e:
            self.logger.error(f"Summary generation error: {e}")
            return "Unable to generate summary due to an error."

    def batch_summarize(self, texts):
        """
        Generate summaries for multiple texts

        Args:
            texts (list): List of texts to summarize

        Returns:
            list: Generated summaries
        """
        try:
            summaries = [self.generate_summary(text) for text in texts]
            return summaries
        except Exception as e:
            self.logger.error(f"Batch summarization error: {e}")
            return []

    def evaluate_summary_quality(self, original_text, generated_summary):
        """
        Basic evaluation of summary quality

        Args:
            original_text (str): Original input text
            generated_summary (str): Generated summary

        Returns:
            dict: Summary quality metrics
        """
        try:
            return {
                'original_length': len(original_text),
                'summary_length': len(generated_summary),
                'compression_ratio': len(generated_summary) / len(original_text),
                'summary_readability': self._calculate_readability(generated_summary)
            }
        except Exception as e:
            self.logger.error(f"Summary quality evaluation error: {e}")
            return {}

    def _calculate_readability(self, text):
        """
        Calculate basic readability metrics

        Args:
            text (str): Input text

        Returns:
            float: Readability score
        """
        try:
            # Simple readability calculation based on average word length
            words = text.split()
            if not words:
                return 0
            
            avg_word_length = sum(len(word) for word in words) / len(words)
            return round(avg_word_length, 2)
        except Exception as e:
            self.logger.error(f"Readability calculation error: {e}")
            return 0

def main():
    """
    Demonstration of inference capabilities
    """
    # Sample text for summarization
    sample_text = """
    Machine learning is a method of data analysis that automates analytical model building. 
    It is a branch of artificial intelligence based on the idea that systems can learn from 
    data, identify patterns and make decisions with minimal human intervention. Machine learning 
    algorithms are used in a wide variety of applications, from email filtering and computer vision 
    to recommendation systems and self-driving cars.
    """
    
    try:
        # Initialize inference service
        inference_service = SummaryInference()
        
        # Generate summary
        summary = inference_service.generate_summary(sample_text)
        
        # Evaluate summary
        quality_metrics = inference_service.evaluate_summary_quality(sample_text, summary)
        
        # Print results
        print("Original Text Length:", len(sample_text))
        print("Generated Summary:", summary)
        print("\nSummary Quality Metrics:")
        for metric, value in quality_metrics.items():
            print(f"{metric}: {value}")
    
    except Exception as e:
        print(f"Inference demonstration failed: {e}")

if __name__ == "__main__":
    main()