from transformers import T5Tokenizer
from datasets import load_dataset

# Load the tokenizer
tokenizer = T5Tokenizer.from_pretrained("t5-small")

# Load the dataset
dataset = load_dataset("cnn_dailymail", "3.0.0", split="train[:1%]")

# Preprocessing function
def preprocess_function(examples):
    inputs = [doc for doc in examples["article"]]
    model_inputs = tokenizer(inputs, max_length=512, truncation=True)
    
    # Target summaries (labels)
    with tokenizer.as_target_tokenizer():
        labels = tokenizer(examples["highlights"], max_length=150, truncation=True)
    
    model_inputs["labels"] = labels["input_ids"]
    return model_inputs

# Tokenize the dataset
tokenized_dataset = dataset.map(preprocess_function, batched=True)

# Save tokenized data to disk
tokenized_dataset.save_to_disk("data/tokenized_dataset")
