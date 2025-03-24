# test_summarization.py
import sys
import os
import datetime

# Add project root to Python path
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
sys.path.insert(0, project_root)

from src.model import DocumentationSummarizer
from src.data_processor import DocumentationDataProcessor

def test_summarization():
    # Initialize the summarizer
    summarizer = DocumentationSummarizer()
    
    # Sample technical documentation texts
    sample_texts = [
        """
        Machine learning is a method of data analysis that automates analytical model building. 
        It is a branch of artificial intelligence based on the idea that systems can learn from 
        data, identify patterns and make decisions with minimal human intervention. Machine learning 
        algorithms are used in a wide variety of applications, from email filtering and computer vision 
        to recommendation systems and self-driving cars.
        """,
        
        """
        Natural Language Processing (NLP) is a subfield of linguistics, computer science, 
        and artificial intelligence concerned with the interactions between computers and human language. 
        The goal is to enable computers to understand, interpret, and manipulate human language in valuable ways. 
        Key techniques include machine translation, sentiment analysis, and text summarization.
        """
    ]
    
    # Prepare results
    results = []
    
    # Generate summaries
    for i, text in enumerate(sample_texts, 1):
        result = {
            'sample_number': i,
            'original_length': len(text),
            'original_text': text,
            'summary': summarizer.generate_summary(text),
        }
        result['summary_length'] = len(result['summary'])
        result['compression_ratio'] = result['summary_length'] / result['original_length']
        
        results.append(result)
    
    return results

def test_data_processing():
    # Initialize data processor
    data_processor = DocumentationDataProcessor()
    
    # Prepare training data
    try:
        training_data = data_processor.prepare_training_data()
        return {
            'total_documents': len(training_data),
            'sample_data': training_data.head().to_dict()
        }
    except Exception as e:
        return {'error': str(e)}

def save_test_results(summarization_results, data_processing_results):
    # Create logs directory if it doesn't exist
    logs_dir = os.path.join(project_root, 'logs')
    os.makedirs(logs_dir, exist_ok=True)
    
    # Generate timestamp for unique filename
    timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    log_file = os.path.join(logs_dir, f'summarization_test_{timestamp}.txt')
    
    # Write results to file
    with open(log_file, 'w', encoding='utf-8') as f:
        f.write("Summarization Model Test Results\n")
        f.write("=" * 40 + "\n\n")
        
        # Summarization Results
        f.write("Summarization Test Results:\n")
        f.write("-" * 30 + "\n")
        for result in summarization_results:
            f.write(f"Sample {result['sample_number']}:\n")
            f.write(f"Original Text Length: {result['original_length']} characters\n")
            f.write(f"Summary Length: {result['summary_length']} characters\n")
            f.write(f"Compression Ratio: {result['compression_ratio']:.2%}\n\n")
            f.write("Original Text:\n")
            f.write(result['original_text'] + "\n\n")
            f.write("Generated Summary:\n")
            f.write(result['summary'] + "\n")
            f.write("-" * 40 + "\n\n")
        
        # Data Processing Results
        f.write("\nData Processing Results:\n")
        f.write("-" * 30 + "\n")
        if 'error' in data_processing_results:
            f.write(f"Error: {data_processing_results['error']}\n")
        else:
            f.write(f"Total Documents Processed: {data_processing_results['total_documents']}\n")
            f.write("Sample Processed Data:\n")
            f.write(str(data_processing_results['sample_data']) + "\n")
    
    print(f"Test results saved to {log_file}")
    return log_file

def main():
    # Run tests
    summarization_results = test_summarization()
    data_processing_results = test_data_processing()
    
    # Save results to file
    save_test_results(summarization_results, data_processing_results)

if __name__ == "__main__":
    main()