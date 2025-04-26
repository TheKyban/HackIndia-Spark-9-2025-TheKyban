# Medical Diagnosis ML Service

This is the ML backend service for the MediBox application. It provides symptom analysis and medical image classification using machine learning models.

## Setup Instructions

1. Create a virtual environment (optional but recommended):
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Start the ML service:
   ```bash
   cd src
   python main.py
   ```

The service will start on port 5001 by default. You can access it at http://localhost:5001.

## API Endpoints

### Medical Image Analysis
- **Endpoint**: `/api/predict`
- **Method**: POST
- **Body**: Form data with `image` file

### Symptom Analysis
- **Endpoint**: `/api/symptoms`
- **Method**: POST
- **Body**: JSON with `symptoms` field

### Diagnosis Management
- **Endpoint**: `/api/diagnoses`
- **Method**: GET
- Returns all diagnoses

- **Endpoint**: `/api/diagnoses/:id`
- **Method**: GET
- Returns a single diagnosis by ID

- **Endpoint**: `/api/diagnoses`
- **Method**: POST
- **Body**: JSON with diagnosis data
- Creates a new diagnosis

## Models

The service uses:
- **ClinicalBERT** for symptom analysis
- A CNN-based model for medical image classification

Note: In demo mode, the service will provide realistic but mock responses if models aren't fully set up. 