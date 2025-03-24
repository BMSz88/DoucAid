# src/cli_summarizer.py
import sys
import os
import argparse

# Add project root to Python path
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
sys.path.insert(0, project_root)

from src.model import DocumentationSummarizer

def interactive_summarization():
    """
    Interactive CLI for text summarization
    """
    # Initialize summarizer
    summarizer = DocumentationSummarizer()
    
    print("\n===== Documentation Summarization AI =====")
    print("Welcome to the Interactive Summarization Tool!")
    
    while True:
        # Input text
        print("\n[INPUT] Enter the text you want to summarize (or 'quit' to exit):")
        text = input("Text: ").strip()
        
        # Exit condition
        if text.lower() in ['quit', 'exit', 'q']:
            print("Thank you for using the Summarization AI. Goodbye!")
            break
        
        # Validate input
        if not text:
            print("Error: Please enter some text to summarize.")
            continue
        
        # Get summary length preferences
        while True:
            try:
                min_length = int(input("Minimum summary length (words): "))
                max_length = int(input("Maximum summary length (words): "))
                
                # Validate length inputs
                if min_length < 10:
                    print("Minimum length should be at least 10 words.")
                    continue
                
                if max_length < min_length:
                    print("Maximum length must be greater than minimum length.")
                    continue
                
                break
            except ValueError:
                print("Please enter valid numbers for length.")
        
        # Generate summary
        try:
            summary = summarizer.generate_summary(
                text, 
                min_length=min_length, 
                max_length=max_length
            )
            
            # Display results
            print("\n===== Summary =====")
            print(f"Original Text Length: {len(text.split())} words")
            print(f"Summary Length: {len(summary.split())} words")
            print("\nGenerated Summary:")
            print(summary)
            
            # Compression stats
            compression_ratio = len(summary.split()) / len(text.split()) * 100
            print(f"\nCompression Ratio: {compression_ratio:.2f}%")
        
        except Exception as e:
            print(f"Error generating summary: {e}")
        
        # Continuation prompt
        continue_choice = input("\nDo you want to summarize another text? (yes/no): ").lower()
        if continue_choice not in ['yes', 'y']:
            print("Thank you for using the Summarization AI. Goodbye!")
            break

def cli_argument_summarization():
    """
    Command-line argument based summarization
    """
    parser = argparse.ArgumentParser(description="Document Summarization AI")
    parser.add_argument("text", nargs="?", help="Text to summarize")
    parser.add_argument("-min", type=int, default=30, help="Minimum summary length")
    parser.add_argument("-max", type=int, default=150, help="Maximum summary length")
    
    args = parser.parse_args()
    
    # Initialize summarizer
    summarizer = DocumentationSummarizer()
    
    # Interactive mode if no text provided
    if not args.text:
        interactive_summarization()
        return
    
    # Generate summary from command-line argument
    try:
        summary = summarizer.generate_summary(
            args.text, 
            min_length=args.min, 
            max_length=args.max
        )
        
        print("\n===== Summary =====")
        print(summary)
    except Exception as e:
        print(f"Error generating summary: {e}")

def main():
    # Choose between interactive and CLI modes
    if len(sys.argv) > 1:
        cli_argument_summarization()
    else:
        interactive_summarization()

if __name__ == "__main__":
    main()