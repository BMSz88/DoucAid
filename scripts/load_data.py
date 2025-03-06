from datasets import load_dataset

# Load the CNN/DailyMail dataset
dataset = load_dataset("cnn_dailymail", "3.0.0")

# Print a sample from the training set
print("Sample article:", dataset["train"][0]["article"])
print("Sample summary:", dataset["train"][0]["highlights"])
