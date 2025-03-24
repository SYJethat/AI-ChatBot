from flask import Flask, request, jsonify,render_template
from flask_cors import CORS
import json
import os
import torch
import random
from deep_translator import GoogleTranslator
from utils.nltk_utlis import tokenize, bag_of_words
from model.model import ChatbotModel

app = Flask(__name__)
CORS(app)

# Load model and data
data = torch.load("data/data.pth")
model = ChatbotModel(data["input_size"], data["hidden_size"], data["output_size"])
model.load_state_dict(torch.load("data/chatbot_model.pth"))
model.eval()

all_words = data["all_words"]
tags = data["tags"]

# Load intents
with open("intents.json", "r", encoding="utf-8") as file:
    intents = json.load(file)

# Load chat memory
chat_memory = {}
CHAT_MEMORY_FILE = "chat_memory.json"

if os.path.exists(CHAT_MEMORY_FILE):
    with open(CHAT_MEMORY_FILE, "r", encoding="utf-8") as file:
        chat_memory = json.load(file)

def save_chat_memory():
    with open(CHAT_MEMORY_FILE, "w", encoding="utf-8") as file:
        json.dump(chat_memory, file, ensure_ascii=False, indent=4)

def get_response(user_input, lang):
    translated_input = GoogleTranslator(source=lang, target="en").translate(user_input)
    tokenized_input = tokenize(translated_input)
    bag = bag_of_words(tokenized_input, all_words)
    bag = torch.tensor(bag, dtype=torch.float32).unsqueeze(0)

    with torch.no_grad():
        output = model(bag)
        tag = tags[torch.argmax(output).item()]

    for intent in intents["intents"]:
        if intent["tag"] == tag:
            response = random.choice(intent["responses"])
            return GoogleTranslator(source="en", target=lang).translate(response)

    return GoogleTranslator(source="en", target=lang).translate("Sorry, I don't understand.")


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/chat", methods=["POST"])
def chat():
    data = request.json
    message = data.get("message", "").strip()
    lang = data.get("lang", "en")

    if not message:
        return jsonify({"response": "Please enter a message."})

    if message in chat_memory:
        response = chat_memory[message]
    else:
        response = get_response(message, lang)
        chat_memory[message] = response
        save_chat_memory()

    return jsonify({"response": response})






if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=True)
