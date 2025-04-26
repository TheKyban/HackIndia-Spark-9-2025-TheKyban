# Medical AI API

This API provides medical image analysis and symptom analysis capabilities using machine learning models.

## Setup and Installation

1. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

2. Initialize the symptom analyzer with ClinicalBERT:
   ```
   cd src
   python initialize_symptoms_model.py
   ```
   Note: This doesn't actually train the model as ClinicalBERT is already pretrained. It just initializes and tests the model.

3. Run the API server:
   ```
   python main.py
   ```

By default, the server runs on port 5001. You can change this by setting the `PORT` environment variable.

## API Endpoints

### 1. Medical Image Analysis

Endpoint: `/api/predict`
Method: `POST`
Content-Type: `multipart/form-data`

Parameters:
- `image`: Image file to analyze

Example request using curl:
```
curl -X POST -F "image=@chest_xray.jpg" http://localhost:5001/api/predict
```

Example response:
```json
{
  "diagnosis": "Pneumonia",
  "confidence": 85.7,
  "all_probabilities": {
    "Pneumonia": 85.7,
    "Normal": 10.2,
    "COVID-19": 2.1,
    "Tuberculosis": 1.5,
    "Lung Cancer": 0.5
  }
}
```

### 2. Symptom Analysis with ClinicalBERT

Endpoint: `/api/symptoms`
Method: `POST`
Content-Type: `application/json`

Parameters:
- `symptoms`: Text description of symptoms

Example request using curl:
```
curl -X POST -H "Content-Type: application/json" -d '{"symptoms":"I have a headache, sensitivity to light, and nausea"}' http://localhost:5001/api/symptoms
```

Example response:
```json
{
  "diagnosis": "Migraine",
  "confidence": 82.3,
  "recommendation": "Rest in a quiet, dark room. Take prescribed medication at onset of symptoms.",
  "model_used": "ClinicalBERT zero-shot classification",
  "differential_diagnosis": {
    "Gastrointestinal issue": 45.6,
    "Respiratory infection": 10.2,
    "Common cold": 8.5
  }
}
```

## About ClinicalBERT

This API uses ClinicalBERT (Bio_ClinicalBERT), a BERT model further pretrained on clinical notes from the MIMIC-III database. As a pretrained model, it doesn't require additional training for basic use.

ClinicalBERT is particularly effective for clinical text mining tasks such as:

- Clinical named entity recognition
- Clinical relation extraction
- Medical question answering
- Clinical text inference
- Medical concept extraction

For symptom analysis, we use a combination of:
1. A zero-shot classification pipeline based on pretrained NLP models
2. Fallback keyword matching for robustness

## Current Supported Conditions

The symptom analyzer can identify the following conditions:
- Respiratory infections
- Migraines and headaches
- Gastrointestinal issues
- Allergic reactions
- Common cold

## Notes

- This is a prototype system and should not be used for actual medical diagnosis.
- Always consult a medical professional for healthcare decisions.
- While pretrained models enhance the accuracy of symptom analysis, they are still subject to limitations and should be considered an assistive tool only. 