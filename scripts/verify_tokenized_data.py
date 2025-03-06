from datasets import load_from_disk

# Path to the tokenized dataset
tokenized_dataset_path = "data/tokenized_dataset"

# Load the tokenized dataset
try:
    tokenized_dataset = load_from_disk(tokenized_dataset_path)
    print(f"Successfully loaded the tokenized dataset from {tokenized_dataset_path}.")
except Exception as e:
    print(f"Failed to load the tokenized dataset. Error: {e}")
    exit()

# Check the structure of the dataset
print("\nDataset structure:")
print(tokenized_dataset)

# Inspect the first sample in the dataset
sample = tokenized_dataset[0]  # Access the first sample directly, as there's no split

# Print the sample to verify its structure
print("\nSample from tokenized dataset:")
print(sample)

# Display the keys (columns) in the dataset
print("\nKeys in the tokenized dataset:")
print(tokenized_dataset.column_names)
