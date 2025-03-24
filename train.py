import json
import torch
import torch.optim as optim
import torch.nn as nn
import numpy as np
import os
from torch.utils.data import Dataset, DataLoader
from utils.nltk_utlis import tokenize, stem, bag_of_words
from model.model import ChatbotModel

# Load intents data
with open("intents.json", "r", encoding="utf-8") as file:
    intents = json.load(file)

# Prepare training data
all_words = []
tags = []
xy = []

for intent in intents["intents"]:
    tag = intent["tag"]
    tags.append(tag)
    for pattern in intent["patterns"]:
        tokenized_sentence = tokenize(pattern)
        all_words.extend(tokenized_sentence)
        xy.append((tokenized_sentence, tag))

ignore_words = ['?', '!', '.', ',']
all_words = sorted(set(stem(w) for w in all_words if w not in ignore_words))
tags = sorted(set(tags))

X_train = []
y_train = []

for (pattern_sentence, tag) in xy:
    bag = bag_of_words(pattern_sentence, all_words)
    X_train.append(bag)
    y_train.append(tags.index(tag))

X_train = np.array(X_train)
y_train = np.array(y_train)

# Hyperparameters
input_size = len(X_train[0])
hidden_size = 8
output_size = len(tags)
learning_rate = 0.01
num_epochs = 1000

# Model
model = ChatbotModel(input_size, hidden_size, output_size)
criterion = nn.CrossEntropyLoss()
optimizer = optim.Adam(model.parameters(), lr=learning_rate)

for epoch in range(num_epochs):
    outputs = model(torch.tensor(X_train, dtype=torch.float32))
    loss = criterion(outputs, torch.tensor(y_train, dtype=torch.long))

    optimizer.zero_grad()
    loss.backward()
    optimizer.step()

    if (epoch + 1) % 100 == 0:
        print(f'Epoch [{epoch + 1}/{num_epochs}], Loss: {loss.item():.4f}')

# Save model
os.makedirs("data", exist_ok=True)
data = {
    "model_state": model.state_dict(),
    "input_size": input_size,
    "hidden_size": hidden_size,
    "output_size": output_size,
    "all_words": all_words,
    "tags": tags
}
torch.save(data, "data/data.pth")
torch.save(model.state_dict(), "data/chatbot_model.pth")
print("Training complete. Model saved.")
