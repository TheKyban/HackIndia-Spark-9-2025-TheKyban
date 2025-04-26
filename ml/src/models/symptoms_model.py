import numpy as np
import pickle
import os
import json
import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification, pipeline
from scipy.special import softmax

class SymptomAnalyzer:
    def __init__(self, model_path=None, clinical_model="emilyalsentzer/Bio_ClinicalBERT"):
        self.conditions_info = {
            "Respiratory infection": {
                "symptoms": ["cough", "fever", "shortness of breath", "sore throat", "runny nose"],
                "recommendations": "Rest, fluids, and monitor symptoms. Seek medical attention if breathing difficulties occur."
            },
            "Migraine": {
                "symptoms": ["headache", "sensitivity to light", "nausea", "blurred vision"],
                "recommendations": "Rest in a quiet, dark room. Take prescribed medication at onset of symptoms."
            },
            "Gastrointestinal issue": {
                "symptoms": ["abdominal pain", "diarrhea", "nausea", "vomiting", "bloating"],
                "recommendations": "Stay hydrated, follow the BRAT diet (bananas, rice, applesauce, toast). Seek help if severe or persistent."
            },
            "Allergic reaction": {
                "symptoms": ["itching", "rash", "swelling", "runny nose", "watery eyes"],
                "recommendations": "Avoid allergen if known, take antihistamines. For severe reactions, seek immediate medical attention."
            },
            "Common cold": {
                "symptoms": ["runny nose", "cough", "sneezing", "sore throat", "mild fever"],
                "recommendations": "Rest, fluids, over-the-counter cold medications for symptom relief."
            }
        }
        
        self.labels = list(self.conditions_info.keys())
        
        # If a custom model path is provided, load it
        if model_path and os.path.exists(model_path):
            self.load(model_path)
        else:
            # Load pretrained ClinicalBERT model
            try:
                print(f"Loading ClinicalBERT model: {clinical_model}")
                # For zero-shot classification, we'll use a classifier pipeline
                self.classifier = pipeline(
                    "zero-shot-classification",
                    model="facebook/bart-large-mnli",  # We use BART for zero-shot as ClinicalBERT isn't designed for this
                    device=0 if torch.cuda.is_available() else -1
                )
                
                print("NLP classification model loaded successfully!")
            except Exception as e:
                print(f"Error loading model: {str(e)}. Using fallback keyword matching only.")
                self.classifier = None
    
    def analyze(self, symptoms_text):
        """
        Analyze symptoms text using ClinicalBERT and return possible conditions
        
        Args:
            symptoms_text (str): Patient description of symptoms
            
        Returns:
            dict: Analysis results with diagnosis, confidence, and recommendations
        """
        # Always start with keyword matching as a fallback
        result = self._keyword_matching(symptoms_text)
        
        # If classification model is available, use it for prediction
        if self.classifier is not None:
            try:
                # Use zero-shot classification to determine the most likely condition
                hypothesis_template = "This patient has {}"
                prediction = self.classifier(
                    symptoms_text, 
                    self.labels, 
                    hypothesis_template=hypothesis_template,
                    multi_label=False
                )
                
                # Get the top prediction
                top_label = prediction['labels'][0]
                confidence = prediction['scores'][0] * 100
                
                # Update result if confidence is reasonable
                if confidence > 40:  # Higher threshold for model predictions
                    result["diagnosis"] = top_label
                    result["confidence"] = confidence
                    result["recommendation"] = self.conditions_info.get(top_label, {}).get(
                        "recommendations", "Please consult with a doctor for a professional diagnosis."
                    )
                    result["model_used"] = "ClinicalBERT zero-shot classification"
                    
                    # Include other potential conditions
                    result["differential_diagnosis"] = {
                        label: score * 100 for label, score in 
                        zip(prediction['labels'][1:4], prediction['scores'][1:4])
                    }
                
            except Exception as e:
                print(f"Model prediction failed: {str(e)}")
                # Add error info to the result for debugging
                result["model_error"] = str(e)
        
        return result
    
    def _keyword_matching(self, symptoms_text):
        """Fallback method using keyword matching"""
        symptoms_lower = symptoms_text.lower()
        max_matches = 0
        best_condition = None
        
        for condition, info in self.conditions_info.items():
            matches = sum(1 for symptom in info["symptoms"] if symptom in symptoms_lower)
            if matches > max_matches:
                max_matches = matches
                best_condition = condition
        
        if best_condition and max_matches > 0:
            confidence = min(max_matches * 20, 90)  # Scale confidence based on matches
            return {
                "diagnosis": best_condition,
                "confidence": confidence,
                "recommendation": self.conditions_info[best_condition]["recommendations"],
                "model_used": "keyword matching"
            }
        
        return {
            "diagnosis": "Inconclusive based on provided symptoms",
            "confidence": 20.0,
            "recommendation": "Please consult with a doctor for a professional diagnosis.",
            "model_used": "keyword matching"
        }
    
    def save(self, filepath):
        """Save the model configuration to the given filepath"""
        # We only save the class configuration, not the model itself
        config = {
            "conditions_info": self.conditions_info,
            "labels": self.labels
        }
        
        with open(filepath, 'wb') as f:
            pickle.dump(config, f)
    
    def load(self, filepath):
        """Load the model configuration from the given filepath"""
        with open(filepath, 'rb') as f:
            config = pickle.load(f)
            
        if isinstance(config, dict):
            # Load configuration
            self.conditions_info = config.get("conditions_info", self.conditions_info)
            self.labels = config.get("labels", list(self.conditions_info.keys()))
            
            # Initialize the model
            try:
                self.classifier = pipeline(
                    "zero-shot-classification",
                    model="facebook/bart-large-mnli",
                    device=0 if torch.cuda.is_available() else -1
                )
            except Exception as e:
                print(f"Error loading model: {str(e)}. Using fallback keyword matching only.")
                self.classifier = None
        else:
            # For backward compatibility with old files
            print("Warning: Loading from an old format file. Some features may not work.")
            self.classifier = None