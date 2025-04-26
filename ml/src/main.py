from flask import Flask, request, jsonify
import numpy as np
import tensorflow as tf
from models.model import MedicalImageClassifier
from models.symptoms_model import SymptomAnalyzer
import os
import json
from PIL import Image
import io
from flask_cors import CORS
import uuid
from datetime import datetime

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Model paths
CLINICAL_CONFIG_PATH = os.path.join("models", "clinical_symptoms_analyzer.pkl")

# Load the models
image_model = None
symptoms_model = SymptomAnalyzer(
    model_path=CLINICAL_CONFIG_PATH if os.path.exists(CLINICAL_CONFIG_PATH) else None
)

# Define class labels
CLASS_LABELS = [
    "Pneumonia",
    "Normal",
    "COVID-19",
    "Tuberculosis",
    "Lung Cancer"
]

# In-memory storage for diagnoses (in a real app, use a database)
diagnoses = {}

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
        if image_model is None:
            # Mock prediction for demonstration
            confidence_scores = np.random.random(len(CLASS_LABELS))
            confidence_scores = confidence_scores / np.sum(confidence_scores)
            prediction_idx = np.argmax(confidence_scores)
        else:
            # Real prediction
            predictions = image_model.predict(img_array)
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
    
    try:
        # Use the pretrained model to analyze symptoms
        result = symptoms_model.analyze(symptoms)
        
        # Add general recommendation if not present
        if "recommendation" not in result:
            result["recommendation"] = "Please consult with a doctor for a professional diagnosis."
        
        # Include model information in the response
        if "model_used" not in result:
            result["model_used"] = "ClinicalBERT" if hasattr(symptoms_model, "classifier") and symptoms_model.classifier else "keyword matching"
        
        return jsonify(result)
    except Exception as e:
        return jsonify({
            "error": f"Error analyzing symptoms: {str(e)}",
            "diagnosis": "Error in analysis",
            "confidence": 0,
            "recommendation": "Please consult with a doctor for a professional diagnosis."
        }), 500

@app.route("/api/diagnoses", methods=["POST"])
def create_diagnosis():
    try:
        # Parse request data
        data = request.json
        if not data or "type" not in data or "data" not in data:
            return jsonify({"error": "Invalid request format"}), 400
        
        diagnosis_type = data["type"]
        diagnosis_data = data["data"]
        
        # Generate unique ID
        diagnosis_id = str(uuid.uuid4())
        
        # Create diagnosis object
        diagnosis = {
            "id": diagnosis_id,
            "diagnosisDate": datetime.now().strftime("%Y-%m-%d"),
            "type": "Symptom Analysis" if diagnosis_type == "symptoms" else "Image Analysis",
            "status": "pending",
            "doctorName": "Awaiting doctor review",
            "doctorFeedback": "",
            "aiModelData": {
                "modelVersion": "ClinicalBERT-1.0" if diagnosis_type == "symptoms" else "MedicalVision-1.0",
                "analysisTimestamp": datetime.now().isoformat(),
                "processingTime": "2.3 seconds",
                "featuresAnalyzed": "Clinical language patterns" if diagnosis_type == "symptoms" else "Anatomical features"
            }
        }
        
        # Add type-specific fields
        if diagnosis_type == "symptoms":
            ml_analysis = diagnosis_data.get("mlAnalysis", {})
            diagnosis.update({
                "aiDiagnosis": ml_analysis.get("diagnosis", "Unknown"),
                "confidence": ml_analysis.get("confidence", 0),
                "symptoms": diagnosis_data.get("description", ""),
                "treatmentRecommendations": [ml_analysis.get("recommendation", "Consult with a doctor")],
                "riskFactors": ["To be determined by doctor review"],
                "aiResponse": {
                    "fullText": f"Based on your symptoms of {diagnosis_data.get('description', '')}, the analysis indicates possible {ml_analysis.get('diagnosis', 'condition')}.",
                    "sections": {
                        "primary": ml_analysis.get("diagnosis", "Unknown"),
                        "confidence": f"{ml_analysis.get('confidence', 0)}%",
                        "recommendation": ml_analysis.get("recommendation", "Consult with a doctor")
                    }
                }
            })
            
            # Add differential diagnosis if available
            differential = ml_analysis.get("differentialDiagnosis")
            if differential:
                diagnosis["aiResponse"]["sections"]["differentialDiagnosis"] = json.dumps(differential)
        
        elif diagnosis_type == "image":
            ml_analysis = diagnosis_data.get("mlAnalysis", {})
            diagnosis.update({
                "aiDiagnosis": ml_analysis.get("diagnosis", "Unknown"),
                "confidence": ml_analysis.get("confidence", 0),
                "imageSrc": "/sample-image.jpg",  # In a real app, save the image
                "treatmentRecommendations": ["Consult with a doctor for detailed treatment plan"],
                "riskFactors": ["To be determined by doctor review"],
                "aiResponse": {
                    "fullText": f"Analysis of {diagnosis_data.get('imageType', 'medical image')} shows findings consistent with {ml_analysis.get('diagnosis', 'condition')}.",
                    "sections": {
                        "primary": ml_analysis.get("diagnosis", "Unknown"),
                        "confidence": f"{ml_analysis.get('confidence', 0)}%",
                        "probabilities": json.dumps(ml_analysis.get("allProbabilities", {}))
                    }
                }
            })
        
        # Store diagnosis
        diagnoses[diagnosis_id] = diagnosis
        
        return jsonify({
            "success": True,
            "diagnosisId": diagnosis_id
        })
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/diagnoses", methods=["GET"])
def get_all_diagnoses():
    try:
        # Convert diagnoses dictionary to list
        diagnoses_list = list(diagnoses.values())
        
        # Sort by date (newest first)
        diagnoses_list.sort(key=lambda x: x["diagnosisDate"], reverse=True)
        
        return jsonify({
            "diagnoses": diagnoses_list,
            "total": len(diagnoses_list)
        })
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/diagnoses/<diagnosis_id>", methods=["GET"])
def get_diagnosis(diagnosis_id):
    try:
        if diagnosis_id not in diagnoses:
            return jsonify({"error": "Diagnosis not found"}), 404
        
        return jsonify(diagnoses[diagnosis_id])
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    # For production, use a proper WSGI server like gunicorn
    port = int(os.environ.get("PORT", 5001))
    app.run(host="0.0.0.0", port=port, debug=True)