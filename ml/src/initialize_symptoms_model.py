import os
import sys
from models.symptoms_model import SymptomAnalyzer

def main():
    """Initialize and test the ClinicalBERT symptom analyzer model"""
    print("Initializing ClinicalBERT-based symptom analyzer...")
    
    # Make sure the models directory exists
    os.makedirs("models", exist_ok=True)
    
    # Initialize the ClinicalBERT model - no training needed as it's pretrained
    model = SymptomAnalyzer(clinical_model="emilyalsentzer/Bio_ClinicalBERT")
    
    # Save the model configuration
    model_path = os.path.join("models", "clinical_symptoms_analyzer.pkl")
    model.save(model_path)
    print(f"Model configuration saved to {model_path}")
    
    # Test the model
    test_symptoms = [
        "I have a headache and sensitivity to light",
        "I'm experiencing cough, fever, and sore throat",
        "I have abdominal pain and nausea",
        "I have a rash and itchy skin",
        "I feel tired and have a mild fever"
    ]
    
    print("\nTesting the ClinicalBERT model with sample symptoms:")
    for symptom in test_symptoms:
        result = model.analyze(symptom)
        print(f"\nSymptoms: {symptom}")
        print(f"Diagnosis: {result['diagnosis']}")
        print(f"Confidence: {result['confidence']:.1f}%")
        print(f"Recommendation: {result['recommendation']}")
        print(f"Model used: {result.get('model_used', 'unknown')}")
        
        # Print differential diagnosis if available
        if 'differential_diagnosis' in result:
            print("Differential diagnosis:")
            for condition, confidence in result['differential_diagnosis'].items():
                print(f"  - {condition}: {confidence:.1f}%")

if __name__ == "__main__":
    main() 