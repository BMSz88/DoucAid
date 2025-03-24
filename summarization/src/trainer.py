# src/trainer.py

import os
import logging
import yaml
import torch
from torch.utils.data import Dataset, DataLoader
from transformers import T5ForConditionalGeneration, T5Tokenizer, AdamW, get_linear_schedule_with_warmup
import pandas as pd

class DocumentationDataset(Dataset):
    """
    Custom PyTorch Dataset for Documentation Summarization Training
    """
    def __init__(self, dataframe, tokenizer, max_input_length, max_output_length):
        """
        Initialize the dataset for model training
        
        Args:
            dataframe (pd.DataFrame): Training data
            tokenizer (T5Tokenizer): Tokenizer for text processing
            max_input_length (int): Maximum input sequence length
            max_output_length (int): Maximum output sequence length
        """
        self.dataframe = dataframe
        self.tokenizer = tokenizer
        self.max_input_length = max_input_length
        self.max_output_length = max_output_length

    def __len__(self):
        """
        Return total number of samples in the dataset
        
        Returns:
            int: Number of training samples
        """
        return len(self.dataframe)

    def __getitem__(self, idx):
        """
        Prepare individual training sample
        
        Args:
            idx (int): Index of the sample
        
        Returns:
            dict: Tokenized input and target data
        """
        row = self.dataframe.iloc[idx]
        
        # Prepare input text with summarization prefix
        input_text = f"summarize: {row['text']}"
        
        # Tokenize input
        input_encoding = self.tokenizer(
            input_text,
            max_length=self.max_input_length,
            padding='max_length',
            truncation=True,
            return_tensors='pt'
        )
        
        # Tokenize target summary
        target_encoding = self.tokenizer(
            row['summary'],
            max_length=self.max_output_length,
            padding='max_length',
            truncation=True,
            return_tensors='pt'
        )
        
        return {
            'input_ids': input_encoding['input_ids'].flatten(),
            'attention_mask': input_encoding['attention_mask'].flatten(),
            'labels': target_encoding['input_ids'].flatten()
        }

class ModelTrainer:
    """
    Trainer class for Documentation Summarization Model
    """
    def __init__(self, config_path='../config/config.yaml'):
        """
        Initialize trainer with configuration
        
        Args:
            config_path (str): Path to configuration file
        """
        # Setup logging
        logging.basicConfig(level=logging.INFO)
        self.logger = logging.getLogger(__name__)
        
        # Load configuration
        config_path = os.path.abspath(os.path.join(os.path.dirname(__file__), config_path))
        with open(config_path, 'r') as file:
            self.config = yaml.safe_load(file)
        
        # Device configuration
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        self.logger.info(f"Training on device: {self.device}")
        
        # Model and tokenizer initialization
        self.model_name = self.config['model']['name']
        self.tokenizer = T5Tokenizer.from_pretrained(self.model_name)
        self.model = T5ForConditionalGeneration.from_pretrained(self.model_name)
        self.model.to(self.device)
        
        # Training hyperparameters
        self.learning_rate = self.config['training']['learning_rate']
        self.batch_size = self.config['training']['batch_size']
        self.epochs = self.config['training']['epochs']
        
        # Model configuration
        self.max_input_length = self.config['model']['max_input_length']
        self.max_output_length = self.config['model']['max_output_length']

    def prepare_data(self, dataframe):
        """
        Prepare training dataset and dataloader
        
        Args:
            dataframe (pd.DataFrame): Training data
        
        Returns:
            DataLoader: Prepared data loader for training
        """
        dataset = DocumentationDataset(
            dataframe, 
            self.tokenizer, 
            self.max_input_length, 
            self.max_output_length
        )
        
        dataloader = DataLoader(
            dataset, 
            batch_size=self.batch_size, 
            shuffle=True
        )
        
        return dataloader

    def train(self, training_data):
        """
        Train the summarization model
        
        Args:
            training_data (pd.DataFrame): Training dataset
        
        Returns:
            dict: Training metrics and performance
        """
        # Prepare data loader
        train_dataloader = self.prepare_data(training_data)
        
        # Optimizer and learning rate scheduler
        optimizer = AdamW(
            self.model.parameters(), 
            lr=self.learning_rate
        )
        scheduler = get_linear_schedule_with_warmup(
            optimizer, 
            num_warmup_steps=0,
            num_training_steps=len(train_dataloader) * self.epochs
        )
        
        # Training loop
        total_loss = 0
        self.model.train()
        
        for epoch in range(self.epochs):
            epoch_loss = 0.0
            
            for batch in train_dataloader:
                # Move batch to device
                input_ids = batch['input_ids'].to(self.device)
                attention_mask = batch['attention_mask'].to(self.device)
                labels = batch['labels'].to(self.device)
                
                # Zero gradients
                optimizer.zero_grad()
                
                # Forward pass
                outputs = self.model(
                    input_ids=input_ids,
                    attention_mask=attention_mask,
                    labels=labels
                )
                
                loss = outputs.loss
                total_loss += loss.item()
                epoch_loss += loss.item()
                
                # Backward pass and optimization
                loss.backward()
                optimizer.step()
                scheduler.step()
            
            # Log epoch results
            avg_epoch_loss = epoch_loss / len(train_dataloader)
            self.logger.info(f"Epoch {epoch+1}/{self.epochs}, Loss: {avg_epoch_loss:.4f}")
        
        return {
            "total_loss": total_loss,
            "average_loss": total_loss / (len(train_dataloader) * self.epochs),
            "epochs": self.epochs
        }

def main():
    """
    Main training execution
    """
    from data_processor import DocumentationDataProcessor
    
    # Initialize data processor
    data_processor = DocumentationDataProcessor()
    
    # Prepare training data
    training_data = data_processor.prepare_training_data()
    
    # Initialize trainer
    trainer = ModelTrainer()
    
    # Train model
    training_metrics = trainer.train(training_data)
    
    # Display training results
    print("Training Completed")
    print("Training Metrics:", training_metrics)

if __name__ == "__main__":
    main()