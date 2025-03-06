from transformers import T5ForConditionalGeneration, T5Tokenizer

# Load the pre-trained model and tokenizer
model = T5ForConditionalGeneration.from_pretrained("t5-small")
tokenizer = T5Tokenizer.from_pretrained("t5-small")

print("Model and tokenizer loaded successfully.")

# Save the model and tokenizer
model.save_pretrained("model/t5-small")
tokenizer.save_pretrained("model/t5-small")
