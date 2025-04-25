from flask import Flask, request, jsonify
import numpy as np
import tensorflow as tf
from models.model import MedicalImageClassifier
import os
import json
from PIL import Image
import io

app = Flask(__name__)

# Load the model - in production, you would load a pre-trained model
model = None

# Define class labels
CLASS_LABELS = [
    "Pneumonia",
    "Normal",
    "COVID-19",
    "Tuberculosis",
    "Lung Cancer"
]

@app.route("/")
def index():
    return jsonify({"message": "Welcome to the Medical Image Analysis API"})

@app.route("/api/predict", methods=["POST"])
def predict():
    # Check if image was provided
    if "image" not in request.files:
        return jsonify({"error": "No image file provided"}), 400
    
    try:
        # Read image
        file = request.files["image"]
        img = Image.open(io.BytesIO(file.read())).convert("RGB")
        
        # Preprocess the image
        img = img.resize((224, 224))
        img_array = np.array(img) / 255.0
        img_array = np.expand_dims(img_array, axis=0)
        
        # Make prediction
        if model is None:
            # Mock prediction for demonstration
            confidence_scores = np.random.random(len(CLASS_LABELS))
            confidence_scores = confidence_scores / np.sum(confidence_scores)
            prediction_idx = np.argmax(confidence_scores)
        else:
            # Real prediction
            predictions = model.predict(img_array)
            prediction_idx = np.argmax(predictions[0])
            confidence_scores = predictions[0]
        
        # Return result
        result = {
            "diagnosis": CLASS_LABELS[prediction_idx],
            "confidence": float(confidence_scores[prediction_idx] * 100),
            "all_probabilities": {
                label: float(confidence_scores[i] * 100) 
                for i, label in enumerate(CLASS_LABELS)
            }
        }
        
        return jsonify(result)
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/symptoms", methods=["POST"])
def analyze_symptoms():
    # Get symptoms from request
    data = request.json
    if not data or "symptoms" not in data:
        return jsonify({"error": "No symptoms provided"}), 400
    
    symptoms = data["symptoms"]
    
    # In a real application, you would pass this to an NLP model
    # For now, just return a mock response based on keyword matching
    
    if "cough" in symptoms.lower() and "fever" in symptoms.lower():
        diagnosis = "Possible respiratory infection"
        confidence = 75.5
    elif "headache" in symptoms.lower():
        diagnosis = "Possible migraine or tension headache"
        confidence = 68.2
    else:
        diagnosis = "Inconclusive based on provided symptoms"
        confidence = 45.0
    
    return jsonify({
        "diagnosis": diagnosis,
        "confidence": confidence,
        "recommendation": "Please consult with a doctor for a professional diagnosis."
    })

if __name__ == "__main__":
    # For production, use a proper WSGI server like gunicorn
    port = int(os.environ.get("PORT", 5001))
    app.run(host="0.0.0.0", port=port, debug=True) 