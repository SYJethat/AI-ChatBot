from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import json
import os
import torch
import random
from deep_translator import GoogleTranslator
from utils.nltk_utlis import tokenize, bag_of_words
from model.model import ChatbotModel
from datetime import datetime

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
FAQ_FILE = "faq.txt"
SUBMIT_FILE = "submit.txt"

if os.path.exists(CHAT_MEMORY_FILE):
    with open(CHAT_MEMORY_FILE, "r", encoding="utf-8") as file:
        chat_memory = json.load(file)

# Load FAQ data from JSON file
FAQ_JSON_FILE = "faq.json"
if os.path.exists(FAQ_JSON_FILE):
    with open(FAQ_JSON_FILE, "r", encoding="utf-8") as file:
        faq_data = json.load(file)
else:
    faq_data = {}  # Default to empty dict if file doesn't exist
    print(f"Warning: {FAQ_JSON_FILE} not found. FAQ data will be empty.")

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
        probabilities = torch.softmax(output, dim=1)
        max_prob = torch.max(probabilities).item()
        tag_index = torch.argmax(output).item()
        tag = tags[tag_index]

    # Ensure 75% confidence threshold
    if max_prob < 0.00001:
        return GoogleTranslator(source="en", target=lang).translate("Sorry, I’m not confident enough to answer that. Please try rephrasing.")

    for intent in intents["intents"]:
        if intent["tag"] == tag:
            response = random.choice(intent["responses"])
            return GoogleTranslator(source="en", target=lang).translate(response)

    return GoogleTranslator(source="en", target=lang).translate("Sorry, I don't understand.")

@app.route("/")
def index():
    return render_template("index1.html")
#
# @app.route("/chat", methods=["GET"])
# def chat_mode():
#     time = request.args.get("time")
#     message = request.args.get("message")
#     return render_template("chat.html", time=time, message=message)
#
# @app.route("/faq", methods=["GET"])
# def faq_mode():
#     time = request.args.get("time")
#     message = request.args.get("message")
#     return render_template("faq.html", time=time, message=message)
#
# @app.route("/form", methods=["GET"])
# def form_mode():
#     time = request.args.get("time")
#     message = request.args.get("message")
#     return render_template("form.html", time=time, message=message)

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

@app.route("/faq-data", methods=["GET"])
def get_faq_data():
    return jsonify(faq_data)

@app.route("/faq", methods=["POST"])
def faq():
    data = request.json
    question_id = data.get("question_id", "").strip()
    lang = data.get("lang", "en")

    if not question_id or question_id not in faq_data:
        return jsonify({"response": "Invalid or missing question ID."})

    question = faq_data[question_id]["question"].get(lang, faq_data[question_id]["question"]["en"])
    response = faq_data[question_id]["answer"].get(lang, faq_data[question_id]["answer"]["en"])

    # Log FAQ request to faq.txt
    timestamp = datetime.now().strftime("%Y-%m+%d %H:%M:%S")
    log_entry = f"[{timestamp}] Language: {lang}, Question ID: {question_id}, Question: {question}, Answer: {response}\n"
    with open(FAQ_FILE, "a", encoding="utf-8") as file:
        file.write(log_entry)

    return jsonify({"response": response})





# Session storage for form data
form_sessions = {}  # Key: session_id, Value: dict of form data and current step

# Form fields in order
FORM_FIELDS = [
    "fname", "lname", "rolln", "email", "dob", "branch", "experience", "file"
]

# Prompts for each field
FIELD_PROMPTS = {
    "fname": "First Name.",
    "lname": "Last Name.",
    "rolln": "Roll no.",
    "email": "Email",
    "dob": "Date of Birth (e.g., YYYY-MM-DD).",
    "branch": "Branch (e.g., CSE, ECE, ME, etc.).",
    "experience": "Experience in years (e.g., 2).",
    "file": "Please upload a file (e.g., resume). Provide the file content as base64 string or skip by saying 'none'."
}

@app.route("/submit-form", methods=["POST"])
def submit_form():
    data = request.json
    session_id = data.get("session_id", None)  # Unique identifier for the user's session
    user_input = data.get("input", "").strip()
    lang = data.get("lang", "en")

    # If no session_id, start a new session
    if not session_id or session_id not in form_sessions:
        session_id = str(random.randint(10000, 99999))  # Generate a simple session ID
        form_sessions[session_id] = {
            "step": 0,  # Current field index
            "data": {}  # Store user responses
        }
        next_prompt = FIELD_PROMPTS[FORM_FIELDS[0]]
        return jsonify({
            "session_id": session_id,
            "message": GoogleTranslator(source="en", target=lang).translate(next_prompt)
        })

    # Get current session
    session = form_sessions[session_id]
    current_step = session["step"]
    current_field = FORM_FIELDS[current_step]

    # If user provided input, store it
    if user_input:
        if current_field == "file" and user_input.lower() == "none":
            session["data"][current_field] = "No file attached"
        else:
            session["data"][current_field] = user_input

        # Move to the next step
        session["step"] += 1

    # Check if all fields are collected
    if session["step"] >= len(FORM_FIELDS):
        # All data collected, show summary for confirmation
        summary = "Here is your submitted data:\n"
        for field, value in session["data"].items():
            summary += f"{field.capitalize()}: {value}\n"
        summary += "Please confirm by saying 'yes' to submit or 'no' to cancel."

        return jsonify({
            "session_id": session_id,
            "message": GoogleTranslator(source="en", target=lang).translate(summary)
        })

    # Check for confirmation response
    if "data" in session and current_step == len(FORM_FIELDS):
        if user_input.lower() == "yes":
            # Log the submission
            timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            log_entry = f"[{timestamp}] Language: {lang}, Data: {json.dumps(session['data'])}\n"
            with open(SUBMIT_FILE, "a", encoding="utf-8") as file:
                file.write(log_entry)

            # Clear the session
            del form_sessions[session_id]

            return jsonify({
                "message": GoogleTranslator(source="en", target=lang).translate(
                    "Thank you! Your form has been submitted successfully."
                )
            })
        elif user_input.lower() == "no":
            # Cancel the submission
            del form_sessions[session_id]
            return jsonify({
                "message": GoogleTranslator(source="en", target=lang).translate(
                    "Submission canceled."
                )
            })
        else:
            return jsonify({
                "session_id": session_id,
                "message": GoogleTranslator(source="en", target=lang).translate(
                    "Please say 'yes' to submit or 'no' to cancel."
                )
            })

    # Ask for the next field
    next_field = FORM_FIELDS[session["step"]]
    next_prompt = FIELD_PROMPTS[next_field]
    return jsonify({
        "session_id": session_id,
        "message": GoogleTranslator(source="en", target=lang).translate(next_prompt)
    })
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5002, debug=True)